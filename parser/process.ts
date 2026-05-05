import { BooqDocument, BooqStyles, BooqChildNode, isElementNode, mapDocumentNodes, DATA_PARAGRAPH } from '../core'
import { scopeIdsAndResolveHrefs, HrefToPathMap } from './scopeIds'
import { processStyles } from './styles'
import { Epub } from './epub'
import { Diagnoser } from 'booqs-epub'

export type ProcessResult = {
    documents: BooqDocument[],
    styles: BooqStyles,
    hrefToPathMap: HrefToPathMap,
}

export async function processDocuments(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<ProcessResult> {
    const sanitized = sanitizeDocuments(documents)
    const { documents: styled, styles } = await processStyles(sanitized, epub, diags)
    const { documents: scoped, hrefToPathMap } = scopeIdsAndResolveHrefs(styled)
    const marked = markParagraphs(scoped)
    return {
        documents: marked,
        styles,
        hrefToPathMap,
    }
}

function markParagraphs(documents: BooqDocument[]): BooqDocument[] {
    return mapDocumentNodes(documents, node => {
        if (isElementNode(node) && isParagraph(node)) {
            return { ...node, attributes: { ...node.attributes, [DATA_PARAGRAPH]: '' } }
        }
        return node
    })
}

function sanitizeDocuments(documents: BooqDocument[]): BooqDocument[] {
    return mapDocumentNodes(documents, node => {
        if (isElementNode(node) && node.name === 'script') {
            return { ...node, children: [] }
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
