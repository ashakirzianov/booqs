import { BooqDocument, BooqStyles } from '../core'
import { scopeIdsAndResolveHrefs, HrefToPathMap } from './scopeIds'
import { markParagraphs } from './pph'
import { processStyles } from './styles'
import { Epub } from './epub'
import { Diagnoser } from 'booqs-epub'

export type ProcessResult = {
    documents: BooqDocument[],
    styles: BooqStyles,
    hrefToPathMap: HrefToPathMap,
}

export async function processDocuments(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<ProcessResult> {
    const styles = await processStyles(documents, epub, diags)
    const { documents: scoped, hrefToPathMap } = scopeIdsAndResolveHrefs(documents)
    const marked = markParagraphs(scoped)
    return {
        documents: marked,
        styles,
        hrefToPathMap,
    }
}
