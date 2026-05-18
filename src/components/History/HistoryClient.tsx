'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import BottomNavBar from '@/src/components/Dashboard/BottomNavBar';
import MealCard from '@/src/components/Dashboard/MealCard';
import { ClientMeal } from '@/src/store/dashboardStore';
import { useDashboardStore } from '@/src/store/dashboardStore';
import { getMealsByDateRange } from '@/src/actions/meals';
import { useLanguage } from '@/src/contexts/LanguageContext';

export interface HistoryMeal extends ClientMeal {
  dateString: string;
}

interface HistoryClientProps {
  userEmail: string;
}

export default function HistoryClient({ userEmail }: HistoryClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t, language } = useLanguage();
  
  // Получаем локальную дату в формате YYYY-MM-DD безопасно, учитывая timezone
  const getLocalDateString = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(getLocalDateString(new Date()));
  const [historyMeals, setHistoryMeals] = useState<HistoryMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const caloriesGoal = useDashboardStore((s) => s.caloriesGoal);

  // Календарная логика
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Корректируем firstDayOfMonth чтобы неделя начиналась с понедельника
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    t('month_0'), t('month_1'), t('month_2'), t('month_3'), t('month_4'), t('month_5'),
    t('month_6'), t('month_7'), t('month_8'), t('month_9'), t('month_10'), t('month_11')
  ];

  const fetchMonthMeals = async () => {
    setIsLoading(true);
    // Берем начало текущего просматриваемого месяца и начало следующего (по локальному времени клиента!)
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);
    
    // Передаем точные ISO строки (в UTC) на сервер, чтобы БД отфильтровала ровно то, что нужно
    const dbMeals = await getMealsByDateRange(startDate.toISOString(), endDate.toISOString());
    
    const mapped = dbMeals.map((m) => {
      const d = new Date(m.created_at);
      const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      return {
        id: m.id,
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        fats: m.fats,
        carbs: m.carbs,
        emoji: m.emoji || '🍽️',
        imageUrl: m.image_url,
        isAI: m.is_ai,
        time,
        dateString: getLocalDateString(d),
      };
    });
    
    setHistoryMeals(mapped);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMonthMeals();
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Группируем блюда по датам
  const mealsByDate = historyMeals.reduce((acc, meal) => {
    if (!acc[meal.dateString]) {
      acc[meal.dateString] = [];
    }
    acc[meal.dateString].push(meal);
    return acc;
  }, {} as Record<string, HistoryMeal[]>);

  // Получаем блюда для выбранного дня
  const selectedMeals = selectedDate ? (mealsByDate[selectedDate] || []) : [];
  const selectedCalories = selectedMeals.reduce((sum, m) => sum + m.calories, 0);

  const renderCalendarDays = () => {
    const days = [];
    
    // Пустые ячейки для сдвига первого дня месяца
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14"></div>);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      // Корректируем timezone offset для правильного ISO стринга
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const dateString = new Date(dateObj.getTime() - tzOffset).toISOString().split('T')[0];
      
      const dayMeals = mealsByDate[dateString] || [];
      const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
      const isOverLimit = totalCalories > caloriesGoal;
      const hasData = dayMeals.length > 0;
      const isSelected = selectedDate === dateString;

      let bgColor = 'bg-white';
      let textColor = 'text-[#3D4A3C]';
      
      if (isSelected) {
        bgColor = 'bg-[#3D4A3C]';
        textColor = 'text-white';
      } else if (hasData) {
        bgColor = isOverLimit ? 'bg-[#E85D5D]/10' : 'bg-[#6B9E6A]/10';
      }

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(dateString)}
          className={`h-14 rounded-xl flex flex-col items-center justify-center border ${isSelected ? 'border-[#3D4A3C]' : 'border-transparent'} transition-all ${bgColor}`}
        >
          <span className={`text-[15px] font-bold ${textColor}`}>{day}</span>
          {hasData && (
            <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-white/80' : (isOverLimit ? 'text-[#E85D5D]' : 'text-[#6B9E6A]')}`}>
              {totalCalories}
            </span>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative min-h-dvh bg-[#FAF6F1] pb-40">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-[#3D4A3C]">{t('history_title')}</h1>
        <p className="text-[13px] text-[#5C6B4F]/60 font-medium mt-1">
          {t('history_desc')}
        </p>
      </div>

      {/* Calendar Card */}
      <div className="mx-4 bg-white rounded-3xl p-5 shadow-sm shadow-[#3D4A3C]/5">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 bg-[#FAF6F1] rounded-full text-[#3D4A3C] hover:bg-[#E8DFD0] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[17px] font-bold text-[#3D4A3C]">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 bg-[#FAF6F1] rounded-full text-[#3D4A3C] hover:bg-[#E8DFD0] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {[t('day_0'), t('day_1'), t('day_2'), t('day_3'), t('day_4'), t('day_5'), t('day_6')].map((d) => (
            <div key={d} className="text-[11px] font-bold text-[#3D4A3C]/40 truncate">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="relative min-h-[250px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-[#6B9E6A]" />
            </div>
          )}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* Selected Day Summary */}
      {selectedDate && (
        <section className="mt-8 px-4">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-lg font-bold text-[#3D4A3C]">
              {new Date(selectedDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long' })}
            </h2>
            <div className="text-right">
              <span className={`text-[15px] font-bold ${selectedCalories > caloriesGoal ? 'text-[#E85D5D]' : 'text-[#6B9E6A]'}`}>
                {selectedCalories} 
              </span>
              <span className="text-[11px] font-medium text-[#3D4A3C]/50 ml-1">
                / {caloriesGoal} {t('kcal').toLowerCase()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {selectedMeals.length > 0 ? (
              selectedMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm shadow-[#3D4A3C]/5">
                <span className="text-3xl mb-2 block">🍃</span>
                <p className="text-[#3D4A3C]/60 text-sm font-medium">{t('no_records')}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom nav */}
      <BottomNavBar />
    </div>
  );
}
