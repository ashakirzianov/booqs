import { BooqNode, BooqRange, BooqPath, BooqTextNode, BooqElement, BooqDocument, BooqStub, BooqChildNode } from './model'
import { DATA_PARAGRAPH } from './attributes'
import { nodeLength } from './position'

export function isTextNode(node: BooqNode | undefined): node is BooqTextNode {
    return typeof node === 'string'
}

export function isStubNode(node: BooqNode | undefined): node is BooqStub {
    return node === null || node?.stub !== undefined
}

export function isDocumentNode(node: BooqNode | undefined): node is BooqDocument {
    return node?.fileName !== undefined
}

export function isElementNode(node: BooqNode | undefined): node is BooqElement {
    return node?.name !== undefined
}

export function isContainerNode(node: BooqNode | undefined): node is BooqElement | BooqDocument {
    return node?.children !== undefined
}

export function isMarkedAsParagraph(node: BooqNode | undefined): boolean {
    return isElementNode(node) && node.attributes?.[DATA_PARAGRAPH] !== undefined
}

export function nodeChildren(node: BooqNode): BooqChildNode[] | undefined {
    return node?.children
}

export function visitNodes(nodes: BooqNode[], visitor: (node: BooqNode) => void): void {
    for (const node of nodes) {
        visitor(node)
        const children = nodeChildren(node)
        if (children) {
            visitNodes(children, visitor)
        }
    }
}

export function mapDocumentNodes(documents: BooqDocument[], transform: (node: BooqChildNode) => BooqChildNode): BooqDocument[] {
    return documents.map(doc => ({
        ...doc,
        children: mapChildNodes(doc.children, transform),
    }))
}

export function mapChildNodes(nodes: BooqChildNode[], transform: (node: BooqChildNode) => BooqChildNode): BooqChildNode[] {
    return nodes.map(node => {
        const mapped = transform(node)
        if (mapped?.children) {
            return {
                ...mapped,
                children: mapChildNodes(mapped.children, transform),
            }
        }
        return mapped
    })
}

export async function mapChildNodesAsync(nodes: BooqChildNode[], transform: (node: BooqChildNode) => Promise<BooqChildNode>): Promise<BooqChildNode[]> {
    return Promise.all(nodes.map(async node => {
        const mapped = await transform(node)
        if (mapped?.children) {
            return {
                ...mapped,
                children: await mapChildNodesAsync(mapped.children, transform),
            }
        }
        return mapped
    }))
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
        if (idx < actualStart) {
            result.push(stubNode(emptyStubs ? 0 : nodeLength(node)))
        } else if (idx === actualStart) {
            if (isContainerNode(node)) {
                result.push({
                    ...node,
                    // as BooqChildNode[]: children never contain BooqDocument nodes
                    children: nodesForRange(node.children, {
                        start: startTail,
                        end: actualEnd === idx && endTail.length > 0
                            ? endTail
                            : [node.children.length],
                    }) as BooqChildNode[],
                })
            } else {
                result.push(node)
            }
        } else if (idx < actualEnd) {
            result.push(node)
        } else if (idx === actualEnd && endTail.length) {
            if (isContainerNode(node)) {
                result.push({
                    ...node,
                    // as BooqChildNode[]: children never contain BooqDocument nodes
                    children: nodesForRange(node.children, {
                        start: [0],
                        end: endTail,
                    }) as BooqChildNode[],
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


export function stubNode(length: number): BooqStub {
    return length > 0
        ? { stub: length }
        : null
}

export function textNode(content: string): BooqTextNode {
    return content
}
