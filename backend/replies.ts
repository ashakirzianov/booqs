import { sql } from './db'

export type DbReply = {
  id: string,
  annotation_id: string,
  author_id: string,
  content: string,
  created_at: string,
  updated_at: string,
}

export type DbReplyWithAuthor = DbReply & {
  author_name: string,
  author_username: string,
  author_profile_picture_url: string | null,
  author_emoji: string,
}

export async function repliesForAnnotations(annotationIds: string[]): Promise<DbReplyWithAuthor[]> {
  if (annotationIds.length === 0) return []
  const rows = await sql`
    SELECT r.*, u.name AS author_name, u.username AS author_username, u.profile_picture_url AS author_profile_picture_url, u.emoji AS author_emoji
    FROM replies r
    JOIN users u ON u.id = r.author_id
    WHERE r.annotation_id = ANY(${annotationIds})
    ORDER BY r.created_at ASC
  `
  return rows as DbReplyWithAuthor[]
}

export async function hasReplyFromAuthor({ annotationId, authorId }: {
  annotationId: string,
  authorId: string,
}): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM replies
    WHERE annotation_id = ${annotationId} AND author_id = ${authorId}
    LIMIT 1
  `
  return rows.length > 0
}

export async function addReply({
  id,
  annotationId,
  authorId,
  content,
}: {
  id: string,
  annotationId: string,
  authorId: string,
  content: string,
}): Promise<DbReply> {
  const [row] = await sql`
    INSERT INTO replies (id, annotation_id, author_id, content)
    VALUES (${id}, ${annotationId}, ${authorId}, ${content})
    RETURNING *
  `
  return row as DbReply
}

export async function removeReply({ id, authorId }: {
  id: string,
  authorId: string,
}): Promise<boolean> {
  const rows = await sql`
    DELETE FROM replies
    WHERE id = ${id} AND author_id = ${authorId}
    RETURNING *
  `
  return rows.length > 0
}

export async function updateReply({ id, authorId, content }: {
  id: string,
  authorId: string,
  content: string,
}): Promise<DbReply | null> {
  const [row] = await sql`
    UPDATE replies
    SET content = ${content}, updated_at = NOW()
    WHERE id = ${id} AND author_id = ${authorId}
    RETURNING *
  `
  return (row as DbReply) ?? null
}
