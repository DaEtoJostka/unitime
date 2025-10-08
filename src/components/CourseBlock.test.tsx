import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { CourseBlock } from './CourseBlock';
import { Course } from '../types/course';

describe('CourseBlock', () => {
  const mockCourse: Course = {
    id: '1',
    title: 'Test Course',
    type: 'lecture',
    location: 'Room 101',
    professor: 'Dr. Smith',
    startTime: '09:00',
    endTime: '10:30',
    dayOfWeek: 0,
  };

  it('renders course title', () => {
    render(<CourseBlock course={mockCourse} />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('renders course location', () => {
    render(<CourseBlock course={mockCourse} />);
    expect(screen.getByText('Room 101')).toBeInTheDocument();
  });

  it('renders course professor when provided', () => {
    render(<CourseBlock course={mockCourse} />);
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('does not render professor when not provided', () => {
    const courseWithoutProfessor = { ...mockCourse, professor: undefined };
    render(<CourseBlock course={courseWithoutProfessor} />);
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
  });

  it('calls onEdit when clicked', () => {
    const onEdit = vi.fn();
    render(<CourseBlock course={mockCourse} onEdit={onEdit} />);
    
    const courseBlock = screen.getByText('Test Course').closest('div');
    courseBlock?.click();
    
    expect(onEdit).toHaveBeenCalledWith(mockCourse);
  });

  it('applies correct styling for lecture type', () => {
    const { container } = render(<CourseBlock course={mockCourse} />);
    const courseWrapper = container.querySelector('[type="lecture"]');
    expect(courseWrapper).toBeInTheDocument();
  });

  it('applies correct styling for lab type', () => {
    const labCourse = { ...mockCourse, type: 'lab' as const };
    const { container } = render(<CourseBlock course={labCourse} />);
    const courseWrapper = container.querySelector('[type="lab"]');
    expect(courseWrapper).toBeInTheDocument();
  });

  it('applies correct styling for practice type', () => {
    const practiceCourse = { ...mockCourse, type: 'practice' as const };
    const { container } = render(<CourseBlock course={practiceCourse} />);
    const courseWrapper = container.querySelector('[type="practice"]');
    expect(courseWrapper).toBeInTheDocument();
  });

  it('renders correctly without onEdit callback', () => {
    render(<CourseBlock course={mockCourse} />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });
});

