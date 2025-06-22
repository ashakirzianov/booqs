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

-- Library metadata view
DROP MATERIALIZED VIEW IF EXISTS library_metadata CASCADE;
CREATE MATERIALIZED VIEW library_metadata AS
SELECT
  'uu' AS source,
  id,
  asset_id,
  meta->>'title' AS title,
  (
    SELECT string_agg(a->>'name', ', ')
    FROM jsonb_array_elements(meta->'authors') AS a
  ) AS author_names,
  (
    SELECT array_agg(a->>'fileAs')
    FROM jsonb_array_elements(meta->'authors') AS a
    WHERE a ? 'fileAs'
  ) AS file_as_list,
  (
    SELECT array_agg(e->>'value')
    FROM jsonb_array_elements(meta->'extra') AS e
    WHERE e->>'name' = 'subject'
  ) AS subjects,
  (
    SELECT array_agg(e->>'value')
    FROM jsonb_array_elements(meta->'extra') AS e
    WHERE e->>'name' = 'language'
  ) AS languages
FROM uu_assets
UNION ALL
SELECT
  'pg' AS source,
  id,
  asset_id,
  meta->>'title',
  (
    SELECT string_agg(a->>'name', ', ')
    FROM jsonb_array_elements(meta->'authors') AS a
  ),
  (
    SELECT array_agg(a->>'fileAs')
    FROM jsonb_array_elements(meta->'authors') AS a
    WHERE a ? 'fileAs'
  ),
  (
    SELECT array_agg(e->>'value')
    FROM jsonb_array_elements(meta->'extra') AS e
    WHERE e->>'name' = 'subject'
  ),
  (
    SELECT array_agg(e->>'value')
    FROM jsonb_array_elements(meta->'extra') AS e
    WHERE e->>'name' = 'language'
  )
FROM pg_assets;

-- Add a unique index for concurrent refresh
CREATE UNIQUE INDEX library_metadata_id_source_idx
  ON library_metadata (id, source);

-- Add additional indexes for search
CREATE INDEX library_metadata_title_trgm
  ON library_metadata USING GIN (title gin_trgm_ops);

CREATE INDEX library_metadata_author_names_trgm
  ON library_metadata USING GIN (author_names gin_trgm_ops);

CREATE INDEX library_metadata_subjects
  ON library_metadata USING GIN (subjects);

CREATE INDEX library_metadata_languages
  ON library_metadata USING GIN (languages);

CREATE INDEX library_metadata_file_as_list
  ON library_metadata USING GIN (file_as_list);

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