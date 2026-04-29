import { Diagnoser } from 'booqs-epub'
import {
    BooqDocument, BooqPath, TableOfContentsItem, TableOfContents, positionForPath,
} from '../core'
import { Epub } from './epub'
import { resolveHref, hrefToKey } from './href'

export async function buildToc(documents: BooqDocument[], file: Epub, hrefToPathMap: Map<string, BooqPath>, diags: Diagnoser): Promise<TableOfContents> {
    const items: TableOfContentsItem[] = []
    const { items: toc, title } = await file.toc() ?? {
        title: undefined,
        items: [],
    }
    for (const epubTocItem of toc) {
        if (epubTocItem.href) {
            const path = resolveTocHref(epubTocItem.href, hrefToPathMap)
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

// TOC hrefs are relative to the TOC file, but booqs-epub doesn't expose the TOC
// file location. For now we assume TOC hrefs are in the same coordinate space as
// document fileNames (works for most EPUBs). See backlog for proper fix.
function resolveTocHref(href: string, hrefToPathMap: Map<string, BooqPath>): BooqPath | undefined {
    // TODO: pass actual TOC file path as base once booqs-epub exposes it
    const resolved = resolveHref(href, '')
    if (!resolved) return undefined
    if (resolved.id) {
        return hrefToPathMap.get(hrefToKey(resolved))
    }
    // No fragment — find the first ID in this document
    for (const [key, path] of hrefToPathMap) {
        if (key.startsWith(`${resolved.fileName}#`)) return path
    }
    return undefined
}
