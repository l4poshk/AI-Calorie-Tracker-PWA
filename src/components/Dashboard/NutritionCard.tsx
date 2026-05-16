'use client';

import CircularProgress from '@/src/components/Dashboard/CircularProgress';
import { Flame } from 'lucide-react';

export interface NutritionData {
  caloriesGoal: number;
  caloriesRemaining: number;
  proteinGoal: number;
  proteinRemaining: number;
  fatsGoal: number;
  fatsRemaining: number;
  carbsGoal: number;
  carbsRemaining: number;
}

interface NutritionCardProps {
  data: NutritionData;
}

function MacroItem({
  label,
  remaining,
  progress,
  color,
}: {
  label: string;
  remaining: number;
  progress: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2.5 shadow-sm">
      <CircularProgress
        size={38}
        strokeWidth={3.5}
        progress={progress}
        color={color}
        trackColor="rgba(0,0,0,0.06)"
      />
      <div className="leading-tight">
        <span className="text-[#3D4A3C] text-[15px] font-bold">{remaining}</span>
        <p className="text-[#3D4A3C]/50 text-[10px] font-medium">
          {label}
          <br />
          осталось
        </p>
      </div>
    </div>
  );
}

export default function NutritionCard({ data }: NutritionCardProps) {
  const caloriesProgress =
    ((data.caloriesGoal - data.caloriesRemaining) / data.caloriesGoal) * 100;
  const proteinProgress =
    ((data.proteinGoal - data.proteinRemaining) / data.proteinGoal) * 100;
  const fatsProgress =
    ((data.fatsGoal - data.fatsRemaining) / data.fatsGoal) * 100;
  const carbsProgress =
    ((data.carbsGoal - data.carbsRemaining) / data.carbsGoal) * 100;

  return (
    <div className="mx-4 rounded-3xl bg-linear-to-br from-[#5E9E5E] to-[#7CC47C] p-5 shadow-lg shadow-[#6B9E6A]/20">
      <div className="flex items-center gap-4">
        {/* Main calories circle */}
        <div className="shrink-0">
          <CircularProgress
            size={148}
            strokeWidth={10}
            progress={caloriesProgress}
            color="#FFFFFF"
            trackColor="rgba(255,255,255,0.2)"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-white/90 text-xs font-semibold">
                  Калории
                </span>
                <Flame className="w-3.5 h-3.5 text-orange-300" />
              </div>
              <span className="text-white text-3xl font-bold tracking-tight">
                {data.caloriesRemaining.toLocaleString()}
              </span>
              <span className="text-white/60 text-[10px] font-medium">
                Калорий осталось
              </span>
            </div>
          </CircularProgress>
        </div>

        {/* Macro nutrients column */}
        <div className="flex flex-col gap-2.5 flex-1">
          <MacroItem
            label="Белков"
            remaining={data.proteinRemaining}
            progress={proteinProgress}
            color="#E85D5D"
          />
          <MacroItem
            label="Жиров"
            remaining={data.fatsRemaining}
            progress={fatsProgress}
            color="#F0C246"
          />
          <MacroItem
            label="Углеводов"
            remaining={data.carbsRemaining}
            progress={carbsProgress}
            color="#C4A46C"
          />
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-2 h-2 rounded-full bg-white" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
