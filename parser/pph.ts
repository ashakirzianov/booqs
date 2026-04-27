import { BooqDocument, BooqChildNode, isElementNode, mapDocumentNodes } from '../core'

export function markParagraphs(documents: BooqDocument[]): BooqDocument[] {
    return mapDocumentNodes(documents, node => {
        if (isElementNode(node) && isParagraph(node)) {
            return { ...node, pph: true }
        }
        return node
    })
}

function isParagraph(node: BooqChildNode) {
    switch (node?.name) {
        case 'div': case 'p':
            return !hasChildParagraphs(node)
        default:
            return false
    }
}

function hasChildParagraphs(node: BooqChildNode): boolean {
    return node?.children !== undefined && node.children.some(
        ch => isParagraph(ch) || hasChildParagraphs(ch),
    )
}
