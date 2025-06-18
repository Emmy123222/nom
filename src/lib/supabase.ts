import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserProfile {
  id: string;
  wallet_address: string;
  username?: string;
  bio?: string;
  location?: string;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface CityApplication {
  id: string;
  user_id: string;
  city_name: string;
  status: 'pending' | 'approved' | 'rejected';
  application_data: any;
  applied_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
  tx_signature?: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  cities_joined: number;
  badges_earned: number;
  reputation_score: number;
  updated_at: string;
}