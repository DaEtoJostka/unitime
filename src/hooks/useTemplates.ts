import { useState, useEffect, useCallback } from 'react';
import { ScheduleTemplate, Course } from '../types/course';
import { TimeSlot } from '../types/timeSlots';
import { generateId } from '../utils/idGenerator';

interface ScheduleData {
  templates: ScheduleTemplate[];
  currentTemplateId: string;
  isSidebarCollapsed: boolean;
}

const STORAGE_KEY = 'scheduleData';

const getDefaultTemplate = (): ScheduleTemplate => ({
  id: 'default',
  name: 'Основное расписание',
  courses: []
});

const loadFromStorage = (): ScheduleData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const { templates, currentTemplateId, isSidebarCollapsed } = JSON.parse(savedData);
      return {
        templates: templates.length ? templates : [getDefaultTemplate()],
        currentTemplateId: currentTemplateId || 'default',
        isSidebarCollapsed: isSidebarCollapsed || false
      };
    }
    
    // Backward compatibility with old storage format
    const oldTemplates = localStorage.getItem('scheduleTemplates');
    if (oldTemplates) {
      return {
        templates: JSON.parse(oldTemplates),
        currentTemplateId: 'default',
        isSidebarCollapsed: false
      };
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  
  return {
    templates: [getDefaultTemplate()],
    currentTemplateId: 'default',
    isSidebarCollapsed: false
  };
};

export const useTemplates = () => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>(() => loadFromStorage().templates);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(() => loadFromStorage().currentTemplateId);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => loadFromStorage().isSidebarCollapsed);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      const data: ScheduleData = {
        templates,
        currentTemplateId,
        isSidebarCollapsed
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      alert('Не удалось сохранить данные. Возможно, недостаточно места в хранилище.');
    }
  }, [templates, currentTemplateId, isSidebarCollapsed]);

  // Auto-hide save notification
  useEffect(() => {
    if (showSaveNotification) {
      const timer = setTimeout(() => {
        setShowSaveNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaveNotification]);

  const currentTemplate = templates.find(t => t.id === currentTemplateId);
  const currentCourses = currentTemplate?.courses || [];

  const addCourse = useCallback((course: Course) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === currentTemplateId) {
        return { ...template, courses: [...template.courses, course] };
      }
      return template;
    }));
    setShowSaveNotification(true);
  }, [currentTemplateId]);

  const updateCourse = useCallback((course: Course) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === currentTemplateId) {
        return {
          ...template,
          courses: template.courses.map(c => c.id === course.id ? course : c)
        };
      }
      return template;
    }));
    setShowSaveNotification(true);
  }, [currentTemplateId]);

  const deleteCourse = useCallback((courseId: string) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === currentTemplateId) {
        return {
          ...template,
          courses: template.courses.filter(c => c.id !== courseId)
        };
      }
      return template;
    }));
    setShowSaveNotification(true);
  }, [currentTemplateId]);

  const moveCourse = useCallback((course: Course, newTimeSlot: TimeSlot, newDayIndex: number) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === currentTemplateId) {
        return {
          ...template,
          courses: template.courses.map(c =>
            c.id === course.id
              ? { ...c, startTime: newTimeSlot.startTime, endTime: newTimeSlot.endTime, dayOfWeek: newDayIndex }
              : c
          )
        };
      }
      return template;
    }));
    setShowSaveNotification(true);
  }, [currentTemplateId]);

  const createTemplate = useCallback(() => {
    const newTemplate: ScheduleTemplate = {
      id: generateId(),
      name: `Новый шаблон (${templates.length + 1})`,
      courses: []
    };
    setTemplates(prev => [...prev, newTemplate]);
    setCurrentTemplateId(newTemplate.id);
    setShowSaveNotification(true);
  }, [templates.length]);

  const deleteTemplate = useCallback(() => {
    if (templates.length > 1) {
      setTemplates(prev => {
        const updatedTemplates = prev.filter(t => t.id !== currentTemplateId);
        const newCurrentId = updatedTemplates[0]?.id || 'default';
        setCurrentTemplateId(newCurrentId);
        return updatedTemplates;
      });
      setShowSaveNotification(true);
    }
  }, [templates.length, currentTemplateId]);

  const renameTemplate = useCallback((templateId: string, newName: string) => {
    if (!newName.trim()) return;
    
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, name: newName.trim() }
        : template
    ));
    setShowSaveNotification(true);
  }, []);

  const exportTemplate = useCallback((template: ScheduleTemplate) => {
    try {
      const exportData = JSON.stringify(template, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Не удалось экспортировать шаблон');
    }
  }, []);

  const importTemplate = useCallback((jsonData: string) => {
    try {
      const template = JSON.parse(jsonData);
      if (!template.name || !template.courses) {
        throw new Error('Неверный формат шаблона');
      }
      
      const newTemplate: ScheduleTemplate = {
        ...template,
        id: generateId(),
        name: templates.some(t => t.name === template.name) 
          ? `${template.name} (импортировано)`
          : template.name
      };

      setTemplates(prev => [...prev, newTemplate]);
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Import error:', error);
      alert('Неверный формат файла шаблона');
    }
  }, [templates]);

  return {
    templates,
    currentTemplateId,
    currentTemplate,
    currentCourses,
    isSidebarCollapsed,
    showSaveNotification,
    setCurrentTemplateId,
    setIsSidebarCollapsed,
    addCourse,
    updateCourse,
    deleteCourse,
    moveCourse,
    createTemplate,
    deleteTemplate,
    renameTemplate,
    exportTemplate,
    importTemplate
  };
};

