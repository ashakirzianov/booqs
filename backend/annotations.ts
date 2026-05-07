import { BooqId, BooqRange } from '@/core'
import { sql } from './db'

export type DbAnnotationPrivacy = 'private' | 'public'

export type DbAnnotation = {
  id: string,
  user_id: string,
  booq_id: string,
  start_path: number[],
  end_path: number[],
  prefix: string,
  text: string,
  suffix: string,
  kind: string,
  color: string | null,
  content: string | null,
  privacy: DbAnnotationPrivacy,
  created_at: string,
  updated_at: string,
}

export type DbAnnotationWithAuthor = DbAnnotation & {
  author_name: string,
  author_username: string,
  author_profile_picture_url: string | null,
  author_emoji: string,
}

export async function annotationForId(id: string): Promise<DbAnnotation | null> {
  const [row] = await sql`
      SELECT * FROM annotations
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
      SELECT a.*, u.name AS author_name, u.username AS author_username, u.profile_picture_url AS author_profile_picture_url, u.emoji AS author_emoji
      FROM annotations a
      JOIN users u ON u.id = a.user_id
      WHERE TRUE
      ${booqId !== undefined ? sql`AND booq_id = ${booqId}` : sql``}
      ${authorId !== undefined ? sql`AND a.user_id = ${authorId}` : sql``}
      AND (a.privacy = 'public'${userId !== undefined ? sql` OR a.user_id = ${userId}` : sql``})
      ORDER BY a.created_at DESC
      ${limit !== undefined ? sql`LIMIT ${limit}` : sql``}
      ${offset !== undefined ? sql`OFFSET ${offset}` : sql``}
      `

  return rows as DbAnnotationWithAuthor[]
}

export async function addAnnotation({
  id,
  userId,
  booqId,
  range,
  prefix,
  text,
  suffix,
  kind,
  color,
  content,
  privacy = 'private',
}: {
  id: string,
  userId: string,
  booqId: BooqId,
  range: BooqRange,
  prefix: string,
  text: string,
  suffix: string,
  kind: string,
  color?: string,
  content?: string,
  privacy?: DbAnnotationPrivacy,
}): Promise<DbAnnotation> {
  const [row] = await sql`
      INSERT INTO annotations (
        id, user_id, booq_id, start_path, end_path, prefix, text, suffix, kind, color, content, privacy
      )
      VALUES (
        ${id}, ${userId}, ${booqId}, ${range.start}, ${range.end}, ${prefix}, ${text}, ${suffix}, ${kind}, ${color ?? null}, ${content ?? null}, ${privacy}
      )
      RETURNING *
    `
  return row as DbAnnotation
}

export async function removeAnnotation({ id, userId }: {
  id: string,
  userId: string,
}): Promise<boolean> {
  const rows = await sql`
      DELETE FROM annotations
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `
  return rows.length > 0
}

export async function updateAnnotation({
  id, userId, kind, color, content, privacy,
}: {
  id: string,
  userId: string,
  kind?: string,
  color?: string | null,
  content?: string | null,
  privacy?: DbAnnotationPrivacy,
}): Promise<DbAnnotation | null> {
  if (kind === undefined && color === undefined && content === undefined && privacy === undefined) return null

  const [row] = await sql`
      UPDATE annotations
      SET
        updated_at = NOW()
        ${kind !== undefined ? sql`, kind = ${kind}` : sql``}
        ${color !== undefined ? sql`, color = ${color}` : sql``}
        ${content !== undefined ? sql`, content = ${content}` : sql``}
        ${privacy !== undefined ? sql`, privacy = ${privacy}` : sql``}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `
  return (row as DbAnnotation) ?? null
}

export async function getBooqsWithOwnAnnotations(userId: string): Promise<string[]> {
  const result = await sql`
      SELECT DISTINCT booq_id
      FROM annotations
      WHERE user_id = ${userId}
      ORDER BY booq_id
    `
  return result.map(row => row.booq_id as string)
}
