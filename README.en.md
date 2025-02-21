# Colorful Timetable Builder

[English Version](#) | [Русская версия](README.md)

## English Version

An interactive timetable builder for university schedules with a modern and colorful interface.

## Features

-   Add, edit, and remove courses.
-   Color-coded course types (lectures, labs, seminars, exams, practices).
-   Customizable time slots.
-   Interactive grid interface.
-   Modern and responsive design.
-   Multiple schedule templates.
-   Drag and Drop functionality for courses.
-   Template renaming and deletion.
-   Data persistence using LocalStorage.

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
```bash
git clone https://github.com/yourusername/colorful-timetable-builder.git
cd colorful-timetable-builder
```

2.  Install dependencies:
```bash
npm install
# or
yarn install
```

3.  Start the development server:
```bash
npm run dev
# or
yarn dev
```

4.  Open your browser and navigate to `http://localhost:3000`

## Usage

1.  Click on any empty cell in the timetable to add a new course.
2.  Fill in the course details in the modal form.
3.  Click on existing courses to edit them.
4.  The timetable automatically updates with your changes.
5.  Use drag-and-drop to move courses around.
6.  Use the dropdown to switch between templates.
7.  Click the "Rename" button to rename the current template.
8.  Click the "New Template" button to create a new template.
9.  Click the "Delete Template" button to delete the current template (if there is more than one template).

## Time Slots

The timetable uses the following time slots:

1.  08:30-09:50
2.  10:00-11:20
3.  11:30-12:50
4.  13:20-14:40
5.  14:50-16:10
6.  16:20-17:40
7.  18:00-19:20
8.  19:30-20:50

## Built With

-   React
-   TypeScript
-   Styled Components
-   Vite
-   React DnD (for Drag and Drop)

## License

This project is licensed under the MIT License.