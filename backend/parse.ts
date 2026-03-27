import { Booq, BooqId, isElementNode, visitNodes, mapNodes } from '@/core'
import { parseEpub } from '@/parser'
import { Epub, openEpubFile } from '@/parser/epub'
import { Diagnoser } from 'booqs-epub'
import { BooqImages, BooqImageDimensions, imageDimensions } from './images'
import { BooqFile } from './library'
import { booqImageUrl } from '@/common/href'

export async function parseAndPreprocessBooq(booqId: BooqId, file: BooqFile): Promise<Booq | undefined> {
    try {
        return await parseAndPreprocessBooqUnsafe(booqId, file)
    } catch (e) {
        console.error(`Error parsing booq ${booqId}:`, e)
        return undefined
    }
}

async function parseAndPreprocessBooqUnsafe(booqId: BooqId, file: BooqFile): Promise<Booq | undefined> {
    if (file.kind !== 'epub') {
        return undefined
    }
    const diags: Diagnoser = []
    const epub = await openEpubFile({ fileBuffer: file.file, diags })
    const { value: booq } = await parseEpub({
        epub, diags,
    })
    if (!booq) {
        console.error(`Failed to parse booq for id ${booqId}`)
        return undefined
    }
    normalizeImageSrcsInBooq(booq)
    const dimensions = await loadImageDimensions(booq, epub)
    return preprocessBooq(booq, booqId, dimensions)
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
    if (!booq) {
        console.error(`Failed to parse booq from file`)
        return undefined
    }
    return loadImages(booq, epub)
}

export async function loadImageDimensions(booq: Booq, epub: Epub): Promise<BooqImageDimensions> {
    const images = await loadImages(booq, epub)
    const entries = Object.entries(images.images)
    const results = await Promise.all(
        entries.map(async ([src, buffer]) => {
            try {
                const metadata = await imageDimensions(buffer)
                if (metadata.width && metadata.height) {
                    return [src, { width: metadata.width, height: metadata.height }] as const
                }
                console.warn(`Missing dimensions for image: ${src}`)
                return null
            } catch (e) {
                console.warn(`Error processing image ${src}:`, e instanceof Error ? e.message : e)
                return null
            }
        })
    )
    const dimensions: BooqImageDimensions = {}
    for (const result of results) {
        if (result) {
            dimensions[result[0]] = result[1]
        }
    }
    return dimensions
}

async function loadImages(booq: Booq, epub: Epub): Promise<BooqImages> {
    const srcs = collectUniqueSrcsFromBooq(booq)
    const images: BooqImages['images'] = {}
    for (const src of srcs) {
        const image = await epub.loadBinaryFile(src)
        if (image) {
            images[src] = image
        } else {
            console.warn(`Image not found for src: ${src}`)
        }
    }
    const coverItem = await epub.coverItem()
    const coverSrc = coverItem?.['@href']
    return {
        images,
        coverSrc,
    }
}

// Epub image srcs are relative to the XHTML file (e.g., "../Images/fig.jpg" from "Text/chapter.xhtml").
// booqs-epub's resolveHref just concatenates basePath + href without resolving "..", so we strip
// the prefix here. This works for the standard epub layout where all content lives under one root
// directory (e.g., OEBPS/). It would break for deeply nested structures where "../" traverses
// multiple levels — but that's uncommon in practice.
function normalizeImageSrc(src: string): string {
    while (src.startsWith('../')) {
        src = src.substring('../'.length)
    }
    return src
}

function normalizeImageSrcsInBooq(booq: Booq): void {
    visitNodes(booq.nodes, node => {
        if (isElementNode(node)) {
            if (node.attrs?.src) {
                node.attrs.src = normalizeImageSrc(node.attrs.src)
            }
            if (node.attrs?.xlinkHref) {
                node.attrs.xlinkHref = normalizeImageSrc(node.attrs.xlinkHref)
            }
        }
    })
    if (booq.metadata.coverSrc) {
        booq.metadata.coverSrc = normalizeImageSrc(booq.metadata.coverSrc)
    }
}

function collectUniqueSrcsFromBooq(booq: Booq): string[] {
    const srcs = new Set<string>()
    visitNodes(booq.nodes, node => {
        if (isElementNode(node)) {
            if (node.attrs?.src) {
                srcs.add(node.attrs.src)
            }
            if (node.attrs?.xlinkHref) {
                srcs.add(node.attrs.xlinkHref)
            }
        }
    })
    if (booq.metadata.coverSrc) {
        srcs.add(booq.metadata.coverSrc)
    }
    return Array.from(srcs)
}

export async function extractSingleImageFromEpub(epubBuffer: Buffer, imagePath: string): Promise<Buffer | undefined> {
    const epub = await openEpubFile({ fileBuffer: epubBuffer })
    return epub.loadBinaryFile(imagePath)
}

function preprocessBooq(booq: Booq, booqId: BooqId, imageDimensions: BooqImageDimensions): Booq {
    const nodes = mapNodes(booq.nodes, node => {
        if (!isElementNode(node)) {
            return node
        }
        if (node.attrs?.src) {
            const resolved = imageDimensions[node.attrs.src]
            if (resolved) {
                return {
                    ...node,
                    attrs: {
                        ...node.attrs,
                        src: booqImageUrl({ booqId, imageId: node.attrs.src }),
                        width: resolved.width.toString(),
                        height: resolved.height.toString(),
                    },
                }
            }
        } else if (node.attrs?.xlinkHref) {
            const resolved = imageDimensions[node.attrs.xlinkHref]
            if (resolved) {
                return {
                    ...node,
                    attrs: {
                        ...node.attrs,
                        xlinkHref: booqImageUrl({ booqId, imageId: node.attrs.xlinkHref }),
                        width: resolved.width.toString(),
                        height: resolved.height.toString(),
                    },
                }
            }
        }
        return node
    })
    return { ...booq, nodes }
}