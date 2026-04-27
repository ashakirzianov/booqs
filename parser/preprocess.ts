import { BooqDocument } from '../core'
import { resolveRefs } from './refs'
import { markParagraphs } from './pph'

export function preprocess(documents: BooqDocument[]): BooqDocument[] {
    const resolved = resolveRefs(documents)
    const marked = markParagraphs(resolved)
    return marked
}
