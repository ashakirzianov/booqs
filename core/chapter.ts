import {
    BooqNode, BooqStyles, Booq, BooqPath, nodesForRange, pathLessThan, isSectionNode, visitNodes,
} from '@/core'

export type BooqAnchor = {
    path: BooqPath,
    title: string | undefined,
    position: number,
}

export type BooqFragment = {
    start: BooqPath,
    end: BooqPath,
    nodes: BooqNode[],
    styles: BooqStyles,
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

export function collectReferencedStyles(nodes: BooqNode[], allStyles: BooqStyles): BooqStyles {
    const refs = new Set<string>()
    visitNodes(nodes, node => {
        if (isSectionNode(node) && node.styleRefs) {
            for (const ref of node.styleRefs) {
                refs.add(ref)
            }
        }
    })
    const styles: BooqStyles = {}
    for (const ref of refs) {
        if (allStyles[ref] !== undefined) {
            styles[ref] = allStyles[ref]
        }
    }
    return styles
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
        fragment: {
            start: [0],
            end: [booq.nodes.length],
            nodes: booq.nodes,
            styles: booq.styles,
        },
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

    for (const anchor of generateAnchors(booq, chapterLength)) {
        if (!pathLessThan(path, anchor.path)) {
            previous = current
            current = anchor
        } else {
            next = anchor
            break
        }
    }

    const end = next?.path ?? [booq.nodes.length]
    const nodes = nodesForRange(booq.nodes, {
        start: current.path,
        end,
    })
    const styles = collectReferencedStyles(nodes, booq.styles)

    return {
        previous, current, next,
        fragment: {
            start: current.path,
            end,
            nodes,
            styles,
        },
    }
}

const chapterLength = 4500
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
