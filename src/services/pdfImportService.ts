import { GoogleGenAI, Type } from '@google/genai';
import { Course, CourseType } from '../types/course';
import { DEFAULT_TIME_SLOTS } from '../types/timeSlots';

interface ParsedScheduleData {
    name: string;
    courses: Array<{
        title: string;
        type: string;
        startTime: string;
        endTime: string;
        location: string;
        dayOfWeek: number;
        professor?: string;
    }>;
}

interface ParsedScheduleTemplate {
    name: string;
    courses: Omit<Course, 'id'>[];
}

const VALID_COURSE_TYPES: CourseType[] = ['lecture', 'lab', 'seminar', 'exam', 'practice'];

/**
 * Converts time string to minutes since midnight
 */
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Normalizes course time to the nearest available time slot
 */
const normalizeToTimeSlot = (startTime: string, _endTime: string): { startTime: string; endTime: string } => {
    const startMinutes = timeToMinutes(startTime);

    // Find the closest time slot
    let closestSlot = DEFAULT_TIME_SLOTS[0];
    let minDifference = Math.abs(timeToMinutes(closestSlot.startTime) - startMinutes);

    for (const slot of DEFAULT_TIME_SLOTS) {
        const difference = Math.abs(timeToMinutes(slot.startTime) - startMinutes);
        if (difference < minDifference) {
            minDifference = difference;
            closestSlot = slot;
        }
    }

    return {
        startTime: closestSlot.startTime,
        endTime: closestSlot.endTime
    };
};

// JSON Schema for structured output
const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "Schedule name from PDF"
        },
        courses: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "Course name"
                    },
                    type: {
                        type: Type.STRING,
                        description: "Course type: lecture, lab, seminar, exam, or practice"
                    },
                    startTime: {
                        type: Type.STRING,
                        description: "Start time in HH:MM format (24-hour)"
                    },
                    endTime: {
                        type: Type.STRING,
                        description: "End time in HH:MM format (24-hour)"
                    },
                    location: {
                        type: Type.STRING,
                        description: "Room or building location"
                    },
                    dayOfWeek: {
                        type: Type.NUMBER,
                        description: "Day of week: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday"
                    },
                    professor: {
                        type: Type.STRING,
                        description: "Professor name (can be empty)"
                    }
                },
                required: ['title', 'type', 'startTime', 'endTime', 'location', 'dayOfWeek'],
                propertyOrdering: ['title', 'type', 'startTime', 'endTime', 'location', 'dayOfWeek', 'professor']
            }
        }
    },
    required: ['name', 'courses'],
    propertyOrdering: ['name', 'courses']
};

const SCHEDULE_PARSING_PROMPT = `Parse this university schedule PDF and extract all courses/classes.

For each course provide:
- title: the course name
- type: one of "lecture", "lab", "seminar", "exam", or "practice" (use "lecture" as default)
- startTime and endTime: in HH:MM format (24-hour). If you see "9:00-10:30", split it into startTime "09:00" and endTime "10:30"
- location: room or building (use "TBA" if not specified)
- dayOfWeek: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
- professor: professor name (empty string if not mentioned)

Include all courses you can identify from the schedule.`;

export const parsePdfToSchedule = async (
    file: File,
    apiKey: string
): Promise<ParsedScheduleTemplate> => {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API ключ не предоставлен');
    }

    if (file.type !== 'application/pdf') {
        throw new Error('Файл должен быть в формате PDF');
    }

    try {
        // Initialize Google AI client
        const genAI = new GoogleGenAI({ apiKey: apiKey.trim() });

        // Read file as ArrayBuffer and convert to base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        // Prepare the request with structured output
        const contents = [
            { text: SCHEDULE_PARSING_PROMPT },
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data
                }
            }
        ];

        // Call Gemini API with structured output configuration
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: 'application/json',
                responseSchema: RESPONSE_SCHEMA
            }
        });

        // Extract text from response (already guaranteed to be valid JSON)
        let responseText = response.text;

        if (!responseText) {
            throw new Error('Пустой ответ от AI');
        }

        // Log response for debugging
        console.log('AI JSON response:', responseText);

        // Parse JSON (no cleanup needed with structured output)
        const parsedData: ParsedScheduleData = JSON.parse(responseText);

        // Log parsed data for debugging
        console.log('Parsed data from AI:', parsedData);

        // Validate structure
        if (!parsedData.name || !Array.isArray(parsedData.courses)) {
            throw new Error('Неверная структура данных от AI');
        }

        // Validate and normalize courses
        const validatedCourses: Omit<Course, 'id'>[] = parsedData.courses.map((course, index) => {
            // Validate required fields with detailed error messages
            const missingFields: string[] = [];
            if (!course.title || course.title.trim() === '') missingFields.push('title');
            if (!course.startTime || course.startTime.trim() === '') missingFields.push('startTime');
            if (!course.endTime || course.endTime.trim() === '') missingFields.push('endTime');
            if (!course.location || course.location.trim() === '') missingFields.push('location');

            if (missingFields.length > 0) {
                throw new Error(`Курс ${index + 1}: отсутствуют обязательные поля: ${missingFields.join(', ')}. Данные курса: ${JSON.stringify(course)}`);
            }

            // Validate and normalize type
            let courseType: CourseType = 'lecture';
            const normalizedType = course.type.toLowerCase();
            if (VALID_COURSE_TYPES.includes(normalizedType as CourseType)) {
                courseType = normalizedType as CourseType;
            }

            // Validate dayOfWeek
            const dayOfWeek = Number(course.dayOfWeek);
            if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
                throw new Error(`Курс ${index + 1}: неверный день недели (${course.dayOfWeek})`);
            }

            // Validate time format
            const timeRegex = /^\d{1,2}:\d{2}$/;
            if (!timeRegex.test(course.startTime) || !timeRegex.test(course.endTime)) {
                throw new Error(`Курс ${index + 1}: неверный формат времени`);
            }

            // Normalize time to nearest time slot
            const normalizedTime = normalizeToTimeSlot(course.startTime, course.endTime);

            console.log(`Course "${course.title}": ${course.startTime}-${course.endTime} → ${normalizedTime.startTime}-${normalizedTime.endTime}`);

            return {
                title: course.title.trim(),
                type: courseType,
                startTime: normalizedTime.startTime,
                endTime: normalizedTime.endTime,
                location: course.location.trim(),
                dayOfWeek: dayOfWeek,
                professor: course.professor?.trim() || ''
            };
        });

        // Return without IDs (will be generated by useTemplates)
        return {
            name: parsedData.name.trim() || 'Импортированное расписание',
            courses: validatedCourses
        };

    } catch (error) {
        console.error('PDF parsing error:', error);

        if (error instanceof SyntaxError) {
            console.error('Invalid JSON from AI');
            throw new Error('AI вернул некорректный JSON. Проверьте консоль для деталей. Попробуйте другой PDF или упростите формат.');
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Не удалось распарсить PDF файл');
    }
};

