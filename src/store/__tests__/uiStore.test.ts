import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/src/store/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useUIStore.setState({
      isLoading: false,
      alerts: [],
      isAddMealOpen: false,
    });
  });

  it('should initialize with default values', () => {
    const state = useUIStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.alerts).toEqual([]);
    expect(state.isAddMealOpen).toBe(false);
  });

  it('should toggle loading state', () => {
    useUIStore.getState().setLoading(true);
    expect(useUIStore.getState().isLoading).toBe(true);

    useUIStore.getState().setLoading(false);
    expect(useUIStore.getState().isLoading).toBe(false);
  });

  it('should add and remove alerts', () => {
    useUIStore.getState().addAlert({ type: 'success', message: 'Meal saved!' });
    const alerts = useUIStore.getState().alerts;

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('success');
    expect(alerts[0].message).toBe('Meal saved!');
    expect(alerts[0].id).toBeDefined();

    // Remove it
    useUIStore.getState().removeAlert(alerts[0].id);
    expect(useUIStore.getState().alerts).toHaveLength(0);
  });

  it('should clear all alerts', () => {
    useUIStore.getState().addAlert({ type: 'error', message: 'Error 1' });
    useUIStore.getState().addAlert({ type: 'info', message: 'Info 1' });
    expect(useUIStore.getState().alerts).toHaveLength(2);

    useUIStore.getState().clearAlerts();
    expect(useUIStore.getState().alerts).toHaveLength(0);
  });

  it('should toggle add-meal modal', () => {
    useUIStore.getState().openAddMeal();
    expect(useUIStore.getState().isAddMealOpen).toBe(true);

    useUIStore.getState().closeAddMeal();
    expect(useUIStore.getState().isAddMealOpen).toBe(false);
  });
});
