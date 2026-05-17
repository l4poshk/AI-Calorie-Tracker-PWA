'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Camera, Sparkles, Loader2, Check } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { useDashboardStore, ClientMeal } from '@/src/store/dashboardStore';
import { analyzeFood, AnalyzedMeal } from '@/src/actions/ai';
import { compressImage } from '@/src/utils/image';
import { uploadMealImage, saveMeal } from '@/src/actions/meals';
import { useRouter } from 'next/navigation';

export default function AddMealModal() {
  const isOpen = useUIStore((s) => s.isAddMealOpen);
  const close = useUIStore((s) => s.closeAddMeal);
  const addMeal = useDashboardStore((s) => s.addMeal);
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [reviewData, setReviewData] = useState<AnalyzedMeal>({
    name: '',
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    emoji: '🍽️',
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setIsAnalyzing(false);
      setIsSaving(false);
      setTextInput('');
      setImageFile(null);
      setImagePreview(null);
      setError(null);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving && !isAnalyzing) close();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close, isSaving, isAnalyzing]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isSaving && !isAnalyzing) close();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!textInput.trim() && !imageFile) {
      setError('Пожалуйста, введите текст или выберите фото.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      let imageParam;
      if (imageFile) {
        // Сжимаем картинку на клиенте перед отправкой на сервер
        const base64 = await compressImage(imageFile);
        imageParam = {
          base64,
          mimeType: 'image/jpeg', // Canvas toDataURL возвращает image/jpeg
        };
      }

      const result = await analyzeFood({
        text: textInput.trim() || undefined,
        image: imageParam,
      });

      setReviewData(result);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Ошибка анализа. Попробуйте еще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      let finalImageUrl = null;

      // 1. Загружаем фото в Supabase Storage, если оно есть
      if (imageFile) {
        const base64 = await compressImage(imageFile);
        finalImageUrl = await uploadMealImage(base64, 'image/jpeg');
      }

      // 2. Сохраняем запись в базу данных
      const savedDbMeal = await saveMeal({
        name: reviewData.name,
        calories: reviewData.calories,
        protein: reviewData.protein,
        fats: reviewData.fats,
        carbs: reviewData.carbs,
        emoji: reviewData.emoji,
        image_url: finalImageUrl,
        is_ai: true, // В Фазе 2 все блюда идут через ИИ
      });

      // 3. Добавляем в локальный стейт Zustand
      const now = new Date();
      const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      
      const tzOffset = now.getTimezoneOffset() * 60000;
      const dateString = new Date(now.getTime() - tzOffset).toISOString().split('T')[0];

      const newMeal: ClientMeal = {
        id: savedDbMeal.id,
        name: savedDbMeal.name,
        calories: savedDbMeal.calories,
        protein: savedDbMeal.protein,
        fats: savedDbMeal.fats,
        carbs: savedDbMeal.carbs,
        emoji: savedDbMeal.emoji || '🍽️',
        time,
        dateString,
        imageUrl: finalImageUrl,
        isAI: savedDbMeal.is_ai,
      };

      addMeal(newMeal);
      
      // Обновляем роутер для подхвата возможных серверных изменений
      router.refresh();
      close();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении блюда. Попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#3D4A3C]">
            {step === 'input' ? 'Добавить приём пищи' : 'Проверьте данные'}
          </h2>
          <button
            onClick={close}
            className="p-1.5 rounded-full text-[#3D4A3C]/40 hover:text-[#3D4A3C] hover:bg-[#3D4A3C]/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {step === 'input' && (
          <>
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
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isAnalyzing}
                placeholder="Например: «Большой чизбургер с картошкой фри»"
                rows={3}
                className="w-full rounded-2xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-4 py-3 text-sm text-[#3D4A3C] placeholder:text-[#3D4A3C]/30 focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40 focus:border-[#6B9E6A]/40 resize-none transition-all disabled:opacity-60"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#3D4A3C]/10" />
              <span className="text-[11px] font-medium text-[#3D4A3C]/30 uppercase">
                или
              </span>
              <div className="flex-1 h-px bg-[#3D4A3C]/10" />
            </div>

            {/* Photo upload button */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isAnalyzing}
            />
            
            {imagePreview ? (
              <div className="relative w-full h-40 mb-6 rounded-2xl overflow-hidden border border-[#3D4A3C]/10">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  disabled={isAnalyzing}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#6B9E6A]/30 bg-[#6B9E6A]/5 px-4 py-4 text-sm font-semibold text-[#6B9E6A] hover:bg-[#6B9E6A]/10 hover:border-[#6B9E6A]/50 active:scale-[0.98] transition-all disabled:opacity-60 mb-6"
              >
                <Camera className="w-5 h-5" />
                Сделать фото или выбрать из галереи
              </button>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!textInput.trim() && !imageFile)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6B9E6A] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6B9E6A]/30 hover:bg-[#5E8E5E] active:scale-[0.97] transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ИИ анализирует...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  Анализировать с ИИ
                </>
              )}
            </button>
          </>
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            {imagePreview && (
              <div className="w-full h-32 rounded-2xl overflow-hidden border border-[#3D4A3C]/10 shrink-0">
                 <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Название блюда</label>
                <input
                  type="text"
                  value={reviewData.name}
                  onChange={(e) => setReviewData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-medium text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                />
              </div>
              <div className="w-16">
                <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Emoji</label>
                <input
                  type="text"
                  value={reviewData.emoji}
                  onChange={(e) => setReviewData(prev => ({ ...prev, emoji: e.target.value }))}
                  className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-2 py-2.5 text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">
                Калории (Ккал)
              </label>
              <input
                type="number"
                value={reviewData.calories === 0 ? '' : reviewData.calories}
                onChange={(e) => setReviewData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#E85D5D] uppercase mb-1">Белки (г)</label>
                <input
                  type="number"
                  value={reviewData.protein === 0 ? '' : reviewData.protein}
                  onChange={(e) => setReviewData(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#E85D5D]/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#F0C246] uppercase mb-1">Жиры (г)</label>
                <input
                  type="number"
                  value={reviewData.fats === 0 ? '' : reviewData.fats}
                  onChange={(e) => setReviewData(prev => ({ ...prev, fats: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#F0C246]/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#C4A46C] uppercase mb-1">Углеводы (г)</label>
                <input
                  type="number"
                  value={reviewData.carbs === 0 ? '' : reviewData.carbs}
                  onChange={(e) => setReviewData(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#C4A46C]/40"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 mt-2 rounded-2xl bg-[#6B9E6A] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6B9E6A]/30 hover:bg-[#5E8E5E] active:scale-[0.97] transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Сохранить блюдо
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
