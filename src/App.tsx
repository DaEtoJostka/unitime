import React, { useState } from 'react';
import { Course } from './types/course';
import { TimeSlot } from './types/timeSlots';
import { Timetable } from './components/Timetable';
import { CourseForm } from './components/CourseForm';
import { MdEdit, MdAdd, MdDelete, MdChevronLeft, MdChevronRight, MdSettings } from 'react-icons/md';
import { SelectNative } from './components/ui/select-native';
import { useTemplates } from './hooks/useTemplates';
import { ApiKeySettings, getStoredApiKey } from './components/ApiKeySettings';
import {
  AppContainer,
  LogoArea,
  LogoText,
  LogoLetter,
  AuthorLink,
  SidebarContainer,
  SidebarContent,
  ActionButtonsContainer,
  MainContent,
  Modal,
  ModalContent,
  ActionButton,
  SaveNotification,
  Button,
  ImportDropZone,
  SidebarToggleButton,
  MobileToggleButton
} from './styles/AppStyles';

export const App: React.FC = () => {
  const {
    templates,
    currentTemplateId,
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
    importTemplate,
    importPdfTemplate
  } = useTemplates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | undefined>();
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editedTemplateName, setEditedTemplateName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isWaveAnimating, setIsWaveAnimating] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [isDocumentProcessing, setIsDocumentProcessing] = useState(false);

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
    const isDuplicate = selectedCourse && course.id !== selectedCourse.id;

    if (isDuplicate) {
      addCourse(course);
    } else if (selectedCourse) {
      updateCourse(course);
    } else {
      addCourse(course);
    }

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

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTemplateId(e.target.value);
  };

  const startEditingTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditingTemplateId(templateId);
      setEditedTemplateName(template.name);
    }
  };

  const saveTemplateName = () => {
    if (editingTemplateId && editedTemplateName.trim()) {
      renameTemplate(editingTemplateId, editedTemplateName);
      setEditingTemplateId(null);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse(courseId);
    setIsModalOpen(false);
    resetModal();
  };

  const handleExportTemplate = () => {
    const currentTemplate = templates.find(t => t.id === currentTemplateId);
    if (currentTemplate?.courses.length) {
      exportTemplate(currentTemplate);
    } else {
      alert('Невозможно экспортировать пустой шаблон');
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
          importTemplate(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Пожалуйста, перетащите валидный JSON файл');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          importTemplate(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogoClick = () => {
    if (!isWaveAnimating) {
      setIsWaveAnimating(true);
      setTimeout(() => setIsWaveAnimating(false), 1200);
    }
  };

  const handleDocumentImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting the same file again
    e.target.value = '';

    const apiKey = getStoredApiKey();
    if (!apiKey) {
      alert('Пожалуйста, сначала настройте API ключ в настройках');
      setShowApiSettings(true);
      return;
    }

    setIsDocumentProcessing(true);
    try {
      const result = await importPdfTemplate(file, apiKey);
      if (result.success) {
        alert('Файл успешно импортирован!');
      } else {
        alert(`Ошибка импорта: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Schedule import error:', error);
      alert('Произошла ошибка при импорте файла');
    } finally {
      setIsDocumentProcessing(false);
    }
  };

  return (
    <AppContainer $isSidebarCollapsed={isSidebarCollapsed}>
      <SidebarContainer $collapsed={isSidebarCollapsed}>
        <SidebarContent $collapsed={isSidebarCollapsed}>
          {!isSidebarCollapsed && (
            <>
              <LogoArea>
                <LogoText onClick={handleLogoClick}>
                  <LogoLetter index={0} $isAnimating={isWaveAnimating}>U</LogoLetter>
                  <LogoLetter index={1} $isAnimating={isWaveAnimating}>n</LogoLetter>
                  <LogoLetter index={2} $isAnimating={isWaveAnimating}>i</LogoLetter>
                  <LogoLetter index={3} $isAnimating={isWaveAnimating}>T</LogoLetter>
                  <LogoLetter index={4} $isAnimating={isWaveAnimating}>i</LogoLetter>
                  <LogoLetter index={5} $isAnimating={isWaveAnimating}>m</LogoLetter>
                  <LogoLetter index={6} $isAnimating={isWaveAnimating}>e</LogoLetter>
                </LogoText>
                <AuthorLink
                  href="https://github.com/DaEtoJostka"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ cursor: 'pointer', marginTop: '0px' }}
                >
                  by 👾Ivan, 👀Alex and 🌚Den
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
                  onClick={createTemplate}
                >
                  <MdAdd /> Новый шаблон
                </ActionButton>

                <Button
                  onClick={() => document.getElementById('import-schedule-file')?.click()}
                  title="Импорт расписания из PDF или изображения с помощью AI"
                  style={{ width: '100%' }}
                  disabled={isDocumentProcessing}
                >
                  {isDocumentProcessing ? '⏳ Обработка...' : '📄 Импорт файла (PDF/JPG/PNG)'}
                </Button>

                <input
                  id="import-schedule-file"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={handleDocumentImport}
                />

                {templates.length > 1 && (
                  <ActionButton
                    variant="danger"
                    onClick={deleteTemplate}
                  >
                    <MdDelete /> Удалить шаблон
                  </ActionButton>
                )}

                <Button
                  onClick={handleExportTemplate}
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
                  onChange={handleFileImport}
                />

                <ActionButton
                  variant="primary"
                  onClick={() => setShowApiSettings(true)}
                  title="Настройки API"
                  style={{ width: '100%' }}
                >
                  <MdSettings /> Настройки
                </ActionButton>

                <SidebarToggleButton
                  $collapsed={false}
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                  <MdChevronLeft /> <span className="toggle-text">Свернуть панель</span>
                </SidebarToggleButton>
              </ActionButtonsContainer>
            </>
          )}
        </SidebarContent>
        {isSidebarCollapsed && (
          <div className="desktop-only">
            <SidebarToggleButton
              $collapsed={true}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              <MdChevronRight />
            </SidebarToggleButton>
          </div>
        )}
      </SidebarContainer>

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
          onMoveCourse={moveCourse}
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

      {showApiSettings && (
        <ApiKeySettings onClose={() => setShowApiSettings(false)} />
      )}
    </AppContainer>
  );
};
