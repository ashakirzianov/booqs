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
import { isElementNode, isStubNode, isTextNode, nodeForPath } from './node'

export function nodeText(node: BooqNode): string {
    if (isElementNode(node)) {
        return node.children?.map(nodeText).join('') ?? ''
    } else if (isTextNode(node)) {
        return node
    } else if (isStubNode(node)) {
        return ''
    } else {
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
    } else if (isTextNode(startNode)) {
        if (startTail.length <= 1) {
            result += startNode.substring(
                startTail[0] ?? 0,
                startHead === endHead && endTail.length > 0
                    ? endTail[0]
                    : startNode.length,
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
        } else if (isTextNode(endNode)) {
            if (endTail.length === 1) {
                result += endNode.substring(0, endTail[0])
            }
        }
    }

    return result
}

export function getExpandedRange(nodes: BooqNode[], range: BooqRange): BooqRange {
    const expandedStart = getExpandedStartPath(nodes, range.start)
    const expandedEnd = getExpandedEndPath(nodes, range.end, expandedStart)

    return {
        start: expandedStart,
        end: expandedEnd,
    }
}

function getExpandedStartPath(nodes: BooqNode[], startPath: BooqPath): BooqPath {
    // Check if the start element itself has pph=true
    const startNode = nodeForPath(nodes, startPath)
    if (startNode?.kind === 'element' && startNode.pph === true) {
        return startPath
    }

    // Find the first parent with pph=true (going up the tree)
    for (let depth = startPath.length - 1; depth > 0; depth--) {
        const parentPath = startPath.slice(0, depth)
        const parentNode = nodeForPath(nodes, parentPath)
        if (parentNode?.kind === 'element' && parentNode.pph === true) {
            return parentPath
        }
    }

    // If no parent with pph=true is found, return the original start path
    return startPath
}

function getExpandedEndPath(nodes: BooqNode[], endPath: BooqPath, expandedStart: BooqPath): BooqPath {
    if (!endPath || endPath.length === 0) {
        // If no end path, create one based on expanded start
        return [expandedStart[0] + 1]
    }

    // Check if the end element itself has pph=true
    const endNode = nodeForPath(nodes, endPath)
    if (endNode?.kind === 'element' && endNode.pph === true) {
        // Return next sibling of the end element
        const nextSiblingPath = [...endPath]
        nextSiblingPath[nextSiblingPath.length - 1] += 1
        return nextSiblingPath
    }

    // Find the first parent with pph=true of the end element
    let parentWithPph: BooqPath | undefined
    for (let depth = endPath.length - 1; depth > 0; depth--) {
        const parentPath = endPath.slice(0, depth)
        const parentNode = nodeForPath(nodes, parentPath)
        if (parentNode?.kind === 'element' && parentNode.pph === true) {
            parentWithPph = parentPath
            break
        }
    }

    if (parentWithPph) {
        // Get the next sibling of the parent with pph=true
        const nextSiblingPath = [...parentWithPph]
        nextSiblingPath[nextSiblingPath.length - 1] += 1
        return nextSiblingPath
    } else {
        // If no parent with pph=true, use next sibling of expanded start
        return [expandedStart[0] + 1]
    }
}