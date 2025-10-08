import { describe, it, expect } from 'vitest';
import { Course, CourseType, ScheduleTemplate } from './course';

describe('Course Types', () => {
  describe('CourseType', () => {
    it('should have all valid course types', () => {
      const validTypes: CourseType[] = ['lecture', 'lab', 'seminar', 'exam', 'practice'];
      
      validTypes.forEach(type => {
        const courseType: CourseType = type;
        expect(courseType).toBe(type);
      });
    });

    it('should accept lecture type', () => {
      const type: CourseType = 'lecture';
      expect(type).toBe('lecture');
    });

    it('should accept lab type', () => {
      const type: CourseType = 'lab';
      expect(type).toBe('lab');
    });

    it('should accept seminar type', () => {
      const type: CourseType = 'seminar';
      expect(type).toBe('seminar');
    });

    it('should accept exam type', () => {
      const type: CourseType = 'exam';
      expect(type).toBe('exam');
    });

    it('should accept practice type', () => {
      const type: CourseType = 'practice';
      expect(type).toBe('practice');
    });
  });

  describe('Course interface', () => {
    it('should accept valid course object with all fields', () => {
      const course: Course = {
        id: '1',
        title: 'Mathematics',
        type: 'lecture',
        startTime: '08:30',
        endTime: '09:50',
        location: 'Room 101',
        dayOfWeek: 0,
        professor: 'Dr. Smith',
      };

      expect(course.id).toBe('1');
      expect(course.title).toBe('Mathematics');
      expect(course.type).toBe('lecture');
      expect(course.startTime).toBe('08:30');
      expect(course.endTime).toBe('09:50');
      expect(course.location).toBe('Room 101');
      expect(course.dayOfWeek).toBe(0);
      expect(course.professor).toBe('Dr. Smith');
    });

    it('should accept course without optional professor field', () => {
      const course: Course = {
        id: '2',
        title: 'Physics',
        type: 'lab',
        startTime: '10:00',
        endTime: '11:20',
        location: 'Lab 202',
        dayOfWeek: 1,
      };

      expect(course.id).toBe('2');
      expect(course.professor).toBeUndefined();
    });

    it('should accept all course types', () => {
      const types: CourseType[] = ['lecture', 'lab', 'seminar', 'exam', 'practice'];
      
      types.forEach(type => {
        const course: Course = {
          id: `course-${type}`,
          title: `Test ${type}`,
          type,
          startTime: '08:30',
          endTime: '09:50',
          location: 'Room 101',
          dayOfWeek: 0,
        };

        expect(course.type).toBe(type);
      });
    });

    it('should accept valid day of week values (0-5)', () => {
      for (let day = 0; day < 6; day++) {
        const course: Course = {
          id: `course-day-${day}`,
          title: 'Test Course',
          type: 'lecture',
          startTime: '08:30',
          endTime: '09:50',
          location: 'Room 101',
          dayOfWeek: day,
        };

        expect(course.dayOfWeek).toBe(day);
      }
    });

    it('should have string ID', () => {
      const course: Course = {
        id: 'unique-id-123',
        title: 'Test',
        type: 'lecture',
        startTime: '08:30',
        endTime: '09:50',
        location: 'Room 101',
        dayOfWeek: 0,
      };

      expect(typeof course.id).toBe('string');
    });

    it('should have time in string format', () => {
      const course: Course = {
        id: '1',
        title: 'Test',
        type: 'lecture',
        startTime: '08:30',
        endTime: '09:50',
        location: 'Room 101',
        dayOfWeek: 0,
      };

      expect(typeof course.startTime).toBe('string');
      expect(typeof course.endTime).toBe('string');
    });
  });

  describe('ScheduleTemplate interface', () => {
    it('should accept valid schedule template', () => {
      const template: ScheduleTemplate = {
        id: 'template-1',
        name: 'My Schedule',
        courses: [],
      };

      expect(template.id).toBe('template-1');
      expect(template.name).toBe('My Schedule');
      expect(template.courses).toEqual([]);
    });

    it('should accept template with multiple courses', () => {
      const courses: Course[] = [
        {
          id: '1',
          title: 'Math',
          type: 'lecture',
          startTime: '08:30',
          endTime: '09:50',
          location: 'Room 101',
          dayOfWeek: 0,
        },
        {
          id: '2',
          title: 'Physics',
          type: 'lab',
          startTime: '10:00',
          endTime: '11:20',
          location: 'Lab 202',
          dayOfWeek: 1,
        },
      ];

      const template: ScheduleTemplate = {
        id: 'template-2',
        name: 'Full Schedule',
        courses,
      };

      expect(template.courses).toHaveLength(2);
      expect(template.courses[0].title).toBe('Math');
      expect(template.courses[1].title).toBe('Physics');
    });

    it('should have unique ID', () => {
      const template: ScheduleTemplate = {
        id: 'unique-template-id',
        name: 'Test',
        courses: [],
      };

      expect(typeof template.id).toBe('string');
      expect(template.id.length).toBeGreaterThan(0);
    });

    it('should have a name', () => {
      const template: ScheduleTemplate = {
        id: '1',
        name: 'Spring 2024',
        courses: [],
      };

      expect(typeof template.name).toBe('string');
      expect(template.name).toBe('Spring 2024');
    });

    it('should maintain course array', () => {
      const template: ScheduleTemplate = {
        id: '1',
        name: 'Test',
        courses: [],
      };

      expect(Array.isArray(template.courses)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('ensures course type is one of predefined types', () => {
      const validCourse: Course = {
        id: '1',
        title: 'Test',
        type: 'lecture',
        startTime: '08:30',
        endTime: '09:50',
        location: 'Room 101',
        dayOfWeek: 0,
      };

      expect(['lecture', 'lab', 'seminar', 'exam', 'practice']).toContain(validCourse.type);
    });

    it('ensures required fields are present', () => {
      const course: Course = {
        id: '1',
        title: 'Required Fields Test',
        type: 'lecture',
        startTime: '08:30',
        endTime: '09:50',
        location: 'Room 101',
        dayOfWeek: 0,
      };

      // All required fields must be present
      expect(course.id).toBeDefined();
      expect(course.title).toBeDefined();
      expect(course.type).toBeDefined();
      expect(course.startTime).toBeDefined();
      expect(course.endTime).toBeDefined();
      expect(course.location).toBeDefined();
      expect(course.dayOfWeek).toBeDefined();
    });
  });
});

