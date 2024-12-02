-- Drop ALL existing select policies for lessons
DROP POLICY IF EXISTS "Users can view their own and shared lessons" ON lessons;
DROP POLICY IF EXISTS "Users can view shared lessons" ON lessons;
DROP POLICY IF EXISTS "Users can manage their own lessons" ON lessons;

-- Create a single, comprehensive select policy for lessons
CREATE POLICY "Users can view lessons"
ON lessons FOR SELECT
USING (
  -- User owns the lesson
  user_id = auth.uid()
  OR
  -- Lesson is directly shared
  is_shared = true
  OR
  -- Lesson belongs to a shared section
  section_id IN (
    SELECT id FROM sections WHERE is_shared = true
  )
);

-- Drop and recreate other policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own lessons" ON lessons;
DROP POLICY IF EXISTS "Only admins can create shared lessons" ON lessons;
CREATE POLICY "Users can insert lessons"
ON lessons FOR INSERT
WITH CHECK (
  -- Regular users can create their own non-shared lessons
  (is_shared = false AND user_id = auth.uid())
  OR
  -- Admins can create shared lessons
  (is_shared = true AND is_admin(auth.uid()))
);

DROP POLICY IF EXISTS "Users can update their own lessons" ON lessons;
CREATE POLICY "Users can update lessons"
ON lessons FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own lessons" ON lessons;
CREATE POLICY "Users can delete lessons"
ON lessons FOR DELETE
USING (user_id = auth.uid());