import React, { useState } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Course } from '../types/course';
import { TimeSlot, DEFAULT_TIME_SLOTS } from '../types/timeSlots';
import { CourseBlock } from './CourseBlock';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useWeekDates } from '../hooks/useWeekDates';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { isCurrentTimeSlot, getMinutesLabel } from '../utils/timeUtils';
import {
  TimetableContainer,
  TableWrapper,
  Header,
  HeaderCell,
  RowsWrapper,
  TimeSlotRow,
  CurrentTimeIndicator,
  BreakIndicator,
  BreakRow,
  TimeCell,
  CoursesContainer,
  AddButton
} from '../styles/TimetableStyles';

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

interface DropTargetProps {
  timeSlot: TimeSlot;
  dayIndex: number;
  children: React.ReactNode;
  onMoveCourse: (course: Course, newTimeSlot: TimeSlot, newDayIndex: number) => void;
  $isCurrent?: boolean;
  $isFirstDay?: boolean;
}

const DropTarget: React.FC<DropTargetProps> = ({ 
  timeSlot, 
  dayIndex, 
  children, 
  onMoveCourse, 
  $isCurrent, 
  $isFirstDay 
}) => {
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
  const weekDates = useWeekDates();
  const { currentDayIndex, currentBreak } = useCurrentTime();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const getCoursesForSlot = (timeSlot: TimeSlot, dayIndex: number) => {
    return courses.filter(
      course => 
        course.startTime === timeSlot.startTime &&
        course.dayOfWeek === dayIndex
    );
  };

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
                  
                  {currentBreak && 
                   index === DEFAULT_TIME_SLOTS.indexOf(currentBreak.prevSlot) && (
                    <BreakRow>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '5px 0' }}>
                        <BreakIndicator>
                          Сейчас идёт перерыв • До конца осталось {currentBreak.timeLeft} {getMinutesLabel(currentBreak.timeLeft)}
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
