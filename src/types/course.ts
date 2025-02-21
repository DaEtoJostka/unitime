export type CourseType = 'lecture' | 'lab' | 'seminar' | 'exam' | 'practice';

export interface Course {
  id: string;
  title: string;
  type: CourseType;
  startTime: string;
  endTime: string;
  location: string;
  dayOfWeek: number;
  professor?: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  courses: Course[];
}
