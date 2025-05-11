import { Diagnoser, openEpub } from 'booqs-epub'
import { createZipFileProvider } from './zip'

// TODO: use export from 'booqs-epub' instead of this
export type EpubFile = NonNullable<Awaited<ReturnType<typeof openEpubFile>>>

export async function openEpubFile({ fileBuffer, diagnoser }: {
    fileBuffer: Buffer,
    diagnoser?: Diagnoser,
}) {
    const epub = openEpub(createZipFileProvider(fileBuffer), diagnoser)
    return epub
}