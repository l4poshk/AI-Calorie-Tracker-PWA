'use client';

import { useState } from 'react';
import { Flame, Sparkles, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { useDashboardStore } from '@/src/store/dashboardStore';
import { deleteMeal } from '@/src/actions/meals';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { ClientMeal } from '@/src/store/dashboardStore';

export interface MealData {
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

interface MealCardProps {
  meal: MealData;
}

export default function MealCard({ meal }: MealCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const openAddMeal = useUIStore((s) => s.openAddMeal);
  const removeMeal = useDashboardStore((s) => s.removeMeal);
  const router = useRouter();
  const { t } = useLanguage();

  const handleEdit = () => {
    openAddMeal(meal as unknown as ClientMeal);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteMeal(meal.id);
      
      // Искусственная задержка для завершения анимации исчезновения
      setTimeout(() => {
        removeMeal(meal.id);
        router.refresh();
      }, 300); // 300ms duration for opacity/scale transition
    } catch (err) {
      console.error('Failed to delete meal', err);
      setIsDeleting(false); // Only revert if failed
    }
  };

  return (
    <div
      id={`meal-card-${meal.id}`}
      className={`flex items-center gap-3.5 bg-white rounded-2xl p-3 shadow-sm shadow-[#3D4A3C]/5 transition-all duration-300 hover:shadow-md ${
        isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Meal thumbnail */}
      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-[#E8DFD0] to-[#D4C9B8] flex items-center justify-center border border-[#3D4A3C]/5">
        {meal.imageUrl && !isImageError ? (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-full object-cover"
            onError={() => setIsImageError(true)}
          />
        ) : isImageError ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-[#E8DFD0]/40">
            <span className="text-xl mb-0.5">📸</span>
            <span className="text-[8px] font-bold text-[#3D4A3C]/40 uppercase tracking-wider">{t('archive')}</span>
          </div>
        ) : (
          <span className="text-3xl">{meal.emoji}</span>
        )}
      </div>

      {/* Meal details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[13px] font-semibold text-[#3D4A3C] leading-tight line-clamp-2">
            {meal.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {meal.isAI && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#6B9E6A] bg-[#6B9E6A]/10 px-2 py-0.5 rounded-full border border-[#6B9E6A]/20">
                <Sparkles className="w-3 h-3 text-[#6B9E6A]" />
                AI
              </span>
            )}
            <span className="text-[11px] font-medium text-[#6B9E6A] bg-[#6B9E6A]/10 px-2 py-0.5 rounded-full">
              {meal.time}
            </span>
            <div className="flex items-center gap-1 ml-1 border-l border-[#3D4A3C]/10 pl-2">
              <button
                onClick={handleEdit}
                disabled={isDeleting}
                className="p-1 text-[#3D4A3C]/30 hover:text-[#6B9E6A] transition-colors disabled:opacity-50"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 text-[#3D4A3C]/30 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>


        <div className="flex items-center gap-1 mb-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[15px] font-bold text-[#3D4A3C]">
            {meal.calories}
          </span>
          <span className="text-[11px] text-[#3D4A3C]/50 font-medium">
            {t('kcal')}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#3D4A3C]/45 font-medium">
          <span>
            <span className="text-[#3D4A3C]/70 font-semibold">{meal.protein}г</span>{' '}
            {t('protein')}
          </span>
          <span>
            <span className="text-[#3D4A3C]/70 font-semibold">{meal.fats}г</span>{' '}
            {t('fats')}
          </span>
          <span>
            <span className="text-[#3D4A3C]/70 font-semibold">{meal.carbs}г</span>{' '}
            {t('carbs')}
          </span>
        </div>

        {isImageError && (
          <p className="mt-1.5 text-[9px] text-[#3D4A3C]/40 italic leading-tight">
            {t('image_optimized')}
          </p>
        )}
      </div>
    </div>
  );
}
