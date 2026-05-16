'use client';

import { Flame, Sparkles } from 'lucide-react';

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
  return (
    <div
      id={`meal-card-${meal.id}`}
      className="flex items-center gap-3.5 bg-white rounded-2xl p-3 shadow-sm shadow-[#3D4A3C]/5 transition-all hover:shadow-md active:scale-[0.98]"
    >
      {/* Meal thumbnail */}
      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-[#E8DFD0] to-[#D4C9B8] flex items-center justify-center">
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
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
          <div className="flex items-center gap-1.5 shrink-0">
            {meal.isAI && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#6B9E6A] bg-[#6B9E6A]/10 px-2 py-0.5 rounded-full border border-[#6B9E6A]/20">
                <Sparkles className="w-3 h-3 text-[#6B9E6A]" />
                AI
              </span>
            )}
            <span className="text-[11px] font-medium text-[#6B9E6A] bg-[#6B9E6A]/10 px-2 py-0.5 rounded-full">
              {meal.time}
            </span>
          </div>
        </div>


        <div className="flex items-center gap-1 mb-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[15px] font-bold text-[#3D4A3C]">
            {meal.calories}
          </span>
          <span className="text-[11px] text-[#3D4A3C]/50 font-medium">
            Ккал
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#3D4A3C]/45 font-medium">
          <span>
            <span className="text-[#3D4A3C]/70 font-semibold">{meal.protein}г</span>{' '}
            Белки
          </span>
          <span>
            <span className="text-[#3D4A3C]/70 font-semibold">{meal.fats}г</span>{' '}
            Жиры
          </span>
          <span>
            <span className="text-[#3D4A3C]/70 font-semibold">{meal.carbs}г</span>{' '}
            Углеводы
          </span>
        </div>
      </div>
    </div>
  );
}
