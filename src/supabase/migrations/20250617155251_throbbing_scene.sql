/*
  # AI Conversations Schema

  1. New Tables
    - `ai_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `title` (text, optional conversation title)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `ai_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to ai_conversations)
      - `role` (enum: user, assistant, system)
      - `content` (text, message content)
      - `metadata` (jsonb, for storing additional data like city recommendations)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own conversations
    - Add policies for users to manage their own messages

  3. Indexes
    - Index on user_id for user's conversations
    - Index on conversation_id for messages
    - Index on created_at for chronological ordering
*/

-- Create enum for message roles
DO $$ BEGIN
  CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can insert their own conversations"
  ON ai_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can update their own conversations"
  ON ai_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

CREATE POLICY "Users can delete their own conversations"
  ON ai_conversations
  FOR DELETE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
  ));

-- Policies for ai_messages
CREATE POLICY "Users can view messages from their conversations"
  ON ai_messages
  FOR SELECT
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM ai_conversations WHERE user_id IN (
      SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  ));

CREATE POLICY "Users can insert messages to their conversations"
  ON ai_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM ai_conversations WHERE user_id IN (
      SELECT id FROM user_profiles WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at ASC);

-- Trigger to update updated_at on conversations
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation updated_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();