import React from 'react';
import { useDrag } from 'react-dnd';
import { Course } from '../types/course';
import { GlobalStyle, CourseWrapper, CourseTitle, CourseInfo } from '../styles/CourseBlockStyles';

interface CourseBlockProps {
  course: Course;
  onEdit?: (course: Course) => void;
}

export const CourseBlock: React.FC<CourseBlockProps> = ({ course, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COURSE',
    item: course,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <>
      <GlobalStyle $isDragging={isDragging} />
      <CourseWrapper
        ref={drag}
        type={course.type}
        $isDragging={isDragging}
        onClick={() => onEdit?.(course)}
      >
        <CourseTitle>{course.title}</CourseTitle>
        <CourseInfo>{course.location}</CourseInfo>
        {course.professor && (
          <CourseInfo>{course.professor}</CourseInfo>
        )}
      </CourseWrapper>
    </>
  );
};