import { Booq, nodesLength, BooqDocument } from '../core'
import { Epub } from './epub'
import { EpubSection, parseDocument } from './section'
import { buildToc } from './toc'
import { processDocuments } from './process'
import { extractBooqMeta } from './metadata'
import { Diagnoser } from 'booqs-epub'


// TODO: make sync again
export async function processEpub(epub: Epub, diags: Diagnoser): Promise<Booq | undefined> {
    const documents: BooqDocument[] = []
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
        const document = await parseDocument({ section, diags })
        documents.push(document)
    }

    const { documents: preprocessed, styles, hrefToPathMap } = await processDocuments(documents, epub, diags)

    const length = nodesLength(preprocessed)
    const metaFromMetadata = await extractBooqMeta(epub, diags)
    const meta = {
        ...metaFromMetadata,
        length,
    }
    const toc = await buildToc(preprocessed, epub, hrefToPathMap, diags)

    return {
        content: preprocessed,
        styles,
        metadata: meta,
        toc: toc ?? {
            title: undefined,
            items: [],
        },
    }
}
