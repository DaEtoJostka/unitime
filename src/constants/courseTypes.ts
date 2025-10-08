import { CourseType } from '../types/course';

export const TYPE_COLORS: Record<CourseType, string> = {
  lecture: '#ef5350',
  lab: '#13a4ec',
  practice: '#136dec',
  seminar: '#ab47bc',
  exam: '#ff9800'
};

export const TYPE_LABELS: Record<CourseType, string> = {
  lecture: 'Лекция',
  lab: 'Лабораторная',
  practice: 'Практика',
  seminar: 'Семинар',
  exam: 'Экзамен'
};

export const TYPE_BACKGROUNDS: Record<CourseType, string> = {
  lecture: '#ffebee',
  lab: 'rgba(19, 164, 236, 0.1)',
  practice: 'rgba(19, 109, 236, 0.1)',
  seminar: '#f3e5f5',
  exam: '#fff3e0'
};

export const TYPE_BACKGROUNDS_ACTIVE: Record<CourseType, string> = {
  lecture: '#ffcdd2',
  lab: 'rgba(19, 164, 236, 0.2)',
  practice: 'rgba(19, 109, 236, 0.2)',
  seminar: '#e1bee7',
  exam: '#ffe0b2'
};

