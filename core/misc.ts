import { BooqId, InLibraryId, LibraryId } from './model'

export function parseId(booqId: BooqId): [libraryId: LibraryId, id: InLibraryId] {
    const parts = booqId.split('-')
    return parts as [LibraryId, InLibraryId]
}

export function parseIdOpt(booqId: string): [libraryId: LibraryId, id: InLibraryId] | null {
    const parts = booqId.split('-')
    if (parts.length !== 2) {
        return null
    }
    return parts as [LibraryId, InLibraryId]
}

export function assertNever(x: never) {
    return x
}
