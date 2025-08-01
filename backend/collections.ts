import { BooqId } from '@/core'
import { sql } from './db'

export type DbCollection = {
    id: string,
    user_id: string,
    name: string,
    created_at: string,
    updated_at: string,
}

export async function booqIdsInCollections(userId: string, ...names: string[]): Promise<BooqId[]> {
    const result = await sql`
      SELECT ucb.booq_id
      FROM user_collections_booqs ucb
      JOIN collections c ON ucb.collection_id = c.id
      WHERE c.user_id = ${userId}
        AND c.name = ANY(${names})
    `
    return result.map(r => r.booq_id)
}

export async function addToCollection({
    userId,
    booqId,
    name,
}: {
    userId: string,
    booqId: BooqId,
    name: string,
}): Promise<boolean> {
    const [collection] = await sql`
      INSERT INTO collections (user_id, name)
      VALUES (${userId}, ${name})
      ON CONFLICT (user_id, name) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `
    if (!collection) return false

    const result = await sql`
    INSERT INTO user_collections_booqs (collection_id, booq_id)
    VALUES (${collection.id}, ${booqId})
    ON CONFLICT DO NOTHING
    RETURNING booq_id
    `
    return result.length > 0
}

export async function removeFromCollection({
    userId,
    booqId,
    name,
}: {
    userId: string,
    booqId: BooqId,
    name: string,
}): Promise<boolean> {
    const [collection] = await sql`
      SELECT id FROM collections
      WHERE user_id = ${userId} AND name = ${name}
    `
    if (!collection) return false

    const result = await sql`
    DELETE FROM user_collections_booqs
    WHERE collection_id = ${collection.id} AND booq_id = ${booqId}
    RETURNING booq_id
    `
    return result.length > 0
}

export async function addUpload(userId: string, uploadId: BooqId) {
    return addToCollection({
        userId,
        name: 'uploads',
        booqId: uploadId,
    })
}