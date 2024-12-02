-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can insert their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can update their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can delete their own subsections" ON subsections;

-- Create updated policies for subsections
CREATE POLICY "Users can view their own subsections"
  ON subsections FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id 
      FROM sections 
      WHERE id = subsections.section_id
    )
  );

CREATE POLICY "Users can insert their own subsections"
  ON subsections FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id 
      FROM sections 
      WHERE id = section_id
    )
  );

CREATE POLICY "Users can update their own subsections"
  ON subsections FOR UPDATE
  USING (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id 
      FROM sections 
      WHERE id = section_id
    )
  );

CREATE POLICY "Users can delete their own subsections"
  ON subsections FOR DELETE
  USING (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id 
      FROM sections 
      WHERE id = section_id
    )
  );