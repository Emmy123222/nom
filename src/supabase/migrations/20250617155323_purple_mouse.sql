/*
  # Database Functions and Triggers

  1. Functions
    - `calculate_user_level()` - Calculate user level based on XP
    - `award_badge()` - Award badge to user and update stats
    - `update_user_stats_on_activity()` - Update stats when activities happen

  2. Triggers
    - Auto-update user stats when badges are earned
    - Auto-update user stats when memberships change
    - Auto-calculate level when XP changes

  3. Views
    - `user_leaderboard` - Leaderboard view with rankings
    - `city_member_counts` - Member counts per city
*/

-- Function to calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(xp integer)
RETURNS integer AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- This means: Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
  RETURN GREATEST(1, floor(sqrt(xp::float / 100)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award badge and update user stats
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id uuid,
  p_badge_name text,
  p_badge_description text,
  p_badge_icon text,
  p_rarity badge_rarity,
  p_category text,
  p_city_id text DEFAULT NULL,
  p_nft_mint_address text DEFAULT NULL,
  p_tx_signature text DEFAULT NULL,
  p_xp_reward integer DEFAULT 0
)
RETURNS uuid AS $$
DECLARE
  badge_id uuid;
  current_stats record;
BEGIN
  -- Insert the badge
  INSERT INTO user_badges (
    user_id, badge_name, badge_description, badge_icon, 
    rarity, category, city_id, nft_mint_address, tx_signature
  ) VALUES (
    p_user_id, p_badge_name, p_badge_description, p_badge_icon,
    p_rarity, p_category, p_city_id, p_nft_mint_address, p_tx_signature
  ) RETURNING id INTO badge_id;

  -- Get current stats
  SELECT * INTO current_stats FROM user_stats WHERE user_id = p_user_id;
  
  -- Update user stats
  IF current_stats IS NULL THEN
    -- Create initial stats record
    INSERT INTO user_stats (
      user_id, total_xp, level, badges_earned
    ) VALUES (
      p_user_id, p_xp_reward, calculate_user_level(p_xp_reward), 1
    );
  ELSE
    -- Update existing stats
    UPDATE user_stats SET
      total_xp = total_xp + p_xp_reward,
      level = calculate_user_level(total_xp + p_xp_reward),
      badges_earned = badges_earned + 1,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN badge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats when activities happen
CREATE OR REPLACE FUNCTION update_user_stats_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats based on governance activity
  UPDATE user_stats SET
    total_xp = total_xp + COALESCE(NEW.points_earned, 0),
    level = calculate_user_level(total_xp + COALESCE(NEW.points_earned, 0)),
    reputation_score = reputation_score + CASE 
      WHEN NEW.activity_type = 'vote' THEN 5
      WHEN NEW.activity_type = 'proposal' THEN 25
      WHEN NEW.activity_type = 'delegation' THEN 10
      WHEN NEW.activity_type = 'discussion' THEN 2
      WHEN NEW.activity_type = 'event_attendance' THEN 15
      ELSE 0
    END,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  -- Create stats record if it doesn't exist
  INSERT INTO user_stats (user_id, total_xp, level, reputation_score)
  SELECT NEW.user_id, COALESCE(NEW.points_earned, 0), 1, 5
  WHERE NOT EXISTS (SELECT 1 FROM user_stats WHERE user_id = NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on governance activities
CREATE TRIGGER update_stats_on_governance_activity
  AFTER INSERT ON governance_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_activity();

-- Function to update cities_joined count
CREATE OR REPLACE FUNCTION update_cities_joined_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Increment cities_joined when membership becomes active
    UPDATE user_stats SET
      cities_joined = cities_joined + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
      -- Became active
      UPDATE user_stats SET
        cities_joined = cities_joined + 1,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
      -- No longer active
      UPDATE user_stats SET
        cities_joined = GREATEST(0, cities_joined - 1),
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update cities_joined count
CREATE TRIGGER update_cities_joined_on_membership_change
  AFTER INSERT OR UPDATE ON city_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_cities_joined_count();

-- Create leaderboard view
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT 
  up.id,
  up.wallet_address,
  up.username,
  up.avatar_url,
  us.total_xp,
  us.level,
  us.cities_joined,
  us.badges_earned,
  us.reputation_score,
  ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as xp_rank,
  ROW_NUMBER() OVER (ORDER BY us.reputation_score DESC) as reputation_rank,
  ROW_NUMBER() OVER (ORDER BY us.level DESC, us.total_xp DESC) as level_rank
FROM user_profiles up
JOIN user_stats us ON up.id = us.user_id
ORDER BY us.total_xp DESC;

-- Create city member counts view
CREATE OR REPLACE VIEW city_member_counts AS
SELECT 
  city_id,
  city_name,
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_members,
  AVG(progress_percentage) as avg_progress,
  MAX(last_activity_at) as last_activity
FROM city_memberships
GROUP BY city_id, city_name;

-- Grant permissions for views
GRANT SELECT ON user_leaderboard TO authenticated;
GRANT SELECT ON city_member_counts TO authenticated;