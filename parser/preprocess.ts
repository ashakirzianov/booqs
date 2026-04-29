import { BooqDocument, BooqStyles } from '../core'
import { scopeIdsAndResolveHrefs, HrefToPathMap } from './scopeIds'
import { markParagraphs } from './pph'
import { preprocessStyles } from './preprocessStyles'
import { Epub } from './epub'
import { Diagnoser } from 'booqs-epub'

export type PreprocessResult = {
    documents: BooqDocument[],
    styles: BooqStyles,
    hrefToPathMap: HrefToPathMap,
}

export async function preprocess(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<PreprocessResult> {
    const styles = await preprocessStyles(documents, epub, diags)
    const { documents: scoped, hrefToPathMap } = scopeIdsAndResolveHrefs(documents)
    const marked = markParagraphs(scoped)
    return {
        documents: marked,
        styles,
        hrefToPathMap,
    }
}
