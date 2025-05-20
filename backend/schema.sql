CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE,
  name TEXT,
  profile_picture_url TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Library
CREATE TABLE IF NOT EXISTS booq_library (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- 'pg', 'uu'
  source_id TEXT NOT NULL, -- original ID in the source table
  asset_id TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'uploads'

  title TEXT,
  authors TEXT,
  languages TEXT[],
  subjects TEXT,

  searchable_tsv TSVECTOR
);

-- Fuzzy search (substring)
CREATE INDEX idx_library_title_trgm ON booq_library USING GIN (title gin_trgm_ops);
CREATE INDEX idx_library_authors_trgm ON booq_library USING GIN (authors gin_trgm_ops);
CREATE INDEX idx_library_subjects_trgm ON booq_library USING GIN (subjects gin_trgm_ops);

-- Exact match for language
CREATE INDEX idx_library_languages ON booq_library USING GIN (languages);

-- Full-text search
CREATE INDEX idx_library_searchable_tsv ON booq_library USING GIN (searchable_tsv);

-- Optional: for filtering by visibility
CREATE INDEX idx_library_visibility ON booq_library (visibility);

CREATE OR REPLACE FUNCTION sync_library()
RETURNS TRIGGER AS $$
DECLARE
  source_arg TEXT := TG_ARGV[0];         -- 'pg' or 'uu'
  visibility_arg TEXT := TG_ARGV[1]; -- 'public', 'uploads', etc.
  authors TEXT;
  languages TEXT[];
  subjects TEXT;
  description TEXT;
BEGIN
  -- extract authors string
  SELECT string_agg(author->>'name', ' ')
    INTO authors
  FROM jsonb_array_elements(NEW.meta->'authors') author;

  -- extract languages from extra
  SELECT ARRAY_AGG(entry->>'value')
    INTO languages
  FROM jsonb_array_elements(NEW.meta->'extra') entry
  WHERE lower(entry->>'name') = 'language';

  -- extract subjects from extra
  SELECT string_agg(entry->>'value', ' ')
    INTO subjects
  FROM jsonb_array_elements(NEW.meta->'extra') entry
  WHERE lower(entry->>'name') = 'subject';

  -- optional: extract description
  SELECT string_agg(entry->>'value', E'\n')
    INTO description
  FROM jsonb_array_elements(NEW.meta->'extra') entry
  WHERE lower(entry->>'name') = 'description';

  INSERT INTO booq_library (
    id,
    source,
    source_id,
    asset_id,
    visibility,
    title,
    authors,
    languages,
    subjects,
    searchable_tsv
  )
  VALUES (
    source_arg || '/' || NEW.id,
    source_arg,
    NEW.id,
    NEW.asset_id,
    visibility_arg,
    NEW.meta->>'title',
    authors,
    languages,
    subjects,
    to_tsvector('english',
      unaccent(
        coalesce(NEW.meta->>'title', '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(authors, '') || ' ' ||
        coalesce(subjects, '')
      )
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    authors = EXCLUDED.authors,
    languages = EXCLUDED.languages,
    subjects = EXCLUDED.subjects,
    searchable_tsv = EXCLUDED.searchable_tsv;
    
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_from_library()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM booq_library WHERE id = TG_ARGV[0] || '/' || OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Uploads
-- uu_assets
CREATE TABLE IF NOT EXISTS uu_assets (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  asset_id TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB NOT NULL
);

CREATE TRIGGER trg_delete_library_uu
  AFTER DELETE ON uu_assets
  FOR EACH ROW
  EXECUTE FUNCTION delete_from_library('uu');

CREATE TRIGGER trg_sync_library_uu
  AFTER INSERT OR UPDATE ON uu_assets
  FOR EACH ROW
  EXECUTE FUNCTION sync_library('uu', 'uploads');

-- uploads
CREATE TABLE IF NOT EXISTS uploads (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upload_id TEXT NOT NULL REFERENCES uu_assets(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, upload_id)
);
CREATE INDEX IF NOT EXISTS uploads_upload_id_idx ON uploads(upload_id);
CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads(user_id);
CREATE INDEX IF NOT EXISTS uploads_uploaded_at_idx ON uploads(uploaded_at);

-- Progect Gutenberg
-- pg_assets
CREATE TABLE IF NOT EXISTS pg_assets (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  meta JSONB NOT NULL
);
CREATE TRIGGER trg_sync_library_pg
  AFTER INSERT OR UPDATE ON pg_assets
  FOR EACH ROW
  EXECUTE FUNCTION sync_library('pg', 'public');
CREATE TRIGGER trg_delete_library_pg
  AFTER DELETE ON pg_assets
  FOR EACH ROW
  EXECUTE FUNCTION delete_from_library('pg');

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_collection_name_unique UNIQUE (user_id, name)
);
CREATE INDEX IF NOT EXISTS collections_user_id_idx ON collections(user_id);

-- Booqs in collections
CREATE TABLE IF NOT EXISTS user_collections_booqs (
  collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
  booq_id TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, booq_id)
);
CREATE INDEX IF NOT EXISTS user_collections_booqs_booq_id_idx ON user_collections_booqs(booq_id);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  booq_id TEXT NOT NULL,
  start_path INTEGER[] NOT NULL,
  end_path INTEGER[] NOT NULL,
  color TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notes_author_id_idx ON notes(author_id);
CREATE INDEX IF NOT EXISTS notes_booq_id_idx ON notes(booq_id);
CREATE INDEX IF NOT EXISTS notes_user_id_booq_id_idx ON notes(author_id, booq_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at);

-- Passkey credentials
CREATE TABLE IF NOT EXISTS passkey_credentials (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);