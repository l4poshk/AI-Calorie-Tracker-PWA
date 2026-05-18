import { redirect } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/server';
import DashboardClient from '@/src/components/Dashboard/DashboardClient';
import { getTodayMeals } from '@/src/actions/meals';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Получаем реальные блюда из базы данных Supabase
  const dbMeals = await getTodayMeals();

  // Передаем сырые данные с сервера, чтобы клиент распарсил их в своей таймзоне
  const rawMeals = dbMeals.map((m) => ({
    id: m.id,
    name: m.name,
    calories: m.calories,
    protein: m.protein,
    fats: m.fats,
    carbs: m.carbs,
    emoji: m.emoji || '🍽️',
    imageUrl: m.image_url,
    isAI: m.is_ai,
    createdAt: m.created_at,
  }));

  return <DashboardClient userEmail={user.email ?? 'User'} rawMeals={rawMeals} />;
}

