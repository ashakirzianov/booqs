import { BooqId, BooqRange } from '@/core'
import { sql } from './db'

export type DbAnnotationPrivacy = 'private' | 'public'

export type DbAnnotation = {
  id: string,
  author_id: string,
  booq_id: string,
  start_path: number[],
  end_path: number[],
  kind: string,
  content: string | null,
  target_quote: string,
  privacy: DbAnnotationPrivacy,
  created_at: string,
  updated_at: string,
}

export type DbAnnotationWithAuthor = DbAnnotation & {
  author_id: string,
  author_name: string,
  author_username: string,
  author_profile_picture_url: string | null,
  author_emoji: string,
}

export async function annotationForId(id: string): Promise<DbAnnotation | null> {
  const [row] = await sql`
      SELECT * FROM notes
      WHERE id = ${id}
    `
  return row ? (row as DbAnnotation) : null
}

export async function annotationsWithAuthorFor({ booqId, authorId, userId, limit, offset }: {
  booqId?: BooqId,
  authorId?: string,
  userId: string | undefined,
  limit?: number,
  offset?: number,
}): Promise<DbAnnotationWithAuthor[]> {
  const rows = await sql`
      SELECT n.*, u.name AS author_name, u.username AS author_username, u.profile_picture_url AS author_profile_picture_url, u.emoji AS author_emoji
      FROM notes n
      JOIN users u ON u.id = n.author_id
      WHERE TRUE
      ${booqId !== undefined ? sql`AND booq_id = ${booqId}` : sql``}
      ${authorId !== undefined ? sql`AND n.author_id = ${authorId}` : sql``}
      AND (n.privacy = 'public'${userId !== undefined ? sql` OR n.author_id = ${userId}` : sql``})
      ORDER BY n.created_at DESC
      ${limit !== undefined ? sql`LIMIT ${limit}` : sql``}
      ${offset !== undefined ? sql`OFFSET ${offset}` : sql``}
      `

  return rows as DbAnnotationWithAuthor[]
}



export async function addAnnotation({
  id,
  authorId,
  booqId,
  range,
  kind,
  content,
  targetQuote,
  privacy = 'private',
}: {
  id: string,
  authorId: string,
  booqId: BooqId,
  range: BooqRange,
  kind: string,
  content?: string,
  targetQuote?: string,
  privacy?: DbAnnotationPrivacy,
}): Promise<DbAnnotation> {
  const [row] = await sql`
      INSERT INTO notes (
        id, author_id, booq_id, start_path, end_path, kind, content, target_quote, privacy
      )
      VALUES (
        ${id}, ${authorId}, ${booqId}, ${range.start}, ${range.end}, ${kind}, ${content ?? null}, ${targetQuote ?? null}, ${privacy}
      )
      RETURNING *
    `
  return row as DbAnnotation
}

export async function removeAnnotation({ id, authorId }: {
  id: string,
  authorId: string,
}): Promise<boolean> {
  const rows = await sql`
      DELETE FROM notes
      WHERE id = ${id} AND author_id = ${authorId}
      RETURNING *
    `
  return rows.length > 0
}

export async function updateAnnotation({
  id, authorId, kind, content, privacy,
}: {
  id: string,
  authorId: string,
  kind?: string,
  content?: string | null,
  privacy?: DbAnnotationPrivacy,
}): Promise<DbAnnotation | null> {
  if (kind === undefined && content === undefined && privacy === undefined) return null

  const [row] = await sql`
      UPDATE notes
      SET
        updated_at = NOW()
        ${kind !== undefined ? sql`, kind = ${kind}` : sql``}
        ${content !== undefined ? sql`, content = ${content}` : sql``}
        ${privacy !== undefined ? sql`, privacy = ${privacy}` : sql``}
      WHERE id = ${id} AND author_id = ${authorId}
      RETURNING *
    `
  return (row as DbAnnotation) ?? null
}

export async function getBooqsWithOwnAnnotations(userId: string): Promise<string[]> {
  const result = await sql`
      SELECT DISTINCT booq_id
      FROM notes
      WHERE author_id = ${userId}
      ORDER BY booq_id
    `
  return result.map(row => row.booq_id as string)
}
