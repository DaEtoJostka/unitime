import React, { useState, useEffect } from 'react';
import { Course } from './types/course';
import { TimeSlot } from './types/timeSlots';
import { Timetable } from './components/Timetable';
import { CourseForm } from './components/CourseForm';
import styled from 'styled-components';
import { ScheduleTemplate } from './types/course';
import { v4 as uuidv4 } from 'uuid';
import { MdEdit, MdAdd, MdDelete, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { SelectNative } from './components/ui/select-native';

const AppContainer = styled.div<{ isSidebarCollapsed?: boolean }>`
  max-width: 100%;
  margin: 0;
  padding: 20px;
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
    gap: 10px;
    padding-top: ${props => props.isSidebarCollapsed ? '80px' : '10px'};
    margin-top: ${props => props.isSidebarCollapsed ? '0' : '0'};
  }
`;

const LogoArea = styled.div`
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
  gap: 0px;
  padding-top: 20px;
  
  @media (max-width: 768px) {
    height: 120px;
    margin-bottom: 10px;
    padding-top: 10px;
  }
`;

const LogoText = styled.div`
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(
    to right,
    #6a0dad, /* Deep purple */
    #9c27b0, /* Purple */
    #e91e63, /* Pink */
    #f44336, /* Red */
    #ff9800, /* Orange */
    #ffc107, /* Amber */
    #ffeb3b, /* Yellow */
    #cddc39, /* Yellowish Green */
    #8bc34a, /* Light green */
    #4caf50, /* Green */
    #009688, /* Teal */
    #03a9f4, /* Light blue */
    #2196f3, /* Blue */
    #3f51b5, /* Indigo */
    #6a0dad  /* Back to deep purple for seamless loop */
  );
  background-size: 1000% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 4px;
  animation: colorFlow 60s linear infinite;
  display: inline-block;

  @keyframes colorFlow {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 1000% center;
    }
  }

  @keyframes waveAnimation {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.4);
    }
  }

  &:hover {
    animation: colorFlow 60s linear infinite;
    text-shadow: 0 0 10px rgba(106, 13, 173, 0.3);
  }
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const LogoLetter = styled.span<{ index: number; isAnimating: boolean }>`
  display: inline-block;
  animation: ${props => props.isAnimating ? 'waveAnimation 0.6s ease' : 'none'};
  animation-delay: ${props => props.isAnimating ? `${props.index * 0.07}s` : '0s'};
  animation-fill-mode: forwards;
  background: inherit;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const AuthorLink = styled.a`
  font-size: 14px;
  color:rgb(89, 27, 165); /* Dark purple color */
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 0px;
  font-weight: 500;

  &:hover {
    transform: scale(1.05);
    color: #7b1fa2; /* Slightly lighter purple on hover */
    text-shadow: 0 0 5px rgba(74, 20, 140, 0.3);
  }
`;

const SidebarContainer = styled.div<{ collapsed: boolean }>`
  width: ${props => props.collapsed ? '48px' : '280px'};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  background: white;
  border-radius: 12px;
  padding: ${props => props.collapsed ? '12px 6px' : '12px'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 40px);

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    width: ${props => props.collapsed ? '0' : '100%'};
    height: ${props => props.collapsed ? '0' : 'auto'};
    max-height: ${props => props.collapsed ? '0' : '300px'};
    opacity: ${props => props.collapsed ? '0' : '1'};
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    position: relative;
    padding: ${props => props.collapsed ? '0' : '12px'};
    margin: ${props => props.collapsed ? '0' : '0 0 10px 0'};
    border-radius: 12px;
    pointer-events: ${props => props.collapsed ? 'none' : 'auto'};
    visibility: ${props => props.collapsed ? 'hidden' : 'visible'};
  }
`;

const SidebarContent = styled.div<{ collapsed: boolean }>`
  opacity: ${props => props.collapsed ? 0 : 1};
  transform: ${props => props.collapsed ? 'translateX(-20px)' : 'translateX(0)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.collapsed ? '0s' : '0.1s'};
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding-right: ${props => props.collapsed ? '0' : '8px'};
  height: 100%;

  /* Customize scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #ccc;
  }
  
  @media (max-width: 768px) {
    transform: ${props => props.collapsed ? 'translateY(-20px)' : 'translateY(0)'};
    padding-right: 0;
    overflow-y: auto;
    height: 100%;
    width: 100%;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  width: 100%;
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    width: 90%;
    max-width: none;
    padding: 15px;
    max-height: 80vh;
  }
`;

const ActionButton = styled.button<{ variant: 'primary' | 'success' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  min-height: 36px;
  width: 100%;
  background: ${props => props.variant === 'danger' ? '#fff' : '#f8f9fa'};
  color: ${props => 
    props.variant === 'primary' ? '#2196f3' :
    props.variant === 'success' ? '#4CAF50' :
    '#f44336'};
  border: 1px solid;
  border-color: ${props => 
    props.variant === 'primary' ? '#2196f3' :
    props.variant === 'success' ? '#4CAF50' :
    '#f44336'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;

  &:hover {
    background: ${props => 
      props.variant === 'primary' ? '#e3f2fd' :
      props.variant === 'success' ? '#e8f5e9' :
      '#ffebee'};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 18px;
    color: inherit;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 44px;
    font-size: 16px;
    justify-content: center;
  }
`;

const SaveNotification = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  z-index: 2000;

  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  min-height: 36px;
  background: #f8f9fa;
  color: #2196f3;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;

  &:hover {
    background: #e3f2fd;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 18px;
    color: inherit;
  }
`;

const ImportDropZone = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? '#2196f3' : '#e0e0e0'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: ${props => props.$isDragOver ? 'rgba(33, 150, 243, 0.1)' : '#f8f9fa'};
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    border-color: #2196f3;
    background: rgba(33, 150, 243, 0.1);
  }
`;

const SidebarToggleButton = styled.button<{ collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: ${props => props.collapsed ? '8px' : '10px 16px'};
  min-height: 36px;
  background: #f8f9fa;
  color: #2196f3;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1;
  width: ${props => props.collapsed ? '36px' : '100%'};
  height: ${props => props.collapsed ? 'calc(100vh - 40px - 24px)' : 'auto'};
  box-sizing: border-box;

  &:hover {
    background: #e3f2fd;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 18px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${props => props.collapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
    color: #2196f3;
  }
  
  @media (max-width: 768px) {
    width: ${props => props.collapsed ? '60px' : '100%'};
    height: ${props => props.collapsed ? '60px' : 'auto'};
    min-height: ${props => props.collapsed ? '60px' : '44px'};
    min-width: ${props => props.collapsed ? '60px' : 'auto'};
    padding: ${props => props.collapsed ? '12px' : '12px'};
    margin: 0;
    
    svg {
      transform: ${props => props.collapsed ? 'rotate(90deg)' : 'rotate(-90deg)'};
      font-size: ${props => props.collapsed ? '32px' : '24px'};
    }
    
    .toggle-text {
      display: none;
    }
  }
`;

const MobileToggleButton = styled.button`
  display: none; /* Hidden by default on desktop */
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    right: 10px;
    width: 70px;
    height: 70px;
    border-radius: 0 0 12px 12px;
    background: white;
    color: #2196f3;
    border: 2px solid #2196f3;
    border-top: none;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    z-index: 100;
    cursor: pointer;
    margin: 0;
    padding: 0;
    transition: all 0.2s ease;
    
    svg {
      font-size: 36px;
    }
    
    &:active {
      background-color: #e3f2fd;
      transform: translateY(2px);
    }
  }
`;

export const App: React.FC = () => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>(() => {
    try {
      const savedData = localStorage.getItem('scheduleData');
      if (savedData) {
        const { templates } = JSON.parse(savedData);
        return templates.length ? templates : [{
          id: 'default',
          name: 'Основное расписание',
          courses: []
        }];
      }
      // Для обратной совместимости с предыдущей версией
      const oldTemplates = localStorage.getItem('scheduleTemplates');
      return oldTemplates ? JSON.parse(oldTemplates) : [{
        id: 'default',
        name: 'Основное расписание',
        courses: []
      }];
    } catch (error) {
      console.error('Ошибка загрузки из localStorage:', error);
      return [{
        id: 'default',
        name: 'Основное расписание',
        courses: []
      }];
    }
  });
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(() => {
    try {
      const savedData = localStorage.getItem('scheduleData');
      return savedData ? JSON.parse(savedData).currentTemplateId : 'default';
    } catch (error) {
      console.error('Ошибка загрузки текущего шаблона:', error);
      return 'default';
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | undefined>();
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editedTemplateName, setEditedTemplateName] = useState('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const savedData = localStorage.getItem('scheduleData');
      return savedData ? JSON.parse(savedData).isSidebarCollapsed || false : false;
    } catch (error) {
      console.error('Ошибка загрузки состояния боковой панели:', error);
      return false;
    }
  });
  const [isWaveAnimating, setIsWaveAnimating] = useState(false);

  const currentCourses = templates.find(t => t.id === currentTemplateId)?.courses || [];

  useEffect(() => {
    try {
      // Get existing data to preserve sidebar state
      const existingData = localStorage.getItem('scheduleData');
      const parsedData = existingData ? JSON.parse(existingData) : {};
      
      // Create updated data with template changes but preserving sidebar state
      const updatedData = {
        ...parsedData,
        templates,
        currentTemplateId
      };
      
      localStorage.setItem('scheduleData', JSON.stringify(updatedData));
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
      alert('Не удалось сохранить данные. Возможно, недостаточно места в хранилище.');
    }
  }, [templates, currentTemplateId]);

  // Separate useEffect for saving sidebar state without showing notification
  useEffect(() => {
    try {
      // Get existing data
      const existingData = localStorage.getItem('scheduleData');
      const parsedData = existingData ? JSON.parse(existingData) : {};
      
      // Update only the sidebar state without showing notification
      const updatedData = {
        ...parsedData,
        isSidebarCollapsed
      };
      
      localStorage.setItem('scheduleData', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Ошибка сохранения состояния боковой панели:', error);
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (showSaveNotification) {
      const timer = setTimeout(() => {
        setShowSaveNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaveNotification]);

  const handleAddCourse = (timeSlot: TimeSlot, dayIndex: number) => {
    setSelectedTimeSlot(timeSlot);
    setSelectedDayIndex(dayIndex);
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleSubmit = (course: Course) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === currentTemplateId) {
        const isDuplicate = selectedCourse && course.id !== selectedCourse.id;
        
        const courses = isDuplicate 
          ? [...template.courses, course] 
          : selectedCourse
            ? template.courses.map(c => c.id === selectedCourse.id ? course : c)
            : [...template.courses, course];
            
        return { ...template, courses };
      }
      return template;
    }));
    setIsModalOpen(false);
    resetModal();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetModal();
  };

  const resetModal = () => {
    setSelectedTimeSlot(undefined);
    setSelectedDayIndex(undefined);
    setSelectedCourse(undefined);
  };

  const createNewTemplate = () => {
    const newTemplate: ScheduleTemplate = {
      id: uuidv4(),
      name: `Новый шаблон (${templates.length + 1})`,
      courses: []
    };
    setTemplates(prev => [...prev, newTemplate]);
    setCurrentTemplateId(newTemplate.id);
  };

  const deleteCurrentTemplate = () => {
    if (templates.length > 1) {
      setTemplates(prev => {
        const updatedTemplates = prev.filter(t => t.id !== currentTemplateId);
        const newCurrentId = updatedTemplates[0]?.id || 'default';
        setCurrentTemplateId(newCurrentId);
        return updatedTemplates;
      });
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTemplateId(e.target.value);
  };

  const handleMoveCourse = (course: Course, newTimeSlot: TimeSlot, newDayIndex: number) => {
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
  };

  const startEditingTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditingTemplateId(templateId);
      setEditedTemplateName(template.name);
    }
  };

  const saveTemplateName = () => {
    if (!editedTemplateName.trim()) return;
    
    setTemplates(prev => prev.map(template => 
      template.id === editingTemplateId 
        ? { ...template, name: editedTemplateName.trim() }
        : template
    ));
    setEditingTemplateId(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === currentTemplateId) {
        return {
          ...template,
          courses: template.courses.filter(c => c.id !== courseId)
        };
      }
      return template;
    }));
    setIsModalOpen(false);
    resetModal();
  };

  const handleExportTemplate = async (template: ScheduleTemplate) => {
    try {
      const exportData = JSON.stringify({
        ...template,
        courses: template.courses.map(course => ({
          ...course,
        }))
      }, null, 2);

      // Create a blob and download the file
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
      setTimeout(() => setShowSaveNotification(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Не удалось экспортировать шаблон');
    }
  };

  const handleImportTemplate = (jsonData: string) => {
    try {
      const template = JSON.parse(jsonData);
      if (!template.name || !template.courses) {
        throw new Error('Неверный формат шаблона');
      }
      
      const newTemplate = {
        ...template,
        id: uuidv4(),
        name: templates.some(t => t.name === template.name) 
          ? `${template.name} (импортировано)`
          : template.name
      };

      setTemplates(prev => [...prev, newTemplate]);
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
    } catch (error) {
      console.error('Import error:', error);
      alert('Неверный формат файла шаблона');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          handleImportTemplate(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Пожалуйста, перетащите валидный JSON файл');
    }
  };

  const handleLogoClick = () => {
    if (!isWaveAnimating) {
      setIsWaveAnimating(true);
      setTimeout(() => setIsWaveAnimating(false), 1200);
    }
  };

  return (
    <AppContainer isSidebarCollapsed={isSidebarCollapsed}>
      <SidebarContainer collapsed={isSidebarCollapsed}>
        <SidebarContent collapsed={isSidebarCollapsed}>
          {!isSidebarCollapsed && (
            <>
              <LogoArea>
                <LogoText onClick={handleLogoClick}>
                  <LogoLetter index={0} isAnimating={isWaveAnimating}>U</LogoLetter>
                  <LogoLetter index={1} isAnimating={isWaveAnimating}>n</LogoLetter>
                  <LogoLetter index={2} isAnimating={isWaveAnimating}>i</LogoLetter>
                  <LogoLetter index={3} isAnimating={isWaveAnimating}>T</LogoLetter>
                  <LogoLetter index={4} isAnimating={isWaveAnimating}>i</LogoLetter>
                  <LogoLetter index={5} isAnimating={isWaveAnimating}>m</LogoLetter>
                  <LogoLetter index={6} isAnimating={isWaveAnimating}>e</LogoLetter>
                </LogoText>
                <AuthorLink 
                  href="https://github.com/DaEtoJostka"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ cursor: 'pointer', marginTop: '0px' }}
                >
                  by 👾 Karlov Ivan
                </AuthorLink>
                <div style={{ width: '100%', position: 'relative', marginTop: '30px' }}>
                  <SelectNative
                    id="template-select"
                    value={currentTemplateId}
                    onChange={handleTemplateChange}
                    style={{ fontWeight: 600 }}
                  >
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </SelectNative>
                  
                  {editingTemplateId === currentTemplateId && (
                    <input
                      value={editedTemplateName}
                      onChange={(e) => setEditedTemplateName(e.target.value)}
                      onBlur={saveTemplateName}
                      onKeyPress={(e) => e.key === 'Enter' && saveTemplateName()}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        padding: '8px 12px',
                        border: '2px solid #2196f3',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        fontWeight: 600
                      }}
                      autoFocus
                    />
                  )}
                </div>
              </LogoArea>
              
              <ActionButtonsContainer>
                <ActionButton 
                  variant="primary"
                  onClick={() => startEditingTemplate(currentTemplateId)}
                >
                  <MdEdit /> Переименовать
                </ActionButton>
                
                <ActionButton 
                  variant="success"
                  onClick={createNewTemplate}
                >
                  <MdAdd /> Новый шаблон
                </ActionButton>
                
                {templates.length > 1 && (
                  <ActionButton
                    variant="danger"
                    onClick={deleteCurrentTemplate}
                  >
                    <MdDelete /> Удалить шаблон
                  </ActionButton>
                )}

                <Button
                  onClick={() => {
                    const currentTemplate = templates.find(t => t.id === currentTemplateId);
                    if (currentTemplate?.courses.length) {
                      handleExportTemplate(currentTemplate);
                    } else {
                      alert('Невозможно экспортировать пустой шаблон');
                    }
                  }}
                  title="Экспорт текущего шаблона"
                  disabled={!currentCourses.length}
                  style={{ width: '100%' }}
                >
                  📤 Экспорт
                </Button>

                <ImportDropZone
                  $isDragOver={dragOver}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <span>📥 Перетащите файл шаблона сюда или нажмите для выбора</span>
                </ImportDropZone>
                
                <input
                  id="import-file"
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          handleImportTemplate(ev.target.result as string);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />

                <SidebarToggleButton 
                  collapsed={false}
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                  <MdChevronLeft /> <span className="toggle-text">Свернуть панель</span>
                </SidebarToggleButton>
              </ActionButtonsContainer>
            </>
          )}
        </SidebarContent>
        {/* Show normal button on desktop, but hide on mobile */}
        {isSidebarCollapsed && (
          <div className="desktop-only">
            <SidebarToggleButton 
              collapsed={true} 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              <MdChevronRight />
            </SidebarToggleButton>
          </div>
        )}
      </SidebarContainer>
      
      {/* Add the mobile toggle button that's fixed at the top */}
      {isSidebarCollapsed && (
        <MobileToggleButton onClick={() => setIsSidebarCollapsed(false)}>
          <MdChevronRight />
        </MobileToggleButton>
      )}
      
      <MainContent>
        <Timetable
          key={currentTemplateId}
          courses={currentCourses}
          onAddCourse={handleAddCourse}
          onEditCourse={handleEditCourse}
          onMoveCourse={handleMoveCourse}
        />
      </MainContent>

      {isModalOpen && (
        <Modal>
          <ModalContent>
            <CourseForm
              timeSlot={selectedTimeSlot}
              dayIndex={selectedDayIndex}
              course={selectedCourse}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onDelete={selectedCourse ? () => handleDeleteCourse(selectedCourse.id) : undefined}
            />
          </ModalContent>
        </Modal>
      )}

      {showSaveNotification && (
        <SaveNotification>
          Изменения сохранены ✓
        </SaveNotification>
      )}
    </AppContainer>
  );
}; 