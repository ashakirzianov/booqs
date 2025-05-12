import { Diagnoser, Diagnostic } from 'booqs-epub'
import { Booq } from '../core'
import { processEpub } from './book'
import { Epub, openEpubFile } from './epub'

export async function parseEpubFile({ fileBuffer, diags }: {
    fileBuffer: Buffer,
    diags?: Diagnoser,
}): Promise<{
    value: Booq | undefined,
    diags: Diagnostic[],
}> {
    diags = diags ?? []
    const epub = await openEpubFile({ fileBuffer, diags })
    if (!epub) {
        return { value: undefined, diags: diags }
    }
    return parseEpub({ epub, diags })
}

export async function parseEpub({ epub, diags }: {
    epub: Epub,
    diags?: Diagnoser,
}): Promise<{
    value: Booq | undefined,
    diags: Diagnostic[],
}> {
    diags = diags ?? []
    try {
        const book = await processEpub(epub, diags)
        return { value: book, diags: diags }
    } catch (err) {
        diags?.push({
            message: 'Unhandled exception on parsing',
            data: err as object,
        })
        return { value: undefined, diags: diags }
    }
}
