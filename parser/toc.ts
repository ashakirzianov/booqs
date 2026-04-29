import { Diagnoser } from 'booqs-epub'
import {
    BooqDocument, BooqPath, TableOfContentsItem, TableOfContents, positionForPath,
} from '../core'
import { Epub } from './epub'
import { buildPathMap } from './scopeIds'

export async function buildToc(documents: BooqDocument[], file: Epub, diags: Diagnoser): Promise<TableOfContents> {
    const items: TableOfContentsItem[] = []
    const pathMap = buildPathMap(documents)
    const { items: toc, title } = await file.toc() ?? {
        title: undefined,
        items: [],
    }
    for (const epubTocItem of toc) {
        if (epubTocItem.href) {
            const path = resolveHrefToPath(epubTocItem.href, file, pathMap)
            if (path) {
                items.push({
                    title: epubTocItem.label,
                    level: epubTocItem.level ?? 0,
                    position: positionForPath(documents, path),
                    path,
                })
            } else {
                diags.push({
                    message: 'Unresolved toc item',
                    data: {
                        tocItem: epubTocItem,
                    },
                })
            }
        }
    }

    return {
        title,
        items,
    }
}

function resolveHrefToPath(href: string, file: Epub, pathMap: Map<string, BooqPath>): BooqPath | undefined {
    // TOC hrefs are relative to the epub root, not to a specific document.
    // Try resolving as-is first (for absolute-ish paths), then try common patterns.
    const hashIndex = href.indexOf('#')
    if (hashIndex >= 0) {
        const filePart = href.substring(0, hashIndex)
        const id = href.substring(hashIndex + 1)
        // Try the href file path directly as a key
        const key = `${filePart}#${id}`
        if (pathMap.has(key)) return pathMap.get(key)
        // TOC hrefs might need resolution relative to epub base
        // Try without leading path separators
        const cleaned = filePart.replace(/^\/+/, '')
        const cleanedKey = `${cleaned}#${id}`
        if (pathMap.has(cleanedKey)) return pathMap.get(cleanedKey)
    } else {
        // No fragment — try to find the document itself
        // This is a reference to the start of a document, not to a specific ID
        // Look for any path that starts with this file
        for (const [key, path] of pathMap) {
            if (key.startsWith(`${href}#`)) return path
        }
    }
    return undefined
}
