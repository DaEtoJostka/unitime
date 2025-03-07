import React from 'react';
import { useDrag } from 'react-dnd';
import styled, { createGlobalStyle } from 'styled-components';
import { Course } from '../types/course';

const GlobalStyle = createGlobalStyle<{ isDragging: boolean }>`
  * {
    cursor: ${props => props.isDragging ? 'grabbing !important' : 'inherit'};
  }
`;

const CourseWrapper = styled.div<{ type: string; isDragging: boolean }>`
  padding: 8px;
  background: ${props => 
    props.type === 'lecture' ? '#ffebee' :
    props.type === 'lab' ? 'rgba(19, 164, 236, 0.1)' :
    props.type === 'practice' ? 'rgba(19, 109, 236, 0.1)' :
    props.type === 'exam' ? '#fff3e0' :
    '#f3e5f5'};
  border-left: 4px solid ${props =>
    props.type === 'lecture' ? '#ef5350' :
    props.type === 'lab' ? 'rgb(19, 164, 236)' :
    props.type === 'practice' ? 'rgb(19, 109, 236)' :
    props.type === 'exam' ? '#ff9800' :
    '#ab47bc'};
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  font-size: 0.9em;
  z-index: 1;
  opacity: ${props => props.isDragging ? 0.4 : 1};
  transform: ${props => props.isDragging ? 'none' : 'none'};
  user-select: none;

  &:hover {
    transform: ${props => props.isDragging ? 'none' : 'scale(1.02)'};
    box-shadow: ${props => props.isDragging ? 'none' : '0 2px 5px rgba(0,0,0,0.1)'};
  }
`;

const CourseTitle = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
  /* Display text on two lines with ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.3;
  max-height: 2.6em;
`;

const CourseInfo = styled.div`
  font-size: 0.85em;
  color: #666;
  /* Allow one line with ellipsis */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

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
      <GlobalStyle isDragging={isDragging} />
      <CourseWrapper
        ref={drag}
        type={course.type}
        isDragging={isDragging}
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