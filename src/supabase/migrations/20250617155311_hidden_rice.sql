/*
  # Governance Activities Schema

  1. New Tables
    - `governance_activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `city_id` (text, required)
      - `activity_type` (enum: vote, proposal, delegation, discussion)
      - `activity_data` (jsonb, stores activity-specific data)
      - `tx_signature` (text, optional - blockchain transaction)
      - `points_earned` (integer, default 0)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `governance_activities` table
    - Add policy for users to view activities in their cities
    - Add policy for users to insert their own activities
    - Add policy for system to manage activities

  3. Indexes
    - Index on user_id for user's activities
    - Index on city_id for city activities
    - Index on activity_type for filtering
    - Index on created_at for chronological ordering
*/

-- Create enum for activity types
DO $$ BEGIN
  CREATE TYPE governance_activity_type AS ENUM ('vote', 'proposal', 'delegation', 'discussion', 'event_attendance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS governance_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  city_id text NOT NULL,
  activity_type governance_activity_type NOT NULL,
  activity_data jsonb DEFAULT '{}',
  tx_signature text,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE governance_activities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view activities in their cities"
  ON governance_activities
  FOR SELECT
  TO authenticated
  USING (
    city_id IN (
      SELECT city_id FROM city_memberships 
      WHERE user_id IN (
        SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
      )
    )
  );

CREATE POLICY "Users can insert their own activities"
  ON governance_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "System can manage all activities"
  ON governance_activities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_governance_activities_user_id ON governance_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_governance_activities_city_id ON governance_activities(city_id);
CREATE INDEX IF NOT EXISTS idx_governance_activities_type ON governance_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_governance_activities_created_at ON governance_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_governance_activities_points ON governance_activities(points_earned DESC);