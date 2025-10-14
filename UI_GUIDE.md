# PDF Import Feature - UI Guide

## 🎨 User Interface Changes

### Sidebar Layout (Before vs After)

#### BEFORE:
```
┌─────────────────────────┐
│    UniTime              │
│    by 👾Ivan and 👀Sergey│
│                         │
│    [Template Select ▼] │
│                         │
│    [Переименовать]      │
│    [Новый шаблон]       │
│    [Удалить шаблон]     │
│    [📤 Экспорт]         │
│                         │
│    [📥 Import Zone]     │
│                         │
│    [Свернуть панель]    │
└─────────────────────────┘
```

#### AFTER:
```
┌─────────────────────────┐
│  UniTime                │
│  by 👾Ivan and 👀Sergey  │
│                         │
│  [Template Select ▼]    │
│                         │
│  [Переименовать]        │
│  [Новый шаблон]         │
│  [📄 Импорт из PDF]     │  ← NEW: PDF import button
│  [Удалить шаблон]       │
│  [📤 Экспорт]           │
│                         │
│  [📥 Import Zone]       │
│                         │
│  [⚙️ Настройки]         │  ← NEW: Settings button
│  [Свернуть панель]      │
└─────────────────────────┘
```

### New Components

#### 1. API Key Settings Modal
```
┌──────────────────────────────────────────┐
│  Настройки API                      [✕]  │
│                                          │
│  Для импорта PDF-файлов требуется API    │
│  ключ Google AI. Получите бесплатный     │
│  ключ на Google AI Studio                │
│                                          │
│  Google AI API Key                       │
│  [●●●●●●●●●●●●●●●●●●●●●●●●●●]  [👁️]    │
│                                          │
│  [  Очистить  ]  [  Сохранить  ]        │
└──────────────────────────────────────────┘
```

#### 2. Loading State
When processing PDF:
```
┌─────────────────────────┐
│  [⏳ Обработка...]      │  ← Button shows loading
└─────────────────────────┘
```

Normal state:
```
┌─────────────────────────┐
│  [📄 Импорт из PDF]     │
└─────────────────────────┘
```

## 🔄 User Flow

### First Time Setup
1. User clicks **⚙️** settings icon
2. Modal opens with instructions
3. User clicks link to Google AI Studio
4. User copies API key
5. User pastes key and clicks "Сохранить"
6. Modal closes, key is saved

### Importing a PDF
1. User clicks **📄 Импорт из PDF**
2. File picker opens (only .pdf files shown)
3. User selects PDF file
4. Button changes to **⏳ Обработка...**
5. AI processes the PDF (3-10 seconds)
6. Success alert: "PDF успешно импортирован!"
7. New template appears in dropdown
8. User can immediately view/edit schedule

### Error Scenarios

#### No API Key
```
┌──────────────────────────────────────┐
│  ⚠️  Alert                           │
│                                      │
│  Пожалуйста, сначала настройте API   │
│  ключ в настройках                   │
│                                      │
│  [OK]                                │
└──────────────────────────────────────┘
```
→ Settings modal automatically opens

#### Invalid PDF
```
┌──────────────────────────────────────┐
│  ⚠️  Alert                           │
│                                      │
│  Ошибка импорта: Файл должен быть    │
│  в формате PDF                       │
│                                      │
│  [OK]                                │
└──────────────────────────────────────┘
```

#### AI Parsing Error
```
┌──────────────────────────────────────┐
│  ⚠️  Alert                           │
│                                      │
│  Ошибка импорта: AI вернул           │
│  некорректный JSON. Попробуйте       │
│  другой PDF файл.                    │
│                                      │
│  [OK]                                │
└──────────────────────────────────────┘
```

## 🎯 Interactive Elements

### Settings Button
- **Location**: Above "Свернуть панель" button
- **Icon**: ⚙️ (MdSettings)
- **Text**: "Настройки"
- **Action**: Opens API key settings modal
- **Style**: Primary color (#2196f3), full width
- **Size**: Standard button height

### PDF Import Button
- **Location**: Below "Новый шаблон" button
- **Icon**: 📄 (document emoji)
- **Action**: Opens file picker for PDF files
- **States**:
  - Normal: "📄 Импорт из PDF"
  - Loading: "⏳ Обработка..." (disabled)
- **Style**: Matches export button style
- **Full width**: Spans sidebar width

### API Key Input
- **Type**: Password (toggleable)
- **Visibility Toggle**: 👁️ / 🚫👁️ icons
- **Auto-save**: On blur or Enter key
- **Validation**: Required, non-empty
- **Clear function**: Confirms before deleting

## 📱 Responsive Behavior

All new components are fully responsive:
- Settings modal adapts to small screens
- PDF import button maintains full width
- Settings icon remains visible on mobile
- Modal closes on overlay click

## 🎨 Design Consistency

All new UI elements follow the existing design system:
- Same color palette (#2196f3 for primary)
- Consistent border radius (8px)
- Matching transitions (0.2s ease)
- Same shadow styles
- Unified button heights (36px min)
- Consistent spacing (margins/padding)

## 🔐 Security Indicators

- Password field for API key (not plain text)
- Show/hide toggle for verification
- LocalStorage indicator (saved locally)
- No network transmission of key (except to Google AI)

---

**All UI changes maintain the app's colorful, modern aesthetic while adding powerful AI-driven functionality!**

