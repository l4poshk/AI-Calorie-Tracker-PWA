import { create } from 'zustand';

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
  setInitialMeals: (meals: ClientMeal[]) => void;
  setSelectedDate: (date: string) => void;
  setGoals: (goals: Partial<{
    caloriesGoal: number;
    proteinGoal: number;
    fatsGoal: number;
    carbsGoal: number;
  }>) => void;
}

const INITIAL_MEALS: ClientMeal[] = [];

export const useDashboardStore = create<DashboardState>((set) => ({
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
}));
