-- Drop existing policies
DROP POLICY IF EXISTS "Users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Users can manage their own lessons" ON lessons;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON lessons;

-- Create comprehensive policies for lessons
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

-- Policy for inserting lessons
CREATE POLICY "Users can insert lessons"
ON lessons FOR INSERT
WITH CHECK (
  -- Regular users can only create lessons in their sections
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM sections
    WHERE sections.id = section_id
    AND sections.user_id = auth.uid()
  )
);

-- Policy for updating lessons
CREATE POLICY "Users can update lessons"
ON lessons FOR UPDATE
USING (
  -- Users can only update their own lessons
  auth.uid() = user_id
);

-- Policy for deleting lessons
CREATE POLICY "Users can delete lessons"
ON lessons FOR DELETE
USING (
  -- Users can only delete their own lessons
  auth.uid() = user_id
); 