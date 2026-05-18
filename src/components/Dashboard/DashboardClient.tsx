'use client';

import React, { useEffect, useState } from 'react';
import WeekDaySelector from '@/src/components/Dashboard/WeekDaySelector';
import NutritionCard from '@/src/components/Dashboard/NutritionCard';
import MealCard from '@/src/components/Dashboard/MealCard';
import BottomNavBar from '@/src/components/Dashboard/BottomNavBar';
import AddMealModal from '@/src/components/Dashboard/AddMealModal';
import SettingsModal from '@/src/components/Dashboard/SettingsModal';
import FavoritesModal from '@/src/components/Dashboard/FavoritesModal';
import { useDashboardStore, ClientMeal } from '@/src/store/dashboardStore';

interface DashboardClientProps {
  userEmail: string;
  rawMeals: any[];
}

export default function DashboardClient({ userEmail, rawMeals }: DashboardClientProps) {
  const firstName = userEmail.split('@')[0];
  const [mounted, setMounted] = useState(false);

  // Получаем локальную дату безопасно
  const getLocalDateString = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const todayString = getLocalDateString(new Date());

  /* Zustand store selectors */
  const meals = useDashboardStore((s) => s.meals);
  const selectedDate = useDashboardStore((s) => s.selectedDate) || todayString;
  const setSelectedDate = useDashboardStore((s) => s.setSelectedDate);
  const setInitialMeals = useDashboardStore((s) => s.setInitialMeals);
  
  const caloriesGoal = useDashboardStore((s) => s.caloriesGoal);
  const proteinGoal = useDashboardStore((s) => s.proteinGoal);
  const fatsGoal = useDashboardStore((s) => s.fatsGoal);
  const carbsGoal = useDashboardStore((s) => s.carbsGoal);

  // Гидратация серверных блюд в клиентский стор Zustand при загрузке страницы
  useEffect(() => {
    const initialMeals: ClientMeal[] = rawMeals.map((m) => {
      const d = new Date(m.createdAt);
      return {
        id: m.id,
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        fats: m.fats,
        carbs: m.carbs,
        emoji: m.emoji,
        imageUrl: m.imageUrl,
        isAI: m.isAI,
        time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        dateString: getLocalDateString(d),
      };
    });
    setInitialMeals(initialMeals);
    if (!useDashboardStore.getState().selectedDate) {
      setSelectedDate(todayString);
    }
    setMounted(true);
  }, [rawMeals, setInitialMeals, setSelectedDate, todayString]);

  /* Dynamic calculations (защита от ошибки Hydration failed) */
  const displayMeals = (mounted ? meals : []).filter(m => m.dateString === selectedDate);
  
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

  // Получаем красивое название выбранного дня
  const getSelectedDayTitle = () => {
    if (selectedDate === todayString) return 'Блюда за сегодня';
    const d = new Date(selectedDate);
    return `Блюда за ${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`;
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
          {getSelectedDayTitle()}
        </h2>
        <div className="flex flex-col gap-3">
          {displayMeals.length > 0 ? (
            displayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          ) : (
            mounted && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm shadow-[#3D4A3C]/5">
                <span className="text-3xl mb-2 block">🍃</span>
                <p className="text-[#3D4A3C]/60 text-sm font-medium">В этот день записей нет</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Bottom nav */}
      <BottomNavBar />

      {/* Add meal modal */}
      <AddMealModal />

      {/* Settings modal */}
      <SettingsModal />

      {/* Favorites library modal */}
      <FavoritesModal />
    </div>
  );
}

