import { createHash } from 'crypto'
import { ReadStream } from 'fs'
import { inspect } from 'util'
import type { InLibraryCard, Library } from './library'
import { parseEpubFile } from '@/parser'
import { Booq, BooqId, BooqMetadata } from '@/core'
import { nanoid } from 'nanoid'
import { deleteAsset, deleteAssetsWithPrefix, downloadAsset, generatePresignedUploadUrl, IMAGES_BUCKET, uploadAsset } from './blob'
import { storeDiagnostics } from './diagnostics'
import { sql } from './db'

export const userUploadsLibrary: Library = {
    cards, fileForId,
    // TODO: implement
    async query() { return { cards: [], hasMore: false } },
}

export const userUploadedEpubsBucket = 'uu-epubs'

export type DbUuCard = {
    id: string,
    asset_id: string,
    file_hash: string,
    created_at: `${string}T${string}`,
    meta: BooqMetadata,
}

export async function uploadsForUserId(userId: string): Promise<DbUuCard[]> {
    const result = await sql`
      SELECT uc.*
      FROM uu_assets uc
      JOIN uploads u ON uc.id = u.upload_id
      WHERE u.user_id = ${userId}
      ORDER BY u.uploaded_at DESC
    `
    return result as DbUuCard[]
}

async function cards(ids: string[]): Promise<InLibraryCard[]> {
    if (ids.length === 0) return []

    const result = await sql`
          SELECT * FROM uu_assets
          WHERE id = ANY(${ids})
        `

    const cards = result as DbUuCard[]
    const mapped = cards.map(convertToLibraryCard)
    return mapped
}

async function fileForId(id: string) {
    const [row] = await sql`
        SELECT asset_id FROM uu_assets
        WHERE id = ${id}
      `
    if (!row.asset_id) {
        return undefined
    } else {
        const asset = await downloadAsset(userUploadedEpubsBucket, row.asset_id)
        return Buffer.isBuffer(asset)
            ? { kind: 'epub', file: asset } as const
            : undefined
    }
}

export async function uploadEpubForUser(fileBuffer: Buffer, userId: string) {
    const { buffer, hash } = await buildFileFromBuffer(fileBuffer)
    const existing = await cardForHash(hash)
    if (existing) {
        await addToRegistry({
            uploadId: existing.id,
            userId,
        })
        return convertToLibraryCard(existing)
    }

    return uploadNewEpub({ buffer, hash }, userId)
}

async function uploadNewEpub({ buffer, hash }: File, userId: string) {
    const { value: booq, diags } = await parseEpubFile({
        fileBuffer: buffer,
    })
    diags.forEach(d => report(JSON.stringify(d)))
    if (!booq) {
        report('Can\'t parse upload')
        return undefined
    }
    const assetId = nanoid(10)
    const uploadResult = await uploadAsset(userUploadedEpubsBucket, assetId, buffer)
    if (!uploadResult.$metadata) {
        report('Can\'t upload file to blob storage')
        return undefined
    }
    const insertResult = await insertRecordAndRegister({ booq, assetId, fileHash: hash, userId })
    if (insertResult === null) {
        report('Can\'t insert record to DB')
        return undefined
    }
    const booqId: BooqId = `uu-${insertResult.id}`
    storeDiagnostics(booqId, diags)
        .catch(e => report(`Failed to store diags: ${e instanceof Error ? e.message : e}`))
    return convertToLibraryCard(insertResult)
}

export async function requestUpload() {
    const uploadId = nanoid(10)
    const key = `pending/${uploadId}`
    const uploadUrl = await generatePresignedUploadUrl(userUploadedEpubsBucket, key)
    return { uploadId, uploadUrl }
}

export type ConfirmUploadResult =
    | { success: true, booqId: BooqId, title?: string, coverSrc?: string, fileBuffer: Buffer }
    | { success: false, error: string }

export async function confirmUpload(uploadId: string, userId: string): Promise<ConfirmUploadResult> {
    const key = `pending/${uploadId}`
    const buffer = await downloadAsset(userUploadedEpubsBucket, key)
    if (!buffer) {
        return { success: false, error: 'Upload not found or expired' }
    }

    const result = await uploadEpubForUser(buffer, userId)
    if (!result) {
        return { success: false, error: 'Failed to parse EPUB file' }
    }

    const booqId: BooqId = `uu-${result.id}`
    return {
        success: true,
        booqId,
        title: result.meta.title,
        coverSrc: result.meta.coverSrc,
        fileBuffer: buffer,
    }
}

async function cardForHash(hash: string) {
    const [row] = await sql`
        SELECT * FROM uu_assets
        WHERE file_hash = ${hash}
      `
    if (!row) {
        return undefined
    } else {
        return row as DbUuCard
    }
}

async function insertRecordAndRegister({ booq, assetId, fileHash, userId }: {
    booq: Booq,
    assetId: string,
    fileHash: string,
    userId: string,
}): Promise<DbUuCard | null> {
    const id = nanoid(10)
    const meta = booq.metadata
    // Use ON CONFLICT (file_hash) so concurrent uploads of the same file
    // reuse the existing record instead of failing
    const [upserted] = await sql`
        INSERT INTO uu_assets (id, asset_id, file_hash, meta)
        VALUES (${id}, ${assetId}, ${fileHash}, ${meta})
        ON CONFLICT (file_hash) DO UPDATE SET meta = EXCLUDED.meta
        RETURNING *
    `
    if (!upserted) return null
    const record = upserted as DbUuCard
    await addToRegistry({ uploadId: record.id, userId })
    return record
}

async function addToRegistry({ uploadId, userId }: {
    uploadId: string,
    userId: string,
}) {
    await sql`INSERT INTO uploads (upload_id, user_id)
    VALUES (${uploadId}, ${userId})
    ON CONFLICT (user_id, upload_id) DO NOTHING`
    return true
}

type File = {
    buffer: Buffer,
    hash: string,
}
export async function buildFileFromBuffer(buffer: Buffer) {
    const hash = createHash('md5')
    hash.update(buffer)
    return {
        buffer,
        hash: hash.digest('base64'),
    }
}
export async function buildFileFromReadStream(fileStream: ReadStream) {
    return new Promise<File>((resolve, reject) => {
        try {
            const hash = createHash('md5')
            const chunks: any[] = []

            fileStream.on('data', chunk => {
                hash.update(chunk)
                chunks.push(chunk)
            })
            fileStream.on('end', () => {
                const buffer = Buffer.concat(chunks)
                resolve({
                    buffer,
                    hash: hash.digest('base64'),
                })
            })
        } catch (e) {
            reject(e)
        }
    })
}

function report(label: string, data?: any) {
    console.warn('UU: \x1b[32m%s\x1b[0m', label)
    if (data) {
        console.warn(inspect(data, false, 3, true))
    }
}

export async function deleteAllBooqsForUserId(userId: string) {
    await deleteAllUploadRecordsForUserId(userId)
    await deleteAllBooqsWithoutUsers()
    return true
}

async function deleteAllBooqsWithoutUsers() {
    const cards = await getAllBooqsWithoutUploadUsers()
    const results = await Promise.all(cards.map(card => deleteBooq({
        id: card.id,
        assetId: card.asset_id,
    })))
    return results.every(result => result)
}

async function deleteBooq({ id, assetId }: {
    id: string,
    assetId: string,
}) {
    const booqId = `uu-${id}`
    const blobPromise = deleteAsset(userUploadedEpubsBucket, assetId)
    const imagesPromise = Promise.all([
        deleteAssetsWithPrefix(IMAGES_BUCKET, `originals/${booqId}/`),
        deleteAssetsWithPrefix(IMAGES_BUCKET, `variants/${booqId}/`),
    ])
    const dbPromise = deleteCards([id])
    const [blobResult, , dbResult] = await Promise.all([blobPromise, imagesPromise, dbPromise])
    return blobResult && dbResult
}

async function deleteAllUploadRecordsForUserId(userId: string): Promise<boolean> {
    await sql`
      DELETE FROM uploads
      WHERE user_id = ${userId}
    `
    return true
}

async function deleteCards(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return false

    await sql`
      DELETE FROM uu_assets
      WHERE id = ANY(${ids})
    `
    return true
}

async function getAllBooqsWithoutUploadUsers(): Promise<DbUuCard[]> {
    const rows = await sql`
      SELECT * FROM uu_assets
      WHERE id NOT IN (
        SELECT upload_id FROM uploads
      )
    `
    return rows as DbUuCard[]
}

function convertToLibraryCard(doc: DbUuCard): InLibraryCard {
    return {
        id: doc.id,
        meta: doc.meta,
    }
}