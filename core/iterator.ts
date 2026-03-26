import { BooqElementNode, BooqSectionNode, BooqNode, BooqPath, BooqTextNode } from './model'
import { isTextNode } from './node'
import { pathLessThan } from './path'

type BooqContainerNode = BooqElementNode | BooqSectionNode

export type BooqIterator = BooqContainerIterator | BooqTextIterator
export type BooqContainerIterator = {
    node: BooqContainerNode,
    index: number,
    parent: BooqContainerIterator | undefined,
}
export type BooqTextIterator = {
    node: BooqTextNode,
    index: number,
    parent: BooqContainerIterator,
}

export function isContainerIterator(iter: BooqIterator): iter is BooqContainerIterator {
    return iter.node?.kind === 'element' || iter.node?.kind === 'section'
}

export function isTextIterator(iter: BooqIterator): iter is BooqTextIterator {
    return isTextNode(iter.node)
}

export function iteratorLessThan(a: BooqIterator, b: BooqIterator): boolean {
    const aPath = iteratorsPath(a)
    const bPath = iteratorsPath(b)
    return pathLessThan(aPath, bPath)
}

export function iteratorAtPath(nodes: BooqNode[], path: BooqPath): BooqIterator | undefined {
    function iteratorAtPathImpl(container: BooqContainerNode, path: BooqPath, parent: BooqContainerIterator | undefined): BooqIterator | undefined {
        const [head, ...tail] = path
        if (head === undefined || head >= (container.children?.length ?? 0)) {
            return undefined
        }
        const node = container.children?.[head]
        const current: BooqContainerIterator = {
            node: container,
            index: head,
            parent,
        }
        if (tail.length === 0) {
            return current
        } else if (isTextNode(node)) {
            if (tail.length > 1) {
                return undefined // Cannot go deeper into text nodes
            }
            return {
                node,
                index: tail[0],
                parent: current,
            }
        } else if ((node?.kind === 'element' || node?.kind === 'section') && node.children) {
            return iteratorAtPathImpl(node, tail, current)
        } else {
            return undefined
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
    return (iter.node?.kind === 'element' || iter.node?.kind === 'section')
        ? iter.node.children?.[iter.index]
        : undefined
}

export function firstLeafNode(iter: BooqContainerIterator): BooqContainerIterator {
    const node = iter.node.children?.[iter.index]
    if ((node?.kind === 'element' || node?.kind === 'section') && node.children?.length) {
        return firstLeafNode({
            parent: iter,
            index: 0,
            node,
        })
    } else {
        return iter
    }
}

export function lastLeafNode(iter: BooqContainerIterator): BooqContainerIterator {
    const node = iter.node.children?.[iter.index]
    if ((node?.kind === 'element' || node?.kind === 'section') && node.children?.length) {
        return lastLeafNode({
            parent: iter,
            index: node.children.length - 1,
            node,
        })
    } else {
        return iter
    }
}

export function nextLeafNode(iter: BooqIterator): BooqContainerIterator | undefined {
    const next = nextIterator(iter)
    return next && isContainerIterator(next)
        ? firstLeafNode(next)
        : undefined
}

export function prevLeafNode(iter: BooqIterator): BooqContainerIterator | undefined {
    const prev = prevIterator(iter)
    return prev && isContainerIterator(prev)
        ? lastLeafNode(prev)
        : undefined
}

export function nextSibling(iter: BooqIterator) {
    const length = isTextNode(iter.node)
        ? iter.node.length
        : (iter.node?.kind === 'element' || iter.node?.kind === 'section')
            ? iter.node.children?.length ?? 0
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
    return iter.node.slice(0, iter.index)
}

export function textStartingAt(iter: BooqTextIterator): string {
    return iter.node.slice(iter.index)
}
