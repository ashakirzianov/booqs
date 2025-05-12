import { Diagnoser, openEpub } from 'booqs-epub'
import { createZipFileProvider } from './zip'

// TODO: use export from 'booqs-epub' instead of this
export type Epub = NonNullable<Awaited<ReturnType<typeof openEpubFile>>>

export async function openEpubFile({ fileBuffer, diags }: {
    fileBuffer: Buffer,
    diags?: Diagnoser,
}) {
    const epub = openEpub(createZipFileProvider(fileBuffer), diags)
    return epub
}