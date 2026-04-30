import { BooqDocument, BooqChildNode, BooqNode, BooqRange, BooqPath, BooqStyles, BooqElement, Booq } from './model'
import { isElementNode, isContainerNode, stubNode, isStubNode } from './node'
import { nodeLength } from './position'

export type BooqFragment = {
    start: BooqPath,
    end: BooqPath,
    content: BooqNode[],
    styles: BooqStyles,
}

export function buildFragment({ content, styles }: Pick<Booq, 'content' | 'styles'>, range: BooqRange): BooqFragment {
    const [startDoc, ...startTail] = range.start
    const [endDoc, ...endTail] = range.end
    const actualStart = startDoc ?? 0
    const actualEnd = endDoc ?? content.length

    const fragmentContent: BooqNode[] = []
    for (let idx = 0; idx < content.length; idx++) {
        const doc = content[idx]
        const beforeRange = idx < actualStart
        const afterRange = endTail.length > 0 ? idx > actualEnd : idx >= actualEnd
        const atStart = idx === actualStart
        const atEnd = idx === actualEnd && endTail.length > 0

        if (beforeRange || afterRange) {
            fragmentContent.push(stubDocument(doc))
        } else if (!atStart && !atEnd) {
            // Fully inside range
            fragmentContent.push(doc)
        } else {
            // Document is at the boundary — partially in range
            const childStart = atStart ? startTail : [0]
            const childEnd = atEnd ? endTail : [doc.children.length]
            fragmentContent.push({
                ...doc,
                children: sliceChildren(doc.children, { start: childStart, end: childEnd }),
            })
        }
    }

    const referencedStyles = collectStyles(fragmentContent, styles)
    return {
        start: range.start,
        end: range.end,
        content: fragmentContent,
        styles: referencedStyles,
    }
}

// Recursively slice children, preserving structurally important nodes
// (<style>, <link rel="stylesheet">) and stubbing out-of-range content.
function sliceChildren(nodes: BooqChildNode[], range: BooqRange): BooqChildNode[] {
    const [startHead, ...startTail] = range.start
    const [endHead, ...endTail] = range.end
    const actualStart = startHead ?? 0
    const actualEnd = endHead ?? nodes.length

    const result: BooqChildNode[] = []
    for (let idx = 0; idx < nodes.length; idx++) {
        const node = nodes[idx]

        if (idx >= actualStart && idx <= actualEnd) {
            // Node is in range — recurse into boundaries
            if (idx === actualStart && startTail.length > 0 && isContainerNode(node)) {
                const childEnd = idx === actualEnd && endTail.length > 0
                    ? endTail
                    : [node.children.length]
                result.push({
                    ...node,
                    children: sliceChildren(node.children, { start: startTail, end: childEnd }),
                })
            } else if (idx === actualEnd && endTail.length > 0 && isContainerNode(node)) {
                result.push({
                    ...node,
                    children: sliceChildren(node.children, { start: [0], end: endTail }),
                })
            } else {
                result.push(node)
            }
        } else {
            // Node is out of range — preserve if structurally important, stub otherwise
            result.push(stripNode(node))
        }
    }
    return result
}

// Returns the node (possibly stripped) if it should be preserved for structural
// reasons, or stub if it should be stripped entirely. Preserved nodes: <style>, <link rel="stylesheet">,
// and any container whose subtree contains a preserved node.
function stripNode(node: BooqChildNode): BooqChildNode {
    if (!isElementNode(node)) return stubChild(node)

    if (isPreservedElement(node)) return node

    if (!node.children || node.children.length === 0) return stubChild(node)

    const children: BooqChildNode[] = []
    let hasPreserved = false
    for (const child of node.children) {
        const preserved = stripNode(child)
        if (!isStubNode(preserved)) {
            hasPreserved = true
            children.push(preserved)
        } else {
            children.push(stubChild(child))
        }
    }

    if (!hasPreserved) return stubChild(node)
    return { ...node, children }
}

function isPreservedElement(node: BooqElement): boolean {
    if (node.name === 'style') return true
    if (node.name === 'link' && node.attributes?.rel?.toLowerCase() === 'stylesheet') return true
    return false
}

function stubChild(node: BooqChildNode): BooqChildNode {
    return stubNode(nodeLength(node))
}

function stubDocument(doc: BooqDocument): BooqDocument {
    const length = doc.children.reduce((sum, ch) => sum + nodeLength(ch), 0)
    return {
        ...doc,
        children: [stubNode(length)],
    }
}

// Collect styles referenced by <link> elements in the fragment's documents.
function collectStyles(nodes: BooqNode[], allStyles: BooqStyles): BooqStyles {
    const refs = new Set<string>()
    collectStyleRefs(nodes, refs)
    const styles: BooqStyles = {}
    for (const ref of refs) {
        if (allStyles[ref] !== undefined) {
            styles[ref] = allStyles[ref]
        }
    }
    return styles
}

function collectStyleRefs(nodes: BooqNode[], refs: Set<string>): void {
    for (const node of nodes) {
        if (isElementNode(node) && node.name === 'link'
            && node.attributes?.rel?.toLowerCase() === 'stylesheet'
            && node.attributes?.href) {
            refs.add(node.attributes.href)
        }
        if (isContainerNode(node)) {
            collectStyleRefs(node.children, refs)
        }
    }
}
