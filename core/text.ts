import { BooqNode, BooqRange, BooqPath } from './model'
import {
    findPath, rootIterator, firstLeaf, iteratorsNode, nextLeaf, prevLeaf, BooqNodeIterator,
} from './iterator'
import { assertNever } from './misc'

export function nodeText(node: BooqNode): string {
    switch (node?.kind) {
        case 'element':
            return node.children?.map(nodeText).join('') ?? ''
        case 'text':
            return node.content
        case 'stub':
        case undefined:
            return ''
        default:
            assertNever(node)
            return ''
    }
}

export function nodesText(nodes: BooqNode[]): string {
    return nodes.map(nodeText).join('')
}

// length is the minimum length of the preview (provided that nodes have enough content). The previewForPath does not truncate resulting string to the length, instead the returned string includes all the text content from the last node appended to the preview.
export function previewForPath(nodes: BooqNode[], path: BooqPath, length: number) {
    let iter = findPath(rootIterator(nodes), path)
    if (!iter) {
        return undefined
    }
    iter = firstLeaf(iter)
    let preview = ''
    while (iter) {
        const node = iteratorsNode(iter)
        preview += node?.kind === 'text'
            ? node.content
            : ''
        if (preview.trim().length >= length) {
            return preview.trim()
        }
        iter = nextLeaf(iter)
    }
    return preview.trim()
}

export function contextForRange(nodes: BooqNode[], { start }: BooqRange, length: number) {
    // TODO: implement version that takes end into account
    return contextForPath(nodes, start, length)
}

export function contextForPath(nodes: BooqNode[], path: BooqPath, length: number) {
    const iter = findPath(rootIterator(nodes), path)
    if (!iter) {
        return undefined
    }
    let result = ''
    let forwardIter: BooqNodeIterator | undefined = firstLeaf(iter)
    let backwardIter: BooqNodeIterator | undefined = prevLeaf(iter)
    while (forwardIter || backwardIter) {
        if (forwardIter) {
            result += nodeText(iteratorsNode(forwardIter))
            if (result.length >= length) {
                return result.substring(0, length)
            }
            forwardIter = nextLeaf(forwardIter)
        }
        if (backwardIter) {
            result = nodeText(iteratorsNode(backwardIter)) + result
            if (result.length >= length) {
                return result.substring(result.length - length)
            }
            backwardIter = prevLeaf(backwardIter)
        }
    }
    return result
}

// length is the minimum length of the contextBefore and contextAfter (provided that nodes have enough content). The getQuoteAndContext does not truncate resulting strings to the length, instead it respects the node boundaries and returns all the text content from the last node appended to the context.
export function getQuoteAndContext(nodes: BooqNode[], range: BooqRange, length: number): { quote: string, contextBefore: string, contextAfter: string } {
    const quote = textForRange(nodes, range) ?? ''

    // Get context before the range
    const startIter = findPath(rootIterator(nodes), range.start)
    let contextBefore = ''
    if (startIter) {
        let backwardIter = prevLeaf(startIter)
        while (backwardIter && contextBefore.length < length) {
            const nodeContent = nodeText(iteratorsNode(backwardIter))
            contextBefore = nodeContent + contextBefore
            backwardIter = prevLeaf(backwardIter)
        }
    }

    // Get context after the range
    const endIter = findPath(rootIterator(nodes), range.end)
    let contextAfter = ''
    if (endIter) {
        let forwardIter = nextLeaf(endIter)
        while (forwardIter && contextAfter.length < length) {
            const nodeContent = nodeText(iteratorsNode(forwardIter))
            contextAfter += nodeContent
            forwardIter = nextLeaf(forwardIter)
        }
    }

    return { quote, contextBefore, contextAfter }
}

// Returns the text content for the given range in the nodes. The range is defined by start and end paths, which are arrays of numbers representing the path to the node in the BooqNode structure. The end path is exclusive, meaning the text content at the end path is not included in the result. If the end path points to a character within a string, that character is not included. If the range is invalid or does not correspond to any text content, it returns undefined.
export function textForRange(nodes: BooqNode[], { start, end }: BooqRange): string | undefined {
    const [startHead, ...startTail] = start
    const [endHead, ...endTail] = end
    if (startHead === undefined || endHead === undefined || startHead >= nodes.length || endHead < startHead) {
        return undefined
    }

    let result = ''
    const startNode = nodes[startHead]
    if (startNode?.kind === 'element') {
        const startText = textForRange(startNode.children ?? [], {
            start: startTail,
            end: startHead === endHead
                ? endTail
                : [startNode.children?.length ?? 1],
        })
        if (startText) {
            result += startText
        } else {
            return undefined
        }
    } else if (startNode?.kind === 'text') {
        if (startTail.length <= 1) {
            result += startNode.content.substring(
                startTail[0] ?? 0,
                startHead === endHead && endTail.length > 0
                    ? endTail[0]
                    : startNode.content.length,
            )
        } else {
            return undefined
        }
    } else {
        return undefined
    }
    for (let idx = startHead + 1; idx < endHead; idx++) {
        result += nodeText(nodes[idx])
    }
    const endNode = nodes[endHead]
    if (startHead !== endHead && endNode) {
        if (endNode.kind === 'element') {
            const endText = textForRange(endNode.children ?? [], {
                start: [0],
                end: endTail,
            })
            if (endText) {
                result += endText
            }
        } else if (endNode.kind === 'text') {
            if (endTail.length === 1) {
                result += endNode.content.substring(0, endTail[0])
            }
        }
    }

    return result
}
