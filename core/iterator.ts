import { BooqElementNode, BooqNode, BooqPath, BooqTextNode } from './model'
import { pathLessThan } from './path'

export type BooqIterator = BooqNodeIterator | BooqTextIterator
export type BooqNodeIterator = {
    node: BooqElementNode,
    index: number,
    parent: BooqNodeIterator | undefined,
}
export type BooqTextIterator = {
    node: BooqTextNode,
    index: number,
    parent: BooqNodeIterator,
}

export function isNodeIterator(iter: BooqIterator): iter is BooqNodeIterator {
    return iter.node?.kind === 'element'
}

export function isTextIterator(iter: BooqIterator): iter is BooqTextIterator {
    return iter.node?.kind === 'text'
}

export function iteratorLessThan(a: BooqIterator, b: BooqIterator): boolean {
    const aPath = iteratorsPath(a)
    const bPath = iteratorsPath(b)
    return pathLessThan(aPath, bPath)
}

export function iteratorAtPath(nodes: BooqNode[], path: BooqPath): BooqIterator | undefined {
    function iteratorAtPathImpl(element: BooqElementNode, path: BooqPath, parent: BooqNodeIterator | undefined): BooqIterator | undefined {
        const [head, ...tail] = path
        if (head === undefined || head >= (element.children?.length ?? 0)) {
            return undefined
        }
        const node = element.children?.[head]
        const current = {
            node: element,
            index: head,
            parent,
        }
        if (tail.length === 0) {
            return current
        } else if (node?.kind === 'text') {
            if (tail.length > 1) {
                return undefined // Cannot go deeper into text nodes
            }
            return {
                node,
                index: tail[0],
                parent: current,
            }
        } else if (node?.kind !== 'element' || !node.children) {
            return undefined
        } else {
            return iteratorAtPathImpl(node, tail, current)
        }
    }
    return iteratorAtPathImpl({
        kind: 'element',
        name: 'root',
        children: nodes,
    }, path, undefined)
}

export function iteratorsPath(iter: BooqIterator): BooqPath {
    if (iter.parent) {
        return [...iteratorsPath(iter.parent), iter.index]
    } else {
        return [iter.index]
    }
}

export function iteratorsNode(iter: BooqIterator): BooqNode | undefined {
    return iter.node?.kind === 'element'
        ? iter.node.children?.[iter.index]
        : undefined
}

export function firstLeafNode(iter: BooqNodeIterator): BooqNodeIterator {
    const node = iter.node.children?.[iter.index]
    if (node?.kind === 'element') {
        return firstLeafNode({
            parent: iter,
            index: 0,
            node,
        })
    } else {
        return iter
    }
}

export function lastLeafNode(iter: BooqNodeIterator): BooqNodeIterator {
    const node = iter.node.children?.[iter.index]
    if (node?.kind === 'element' && node.children?.length) {
        return lastLeafNode({
            parent: iter,
            index: node.children.length - 1,
            node,
        })
    } else {
        return iter
    }
}

export function nextLeafNode(iter: BooqIterator): BooqNodeIterator | undefined {
    const next = nextIterator(iter)
    return next && isNodeIterator(next)
        ? firstLeafNode(next)
        : undefined
}

export function prevLeafNode(iter: BooqIterator): BooqNodeIterator | undefined {
    const prev = prevIterator(iter)
    return prev && isNodeIterator(prev)
        ? lastLeafNode(prev)
        : undefined
}

export function nextSibling(iter: BooqIterator) {
    const length = iter.node?.kind === 'text'
        ? iter.node.content.length
        : iter.node?.kind === 'element'
            ? iter.node?.children?.length ?? 0
            : 0

    return iter.index < length - 1
        ? { ...iter, index: iter.index + 1 }
        : undefined
}

export function prevSibling(iter: BooqIterator) {
    return iter.index > 0
        ? { ...iter, index: iter.index - 1 }
        : undefined
}

export function nextIterator(iter: BooqIterator): BooqIterator | undefined {
    const sibling = nextSibling(iter)
    if (sibling) {
        return sibling
    } else if (iter.parent) {
        return nextIterator(iter.parent)
    } else {
        return undefined
    }
}

export function prevIterator(iter: BooqIterator): BooqIterator | undefined {
    const sibling = prevSibling(iter)
    if (sibling) {
        return sibling
    } else if (iter.parent) {
        return prevIterator(iter.parent)
    } else {
        return undefined
    }
}

export function textBefore(iter: BooqTextIterator): string {
    return iter.node.content.slice(0, iter.index)
}

export function textStartingAt(iter: BooqTextIterator): string {
    return iter.node.content.slice(iter.index)
}
