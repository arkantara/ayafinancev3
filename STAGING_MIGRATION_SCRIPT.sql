-- NOTES TABLE MIGRATION FOR STAGING/PRODUCTION
-- Copy dan paste script ini ke Supabase SQL Editor

-- Enable UUID extension jika belum ada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes table schema for ayaFinance
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Rich text content from Quill editor
    category VARCHAR(100) DEFAULT 'general',
    type VARCHAR(50) DEFAULT 'text',
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- DISABLE RLS DAN FOREIGN KEY UNTUK DEVELOPMENT TESTING
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_notes_updated_at ON notes;
CREATE TRIGGER trigger_update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();

-- Verify table created
SELECT 'Notes table created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_name = 'notes' AND table_schema = 'public';
