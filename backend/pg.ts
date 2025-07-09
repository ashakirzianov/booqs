import type { InLibraryCard, Library } from './library'
import { downloadAsset } from './blob'
import { sql } from './db'
import { Booq, BooqMetadata } from '@/core'
import { getExtraMetadataValues } from '@/core/meta'

export const pgLibrary: Library = {
  search,
  cards,
  fileForId,
  forAuthor,
}

export const pgEpubsBucket = 'pg-epubs'

type DbPgCard = {
  id: string,
  asset_id: string,
  meta: BooqMetadata,
}

export async function cards(ids: string[]): Promise<InLibraryCard[]> {
  if (ids.length === 0) return []

  const rows = await sql`
    SELECT *
    FROM pg_assets
    WHERE id = ANY(${ids})
  ` as DbPgCard[]
  return rows.map(row => {
    return {
      id: row.id,
      meta: row.meta,
    }
  })
}

type DbPgMetadata = {
  id: string,
  asset_id: string,
  title: string,
  authors: string[],
  authors_text: string,
  languages: string[],
  subjects: string[],
  meta: BooqMetadata,
}

export async function search(query: string, limit: number): Promise<InLibraryCard[]> {
  const like = `%${query.toLowerCase()}%`
  const result = await sql`
    SELECT *
    FROM pg_metadata
    WHERE lower(title) LIKE ${like}
       OR lower(authors_text) LIKE ${like}
    ORDER BY title
    LIMIT ${limit}
  ` as DbPgMetadata[]
  return result.map(({ id, meta }) => ({
    id,
    meta,
  }))
}

export async function addToSearchIndex({
  id,
  assetId,
  metadata,
}: {
  id: string,
  assetId: string,
  metadata: BooqMetadata,
}): Promise<boolean> {
  const { title, authors, extra } = metadata
  const languages = getExtraMetadataValues('language', extra)
  const subjects = getExtraMetadataValues('subject', extra)
  const authorNames = authors.map(a => a.name)
  const authorsText = authorNames.join(' ')

  const result = await sql`
    INSERT INTO pg_metadata (
      id,
      asset_id,
      title,
      authors,
      authors_text,
      languages,
      subjects,
      meta
    ) VALUES (
      ${id},
      ${assetId},
      ${title},
      ${authorNames},
      ${authorsText},
      ${languages},
      ${subjects},
      ${metadata}
    )
    ON CONFLICT (id) DO UPDATE
    SET
      asset_id = EXCLUDED.asset_id,
      title = EXCLUDED.title,
      authors = EXCLUDED.authors,
      authors_text = EXCLUDED.authors_text,
      languages = EXCLUDED.languages,
      subjects = EXCLUDED.subjects,
      meta = EXCLUDED.meta
    RETURNING id
  `
  return result.length > 0
}

export async function fileForId(id: string) {
  const assetId = await assetIdForId(id)
  if (!assetId) {
    return undefined
  } else {
    const asset = await downloadAsset(pgEpubsBucket, assetId)
    return Buffer.isBuffer(asset)
      ? { kind: 'epub', file: asset } as const
      : undefined
  }
}

export async function forAuthor(_name: string, _limit?: number, _offset?: number): Promise<InLibraryCard[]> {
  // TODO: implement this
  return []
}

async function assetIdForId(id: string): Promise<string | undefined> {
  const rows = await sql`
    SELECT asset_id
    FROM pg_assets
    WHERE id = ${id}
    LIMIT 1
  ` as Array<Pick<DbPgCard, 'asset_id'>>
  return rows[0]?.asset_id
}

export async function insertPgRecord({ booq, assetId, id }: {
  booq: Booq,
  assetId: string,
  id: string,
}) {
  const insertSuccess = await insertDbCard({
    id,
    asset_id: assetId,
    meta: booq.metadata,
  })
  if (insertSuccess) {
    const indexSuccess = await addToSearchIndex({
      id,
      assetId,
      metadata: booq.metadata,
    })
    if (indexSuccess) {
      return { id }
    }
  }
  return undefined
}

export async function existingIds(): Promise<string[]> {
  const rows = await sql`
    SELECT id
    FROM pg_assets
  `
  return rows.map(r => r.id)
}

export async function existingAssetIds(): Promise<string[]> {
  const rows = await sql`
    SELECT asset_id
    FROM pg_assets
  `
  return rows.map(r => r.asset_id)
}

async function insertDbCard(card: DbPgCard): Promise<boolean> {
  const rows = await sql`
    INSERT INTO pg_assets (id, asset_id, meta)
    VALUES (${card.id}, ${card.asset_id}, ${card.meta})
    ON CONFLICT (id) DO UPDATE
    SET asset_id = EXCLUDED.asset_id,
      meta = EXCLUDED.meta
    RETURNING id
  `
  return rows.length > 0
}