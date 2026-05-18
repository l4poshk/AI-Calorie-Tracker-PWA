'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Bookmark, Edit, Trash2, Camera, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { getFavoriteMeals, deleteFavoriteMeal, updateFavoriteMeal, uploadMealImage } from '@/src/actions/meals';
import { FavoriteMeal } from '@/src/types/supabase';
import { compressImage } from '@/src/utils/image';
import { useRouter } from 'next/navigation';

export default function FavoritesModal() {
  const isOpen = useUIStore((s) => s.isFavoritesOpen);
  const close = useUIStore((s) => s.closeFavorites);
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingFavId, setEditingFavId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    emoji: '🍽️',
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchFavs = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getFavoriteMeals();
          setFavorites(data);
        } catch (err: any) {
          setError('Не удалось загрузить избранные блюда.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFavs();
      setEditingFavId(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) close();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close, isSaving]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isSaving) close();
  };

  const handleStartEdit = (fav: FavoriteMeal) => {
    setEditingFavId(fav.id);
    setEditData({
      name: fav.name,
      emoji: fav.emoji || '🍽️',
      calories: fav.calories,
      protein: fav.protein,
      fats: fav.fats,
      carbs: fav.carbs,
    });
    setEditImagePreview(fav.image_url || null);
    setEditImageFile(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingFavId(null);
    setEditImageFile(null);
    setEditImagePreview(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSaveEdit = async (fav: FavoriteMeal) => {
    if (!editData.name.trim() || editData.calories <= 0) {
      setError('Введите корректное название и калории (больше 0).');
      return;
    }
    if (editData.protein < 0 || editData.fats < 0 || editData.carbs < 0) {
      setError('БЖУ не могут быть отрицательными.');
      return;
    }

    // Check duplicate name if name changed
    if (editData.name.trim().toLowerCase() !== fav.name.trim().toLowerCase()) {
      const nameTrimmed = editData.name.trim().toLowerCase();
      const alreadyExists = favorites.some(f => f.id !== fav.id && f.name.trim().toLowerCase() === nameTrimmed);
      if (alreadyExists) {
        setError('Шаблон с таким названием уже существует.');
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);

      let finalImageUrl = editImagePreview && editImagePreview.startsWith('http') ? editImagePreview : null;
      if (editImageFile) {
        const base64 = await compressImage(editImageFile);
        finalImageUrl = await uploadMealImage(base64, 'image/jpeg');
      }

      const updatedFav = await updateFavoriteMeal(fav.id, {
        name: editData.name.trim(),
        emoji: editData.emoji,
        calories: editData.calories,
        protein: editData.protein,
        fats: editData.fats,
        carbs: editData.carbs,
        image_url: finalImageUrl,
      });

      setFavorites(prev => prev.map(f => f.id === fav.id ? updatedFav : f));
      setEditingFavId(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении изменений.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFavoriteMeal(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
      if (editingFavId === id) {
        handleCancelEdit();
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении шаблона.');
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FAF6F1] rounded-xl text-[#F0C246] border border-[#3D4A3C]/5">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3D4A3C]">Избранные блюда</h2>
              <p className="text-xs text-[#3D4A3C]/50">Управление вашими шаблонами</p>
            </div>
          </div>
          <button
            onClick={close}
            disabled={isSaving}
            className="p-1.5 rounded-full text-[#3D4A3C]/40 hover:text-[#3D4A3C] hover:bg-[#3D4A3C]/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 shrink-0 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1 flex flex-col gap-3.5 scrollbar-hide">
          {isLoading ? (
            <div className="h-32 flex flex-col items-center justify-center text-[#3D4A3C]/40 text-sm gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#6B9E6A]" />
              Загрузка шаблонов...
            </div>
          ) : favorites.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-[#3D4A3C]/40 text-sm bg-[#FAF6F1] rounded-2xl border border-[#3D4A3C]/5 p-6 text-center">
              У вас пока нет сохраненных избранных блюд. Добавляйте их при создании приемов пищи!
            </div>
          ) : (
            favorites.map((fav) => {
              const isEditing = editingFavId === fav.id;

              if (isEditing) {
                return (
                  <div
                    key={fav.id}
                    className="bg-[#FAF6F1] border-2 border-[#6B9E6A]/40 rounded-2xl p-4 flex flex-col gap-3.5 animate-in fade-in duration-200 shadow-sm shrink-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#6B9E6A] uppercase tracking-wide">Редактирование шаблона</span>
                      <button
                        onClick={() => handleDelete(fav.id)}
                        disabled={isSaving}
                        className="p-1.5 text-[#3D4A3C]/30 hover:text-red-500 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        title="Удалить шаблон"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Edit Section */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isSaving}
                      />
                      {editImagePreview ? (
                        <div className="relative w-full h-36 shrink-0 rounded-xl overflow-hidden border border-[#3D4A3C]/10 group">
                          <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isSaving}
                              className="p-2 bg-white/90 hover:bg-white text-[#3D4A3C] rounded-full shadow-md transition-all scale-95 hover:scale-105"
                              title="Изменить фото"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                              disabled={isSaving}
                              className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full shadow-md transition-all scale-95 hover:scale-105"
                              title="Удалить фото"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSaving}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#3D4A3C]/20 bg-white px-3 py-4 text-xs font-semibold text-[#3D4A3C]/60 hover:bg-[#FAF6F1] hover:border-[#6B9E6A]/40 transition-all disabled:opacity-60"
                        >
                          <Camera className="w-4 h-4 text-[#6B9E6A]" />
                          Добавить фото блюда
                        </button>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="flex gap-2.5">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Название</label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={isSaving}
                          className="w-full rounded-xl border border-[#3D4A3C]/10 bg-white px-3 py-2 text-sm font-medium text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40 disabled:opacity-60"
                        />
                      </div>
                      <div className="w-16">
                        <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Emoji</label>
                        <input
                          type="text"
                          value={editData.emoji}
                          onChange={(e) => setEditData(prev => ({ ...prev, emoji: e.target.value }))}
                          disabled={isSaving}
                          className="w-full rounded-xl border border-[#3D4A3C]/10 bg-white px-2 py-2 text-base text-center focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#3D4A3C]/50 uppercase mb-1">Калории (Ккал)</label>
                      <input
                        type="number"
                        min="1"
                        value={editData.calories === 0 ? '' : editData.calories}
                        onChange={(e) => setEditData(prev => ({ ...prev, calories: Math.max(0, parseInt(e.target.value) || 0) }))}
                        disabled={isSaving}
                        className="w-full rounded-xl border border-[#3D4A3C]/10 bg-white px-3 py-2 text-sm font-bold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#6B9E6A]/40 disabled:opacity-60"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-[#E85D5D] uppercase mb-1">Белки (г)</label>
                        <input
                          type="number"
                          min="0"
                          value={editData.protein === 0 ? '' : editData.protein}
                          onChange={(e) => setEditData(prev => ({ ...prev, protein: Math.max(0, parseInt(e.target.value) || 0) }))}
                          disabled={isSaving}
                          className="w-full rounded-xl border border-[#3D4A3C]/10 bg-white px-3 py-2 text-xs font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#E85D5D]/40 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#F0C246] uppercase mb-1">Жиры (г)</label>
                        <input
                          type="number"
                          min="0"
                          value={editData.fats === 0 ? '' : editData.fats}
                          onChange={(e) => setEditData(prev => ({ ...prev, fats: Math.max(0, parseInt(e.target.value) || 0) }))}
                          disabled={isSaving}
                          className="w-full rounded-xl border border-[#3D4A3C]/10 bg-white px-3 py-2 text-xs font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#F0C246]/40 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#C4A46C] uppercase mb-1">Угл (г)</label>
                        <input
                          type="number"
                          min="0"
                          value={editData.carbs === 0 ? '' : editData.carbs}
                          onChange={(e) => setEditData(prev => ({ ...prev, carbs: Math.max(0, parseInt(e.target.value) || 0) }))}
                          disabled={isSaving}
                          className="w-full rounded-xl border border-[#3D4A3C]/10 bg-white px-3 py-2 text-xs font-semibold text-[#3D4A3C] focus:outline-none focus:ring-2 focus:ring-[#C4A46C]/40 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex-1 py-2.5 rounded-xl border border-[#3D4A3C]/10 bg-white text-xs font-bold text-[#3D4A3C] hover:bg-[#FAF6F1] transition-all disabled:opacity-60"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => handleSaveEdit(fav)}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#6B9E6A] text-xs font-bold text-white shadow-md shadow-[#6B9E6A]/30 hover:bg-[#5E8E5E] active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Сохранить
                      </button>
                    </div>
                  </div>
                );
              }

              // Normal Card View
              return (
                <div
                  key={fav.id}
                  className="bg-white border border-[#3D4A3C]/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#6B9E6A]/30 transition-all flex flex-col group shrink-0"
                >
                  {fav.image_url && (
                    <div className="relative w-full h-36 bg-[#FAF6F1] overflow-hidden border-b border-[#3D4A3C]/5">
                      <img src={fav.image_url} alt={fav.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}

                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-2xl shrink-0 p-2 bg-[#FAF6F1] rounded-2xl border border-[#3D4A3C]/5">{fav.emoji || '🍽️'}</span>
                      <div className="flex flex-col overflow-hidden text-left">
                        <span className="text-sm font-bold text-[#3D4A3C] truncate">{fav.name}</span>
                        <span className="text-xs font-extrabold text-[#6B9E6A] mt-0.5">{fav.calories} ккал</span>
                        <span className="text-[11px] text-[#3D4A3C]/50 font-medium mt-1 truncate">
                          Белки: {fav.protein}г • Жиры: {fav.fats}г • Углеводы: {fav.carbs}г
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(fav)}
                        className="p-2 text-[#3D4A3C]/40 hover:text-[#6B9E6A] hover:bg-[#FAF6F1] rounded-xl transition-all"
                        title="Редактировать шаблон"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(fav.id)}
                        className="p-2 text-[#3D4A3C]/40 hover:text-red-500 hover:bg-[#FAF6F1] rounded-xl transition-all"
                        title="Удалить шаблон"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
