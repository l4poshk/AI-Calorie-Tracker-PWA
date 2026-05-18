'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Camera, Sparkles, Loader2, Check, Bookmark, Heart, Trash2 } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { useDashboardStore, ClientMeal } from '@/src/store/dashboardStore';
import { analyzeFood, AnalyzedMeal } from '@/src/actions/ai';
import { compressImage } from '@/src/utils/image';
import { uploadMealImage, saveMeal, saveManualMeal, getFavoriteMeals, deleteFavoriteMeal } from '@/src/actions/meals';
import { FavoriteMeal } from '@/src/types/supabase';
import { useRouter } from 'next/navigation';

const MAX_VISIBLE_FAVORITES = 3;

export default function AddMealModal() {
  const isOpen = useUIStore((s) => s.isAddMealOpen);
  const close = useUIStore((s) => s.closeAddMeal);
  const addMeal = useDashboardStore((s) => s.addMeal);
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  // Tabs & General States
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Tab States
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<AnalyzedMeal>({
    name: '',
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    emoji: '🍽️',
  });

  // Manual Tab States
  const [manualData, setManualData] = useState<AnalyzedMeal>({
    name: '',
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    emoji: '🍽️',
  });
  const [manualImageFile, setManualImageFile] = useState<File | null>(null);
  const [manualImagePreview, setManualImagePreview] = useState<string | null>(null);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [isLoadingFavs, setIsLoadingFavs] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('ai');
      setStep('input');
      setIsAnalyzing(false);
      setIsSaving(false);
      setTextInput('');
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      setSaveAsFavorite(false);
      setIsDropdownOpen(false);
      setManualImageFile(null);
      setManualImagePreview(null);
      setManualData({ name: '', calories: 0, protein: 0, fats: 0, carbs: 0, emoji: '🍽️' });
    }
  }, [isOpen]);

  // Fetch favorites when switching to manual tab
  useEffect(() => {
    if (isOpen && activeTab === 'manual' && favorites.length === 0) {
      const fetchFavs = async () => {
        setIsLoadingFavs(true);
        try {
          const data = await getFavoriteMeals();
          setFavorites(data);
        } catch (err) {
          console.error('Failed to load favorites', err);
        } finally {
          setIsLoadingFavs(false);
        }
      };
      fetchFavs();
    }
  }, [isOpen, activeTab, favorites.length]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else if (!isSaving && !isAnalyzing) {
          close();
        }
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close, isSaving, isAnalyzing, isDropdownOpen]);

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

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setManualImageFile(file);
      setManualImagePreview(URL.createObjectURL(file));
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
        const base64 = await compressImage(imageFile);
        imageParam = { base64, mimeType: 'image/jpeg' };
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

  // Helper to add meal to Zustand store
  const addMealToStore = (savedDbMeal: any, finalImageUrl: string | null, isAI: boolean) => {
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
      isAI,
    };
    addMeal(newMeal);
  };

  const handleAISave = async () => {
    if (!reviewData.name.trim() || reviewData.calories <= 0) {
      setError('Введите корректное название и количество калорий (больше 0).');
      return;
    }
    if (reviewData.protein < 0 || reviewData.fats < 0 || reviewData.carbs < 0) {
      setError('БЖУ не могут быть отрицательными.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let finalImageUrl = null;
      if (imageFile) {
        const base64 = await compressImage(imageFile);
        finalImageUrl = await uploadMealImage(base64, 'image/jpeg');
      }

      const savedDbMeal = await saveMeal({
        name: reviewData.name,
        calories: reviewData.calories,
        protein: reviewData.protein,
        fats: reviewData.fats,
        carbs: reviewData.carbs,
        emoji: reviewData.emoji,
        image_url: finalImageUrl,
        is_ai: true,
      });

      addMealToStore(savedDbMeal, finalImageUrl, true);
      router.refresh();
      close();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении блюда. Попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!manualData.name.trim() || manualData.calories <= 0) {
      setError('Введите корректное название и количество калорий (больше 0).');
      return;
    }
    if (manualData.protein < 0 || manualData.fats < 0 || manualData.carbs < 0) {
      setError('БЖУ не могут быть отрицательными.');
      return;
    }
    if (saveAsFavorite) {
      const nameTrimmed = manualData.name.trim().toLowerCase();
      const alreadyExists = favorites.some(fav => fav.name.trim().toLowerCase() === nameTrimmed);
      if (alreadyExists) {
        setError('Шаблон с таким названием уже существует в Избранном.');
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);

      let finalImageUrl = manualImagePreview && manualImagePreview.startsWith('http') ? manualImagePreview : null;
      if (manualImageFile) {
        const base64 = await compressImage(manualImageFile);
        finalImageUrl = await uploadMealImage(base64, 'image/jpeg');
      }

      const { meal, favoriteMeal } = await saveManualMeal({
        name: manualData.name,
        calories: manualData.calories,
        protein: manualData.protein,
        fats: manualData.fats,
        carbs: manualData.carbs,
        emoji: manualData.emoji,
        image_url: finalImageUrl,
      }, saveAsFavorite);

      if (favoriteMeal) {
        setFavorites(prev => [favoriteMeal, ...prev]);
      }

      addMealToStore(meal, finalImageUrl, false);
      router.refresh();
      close();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении блюда.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFavoriteClick = (fav: FavoriteMeal) => {
    setManualData({
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein,
      fats: fav.fats,
      carbs: fav.carbs,
      emoji: fav.emoji || '🍽️',
    });
    if (fav.image_url) {
      setManualImagePreview(fav.image_url);
      setManualImageFile(null);
    } else {
      setManualImagePreview(null);
      setManualImageFile(null);
    }
    setSaveAsFavorite(false); // Already in favorites
    setError(null);
  };

  const handleDeleteFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteFavoriteMeal(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      console.error('Failed to delete favorite', err);
      setError(err.message || 'Ошибка при удалении шаблона.');
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold text-[#3D4A3C]">Добавить приём пищи</h2>
          <button
            onClick={close}
            className="p-1.5 rounded-full text-[#3D4A3C]/40 hover:text-[#3D4A3C] hover:bg-[#3D4A3C]/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 shrink-0 bg-[#FAF6F1] p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${
              activeTab === 'ai' ? 'bg-white shadow-sm text-[#6B9E6A]' : 'text-[#3D4A3C]/50 hover:text-[#3D4A3C]'
            }`}
          >
            ИИ Анализ
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${
              activeTab === 'manual' ? 'bg-white shadow-sm text-[#6B9E6A]' : 'text-[#3D4A3C]/50 hover:text-[#3D4A3C]'
            }`}
          >
            Вручную
          </button>
        </div>

        {error && (
          <div className="mb-4 shrink-0 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="overflow-y-auto flex-1 pb-2 scrollbar-hide">
          {/* AI TAB */}
          {activeTab === 'ai' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              {step === 'input' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#3D4A3C]/50 mb-1.5 uppercase tracking-wide">
                      Опишите блюдо
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      disabled={isAnalyzing}
                      placeholder="Например: «Большой чизбургер с картошкой фри»"
                      rows={3}
                      className="w-full rounded-2xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-4 py-3 text-sm text-[#3D4A3C] placeholder:text-[#3D4A3C]/30 focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40 resize-none transition-all disabled:opacity-60"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#3D4A3C]/10" />
                    <span className="text-[11px] font-medium text-[#3D4A3C]/30 uppercase">или</span>
                    <div className="flex-1 h-px bg-[#3D4A3C]/10" />
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isAnalyzing}
                  />
                  
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-[#3D4A3C]/10">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        disabled={isAnalyzing}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzing}
                      className="w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#6B9E6A]/30 bg-[#6B9E6A]/5 px-4 py-4 text-sm font-semibold text-[#6B9E6A] hover:bg-[#6B9E6A]/10 transition-all disabled:opacity-60"
                    >
                      <Camera className="w-5 h-5" />
                      Сделать фото или выбрать из галереи
                    </button>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!textInput.trim() && !imageFile)}
                    className="w-full flex items-center justify-center gap-2 mt-2 rounded-2xl bg-[#6B9E6A] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6B9E6A]/30 hover:bg-[#5E8E5E] active:scale-[0.97] transition-all disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-4.5 h-4.5 animate-spin" />ИИ анализирует...</>
                    ) : (
                      <><Sparkles className="w-4.5 h-4.5" />Анализировать с ИИ</>
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
                    <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Калории (Ккал)</label>
                    <input
                      type="number"
                      min="1"
                      value={reviewData.calories === 0 ? '' : reviewData.calories}
                      onChange={(e) => setReviewData(prev => ({ ...prev, calories: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#E85D5D] uppercase mb-1">Белки (г)</label>
                      <input
                        type="number"
                        min="0"
                        value={reviewData.protein === 0 ? '' : reviewData.protein}
                        onChange={(e) => setReviewData(prev => ({ ...prev, protein: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#E85D5D]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#F0C246] uppercase mb-1">Жиры (г)</label>
                      <input
                        type="number"
                        min="0"
                        value={reviewData.fats === 0 ? '' : reviewData.fats}
                        onChange={(e) => setReviewData(prev => ({ ...prev, fats: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#F0C246]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#C4A46C] uppercase mb-1">Углеводы (г)</label>
                      <input
                        type="number"
                        min="0"
                        value={reviewData.carbs === 0 ? '' : reviewData.carbs}
                        onChange={(e) => setReviewData(prev => ({ ...prev, carbs: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#C4A46C]/40"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setStep('input')}
                      disabled={isSaving}
                      className="flex-1 rounded-2xl border-2 border-[#3D4A3C]/10 bg-white px-4 py-3.5 text-sm font-bold text-[#3D4A3C] hover:bg-[#FAF6F1] transition-all disabled:opacity-60"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleAISave}
                      disabled={isSaving}
                      className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-[#6B9E6A] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6B9E6A]/30 hover:bg-[#5E8E5E] active:scale-[0.97] transition-all disabled:opacity-60"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      Сохранить
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MANUAL TAB */}
          {activeTab === 'manual' && (
            <div className="flex flex-col gap-5 animate-in fade-in">
              
              {/* Favorites Section */}
              <div>
                <h3 className="text-xs font-semibold text-[#3D4A3C]/50 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  Избранное
                </h3>
                {isLoadingFavs ? (
                  <div className="h-16 flex items-center justify-center text-[#3D4A3C]/40 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Загрузка...
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="h-16 flex items-center justify-center text-[#3D4A3C]/40 text-sm bg-[#FAF6F1] rounded-2xl border border-[#3D4A3C]/5">
                    Нет сохраненных шаблонов
                  </div>
                ) : favorites.length <= MAX_VISIBLE_FAVORITES ? (
                  /* Condition 1: Horizontal list */
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {favorites.map((fav) => (
                      <div
                        key={fav.id}
                        onClick={() => handleFavoriteClick(fav)}
                        className="group relative flex items-center gap-2 bg-white border border-[#3D4A3C]/10 pl-3 pr-8 py-2 rounded-xl shrink-0 snap-start hover:border-[#6B9E6A]/40 hover:bg-[#FAF6F1] cursor-pointer transition-all"
                      >
                        <span className="text-xl">{fav.emoji || '🍽️'}</span>
                        <div className="text-left flex flex-col">
                          <span className="text-xs font-bold text-[#3D4A3C] truncate max-w-[100px]">{fav.name}</span>
                          <span className="text-[10px] text-[#3D4A3C]/50 font-medium">{fav.calories} ккал</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteFavorite(fav.id, e)}
                          className="absolute right-2 text-[#3D4A3C]/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Удалить шаблон"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Condition 2: Stylish button opening Dialog/Dropdown */
                  <button
                    onClick={() => setIsDropdownOpen(true)}
                    className="w-full flex items-center justify-between bg-[#FAF6F1] border border-[#3D4A3C]/10 px-4 py-3.5 rounded-2xl hover:border-[#6B9E6A]/40 hover:bg-[#F5EFE6] active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white rounded-xl shadow-xs text-[#F0C246] group-hover:scale-105 transition-transform">
                        <Bookmark className="w-4.5 h-4.5 fill-current" />
                      </div>
                      <span className="text-sm font-bold text-[#3D4A3C]">Избранные шаблоны</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#6B9E6A] text-white text-xs font-bold rounded-full shadow-xs">
                        {favorites.length}
                      </span>
                      <span className="text-xs font-semibold text-[#3D4A3C]/40 group-hover:text-[#3D4A3C]/60 transition-colors">
                        Открыть список →
                      </span>
                    </div>
                  </button>
                )}
              </div>

              <div className="h-px bg-[#3D4A3C]/10" />

              {/* Form */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Название блюда</label>
                  <input
                    type="text"
                    value={manualData.name}
                    onChange={(e) => setManualData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-medium text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                    placeholder="Омлет"
                  />
                </div>
                <div className="w-16">
                  <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Emoji</label>
                  <input
                    type="text"
                    value={manualData.emoji}
                    onChange={(e) => setManualData(prev => ({ ...prev, emoji: e.target.value }))}
                    className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-2 py-2.5 text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Калории (Ккал)</label>
                <input
                  type="number"
                  min="1"
                  value={manualData.calories === 0 ? '' : manualData.calories}
                  onChange={(e) => setManualData(prev => ({ ...prev, calories: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#E85D5D] uppercase mb-1">Белки (г)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualData.protein === 0 ? '' : manualData.protein}
                    onChange={(e) => setManualData(prev => ({ ...prev, protein: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#E85D5D]/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#F0C246] uppercase mb-1">Жиры (г)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualData.fats === 0 ? '' : manualData.fats}
                    onChange={(e) => setManualData(prev => ({ ...prev, fats: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#F0C246]/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#C4A46C] uppercase mb-1">Углеводы (г)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualData.carbs === 0 ? '' : manualData.carbs}
                    onChange={(e) => setManualData(prev => ({ ...prev, carbs: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full rounded-xl border border-[#3D4A3C]/10 bg-[#FAF6F1] px-3 py-2.5 text-sm font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#C4A46C]/40"
                  />
                </div>
              </div>

              {/* Optional Image Upload */}
              <div>
                <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Фото блюда (необязательно)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={manualFileInputRef}
                  onChange={handleManualFileChange}
                  disabled={isSaving}
                />
                {manualImagePreview ? (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-[#3D4A3C]/10">
                    <img src={manualImagePreview} alt="Manual Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setManualImageFile(null); setManualImagePreview(null); }}
                      disabled={isSaving}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => manualFileInputRef.current?.click()}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#3D4A3C]/20 bg-[#FAF6F1] px-3 py-3 text-xs font-semibold text-[#3D4A3C]/60 hover:bg-[#F5EFE6] hover:border-[#6B9E6A]/40 transition-all disabled:opacity-60"
                  >
                    <Camera className="w-4 h-4 text-[#6B9E6A]" />
                    Добавить фото
                  </button>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setSaveAsFavorite(!saveAsFavorite)}
                  className={`flex items-center justify-center p-3.5 rounded-2xl border-2 transition-all ${
                    saveAsFavorite 
                      ? 'border-[#F0C246] bg-[#F0C246]/10 text-[#F0C246]' 
                      : 'border-[#3D4A3C]/10 bg-white text-[#3D4A3C]/40 hover:bg-[#FAF6F1]'
                  }`}
                  title="Сохранить в избранное"
                >
                  <Bookmark className={`w-5 h-5 ${saveAsFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#6B9E6A] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6B9E6A]/30 hover:bg-[#5E8E5E] active:scale-[0.97] transition-all disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Добавить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Favorites Dropdown / Dialog Modal */}
      {isDropdownOpen && (
        <div
          onClick={() => setIsDropdownOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-xs animate-in fade-in duration-200 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#3D4A3C]/10 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#F0C246] fill-current" />
                <h3 className="text-base font-bold text-[#3D4A3C]">Библиотека избранного</h3>
              </div>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="p-1.5 rounded-full text-[#3D4A3C]/40 hover:text-[#3D4A3C] hover:bg-[#3D4A3C]/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 flex flex-col gap-2 scrollbar-hide">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => {
                    handleFavoriteClick(fav);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center justify-between bg-[#FAF6F1] border border-[#3D4A3C]/5 p-3 rounded-2xl hover:border-[#6B9E6A]/40 hover:bg-[#F5EFE6] cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-2xl shrink-0">{fav.emoji || '🍽️'}</span>
                    <div className="text-left flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-[#3D4A3C] truncate">{fav.name}</span>
                      <span className="text-xs text-[#3D4A3C]/50 font-medium truncate">
                        {fav.calories} ккал • Белки: {fav.protein}г • Жиры: {fav.fats}г • Угл: {fav.carbs}г
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteFavorite(fav.id, e)}
                    className="p-2 text-[#3D4A3C]/30 hover:text-red-500 hover:bg-white rounded-xl transition-all shrink-0"
                    title="Удалить шаблон"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
