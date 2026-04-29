import { BooqDocument, BooqChildNode, BooqPath, isElementNode, pathToString, mapChildNodes } from '../core'
import { resolveHref, hrefToKey } from './href'

// Maps "fileName#id" → BooqPath. Built from original unscoped IDs.
export type HrefToPathMap = Map<string, BooqPath>

export type ScopeIdsResult = {
    documents: BooqDocument[],
    hrefToPathMap: HrefToPathMap,
}

export function scopeIdsAndResolveHrefs(documents: BooqDocument[]): ScopeIdsResult {
    const hrefToPathMap = buildHrefToPathMap(documents)

    const scoped = documents.map((doc, index) => {
        const prefix = scopePrefix(index, doc.fileName)
        return {
            ...doc,
            children: mapChildNodes(doc.children, node => {
                if (!isElementNode(node)) return node
                const originalId = node.attributes?.id
                const scopedId = originalId ? `${prefix}--${originalId}` : undefined
                const refPathAttr = resolveHrefToRefPath(node.attributes?.href, doc.fileName, hrefToPathMap)
                return {
                    ...node,
                    attributes: {
                        ...node.attributes,
                        ...(scopedId ? { id: scopedId } : {}),
                        ...(refPathAttr ? { 'data-booqs-ref-path': refPathAttr } : {}),
                    },
                }
            }),
        }
    })

    return { documents: scoped, hrefToPathMap }
}

// --- private ---

function buildHrefToPathMap(documents: BooqDocument[]): HrefToPathMap {
    const map: HrefToPathMap = new Map()
    for (let docIndex = 0; docIndex < documents.length; docIndex++) {
        const doc = documents[docIndex]
        collectIdPaths(doc.children, [docIndex], doc.fileName, map)
    }
    return map
}

function collectIdPaths(nodes: BooqChildNode[], basePath: BooqPath, fileName: string, map: HrefToPathMap): void {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (!isElementNode(node)) continue
        const currentPath = [...basePath, i]
        const id = node.attributes?.id
        if (id) {
            const key = `${fileName}#${id}`
            if (!map.has(key)) {
                map.set(key, currentPath)
            }
        }
        collectIdPaths(node.children, currentPath, fileName, map)
    }
}

function resolveHrefToRefPath(
    href: string | undefined,
    fileName: string,
    hrefToPathMap: HrefToPathMap,
): string | undefined {
    if (!href) return undefined
    const resolved = resolveHref(href, fileName)
    if (!resolved) return undefined
    const path = hrefToPathMap.get(hrefToKey(resolved))
    if (!path) return undefined
    return pathToString(path)
}

function scopePrefix(docIndex: number, fileName: string): string {
    const basename = fileName.replace(/^.*\//, '').replace(/\.[^.]*$/, '')
    return `booqs-${docIndex}-${basename}`
}
