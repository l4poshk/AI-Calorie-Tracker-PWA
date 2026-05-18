import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFood } from '../ai';

// Мокаем клиент GoogleGenerativeAI
const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: function () {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      };
    },
  };
});

describe('analyzeFood Server Action', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-api-key' };
  });

  it('должен успешно анализировать текст и возвращать валидную структуру КБЖУ', async () => {
    const mockAIResponse = {
      name: 'Бургер',
      calories: 520,
      protein: 28,
      fats: 26,
      carbs: 42,
      emoji: '🍔',
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(mockAIResponse),
      },
    });

    const result = await analyzeFood({ text: 'большой чизбургер' });

    expect(result).toEqual(mockAIResponse);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('должен выбрасывать ошибку, если GEMINI_API_KEY отсутствует', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(analyzeFood({ text: 'яблоко' })).rejects.toThrow(
      'ОШИБКА: Ключ GEMINI_API_KEY не найден в переменных окружения.'
    );
  });

  it('должен выбрасывать ошибку, if не передан ни текст, ни картинка', async () => {
    await expect(analyzeFood({})).rejects.toThrow(
      'Для анализа необходимо передать текст описания еды или фотографию.'
    );
  });

  it('должен корректно обрабатывать невалидную структуру от ИИ', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '{"invalid": "data"}', // отсутствует name и calories
      },
    });

    await expect(analyzeFood({ text: 'непонятная еда' })).rejects.toThrow(
      'ИИ вернул неверную структуру данных. Повторите попытку.'
    );
  });
});
