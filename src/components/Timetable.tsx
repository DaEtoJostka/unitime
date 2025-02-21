import React, { useEffect, useState } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Course } from '../types/course';
import { TimeSlot, DEFAULT_TIME_SLOTS } from '../types/timeSlots';
import styled from 'styled-components';
import { CourseBlock } from './CourseBlock';

const TimetableContainer = styled.div`
  overflow-x: auto;
  padding: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  height: fit-content;
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    margin: 0;
  }
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 100px repeat(6, minmax(120px, 1fr));
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  min-width: 800px;
  border-right: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderCell = styled.div<{ $isCurrent?: boolean }>`
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isCurrent ? '#2196f3' : '#2d3748'};
  background: ${props => props.$isCurrent ? '#e3f2fd' : '#fff'};
  border-right: 1px solid #e0e0e0;
  line-height: 1.4;
  text-align: left;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:last-child {
    border-right: none;
  }

  ${props => props.$isCurrent && `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 3px;
      background: #2196f3;
    }
  `}
`;

const TimeSlotRow = styled.div`
  display: grid;
  grid-template-columns: 100px repeat(6, minmax(120px, 1fr));
  min-width: 800px;
  border-bottom: 1px solid #e0e0e0;
  min-height: 100px;

  &:last-child {
    border-bottom: none;
  }
`;

const CurrentTimeIndicator = styled.div`
  background-color: #0060e6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.15);
`;

const TimeCell = styled.div<{ $isCurrent?: boolean }>`
  position: relative;
  padding: 12px 16px;
  font-size: 13px;
  color: #4a5568;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  height: 100%;

  .start-time {
    display: block;
    font-weight: 600;
    color: ${props => props.$isCurrent ? '#2196f3' : '#2d3748'};
    margin-bottom: 2px;
    font-size: 16px;
  }

  .end-time {
    display: block;
    font-size: 12px;
    color: ${props => props.$isCurrent ? '#2196f3' : '#718096'};
  }
`;

const CoursesContainer = styled.div<{ $isCurrent?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  background: ${props => props.$isCurrent ? '#e3f2fd' : '#fff'};
  min-height: 100px;
  position: relative;
  transition: padding-bottom 0.2s ease-in-out;
  border-right: 1px solid #e0e0e0;

  &:hover {
    padding-bottom: 40px;
  }

  &:hover .add-button {
    opacity: 1;
    visibility: visible;
  }

  &.can-drop {
    background: #e3f2fd;
  }
`;

const AddButton = styled.button`
  padding: 4px 8px;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  color: #666;
  width: calc(100% - 10px);
  position: absolute;
  bottom: 5px;
  left: 5px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
  z-index: 0;

  &:hover {
    background: #d0d0d0;
  }
`;

const MobileOnly = styled.div`
  display: none;
  @media (max-width: 767px) {
    display: block;
    padding: 10px;
    background: #fff;
    margin-bottom: 5px;
    border-radius: 4px;
    font-weight: bold;
  }
`;

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

interface DropTargetProps {
  timeSlot: TimeSlot;
  dayIndex: number;
  children: React.ReactNode;
  onMoveCourse: (course: Course, newTimeSlot: TimeSlot, newDayIndex: number) => void;
  $isCurrent?: boolean;
}

const DropTarget: React.FC<DropTargetProps> = ({ timeSlot, dayIndex, children, onMoveCourse, $isCurrent }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COURSE',
    drop: (item: Course) => {
      onMoveCourse(item, timeSlot, dayIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <CoursesContainer 
      ref={drop} 
      className={isOver ? 'can-drop' : ''}
      $isCurrent={$isCurrent}
    >
      {children}
    </CoursesContainer>
  );
};

interface TimetableProps {
  courses: Course[];
  onAddCourse?: (timeSlot: TimeSlot, dayIndex: number) => void;
  onEditCourse?: (course: Course) => void;
  onMoveCourse?: (course: Course, newTimeSlot: TimeSlot, newDayIndex: number) => void;
}

export const Timetable: React.FC<TimetableProps> = ({
  courses,
  onAddCourse,
  onEditCourse,
  onMoveCourse,
}) => {
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    const calculateWeekDates = () => {
      const today = new Date();
      const dates = [];
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      
      // Find most recent Monday
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      
      // Generate dates for Mon-Sat
      for (let i = 0; i < 6; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
      }
      
      return dates;
    };

    // Initial calculation
    setWeekDates(calculateWeekDates());
    
    // Update every Sunday at midnight
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(24, 0, 0, 0);
    
    const timeUntilSunday = nextSunday.getTime() - now.getTime();
    const timerId = setTimeout(() => {
      setWeekDates(calculateWeekDates());
      // Set weekly interval after first update
      const intervalId = setInterval(() => {
        setWeekDates(calculateWeekDates());
      }, 7 * 24 * 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, timeUntilSunday);

    return () => clearTimeout(timerId);
  }, []);

  useEffect(() => {
    const today = new Date().getDay(); 
    // Sunday = 0, Monday = 1, etc.
    const adjustedIndex = today === 0 ? 6 : today - 1; // Adjust for week starting Monday
    setCurrentDayIndex(adjustedIndex > 4 ? null : adjustedIndex); // Only highlight Mon-Fri
  }, []);

  const getCoursesForSlot = (timeSlot: TimeSlot, dayIndex: number) => {
    return courses.filter(
      course => 
        course.startTime === timeSlot.startTime &&
        course.dayOfWeek === dayIndex
    );
  };

  const isCurrentTimeSlot = (timeSlot: TimeSlot) => {
    const now = new Date();
    const [currentHour, currentMinute] = [now.getHours(), now.getMinutes()];
    
    const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);
    
    const currentTotal = currentHour * 60 + currentMinute;
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    
    return currentTotal >= startTotal && currentTotal <= endTotal;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <TimetableContainer>
        <MobileOnly>Прокрутите вправо для просмотра расписания →</MobileOnly>
        <Header>
          <HeaderCell></HeaderCell>
          {days.map((day, index) => (
            <HeaderCell 
              key={day} 
              $isCurrent={currentDayIndex === index}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <div>
                  {day}
                  {weekDates[index] && (
                    <div style={{
                      fontSize: '12px',
                      color: currentDayIndex === index ? '#2196f3' : '#718096',
                      fontWeight: 400,
                      marginTop: '2px'
                    }}>
                      {weekDates[index].toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short'
                      }).replace('.', '')}
                    </div>
                  )}
                </div>
                {currentDayIndex === index && (
                  <span style={{ 
                    fontSize: 12, 
                    color: '#2196f3',
                    whiteSpace: 'nowrap',
                    marginLeft: '-25px'
                  }}>• Сегодня</span>
                )}
              </div>
            </HeaderCell>
          ))}
        </Header>

        {DEFAULT_TIME_SLOTS.map((timeSlot) => {
          const isCurrentTime = isCurrentTimeSlot(timeSlot);
          return (
            <TimeSlotRow key={timeSlot.id}>
              <TimeCell $isCurrent={isCurrentTime}>
                <span className="start-time">{timeSlot.startTime}</span>
                <span className="end-time">{timeSlot.endTime}</span>
              </TimeCell>
              {days.map((_, dayIndex) => {
                const isCurrentCell = isCurrentTime && dayIndex === currentDayIndex;
                const slotCourses = getCoursesForSlot(timeSlot, dayIndex);
                
                return (
                  <DropTarget
                    key={dayIndex}
                    timeSlot={timeSlot}
                    dayIndex={dayIndex}
                    onMoveCourse={onMoveCourse!}
                    $isCurrent={currentDayIndex === dayIndex}
                  >
                    {isCurrentCell && <CurrentTimeIndicator>Сейчас идёт</CurrentTimeIndicator>}
                    {slotCourses.map(course => (
                      <CourseBlock
                        key={course.id}
                        course={course}
                        onEdit={onEditCourse}
                      />
                    ))}
                    <AddButton 
                      className="add-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddCourse?.(timeSlot, dayIndex);
                      }}
                    >
                      + Добавить занятие
                    </AddButton>
                  </DropTarget>
                );
              })}
            </TimeSlotRow>
          );
        })}
      </TimetableContainer>
    </DndProvider>
  );
}; 