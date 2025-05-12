import { Diagnoser, Diagnostic, openEpub } from 'booqs-epub'
import { createZipFileProvider } from './zip'
import { z } from 'zod'
import { containerDocument, navDocument, ncxDocument, packageDocument } from './schema'
import { Epub } from './epub'

export async function validateEpubFile({ fileBuffer, diags }: {
    fileBuffer: Buffer,
    diags?: Diagnoser,
}): Promise<{
    diags: Diagnostic[],
}> {
    diags = diags ?? []
    const epub = openEpub(createZipFileProvider(fileBuffer), diags)
    if (!epub) {
        return { diags }
    }
    return validateEpub({ epub, diags })
}

export async function validateEpub({
    epub, diags,
}: { epub: Epub, diags?: Diagnoser }): Promise<{
    diags: Diagnostic[],
}> {
    diags = diags ?? []
    try {
        const docs = epub.documents()
        const map = {
            container: containerDocument,
            package: packageDocument,
            ncx: ncxDocument,
            nav: navDocument,
        } as const
        for (const [key, validator] of Object.entries(map)) {
            const { content } = await docs[key as keyof typeof map]() ?? {
                content: undefined,
            }
            diags.push(...validateEpubDocument(content, validator))
        }
        return { diags }
    } catch (err) {
        diags?.push({
            message: 'Unhandled exception on parsing',
            data: err as object,
        })
        return { diags }
    }
}

function validateEpubDocument<T>(doc: T | undefined, validator: z.ZodObject<any>): Diagnostic[] {
    if (!doc) {
        return []
    }
    const result = validator.safeParse(doc)
    if (result.success) {
        return []
    } else {
        const errors = result.error.errors.map(e => ({
            message: e.message,
            error: e,
        }))
        return errors
    }
}