import { create } from 'zustand';

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
  openAddMeal: () => void;
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
  openAddMeal: () => set({ isAddMealOpen: true }),
  closeAddMeal: () => set({ isAddMealOpen: false }),

  // Settings modal
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  // Favorites library modal
  isFavoritesOpen: false,
  openFavorites: () => set({ isFavoritesOpen: true }),
  closeFavorites: () => set({ isFavoritesOpen: false }),
}));
