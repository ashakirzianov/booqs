import { BooqNode } from '../core'
import { resolveRefs } from './refs'
import { markParagraphs } from './pph'

export function preprocess(nodes: BooqNode[]): BooqNode[] {
    const resolved = resolveRefs(nodes)
    const marked = markParagraphs(resolved)
    return marked
}