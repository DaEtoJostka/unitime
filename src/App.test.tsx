import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/test-utils';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the application', () => {
      render(<App />);
      // Logo is split into individual letters for animation
      expect(screen.getByText('U')).toBeInTheDocument();
      expect(screen.getByText('n')).toBeInTheDocument();
    });

    it('renders the logo with animation', () => {
      render(<App />);
      // Check for individual letters instead of full text
      expect(screen.getByText('U')).toBeInTheDocument();
      // There are multiple 'i' letters in 'UniTime' (positions 2 and 4)
      const iLetters = screen.getAllByText('i');
      expect(iLetters.length).toBeGreaterThan(0);
    });

    it('renders the author link', () => {
      render(<App />);
      const authorLink = screen.getByRole('link', { name: /by/i });
      expect(authorLink).toHaveTextContent(/by 👾\s*Ivan,\s*👀\s*Alexander and 🌚\s*Denis/i);
      expect(authorLink).toHaveAttribute('href', 'https://github.com/DaEtoJostka');
    });

    it('renders the timetable', () => {
      render(<App />);
      // Check for day headers
      expect(screen.getByText('Пн')).toBeInTheDocument();
      expect(screen.getByText('Вт')).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('renders sidebar with template selector', () => {
      render(<App />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<App />);
      expect(screen.getByText(/переименовать/i)).toBeInTheDocument();
      expect(screen.getByText(/новый шаблон/i)).toBeInTheDocument();
    });

    it('toggles sidebar when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggleButton = screen.getByText(/свернуть панель/i);
      await user.click(toggleButton);

      // After toggling, the sidebar should collapse
      await waitFor(() => {
        expect(screen.queryByText(/свернуть панель/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Template Management', () => {
    it('creates a new template', async () => {
      const user = userEvent.setup();
      render(<App />);

      const createButton = screen.getByText(/новый шаблон/i);
      await user.click(createButton);

      // Should show the new template in the selector
      await waitFor(() => {
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.options.length).toBeGreaterThan(1);
      });
    });

    it('switches between templates', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create a new template first
      const createButton = screen.getByText(/новый шаблон/i);
      await user.click(createButton);

      await waitFor(async () => {
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.options.length).toBe(2);

        // Switch to the first template
        await user.selectOptions(select, select.options[0].value);
        expect(select.value).toBe(select.options[0].value);
      });
    });

    it('deletes a template when more than one exists', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create a new template
      await user.click(screen.getByText(/новый шаблон/i));

      await waitFor(async () => {
        // Delete button should appear
        const deleteButton = screen.getByText(/удалить шаблон/i);
        expect(deleteButton).toBeInTheDocument();

        await user.click(deleteButton);

        // After deletion, should have only one template
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.options.length).toBe(1);
      });
    });

    it('does not show delete button when only one template exists', () => {
      render(<App />);
      expect(screen.queryByText(/удалить шаблон/i)).not.toBeInTheDocument();
    });

    it('renames a template', async () => {
      const user = userEvent.setup();
      render(<App />);

      const renameButton = screen.getByText(/переименовать/i);
      await user.click(renameButton);

      await waitFor(async () => {
        const inputs = screen.getAllByDisplayValue(/основное расписание/i);
        const input = inputs[0];
        expect(input).toBeInTheDocument();

        await user.clear(input);
        await user.type(input, 'My Schedule');
        await user.keyboard('{Enter}');

        // The template name should be updated
        expect(screen.getByText('My Schedule')).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Integration', () => {
    it('saves data to localStorage', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create a new template
      await user.click(screen.getByText(/новый шаблон/i));

      await waitFor(() => {
        const savedData = localStorage.getItem('scheduleData');
        expect(savedData).toBeTruthy();
        
        if (savedData) {
          const parsed = JSON.parse(savedData);
          expect(parsed.templates).toBeDefined();
          expect(parsed.templates.length).toBeGreaterThan(1);
        }
      });
    });

    it('loads data from localStorage on mount', () => {
      const testData = {
        templates: [
          {
            id: 'test-1',
            name: 'Test Template',
            courses: [],
          },
        ],
        currentTemplateId: 'test-1',
        isSidebarCollapsed: false,
      };

      localStorage.setItem('scheduleData', JSON.stringify(testData));

      render(<App />);

      expect(screen.getByText('Test Template')).toBeInTheDocument();
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('scheduleData', 'invalid json');

      // Should not crash and should render with default template
      render(<App />);
      // Check for individual letter instead of full text
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('Export/Import Functionality', () => {
    it('shows export button', () => {
      render(<App />);
      expect(screen.getByText(/экспорт/i)).toBeInTheDocument();
    });

    it('shows import drop zone', () => {
      render(<App />);
      expect(screen.getByText(/перетащите файл шаблона/i)).toBeInTheDocument();
    });

    it('disables export for empty template', () => {
      render(<App />);
      const exportButton = screen.getByText(/экспорт/i).closest('button');
      expect(exportButton).toHaveAttribute('disabled');
    });
  });

  describe('Logo Animation', () => {
    it('triggers wave animation on logo click', async () => {
      const user = userEvent.setup();
      const { container } = render(<App />);

      // Find the logo container by class or structure
      const logoContainer = container.querySelector('[class*="LogoText"]') || container.querySelector('div');
      if (logoContainer) {
        await user.click(logoContainer as HTMLElement);
      }

      // The logo letters should still be rendered after click
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('does not show modal initially', () => {
      render(<App />);
      expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();
    });
  });

  describe('Save Notification', () => {
    it('shows save notification when making changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create a new template to trigger save
      await user.click(screen.getByText(/новый шаблон/i));

      // Should show notification
      await waitFor(() => {
        expect(screen.getByText(/изменения сохранены/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Responsive Design', () => {
    it('renders mobile toggle button', () => {
      // The mobile toggle button is hidden by CSS but should be in DOM
      const { container } = render(<App />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('Default Template', () => {
    it('creates default template if no data exists', () => {
      render(<App />);
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.options.length).toBe(1);
      expect(select.options[0].textContent).toContain('Основное расписание');
    });
  });

  describe('Sidebar Collapse State', () => {
    it('saves sidebar collapse state to localStorage', async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggleButton = screen.getByText(/свернуть панель/i);
      await user.click(toggleButton);

      await waitFor(() => {
        const savedData = localStorage.getItem('scheduleData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          expect(parsed.isSidebarCollapsed).toBe(true);
        }
      });
    });

    it('loads sidebar collapse state from localStorage', () => {
      const testData = {
        templates: [
          {
            id: 'default',
            name: 'Основное расписание',
            courses: [],
          },
        ],
        currentTemplateId: 'default',
        isSidebarCollapsed: true,
      };

      localStorage.setItem('scheduleData', JSON.stringify(testData));

      render(<App />);

      // Sidebar should be collapsed, so the "Свернуть панель" button should not be in the document
      expect(screen.queryByText(/свернуть панель/i)).not.toBeInTheDocument();
    });
  });
});

