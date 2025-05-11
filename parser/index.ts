import { Diagnoser, Diagnostic } from 'booqs-epub'
import { Booq, BooqMeta } from '../core'
import { processEpub } from './book'
import { openEpubPackage } from './epub'
import { buildMeta } from './metadata'

export async function parseEpub({ fileData }: {
    fileData: Buffer,
    title?: string,
}): Promise<{
    value: Booq | undefined,
    diags: Diagnostic[],
}> {
    const diags: Diagnoser = []
    try {
        const file = await openEpubPackage({ fileData, diagnoser: diags })
        if (!file) {
            return { value: undefined, diags: diags }
        }
        const book = await processEpub(file, diags)
        return { value: book, diags: diags }
    } catch (err) {
        diags?.push({
            message: 'Unhandled exception on parsing',
            data: err as object,
        })
        return { value: undefined, diags: diags }
    }
}

export type ExtractedMetadata = {
    metadata: BooqMeta,
    cover?: string,
}
export async function extractMetadata({ fileData, extractCover }: {
    fileData: Buffer,
    extractCover?: boolean,
}): Promise<{
    value: ExtractedMetadata | undefined,
    diags: Diagnostic[],
}> {
    const diags: Diagnoser = []
    const epub = await openEpubPackage({ fileData, diagnoser: diags })
    if (!epub) {
        return { value: undefined, diags: diags }
    }
    const metadata = buildMeta(epub, diags)
    if (extractCover) {
        const coverHref = metadata.coverSrc
        if (typeof coverHref === 'string') {
            const coverBuffer = await epub.bufferResolver(coverHref)
            if (!coverBuffer) {
                diags.push({
                    message: `couldn't load cover image: ${coverHref}`,
                })
                return { value: { metadata }, diags: diags }
            } else {
                const cover = Buffer.from(coverBuffer).toString('base64')
                return { value: { cover, metadata }, diags: diags }
            }
        } else {
            return { value: { metadata }, diags: diags }
        }
    } else {
        return { value: { metadata }, diags: diags }
    }
}
