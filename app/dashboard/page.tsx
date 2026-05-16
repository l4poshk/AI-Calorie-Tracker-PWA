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

  // Преобразуем в клиентский формат ClientMeal
  const initialMeals = dbMeals.map((m) => {
    const date = new Date(m.created_at);
    const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    return {
      id: m.id,
      name: m.name,
      calories: m.calories,
      protein: m.protein,
      fats: m.fats,
      carbs: m.carbs,
      emoji: m.emoji || '🍽️',
      time,
      imageUrl: m.image_url,
      isAI: m.is_ai,
    };
  });

  return <DashboardClient userEmail={user.email ?? 'User'} initialMeals={initialMeals} />;
}

