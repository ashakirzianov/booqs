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
  assetId: string,
  length: number,
  title: string | undefined,
  authors: string[] | undefined,
  languages: string[] | undefined,
  subjects: string[] | undefined,
  description: string | undefined,
  contributors: string[] | undefined,
  coverSrc: string | undefined,
  rights: string | undefined,
  tags: Array<[key: string, value?: string]> | undefined,
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
    title, authors, subjects, languages, description, coverSrc,
    rights, contributors, tags,
  } = booq.meta
  const success = await insertDbCard(`${index}`, {
    assetId,
    length: booq.length,
    subjects,
    title: title,
    authors,
    languages,
    description,
    coverSrc: coverSrc,
    rights,
    contributors,
    tags: [
      ...(tags ?? []),
      ['pg-index', `${index}`],
    ],
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
    length: row.length,
    title: row.title ?? undefined,
    authors: row.authors,
    subjects: row.subjects,
    languages: row.languages,
    description: row.description,
    contributors: row.contributors,
    coverSrc: row.coverSrc,
    rights: row.rights,
    tags: row.tags,
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