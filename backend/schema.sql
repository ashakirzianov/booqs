CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  profile_picture_url TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

CREATE TABLE pg_cards (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  language TEXT,
  length INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  view_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  searchable_tsv TSVECTOR
);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_collection_name_unique UNIQUE (user_id, name)
);
CREATE TABLE user_collections_books (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  booq_id TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, booq_id)
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booq_id TEXT NOT NULL,
  path SMALLINT[] NOT NULL,
  CONSTRAINT unique_user_booq_path UNIQUE (user_id, booq_id, path)
);