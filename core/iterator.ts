import { BooqNode, BooqPath } from './model'

export type BooqNodeIterator = {
    parent: BooqNodeIterator | undefined,
    nodes: BooqNode[],
    index: number,
}

export function iteratorsNode(iter: BooqNodeIterator): BooqNode {
    return iter.nodes[iter.index]
}

export function iteratorsPath(iter: BooqNodeIterator): BooqPath {
    if (iter.parent) {
        return [...iteratorsPath(iter.parent), iter.index]
    } else {
        return [iter.index]
    }
}

export function rootIterator(nodes: BooqNode[]) {
    return {
        nodes,
        index: 0,
        parent: undefined,
    }
}

export function firstLeafNode(iter: BooqNodeIterator): BooqNodeIterator {
    const node = iteratorsNode(iter)
    if (node?.kind === 'element' && node.children?.length) {
        return firstLeafNode({
            parent: iter,
            nodes: node.children,
            index: 0,
        })
    } else {
        return iter
    }
}

export function lastLeafNode(iter: BooqNodeIterator): BooqNodeIterator {
    const node = iteratorsNode(iter)
    if (node?.kind === 'element' && node.children?.length) {
        return lastLeafNode({
            parent: iter,
            nodes: node.children,
            index: node.children.length - 1,
        })
    } else {
        return iter
    }
}

export function nextLeafNode(iter: BooqNodeIterator): BooqNodeIterator | undefined {
    const node = nextIterator(iter)
    return node && firstLeafNode(node)
}

export function prevLeafNode(iter: BooqNodeIterator): BooqNodeIterator | undefined {
    const node = prevIterator(iter)
    return node && lastLeafNode(node)
}

export function findPath(iter: BooqNodeIterator, path: BooqPath): BooqNodeIterator | undefined {
    const [head, ...tail] = path
    if (head === undefined || head >= iter.nodes.length) {
        return undefined
    }
    const curr = { ...iter, index: head }
    if (!tail?.length) {
        return curr
    } else {
        const node = iteratorsNode(curr)
        // If path is within text node, return current iterator
        if (node?.kind === 'text' && tail.length === 1) {
            return curr
        }
        if (node?.kind !== 'element' || !node?.children?.length) {
            return undefined
        }
        const childrenIter = {
            parent: curr,
            index: 0,
            nodes: node.children,
        }
        return findPath(childrenIter, tail)
    }
}

export function nextSibling(iter: BooqNodeIterator) {
    return iter.index < iter.nodes.length - 1
        ? { ...iter, index: iter.index + 1 }
        : undefined
}

export function prevSibling(iter: BooqNodeIterator) {
    return iter.index > 0
        ? { ...iter, index: iter.index - 1 }
        : undefined
}

export function nextIterator(iter: BooqNodeIterator): BooqNodeIterator | undefined {
    const sibling = nextSibling(iter)
    if (sibling) {
        return sibling
    } else if (iter.parent) {
        return nextIterator(iter.parent)
    } else {
        return undefined
    }
}

export function prevIterator(iter: BooqNodeIterator): BooqNodeIterator | undefined {
    const sibling = prevSibling(iter)
    if (sibling) {
        return sibling
    } else if (iter.parent) {
        return prevIterator(iter.parent)
    } else {
        return undefined
    }
}
