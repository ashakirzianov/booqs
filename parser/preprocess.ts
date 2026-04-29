import { BooqDocument } from '../core'
import { scopeIdsAndResolveHrefs } from './scopeIds'
import { markParagraphs } from './pph'

export function preprocess(documents: BooqDocument[]): BooqDocument[] {
    const scoped = scopeIdsAndResolveHrefs(documents)
    const marked = markParagraphs(scoped)
    return marked
}
