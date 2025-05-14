-- DROP TABLE IF EXISTS
--   passkey_credentials,
--   notes,
--   bookmarks,
--   user_collections_booqs,
--   collections,
--   uploads,
--   uu_cards,
--   users
-- CASCADE;

-- DROP FUNCTION IF EXISTS
--   update_uu_cards_search_tsv,
--   jsonb_to_text(jsonb),
--   greatest_similarity(text[], text),
--   exists_similarity(text[], text)
-- CASCADE;

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
  file_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS uu_cards_search_idx ON uu_cards USING GIN (searchable_tsv);
CREATE INDEX IF NOT EXISTS uu_cards_file_hash_idx ON uu_cards(file_hash);
CREATE INDEX IF NOT EXISTS uu_cards_asset_id_idx ON uu_cards(asset_id);
-- Enable pg_trgm if not already
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index on title
CREATE INDEX IF NOT EXISTS uu_cards_title_trgm_idx
ON uu_cards
USING gin ((meta->>'title') gin_trgm_ops);

-- Index on authors' names (flatten JSON array into string)
CREATE INDEX IF NOT EXISTS uu_cards_authors_trgm_idx
ON uu_cards
USING gin (
  (
    string_agg(DISTINCT a->>'name', ' ')
    FROM jsonb_array_elements_text(meta->'authors') AS a
  ) gin_trgm_ops
);

-- Uploads
CREATE TABLE IF NOT EXISTS uploads (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upload_id TEXT NOT NULL REFERENCES uu_cards(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, upload_id)
);
CREATE INDEX IF NOT EXISTS uploads_upload_id_idx ON uploads(upload_id);
CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads(user_id);
CREATE INDEX IF NOT EXISTS uploads_uploaded_at_idx ON uploads(uploaded_at);

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