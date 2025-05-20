import type { InLibraryCard, Library, InLibrarySearchResult } from './library'
import { downloadAsset } from './blob'
import { redis, sanitizeForRedisHash } from './db'
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
  assetId: string,
  meta: BooqMetadata,
  // Flat metadata for search
  title: string,
  primaryFileAs: string,
  fileAs: string[],
  languages: string[],
  description: string | undefined,
  subjects: string[] | undefined,
  rights: string | undefined,
}

export async function cards(ids: string[]): Promise<InLibraryCard[]> {
  const all = await Promise.all(ids.map(cardForId))
  return all.filter((card) => card !== undefined)
}

export async function forAuthor(_name: string, _limit?: number, _offset?: number): Promise<InLibraryCard[]> {
  // TODO: implement this
  return []
}

export async function search(query: string, _limit = 20, _offset = 0): Promise<InLibrarySearchResult[]> {
  // TODO: implement this
  return []
}

export async function fileForId(id: string) {
  const assetId = await redis.hget<DbPgCard['assetId']>(`library:pg:cards:${id}`, 'assetId')
  if (!assetId) {
    return undefined
  } else {
    const asset = await downloadAsset(pgEpubsBucket, assetId)
    return Buffer.isBuffer(asset)
      ? { kind: 'epub', file: asset } as const
      : undefined
  }
}

export async function existingIds(): Promise<number[]> {
  return redis.smembers('library:pg:ids')
}

export async function insertPgRecord({ booq, assetId, id }: {
  booq: Booq,
  assetId: string,
  id: string,
}) {
  const success = await insertDbCard(id, {
    assetId,
    ...dbFromCard({
      id,
      ...booq.metadata,
    }),
  })
  if (success) {
    await redis.sadd('library:pg:ids', id)
    return { id }
  } else {
    console.error('Could not insert record: ', assetId)
    return undefined
  }
}

async function cardForId(id: string): Promise<InLibraryCard | undefined> {
  const row = await redis.hgetall<DbPgCard>(`library:pg:cards:${id}`)
  if (!row) {
    return undefined
  }
  return {
    id,
    ...cardFromDb(row),
  }
}

async function insertDbCard(id: string, card: DbPgCard): Promise<boolean> {
  await redis.hset(`library:pg:cards:${id}`, sanitizeForRedisHash(card))
  return true
}

function cardFromDb(row: DbPgCard): Omit<InLibraryCard, 'id'> {
  return row.meta
}

function dbFromCard(card: InLibraryCard): Omit<DbPgCard, 'assetId'> {
  const { id, ...meta } = card
  const {
    authors, title, extra,
  } = meta
  const fileAs = authors.map((a) => a.fileAs ?? a.name)
  const primaryFileAs = fileAs[0] ?? 'Unknown'
  const languages = getExtraMetadataValues('language', extra ?? [])
  const description = getExtraMetadataValues('description', extra ?? []).join('\n')
  const subjects = getExtraMetadataValues('subject', extra ?? [])
  const rights = getExtraMetadataValues('rights', extra ?? []).join(' | ')
  return {
    title,
    languages,
    description,
    rights,
    fileAs,
    primaryFileAs,
    subjects,
    meta: card,
  }
}