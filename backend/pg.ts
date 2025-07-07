import type { InLibraryCard, Library, InLibrarySearchResult } from './library'
import { downloadAsset } from './blob'
import { sql } from './db'
import { Booq, BooqMetadata } from '@/core'
import { addToSearchIndex } from './search'

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
      ...row.meta,
    }
  })
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

export async function search(query: string, _limit = 20, _offset = 0): Promise<InLibrarySearchResult[]> {
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
      source: 'pg',
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

async function insertDbCard(card: DbPgCard): Promise<boolean> {
  const rows = await sql`
    INSERT INTO pg_assets (id, asset_id, meta)
    VALUES (${card.id}, ${card.asset_id}, ${card.meta})
    ON CONFLICT (id) DO NOTHING
  `
  return rows.length > 0
}