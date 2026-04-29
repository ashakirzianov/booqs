import {
    Booq, BooqPath, pathLessThan,
} from '@/core'
import { BooqFragment, buildFragment } from './fragment'

export type BooqAnchor = {
    path: BooqPath,
    title: string | undefined,
    position: number,
}

export type BooqChapter = {
    previous?: BooqAnchor,
    current: BooqAnchor,
    next?: BooqAnchor,
    fragment: BooqFragment,
}

export function buildChapter({ booq, path }: {
    booq: Booq,
    path?: BooqPath,
}): BooqChapter {
    return path
        ? chapterForPath(booq, path)
        : fullBooqChapter(booq)
}

function fullBooqChapter(booq: Booq): BooqChapter {
    return {
        previous: undefined,
        next: undefined,
        current: {
            path: [0],
            title: undefined,
            position: 0,
        },
        fragment: buildFragment(booq.content, booq.styles, {
            start: [0],
            end: [booq.content.length],
        }),
    }
}

function chapterForPath(booq: Booq, path: BooqPath): BooqChapter {
    let previous: BooqAnchor | undefined
    let next: BooqAnchor | undefined
    let current: BooqAnchor = {
        path: [0],
        title: booq.toc.title,
        position: 0,
    }

    for (const anchor of generateAnchors(booq, CHAPTER_LENGTH)) {
        if (!pathLessThan(path, anchor.path)) {
            previous = current
            current = anchor
        } else {
            next = anchor
            break
        }
    }

    const end = next?.path ?? [booq.content.length]

    return {
        previous, current, next,
        fragment: buildFragment(booq.content, booq.styles, {
            start: current.path,
            end,
        }),
    }
}

// Minimum character count between chapter anchors (based on text node lengths)
const CHAPTER_LENGTH = 4500
function* generateAnchors(booq: Booq, length: number) {
    let position = 0
    for (const item of booq.toc.items) {
        if (item.position - position > length) {
            yield {
                position: item.position,
                title: item.title,
                path: item.path,
            }
            position = item.position
        }
    }
}
