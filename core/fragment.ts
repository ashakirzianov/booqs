import {
    BooqNode, BooqStyles, Booq, BooqPath, nodesForRange, pathLessThan, isSectionNode,
} from '@/core'

export type BooqFragment = {
    previous?: BooqAnchor,
    current: BooqAnchor,
    next?: BooqAnchor,
    position: number,
    nodes: BooqNode[],
    styles: BooqStyles,
}
export type BooqAnchor = {
    path: BooqPath,
    title: string | undefined,
    position: number,
}

export function buildFragment({ booq, path }: {
    booq: Booq,
    path?: BooqPath,
}): BooqFragment {

    return path
        ? fragmentForPath(booq, path)
        : fullBooqFragment(booq)
}

function fullBooqFragment(booq: Booq): BooqFragment {
    return {
        previous: undefined,
        next: undefined,
        current: {
            path: [0],
            title: undefined,
            position: 0,
        },
        position: 0,
        nodes: booq.nodes,
        styles: booq.styles,
    }
}

function fragmentForPath(booq: Booq, path: BooqPath): BooqFragment {
    let previous: BooqAnchor | undefined
    let next: BooqAnchor | undefined
    let current: BooqAnchor = {
        path: [0],
        title: booq.toc.title,
        position: 0,
    }

    for (const anchor of generateAnchors(booq, fragmentLength)) {
        if (!pathLessThan(path, anchor.path)) {
            previous = current
            current = anchor
        } else {
            next = anchor
            break
        }
    }
    const nodes = nodesForRange(booq.nodes, {
        start: current.path,
        end: next?.path ?? [booq.nodes.length],
    })

    const styles = collectReferencedStyles(nodes, booq.styles)

    return {
        previous, current, next,
        position: current.position,
        nodes,
        styles,
    }
}

export function collectReferencedStyles(nodes: BooqNode[], allStyles: BooqStyles): BooqStyles {
    const refs = new Set<string>()
    function walk(nodes: BooqNode[]) {
        for (const node of nodes) {
            if (isSectionNode(node)) {
                if (node.styleRefs) {
                    for (const ref of node.styleRefs) {
                        refs.add(ref)
                    }
                }
                if (node.children) {
                    walk(node.children)
                }
            }
        }
    }
    walk(nodes)
    const styles: BooqStyles = {}
    for (const ref of refs) {
        if (allStyles[ref] !== undefined) {
            styles[ref] = allStyles[ref]
        }
    }
    return styles
}

const fragmentLength = 4500
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
