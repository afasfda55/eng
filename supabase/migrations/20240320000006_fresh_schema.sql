-- Drop existing tables and their dependencies
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS subsections CASCADE;
DROP TABLE IF EXISTS sections CASCADE;

-- Create sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, name)
);

-- Create subsections table with proper relationship
CREATE TABLE subsections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(section_id, name)
);

-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  subsection_id UUID REFERENCES subsections(id) ON DELETE SET NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create words table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new', 'pronunciation', 'sentence')),
  meaning TEXT,
  example TEXT,
  phonetic TEXT,
  part_of_speech TEXT,
  start INTEGER NOT NULL,
  "end" INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Policies for sections
CREATE POLICY "Users can manage their own sections"
  ON sections
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for subsections
CREATE POLICY "Users can view subsections through section ownership"
  ON subsections
  USING (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage subsections through section ownership"
  ON subsections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subsections through section ownership"
  ON subsections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subsections through section ownership"
  ON subsections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sections
      WHERE sections.id = section_id
      AND sections.user_id = auth.uid()
    )
  );

-- Policies for lessons
CREATE POLICY "Users can manage their own lessons"
  ON lessons
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for words
CREATE POLICY "Users can manage their own words"
  ON words
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_sections_user_id ON sections(user_id);
CREATE INDEX idx_subsections_section_id ON subsections(section_id);
CREATE INDEX idx_subsections_user_id ON subsections(user_id);
CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE INDEX idx_lessons_subsection_id ON lessons(subsection_id);
CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_words_user_id ON words(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for words table
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();