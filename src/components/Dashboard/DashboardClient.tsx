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
import { useLanguage } from '@/src/contexts/LanguageContext';

interface DashboardClientProps {
  userEmail: string;
  rawMeals: { id: string; name: string; calories: number; protein: number; fats: number; carbs: number; createdAt: string; emoji: string; imageUrl: string | null; isAI: boolean }[];
}

export default function DashboardClient({ userEmail, rawMeals }: DashboardClientProps) {
  const { t, language } = useLanguage();
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    caloriesRemaining: caloriesGoal - caloriesConsumed,
    proteinGoal,
    proteinRemaining: proteinGoal - proteinConsumed,
    fatsGoal,
    fatsRemaining: fatsGoal - fatsConsumed,
    carbsGoal,
    carbsRemaining: carbsGoal - carbsConsumed,
  };

  // Получаем красивое название выбранного дня
  const getSelectedDayTitle = () => {
    if (selectedDate === todayString) return t('meals_today');
    const d = new Date(selectedDate);
    const locale = language === 'en' ? 'en-US' : 'ru-RU';
    return `${t('meals_for')} ${d.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`;
  };

  if (!mounted) {
    return (
      <div className="relative min-h-dvh bg-[#FAF6F1] pb-40 animate-pulse">
        {/* Greeting placeholder */}
        <div className="px-5 pt-4 pb-1">
          <div className="h-4 w-20 bg-[#3D4A3C]/10 rounded mb-2"></div>
          <div className="h-6 w-32 bg-[#3D4A3C]/15 rounded"></div>
        </div>

        {/* Week day selector placeholder */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex gap-2 flex-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="w-10 h-14 bg-[#3D4A3C]/10 rounded-2xl"></div>
            ))}
          </div>
        </div>

        {/* Card placeholder */}
        <div className="mx-4 mt-2 h-44 bg-[#6B9E6A]/30 rounded-3xl"></div>

        {/* Meals title placeholder */}
        <div className="mt-6 px-4">
          <div className="h-5 w-40 bg-[#3D4A3C]/15 rounded mb-3"></div>
          <div className="flex flex-col gap-3">
            <div className="h-20 bg-white rounded-2xl shadow-sm"></div>
            <div className="h-20 bg-white rounded-2xl shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[#FAF6F1] pb-40">
      {/* Greeting */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[13px] text-[#5C6B4F]/60 font-medium">
          {t('greeting')}
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
                <p className="text-[#3D4A3C]/60 text-sm font-medium">{t('no_records')}</p>
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

