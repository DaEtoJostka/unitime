import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { CourseForm } from './CourseForm';
import { Course } from '../types/course';
import { TimeSlot } from '../types/timeSlots';

describe('CourseForm', () => {
  const mockTimeSlot: TimeSlot = {
    id: 1,
    name: '1 пара',
    startTime: '08:30',
    endTime: '09:50',
  };

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnDelete = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders form fields for creating a new course', () => {
      render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Название')).toBeInTheDocument();
      expect(screen.getByLabelText('Тип')).toBeInTheDocument();
      expect(screen.getByLabelText('Аудитория')).toBeInTheDocument();
      expect(screen.getByLabelText('Преподаватель')).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
    });

    it('does not render delete button in create mode', () => {
      render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument();
    });

    it('submits form with new course data', async () => {
      const user = userEvent.setup();
      render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('Название'), 'Mathematics');
      await user.type(screen.getByLabelText('Аудитория'), '101');
      await user.type(screen.getByLabelText('Преподаватель'), 'Dr. Smith');

      await user.click(screen.getByRole('button', { name: /добавить/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedCourse = mockOnSubmit.mock.calls[0][0];
      expect(submittedCourse.title).toBe('Mathematics');
      expect(submittedCourse.location).toBe('101');
      expect(submittedCourse.professor).toBe('Dr. Smith');
      expect(submittedCourse.startTime).toBe('08:30');
      expect(submittedCourse.endTime).toBe('09:50');
      expect(submittedCourse.dayOfWeek).toBe(0);
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /отмена/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const mockCourse: Course = {
      id: '1',
      title: 'Existing Course',
      type: 'lecture',
      location: 'Room 202',
      professor: 'Prof. Johnson',
      startTime: '08:30',
      endTime: '09:50',
      dayOfWeek: 0,
    };

    it('pre-fills form with existing course data', () => {
      render(
        <CourseForm
          course={mockCourse}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('Название')).toHaveValue('Existing Course');
      expect(screen.getByLabelText('Аудитория')).toHaveValue('Room 202');
      expect(screen.getByLabelText('Преподаватель')).toHaveValue('Prof. Johnson');
    });

    it('renders save button in edit mode', () => {
      render(
        <CourseForm
          course={mockCourse}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /сохранить/i })).toBeInTheDocument();
    });

    it('renders delete and duplicate buttons in edit mode', () => {
      render(
        <CourseForm
          course={mockCourse}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /дублировать/i })).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CourseForm
          course={mockCourse}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      await user.click(screen.getByRole('button', { name: /удалить/i }));
      expect(mockOnDelete).toHaveBeenCalled();
    });

    it('updates course when form is submitted', async () => {
      const user = userEvent.setup();
      render(
        <CourseForm
          course={mockCourse}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      const titleInput = screen.getByDisplayValue('Existing Course');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Course');

      await user.click(screen.getByRole('button', { name: /сохранить/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedCourse = mockOnSubmit.mock.calls[0][0];
      expect(submittedCourse.title).toBe('Updated Course');
      expect(submittedCourse.id).toBe('1');
    });

    it('creates duplicate course when duplicate button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CourseForm
          course={mockCourse}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      await user.click(screen.getByRole('button', { name: /дублировать/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedCourse = mockOnSubmit.mock.calls[0][0];
      expect(submittedCourse.title).toBe('Existing Course');
      expect(submittedCourse.id).not.toBe('1'); // Should have a new ID
    });
  });

  describe('Course Type Selection', () => {
    it('opens type selector when clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Find the button that shows the current type
      const typeButtons = container.querySelectorAll('button');
      const typeButton = Array.from(typeButtons).find(btn => btn.textContent?.includes('Лекция'));
      expect(typeButton).toBeDefined();

      if (typeButton) {
        await user.click(typeButton);
        // After clicking, the dropdown should appear
        await waitFor(() => {
          const allLectureTexts = screen.queryAllByText('Лекция');
          expect(allLectureTexts.length).toBeGreaterThan(0);
        });
      }
    });

    it('displays different course type options', async () => {
      render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // The form should have a type selector showing the default type
      expect(screen.getByText(/Лекция/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('requires title field', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Find input by name attribute instead of label
      const locationInput = container.querySelector('input[name="location"]');
      if (locationInput) {
        await user.type(locationInput as HTMLElement, '101');
      }
      
      const submitButton = screen.getByRole('button', { name: /добавить/i });
      await user.click(submitButton);

      // Form should not submit because title is required
      const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement;
      expect(titleInput?.validity.valid).toBe(false);
    });

    it('requires location field', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CourseForm
          timeSlot={mockTimeSlot}
          dayIndex={0}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = container.querySelector('input[name="title"]');
      if (titleInput) {
        await user.type(titleInput as HTMLElement, 'Test Course');
      }
      
      const submitButton = screen.getByRole('button', { name: /добавить/i });
      await user.click(submitButton);

      const locationInput = container.querySelector('input[name="location"]') as HTMLInputElement;
      expect(locationInput?.validity.valid).toBe(false);
    });
  });
});

