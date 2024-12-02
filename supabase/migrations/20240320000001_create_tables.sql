-- Create tables with proper schemas
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  subsection_id UUID REFERENCES subsections(id) ON DELETE SET NULL,
  "order" INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  shared_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS words (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  shared_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS subsections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  shared_by UUID REFERENCES auth.users(id)
);

-- Add admin flag to users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add shared flag to sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS shared_by UUID REFERENCES auth.users(id);

-- Add shared flag to subsections
ALTER TABLE subsections ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE subsections ADD COLUMN IF NOT EXISTS shared_by UUID REFERENCES auth.users(id);

-- Add shared flag to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS shared_by UUID REFERENCES auth.users(id);

-- Create a secure function to get current user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  is_admin BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Only allow users to get their own profile
  IF auth.uid() = user_id THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.email::TEXT,
      u.is_admin
    FROM auth.users u
    WHERE u.id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;

-- Create admin functions
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for sections
CREATE POLICY "Users can view shared sections"
ON sections FOR SELECT
USING (
  is_shared = true OR user_id = auth.uid()
);

CREATE POLICY "Only admins can create shared sections"
ON sections FOR INSERT
WITH CHECK (
  (is_shared = false AND user_id = auth.uid()) OR
  (is_shared = true AND is_admin(auth.uid()))
);

CREATE POLICY "Only admins can update shared sections"
ON sections FOR UPDATE
USING (
  (is_shared = false AND user_id = auth.uid()) OR
  (is_shared = true AND is_admin(auth.uid()))
);

-- Similar policies for subsections and lessons
CREATE POLICY "Users can view shared subsections"
ON subsections FOR SELECT
USING (
  is_shared = true OR user_id = auth.uid()
);

CREATE POLICY "Only admins can create shared subsections"
ON subsections FOR INSERT
WITH CHECK (
  (is_shared = false AND user_id = auth.uid()) OR
  (is_shared = true AND is_admin(auth.uid()))
);

CREATE POLICY "Users can view shared lessons"
ON lessons FOR SELECT
USING (
  is_shared = true OR user_id = auth.uid()
);

CREATE POLICY "Only admins can create shared lessons"
ON lessons FOR INSERT
WITH CHECK (
  (is_shared = false AND user_id = auth.uid()) OR
  (is_shared = true AND is_admin(auth.uid()))
);