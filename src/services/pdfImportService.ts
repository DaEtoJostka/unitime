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

const SUPPORTED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

const EXTENSION_MIME_MAP: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg'
};

const normalizeMimeType = (file: File): string | null => {
    const rawType = file.type ? file.type.toLowerCase() : '';
    if (rawType) {
        if (rawType === 'image/jpg' || rawType === 'image/pjpeg') {
            return 'image/jpeg';
        }
        if (SUPPORTED_MIME_TYPES.has(rawType)) {
            return rawType;
        }
    }

    const nameParts = file.name.split('.');
    const extension = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : undefined;
    if (extension && extension in EXTENSION_MIME_MAP) {
        return EXTENSION_MIME_MAP[extension];
    }

    return rawType || null;
};

// Available time slots for the schedule
const AVAILABLE_TIME_SLOTS = DEFAULT_TIME_SLOTS.map(slot =>
    `${slot.startTime}-${slot.endTime} (${slot.name})`
).join(', ');

// JSON Schema for structured output
const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "Schedule name from the provided document"
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

const SCHEDULE_PARSING_PROMPT = `Parse this university schedule document (PDF or image) and extract all courses/classes.
The schedule may appear as a scanned timetable, so transcribe any text from the image before structuring the response.

IMPORTANT: Use ONLY these exact time slots (startTime and endTime must match exactly):
${AVAILABLE_TIME_SLOTS}

For each course:
- title: the course name
- type: one of "lecture", "lab", "seminar", "exam", or "practice" (use "lecture" as default)
- startTime and endTime: MUST be from the time slots listed above. Match course time to the NEAREST available slot.
- location: room or building (use "TBA" if not specified)
- dayOfWeek: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
- professor: professor name (empty string if not mentioned)

Examples:
- If course is at 08:30-09:50, use startTime: "08:30", endTime: "09:50"
- If course is at 13:30-15:00, use the nearest slot: startTime: "13:20", endTime: "14:40"
- If course is at 10:15-11:45, use the nearest slot: startTime: "10:00", endTime: "11:20"

Include all courses you can identify from the schedule.`;

export const parsePdfToSchedule = async (
    file: File,
    apiKey: string
): Promise<ParsedScheduleTemplate> => {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API ключ не предоставлен');
    }

    const mimeType = normalizeMimeType(file);

    if (!mimeType || !SUPPORTED_MIME_TYPES.has(mimeType)) {
        throw new Error('Файл должен быть в формате PDF, JPG или PNG');
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
                    mimeType,
                    data: base64Data
                }
            }
        ];

        // Call Gemini API with structured output configuration
        const response = await genAI.models.generateContent({
            model: 'gemini-flash-latest',
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

            // Validate that time matches one of the available slots
            const matchesSlot = DEFAULT_TIME_SLOTS.some(slot =>
                slot.startTime === course.startTime && slot.endTime === course.endTime
            );

            if (!matchesSlot) {
                console.warn(`Курс "${course.title}" имеет нестандартное время ${course.startTime}-${course.endTime}`);
            }

            return {
                title: course.title.trim(),
                type: courseType,
                startTime: course.startTime,
                endTime: course.endTime,
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
        console.error('Schedule parsing error:', error);

        if (error instanceof SyntaxError) {
            console.error('Invalid JSON from AI');
            throw new Error('AI вернул некорректный JSON. Проверьте консоль для деталей. Попробуйте другой файл или упростите формат.');
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Не удалось распарсить файл');
    }
};
