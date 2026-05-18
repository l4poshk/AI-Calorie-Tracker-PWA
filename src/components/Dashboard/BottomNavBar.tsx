'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, BarChart3 } from 'lucide-react';
import { useUIStore } from '@/src/store/uiStore';

export default function BottomNavBar() {
  const openAddMeal = useUIStore((s) => s.openAddMeal);
  const pathname = usePathname();

  const isHistory = pathname === '/history';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-md px-6 pb-6 pt-2">
        <div className="flex items-center justify-around bg-[#8B7E74]/90 backdrop-blur-xl rounded-full px-4 py-2.5 shadow-lg shadow-black/10">
          {/* Home */}
          <Link
            href="/dashboard"
            id="nav-home"
            className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors ${
              !isHistory ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Home className="w-[22px] h-[22px]" />
          </Link>

          {/* Add meal (central FAB) */}
          <button
            id="nav-add-meal"
            onClick={() => openAddMeal()}
            className="flex items-center justify-center w-14 h-14 -mt-4 rounded-full bg-[#6B9E6A] text-white shadow-lg shadow-[#6B9E6A]/40 hover:bg-[#5E8E5E] active:scale-90 transition-all"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>

          {/* History */}
          <Link
            href="/history"
            id="nav-history"
            className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors ${
              isHistory ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <BarChart3 className="w-[22px] h-[22px]" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
