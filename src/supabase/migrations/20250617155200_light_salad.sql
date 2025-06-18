/*
  # User Statistics Schema

  1. New Tables
    - `user_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `total_xp` (integer, default 0)
      - `level` (integer, default 1)
      - `cities_joined` (integer, default 0)
      - `badges_earned` (integer, default 0)
      - `reputation_score` (integer, default 0)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `user_stats` table
    - Add policy for users to read all stats
    - Add policy for users to update their own stats
    - Add policy for users to insert their own stats

  3. Indexes
    - Index on user_id for fast lookups
    - Index on level for leaderboards
    - Index on reputation_score for rankings
*/

CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  cities_joined integer DEFAULT 0,
  badges_earned integer DEFAULT 0,
  reputation_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can update their own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_level ON user_stats(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_reputation ON user_stats(reputation_score DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();