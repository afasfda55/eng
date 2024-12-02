-- Drop existing foreign key constraint
ALTER TABLE subsections DROP CONSTRAINT IF EXISTS subsections_section_id_fkey;

-- Add the foreign key constraint with CASCADE
ALTER TABLE subsections
  ADD CONSTRAINT subsections_section_id_fkey
  FOREIGN KEY (section_id)
  REFERENCES sections(id)
  ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can insert their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can update their own subsections" ON subsections;
DROP POLICY IF EXISTS "Users can delete their own subsections" ON subsections;

-- Create simplified policies for subsections
CREATE POLICY "Users can view their own subsections"
  ON subsections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own subsections"
  ON subsections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own subsections"
  ON subsections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own subsections"
  ON subsections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );