import { Booq, BooqId, BooqPath, pathToString, positionForPath, previewForPath, textForRange } from '@/core'
import { redis } from './db'
import { logTime, logTimeAsync } from './utils'
import { parseEpubFile } from '@/parser'
import { fileForId } from './library'
import { inspect } from 'util'

export async function booqForId(booqId: BooqId, bypassCache = false): Promise<Booq | undefined> {
    if (bypassCache) {
        return parseBooqForId(booqId)
    }
    const cached = await redis.get<Booq>(`cache:booq:${booqId}`)
    if (cached) {
        return cached
    } else {
        const booq = await parseBooqForId(booqId)
        if (booq) {
            await redis.set(`cache:booq:${booqId}`, booq, {
                ex: 60 * 60 * 24,
            })
        }
        return booq
    }
}

export type BooqPreview = {
    booqId: BooqId,
    path: BooqPath,
    title?: string,
    text: string,
    length: number,
    position: number,
}
const PREVIEW_LENGTH = 500
export async function booqPreview(booqId: BooqId, path: BooqPath, end?: BooqPath): Promise<BooqPreview | undefined> {
    const key = `cache:booq:${booqId}:preview:${pathToString(path)}${end ? `:${pathToString(end)}` : ''}`
    const cached = await redis.get<BooqPreview>(key)
    if (cached) {
        return cached
    }
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }
    const full = logTime(
        `preview for path ${pathToString(path)}`,
        () => end
            ? textForRange(booq.nodes, { start: path, end })
            : previewForPath(booq.nodes, path, PREVIEW_LENGTH),
    )
    const text = full?.trim()?.substring(0, PREVIEW_LENGTH) ?? ''
    const position = logTime(
        `position for path ${pathToString(path)}`,
        () => positionForPath(booq.nodes, path),
    )
    const length = booq.meta.length
    const preview = {
        booqId,
        path,
        title: booq.meta.title,
        text,
        position,
        length,
    }
    await redis.set(key, preview, { ex: 60 * 60 * 24 })
    return preview
}

async function parseBooqForId(booqId: BooqId) {
    const file = await fileForId(booqId)
    if (!file) {
        return undefined
    }
    const { value: booq, diags } = await logTimeAsync('parse epub', () => parseEpubFile({
        fileBuffer: file.file,
    }))
    diags.forEach(diag => {
        console.info(inspect(diag, { depth: 5, colors: true }))
    })
    return booq
}