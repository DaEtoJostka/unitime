import styled, { createGlobalStyle } from 'styled-components';
import { TYPE_COLORS, TYPE_BACKGROUNDS, TYPE_BACKGROUNDS_ACTIVE } from '../constants/courseTypes';
import { CourseType } from '../types/course';

export const GlobalStyle = createGlobalStyle<{ $isDragging: boolean }>`
  * {
    cursor: ${props => props.$isDragging ? 'grabbing !important' : 'inherit'};
  }
`;

export const CourseWrapper = styled.div<{ type: CourseType; $isDragging: boolean }>`
  padding: 8px;
  background: ${props => TYPE_BACKGROUNDS[props.type]};
  border-left: 4px solid ${props => TYPE_COLORS[props.type]};
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  font-size: 0.9em;
  z-index: 1;
  opacity: ${props => props.$isDragging ? 0.4 : 1};
  user-select: none;

  &:hover {
    transform: ${props => props.$isDragging ? 'none' : 'scale(1.02)'};
    box-shadow: ${props => props.$isDragging ? 'none' : '0 2px 5px rgba(0,0,0,0.1)'};
  }
  
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 0.8em;
    
    &:active {
      background: ${props => TYPE_BACKGROUNDS_ACTIVE[props.type]};
    }
  }
`;

export const CourseTitle = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.3;
  max-height: 2.6em;
  
  @media (max-width: 768px) {
    font-size: 0.95em;
    margin-bottom: 2px;
    line-height: 1.2;
    -webkit-line-clamp: 1;
    max-height: 1.2em;
  }
`;

export const CourseInfo = styled.div`
  font-size: 0.85em;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.8em;
    line-height: 1.2;
  }
`;

