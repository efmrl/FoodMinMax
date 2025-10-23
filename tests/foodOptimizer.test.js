import { describe, it, expect, beforeEach } from 'vitest';

// Since the code is Alpine-based, we'll test the logic by creating
// a mock component with the same methods
class FoodOptimizerMock {
  constructor() {
    this.constraints = {
      maxCalories: 2000,
      maxSodium: 2300,
      minProtein: 50,
    };
    this.foods = [];
  }

  getProteinPercent(food) {
    return Math.round((food.protein / this.constraints.minProtein) * 100);
  }

  getCaloriePercent(food) {
    return Math.round((food.calories / this.constraints.maxCalories) * 100);
  }

  getSodiumPercent(food) {
    return Math.round((food.sodium / this.constraints.maxSodium) * 100);
  }

  getProteinVsCalorieRatio(food) {
    const proteinPercent = this.getProteinPercent(food);
    const caloriePercent = this.getCaloriePercent(food);
    const ratio = caloriePercent > 0 ? proteinPercent / caloriePercent : 0;
    return ratio.toFixed(2);
  }

  getProteinVsSodiumRatio(food) {
    const proteinPercent = this.getProteinPercent(food);
    const sodiumPercent = this.getSodiumPercent(food);
    const ratio = sodiumPercent > 0 ? proteinPercent / sodiumPercent : 0;
    return ratio.toFixed(2);
  }

  getProteinPercentClass(food) {
    const percent = this.getProteinPercent(food);
    if (percent >= 25) return 'metric-good';
    if (percent >= 15) return 'metric-warning';
    return '';
  }

  getCaloriePercentClass(food) {
    const percent = this.getCaloriePercent(food);
    if (percent <= 10) return 'metric-good';
    if (percent <= 20) return 'metric-warning';
    return 'metric-poor';
  }

  getSodiumPercentClass(food) {
    const percent = this.getSodiumPercent(food);
    if (percent <= 5) return 'metric-good';
    if (percent <= 15) return 'metric-warning';
    return 'metric-poor';
  }

  getProteinVsCalorieClass(food) {
    const ratio = parseFloat(this.getProteinVsCalorieRatio(food));
    if (ratio >= 2.0) return 'metric-good';
    if (ratio >= 1.0) return 'metric-warning';
    return 'metric-poor';
  }

  getProteinVsSodiumClass(food) {
    const ratio = parseFloat(this.getProteinVsSodiumRatio(food));
    if (ratio >= 3.0) return 'metric-good';
    if (ratio >= 1.0) return 'metric-warning';
    return 'metric-poor';
  }
}

describe('FoodOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new FoodOptimizerMock();
  });

  describe('Percentage Calculations', () => {
    it('should calculate protein percentage correctly', () => {
      const food = { name: 'Chicken', protein: 25, calories: 200, sodium: 100 };
      expect(optimizer.getProteinPercent(food)).toBe(50);
    });

    it('should calculate calorie percentage correctly', () => {
      const food = { name: 'Rice', protein: 5, calories: 200, sodium: 50 };
      expect(optimizer.getCaloriePercent(food)).toBe(10);
    });

    it('should calculate sodium percentage correctly', () => {
      const food = { name: 'Salt', protein: 0, calories: 0, sodium: 230 };
      expect(optimizer.getSodiumPercent(food)).toBe(10);
    });
  });

  describe('Ratio Calculations', () => {
    it('should calculate protein vs calorie ratio correctly', () => {
      const food = { name: 'Chicken', protein: 25, calories: 200, sodium: 100 };
      // protein% = 50, calorie% = 10, ratio = 5.00
      expect(optimizer.getProteinVsCalorieRatio(food)).toBe('5.00');
    });

    it('should calculate protein vs sodium ratio correctly', () => {
      const food = { name: 'Chicken', protein: 25, calories: 200, sodium: 230 };
      // protein% = 50, sodium% = 10, ratio = 5.00
      expect(optimizer.getProteinVsSodiumRatio(food)).toBe('5.00');
    });

    it('should handle zero calorie edge case', () => {
      const food = { name: 'Water', protein: 0, calories: 0, sodium: 0 };
      expect(optimizer.getProteinVsCalorieRatio(food)).toBe('0.00');
    });

    it('should handle zero sodium edge case', () => {
      const food = { name: 'Pure Protein', protein: 25, calories: 100, sodium: 0 };
      expect(optimizer.getProteinVsSodiumRatio(food)).toBe('0.00');
    });
  });

  describe('CSS Class Assignment', () => {
    it('should assign good class for high protein percentage', () => {
      const food = { name: 'Protein Shake', protein: 30, calories: 150, sodium: 100 };
      expect(optimizer.getProteinPercentClass(food)).toBe('metric-good');
    });

    it('should assign warning class for medium protein percentage', () => {
      const food = { name: 'Yogurt', protein: 10, calories: 150, sodium: 100 };
      expect(optimizer.getProteinPercentClass(food)).toBe('metric-warning');
    });

    it('should assign empty class for low protein percentage', () => {
      const food = { name: 'Apple', protein: 1, calories: 95, sodium: 2 };
      expect(optimizer.getProteinPercentClass(food)).toBe('');
    });

    it('should assign good class for low calorie percentage', () => {
      const food = { name: 'Celery', protein: 1, calories: 100, sodium: 50 };
      expect(optimizer.getCaloriePercentClass(food)).toBe('metric-good');
    });

    it('should assign poor class for high calorie percentage', () => {
      const food = { name: 'Pizza', protein: 15, calories: 500, sodium: 1000 };
      expect(optimizer.getCaloriePercentClass(food)).toBe('metric-poor');
    });

    it('should assign good class for excellent protein vs calorie ratio', () => {
      const food = { name: 'Chicken Breast', protein: 30, calories: 165, sodium: 74 };
      // protein% = 60, calorie% = 8.25, ratio = 7.27
      expect(optimizer.getProteinVsCalorieClass(food)).toBe('metric-good');
    });

    it('should assign warning class for medium protein vs calorie ratio', () => {
      const food = { name: 'Eggs', protein: 6, calories: 155, sodium: 124 };
      // protein% = 12, calorie% = 7.75, ratio = 1.55
      expect(optimizer.getProteinVsCalorieClass(food)).toBe('metric-warning');
    });
  });

  describe('Custom Constraints', () => {
    it('should use custom constraints for calculations', () => {
      optimizer.constraints = {
        maxCalories: 1500,
        maxSodium: 1500,
        minProtein: 100,
      };

      const food = { name: 'Chicken', protein: 25, calories: 150, sodium: 150 };

      expect(optimizer.getProteinPercent(food)).toBe(25);
      expect(optimizer.getCaloriePercent(food)).toBe(10);
      expect(optimizer.getSodiumPercent(food)).toBe(10);
    });
  });
});
