import { create } from 'zustand';
import { ClientMeal } from './dashboardStore';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  /** Global loading indicator (e.g. while AI processes a photo) */
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  /** Toast-style alerts stack */
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;

  /** Add-meal modal visibility */
  isAddMealOpen: boolean;
  mealToEdit: ClientMeal | null;
  openAddMeal: (meal?: ClientMeal) => void;
  closeAddMeal: () => void;

  /** Settings modal visibility */
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  /** Favorites library modal visibility */
  isFavoritesOpen: boolean;
  openFavorites: () => void;
  closeFavorites: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Alerts
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        ...state.alerts,
        { ...alert, id: crypto.randomUUID() },
      ],
    })),
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
  clearAlerts: () => set({ alerts: [] }),

  // Add-meal modal
  isAddMealOpen: false,
  mealToEdit: null,
  openAddMeal: (meal) => {
    const isMeal = meal && typeof meal === 'object' && 'id' in meal && 'name' in meal;
    set({ isAddMealOpen: true, mealToEdit: isMeal ? meal : null });
  },
  closeAddMeal: () => set({ isAddMealOpen: false, mealToEdit: null }),

  // Settings modal
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  // Favorites library modal
  isFavoritesOpen: false,
  openFavorites: () => set({ isFavoritesOpen: true }),
  closeFavorites: () => set({ isFavoritesOpen: false }),
}));
