'use client';

import WeekDaySelector from '@/src/components/Dashboard/WeekDaySelector';
import NutritionCard from '@/src/components/Dashboard/NutritionCard';
import type { NutritionData } from '@/src/components/Dashboard/NutritionCard';
import MealCard from '@/src/components/Dashboard/MealCard';
import type { MealData } from '@/src/components/Dashboard/MealCard';
import BottomNavBar from '@/src/components/Dashboard/BottomNavBar';
import AddMealModal from '@/src/components/Dashboard/AddMealModal';

/* ── Mock Data ───────────────────────────────────── */

const MOCK_NUTRITION: NutritionData = {
  caloriesGoal: 2000,
  caloriesRemaining: 1532,
  proteinGoal: 160,
  proteinRemaining: 140,
  fatsGoal: 60,
  fatsRemaining: 44,
  carbsGoal: 150,
  carbsRemaining: 90,
};

const MOCK_MEALS: MealData[] = [
  {
    id: '1',
    name: 'Отварные яйца с огурцом и помидором',
    calories: 268,
    protein: 20,
    fats: 16,
    carbs: 10,
    time: '13:24',
    imageUrl: null,
    emoji: '🥚',
  },
  {
    id: '2',
    name: 'Лимонад Ava Orangelo',
    calories: 200,
    protein: 0,
    fats: 0,
    carbs: 50,
    time: '01:15',
    imageUrl: null,
    emoji: '🍋',
  },
  {
    id: '3',
    name: 'Овсянка с бананом и мёдом',
    calories: 320,
    protein: 8,
    fats: 6,
    carbs: 58,
    time: '08:30',
    imageUrl: null,
    emoji: '🥣',
  },
];

/* ── Component ───────────────────────────────────── */

interface DashboardClientProps {
  userEmail: string;
}

export default function DashboardClient({ userEmail }: DashboardClientProps) {
  const firstName = userEmail.split('@')[0];

  return (
    <div className="relative min-h-dvh bg-[#FAF6F1] pb-28">
      {/* Greeting */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[13px] text-[#5C6B4F]/60 font-medium">
          Привет 👋
        </p>
        <h1 className="text-xl font-bold text-[#3D4A3C] capitalize">
          {firstName}
        </h1>
      </div>

      {/* Week day selector */}
      <WeekDaySelector />

      {/* Nutrition summary card */}
      <div className="mt-2">
        <NutritionCard data={MOCK_NUTRITION} />
      </div>

      {/* Meals list */}
      <section className="mt-6 px-4">
        <h2 className="text-base font-bold text-[#3D4A3C] mb-3">
          Блюда за 11 мая
        </h2>
        <div className="flex flex-col gap-3">
          {MOCK_MEALS.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </section>

      {/* Bottom nav */}
      <BottomNavBar />

      {/* Add meal modal */}
      <AddMealModal />
    </div>
  );
}
