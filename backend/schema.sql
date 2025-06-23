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

-- Library metadata (for searching)
CREATE TABLE IF NOT EXISTS library_metadata (
  source TEXT NOT NULL, -- 'uu' for uu_assets, 'pg' for pg_assets
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  asset_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors CITEXT[],
  file_as CITEXT[],
  languages CITEXT[],
  subjects CITEXT[],
  meta JSONB NOT NULL,
  PRIMARY KEY (source, id),
);

-- For efficient search in title and authors
CREATE INDEX idx_library_metadata_source_title ON library_metadata (source, title);
CREATE INDEX idx_library_metadata_source_authors ON library_metadata (source, unnest(authors));

-- For filtering by language
CREATE INDEX idx_library_metadata_languages ON library_metadata USING GIN (languages);

-- For filtering by subject
CREATE INDEX idx_library_metadata_subjects ON library_metadata USING GIN (subjects);

-- For prefix search on authors (optional optimization)
CREATE INDEX idx_library_metadata_authors_prefix ON library_metadata
USING GIN (authors gin_trgm_ops); -- Requires pg_trgm extension

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