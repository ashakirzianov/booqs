CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_picture_url TEXT,
  emoji VARCHAR(10) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploads
-- uu_assets
CREATE TABLE IF NOT EXISTS uu_assets (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  asset_id TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB NOT NULL
);

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

-- Project Gutenberg metadata table
CREATE TABLE IF NOT EXISTS pg_metadata (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[],
  authors_text TEXT,
  languages TEXT[],
  subjects TEXT[],
  meta JSONB NOT NULL
);

-- Efficient case-insensitive partial title match
CREATE INDEX IF NOT EXISTS idx_pg_metadata_title_lower
ON pg_metadata (lower(title));

-- Efficient exact author match: 'Leo Tolstoy' = ANY(authors)
CREATE INDEX IF NOT EXISTS idx_pg_metadata_authors_gin
ON pg_metadata USING GIN (authors);

-- Efficient partial author match: '%tolst%' in authors_text
CREATE INDEX IF NOT EXISTS idx_pg_metadata_authors_text_lower
ON pg_metadata (lower(authors_text));

-- Exact language match: 'English' = ANY(languages)
CREATE INDEX IF NOT EXISTS idx_pg_metadata_languages_gin
ON pg_metadata USING GIN (languages);

-- Exact subject match: 'Science Fiction' = ANY(subjects)
CREATE INDEX IF NOT EXISTS idx_pg_metadata_subjects_gin
ON pg_metadata USING GIN (subjects);

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

-- Notes privacy enum
CREATE TYPE note_privacy AS ENUM ('private', 'public');

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  booq_id TEXT NOT NULL,
  start_path INTEGER[] NOT NULL,
  end_path INTEGER[] NOT NULL,
  color TEXT NOT NULL,
  content TEXT,
  target_quote TEXT NOT NULL,
  privacy note_privacy NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notes_author_id_idx ON notes(author_id);
CREATE INDEX IF NOT EXISTS notes_booq_id_idx ON notes(booq_id);
CREATE INDEX IF NOT EXISTS notes_user_id_booq_id_idx ON notes(author_id, booq_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at);
CREATE INDEX IF NOT EXISTS notes_privacy_idx ON notes(privacy);
CREATE INDEX IF NOT EXISTS notes_booq_id_privacy_idx ON notes(booq_id, privacy);

-- Passkey credentials
CREATE TABLE IF NOT EXISTS passkey_credentials (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT[],
  label TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Follows (user following relationships)
CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);