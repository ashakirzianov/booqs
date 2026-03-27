import { BooqNode, isElementNode, mapNodes } from '../core'

export function markParagraphs(nodes: BooqNode[]): BooqNode[] {
    return mapNodes(nodes, node => {
        if (isElementNode(node) && isParagraph(node)) {
            return { ...node, pph: true }
        }
        return node
    })
}

function isParagraph(node: BooqNode) {
    switch (node?.name) {
        case 'div': case 'p':
            return !hasChildParagraphs(node)
        default:
            return false
    }
}

function hasChildParagraphs(node: BooqNode): boolean {
    return node?.children !== undefined && node.children.some(
        ch => isParagraph(ch) || hasChildParagraphs(ch),
    )
}