'use server';

import { createClient } from '@/src/lib/supabase/server';
import { MealInsert, Meal } from '@/src/types/supabase';

/**
 * Загружает сжатую base64-картинку в бакет 'food-photos' Supabase Storage
 * и возвращает публичный URL.
 */
export async function uploadMealImage(base64Data: string, mimeType: string = 'image/jpeg'): Promise<string> {
  const supabase = await createClient();
  
  // Конвертируем base64 обратно в Buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Генерируем уникальное имя файла
  const filename = `${Date.now()}-${crypto.randomUUID()}.jpg`;
  
  // Загружаем в Storage
  const { error } = await supabase.storage
    .from('food-photos')
    .upload(filename, buffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });
    
  if (error) {
    console.error('Upload Error:', error);
    throw new Error(`Ошибка Supabase Storage: ${error.message}`);
  }
  
  // Получаем публичную ссылку
  const { data: publicUrlData } = supabase.storage
    .from('food-photos')
    .getPublicUrl(filename);
    
  return publicUrlData.publicUrl;
}

/**
 * Сохраняет запись о приеме пищи в таблицу 'meals'.
 * Подтягивает ID пользователя из текущей сессии.
 */
export async function saveMeal(mealData: Omit<MealInsert, 'user_id'>): Promise<Meal> {
  const supabase = await createClient();
  
  // Получаем текущего авторизованного пользователя
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Пользователь не авторизован');
  }

  // Сохраняем в таблицу
  const { data, error } = await supabase
    .from('meals')
    .insert({
      ...mealData,
      user_id: userData.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Insert Error:', error);
    throw new Error(`Ошибка Supabase Database: ${error.message}`);
  }

  return data;
}

/**
 * Получает список блюд пользователя из таблицы 'meals',
 * отсортированный по дате создания (самые свежие сверху).
 */
export async function getTodayMeals(): Promise<Meal[]> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Meals Error:', error);
    return [];
  }

  return data || [];
}
