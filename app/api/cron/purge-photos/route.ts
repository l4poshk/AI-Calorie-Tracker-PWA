import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    // 1. Проверяем секретный ключ от Vercel, чтобы левые люди не сносили нам фотки
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Подключаем Supabase как суперадмин через Service Role Key
    // Этот ключ игнорирует любые запреты RLS и дает право на чистку
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 3. Вызываем нашу умную SQL-функцию, которая отдает только старые и не избранные фотки
        const { data: oldFiles, error: fetchError } = await supabase.rpc('get_old_food_photos');

        if (fetchError) throw fetchError;

        // Если чистить нечего, просто выходим
        if (!oldFiles || oldFiles.length === 0) {
            return NextResponse.json({ message: 'Все чисто, старых фото нет' });
        }

        // Собираем массив имен файлов для удаления
        const filesToRemove = oldFiles.map((file: { file_name: string }) => file.file_name);

        // 4. Сносим файлы через легальное Storage API
        const { error: removeError } = await supabase.storage
            .from('food-photos')
            .remove(filesToRemove);

        if (removeError) throw removeError;

        return NextResponse.json({
            message: `Успешно вычищено фоток: ${filesToRemove.length}`,
            files: filesToRemove
        });

    } catch (error: unknown) {
        console.error('Ошибка в Крон-задаче:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}