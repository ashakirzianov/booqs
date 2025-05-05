import { BooqRange } from '@/core'
import { sql } from './db'

export type DbNote = {
  id: string,
  author_id: string,
  booq_id: string,
  start_path: number[],
  end_path: number[],
  color: string,
  content: string | null,
  created_at: string,
  updated_at: string,
}

export type DbNoteWithAuthor = DbNote & {
  author_id: string,
  author_name: string | null,
  author_profile_picture_url: string | null,
}

export async function noteForId(id: string): Promise<DbNote | null> {
  const [note] = await sql`
      SELECT * FROM notes
      WHERE id = ${id}
    `
  return note ? (note as DbNote) : null
}

export async function notesFor({
  booqId,
  authorId,
  offset,
  limit,
}: {
  booqId?: string,
  authorId?: string,
  offset?: number,
  limit?: number,
}): Promise<DbNote[]> {
  const result = await sql`
      SELECT * FROM notes
      WHERE TRUE
      ${booqId !== undefined ? sql`AND booq_id = ${booqId}` : sql``}
      ${authorId !== undefined ? sql`AND author_id = ${authorId}` : sql``}
      ORDER BY created_at
      ${offset !== undefined ? sql`OFFSET ${offset}` : sql``}
      ${limit !== undefined ? sql`LIMIT ${limit}` : sql``}
    `
  return result as DbNote[]
}

export async function notesWithAuthorForBooqId(booqId: string) {
  const notes = await sql`
      SELECT n.*, u.name AS author_name, u.profile_picture_url AS author_profile_picture_url
      FROM n notes
      WHERE booq_id = ${booqId}
      JOIN users u ON u.id = n.author_id
      `

  return notes as DbNoteWithAuthor[]
}

export async function addNote({
  id,
  authorId,
  booqId,
  range,
  color,
  content,
}: {
  id: string,
  authorId: string,
  booqId: string,
  range: BooqRange,
  color: string,
  content?: string,
}): Promise<DbNote> {
  const [note] = await sql`
      INSERT INTO notes (
        id, author_id, booq_id, start_path, end_path, color, content
      )
      VALUES (
        ${id}, ${authorId}, ${booqId}, ${range.start}, ${range.end}, ${color}, ${content ?? null}
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
    `
  return rows.length > 0
}

export async function updateNote({
  id, authorId, color, content,
}: {
  id: string,
  authorId: string,
  color?: string,
  content?: string,
}): Promise<DbNote | null> {
  if (color === undefined && content === undefined) return null

  const [row] = await sql`
      UPDATE notes
      SET
        updated_at = NOW()
        ${color !== undefined ? sql`, color = ${color}` : sql``}
        ${content !== undefined ? sql`, content = ${content}` : sql``}
      WHERE id = ${id} AND author_id = ${authorId}
      RETURNING *
    `
  return (row as DbNote) ?? null
}