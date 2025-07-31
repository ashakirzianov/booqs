import { BooqNode, Booq, nodesLength } from '../core'
import { Epub } from './epub'
import { EpubSection, parseSection } from './section'
import { buildToc } from './toc'
import { preprocess } from './preprocess'
import { extactBooqMeta } from './metadata'
import { Diagnoser } from 'booqs-epub'

// TODO: make sync again
export async function processEpub(epub: Epub, diags: Diagnoser): Promise<Booq | undefined> {
    const nodes: BooqNode[] = []
    const spine = await epub.spine() ?? []
    for (const { manifestItem } of spine) {
        const id = manifestItem['@id']
        const href = manifestItem['@href']
        if (!id || !href) {
            nodes.push(null)
            continue
        }
        const loaded = await epub.loadItem(manifestItem)
        if (!loaded || typeof loaded.content !== 'string') {
            nodes.push(null)
            continue
        }
        const section: EpubSection = {
            id,
            fileName: href,
            content: loaded.content,
        }
        const value = await parseSection(section, epub, diags)
        nodes.push(value)
    }

    const length = nodesLength(nodes)
    const metaFromMetadata = await extactBooqMeta(epub, diags)
    const meta = {
        ...metaFromMetadata,
        length,
    }
    const toc = await buildToc(nodes, epub, diags)

    const prepocessed = preprocess(nodes)

    return {
        nodes: prepocessed,
        metadata: meta,
        toc: toc ?? {
            title: undefined,
            items: [],
        },
    }
}
