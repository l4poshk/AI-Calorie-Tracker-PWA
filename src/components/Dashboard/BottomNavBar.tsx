'use client';

import { Home, Plus, BarChart3 } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';

export default function BottomNavBar() {
  const openAddMeal = useUIStore((s) => s.openAddMeal);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-md px-6 pb-6 pt-2">
        <div className="flex items-center justify-around bg-[#8B7E74]/90 backdrop-blur-xl rounded-full px-4 py-2.5 shadow-lg shadow-black/10">
          {/* Home */}
          <button
            id="nav-home"
            className="flex items-center justify-center w-11 h-11 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <Home className="w-5.5 h-5.5" />
          </button>

          {/* Add meal (central FAB) */}
          <button
            id="nav-add-meal"
            onClick={openAddMeal}
            className="flex items-center justify-center w-14 h-14 -mt-4 rounded-full bg-[#6B9E6A] text-white shadow-lg shadow-[#6B9E6A]/40 hover:bg-[#5E8E5E] active:scale-90 transition-all"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>

          {/* History */}
          <button
            id="nav-history"
            className="flex items-center justify-center w-11 h-11 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <BarChart3 className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
