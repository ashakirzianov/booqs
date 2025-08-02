import { BooqId, BooqRange } from '@/core'
import { sql } from './db'

export type DbNotePrivacy = 'private' | 'public'

export type DbNote = {
  id: string,
  author_id: string,
  booq_id: string,
  start_path: number[],
  end_path: number[],
  kind: string,
  content: string | null,
  target_quote: string,
  privacy: DbNotePrivacy,
  created_at: string,
  updated_at: string,
}

export type DbNoteWithAuthor = DbNote & {
  author_id: string,
  author_name: string,
  author_username: string,
  author_profile_picture_url: string | null,
  author_emoji: string,
}

export async function noteForId(id: string): Promise<DbNote | null> {
  const [note] = await sql`
      SELECT * FROM notes
      WHERE id = ${id}
    `
  return note ? (note as DbNote) : null
}

export async function notesForBooqId(booqId: string, _userId?: string): Promise<DbNote[]> {
  // TODO: userId parameter will be used in the future to support privacy filtering
  const result = await sql`
      SELECT * FROM notes
      WHERE booq_id = ${booqId}
      ORDER BY created_at
    `
  return result as DbNote[]
}
export async function notesWithAuthorFor({ booqId, authorId, userId: _userId }: {
  booqId?: BooqId,
  authorId?: string,
  userId?: string,
}): Promise<DbNoteWithAuthor[]> {
  // TODO: userId parameter will be used in the future to support privacy filtering
  const notes = await sql`
      SELECT n.*, u.name AS author_name, u.username AS author_username, u.profile_picture_url AS author_profile_picture_url, u.emoji AS author_emoji
      FROM notes n
      JOIN users u ON u.id = n.author_id
      WHERE TRUE
      ${booqId !== undefined ? sql`AND booq_id = ${booqId}` : sql``}
      ${authorId !== undefined ? sql`AND n.author_id = ${authorId}` : sql``}
      ORDER BY n.created_at
      `

  return notes as DbNoteWithAuthor[]
}



export async function addNote({
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
  privacy?: DbNotePrivacy,
}): Promise<DbNote> {
  const [note] = await sql`
      INSERT INTO notes (
        id, author_id, booq_id, start_path, end_path, kind, content, target_quote, privacy
      )
      VALUES (
        ${id}, ${authorId}, ${booqId}, ${range.start}, ${range.end}, ${kind}, ${content ?? null}, ${targetQuote ?? null}, ${privacy}
      )
      RETURNING *
    `
  return note as DbNote
}

export async function removeNote({ id, authorId }: {
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

export async function updateNote({
  id, authorId, kind, content, privacy,
}: {
  id: string,
  authorId: string,
  kind?: string,
  content?: string | null,
  privacy?: DbNotePrivacy,
}): Promise<DbNote | null> {
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
  return (row as DbNote) ?? null
}