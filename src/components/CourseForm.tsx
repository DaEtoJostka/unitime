import React, { useState, useEffect } from 'react';
import { Course, CourseType } from '../types/course';
import { TimeSlot } from '../types/timeSlots';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { TYPE_COLORS, TYPE_LABELS } from '../constants/courseTypes';
import { generateId } from '../utils/idGenerator';
import {
  FormContainer,
  Form,
  FormGroup,
  Label,
  Input,
  OptionIndicator,
  Button,
  DeleteButton,
  DuplicateButton,
  CustomSelectWrapper,
  SelectButton,
  OptionsList,
  OptionItem
} from '../styles/CourseFormStyles';

interface CourseFormProps {
  timeSlot?: TimeSlot;
  dayIndex?: number;
  course?: Course;
  onSubmit: (course: Course) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  timeSlot,
  dayIndex,
  course,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<Course> & { type: CourseType }>({
    title: '',
    type: 'lecture' as CourseType,
    location: '',
    professor: '',
    ...course,
  });

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (timeSlot && dayIndex !== undefined) {
      setFormData(prev => ({
        ...prev,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        dayOfWeek: dayIndex,
      }));
    }
  }, [timeSlot, dayIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: course?.id || generateId(),
      title: formData.title || '',
      type: formData.type,
      location: formData.location || '',
      professor: formData.professor || '',
      startTime: formData.startTime || '',
      endTime: formData.endTime || '',
      dayOfWeek: formData.dayOfWeek || 0,
    };
    onSubmit(newCourse);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="course-title">Название</Label>
          <Input
            id="course-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="course-type">Тип</Label>
          <CustomSelectWrapper>
            <SelectButton 
              type="button" 
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <OptionIndicator color={TYPE_COLORS[formData.type]} />
              {TYPE_LABELS[formData.type]}
            </SelectButton>
            
            <OptionsList $isOpen={isSelectOpen}>
              {(Object.entries(TYPE_COLORS) as [CourseType, string][]).map(([type, color]) => (
                <OptionItem
                  key={type}
                  $isSelected={type === formData.type}
                  onClick={() => {
                    handleChange({ target: { name: 'type', value: type } } as React.ChangeEvent<HTMLInputElement>);
                    setIsSelectOpen(false);
                  }}
                >
                  <OptionIndicator color={color} />
                  {TYPE_LABELS[type]}
                </OptionItem>
              ))}
            </OptionsList>
          </CustomSelectWrapper>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="course-location">Аудитория</Label>
          <Input
            id="course-location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="course-professor">Преподаватель</Label>
          <Input
            id="course-professor"
            name="professor"
            value={formData.professor}
            onChange={handleChange}
          />
        </FormGroup>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '10px', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center' 
        }}>
          <Button type="submit">
            {course ? 'Сохранить' : 'Добавить'}
          </Button>
          <Button type="button" onClick={onCancel} style={{ background: '#f5f5f5', color: '#666', border: '1px solid #ddd' }}>
            Отмена
          </Button>
          {course && (
            <>
              <DuplicateButton 
                type="button" 
                onClick={() => {
                  const newCourse = {
                    ...formData,
                    id: generateId(),
                  };
                  onSubmit(newCourse as Course);
                }}
              >
                Дублировать
              </DuplicateButton>
              <DeleteButton type="button" onClick={onDelete}>
                Удалить
              </DeleteButton>
            </>
          )}
        </div>
      </Form>
    </FormContainer>
  );
};
