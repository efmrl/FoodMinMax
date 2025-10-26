import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { foodOptimizer } from '../src/foodOptimizer.js';

describe('FoodOptimizer Alpine.js Component Integration', () => {
  let component;
  let originalFetch, originalAlert;

  beforeEach(() => {
    // Create a fresh component instance
    component = foodOptimizer();

    // Mock fetch
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });

    // Mock alert
    originalAlert = global.alert;
    global.alert = vi.fn();
  });

  afterEach(() => {
    // Restore mocks
    global.fetch = originalFetch;
    global.alert = originalAlert;
  });

  describe('Component Initialization', () => {
    it('initializes with default state', () => {
      expect(component.userID).toBe('');
      expect(component.foods).toEqual([]);
      expect(component.constraints).toEqual({
        maxCalories: 2000,
        maxSodium: 2300,
        minProtein: 50,
      });
      expect(component.sortField).toBe('proteinVsCalorie');
      expect(component.sortOrder).toBe('desc');
      expect(component.showConstraintsModal).toBe(false);
      expect(component.showAddFoodModal).toBe(false);
      expect(component.editingFood).toBeNull();
    });

    it('has all required methods', () => {
      expect(typeof component.addFood).toBe('function');
      expect(typeof component.removeFood).toBe('function');
      expect(typeof component.openEditModal).toBe('function');
      expect(typeof component.closeEditModal).toBe('function');
      expect(typeof component.openConstraintsModal).toBe('function');
      expect(typeof component.closeConstraintsModal).toBe('function');
      expect(typeof component.openAddFoodModal).toBe('function');
      expect(typeof component.closeAddFoodModal).toBe('function');
    });
  });

  describe('Modal State Management', () => {
    it('opens constraints modal', () => {
      expect(component.showConstraintsModal).toBe(false);

      component.openConstraintsModal();

      expect(component.showConstraintsModal).toBe(true);
    });

    it('closes constraints modal', () => {
      component.showConstraintsModal = true;

      component.closeConstraintsModal();

      expect(component.showConstraintsModal).toBe(false);
    });

    it('opens add food modal', () => {
      expect(component.showAddFoodModal).toBe(false);

      component.openAddFoodModal();

      expect(component.showAddFoodModal).toBe(true);
    });

    it('closes add food modal', () => {
      component.showAddFoodModal = true;

      component.closeAddFoodModal();

      expect(component.showAddFoodModal).toBe(false);
    });

    it('opens edit modal with food data', () => {
      const food = {
        name: 'Chicken Breast',
        calories: 165,
        sodium: 74,
        protein: 31,
      };

      component.foods = [food];
      component.openEditModal(food, 0);

      expect(component.editingFood).toBe(true);
      expect(component.editingFoodIndex).toBe(0);
      expect(component.editForm).toEqual({
        name: 'Chicken Breast',
        calories: 165,
        sodium: 74,
        protein: 31,
      });
    });

    it('closes edit modal and resets form', () => {
      component.editingFood = true;
      component.editingFoodIndex = 0;
      component.editForm = {
        name: 'Test',
        calories: 100,
        sodium: 50,
        protein: 10,
      };

      component.closeEditModal();

      expect(component.editingFood).toBeNull();
      expect(component.editingFoodIndex).toBeNull();
      expect(component.editForm).toEqual({
        name: '',
        calories: '',
        sodium: '',
        protein: '',
      });
    });
  });

  describe('Food Management', () => {
    it('adds a food with valid data', () => {
      component.userID = 'test-user';
      component.newFood = {
        name: 'Apple',
        calories: '95',
        sodium: '2',
        protein: '0.5',
      };

      component.addFood();

      expect(component.foods).toHaveLength(1);
      expect(component.foods[0]).toEqual(expect.objectContaining({
        name: 'Apple',
        calories: 95,
        sodium: 2,
        protein: 0.5,
      }));
      expect(component.foods[0].id).toBeDefined();
      expect(typeof component.foods[0].id).toBe('string');
      expect(component.newFood).toEqual({
        name: '',
        calories: '',
        sodium: '',
        protein: '',
      });
    });

    it('does not add food with missing name', () => {
      component.userID = 'test-user';
      component.newFood = {
        name: '',
        calories: '95',
        sodium: '2',
        protein: '0.5',
      };

      component.addFood();

      expect(component.foods).toHaveLength(0);
    });

    it('does not add food with missing nutritional data', () => {
      component.userID = 'test-user';
      component.newFood = {
        name: 'Apple',
        calories: '',
        sodium: '2',
        protein: '0.5',
      };

      component.addFood();

      expect(component.foods).toHaveLength(0);
    });

    it('removes food at specified index', () => {
      component.userID = 'test-user';
      component.foods = [
        { name: 'Apple', calories: 95, sodium: 2, protein: 0.5 },
        { name: 'Banana', calories: 105, sodium: 1, protein: 1.3 },
      ];

      component.removeFood(0);

      expect(component.foods).toHaveLength(1);
      expect(component.foods[0].name).toBe('Banana');
    });

    it('edits food with valid data', () => {
      component.userID = 'test-user';
      component.foods = [
        { name: 'Apple', calories: 95, sodium: 2, protein: 0.5 },
      ];
      component.editingFoodIndex = 0;
      component.editForm = {
        name: 'Green Apple',
        calories: '90',
        sodium: '1',
        protein: '0.4',
      };

      component.saveEditedFood();

      expect(component.foods[0]).toEqual(expect.objectContaining({
        name: 'Green Apple',
        calories: 90,
        sodium: 1,
        protein: 0.4,
      }));
      expect(component.foods[0].id).toBeDefined();
      expect(typeof component.foods[0].id).toBe('string');
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      component.foods = [
        { name: 'Banana', calories: 105, sodium: 1, protein: 1.3 },
        { name: 'Apple', calories: 95, sodium: 2, protein: 0.5 },
        { name: 'Chicken', calories: 165, sodium: 74, protein: 31 },
      ];
    });

    it('sorts foods by name ascending', () => {
      component.sortBy('name');

      const sorted = component.sortedFoods;
      expect(sorted[0].name).toBe('Apple');
      expect(sorted[1].name).toBe('Banana');
      expect(sorted[2].name).toBe('Chicken');
    });

    it('toggles sort order when clicking same field', () => {
      component.sortField = 'name';
      component.sortOrder = 'asc';

      component.sortBy('name');

      expect(component.sortOrder).toBe('desc');
    });

    it('sorts by protein percentage descending', () => {
      component.sortBy('proteinPercent');

      const sorted = component.sortedFoods;
      // Chicken has highest protein %
      expect(sorted[0].name).toBe('Chicken');
    });
  });

  describe('Data Persistence', () => {
    it('saves foods to API', async () => {
      component.userID = 'test-user-123';
      component.foods = [
        { name: 'Apple', calories: 95, sodium: 2, protein: 0.5 },
      ];

      await component.saveFoods();

      expect(global.fetch).toHaveBeenCalledWith(
        '/data/test-user-123/foods.json',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(component.foods),
        })
      );
    });

    it('saves constraints to API', async () => {
      component.userID = 'test-user-123';
      component.constraints = {
        maxCalories: 1800,
        maxSodium: 2000,
        minProtein: 60,
      };

      await component.saveConstraints();

      expect(global.fetch).toHaveBeenCalledWith(
        '/data/test-user-123/constraints.json',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(component.constraints),
        })
      );
    });

    it('does not save when userID is not set', async () => {
      component.userID = '';
      component.foods = [
        { name: 'Apple', calories: 95, sodium: 2, protein: 0.5 },
      ];

      await component.saveFoods();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('handles save errors gracefully', async () => {
      component.userID = 'test-user-123';
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Suppress expected console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await component.saveFoods();

      expect(global.alert).toHaveBeenCalledWith(
        'Failed to save foods. Please try again.'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Data Import', () => {
    let mockFileReader;
    let originalFileReader;
    let originalConfirm;

    beforeEach(() => {
      // Use fake timers
      vi.useFakeTimers();

      // Mock FileReader
      originalFileReader = global.FileReader;
      mockFileReader = {
        onload: null,
        readAsText: vi.fn(function(file) {
          // Simulate async file reading
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: file._mockContent } });
            }
          }, 0);
        }),
      };
      global.FileReader = vi.fn(function() {
        return mockFileReader;
      });

      // Mock confirm (alert is already mocked in parent beforeEach)
      originalConfirm = global.confirm;
      global.confirm = vi.fn(() => true);
    });

    afterEach(() => {
      vi.useRealTimers();
      global.FileReader = originalFileReader;
      global.confirm = originalConfirm;
    });

    it('validates file type and rejects non-JSON files', () => {
      const file = { name: 'test.txt' };
      component.processImportFile(file);

      expect(global.alert).toHaveBeenCalledWith('Please select a JSON file.');
    });

    it('validates imported data structure', () => {
      const file = {
        name: 'test.json',
        _mockContent: JSON.stringify({ invalid: 'data' }),
      };

      component.processImportFile(file);

      // Advance timers to trigger file reading
      vi.runAllTimers();

      expect(global.alert).toHaveBeenCalledWith(
        "Invalid import file format. The file must contain a 'foods' array."
      );
    });

    it('creates preview from valid import file', () => {
      const importData = {
        foods: [
          { id: '1', name: 'Chicken', protein: 30, calories: 165, sodium: 74 },
          { id: '2', name: 'Rice', protein: 5, calories: 200, sodium: 50 },
        ],
        exportedAt: '2025-01-15T12:00:00.000Z',
      };

      const file = {
        name: 'test.json',
        _mockContent: JSON.stringify(importData),
      };

      component.processImportFile(file);

      // Advance timers to trigger file reading
      vi.runAllTimers();

      expect(component.importPreview).toEqual({
        foodsCount: 2,
        exportedAt: '2025-01-15T12:00:00.000Z',
      });
      expect(component.importData).toEqual(importData);
    });

    it('handles malformed JSON gracefully', () => {
      // Suppress expected console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const file = {
        name: 'test.json',
        _mockContent: 'invalid json {{{',
      };

      component.processImportFile(file);

      // Advance timers to trigger file reading
      vi.runAllTimers();

      expect(global.alert).toHaveBeenCalledWith(
        'Error reading import file. Please ensure it is a valid JSON file.'
      );

      consoleErrorSpy.mockRestore();
    });

    it('confirms import and replaces existing data', async () => {
      component.userID = 'test-user';
      component.foods = [
        { id: '0', name: 'OldFood', protein: 10, calories: 100, sodium: 50 },
      ];

      component.importData = {
        foods: [
          { id: '1', name: 'Chicken', protein: 30, calories: 165, sodium: 74 },
          { id: '2', name: 'Rice', protein: 5, calories: 200, sodium: 50 },
        ],
        exportedAt: '2025-01-15T12:00:00.000Z',
      };

      await component.confirmImport();

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to import this data? This will replace all your current foods. This action cannot be undone.'
      );
      expect(component.foods).toHaveLength(2);
      expect(component.foods[0].name).toBe('Chicken');
      expect(component.foods[1].name).toBe('Rice');
      expect(global.alert).toHaveBeenCalledWith('Successfully imported 2 foods.');
    });

    it('cancels import if user declines confirmation', async () => {
      global.confirm.mockReturnValueOnce(false);

      component.userID = 'test-user';
      component.foods = [
        { id: '0', name: 'OldFood', protein: 10, calories: 100, sodium: 50 },
      ];

      component.importData = {
        foods: [
          { id: '1', name: 'Chicken', protein: 30, calories: 165, sodium: 74 },
        ],
      };

      await component.confirmImport();

      expect(component.foods).toHaveLength(1);
      expect(component.foods[0].name).toBe('OldFood');
    });

    it('adds IDs to imported foods without IDs', async () => {
      component.userID = 'test-user';
      component.importData = {
        foods: [
          { name: 'Chicken', protein: 30, calories: 165, sodium: 74 },
        ],
      };

      await component.confirmImport();

      expect(component.foods[0].id).toBeDefined();
      expect(typeof component.foods[0].id).toBe('string');
    });

    it('handles file selection from input', () => {
      const mockEvent = {
        target: {
          files: [{ name: 'test.json' }],
        },
      };

      const spy = vi.spyOn(component, 'processImportFile');
      component.handleImportFileSelect(mockEvent);

      expect(spy).toHaveBeenCalledWith({ name: 'test.json' });
      spy.mockRestore();
    });
  });

  describe('Data Export', () => {
    let mockBlob;
    let mockUrl;
    let mockLink;
    let createObjectURLSpy;
    let revokeObjectURLSpy;
    let originalBlob;
    let originalCreateElement;

    beforeEach(() => {
      // Mock Blob
      originalBlob = global.Blob;
      mockBlob = {};
      global.Blob = vi.fn(function(parts, options) {
        return mockBlob;
      });

      // Mock URL.createObjectURL and URL.revokeObjectURL
      mockUrl = 'blob:mock-url';
      createObjectURLSpy = vi.fn(() => mockUrl);
      revokeObjectURLSpy = vi.fn();
      global.URL.createObjectURL = createObjectURLSpy;
      global.URL.revokeObjectURL = revokeObjectURLSpy;

      // Mock document.createElement
      originalCreateElement = global.document.createElement;
      mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      global.document.createElement = vi.fn(() => mockLink);

      // Mock setTimeout to execute immediately
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      global.Blob = originalBlob;
      global.document.createElement = originalCreateElement;
    });

    it('exports food data with correct structure', () => {
      component.foods = [
        { id: '1', name: 'Chicken', protein: 30, calories: 165, sodium: 74 },
        { id: '2', name: 'Rice', protein: 5, calories: 200, sodium: 50 },
      ];

      component.exportData();

      // Check that Blob was created with correct data
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"foods"')],
        { type: 'application/json' }
      );

      // Parse the JSON string passed to Blob
      const blobCall = global.Blob.mock.calls[0];
      const jsonString = blobCall[0][0];
      const exportData = JSON.parse(jsonString);

      expect(exportData.foods).toHaveLength(2);
      expect(exportData.foods[0].name).toBe('Chicken');
      expect(exportData.foods[1].name).toBe('Rice');
      expect(exportData.exportedAt).toBeDefined();
      expect(typeof exportData.exportedAt).toBe('string');
    });

    it('triggers download with correct filename', () => {
      const today = new Date().toISOString().split('T')[0];
      component.exportData();

      expect(mockLink.download).toBe(`foodminmax-export-${today}.json`);
      expect(mockLink.href).toBe(mockUrl);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('handles empty foods array', () => {
      component.foods = [];
      component.exportData();

      const blobCall = global.Blob.mock.calls[0];
      const jsonString = blobCall[0][0];
      const exportData = JSON.parse(jsonString);

      expect(exportData.foods).toHaveLength(0);
      expect(exportData.exportedAt).toBeDefined();
    });

    it('prevents default and stops propagation when event is provided', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };

      component.exportData(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('cleans up blob URL after timeout', () => {
      component.exportData();

      expect(revokeObjectURLSpy).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(100);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockUrl);
    });
  });
});
