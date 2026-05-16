'use client';

import React, { useEffect, useState } from 'react';
import WeekDaySelector from '@/src/components/Dashboard/WeekDaySelector';
import NutritionCard from '@/src/components/Dashboard/NutritionCard';
import MealCard from '@/src/components/Dashboard/MealCard';
import BottomNavBar from '@/src/components/Dashboard/BottomNavBar';
import AddMealModal from '@/src/components/Dashboard/AddMealModal';
import { useDashboardStore, ClientMeal } from '@/src/store/dashboardStore';

interface DashboardClientProps {
  userEmail: string;
  initialMeals: ClientMeal[];
}

export default function DashboardClient({ userEmail, initialMeals }: DashboardClientProps) {
  const firstName = userEmail.split('@')[0];
  const [mounted, setMounted] = useState(false);

  /* Zustand store selectors */
  const meals = useDashboardStore((s) => s.meals);
  const setInitialMeals = useDashboardStore((s) => s.setInitialMeals);
  const caloriesGoal = useDashboardStore((s) => s.caloriesGoal);
  const proteinGoal = useDashboardStore((s) => s.proteinGoal);
  const fatsGoal = useDashboardStore((s) => s.fatsGoal);
  const carbsGoal = useDashboardStore((s) => s.carbsGoal);

  // Гидратация серверных блюд в клиентский стор Zustand при загрузке страницы
  useEffect(() => {
    setInitialMeals(initialMeals);
    setMounted(true);
  }, [initialMeals, setInitialMeals]);

  /* Dynamic calculations (защита от ошибки Hydration failed) */
  // На сервере и первом рендере используем initialMeals (данные из БД), чтобы HTML совпал на 100%.
  // После монтирования переключаемся на Zustand стор для клиентской реактивности.
  const displayMeals = mounted ? meals : initialMeals;
  const caloriesConsumed = displayMeals.reduce((sum, m) => sum + m.calories, 0);
  const proteinConsumed = displayMeals.reduce((sum, m) => sum + m.protein, 0);
  const fatsConsumed = displayMeals.reduce((sum, m) => sum + m.fats, 0);
  const carbsConsumed = displayMeals.reduce((sum, m) => sum + m.carbs, 0);

  const nutritionData = {
    caloriesGoal,
    caloriesRemaining: Math.max(0, caloriesGoal - caloriesConsumed),
    proteinGoal,
    proteinRemaining: Math.max(0, proteinGoal - proteinConsumed),
    fatsGoal,
    fatsRemaining: Math.max(0, fatsGoal - fatsConsumed),
    carbsGoal,
    carbsRemaining: Math.max(0, carbsGoal - carbsConsumed),
  };

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
        <NutritionCard data={nutritionData} />
      </div>

      {/* Meals list */}
      <section className="mt-6 px-4">
        <h2 className="text-base font-bold text-[#3D4A3C] mb-3">
          Блюда за 11 мая
        </h2>
        <div className="flex flex-col gap-3">
          {displayMeals.map((meal) => (
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

