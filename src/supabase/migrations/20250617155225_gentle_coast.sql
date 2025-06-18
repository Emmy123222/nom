/*
  # User Badges Schema

  1. New Tables
    - `user_badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `badge_name` (text, required)
      - `badge_description` (text, required)
      - `badge_icon` (text, emoji or icon identifier)
      - `rarity` (enum: common, rare, epic, legendary)
      - `category` (text, e.g., 'governance', 'community', 'achievement')
      - `city_id` (text, optional - if badge is city-specific)
      - `nft_mint_address` (text, optional - Solana mint address)
      - `tx_signature` (text, optional - transaction signature)
      - `earned_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `user_badges` table
    - Add policy for users to view all badges
    - Add policy for system to insert badges
    - No update/delete policies (badges are permanent)

  3. Indexes
    - Index on user_id for user's badges
    - Index on rarity for filtering
    - Index on category for grouping
    - Index on earned_at for chronological ordering
*/

-- Create enum for badge rarity
DO $$ BEGIN
  CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  badge_icon text NOT NULL,
  rarity badge_rarity DEFAULT 'common',
  category text NOT NULL,
  city_id text,
  nft_mint_address text,
  tx_signature text,
  earned_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert badges"
  ON user_badges
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_rarity ON user_badges(rarity);
CREATE INDEX IF NOT EXISTS idx_user_badges_category ON user_badges(category);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_city_id ON user_badges(city_id) WHERE city_id IS NOT NULL;