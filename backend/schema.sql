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

-- uu_cards
CREATE TABLE IF NOT EXISTS uu_cards (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  asset_id TEXT NOT NULL,
  length INTEGER,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  language TEXT,
  description TEXT,
  subjects TEXT[],
  cover TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  file_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  searchable_tsv TSVECTOR
);
CREATE INDEX IF NOT EXISTS uu_cards_search_idx ON uu_cards USING GIN (searchable_tsv);

-- Uploads
CREATE TABLE IF NOT EXISTS uploads (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upload_id TEXT NOT NULL REFERENCES uu_cards(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, upload_id)
);
CREATE INDEX IF NOT EXISTS uploads_upload_id_idx ON uploads(upload_id);

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

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booq_id TEXT NOT NULL,
  path SMALLINT[] NOT NULL,
  CONSTRAINT unique_user_booq_path UNIQUE (user_id, booq_id, path)
);
CREATE INDEX IF NOT EXISTS bookmarks_user_booq_idx ON bookmarks(user_id, booq_id);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);

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

-- Passkey credentials
CREATE TABLE IF NOT EXISTS passkey_credentials (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Full-text search helper functions
CREATE OR REPLACE FUNCTION jsonb_to_text(jsonb) RETURNS TEXT AS $$
  SELECT string_agg(value::text, ' ') FROM jsonb_each_text($1)
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION greatest_similarity(arr TEXT[], query TEXT) RETURNS FLOAT AS $$
  SELECT MAX(similarity(el, query)) FROM unnest(arr) el
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION exists_similarity(arr TEXT[], query TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM unnest(arr) el WHERE el % query)
$$ LANGUAGE SQL IMMUTABLE;

-- FTS triggers for pg_cards (with 'english' config)
CREATE OR REPLACE FUNCTION update_uu_cards_search_tsv() RETURNS trigger AS $$
BEGIN
  NEW.searchable_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(NEW.authors, ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(NEW.subjects, ' ')), 'D') ||
    setweight(to_tsvector('english', coalesce(jsonb_to_text(NEW.metadata), '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER uu_cards_search_trigger
  BEFORE INSERT OR UPDATE ON uu_cards
  FOR EACH ROW EXECUTE FUNCTION update_uu_cards_search_tsv();