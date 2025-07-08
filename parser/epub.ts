import { Diagnoser, openEpub, EpubLoader, LoadedEpub } from 'booqs-epub'
import { createZipFileProvider, BinaryType } from './zip'

export type Epub = AsyncEpub
export type AsyncEpub = EpubLoader<BinaryType>
export type SyncEpub = LoadedEpub<BinaryType>

export async function openEpubFile({ fileBuffer, diags }: {
    fileBuffer: Buffer,
    diags?: Diagnoser,
}) {
    const epub = openEpub(createZipFileProvider(fileBuffer), diags)
    return epub
}