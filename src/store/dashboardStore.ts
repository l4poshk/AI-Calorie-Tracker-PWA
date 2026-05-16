import { create } from 'zustand';

export interface ClientMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  time: string;
  imageUrl: string | null;
  emoji: string;
  isAI?: boolean;
}

interface DashboardState {
  /** List of logged meals for the selected day */
  meals: ClientMeal[];

  /** Daily nutrition goals */
  caloriesGoal: number;
  proteinGoal: number;
  fatsGoal: number;
  carbsGoal: number;

  /** Actions */
  addMeal: (meal: ClientMeal) => void;
  removeMeal: (id: string) => void;
  setGoals: (goals: Partial<{
    caloriesGoal: number;
    proteinGoal: number;
    fatsGoal: number;
    carbsGoal: number;
  }>) => void;
}

const INITIAL_MEALS: ClientMeal[] = [
  {
    id: '1',
    name: 'Отварные яйца с огурцом и помидором',
    calories: 268,
    protein: 20,
    fats: 16,
    carbs: 10,
    time: '13:24',
    imageUrl: null,
    emoji: '🥚',
    isAI: true,
  },
  {
    id: '2',
    name: 'Лимонад Ava Orangelo',
    calories: 200,
    protein: 0,
    fats: 0,
    carbs: 50,
    time: '01:15',
    imageUrl: null,
    emoji: '🍋',
    isAI: false,
  },
  {
    id: '3',
    name: 'Овсянка с бананом и мёдом',
    calories: 320,
    protein: 8,
    fats: 6,
    carbs: 58,
    time: '08:30',
    imageUrl: null,
    emoji: '🥣',
    isAI: false,
  },
];

export const useDashboardStore = create<DashboardState>((set) => ({
  meals: INITIAL_MEALS,

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

  setGoals: (newGoals) =>
    set((state) => ({
      ...state,
      ...newGoals,
    })),
}));
