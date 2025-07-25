import { BooqNode, BooqRange, BooqPath } from './model'
import {
    iteratorAtPath,
    firstLeafNode,
    nextLeafNode,
    prevLeafNode,
    textBefore,
    textStartingAt,
    BooqNodeIterator,
    isNodeIterator,
    isTextIterator,
    iteratorsNode,
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
    const found = iteratorAtPath(nodes, path)
    if (!found) {
        return undefined
    }
    let iter: BooqNodeIterator | undefined = isNodeIterator(found)
        ? firstLeafNode(found)
        : found.parent
    let preview = ''
    while (iter) {
        const node = iteratorsNode(iter) ?? null
        const text = nodeText(node)
        preview += text
        if (preview.length >= length) {
            const trimmed = preview.trim()
            if (trimmed.length >= length) {
                return trimmed
            }
        }
        iter = nextLeafNode(iter)
    }
    return preview.trim()
}

// length is the minimum length of the contextBefore and contextAfter (provided that nodes have enough content). The getQuoteAndContext does not truncate resulting strings to the length, instead it respects the node boundaries and returns all the text content from the last node appended to the context.
export function getQuoteAndContext(nodes: BooqNode[], range: BooqRange, length: number): { quote: string, contextBefore: string, contextAfter: string } {
    const quote = textForRange(nodes, range) ?? ''

    // Get context before the range
    const startIter = iteratorAtPath(nodes, range.start)
    let contextBefore = ''
    let iter: BooqNodeIterator | undefined = undefined
    if (startIter && isTextIterator(startIter)) {
        contextBefore = textBefore(startIter) + contextBefore
        iter = startIter.parent
    } else {
        iter = startIter
    }
    iter = iter && prevLeafNode(iter)
    while (iter) {
        if (contextBefore.length >= length) {
            break
        }
        contextBefore = nodeText(iteratorsNode(iter) ?? null) + contextBefore
        iter = prevLeafNode(iter)
    }

    // Get context after the range
    const endIter = iteratorAtPath(nodes, range.end)
    let contextAfter = ''
    if (endIter && isTextIterator(endIter)) {
        contextAfter += textStartingAt(endIter)
        iter = nextLeafNode(endIter.parent)
    } else {
        iter = endIter
    }
    while (iter) {
        if (contextAfter.length >= length) {
            break
        }
        contextAfter += nodeText(iteratorsNode(iter) ?? null)
        iter = nextLeafNode(iter)
    }

    return { quote, contextBefore, contextAfter }
}

// Returns the text content for the given range in the nodes. The range is defined by start and end paths, which are arrays of numbers representing the path to the node in the BooqNode structure. The end path is exclusive, meaning the text content at the end path is not included in the result. If the end path points to a character within a string, that character is not included. If the range is invalid or does not correspond to any text content, it returns undefined.
export function textForRange(nodes: BooqNode[], { start, end }: BooqRange): string | undefined {
    const [startHead, ...startTail] = start
    const [endHead, ...endTail] = end
    if (startHead === undefined || endHead === undefined || startHead >= nodes.length || endHead < startHead || endHead > nodes.length) {
        return undefined
    }

    let result = ''
    const startNode = nodes[startHead]
    if (startNode?.kind === 'element') {
        if (startTail.length === 0) {
            // No sub-path specified, include all content from this element
            result += nodeText(startNode)
        } else {
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