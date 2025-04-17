import { MongoClient } from 'mongodb'
import { neon } from '@neondatabase/serverless'

type MongoDoc = {
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

const BATCH_SIZE = 500

export async function migrateCards() {
    const mongoClient = new MongoClient(process.env.MONGODB_URI!)
    await mongoClient.connect()

    const db = mongoClient.db('production')
    const collection = db.collection<MongoDoc>('pg-cards')

    // 1. Get existing Postgres ids
    const sql = neon(process.env.DATABASE_URL!)
    const existing = await sql`SELECT id FROM pg_cards`
    const existingIds = new Set(existing.map(r => r.id))
    console.log(`🟡 Found ${existingIds.size} existing ids`)

    // 2. Get Mongo documents
    const docs = await collection.find({}).toArray()
    console.log(`📦 Found ${docs.length} MongoDB documents`)

    // 3. Filter out existing ids
    const newDocs = docs.filter(doc => !existingIds.has(doc.index))
    console.log(`✅ ${newDocs.length} new documents to insert`)

    let totalInserted = 0

    // 4. Batch insert
    for (let i = 0; i < newDocs.length; i += BATCH_SIZE) {
        const batch = newDocs.slice(i, i + BATCH_SIZE)

        const inserts = batch.map(doc => {
            const {
                index: id,
                assetId: asset_id,
                title = '',
                author,
                contributors = [],
                language,
                length,
                description,
                subjects,
                cover,
                meta = {},
            } = doc

            const authors = [author, ...contributors].filter(Boolean)

            return sql`
        INSERT INTO pg_cards (
          id, asset_id, length, title, authors, language, description, subjects, cover, metadata
        )
        VALUES (
          ${id}, ${asset_id}, ${length}, ${title}, ${authors}, ${language}, ${description},
          ${subjects}, ${cover}, ${JSON.stringify(meta)}
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

    await mongoClient.close()
    console.log(`🎉 Migration complete: inserted ${totalInserted} documents`)
}