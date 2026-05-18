/**
 * Supabase Database type definitions.
 *
 * These are manually defined based on the PRD schema.
 * Once Supabase CLI is configured locally, regenerate with:
 *   npx supabase gen types typescript --local > src/types/supabase.ts
 */

export interface Database {
  public: {
    Tables: {
      meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          image_url: string | null;
          emoji: string | null;
          is_ai: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          calories: number;
          protein?: number;
          carbs?: number;
          fats?: number;
          image_url?: string | null;
          emoji?: string | null;
          is_ai?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fats?: number;
          image_url?: string | null;
          emoji?: string | null;
          is_ai?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meals_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      favorite_meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          image_url: string | null;
          emoji: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          calories: number;
          protein?: number;
          carbs?: number;
          fats?: number;
          image_url?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fats?: number;
          image_url?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorite_meals_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Shorthand for a meal row */
export type Meal = Database['public']['Tables']['meals']['Row'];

/** Shorthand for inserting a meal */
export type MealInsert = Database['public']['Tables']['meals']['Insert'];

/** Shorthand for updating a meal */
export type MealUpdate = Database['public']['Tables']['meals']['Update'];

export type FavoriteMeal = Database['public']['Tables']['favorite_meals']['Row'];
export type FavoriteMealInsert = Database['public']['Tables']['favorite_meals']['Insert'];
export type FavoriteMealUpdate = Database['public']['Tables']['favorite_meals']['Update'];
