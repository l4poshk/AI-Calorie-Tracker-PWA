'use client';

import { useState } from 'react';
import { Bookmark, Settings } from 'lucide-react';

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface DayItem {
  date: number;
  dayLabel: string;
}

export default function WeekDaySelector() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const days: DayItem[] = DAYS_SHORT.map((label, i) => ({
    date: 11 + i,
    dayLabel: label,
  }));

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
        {days.map((day, i) => (
          <button
            key={day.date}
            id={`day-selector-${day.date}`}
            onClick={() => setSelectedIndex(i)}
            className={`flex flex-col items-center justify-center min-w-[40px] h-[54px] rounded-2xl text-xs font-medium transition-all ${
              selectedIndex === i
                ? 'bg-[#6B9E6A] text-white shadow-md shadow-[#6B9E6A]/30'
                : 'text-[#3D4A3C]/50 hover:bg-[#3D4A3C]/5'
            }`}
          >
            <span className="text-[15px] font-bold leading-tight">{day.date}</span>
            <span className="text-[10px] mt-0.5 leading-tight">{day.dayLabel}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-3">
        <button
          id="bookmark-button"
          className="p-1.5 text-[#3D4A3C]/40 hover:text-[#3D4A3C]/70 transition-colors"
        >
          <Bookmark className="w-5 h-5" />
        </button>
        <button
          id="settings-button"
          className="p-1.5 text-[#3D4A3C]/40 hover:text-[#3D4A3C]/70 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
