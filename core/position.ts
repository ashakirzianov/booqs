import { BooqNode, BooqPath } from './model'
import { assertNever } from './misc'
import { isElementNode, isTextNode, isStubNode } from './node'

export function nodeLength(node: BooqNode): number {
    if (isElementNode(node)) {
        return nodesLength(node.children ?? [])
    } else if (isTextNode(node)) {
        return node.length
    } else if (isStubNode(node)) {
        return node?.length ?? 0
    } else {
        assertNever(node)
        return 0
    }
}

export function nodesLength(nodes: BooqNode[]) {
    return nodes.reduce((len, n) => len + nodeLength(n), 0)
}

export function positionForPath(nodes: BooqNode[], path: BooqPath): number {
    const [head, ...tail] = path
    if (head === undefined) {
        return 0
    }
    let position = 0
    for (let idx = 0; idx < Math.min(nodes.length, head); idx++) {
        position += nodeLength(nodes[idx])
    }
    const last = nodes[head]
    if (last?.kind === 'element' && last?.children) {
        const after = positionForPath(last.children, tail)
        return after + position
    } else {
        return position
    }
}