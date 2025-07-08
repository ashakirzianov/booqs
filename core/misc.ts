import { BooqId, InLibraryId, LibraryId } from './model'

export function makeId(libraryId: LibraryId, inLibraryId: InLibraryId): BooqId {
    return `${libraryId}/${inLibraryId}`
}

export function parseId(id: string): string[] {
    return id.split('/')
}

export function assertNever(x: never) {
    return x
}
