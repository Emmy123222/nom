/*
  # City Applications Schema

  1. New Tables
    - `city_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `city_name` (text, required)
      - `city_id` (text, required)
      - `status` (enum: pending, approved, rejected, withdrawn)
      - `application_data` (jsonb, stores form data)
      - `reviewer_notes` (text, optional)
      - `applied_at` (timestamptz, default now)
      - `reviewed_at` (timestamptz, optional)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `city_applications` table
    - Add policy for users to view their own applications
    - Add policy for users to insert their own applications
    - Add policy for users to update their own pending applications

  3. Indexes
    - Index on user_id for user's applications
    - Index on city_id for city-specific queries
    - Index on status for filtering
*/

-- Create enum for application status
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS city_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  city_name text NOT NULL,
  city_id text NOT NULL,
  status application_status DEFAULT 'pending',
  application_data jsonb DEFAULT '{}',
  reviewer_notes text,
  applied_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE city_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own applications"
  ON city_applications
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can insert their own applications"
  ON city_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can update their own pending applications"
  ON city_applications
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    ) AND status = 'pending'
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_city_applications_user_id ON city_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_city_applications_city_id ON city_applications(city_id);
CREATE INDEX IF NOT EXISTS idx_city_applications_status ON city_applications(status);
CREATE INDEX IF NOT EXISTS idx_city_applications_applied_at ON city_applications(applied_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_city_applications_updated_at
  BEFORE UPDATE ON city_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set reviewed_at when status changes from pending
CREATE OR REPLACE FUNCTION set_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_city_applications_reviewed_at
  BEFORE UPDATE ON city_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_reviewed_at();