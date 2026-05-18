import { useState } from 'react';
import CircularProgress from '@/src/components/Dashboard/CircularProgress';
import { Flame, Droplets, Plus, Minus, Settings, Pencil, X } from 'lucide-react';
import { useDashboardStore } from '@/src/store/dashboardStore';

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
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isWaterSettingsOpen, setIsWaterSettingsOpen] = useState(false);

  const selectedDate = useDashboardStore((s) => s.selectedDate);
  const waterByDate = useDashboardStore((s) => s.waterByDate);
  const addWater = useDashboardStore((s) => s.addWater);
  const waterGoal = useDashboardStore((s) => s.waterGoal);
  const waterPortion = useDashboardStore((s) => s.waterPortion);
  const setWaterGoal = useDashboardStore((s) => s.setWaterGoal);
  const setWaterPortion = useDashboardStore((s) => s.setWaterPortion);

  const dateKey = selectedDate || new Date().toISOString().split('T')[0];
  const waterConsumed = waterByDate[dateKey] || 0;

  const caloriesProgress =
    ((data.caloriesGoal - data.caloriesRemaining) / data.caloriesGoal) * 100;
  const proteinProgress =
    ((data.proteinGoal - data.proteinRemaining) / data.proteinGoal) * 100;
  const fatsProgress =
    ((data.fatsGoal - data.fatsRemaining) / data.fatsGoal) * 100;
  const carbsProgress =
    ((data.carbsGoal - data.carbsRemaining) / data.carbsGoal) * 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe && activeSlide === 0) {
      setActiveSlide(1);
    } else if (isRightSwipe && activeSlide === 1) {
      setActiveSlide(0);
    }
    setTouchStart(null);
  };

  return (
    <div 
      className="mx-4 rounded-3xl bg-linear-to-br from-[#5E9E5E] to-[#7CC47C] p-5 shadow-lg shadow-[#6B9E6A]/20 overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex transition-transform duration-500 ease-out w-full"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {/* Slide 1: Nutrition */}
        <div className={`w-full flex-none flex items-center gap-2.5 pr-1 transition-opacity duration-500 ${activeSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Main calories circle */}
          <div className="shrink-0">
            <CircularProgress
              size={136}
              strokeWidth={9}
              progress={caloriesProgress}
              color="#FFFFFF"
              trackColor="rgba(255,255,255,0.2)"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-white/90 text-[11px] font-semibold">
                    Калории
                  </span>
                  <Flame className="w-3.5 h-3.5 text-orange-300" />
                </div>
                <span className="text-white text-3xl font-bold tracking-tight leading-none mb-0.5">
                  {data.caloriesRemaining.toLocaleString()}
                </span>
                <span className="text-white/60 text-[9px] font-medium uppercase tracking-wider">
                  осталось
                </span>
              </div>
            </CircularProgress>
          </div>

          {/* Macro nutrients column */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
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

        {/* Slide 2: Water Tracker */}
        <div className={`w-full flex-none relative flex flex-col justify-center px-1 transition-opacity duration-500 ${activeSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {!isWaterSettingsOpen ? (
            <div className="animate-in fade-in duration-300 w-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-5 w-full">
                <span className="text-white font-bold text-lg tracking-tight">Водный баланс</span>
                <button onClick={() => setIsWaterSettingsOpen(true)} className="text-white/60 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex items-center gap-6 justify-center w-full">
                {/* Progress Circle */}
                <div className="shrink-0">
                  <CircularProgress
                    size={110}
                    strokeWidth={8}
                    progress={Math.min((waterConsumed / waterGoal) * 100, 100)}
                    color="#93C5FD" // blue-300
                    trackColor="rgba(255,255,255,0.2)"
                  >
                    <div className="flex flex-col items-center text-center mt-1">
                      <Droplets className="w-7 h-7 text-blue-200 mb-0.5" />
                      <span className="text-white text-[10px] font-bold tracking-wide">
                        {Math.round((waterConsumed / waterGoal) * 100)}%
                      </span>
                    </div>
                  </CircularProgress>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center flex-1 pr-2 min-w-0">
                  <div className="flex items-center gap-3 w-full justify-center">
                    <button 
                      onClick={() => addWater(dateKey, -waterPortion)}
                      className="w-10 h-10 shrink-0 rounded-full border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50"
                      disabled={waterConsumed < waterPortion}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <span className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">порция</span>
                      <div 
                        className="flex items-center justify-center gap-1.5 text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity mt-0.5 whitespace-nowrap" 
                        onClick={() => setIsWaterSettingsOpen(true)}
                      >
                        {waterPortion} мл <Pencil className="w-3 h-3 text-white/60 shrink-0" />
                      </div>
                    </div>

                    <button 
                      onClick={() => addWater(dateKey, waterPortion)}
                      className="w-10 h-10 shrink-0 rounded-full border-2 border-blue-300 flex items-center justify-center text-blue-100 bg-blue-400/20 hover:bg-blue-400/40 transition-colors active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-5 text-white font-bold text-base tracking-tight text-center w-full bg-white/10 rounded-xl py-2 backdrop-blur-sm shadow-inner shadow-white/5 truncate px-2">
                    {Math.max(0, waterGoal - waterConsumed).toLocaleString()} мл осталось
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in duration-300 w-full">
              <div className="flex justify-between items-center mb-5">
                <span className="text-white font-bold text-lg">Настройки воды</span>
                <button onClick={() => setIsWaterSettingsOpen(false)} className="text-white hover:text-white/80 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <label className="block text-white/70 text-[10px] font-bold uppercase mb-1.5 truncate">Цель (мл)</label>
                  <input
                    type="number"
                    value={waterGoal}
                    onChange={(e) => setWaterGoal(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-white/20 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 font-bold"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-white/70 text-[10px] font-bold uppercase mb-1.5 truncate">Порция (мл)</label>
                  <input
                    type="number"
                    value={waterPortion}
                    onChange={(e) => setWaterPortion(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-white/20 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 font-bold"
                  />
                </div>
              </div>
              <button 
                onClick={() => setIsWaterSettingsOpen(false)}
                className="mt-5 w-full bg-white text-[#5E9E5E] font-extrabold rounded-xl py-3 shadow-md active:scale-[0.98] transition-all"
              >
                Сохранить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-5">
        <button 
          onClick={() => { setActiveSlide(0); setIsWaterSettingsOpen(false); }} 
          className={`h-2 rounded-full transition-all duration-300 ${activeSlide === 0 ? 'w-4 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
        />
        <button 
          onClick={() => setActiveSlide(1)} 
          className={`h-2 rounded-full transition-all duration-300 ${activeSlide === 1 ? 'w-4 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
        />
      </div>
    </div>
  );
}
