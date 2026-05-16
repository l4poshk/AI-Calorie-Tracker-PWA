'use client';

import { useEffect, useRef } from 'react';
import { X, Camera, Sparkles } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';

export default function AddMealModal() {
  const isOpen = useUIStore((s) => s.isAddMealOpen);
  const close = useUIStore((s) => s.closeAddMeal);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Close on Escape key */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) close();
  };

  const handlePhotoSimulation = () => {
    alert('📸 Симуляция загрузки фото — здесь будет камера/галерея');
  };

  const handleAnalyze = () => {
    alert('🤖 Симуляция AI анализа — здесь будет вызов Gemini API');
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#3D4A3C]">
            Добавить приём пищи
          </h2>
          <button
            id="close-add-meal-modal"
            onClick={close}
            className="p-1.5 rounded-full text-[#3D4A3C]/40 hover:text-[#3D4A3C] hover:bg-[#3D4A3C]/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text input */}
        <div className="mb-4">
          <label
            htmlFor="meal-text-input"
            className="block text-xs font-semibold text-[#3D4A3C]/50 mb-1.5 uppercase tracking-wide"
          >
            Опишите блюдо
          </label>
          <textarea
            id="meal-text-input"
            placeholder="Например: «Большой чизбургер с картошкой фри»"
            rows={3}
            className="w-full rounded-2xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-4 py-3 text-sm text-[#3D4A3C] placeholder:text-[#3D4A3C]/30 focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40 focus:border-[#6B9E6A]/40 resize-none transition-all"
          />
        </div>

        {/* Divider with "или" */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#3D4A3C]/10" />
          <span className="text-[11px] font-medium text-[#3D4A3C]/30 uppercase">
            или
          </span>
          <div className="flex-1 h-px bg-[#3D4A3C]/10" />
        </div>

        {/* Photo upload button */}
        <button
          id="photo-upload-button"
          onClick={handlePhotoSimulation}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#6B9E6A]/30 bg-[#6B9E6A]/5 px-4 py-4 text-sm font-semibold text-[#6B9E6A] hover:bg-[#6B9E6A]/10 hover:border-[#6B9E6A]/50 active:scale-[0.98] transition-all mb-6"
        >
          <Camera className="w-5 h-5" />
          Сделать фото или выбрать из галереи
        </button>

        {/* Analyze button */}
        <button
          id="analyze-meal-button"
          onClick={handleAnalyze}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6B9E6A] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6B9E6A]/30 hover:bg-[#5E8E5E] active:scale-[0.97] transition-all"
        >
          <Sparkles className="w-4.5 h-4.5" />
          Анализировать с ИИ
        </button>
      </div>
    </div>
  );
}
