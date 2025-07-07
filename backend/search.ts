import { BooqMetadata, BooqSearchResult } from '@/core'
import { sql } from './db'
import { getExtraMetadataValues } from '@/core/meta'

type DbLibraryMetadata = {
    id: string,
    source: string,
    title: string,
    authors: string[],
    file_as: string[],
    languages: string[],
    subjects: string[],
    meta: BooqMetadata,
}

type BooqSource = 'pg' | 'uu'
export async function search({
    query, source, limit = 20, offset = 0,
}: {
    query: string,
    source: BooqSource,
    limit?: number,
    offset?: number,
}): Promise<BooqSearchResult[]> {
    const like = `%${query}%`
    const result = await sql`
    SELECT *
    FROM library_metadata
    WHERE source = ${source}
      AND (title ILIKE ${like} OR EXISTS (
        SELECT 1 FROM unnest(authors) AS author WHERE author ILIKE ${like}
      ))
    ORDER BY title
    LIMIT ${limit}
    OFFSET ${offset}
  ` as DbLibraryMetadata[]
    return result.map(({
        id, meta, authors,
    }) => ({
        kind: 'booq',
        booqId: `${source}/${id}`,
        title: meta.title,
        authors,
        coverSrc: meta.coverSrc,
    }))
}

export async function addToSearchIndex({
    id, source, assetId,
    metadata,
}: {
    id: string,
    source: BooqSource,
    assetId: string,
    metadata: BooqMetadata,
}): Promise<boolean> {
    const { title, authors, extra } = metadata
    const languages = getExtraMetadataValues('language', extra)
    const subjects = getExtraMetadataValues('subject', extra)
    const fileAs = authors
        .map(author => author.fileAs ?? author.name)
    const result = await sql`
        INSERT INTO library_metadata (
            source,
            id,
            asset_id,
            title,
            authors,
            file_as,
            languages,
            subjects,
            meta
        )
        VALUES (
            ${source},
            ${id},
            ${assetId},
            ${title},
            ${authors},
            ${fileAs},
            ${languages},
            ${subjects},
            ${metadata}
    )
        ON CONFLICT (source, id) DO UPDATE
        SET
            asset_id = EXCLUDED.asset_id,
            title = EXCLUDED.title,
            authors = EXCLUDED.authors,
            file_as = EXCLUDED.file_as,
            languages = EXCLUDED.languages,
            subjects = EXCLUDED.subjects,
            meta = EXCLUDED.meta
        RETURNING id
    `
    if (result.length === 0) {
        return false
    }
    return true
}