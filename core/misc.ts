import { BooqId, InLibraryId, LibraryId } from './model'

export function parseId(booqId: BooqId): [libraryId: LibraryId, id: InLibraryId] {
    return booqId.split(':') as [LibraryId, InLibraryId]
}

export function assertNever(x: never) {
    return x
}
