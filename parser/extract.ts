import { Diagnoser, Diagnostic } from 'booqs-epub'
import { BooqMeta } from '../core'
import { Epub, openEpubFile } from './epub'
import { extactBooqMeta } from './metadata'

export type ExtractedMetadata = {
    metadata: BooqMeta,
    cover?: string,
}
export async function extractEpubMetadataFromFile({ fileBuffer, extractCover, diags }: {
    fileBuffer: Buffer,
    extractCover?: boolean,
    diags?: Diagnoser,
}): Promise<{
    value: ExtractedMetadata | undefined,
    diags: Diagnostic[],
}> {
    diags = diags ?? []
    const epub = await openEpubFile({ fileBuffer, diags })
    if (!epub) {
        return { value: undefined, diags: diags }
    }
    return extractMetadataFromEpub({ epub, extractCover, diags })
}

export async function extractMetadataFromEpub({ epub, extractCover, diags }: {
    epub: Epub,
    extractCover?: boolean,
    diags?: Diagnoser,
}): Promise<{
    value: ExtractedMetadata | undefined,
    diags: Diagnostic[],
}> {
    diags = diags ?? []
    const metadata = await extactBooqMeta(epub, diags)
    if (extractCover) {
        const coverHref = metadata.coverSrc
        if (typeof coverHref === 'string') {
            const coverBuffer = await epub.loadBinaryFile(coverHref)
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
