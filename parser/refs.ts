import { BooqNode, findPathForId, isElementNode, isSectionNode } from '../core'

export function resolveRefs(nodes: BooqNode[]): BooqNode[] {
    return resolveNodesRefs(nodes, nodes)
}

function resolveNodesRefs(root: BooqNode[], nodes: BooqNode[]): BooqNode[] {
    return nodes.map(
        node => resolveNodeRefs(root, node),
    )
}

function resolveNodeRefs(root: BooqNode[], node: BooqNode): BooqNode {
    if (isSectionNode(node)) {
        return {
            ...node,
            children: resolveNodesRefs(root, node.children ?? []),
        }
    } else if (isElementNode(node)) {
        const { href, ...rest } = node.attrs ?? {}
        const ref = href?.startsWith('#') ? findPathForId(root, href.substring(1))
            : href !== undefined ? findPathForId(root, href)
                : undefined
        const attrs = ref
            ? (Object.keys(rest).length > 0 ? rest : undefined)
            : node.attrs
        const children = resolveNodesRefs(root, node.children)
        return {
            ...node,
            attrs,
            children,
            ref,
        }
    } else {
        return node
    }
}