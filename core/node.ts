import { BooqNode, BooqRange, BooqPath, BooqTextNode, BooqElementNode, BooqSectionNode, BooqStubNode } from './model'
import { nodeLength } from './position'

export function isTextNode(node: BooqNode | undefined): node is BooqTextNode {
    return typeof node === 'string'
}

export function isStubNode(node: BooqNode | undefined): node is BooqStubNode {
    return node === null || node?.stub !== undefined
}

export function isSectionNode(node: BooqNode | undefined): node is BooqSectionNode {
    return node?.section !== undefined
}

export function isElementNode(node: BooqNode | undefined): node is BooqElementNode {
    return node?.name !== undefined
}

export function isContainerNode(node: BooqNode | undefined): node is BooqElementNode | BooqSectionNode {
    return node?.children !== undefined
}

export function nodeChildren(node: BooqNode): BooqNode[] | undefined {
    return node?.children
}

export function nodeForPath(nodes: BooqNode[], path: BooqPath): BooqNode | undefined {
    const [head, ...tail] = path
    if (head === undefined || head >= nodes.length || head < 0) {
        return undefined
    }
    const node = nodes[head]
    if (tail.length === 0) {
        return node
    }
    const children = nodeChildren(node)
    return children ? nodeForPath(children, tail) : undefined
}

export function nodesForRange(nodes: BooqNode[], range: BooqRange, emptyStubs?: boolean): BooqNode[] {
    const [startHead, ...startTail] = range.start
    const [endHead, ...endTail] = range.end ?? []
    const actualStart = startHead ?? 0
    const actualEnd = endHead ?? nodes.length
    const result: BooqNode[] = []
    for (let idx = 0; idx < nodes.length; idx++) {
        const node = nodes[idx]
        const children = nodeChildren(node)
        if (idx < actualStart) {
            result.push(stubNode(emptyStubs ? 0 : nodeLength(node)))
        } else if (idx === actualStart) {
            if (children) {
                result.push({
                    ...node as (BooqElementNode | BooqSectionNode),
                    children: nodesForRange(children, {
                        start: startTail,
                        end: actualEnd === idx && endTail.length > 0
                            ? endTail
                            : [children.length],
                    }),
                })
            } else {
                result.push(node)
            }
        } else if (idx < actualEnd) {
            result.push(node)
        } else if (idx === actualEnd && endTail.length) {
            if (children) {
                result.push({
                    ...node as (BooqElementNode | BooqSectionNode),
                    children: nodesForRange(children, {
                        start: [0],
                        end: endTail,
                    }),
                })
            } else {
                result.push(node)
            }
        } else {
            result.push(stubNode(nodeLength(node)))
        }
    }
    return result
}

export function findPathForId(nodes: BooqNode[], targetId: string): BooqPath | undefined {
    for (let idx = 0; idx < nodes.length; idx++) {
        const node = nodes[idx]
        if (isElementNode(node) && node.id === targetId) {
            return [idx]
        }
        const children = nodeChildren(node)
        if (children) {
            const path = findPathForId(children, targetId)
            if (path) {
                return [idx, ...path]
            }
        }
    }
    return undefined
}

export function stubNode(length: number): BooqNode {
    return length > 0
        ? { stub: length }
        : null
}

export function textNode(content: string): BooqTextNode {
    return content
}