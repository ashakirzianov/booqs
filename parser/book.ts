import { BooqNode, Booq, nodesLength } from '../core'
import { EpubPackage } from './epub'
import { parseSection } from './section'
import { buildImages } from './images'
import { buildToc } from './toc'
import { preprocess } from './preprocess'
import { buildMeta } from './metadata'
import { Diagnoser } from 'booqs-epub'

export async function processEpub(epub: EpubPackage, diags: Diagnoser): Promise<Booq | undefined> {
    const nodes: BooqNode[] = []
    for await (const section of epub.sections()) {
        const value = await parseSection(section, epub, diags)
        if (!value) {
            return undefined
        }
        nodes.push(value)
    }

    const meta = buildMeta(epub, diags)
    const images = await buildImages(nodes, meta, epub, diags)
    const toc = await buildToc(nodes, epub, diags)

    const prepocessed = preprocess(nodes)

    const length = nodesLength(nodes)
    return {
        nodes: prepocessed,
        meta,
        length,
        toc: toc ?? {
            title: undefined,
            items: [],
        },
        images: images ?? {},
    }
}
