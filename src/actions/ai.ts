'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AnalyzeFoodParams {
  text?: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  lang?: 'ru' | 'en';
}

export interface AnalyzedMeal {
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  emoji: string;
}

export async function analyzeFood(params: AnalyzeFoodParams): Promise<AnalyzedMeal> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('ОШИБКА: Ключ GEMINI_API_KEY не найден в переменных окружения.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Используем актуальную и быструю модель gemini-2.5-flash (доступную в вашем API)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      // Жестко заставляем модель отвечать чистым JSON без markdown-оберток
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const lang = params.lang || 'ru';
    const nameInstruction = lang === 'en' 
      ? '"string (A concise, appetizing name in English, e.g., \'Cheeseburger with fries\')"'
      : '"string (A concise, appetizing name in Russian, e.g., \'Сырники со сметаной\')"';

    // Жесткий системный промпт
    const prompt = `You are an expert nutritionist AI. 
Analyze the provided food description or image and accurately estimate the nutritional values.
Respond STRICTLY with a valid JSON object matching this structure exactly (do not wrap in markdown):
{
  "name": ${nameInstruction},
  "calories": number (integer),
  "protein": number (integer, in grams),
  "fats": number (integer, in grams),
  "carbs": number (integer, in grams),
  "emoji": "string (A single emoji representing the food, e.g., '🥞')"
}
If both image and text are provided, use the text to provide context for the image. 
If you cannot identify the food precisely, provide a best-guess estimate for a standard portion.`;

    const contents: Array<string | { inlineData: { data: string; mimeType: string } }> = [prompt];

    if (params.text) {
      contents.push(params.text);
    }

    if (params.image) {
      contents.push({
        inlineData: {
          data: params.image.base64,
          mimeType: params.image.mimeType,
        },
      });
    }

    if (contents.length === 1) {
      throw new Error('Для анализа необходимо передать текст описания еды или фотографию.');
    }

    // Вызываем Gemini
    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    // Парсим результат. Так как указан responseMimeType: 'application/json',
    // результат должен быть чистым валидным JSON-строкой.
    const data = JSON.parse(responseText);
    
    // Базовая валидация структуры
    if (!data.name || typeof data.calories !== 'number') {
      throw new Error('ИИ вернул неверную структуру данных. Повторите попытку.');
    }

    return {
      name: data.name,
      calories: data.calories,
      protein: data.protein || 0,
      fats: data.fats || 0,
      carbs: data.carbs || 0,
      emoji: data.emoji || '🍽️'
    };
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Произошла ошибка при анализе еды через ИИ.');
  }
}
