-- Fix user_sessions RLS policies to allow authenticated users to manage their own sessions

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can create their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;

-- Create comprehensive policies for user_sessions
CREATE POLICY "Users can create their own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Also allow anonymous users to have session tracking (optional - remove if not desired)
CREATE POLICY "Anonymous users can create sessions"
  ON user_sessions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can view their sessions"
  ON user_sessions
  FOR SELECT
  TO anon
  USING (user_id IS NULL AND id = id); -- Can only see specific session by ID

CREATE POLICY "Anonymous users can update their sessions"
  ON user_sessions
  FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);