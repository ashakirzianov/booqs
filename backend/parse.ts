import { assertNever, Booq, BooqId, BooqNode } from '@/core'
import { parseEpub } from '@/parser'
import { Epub, openEpubFile } from '@/parser/epub'
import { Diagnoser } from 'booqs-epub'
import { inspect } from 'util'
import { getOrLoadImagesData, BooqImages, BooqImagesData, urlForBooqImageId } from './images'
import { BooqFile } from './library'

export async function parseAndPreprocessBooq(booqId: BooqId, file: BooqFile): Promise<Booq | undefined> {
    if (file.kind !== 'epub') {
        return undefined
    }
    const diags: Diagnoser = []
    const epub = await openEpubFile({ fileBuffer: file.file, diags })
    const { value: booq } = await parseEpub({
        epub, diags,
    })
    diags.forEach(diag => {
        console.info(inspect(diag, { depth: 5, colors: true }))
    })
    if (!booq) {
        console.error(`Failed to parse booq for id ${booqId}`)
        return undefined
    }
    const imagesData = await getOrLoadImagesData({
        booqId,
        loadImages: () => loadImages(booq, epub),
    })
    if (!imagesData) {
        return booq
    } else {
        return preprocessBooq(booq, imagesData)
    }
}

export async function parseAndLoadImagesFromFile(file: BooqFile) {
    if (file.kind !== 'epub') {
        return undefined
    }
    const diags: Diagnoser = []
    const epub = await openEpubFile({ fileBuffer: file.file, diags })
    const { value: booq } = await parseEpub({
        epub, diags,
    })
    diags.forEach(diag => {
        console.info(inspect(diag, { depth: 5, colors: true }))
    })
    if (!booq) {
        console.error(`Failed to parse booq for`)
        return undefined
    }
    return loadImages(booq, epub)
}

async function loadImages(booq: Booq, epub: Epub) {
    const srcs = collectUniqueSrcsFromBooq(booq)
    const images: BooqImages = {}
    for (let src of srcs) {
        // TODO: investigate why we need this hack for certain epubs
        if (src.startsWith('../')) {
            src = src.substring('../'.length)
        }
        const image = await epub.loadBinaryFile(src)
        if (image) {
            images[src] = image
        } else {
            console.warn(`Image not found for src: ${src}`)
        }
    }
    return images
}

function collectUniqueSrcsFromBooq(booq: Booq): string[] {
    const srcs = new Set<string>()
    function collectSrcsFromNodes(nodes: BooqNode[]) {
        for (const node of nodes) {
            if (node?.kind === 'element') {
                if (node.attrs?.src) {
                    srcs.add(node.attrs.src)
                }
                if (node.attrs?.xlinkHref) {
                    srcs.add(node.attrs.xlinkHref)
                }
                if (node.children) {
                    collectSrcsFromNodes(node.children)
                }
            }
        }
    }
    collectSrcsFromNodes(booq.nodes)
    if (booq.metadata.coverSrc) {
        srcs.add(booq.metadata.coverSrc)
    }
    return Array.from(srcs)
}

function preprocessBooq(booq: Booq, imagesData: BooqImagesData): Booq {
    const nodes = preprocessNodes(booq.nodes, { imagesData })
    return {
        ...booq,
        nodes,
    }
}

type PreprocessEnv = {
    imagesData: BooqImagesData,
}
function preprocessNodes(nodes: BooqNode[], env: PreprocessEnv): BooqNode[] {
    return nodes.map(node => preprocessNode(node, env))
}

function preprocessNode(node: BooqNode, env: PreprocessEnv): BooqNode {
    switch (node?.kind) {
        case 'element': {
            const result = {
                ...node,
                children: node.children ? node.children.map(child => preprocessNode(child, env)) : [],
            }
            if (result.attrs?.src) {
                const resolved = env.imagesData[result.attrs.src]
                if (resolved) {
                    result.attrs.src = urlForBooqImageId(resolved.id)
                    result.attrs.width = resolved.width.toString()
                    result.attrs.height = resolved.height.toString()
                }
            } else if (result.attrs?.xlinkHref) {
                const resolved = env.imagesData[result.attrs.xlinkHref]
                if (resolved) {
                    result.attrs.xlinkHref = urlForBooqImageId(resolved.id)
                    result.attrs.width = resolved.width.toString()
                    result.attrs.height = resolved.height.toString()
                }
            }
            return result
        }
        case 'text':
        case 'stub':
        case undefined:
            return node
        default:
            return assertNever(node)
    }
}