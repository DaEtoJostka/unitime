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
import calendarIcon from './assets/calendar-icon.png';

const AppContainer = styled.div`
  max-width: 100%;
  margin: 0;
  padding: 20px;
  display: flex;
  gap: 20px;
`;

const LogoArea = styled.div`
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 0px;
`;

const LogoText = styled.div`
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(
    to right,
    #2196f3,
    #00bcd4,
    #2196f3
  );
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  transition: all 0.3s ease;
  cursor: pointer;

  @keyframes flow {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  &:hover {
    transform: scale(1.1);
    animation: flow 3s linear infinite;
    text-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
  }
`;

const LoveText = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  text-align: center;
`;

const AuthorLink = styled.a`
  font-size: 12px;
  color: #2196f3;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-top: 2px;

  &:hover {
    color: #0d47a1;
    text-decoration: underline;
  }
`;

const LogoImage = styled.img`
  width: 140px;
  height: 140px;
  object-fit: contain;
`;

const SidebarContainer = styled.div<{ collapsed: boolean }>`
  width: ${props => props.collapsed ? '48px' : '280px'};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
`;

const SidebarContent = styled.div<{ collapsed: boolean }>`
  opacity: ${props => props.collapsed ? 0 : 1};
  transform: ${props => props.collapsed ? 'translateX(-20px)' : 'translateX(0)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.collapsed ? '0s' : '0.1s'};
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding-right: ${props => props.collapsed ? '0' : '8px'};

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
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
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
  background: #f8f9fa;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  margin-top: auto;
  width: ${props => props.collapsed ? '36px' : '100%'};
  height: 36px;
  margin-left: ${props => props.collapsed ? 'auto' : '0'};
  margin-right: ${props => props.collapsed ? 'auto' : '0'};
  
  &:hover {
    background: #e3f2fd;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${props => props.collapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
    color: #2196f3;
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currentCourses = templates.find(t => t.id === currentTemplateId)?.courses || [];

  useEffect(() => {
    const saveData = {
      templates,
      currentTemplateId
    };

    try {
      localStorage.setItem('scheduleData', JSON.stringify(saveData));
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
      alert('Не удалось сохранить данные. Возможно, недостаточно места в хранилище.');
    }
  }, [templates, currentTemplateId]);

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

  return (
    <AppContainer>
      <SidebarContainer collapsed={isSidebarCollapsed}>
        <SidebarContent collapsed={isSidebarCollapsed}>
          {!isSidebarCollapsed && (
            <>
              <LogoArea>
                <LogoImage 
                  src={calendarIcon}
                  alt="UniTime Calendar"
                  onError={(e) => {
                    console.error('Error loading image:', e);
                    const img = e.target as HTMLImageElement;
                    console.log('Attempted to load:', img.src);
                  }}
                />
                <LogoText>UniTime</LogoText>
                <LoveText>Сделано с любовью ❤️</LoveText>
                <AuthorLink 
                  href="https://github.com/DaEtoJostka"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ cursor: 'pointer' }}
                >
                  by Karlov Ivan
                </AuthorLink>
              </LogoArea>
              
              <div style={{ position: 'relative', width: '100%' }}>
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
              </ActionButtonsContainer>
            </>
          )}
        </SidebarContent>
        <SidebarToggleButton onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </SidebarToggleButton>
      </SidebarContainer>
      
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