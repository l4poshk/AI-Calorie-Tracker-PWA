-- Таблица для избранных (шаблонов) блюд
CREATE TABLE IF NOT EXISTS favorite_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fats INTEGER DEFAULT 0,
  image_url TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE favorite_meals ENABLE ROW LEVEL SECURITY;

-- Политики для favorite_meals (только свои записи)
CREATE POLICY "Users can view their own favorite meals" 
  ON favorite_meals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite meals" 
  ON favorite_meals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite meals" 
  ON favorite_meals FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite meals" 
  ON favorite_meals FOR DELETE 
  USING (auth.uid() = user_id);
