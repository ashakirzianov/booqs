import { Diagnoser } from 'booqs-epub'
import {
    BooqNode, TableOfContentsItem, TableOfContents, findPathForId, positionForPath,
} from '../core'
import { Epub } from './epub'
import { transformHref } from './parserUtils'

export async function buildToc(nodes: BooqNode[], file: Epub, diags: Diagnoser): Promise<TableOfContents> {
    const items: TableOfContentsItem[] = []
    const { items: toc, title } = await file.toc() ?? {
        title: undefined,
        items: [],
    }
    for (const epubTocItem of toc) {
        if (epubTocItem.href) {
            const targetId = transformHref(epubTocItem.href).substring(1)
            const path = findPathForId(nodes, targetId)
            if (path) {
                items.push({
                    title: epubTocItem.label,
                    level: epubTocItem.level ?? 0,
                    position: positionForPath(nodes, path),
                    path,
                })
            } else {
                diags.push({
                    message: 'Unresolved toc item',
                    data: epubTocItem,
                })
            }
        }
    }

    return {
        title,
        items,
    }
}

