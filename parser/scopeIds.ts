import { BooqDocument, BooqChildNode, BooqPath, isElementNode, pathToString, mapChildNodes } from '../core'
import { resolveRelativePath } from './path'

export function scopeIdsAndResolveHrefs(documents: BooqDocument[]): BooqDocument[] {
    // Build path lookup using original (unscoped) IDs — must happen before scoping
    const pathMap = buildPathMap(documents)

    return documents.map((doc, index) => {
        const prefix = scopePrefix(index, doc.fileName)
        return {
            ...doc,
            children: mapChildNodes(doc.children, node => {
                if (!isElementNode(node)) return node
                const scopedId = node.id ? `${prefix}--${node.id}` : undefined
                const refPathAttr = resolveHrefToRefPath(node.attributes?.href, doc.fileName, pathMap)
                return {
                    ...node,
                    id: scopedId ?? node.id,
                    attributes: refPathAttr
                        ? { ...node.attributes, 'data-booqs-ref-path': refPathAttr }
                        : node.attributes,
                }
            }),
        }
    })
}

// Build lookup table mapping "fileName#id" → BooqPath.
// Uses original unscoped IDs. Also used by TOC resolution.
export function buildPathMap(documents: BooqDocument[]): Map<string, BooqPath> {
    const map = new Map<string, BooqPath>()
    for (let docIndex = 0; docIndex < documents.length; docIndex++) {
        const doc = documents[docIndex]
        collectIdPaths(doc.children, [docIndex], doc.fileName, map)
    }
    return map
}

function collectIdPaths(nodes: BooqChildNode[], basePath: BooqPath, fileName: string, map: Map<string, BooqPath>): void {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (!isElementNode(node)) continue
        const currentPath = [...basePath, i]
        if (node.id) {
            const key = `${fileName}#${node.id}`
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
    pathMap: Map<string, BooqPath>,
): string | undefined {
    if (!href) return undefined
    const key = resolveToKey(href, fileName)
    if (!key) return undefined
    const path = pathMap.get(key)
    if (!path) return undefined
    return pathToString(path)
}

function resolveToKey(href: string, currentFileName: string): string | undefined {
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        return undefined
    }
    const hashIndex = href.indexOf('#')
    if (hashIndex === 0) {
        return `${currentFileName}${href}`
    }
    if (hashIndex > 0) {
        const file = href.substring(0, hashIndex)
        const id = href.substring(hashIndex + 1)
        const resolved = resolveRelativePath(file, currentFileName)
        return `${resolved}#${id}`
    }
    return undefined
}

function scopePrefix(docIndex: number, fileName: string): string {
    const basename = fileName.replace(/^.*\//, '').replace(/\.[^.]*$/, '')
    return `booqs-${docIndex}-${basename}`
}
