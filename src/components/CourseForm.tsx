import React, { useState, useEffect } from 'react';
import { Course, CourseType } from '../types/course';
import { TimeSlot } from '../types/timeSlots';
import styled from 'styled-components';

const FormContainer = styled.div`
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const OptionIndicator = styled.span<{ color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${props => props.color};
  margin-right: 6px;
  vertical-align: middle;
  flex-shrink: 0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  min-height: 36px;
  background: #2196f3;
  color: white;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;

  &:hover {
    background: #1976d2;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    background: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const DeleteButton = styled(Button)`
  background: #f44336;
  color: white;
  border: 1px solid #f44336;
  margin-left: auto;

  &:hover {
    background: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DuplicateButton = styled(Button)`
  background: #4CAF50;
  color: white;
  border: 1px solid #4CAF50;
  margin-left: auto;

  &:hover {
    background: #45a049;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

// Создадим объект с цветами для типов занятий
const TYPE_COLORS = {
  lecture: '#ef5350',
  lab: '#13a4ec',
  practice: '#136dec',
  seminar: '#ab47bc',
  exam: '#ff9800'
};

// Добавим новые стили
const CustomSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OptionsList = styled.div<{ isOpen: boolean }>`
  position: absolute;
  width: 100%;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 100;
`;

const OptionItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.isSelected ? '#f5f5f5' : 'white'};

  &:hover {
    background: #f8f8f8;
  }
`;

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
      id: course?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
          <Label>Название</Label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Тип</Label>
          <CustomSelectWrapper>
            <SelectButton 
              type="button" 
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <OptionIndicator color={TYPE_COLORS[formData.type]} />
              {{
                lecture: 'Лекция',
                lab: 'Лабораторная',
                practice: 'Практика',
                seminar: 'Семинар',
                exam: 'Экзамен'
              }[formData.type]}
            </SelectButton>
            
            <OptionsList isOpen={isSelectOpen}>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <OptionItem
                  key={type}
                  isSelected={type === formData.type}
                  onClick={() => {
                    handleChange({ target: { name: 'type', value: type } } as any);
                    setIsSelectOpen(false);
                  }}
                >
                  <OptionIndicator color={color} />
                  {{
                    lecture: 'Лекция',
                    lab: 'Лабораторная',
                    practice: 'Практика',
                    seminar: 'Семинар',
                    exam: 'Экзамен'
                  }[type]}
                </OptionItem>
              ))}
            </OptionsList>
          </CustomSelectWrapper>
        </FormGroup>

        <FormGroup>
          <Label>Аудитория</Label>
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Преподаватель</Label>
          <Input
            name="professor"
            value={formData.professor}
            onChange={handleChange}
          />
        </FormGroup>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
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
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
