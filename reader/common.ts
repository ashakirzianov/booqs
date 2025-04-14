import { BooqNode, BooqPath } from '@/core'

export type ReaderBooq = {
    id: string,
    title?: string,
    author?: string,
    language?: string,
    length: number,
    toc: ReaderTocItem[],
    fragment: {
        nodes: BooqNode[],
        previous?: ReaderAnchor,
        current: ReaderAnchor,
        next?: ReaderAnchor,
    }
}
export type ReaderAnchor = {
    title?: string,
    path: BooqPath,
}

export type ReaderUser = {
    id: string,
    name?: string,
    pictureUrl?: string,
}
export type ReaderHighlight = {
    id: string,
    start: BooqPath,
    end: BooqPath,
    group: string,
    text: string,
    position: number | undefined,
    author: ReaderUser
}
export type ReaderTocItem = {
    title: string | undefined,
    position: number,
    level: number,
    path: BooqPath,
}

export type NavigationSelection = Record<string, boolean>
