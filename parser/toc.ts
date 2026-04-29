import { Diagnoser } from 'booqs-epub'
import {
    BooqDocument, BooqPath, TableOfContentsItem, TableOfContents, positionForPath,
} from '../core'
import { Epub } from './epub'
import { hrefToKey } from './href'

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

// TOC hrefs are relative to the EPUB package root — same coordinate
// space as document fileNames. Direct key lookup should work.
function resolveTocHref(href: string, hrefToPathMap: Map<string, BooqPath>): BooqPath | undefined {
    const hashIndex = href.indexOf('#')
    if (hashIndex >= 0) {
        const fileName = href.substring(0, hashIndex)
        const id = href.substring(hashIndex + 1)
        return hrefToPathMap.get(hrefToKey({ fileName, id }))
    }
    // No fragment — find the first ID in this document
    for (const [key, path] of hrefToPathMap) {
        if (key.startsWith(`${href}#`)) return path
    }
    return undefined
}
