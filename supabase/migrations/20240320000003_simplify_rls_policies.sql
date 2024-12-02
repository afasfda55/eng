-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can insert their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can update their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can delete their own subsections" ON subsections;

-- Create simplified policies for subsections
CREATE POLICY "Users can view their own subsections"
  ON subsections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subsections"
  ON subsections FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own subsections"
  ON subsections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subsections"
  ON subsections FOR DELETE
  USING (auth.uid() = user_id);