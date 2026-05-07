import { BooqDocument, BooqStyles, BooqChildNode, BooqPath, isElementNode, visitNodes, mapChildNodesAsync, pathToString, DATA_PARAGRAPH, DATA_REF_PATH } from '../core'
import { transformStyleNode } from './styles'
import { resolveHref, hrefToKey } from './href'
import { Epub } from './epub'
import { Diagnoser } from 'booqs-epub'

// Maps "fileName#id" → BooqPath. Built from original unscoped IDs.
export type HrefToPathMap = Map<string, BooqPath>

export type ProcessResult = {
    documents: BooqDocument[],
    styles: BooqStyles,
    hrefToPathMap: HrefToPathMap,
}

// Impure: mutates documents in place for memory efficiency (see CLAUDE.md)
export async function processDocuments(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<ProcessResult> {
    sanitize(documents)
    const styles = await processStyles(documents, epub, diags)
    const hrefToPathMap = scopeIdsAndResolveHrefs(documents)
    markParagraphs(documents)
    return { documents, styles, hrefToPathMap }
}

// --- sanitize ---

function sanitize(documents: BooqDocument[]): void {
    for (const doc of documents) {
        visitNodes(doc.children, node => {
            if (isElementNode(node) && node.name === 'script') {
                node.children = []
            }
        })
    }
}

// --- styles ---

async function processStyles(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<BooqStyles> {
    const styles: BooqStyles = {}
    for (const doc of documents) {
        doc.children = await mapChildNodesAsync(doc.children, node => transformStyleNode(node, doc.fileName, styles, epub, diags))
    }
    return styles
}

// --- scope IDs and resolve hrefs ---

function scopeIdsAndResolveHrefs(documents: BooqDocument[]): HrefToPathMap {
    const hrefToPathMap = buildHrefToPathMap(documents)
    const fileNameToIndex = new Map(documents.map((doc, i) => [doc.fileName, i]))

    for (let index = 0; index < documents.length; index++) {
        const doc = documents[index]
        const prefix = scopePrefix(index, doc.fileName)
        visitNodes(doc.children, node => {
            if (!isElementNode(node)) return
            const originalId = node.attributes?.id
            const scopedId = originalId ? `${prefix}--${originalId}` : undefined
            const hrefResult = resolveInternalHref(node.attributes?.href, doc.fileName, hrefToPathMap, fileNameToIndex)
            if (scopedId || hrefResult) {
                node.attributes = {
                    ...node.attributes,
                    ...(scopedId ? { id: scopedId } : {}),
                    ...(hrefResult ? {
                        href: `#${hrefResult.scopedId}`,
                        [DATA_REF_PATH]: hrefResult.path,
                    } : {}),
                }
            }
        })
    }

    return hrefToPathMap
}

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

function resolveInternalHref(
    href: string | undefined,
    fileName: string,
    hrefToPathMap: HrefToPathMap,
    fileNameToIndex: Map<string, number>,
): { path: string, scopedId: string } | undefined {
    if (!href) return undefined
    const resolved = resolveHref(href, fileName)
    if (!resolved || !resolved.id) return undefined
    const key = hrefToKey(resolved)
    const path = hrefToPathMap.get(key)
    if (!path) return undefined
    const targetDocIndex = fileNameToIndex.get(resolved.fileName)
    if (targetDocIndex === undefined) return undefined
    const scopedId = `${scopePrefix(targetDocIndex, resolved.fileName)}--${resolved.id}`
    return { path: pathToString(path), scopedId }
}

function scopePrefix(docIndex: number, fileName: string): string {
    const basename = fileName.replace(/^.*\//, '').replace(/\.[^.]*$/, '')
    return `booqs-${docIndex}-${basename}`
}

// --- mark paragraphs ---

function markParagraphs(documents: BooqDocument[]): void {
    for (const doc of documents) {
        visitNodes(doc.children, node => {
            if (isElementNode(node) && isParagraph(node)) {
                node.attributes = { ...node.attributes, [DATA_PARAGRAPH]: '' }
            }
        })
    }
}

function isParagraph(node: BooqChildNode) {
    switch (node?.name) {
        case 'div': case 'p':
            return !hasChildParagraphs(node)
        default:
            return false
    }
}

function hasChildParagraphs(node: BooqChildNode): boolean {
    return node?.children !== undefined && node.children.some(
        ch => isParagraph(ch) || hasChildParagraphs(ch),
    )
}
