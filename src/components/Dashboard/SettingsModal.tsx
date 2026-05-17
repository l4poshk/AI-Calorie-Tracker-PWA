'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { useDashboardStore } from '@/src/store/dashboardStore';

export default function SettingsModal() {
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const closeSettings = useUIStore((s) => s.closeSettings);
  
  const { caloriesGoal, proteinGoal, fatsGoal, carbsGoal, setGoals } = useDashboardStore();

  const [formData, setFormData] = useState({
    calories: caloriesGoal,
    protein: proteinGoal,
    fats: fatsGoal,
    carbs: carbsGoal,
  });

  // Синхронизируем стейт формы при открытии модалки
  useEffect(() => {
    if (isSettingsOpen) {
      setFormData({
        calories: caloriesGoal,
        protein: proteinGoal,
        fats: fatsGoal,
        carbs: carbsGoal,
      });
    }
  }, [isSettingsOpen, caloriesGoal, proteinGoal, fatsGoal, carbsGoal]);

  if (!isSettingsOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals({
      caloriesGoal: Number(formData.calories) || 2000,
      proteinGoal: Number(formData.protein) || 160,
      fatsGoal: Number(formData.fats) || 60,
      carbsGoal: Number(formData.carbs) || 150,
    });
    closeSettings();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-[#3D4A3C]/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#3D4A3C]">Настройки целей</h2>
            <p className="text-xs text-[#3D4A3C]/50 font-medium mt-0.5">
              Установи свои суточные нормы КБЖУ
            </p>
          </div>
          <button
            onClick={closeSettings}
            className="p-2 text-[#3D4A3C]/40 hover:text-[#3D4A3C] hover:bg-[#FAF6F1] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#3D4A3C]/60 uppercase mb-1.5">
              Калории (ккал)
            </label>
            <input
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData(prev => ({ ...prev, calories: Number(e.target.value) }))}
              className="w-full rounded-2xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-4 py-3 text-base font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
              min="500"
              max="10000"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#3D4A3C]/60 uppercase mb-1.5">
                Белки (г)
              </label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData(prev => ({ ...prev, protein: Number(e.target.value) }))}
                className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                min="0"
                max="500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#3D4A3C]/60 uppercase mb-1.5">
                Жиры (г)
              </label>
              <input
                type="number"
                value={formData.fats}
                onChange={(e) => setFormData(prev => ({ ...prev, fats: Number(e.target.value) }))}
                className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                min="0"
                max="500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#3D4A3C]/60 uppercase mb-1.5">
                Углеводы (г)
              </label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                min="0"
                max="1000"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#6B9E6A] hover:bg-[#5E8E5E] active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#6B9E6A]/30 transition-all"
          >
            <Check className="w-5 h-5" />
            Сохранить цели
          </button>
        </form>
      </div>
    </div>
  );
}
