import { BooqNode, BooqPath } from './model'
import { assertNever } from './misc'
import { isElementNode, isSectionNode, isTextNode, isStubNode, nodeChildren } from './node'

export function nodeLength(node: BooqNode): number {
    if (isSectionNode(node) || isElementNode(node)) {
        return nodesLength(node.children ?? [])
    } else if (isTextNode(node)) {
        return node.length
    } else if (isStubNode(node)) {
        return node?.stub ?? 0
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
    const children = nodeChildren(last)
    if (children) {
        const after = positionForPath(children, tail)
        return after + position
    } else {
        return position
    }
}