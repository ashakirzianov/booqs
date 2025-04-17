import { neon } from '@neondatabase/serverless'

type MongoDoc = {
    id: string,
    assetId: string
    index: string
    length: number
    title?: string
    author?: string
    language?: string
    description?: string
    subjects?: string[]
    cover?: string
    rights?: string
    contributors?: string[]
    meta?: object
}

const BATCH_SIZE = 1000

export async function migrateCards(docs: MongoDoc[]) {
    // 1. Get existing Postgres ids
    const sql = neon(process.env.DATABASE_URL!)
    const existing = await sql`SELECT id FROM pg_cards`
    const existingIds = new Set(existing.map(r => r.id))
    console.log(`🟡 Found ${existingIds.size} existing ids`)

    // 2. Filter out existing
    const newDocs = docs.filter(doc => !existingIds.has(doc.index))
    console.log(`✅ ${newDocs.length} new documents to insert`)

    // 3. Batch insert
    let totalInserted = 0

    for (let i = 0; i < newDocs.length; i += BATCH_SIZE) {
        const batch = newDocs.slice(i, i + BATCH_SIZE)

        const inserts = batch.map(doc => {
            const {
                index: id,
                assetId: asset_id,
                title = '',
                author,
                language,
                length,
                meta = {},
            } = doc

            return sql`
        INSERT INTO pg_cards (
          id, asset_id, title, author, language, length, metadata
        )
        VALUES (
          ${id}, ${asset_id}, ${title}, ${author}, ${language}, ${length}, ${JSON.stringify(meta)}
        )
      `
        })

        try {
            await Promise.all(inserts)
            totalInserted += batch.length
            console.log(`📤 Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} docs)`)
        } catch (err) {
            console.error(`❌ Failed to insert batch starting at index ${i}`, err)
        }
    }

    console.log(`🎉 Migration complete: inserted ${totalInserted} documents`)
}