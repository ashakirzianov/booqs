import { BooqDocument, findPathForId, isElementNode, mapDocumentNodes } from '../core'

export function resolveRefs(documents: BooqDocument[]): BooqDocument[] {
    return mapDocumentNodes(documents, node => {
        if (!isElementNode(node)) {
            return node
        }
        const { href, ...rest } = node.attributes ?? {}
        const ref = href?.startsWith('#') ? findPathForId(documents, href.substring(1))
            : href !== undefined ? findPathForId(documents, href)
                : undefined
        const attributes = ref
            ? (Object.keys(rest).length > 0 ? rest : undefined)
            : node.attributes
        return { ...node, attributes, ref }
    })
}
