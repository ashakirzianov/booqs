import { BooqNode, findPathForId, isElementNode, mapNodes } from '../core'

export function resolveRefs(nodes: BooqNode[]): BooqNode[] {
    return mapNodes(nodes, node => {
        if (!isElementNode(node)) {
            return node
        }
        const { href, ...rest } = node.attrs ?? {}
        const ref = href?.startsWith('#') ? findPathForId(nodes, href.substring(1))
            : href !== undefined ? findPathForId(nodes, href)
                : undefined
        const attrs = ref
            ? (Object.keys(rest).length > 0 ? rest : undefined)
            : node.attrs
        return { ...node, attrs, ref }
    })
}