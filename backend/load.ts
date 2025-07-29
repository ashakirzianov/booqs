import { assertNever, Booq, BooqId, BooqNode } from '@/core'
import { parseEpub } from '@/parser'
import { Epub, openEpubFile } from '@/parser/epub'
import { Diagnoser } from 'booqs-epub'
import { inspect } from 'util'
import { fileForId } from './pg'
import { getImagesDataForBooq, Images, ImagesData, uploadImagesForBooq } from './images'

export async function loadBooqForId(booqId: BooqId) {
    const file = await fileForId(booqId)
    if (!file || file.kind !== 'epub') {
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
    let imagesData = await getImagesDataForBooq({ booqId })
    if (!imagesData) {
        const images = await loadImages(booq, epub)
        imagesData = await uploadImagesForBooq({
            booqId,
            coverSrc: booq.metadata.coverSrc,
            images,
        })
    }
    const nodes = preprocessNodes(booq.nodes, { imagesData })
    return {
        ...booq,
        nodes,
    }
}

async function loadImages(booq: Booq, epub: Epub) {
    const srcs = collectUniqueSrcsFromBooq(booq)
    const images: Images = {}
    for (const src of srcs) {
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
                if (node.children) {
                    collectSrcsFromNodes(node.children)
                }
            }
        }
    }
    collectSrcsFromNodes(booq.nodes)
    return Array.from(srcs)
}

type PreprocessEnv = {
    imagesData: ImagesData,
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
                    result.attrs.src = resolved.url
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