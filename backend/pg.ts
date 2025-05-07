import type { InLibraryCard, Library, InLibrarySearchResult } from './library'
import { downloadAsset } from './s3'
import { redis } from './db'
import { Booq } from '@/core'

export const pgLibrary: Library = {
  search,
  cards,
  fileForId,
  forAuthor,
}

export const pgEpubsBucket = 'pg-epubs'

type DbPgCard = {
  asset_id: string,
  length: number,
  title: string | null,
  authors: string[],
  languages: string[],
  subjects: string[],
  description: string | null,
  cover_url: string | null,
  rights: string | null,
  tags: Array<[key: string, value?: string]>,
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
  const asset_id = await redis.hget<DbPgCard['asset_id']>(`library:pg:cards:${id}`, 'asset_id')
  if (!asset_id) {
    return undefined
  } else {
    const asset = await downloadAsset(pgEpubsBucket, asset_id)
    return Buffer.isBuffer(asset)
      ? { kind: 'epub', file: asset } as const
      : undefined
  }
}

export async function existingAssetIds(): Promise<string[]> {
  return redis.smembers('library:pg:asset_ids')
}

export async function insertAssetRecord({ booq, assetId }: {
  booq: Booq,
  assetId: string,
}) {
  const index = indexFromAssetId(assetId)
  if (index === undefined) {
    return undefined
  }
  const {
    title, authors, subjects, languages, descriptions, cover,
    rights,
    // contributors, tags,
  } = booq.meta
  const length = booq.toc.length
  const success = await insertDbCard(`${index}`, {
    asset_id: assetId,
    length,
    subjects,
    title: title ?? null,
    authors: authors,
    languages: languages,
    description: descriptions.join('\n'),
    cover_url: cover?.href ?? null,
    rights: rights ?? null,
    // TODO: support tags, rights and contributors
    tags: [],
  })
  if (success) {
    await redis.sadd('library:pg:asset_ids', assetId)
    return { id: `${index}` }
  } else {
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
    title: row.title ?? undefined,
    authors: row.authors,
    subjects: row.subjects,
    languages: row.languages,
    description: row.description ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    tags: row.tags.map(([key, value]) => ({
      name: key,
      value: value ?? undefined,
    })),
    length: row.length,
  }
}

async function insertDbCard(id: string, card: DbPgCard): Promise<boolean> {
  await redis.hset(`library:pg:cards:${id}`, card)
  return true
}

function indexFromAssetId(assetId: string): number | undefined {
  const match = assetId.match(/^pg(\d+)/)
  if (match) {
    const indexString = match[1]
    const index = parseInt(indexString, 10)
    return isNaN(index) ? undefined : index
  } else {
    return undefined
  }
}