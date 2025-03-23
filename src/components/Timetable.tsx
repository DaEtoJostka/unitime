import React, { useEffect, useState } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Course } from '../types/course';
import { TimeSlot, DEFAULT_TIME_SLOTS } from '../types/timeSlots';
import styled from 'styled-components';
import { CourseBlock } from './CourseBlock';

// Add a useMediaQuery hook for responsive text
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};

const TimetableContainer = styled.div`
  position: relative;
  overflow: hidden;
  padding: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  min-height: 600px;

  @media (max-width: 768px) {
    height: calc(100vh - 20px);
    min-height: 500px;
    border-radius: 4px;
    margin-top: 10px;
  }
`;

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;
  width: 100%;
  
  -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */

  @media (max-width: 768px) {
    /* Make scrolling smoother on mobile */
    scroll-behavior: smooth;
  }
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: minmax(80px, 100px) repeat(6, minmax(120px, 1fr));
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  min-width: fit-content;
  position: sticky;
  top: 0;
  z-index: 2;
  
  @media (max-width: 768px) {
    grid-template-columns: minmax(60px, 80px) repeat(6, minmax(90px, 1fr));
  }
`;

const HeaderCell = styled.div<{ $isCurrent?: boolean; $isFirstDay?: boolean }>`
  box-sizing: border-box;
  padding: 12px 16px;
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: 600;
  color: ${props => props.$isCurrent ? '#2196f3' : '#2d3748'};
  background: ${props => props.$isCurrent ? '#e3f2fd' : '#fff'};
  border-right: 1px solid #e0e0e0;
  line-height: 1.4;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
  position: relative;

  ${props => props.$isFirstDay && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 1px;
      background-color: #e0e0e0;
    }
  `}

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
  
  @media (max-width: 768px) {
    padding: 8px 6px;
    font-size: clamp(12px, 3vw, 14px);
    min-width: 90px;
    gap: 2px;
  }
`;

const RowsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: 100%;
`;

const TimeSlotRow = styled.div`
  display: grid;
  grid-template-columns: minmax(80px, 100px) repeat(6, minmax(120px, 1fr));
  border-bottom: 1px solid #e0e0e0;
  min-width: fit-content;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: minmax(60px, 80px) repeat(6, minmax(90px, 1fr));
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

const BreakIndicator = styled.div`
  background-color: #0060e6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  width: auto;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  height: 36px;
`;

const BreakRow = styled.div`
  display: grid;
  grid-template-columns: minmax(80px, 100px) repeat(6, minmax(120px, 1fr));
  min-width: fit-content;
  background-color:rgb(255, 255, 255);
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: minmax(60px, 80px) repeat(6, minmax(90px, 1fr));
  }
`;

const TimeCell = styled.div<{ $isCurrent?: boolean }>`
  box-sizing: border-box;
  position: relative;
  padding: 12px 16px;
  font-size: clamp(12px, 1.2vw, 13px);
  color: #4a5568;
  background: #fff;
  border-right: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  height: 100%;
  min-width: 80px;

  .start-time {
    display: block;
    font-weight: 600;
    color: ${props => props.$isCurrent ? '#2196f3' : '#2d3748'};
    margin-bottom: 2px;
    font-size: clamp(14px, 1.4vw, 16px);
  }

  .end-time {
    display: block;
    font-size: clamp(11px, 1.1vw, 12px);
    color: ${props => props.$isCurrent ? '#2196f3' : '#718096'};
  }
  
  @media (max-width: 768px) {
    padding: 8px 6px;
    min-width: 60px;
    
    .start-time {
      font-size: clamp(12px, 3vw, 14px);
      margin-bottom: 1px;
    }
    
    .end-time {
      font-size: clamp(10px, 2.5vw, 11px);
    }
  }
`;

const CoursesContainer = styled.div<{ $isCurrent?: boolean; $isFirstDay?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  background: ${props => props.$isCurrent ? '#e3f2fd' : '#fff'};
  min-height: 100px;
  position: relative;
  transition: all 0.2s ease-in-out;
  border-right: 1px solid #e0e0e0;
  min-width: 120px;
  height: 100%;

  ${props => props.$isFirstDay && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0px;
      bottom: 0;
      width: 1px;
      background-color: #e0e0e0;
      z-index: 1;
    }
  `}

  &:last-child {
    border-right: none;
  }

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
  
  @media (max-width: 768px) {
    min-width: 90px;
    min-height: 80px;
    padding: 3px;
    gap: 3px;
    
    &.tapped {
      padding-bottom: 20px;
      background: ${props => props.$isCurrent ? '#d4e9fc' : '#f5f9ff'};
      
      .add-button {
        opacity: 1;
        visibility: visible;
        animation: fadeIn 0.2s ease-in-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(5px) translateX(-50%);
        }
        to {
          opacity: 1;
          transform: translateY(0) translateX(-50%);
        }
      }
    }
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
  
  @media (max-width: 768px) {
    font-size: 0.55em;
    padding: 2px 4px;
    width: auto;
    min-width: 40%;
    max-width: 70%;
    left: 50%;
    transform: translateX(-50%);
    bottom: 3px;
    font-weight: 500;
    background: #a0a0a0;
    color: white;
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    white-space: nowrap;
    letter-spacing: -0.2px;
    
    &:active {
      background: #888888;
      transform: translateX(-50%) translateY(1px);
    }
  }
`;

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

interface DropTargetProps {
  timeSlot: TimeSlot;
  dayIndex: number;
  children: React.ReactNode;
  onMoveCourse: (course: Course, newTimeSlot: TimeSlot, newDayIndex: number) => void;
  $isCurrent?: boolean;
  $isFirstDay?: boolean;
}

const DropTarget: React.FC<DropTargetProps> = ({ timeSlot, dayIndex, children, onMoveCourse, $isCurrent, $isFirstDay }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COURSE',
    drop: (item: Course) => {
      onMoveCourse(item, timeSlot, dayIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  
  const [isTapped, setIsTapped] = useState(false);
  
  const handleTap = () => {
    setIsTapped(true);
    // Auto hide after 3 seconds
    setTimeout(() => {
      setIsTapped(false);
    }, 3000);
  };

  return (
    <CoursesContainer 
      ref={drop} 
      className={`${isOver ? 'can-drop' : ''} ${isTapped ? 'tapped' : ''}`}
      $isCurrent={$isCurrent}
      $isFirstDay={$isFirstDay}
      onClick={handleTap}
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
  const [currentBreak, setCurrentBreak] = useState<{ prevSlot: TimeSlot, nextSlot: TimeSlot, timeLeft: number } | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    const adjustedIndex = today === 0 ? null : today - 1; // Adjust for week starting Monday
    setCurrentDayIndex(adjustedIndex); // Highlight Mon-Sat (0-5)
  }, [weekDates]); // Recalculate when weekDates changes

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

  const checkIfInBreak = () => {
    const now = new Date();
    const [currentHour, currentMinute] = [now.getHours(), now.getMinutes()];
    const currentTotal = currentHour * 60 + currentMinute;
    
    for (let i = 0; i < DEFAULT_TIME_SLOTS.length - 1; i++) {
      const currentSlot = DEFAULT_TIME_SLOTS[i];
      const nextSlot = DEFAULT_TIME_SLOTS[i + 1];
      
      const [endHour, endMinute] = currentSlot.endTime.split(':').map(Number);
      const [nextStartHour, nextStartMinute] = nextSlot.startTime.split(':').map(Number);
      
      const endTotal = endHour * 60 + endMinute;
      const nextStartTotal = nextStartHour * 60 + nextStartMinute;
      
      if (currentTotal >= endTotal && currentTotal < nextStartTotal) {
        const timeLeft = nextStartTotal - currentTotal;
        return { prevSlot: currentSlot, nextSlot: nextSlot, timeLeft };
      }
    }
    
    return null;
  };

  useEffect(() => {
    const checkAndUpdateBreak = () => {
      setCurrentBreak(checkIfInBreak());
    };
    
    // Initial check
    checkAndUpdateBreak();
    
    const intervalId = setInterval(checkAndUpdateBreak, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <TimetableContainer>
        <TableWrapper>
          <Header>
            <HeaderCell></HeaderCell>
            {days.map((day, index) => (
              <HeaderCell 
                key={day} 
                $isCurrent={currentDayIndex === index}
                $isFirstDay={index === 0}
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
                      marginLeft: '-15px'
                    }}>• Сегодня</span>
                  )}
                </div>
              </HeaderCell>
            ))}
          </Header>
          <RowsWrapper>
            {DEFAULT_TIME_SLOTS.map((timeSlot, index) => {
              const isCurrentTime = isCurrentTimeSlot(timeSlot);
              
              return (
                <React.Fragment key={timeSlot.id}>
                  <TimeSlotRow>
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
                          $isFirstDay={dayIndex === 0}
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
                            {isMobile ? "+" : "+ Добавить занятие"}
                          </AddButton>
                        </DropTarget>
                      );
                    })}
                  </TimeSlotRow>
                  
                  {/* Break indicator between time slots */}
                  {currentBreak && 
                   index === DEFAULT_TIME_SLOTS.indexOf(currentBreak.prevSlot) && (
                    <BreakRow>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '5px 0' }}>
                        <BreakIndicator>
                          Сейчас идёт перерыв • До конца осталось {currentBreak.timeLeft} {
                            currentBreak.timeLeft === 1 ? 'минута' : 
                            currentBreak.timeLeft > 1 && currentBreak.timeLeft < 5 ? 'минуты' : 'минут'
                          }
                        </BreakIndicator>
                      </div>
                    </BreakRow>
                  )}
                </React.Fragment>
              );
            })}
          </RowsWrapper>
        </TableWrapper>
      </TimetableContainer>
    </DndProvider>
  );
}; 