import { GoogleGenAI } from '@google/genai';
import { ScheduleTemplate, Course, CourseType } from '../types/course';

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

const VALID_COURSE_TYPES: CourseType[] = ['lecture', 'lab', 'seminar', 'exam', 'practice'];

const SCHEDULE_PARSING_PROMPT = `Parse this university schedule PDF and return ONLY a valid JSON object with this exact structure:
{
  "name": "Schedule name from PDF or 'Imported Schedule'",
  "courses": [
    {
      "title": "Course name",
      "type": "lecture|lab|seminar|exam|practice",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "location": "Room/Building",
      "dayOfWeek": 0-6,
      "professor": "Professor name"
    }
  ]
}

Important rules:
- dayOfWeek: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
- type must be one of: lecture, lab, seminar, exam, practice
- Times must be in HH:MM format (24-hour)
- Return ONLY valid JSON, no markdown code blocks, no explanations
- If you cannot parse certain data, make reasonable assumptions
- Include all courses/classes you can identify in the schedule`;

export const parsePdfToSchedule = async (
    file: File,
    apiKey: string
): Promise<ScheduleTemplate> => {
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

        // Prepare the request
        const contents = [
            { text: SCHEDULE_PARSING_PROMPT },
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data
                }
            }
        ];

        // Call Gemini API
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents
        });

        // Extract text from response
        let responseText = response.text;

        if (!responseText) {
            throw new Error('Пустой ответ от AI');
        }

        // Clean up response (remove markdown code blocks if present)
        responseText = responseText.trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        // Parse JSON
        const parsedData: ParsedScheduleData = JSON.parse(responseText);

        // Validate structure
        if (!parsedData.name || !Array.isArray(parsedData.courses)) {
            throw new Error('Неверная структура данных от AI');
        }

        // Validate and normalize courses
        const validatedCourses: Omit<Course, 'id'>[] = parsedData.courses.map((course, index) => {
            // Validate required fields
            if (!course.title || !course.startTime || !course.endTime || !course.location) {
                throw new Error(`Курс ${index + 1}: отсутствуют обязательные поля`);
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

        // Return as partial ScheduleTemplate (id will be added by useTemplates)
        return {
            id: '', // Will be generated by useTemplates
            name: parsedData.name.trim() || 'Импортированное расписание',
            courses: validatedCourses as Course[] // Cast is safe because id will be added
        };

    } catch (error) {
        console.error('PDF parsing error:', error);

        if (error instanceof SyntaxError) {
            throw new Error('AI вернул некорректный JSON. Попробуйте другой PDF файл.');
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Не удалось распарсить PDF файл');
    }
};

