import { FileProvider } from 'booqs-epub'
import { unzipSync, strFromU8 } from 'fflate'

export type BinaryType = globalThis.Buffer

export function createZipFileProvider(fileContent: Buffer): FileProvider<BinaryType> {
    const files = unzipSync(new Uint8Array(fileContent))

    return {
        async readText(path, diags) {
            try {
                const data = files[path]
                if (!data) return undefined
                return strFromU8(data)
            } catch (e) {
                diags?.push({
                    message: `Error reading text ${path}: ${e}`,
                })
                return undefined
            }
        },
        async readBinary(path, diags) {
            try {
                const data = files[path]
                if (!data) return undefined
                return Buffer.from(data)
            } catch (e) {
                diags?.push({
                    message: `Error reading binary ${path}: ${e}`,
                })
                return undefined
            }
        },
    }
}