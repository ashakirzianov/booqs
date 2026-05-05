import { BooqDocument, BooqStyles, BooqChildNode, isElementNode, visitNodes, DATA_PARAGRAPH } from '../core'
import { scopeIdsAndResolveHrefs, HrefToPathMap } from './scopeIds'
import { processStyles } from './styles'
import { Epub } from './epub'
import { Diagnoser } from 'booqs-epub'

export type ProcessResult = {
    documents: BooqDocument[],
    styles: BooqStyles,
    hrefToPathMap: HrefToPathMap,
}

// Impure: mutates documents in place for memory efficiency (see CLAUDE.md)
export async function processDocuments(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<ProcessResult> {
    sanitizeDocuments(documents)
    const styles = await processStyles(documents, epub, diags)
    const hrefToPathMap = scopeIdsAndResolveHrefs(documents)
    markParagraphs(documents)
    return { documents, styles, hrefToPathMap }
}

function markParagraphs(documents: BooqDocument[]): void {
    for (const doc of documents) {
        visitNodes(doc.children, node => {
            if (isElementNode(node) && isParagraph(node)) {
                node.attributes = { ...node.attributes, [DATA_PARAGRAPH]: '' }
            }
        })
    }
}

function sanitizeDocuments(documents: BooqDocument[]): void {
    for (const doc of documents) {
        visitNodes(doc.children, node => {
            if (isElementNode(node) && node.name === 'script') {
                node.children = []
            }
        })
    }
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
