import { Epub } from './epub'
import { BooqAuthor, BooqExtraMetadata, BooqMeta } from '../core'
import { Diagnoser, EpubMetadata, EpubMetadataItem } from 'booqs-epub'

export async function extactBooqMeta(epub: Epub, diags?: Diagnoser): Promise<Omit<BooqMeta, 'length'>> {
    const epubMetadata = await epub.metadata()
    if (!epubMetadata) {
        diags?.push({
            message: 'Missing metadata in epub',
        })
        return {
            uniqueIdentifier: undefined,
            title: 'Untitled',
            authors: [],
            coverSrc: undefined,
            extra: [],
        }
    }
    const coverItem = await epub.coverItem()
    const uniqueIdentifier = await epub.uniqueIdentifier()

    const {
        title, creator,
        ...rest
    } = epubMetadata

    diags = diags ?? []

    return {
        uniqueIdentifier,
        title: extractTitle(title, diags) ?? 'Untitled',
        authors: extractAuthors(creator, diags) ?? [],
        extra: extractExtra(rest, diags),
        coverSrc: coverItem?.['@href'],
    }
}

type Records = EpubMetadataItem[] | undefined

function extractTitle(records: Records, diags?: Diagnoser): string | undefined {
    if (!records || records.length === 0) {
        diags?.push({
            message: 'Missing title in metadata',
        })
        return undefined
    } else if (records.length > 1) {
        diags?.push({
            message: 'Multiple titles found in metadata',
            data: { records },
            severity: 'warning',
        })
    }
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            diags,
        }))
        ?.map(r => r['#text']).join(' ')
}

function extractAuthors(records: Records, diags?: Diagnoser): BooqAuthor[] | undefined {
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            optionalAttributes: ['@file-as', '@role'],
            diags,
        }))
        ?.map(r => ({
            name: r['#text'],
            fileAs: r['@file-as'],
            role: r['@role'],
        }))
}

function extractExtra(epubMetadata: EpubMetadata, _diags?: Diagnoser) {
    const extra: BooqExtraMetadata[] = []
    for (const [name, items] of Object.entries(epubMetadata)) {
        for (const item of items ?? []) {
            const { '#text': value, ...attributes } = item
            extra.push({
                name, value, attributes
            })
        }
    }
    return extra
}

type ExtractedMetadata<Keys extends string, OptKeys extends string> = Record<Keys, string> & Record<OptKeys, string | undefined>
function validateMetadataRecord<Keys extends string, OptKeys extends string>(item: EpubMetadataItem, {
    expectedAttributes, optionalAttributes, ignoreAttributes,
    diags,
}: {
    expectedAttributes: Keys[],
    optionalAttributes?: OptKeys[],
    ignoreAttributes?: string[],
    diags?: Diagnoser,
}): item is ExtractedMetadata<Keys, OptKeys> {
    item = { ...item }
    let allPresent = true
    const result: ExtractedMetadata<Keys, OptKeys> = {} as any
    for (const attr of expectedAttributes) {
        const value = item[attr]
        if (value === undefined) {
            allPresent = false
            diags?.push({
                message: `Missing attribute ${attr}`,
                data: { item },
            })
        } else {
            result[attr] = value as any
            delete item[attr]
        }
    }
    for (const attr of optionalAttributes ?? []) {
        if (item[attr] !== undefined) {
            result[attr] = item[attr] as any
            delete item[attr]
        }
    }
    for (const attr of ignoreAttributes ?? []) {
        if (item[attr] !== undefined) {
            delete item[attr]
        }
    }
    const unexpectedAttributes = Object.keys(item)
    if (unexpectedAttributes.length > 0) {
        diags?.push({
            message: `Unexpected attributes ${unexpectedAttributes.join(', ')}`,
            data: { item },
        })
    }
    if (!allPresent) {
        return false
    }
    return true
}