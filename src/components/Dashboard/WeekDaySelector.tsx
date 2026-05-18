'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Settings } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';
import { useDashboardStore } from '@/src/store/dashboardStore';
import { useLanguage } from '@/src/contexts/LanguageContext';

const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

interface DayItem {
  dateObj: Date;
  dateNum: number;
  dayLabel: string;
  isoString: string;
}

export default function WeekDaySelector() {
  const openSettings = useUIStore((s) => s.openSettings);
  const openFavorites = useUIStore((s) => s.openFavorites);
  const selectedDate = useDashboardStore((s) => s.selectedDate);
  const setSelectedDate = useDashboardStore((s) => s.setSelectedDate);
  const { language, setLanguage } = useLanguage();
  const [days, setDays] = useState<DayItem[]>([]);

  useEffect(() => {
    // Генерируем последние 7 дней (включая сегодня)
    const generatedDays: DayItem[] = [];
    const today = new Date();
    
    // Получаем локальную дату безопасно
    const getLocalDateString = (d: Date) => {
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      generatedDays.push({
        dateObj: d,
        dateNum: d.getDate(),
        dayLabel: DAYS_SHORT[d.getDay()],
        isoString: getLocalDateString(d),
      });
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(generatedDays);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
        {days.map((day) => {
          const isSelected = selectedDate === day.isoString;
          return (
            <button
              key={day.isoString}
              id={`day-selector-${day.isoString}`}
              onClick={() => setSelectedDate(day.isoString)}
              className={`flex flex-col items-center justify-center min-w-[40px] h-[54px] rounded-2xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#6B9E6A] text-white shadow-md shadow-[#6B9E6A]/30'
                  : 'text-[#3D4A3C]/50 hover:bg-[#3D4A3C]/5'
              }`}
            >
              <span className="text-[15px] font-bold leading-tight">{day.dateNum}</span>
              <span className="text-[10px] mt-0.5 leading-tight">{day.dayLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 ml-3 shrink-0">
        {/* Языковой переключатель */}
        <div className="flex items-center bg-[#E8DFD0]/50 rounded-full p-0.5 mr-1">
          <button
            onClick={() => setLanguage('ru')}
            className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
              language === 'ru'
                ? 'bg-[#6B9E6A] text-white shadow-sm'
                : 'text-[#3D4A3C]/40 hover:text-[#3D4A3C]'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
              language === 'en'
                ? 'bg-[#6B9E6A] text-white shadow-sm'
                : 'text-[#3D4A3C]/40 hover:text-[#3D4A3C]'
            }`}
          >
            EN
          </button>
        </div>

        <button
          id="bookmark-button"
          onClick={openFavorites}
          className="p-1.5 text-[#3D4A3C]/40 hover:text-[#3D4A3C]/70 transition-colors"
        >
          <Bookmark className="w-5 h-5" />
        </button>
        <button
          id="settings-button"
          onClick={openSettings}
          className="p-1.5 text-[#3D4A3C]/40 hover:text-[#3D4A3C]/70 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
