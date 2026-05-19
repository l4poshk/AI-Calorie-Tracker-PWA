'use server';

import { createClient } from '@/src/lib/supabase/server';
import { MealInsert, Meal, FavoriteMealInsert, FavoriteMeal } from '@/src/types/supabase';

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

/**
 * Получает список блюд пользователя из таблицы 'meals' за указанный диапазон дат.
 * Диапазон дат должен быть в формате ISO (UTC), сформированном на клиенте.
 */
export async function getMealsByDateRange(startDateISO: string, endDateISO: string): Promise<Meal[]> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userData.user.id)
    .gte('created_at', startDateISO)
    .lt('created_at', endDateISO)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Meals By Date Range Error:', error);
    return [];
  }

  return data || [];
}

/**
 * Сохраняет блюдо вручную в 'meals' и, если нужно, в 'favorite_meals'.
 */
export async function saveManualMeal(
  mealData: Omit<MealInsert, 'user_id' | 'is_ai'>,
  saveAsFavorite: boolean
): Promise<{ meal: Meal; favoriteMeal?: FavoriteMeal }> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Пользователь не авторизован');
  }

  const userId = userData.user.id;
  const insertData = { ...mealData, user_id: userId, is_ai: false };

  // Сохраняем в таблицу meals
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .insert(insertData)
    .select()
    .single();

  if (mealError) {
    console.error('Insert Meal Error:', mealError);
    throw new Error(`Ошибка сохранения приема пищи: ${mealError.message}`);
  }

  let favoriteMeal: FavoriteMeal | undefined;

  // ПАРАЛЛЕЛЬНО сохраняем в favorite_meals, если чекбокс активирован
  if (saveAsFavorite) {
    // Проверяем, нет ли уже такого шаблона у юзера
    const { data: existingFav } = await supabase
      .from('favorite_meals')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', mealData.name.trim())
      .maybeSingle();

    if (existingFav) {
      throw new Error('Шаблон с таким названием уже существует в Избранном.');
    }

    const favoriteData: FavoriteMealInsert = {
      user_id: userId,
      name: mealData.name,
      calories: mealData.calories,
      protein: mealData.protein || 0,
      carbs: mealData.carbs || 0,
      fats: mealData.fats || 0,
      image_url: mealData.image_url || null,
      emoji: mealData.emoji || null,
    };
    
    // Жестко дожидаемся выполнения (чтобы процесс не убился в Serverless-среде)
    const { data: favData, error: favError } = await supabase
      .from('favorite_meals')
      .insert(favoriteData)
      .select()
      .single();

    if (favError) {
      console.error('Save Favorite Error:', favError);
    } else {
      favoriteMeal = favData;
    }
  }

  return { meal, favoriteMeal };
}


/**
 * Получает список избранных блюд (шаблонов) пользователя.
 */
export async function getFavoriteMeals(): Promise<FavoriteMeal[]> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('favorite_meals')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Favorite Meals Error:', error);
    return [];
  }

  return data || [];
}

/**
 * Удаляет шаблон из таблицы 'favorite_meals'.
 */
export async function deleteFavoriteMeal(id: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Пользователь не авторизован');
  }

  const { error } = await supabase
    .from('favorite_meals')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id);

  if (error) {
    console.error('Delete Favorite Error:', error);
    throw new Error(`Ошибка удаления шаблона: ${error.message}`);
  }

  return true;
}

/**
 * Обновляет шаблон в таблице 'favorite_meals'.
 */
export async function updateFavoriteMeal(
  id: string,
  updates: Partial<FavoriteMealInsert>
): Promise<FavoriteMeal> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Пользователь не авторизован');
  }

  const { data, error } = await supabase
    .from('favorite_meals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .select()
    .single();

  if (error) {
    console.error('Update Favorite Meal Error:', error);
    throw new Error(`Ошибка обновления шаблона: ${error.message}`);
  }

  return data;
}

/**
 * Удаляет прием пищи из таблицы 'meals'.
 * Если у блюда есть картинка в бакете 'food-photos', сначала удаляет её из Storage.
 * Только при успешном удалении файла удаляется запись из БД.
 */
export async function deleteMeal(mealId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Пользователь не авторизован');
  }

  // Сначала получаем блюдо, чтобы проверить image_url
  const { data: meal, error: fetchError } = await supabase
    .from('meals')
    .select('image_url')
    .eq('id', mealId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (fetchError) {
    console.error('Fetch Meal Error:', fetchError);
    throw new Error(`Ошибка поиска блюда: ${fetchError.message}`);
  }

  // Если есть image_url, проверяем ссылки перед удалением из Storage
  if (meal?.image_url) {
    try {
      // 1. Проверяем, использует ли кто-то еще эту картинку в дневнике (кроме удаляемой записи)
      const { count: mealsCount, error: mealsErr } = await supabase
        .from('meals')
        .select('*', { count: 'exact', head: true })
        .eq('image_url', meal.image_url)
        .neq('id', mealId);

      if (mealsErr) throw mealsErr;

      // 2. Проверяем, есть ли эта картинка в избранном
      const { count: favsCount, error: favsErr } = await supabase
        .from('favorite_meals')
        .select('*', { count: 'exact', head: true })
        .eq('image_url', meal.image_url);

      if (favsErr) throw favsErr;

      const totalUses = (mealsCount || 0) + (favsCount || 0);

      // 3. Если ссылок больше нет, сносим файл из Storage
      if (totalUses === 0) {
        // Отрезаем домен и имя бакета, чтобы получить относительный путь внутри бакета
        const parts = meal.image_url.split('/object/public/food-photos/');
        const parsedPath = parts.length > 1 ? parts[1] : null;

        if (!parsedPath) {
          console.warn('Внимание: не удалось извлечь путь к файлу из image_url');
        } else {
          const { error: storageError } = await supabase.storage
            .from('food-photos')
            .remove([parsedPath]);
            
          if (storageError) {
            console.warn('Внимание: не удалось удалить файл из Storage:', storageError.message);
          } else {
            console.log('Очистили неиспользуемую фотку:', parsedPath);
          }
        }
      } else {
        console.log(`Файл защищен от удаления. Найдено ссылок: ${totalUses}`);
      }
    } catch (err: unknown) {
      console.warn('Внимание: ошибка при проверке ссылок или удалении картинки из Storage:', err instanceof Error ? err.message : String(err));
    }
  }

  // Удаляем строку из БД в любом случае
  const { error: deleteError } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId)
    .eq('user_id', userData.user.id);

  if (deleteError) {
    console.error('Delete Meal Error:', deleteError);
    throw new Error(`Ошибка удаления блюда из БД: ${deleteError.message}`);
  }

  return true;
}

/**
 * Обновляет существующий прием пищи в таблице 'meals'.
 */
export async function updateMeal(
  mealId: string,
  updates: Partial<MealInsert>
): Promise<Meal> {
  const supabase = await createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Пользователь не авторизован');
  }

  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', mealId)
    .eq('user_id', userData.user.id)
    .select()
    .single();

  if (error) {
    console.error('Update Meal Error:', error);
    throw new Error(`Ошибка обновления блюда: ${error.message}`);
  }

  return data;
}
