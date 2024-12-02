-- Enable RLS on all tables
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsections ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Create policies for lessons table
CREATE POLICY "Users can view their own lessons"
  ON lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lessons"
  ON lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons"
  ON lessons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons"
  ON lessons FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for sections table
CREATE POLICY "Users can view their own sections"
  ON sections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sections"
  ON sections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections"
  ON sections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections"
  ON sections FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for subsections table
CREATE POLICY "Users can view their own subsections"
  ON subsections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subsections"
  ON subsections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subsections"
  ON subsections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subsections"
  ON subsections FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for words table
CREATE POLICY "Users can view their own words"
  ON words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words"
  ON words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words"
  ON words FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words"
  ON words FOR DELETE
  USING (auth.uid() = user_id);