import { Diagnoser, openEpub, FileProvider } from 'booqs-epub'
import JSZip from 'jszip'

// TODO: use export from 'booqs-epub' instead of this
export type EpubFile = NonNullable<Awaited<ReturnType<typeof openEpubFile>>>

export async function openEpubFile({ fileBuffer, diagnoser }: {
    fileBuffer: Buffer,
    diagnoser?: Diagnoser,
}) {
    const epub = openEpub(createZipFileProvider(fileBuffer), diagnoser)
    return epub
}

type NodeBuffer = globalThis.Buffer<ArrayBufferLike>
export function createZipFileProvider(fileContent: Buffer): FileProvider<NodeBuffer> {
    let _zip: Promise<JSZip> | undefined
    async function zip() {
        if (!_zip) {
            _zip = JSZip.loadAsync(fileContent)
        }
        return _zip
    }
    return {
        async readText(path, diags) {
            try {
                const file = (await zip()).file(path)
                if (!file) {
                    return undefined
                }
                return file.async('text')
            } catch (e) {
                diags?.push({
                    message: `Error reading text ${path}: ${e}`,
                })
                return undefined
            }
        },
        async readBinary(path, diags) {
            try {
                const file = (await zip()).file(path)
                if (!file) {
                    return undefined
                }
                return file.async('nodebuffer')
            } catch (e) {
                diags?.push({
                    message: `Error reading binary ${path}: ${e}`,
                })
                return undefined
            }
        },
    }
}
