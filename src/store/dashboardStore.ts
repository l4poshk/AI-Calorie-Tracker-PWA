import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClientMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  time: string;
  dateString: string;
  imageUrl: string | null;
  emoji: string;
  isAI?: boolean;
}

interface DashboardState {
  /** List of logged meals for the selected day */
  meals: ClientMeal[];
  
  /** Currently selected local date in YYYY-MM-DD format */
  selectedDate: string | null;

  /** Daily nutrition goals */
  caloriesGoal: number;
  proteinGoal: number;
  fatsGoal: number;
  carbsGoal: number;

  /** Actions */
  addMeal: (meal: ClientMeal) => void;
  removeMeal: (id: string) => void;
  updateMealInStore: (id: string, updates: Partial<ClientMeal>) => void;
  setInitialMeals: (meals: ClientMeal[]) => void;
  setSelectedDate: (date: string) => void;
  setGoals: (goals: Partial<{
    caloriesGoal: number;
    proteinGoal: number;
    fatsGoal: number;
    carbsGoal: number;
  }>) => void;

  /** Water Tracker (ml) */
  waterGoal: number;
  waterPortion: number;
  waterByDate: Record<string, number>;
  addWater: (date: string, amount: number) => void;
  setWaterGoal: (amount: number) => void;
  setWaterPortion: (amount: number) => void;
}

const INITIAL_MEALS: ClientMeal[] = [];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      meals: INITIAL_MEALS,
      selectedDate: null,

      caloriesGoal: 2000,
      proteinGoal: 160,
      fatsGoal: 60,
      carbsGoal: 150,

      addMeal: (meal) =>
        set((state) => ({
          meals: [meal, ...state.meals],
        })),

      removeMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        })),

      updateMealInStore: (id, updates) =>
        set((state) => ({
          meals: state.meals.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      setInitialMeals: (meals) =>
        set(() => ({
          meals,
        })),

      setSelectedDate: (date) =>
        set(() => ({
          selectedDate: date,
        })),

      setGoals: (newGoals) =>
        set((state) => ({
          ...state,
          ...newGoals,
        })),

      waterGoal: 2000,
      waterPortion: 250,
      setWaterGoal: (amount) => set(() => ({ waterGoal: amount })),
      setWaterPortion: (amount) => set(() => ({ waterPortion: amount })),

      waterByDate: {},
      addWater: (date, amount) =>
        set((state) => ({
          waterByDate: {
            ...state.waterByDate,
            [date]: (state.waterByDate[date] || 0) + amount,
          },
        })),
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        waterByDate: state.waterByDate,
        waterGoal: state.waterGoal,
        waterPortion: state.waterPortion,
        caloriesGoal: state.caloriesGoal,
        proteinGoal: state.proteinGoal,
        fatsGoal: state.fatsGoal,
        carbsGoal: state.carbsGoal,
        selectedDate: state.selectedDate,
      }),
    }
  )
);
