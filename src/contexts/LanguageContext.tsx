'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Полный словарь для всех компонентов приложения
const translations: Record<Language, Record<string, string>> = {
  ru: {
    greeting: 'Привет 👋',
    history: 'История',
    add_meal: 'Добавить',
    settings: 'Настройки',
    no_records: 'В этот день записей нет',
    meals_today: 'Блюда за сегодня',
    meals_for: 'Блюда за',
    calories: 'Калории',
    remaining: 'осталось',
    excess: 'больше',
    excess_title: 'Вы перебрали:',
    protein_gen: 'Белков',
    fats_gen: 'Жиров',
    carbs_gen: 'Углеводов',
    protein: 'Белки',
    fats: 'Жиры',
    carbs: 'Углеводы',
    water_balance: 'Водный баланс',
    water_goal_achieved_plus: '🎉 Норма выполнена (+{diff} мл)',
    water_goal_achieved: '🎉 Норма выполнена!',
    water_remaining: '{rem} мл осталось',
    portion: 'порция',
    water_settings: 'Настройки воды',
    goal_ml: 'Цель (мл)',
    portion_ml: 'Порция (мл)',
    save: 'Сохранить',
    archive: 'Архив',
    kcal: 'Ккал',
    ml: 'мл',
    image_optimized: '* Изображение удалено для оптимизации памяти приложения',
    
    // AddMealModal
    add_meal_title: 'Добавить приём пищи',
    edit_meal_title: 'Редактировать блюдо',
    ai_analysis: 'ИИ Анализ',
    manual: 'Вручную',
    warning_different_day: 'Вы добавляете блюдо за другой день: {date}',
    describe_dish: 'Опишите блюдо',
    describe_placeholder: 'Например: «Большой чизбургер с картошкой фри»',
    or: 'или',
    take_photo_or_gallery: 'Сделать фото или выбрать из галереи',
    ai_analyzing: 'ИИ анализирует...',
    analyze_with_ai: 'Анализировать с ИИ',
    dish_name: 'Название блюда',
    back: 'Назад',
    favorites_title: 'Избранное',
    loading: 'Загрузка...',
    no_saved_templates: 'Нет сохраненных шаблонов',
    favorite_templates: 'Избранные шаблоны',
    open_list: 'Открыть список →',
    photo_optional: 'Фото блюда (необязательно)',
    add_photo: 'Добавить фото',
    update: 'Обновить',
    favorites_library: 'Библиотека избранного',

    // FavoritesModal
    fav_modal_title: 'Избранные блюда',
    fav_modal_desc: 'Управление вашими шаблонами',
    loading_templates: 'Загрузка шаблонов...',
    no_favs_empty: 'У вас пока нет сохраненных избранных блюд. Добавляйте их при создании приемов пищи!',
    edit_template: 'Редактирование шаблона',
    name_label: 'Название',
    cancel: 'Отмена',

    // SettingsModal
    settings_goals_title: 'Настройки целей',
    settings_goals_desc: 'Установи свои суточные нормы КБЖУ',
    calories_kcal: 'Калории (ккал)',
    protein_g: 'Белки (г)',
    fats_g: 'Жиры (г)',
    carbs_g: 'Углеводы (г)',
    carbs_g_short: 'Угл (г)',
    save_goals: 'Сохранить цели',

    // HistoryClient
    history_title: 'История',
    history_desc: 'Твоя статистика за месяц',
    month_0: 'Январь', month_1: 'Февраль', month_2: 'Март', month_3: 'Апрель',
    month_4: 'Май', month_5: 'Июнь', month_6: 'Июль', month_7: 'Август',
    month_8: 'Сентябрь', month_9: 'Октябрь', month_10: 'Ноябрь', month_11: 'Декабрь',
    day_0: 'Пн', day_1: 'Вт', day_2: 'Ср', day_3: 'Чт', day_4: 'Пт', day_5: 'Сб', day_6: 'Вс',
  },
  en: {
    greeting: 'Hello 👋',
    history: 'History',
    add_meal: 'Add',
    settings: 'Settings',
    no_records: 'No records for this day',
    meals_today: 'Meals for today',
    meals_for: 'Meals for',
    calories: 'Calories',
    remaining: 'left',
    excess: 'over',
    excess_title: 'You exceeded:',
    protein_gen: 'Protein',
    fats_gen: 'Fats',
    carbs_gen: 'Carbs',
    protein: 'Protein',
    fats: 'Fats',
    carbs: 'Carbs',
    water_balance: 'Water Balance',
    water_goal_achieved_plus: '🎉 Goal achieved (+{diff} ml)',
    water_goal_achieved: '🎉 Goal achieved!',
    water_remaining: '{rem} ml left',
    portion: 'portion',
    water_settings: 'Water Settings',
    goal_ml: 'Goal (ml)',
    portion_ml: 'Portion (ml)',
    save: 'Save',
    archive: 'Archive',
    kcal: 'Kcal',
    ml: 'ml',
    image_optimized: '* Image removed to optimize app storage',

    // AddMealModal
    add_meal_title: 'Add meal',
    edit_meal_title: 'Edit meal',
    ai_analysis: 'AI Analysis',
    manual: 'Manual',
    warning_different_day: 'You are adding a meal for a different day: {date}',
    describe_dish: 'Describe the dish',
    describe_placeholder: 'Example: "Large cheeseburger with french fries"',
    or: 'or',
    take_photo_or_gallery: 'Take photo or choose from gallery',
    ai_analyzing: 'AI is analyzing...',
    analyze_with_ai: 'Analyze with AI',
    dish_name: 'Dish name',
    back: 'Back',
    favorites_title: 'Favorites',
    loading: 'Loading...',
    no_saved_templates: 'No saved templates',
    favorite_templates: 'Favorite templates',
    open_list: 'Open list →',
    photo_optional: 'Dish photo (optional)',
    add_photo: 'Add photo',
    update: 'Update',
    favorites_library: 'Favorites library',

    // FavoritesModal
    fav_modal_title: 'Favorite meals',
    fav_modal_desc: 'Manage your templates',
    loading_templates: 'Loading templates...',
    no_favs_empty: 'You have no saved favorite meals yet. Add them when creating meals!',
    edit_template: 'Editing template',
    name_label: 'Name',
    cancel: 'Cancel',

    // SettingsModal
    settings_goals_title: 'Goals settings',
    settings_goals_desc: 'Set your daily macros targets',
    calories_kcal: 'Calories (kcal)',
    protein_g: 'Protein (g)',
    fats_g: 'Fats (g)',
    carbs_g: 'Carbs (g)',
    carbs_g_short: 'Carbs (g)',
    save_goals: 'Save goals',

    // HistoryClient
    history_title: 'History',
    history_desc: 'Your monthly statistics',
    month_0: 'January', month_1: 'February', month_2: 'March', month_3: 'April',
    month_4: 'May', month_5: 'June', month_6: 'July', month_7: 'August',
    month_8: 'September', month_9: 'October', month_10: 'November', month_11: 'December',
    day_0: 'Mon', day_1: 'Tue', day_2: 'Wed', day_3: 'Thu', day_4: 'Fri', day_5: 'Sat', day_6: 'Sun',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ru');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(browserLang);
      localStorage.setItem('app_lang', browserLang);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key: string) => {
    if (!isLoaded) return translations['ru'][key] || key;
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage должен использоваться внутри LanguageProvider');
  }
  return context;
};
