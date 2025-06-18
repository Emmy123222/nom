/*
  # City Memberships Schema

  1. New Tables
    - `city_memberships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `city_id` (text, required)
      - `city_name` (text, required)
      - `status` (enum: active, pending, inactive, suspended)
      - `role` (text, e.g., 'citizen', 'resident', 'visitor')
      - `joined_at` (timestamptz, default now)
      - `progress_percentage` (integer, 0-100)
      - `membership_nft_address` (text, optional)
      - `governance_power` (integer, default 0)
      - `last_activity_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `city_memberships` table
    - Add policy for users to view all memberships
    - Add policy for users to view their own detailed memberships
    - Add policy for system to manage memberships

  3. Indexes
    - Index on user_id for user's memberships
    - Index on city_id for city members
    - Index on status for filtering
    - Unique constraint on user_id + city_id
*/

-- Create enum for membership status
DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('active', 'pending', 'inactive', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS city_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  city_id text NOT NULL,
  city_name text NOT NULL,
  status membership_status DEFAULT 'pending',
  role text DEFAULT 'applicant',
  joined_at timestamptz DEFAULT now(),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  membership_nft_address text,
  governance_power integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, city_id)
);

-- Enable RLS
ALTER TABLE city_memberships ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all memberships"
  ON city_memberships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own memberships"
  ON city_memberships
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "System can manage all memberships"
  ON city_memberships
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_city_memberships_user_id ON city_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_city_memberships_city_id ON city_memberships(city_id);
CREATE INDEX IF NOT EXISTS idx_city_memberships_status ON city_memberships(status);
CREATE INDEX IF NOT EXISTS idx_city_memberships_joined_at ON city_memberships(joined_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_city_memberships_updated_at
  BEFORE UPDATE ON city_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_activity_at
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_city_memberships_activity
  BEFORE UPDATE ON city_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();