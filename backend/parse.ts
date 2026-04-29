import { Booq, BooqId, isElementNode, visitNodes, mapDocumentNodes } from '@/core'
import { parseEpub } from '@/parser'
import { Epub, openEpubFile } from '@/parser/epub'
import { resolveHref } from '@/parser/href'
import { Diagnoser, Diagnostic } from 'booqs-epub'
import { BooqImages, BooqImageDimensions, imageDimensions } from './images'
import { BooqFile } from './library'
import { booqImageUrl } from '@/common/href'

export type ParseResult = {
    booq: Booq | undefined,
    diags: Diagnostic[],
}

export async function parseAndPreprocessBooq(booqId: BooqId, file: BooqFile): Promise<ParseResult> {
    try {
        return await parseAndPreprocessBooqUnsafe(booqId, file)
    } catch (e) {
        console.error(`Error parsing booq ${booqId}:`, e)
        return { booq: undefined, diags: [{ message: e instanceof Error ? e.message : String(e) }] }
    }
}

async function parseAndPreprocessBooqUnsafe(booqId: BooqId, file: BooqFile): Promise<ParseResult> {
    if (file.kind !== 'epub') {
        return { booq: undefined, diags: [{ message: 'Unsupported file kind' }] }
    }
    const diags: Diagnoser = []
    const epub = await openEpubFile({ fileBuffer: file.file, diags })
    const { value: booq } = await parseEpub({
        epub, diags,
    })
    if (!booq) {
        console.error(`Failed to parse booq for id ${booqId}`)
        return { booq: undefined, diags }
    }
    normalizeImageSrcsInBooq(booq)
    const dimensions = await loadImageDimensions(booq, epub)
    return { booq: preprocessBooq(booq, booqId, dimensions), diags }
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

// Resolve image srcs relative to each document's fileName using resolveHref.
function normalizeImageSrcsInBooq(booq: Booq): void {
    for (const doc of booq.content) {
        visitNodes(doc.children, node => {
            if (isElementNode(node)) {
                if (node.attributes?.src) {
                    const resolved = resolveHref(node.attributes.src, doc.fileName)
                    if (resolved) {
                        node.attributes.src = resolved.fileName
                    }
                }
                if (node.attributes?.['xlink:href']) {
                    const resolved = resolveHref(node.attributes['xlink:href'], doc.fileName)
                    if (resolved) {
                        node.attributes['xlink:href'] = resolved.fileName
                    }
                }
            }
        })
    }
    if (booq.metadata.coverSrc) {
        const resolved = resolveHref(booq.metadata.coverSrc, '')
        if (resolved) {
            booq.metadata.coverSrc = resolved.fileName
        }
    }
}

function collectUniqueSrcsFromBooq(booq: Booq): string[] {
    const srcs = new Set<string>()
    visitNodes(booq.content, node => {
        if (isElementNode(node)) {
            if (node.attributes?.src) {
                srcs.add(node.attributes.src)
            }
            if (node.attributes?.['xlink:href']) {
                srcs.add(node.attributes['xlink:href'])
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

export type EpubImageLoader = {
    srcs: string[],
    loadImage: (src: string) => Promise<Buffer | undefined>,
}

export async function openEpubImageLoader(file: BooqFile): Promise<EpubImageLoader | undefined> {
    if (file.kind !== 'epub') {
        return undefined
    }
    const diags: Diagnoser = []
    const epub = await openEpubFile({ fileBuffer: file.file, diags })
    const { value: booq } = await parseEpub({ epub, diags })
    if (!booq) {
        return undefined
    }
    normalizeImageSrcsInBooq(booq)
    const srcs = collectUniqueSrcsFromBooq(booq)
    return {
        srcs,
        loadImage: (src) => epub.loadBinaryFile(src),
    }
}

function preprocessBooq(booq: Booq, booqId: BooqId, imageDimensions: BooqImageDimensions): Booq {
    const documents = mapDocumentNodes(booq.content, node => {
        if (!isElementNode(node)) {
            return node
        }
        if (node.attributes?.src) {
            const resolved = imageDimensions[node.attributes.src]
            if (resolved) {
                return {
                    ...node,
                    attributes: {
                        ...node.attributes,
                        src: booqImageUrl({ booqId, imageId: node.attributes.src }),
                        width: resolved.width.toString(),
                        height: resolved.height.toString(),
                    },
                }
            }
        } else if (node.attributes?.['xlink:href']) {
            const xlinkHref = node.attributes['xlink:href']
            const resolved = imageDimensions[xlinkHref]
            if (resolved) {
                return {
                    ...node,
                    attributes: {
                        ...node.attributes,
                        'xlink:href': booqImageUrl({ booqId, imageId: xlinkHref }),
                        width: resolved.width.toString(),
                        height: resolved.height.toString(),
                    },
                }
            }
        }
        return node
    })
    return { ...booq, content: documents }
}
