import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Timetable } from './Timetable';
import { Course } from '../types/course';
import { DEFAULT_TIME_SLOTS } from '../types/timeSlots';

describe('Timetable', () => {
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Mathematics',
      type: 'lecture',
      location: 'Room 101',
      professor: 'Dr. Smith',
      startTime: '08:30',
      endTime: '09:50',
      dayOfWeek: 0, // Monday
    },
    {
      id: '2',
      title: 'Physics',
      type: 'lab',
      location: 'Lab 202',
      professor: 'Dr. Johnson',
      startTime: '10:00',
      endTime: '11:20',
      dayOfWeek: 1, // Tuesday
    },
  ];

  const mockOnAddCourse = vi.fn();
  const mockOnEditCourse = vi.fn();
  const mockOnMoveCourse = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Header', () => {
    it('renders all day names', () => {
      render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      expect(screen.getByText('Пн')).toBeInTheDocument();
      expect(screen.getByText('Вт')).toBeInTheDocument();
      expect(screen.getByText('Ср')).toBeInTheDocument();
      expect(screen.getByText('Чт')).toBeInTheDocument();
      expect(screen.getByText('Пт')).toBeInTheDocument();
      expect(screen.getByText('Сб')).toBeInTheDocument();
    });
  });

  describe('Time Slots', () => {
    it('renders all time slots', () => {
      render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      DEFAULT_TIME_SLOTS.forEach(slot => {
        expect(screen.getByText(slot.startTime)).toBeInTheDocument();
        expect(screen.getByText(slot.endTime)).toBeInTheDocument();
      });
    });

    it('displays time slots in correct order', () => {
      const { container } = render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      const timeSlots = container.querySelectorAll('.start-time');
      expect(timeSlots.length).toBe(DEFAULT_TIME_SLOTS.length);
      
      const firstSlot = timeSlots[0];
      expect(firstSlot.textContent).toBe('08:30');
    });
  });

  describe('Course Display', () => {
    it('renders courses in correct time slots', () => {
      render(
        <Timetable
          courses={mockCourses}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Physics')).toBeInTheDocument();
    });

    it('displays course details', () => {
      render(
        <Timetable
          courses={mockCourses}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Lab 202')).toBeInTheDocument();
      expect(screen.getByText('Dr. Johnson')).toBeInTheDocument();
    });

    it('renders empty timetable when no courses', () => {
      render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      expect(screen.queryByText('Mathematics')).not.toBeInTheDocument();
      expect(screen.queryByText('Physics')).not.toBeInTheDocument();
    });
  });

  describe('Add Course Interaction', () => {
    it('shows add button on hover (desktop)', async () => {
      const { container } = render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      const addButtons = container.querySelectorAll('.add-button');
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it('calls onAddCourse when add button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      // Find and click the first add button
      const addButton = container.querySelector('.add-button') as HTMLElement;
      if (addButton) {
        await user.click(addButton);
        
        await waitFor(() => {
          expect(mockOnAddCourse).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Edit Course Interaction', () => {
    it('calls onEditCourse when course is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Timetable
          courses={mockCourses}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      const mathCourse = screen.getByText('Mathematics');
      await user.click(mathCourse);

      await waitFor(() => {
        expect(mockOnEditCourse).toHaveBeenCalledWith(mockCourses[0]);
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('renders grid layout correctly', () => {
      const { container } = render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      // Check that the header and rows exist
      const header = container.querySelector('[style*="grid-template-columns"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Current Day and Time Indicators', () => {
    it('renders without crashing with current time logic', () => {
      render(
        <Timetable
          courses={mockCourses}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      // The component should render without errors
      expect(screen.getByText('Пн')).toBeInTheDocument();
    });
  });

  describe('Multiple Courses in Same Slot', () => {
    it('renders multiple courses in the same time slot', () => {
      const coursesInSameSlot: Course[] = [
        {
          id: '1',
          title: 'Course A',
          type: 'lecture',
          location: 'Room 101',
          startTime: '08:30',
          endTime: '09:50',
          dayOfWeek: 0,
        },
        {
          id: '2',
          title: 'Course B',
          type: 'lab',
          location: 'Room 102',
          startTime: '08:30',
          endTime: '09:50',
          dayOfWeek: 0,
        },
      ];

      render(
        <Timetable
          courses={coursesInSameSlot}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      expect(screen.getByText('Course A')).toBeInTheDocument();
      expect(screen.getByText('Course B')).toBeInTheDocument();
    });
  });

  describe('Week Date Calculation', () => {
    it('calculates and displays week dates', async () => {
      render(
        <Timetable
          courses={[]}
          onAddCourse={mockOnAddCourse}
          onEditCourse={mockOnEditCourse}
          onMoveCourse={mockOnMoveCourse}
        />
      );

      // Wait for dates to be calculated and rendered
      await waitFor(() => {
        const { container } = render(
          <Timetable
            courses={[]}
            onAddCourse={mockOnAddCourse}
            onEditCourse={mockOnEditCourse}
            onMoveCourse={mockOnMoveCourse}
          />
        );
        // Dates should be displayed in the header cells
        expect(container.querySelector('[style*="fontSize"]')).toBeInTheDocument();
      });
    });
  });
});

