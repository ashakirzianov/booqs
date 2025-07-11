import uniq from 'lodash-es/uniq'
import { BooqNode, BooqImages, BooqMetadata } from '../core'
import { Epub } from './epub'
import { resolveRelativePath } from './path'
import { Diagnoser } from 'booqs-epub'

export async function buildImages(nodes: BooqNode[], meta: BooqMetadata, file: Epub, diags: Diagnoser) {
    const srcs = collectImgSrcs(nodes)
    const cover = meta.coverSrc
    const allSrcs = cover !== undefined
        ? [cover, ...srcs]
        : srcs
    const uniqueSrcs = uniq(allSrcs)
    const images: BooqImages = {}
    for (const src of uniqueSrcs) {
        if (isExternal(src)) {
            continue
        }
        const buffer = await file.loadBinaryFile(src)
        if (buffer) {
            const image = Buffer.from(buffer).toString('base64')
            images[src] = image
        } else {
            diags.push({
                message: `Couldn't load image: ${src}`,
            })
        }
    }
    return images
}

function isExternal(src: string): boolean {
    return src.match(/^www\.[^.]+\.com/) ? true : false
}

type CollectSrcEnv = {
    fileName: string,
}
function collectImgSrcs(nodes: BooqNode[], env?: CollectSrcEnv): string[] {
    return nodes.reduce<string[]>(
        (srcs, node) => [...srcs, ...collectImgSrcsFromNode(node, env)],
        [],
    )
}

function collectImgSrcsFromNode(node: BooqNode, env?: CollectSrcEnv): string[] {
    if (node?.kind !== 'element') {
        return []
    }
    if (node.fileName) {
        env = { ...env, fileName: node.fileName }
    }
    const fromChildren = collectImgSrcs(node.children ?? [], env)
    let src = node?.attrs?.src
    if (src && env?.fileName) {
        src = resolveRelativePath(src, env.fileName)
    }
    return src ? [src, ...fromChildren] : fromChildren
}