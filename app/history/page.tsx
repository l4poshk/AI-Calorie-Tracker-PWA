import { redirect } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/server';
import HistoryClient from '@/src/components/History/HistoryClient';
import { getMonthlyMeals } from '@/src/actions/meals';

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Получаем блюда за последние 30 дней
  const dbMeals = await getMonthlyMeals();

  // Преобразуем в клиентский формат и группируем
  const historyMeals = dbMeals.map((m) => {
    const date = new Date(m.created_at);
    // Сдвиг таймзоны для правильного отображения локальной даты в строке ISO
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localIsoDate = new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
    
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
      dateString: localIsoDate,
    };
  });

  return <HistoryClient userEmail={user.email ?? 'User'} historyMeals={historyMeals} />;
}
