import { Course, CourseType } from '../types/course';
import { DEFAULT_TIME_SLOTS } from '../types/timeSlots';

interface AIParsedCourse {
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    location: string;
    dayOfWeek: number;
    professor?: string;
}

interface AIParsedGroupHalf {
    courses: AIParsedCourse[];
}

interface AIParsedSubgroup {
    numerator: AIParsedGroupHalf;
    denominator: AIParsedGroupHalf;
}

interface ParsedScheduleData {
    scheduleName: string;
    subgroup1: AIParsedSubgroup;
    subgroup2: AIParsedSubgroup;
}

interface ParsedScheduleTemplate {
    name: string;
    courses: Omit<Course, 'id'>[];
}

type JsonSchemaType = 'object' | 'array' | 'string' | 'number';

interface JsonSchema {
    type: JsonSchemaType;
    description?: string;
    properties?: Record<string, JsonSchema>;
    items?: JsonSchema;
    required?: string[];
    additionalProperties?: boolean;
}

interface OpenRouterMessageTextContent {
    type: 'text';
    text: string;
}

interface OpenRouterMessageImageContent {
    type: 'image_url';
    image_url: {
        url: string;
    };
}

interface OpenRouterMessageFileContent {
    type: 'file';
    file: {
        filename: string;
        file_data: string;
    };
}

type OpenRouterMessageContent =
    | OpenRouterMessageTextContent
    | OpenRouterMessageImageContent
    | OpenRouterMessageFileContent;

interface OpenRouterChatResponse {
    choices?: Array<{
        message?: {
            content?: string | null;
        };
    }>;
    error?: {
        message?: string;
    };
}

const VALID_COURSE_TYPES: CourseType[] = ['lecture', 'lab', 'seminar', 'exam', 'practice'];

const SUPPORTED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);
const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = '~google/gemini-flash-latest';

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

const COURSE_ITEM_SCHEMA: JsonSchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            description: 'Course name'
        },
        type: {
            type: 'string',
            description: 'Course type: lecture, lab, seminar, exam, or practice'
        },
        startTime: {
            type: 'string',
            description: 'Start time in HH:MM format (24-hour)'
        },
        endTime: {
            type: 'string',
            description: 'End time in HH:MM format (24-hour)'
        },
        location: {
            type: 'string',
            description: 'Room or building location'
        },
        dayOfWeek: {
            type: 'number',
            description: 'Day of week: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday'
        },
        professor: {
            type: 'string',
            description: 'Professor name (can be empty)'
        }
    },
    required: ['title', 'type', 'startTime', 'endTime', 'location', 'dayOfWeek'],
    additionalProperties: false
};

const GROUP_HALF_SCHEMA: JsonSchema = {
    type: 'object',
    properties: {
        courses: {
            type: 'array',
            description: 'Courses for this subgroup and week type',
            items: COURSE_ITEM_SCHEMA
        }
    },
    required: ['courses'],
    additionalProperties: false
};

const SUBGROUP_SCHEMA: JsonSchema = {
    type: 'object',
    properties: {
        numerator: {
            ...GROUP_HALF_SCHEMA,
            description: 'Courses for numerator (odd weeks) in this subgroup'
        },
        denominator: {
            ...GROUP_HALF_SCHEMA,
            description: 'Courses for denominator (even weeks) in this subgroup'
        }
    },
    required: ['numerator', 'denominator'],
    additionalProperties: false
};

const RESPONSE_SCHEMA: JsonSchema = {
    type: 'object',
    properties: {
        scheduleName: {
            type: 'string',
            description: 'Base schedule name from the provided document'
        },
        subgroup1: {
            ...SUBGROUP_SCHEMA,
            description: 'First subgroup split by week type'
        },
        subgroup2: {
            ...SUBGROUP_SCHEMA,
            description: 'Second subgroup split by week type'
        }
    },
    required: ['scheduleName', 'subgroup1', 'subgroup2'],
    additionalProperties: false
};

const SCHEDULE_PARSING_PROMPT = `Parse this university schedule document (PDF or image) and extract all courses/classes.
The schedule may appear as a scanned timetable, so transcribe any text from the image before structuring the response.

IMPORTANT: Use ONLY these exact time slots (startTime and endTime must match exactly):
${AVAILABLE_TIME_SLOTS}

Split the timetable into four distinct course lists:
- subgroup1.numerator: lessons for the 1st subgroup during numerator/odd weeks.
- subgroup1.denominator: lessons for the 1st subgroup during denominator/even weeks.
- subgroup2.numerator: lessons for the 2nd subgroup during numerator/odd weeks.
- subgroup2.denominator: lessons for the 2nd subgroup during denominator/even weeks.

Parsing rules:
- If a timetable row has two parallel cells, the left/first cell is for subgroup 1 and the right/second cell is for subgroup 2.
- If a row has only one cell for a time slot, treat that lesson as common to both subgroups (duplicate it into subgroup1 and subgroup2).
- Within a cell, split numerator vs denominator by the delimiter "//". Content before "//" belongs to the numerator; content after "//" belongs to the denominator.
- If "//" is missing, assume the lesson applies to both week types and duplicate it into numerator and denominator.
- Provide empty course arrays when a subgroup/week combination has no lessons.

For each course entry:
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

const readFileAsBase64 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const createDocumentContent = async (file: File, mimeType: string): Promise<OpenRouterMessageContent> => {
    const base64Data = await readFileAsBase64(file);
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    if (mimeType === 'application/pdf') {
        return {
            type: 'file',
            file: {
                filename: file.name || 'schedule.pdf',
                file_data: dataUrl
            }
        };
    }

    return {
        type: 'image_url',
        image_url: {
            url: dataUrl
        }
    };
};

const extractOpenRouterContent = (response: OpenRouterChatResponse): string => {
    const responseText = response.choices?.[0]?.message?.content;
    if (!responseText) {
        throw new Error('Пустой ответ от AI');
    }

    return responseText;
};

export const parsePdfToSchedule = async (
    file: File,
    apiKey: string
): Promise<ParsedScheduleTemplate[]> => {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API ключ не предоставлен');
    }

    const mimeType = normalizeMimeType(file);

    if (!mimeType || !SUPPORTED_MIME_TYPES.has(mimeType)) {
        throw new Error('Файл должен быть в формате PDF, JPG или PNG');
    }

    try {
        const documentContent = await createDocumentContent(file, mimeType);
        const contents: OpenRouterMessageContent[] = [
            {
                type: 'text',
                text: SCHEDULE_PARSING_PROMPT
            },
            documentContent
        ];

        const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-OpenRouter-Title': 'Unitime'
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: contents
                    }
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'schedule',
                        strict: true,
                        schema: RESPONSE_SCHEMA
                    }
                },
                plugins: mimeType === 'application/pdf' ? [
                    {
                        id: 'file-parser',
                        pdf: {
                            engine: 'cloudflare-ai'
                        }
                    }
                ] : undefined
            })
        });

        const responseBody: OpenRouterChatResponse = await response.json();
        if (!response.ok) {
            throw new Error(responseBody.error?.message || 'Ошибка OpenRouter API');
        }

        const responseText = extractOpenRouterContent(responseBody);

        // Log response for debugging
        console.log('AI JSON response:', responseText);

        // Parse JSON (no cleanup needed with structured output)
        const parsedData: ParsedScheduleData = JSON.parse(responseText);

        // Log parsed data for debugging
        console.log('Parsed data from AI:', parsedData);

        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('Неверная структура данных от AI');
        }

        const validateCourse = (course: AIParsedCourse, index: number, context: string): Omit<Course, 'id'> => {
            if (!course || typeof course !== 'object') {
                throw new Error(`${context}: некорректные данные курса по индексу ${index}`);
            }

            const missingFields: string[] = [];
            if (!course.title || course.title.trim() === '') missingFields.push('title');
            if (!course.startTime || course.startTime.trim() === '') missingFields.push('startTime');
            if (!course.endTime || course.endTime.trim() === '') missingFields.push('endTime');
            if (!course.location || course.location.trim() === '') missingFields.push('location');

            if (missingFields.length > 0) {
                throw new Error(`${context}: отсутствуют обязательные поля (${missingFields.join(', ')}). Данные курса: ${JSON.stringify(course)}`);
            }

            let courseType: CourseType = 'lecture';
            const normalizedType = typeof course.type === 'string' ? course.type.toLowerCase() : '';
            if (normalizedType && VALID_COURSE_TYPES.includes(normalizedType as CourseType)) {
                courseType = normalizedType as CourseType;
            }

            const dayOfWeek = Number(course.dayOfWeek);
            if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
                throw new Error(`${context}: неверный день недели (${course.dayOfWeek})`);
            }

            const timeRegex = /^\d{1,2}:\d{2}$/;
            if (!timeRegex.test(course.startTime) || !timeRegex.test(course.endTime)) {
                throw new Error(`${context}: неверный формат времени (${course.startTime}-${course.endTime})`);
            }

            const matchesSlot = DEFAULT_TIME_SLOTS.some(slot =>
                slot.startTime === course.startTime && slot.endTime === course.endTime
            );

            if (!matchesSlot) {
                console.warn(`${context}: курс "${course.title}" имеет нестандартное время ${course.startTime}-${course.endTime}`);
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
        };

        const ensureCoursesArray = (half: AIParsedGroupHalf | undefined, context: string): AIParsedCourse[] => {
            if (!half) {
                console.warn(`${context}: отсутствует блок, используется пустой список`);
                return [];
            }

            if (!Array.isArray(half.courses)) {
                throw new Error(`${context}: ожидается массив courses`);
            }

            return half.courses;
        };

        const ensureSubgroup = (subgroup: AIParsedSubgroup | undefined, context: string): AIParsedSubgroup => {
            if (!subgroup) {
                throw new Error(`${context}: отсутствуют данные подгруппы`);
            }

            return subgroup;
        };

        const subgroup1 = ensureSubgroup(parsedData.subgroup1, 'Первая подгруппа');
        const subgroup2 = ensureSubgroup(parsedData.subgroup2, 'Вторая подгруппа');

        const validatedSubgroup1Numerator = ensureCoursesArray(subgroup1.numerator, '1 подгруппа числитель')
            .map((course, index) => validateCourse(course, index + 1, '1 подгруппа (числитель)'));
        const validatedSubgroup1Denominator = ensureCoursesArray(subgroup1.denominator, '1 подгруппа знаменатель')
            .map((course, index) => validateCourse(course, index + 1, '1 подгруппа (знаменатель)'));
        const validatedSubgroup2Numerator = ensureCoursesArray(subgroup2.numerator, '2 подгруппа числитель')
            .map((course, index) => validateCourse(course, index + 1, '2 подгруппа (числитель)'));
        const validatedSubgroup2Denominator = ensureCoursesArray(subgroup2.denominator, '2 подгруппа знаменатель')
            .map((course, index) => validateCourse(course, index + 1, '2 подгруппа (знаменатель)'));

        const baseName = parsedData.scheduleName?.trim() || 'Импортированное расписание';

        const templates: ParsedScheduleTemplate[] = [
            {
                name: `${baseName} - 1 подгруппа - числитель`,
                courses: validatedSubgroup1Numerator
            },
            {
                name: `${baseName} - 1 подгруппа - знаменатель`,
                courses: validatedSubgroup1Denominator
            },
            {
                name: `${baseName} - 2 подгруппа - числитель`,
                courses: validatedSubgroup2Numerator
            },
            {
                name: `${baseName} - 2 подгруппа - знаменатель`,
                courses: validatedSubgroup2Denominator
            }
        ];

        // Validate that at least one template has courses
        const hasCourses = templates.some(template => Array.isArray(template.courses) && template.courses.length > 0);
        if (!hasCourses) {
            throw new Error('Не найдено ни одного курса в файле. Импорт не может быть выполнен.');
        }
        return templates;

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
