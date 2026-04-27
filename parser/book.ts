import { BooqNode, BooqStyles, Booq, nodesLength, BooqDocument } from '../core'
import { Epub } from './epub'
import { EpubSection, parseDocument } from './section'
import { buildToc } from './toc'
import { preprocess } from './preprocess'
import { extactBooqMeta } from './metadata'
import { Diagnoser } from 'booqs-epub'

// TODO: make sync again
export async function processEpub(epub: Epub, diags: Diagnoser): Promise<Booq | undefined> {
    const documents: BooqDocument[] = []
    const styles: BooqStyles = {}
    const spine = await epub.spine() ?? []
    for (const { manifestItem } of spine) {
        const id = manifestItem['@id']
        const href = manifestItem['@href']
        if (!id || !href) {
            documents.push({ fileName: href ?? '', children: [], error: 'missing id or href' })
            continue
        }
        const loaded = await epub.loadItem(manifestItem)
        if (!loaded || typeof loaded.content !== 'string') {
            documents.push({ fileName: href, children: [], error: 'failed to load' })
            continue
        }
        const section: EpubSection = {
            id,
            fileName: href,
            content: loaded.content,
        }
        const document = await parseDocument({ section, file: epub, styles, diags })
        documents.push(document)
    }

    const allNodes: BooqNode[] = documents
    const length = nodesLength(allNodes)
    const metaFromMetadata = await extactBooqMeta(epub, diags)
    const meta = {
        ...metaFromMetadata,
        length,
    }
    const toc = await buildToc(allNodes, epub, diags)

    const preprocessed = preprocess(allNodes)

    return {
        documents: preprocessed as BooqDocument[],
        styles,
        metadata: meta,
        toc: toc ?? {
            title: undefined,
            items: [],
        },
    }
}
