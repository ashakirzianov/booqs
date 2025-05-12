import { EpubFile } from './epub'
import { BooqMeta, BooqMetaTag } from '../core'
import { Diagnoser, EpubMetadata, EpubMetadataItem } from 'booqs-epub'

export async function buildMeta(epub: EpubFile, diags?: Diagnoser): Promise<BooqMeta> {
    const epubMetadata = await epub.metadata()
    if (!epubMetadata) {
        diags?.push({
            message: 'Missing metadata in epub',
        })
        return {
            title: undefined,
            authors: undefined,
            languages: undefined,
            contributors: undefined,
            description: undefined,
            subjects: undefined,
            rights: undefined,
            tags: [],
            coverSrc: undefined,
        }
    }
    const coverItem = await epub.coverItem()

    const {
        title, creator, language, contributor,
        description, subject, rights,
        identifier,
        ...rest
    } = epubMetadata

    diags = diags ?? []

    const _identifiers = extractIdentifiers(identifier, diags)

    return {
        title: extractTitle(title, diags),
        authors: extractAuthors(creator, diags),
        languages: extractLanguages(language, diags),
        contributors: extractContributors(contributor, diags),
        description: extractDescription(description, diags),
        subjects: extractSubjects(subject, diags),
        rights: extractRights(rights, diags),
        tags: extractTags(rest, diags),
        coverSrc: coverItem?.['@href'],
    }
}

type Records = EpubMetadataItem[] | undefined

function extractIdentifiers(records: Records, diags?: Diagnoser): string[] | undefined {
    if (!records || records.length === 0) {
        diags?.push({
            message: 'Missing identifier in metadata',
        })
        return undefined
    }
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            ignoreAttributes: ['@scheme', '@id'],
            diags,
        }))
        ?.map(r => r['#text'])
}

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

function extractLanguages(records: Records, diags?: Diagnoser): string[] | undefined {
    if (!records || records.length === 0) {
        diags?.push({
            message: 'Missing language in metadata',
        })
        return undefined
    }
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            ignoreAttributes: ['@type'],
            diags,
        }))
        ?.map(r => r['#text'])
}

function extractAuthors(records: Records, diags?: Diagnoser): string[] | undefined {
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            optionalAttributes: ['@file-as', '@role'],
            diags,
        }))
        ?.map(r => r['#text'])
}

function extractContributors(records: Records, diags?: Diagnoser): string[] | undefined {
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            optionalAttributes: ['@file-as', '@role'],
            diags,
        }))
        ?.map(r => r['#text'])
}

function extractDescription(records: Records, diags?: Diagnoser): string | undefined {
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            diags,
        }))
        ?.map(r => r['#text'])
        ?.join('\n')
}

function extractSubjects(records: Records, diags?: Diagnoser): string[] | undefined {
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            diags,
        }))
        ?.map(r => r['#text'])
}

function extractRights(records: Records, diags?: Diagnoser): string | undefined {
    if ((records?.length ?? 0) > 1) {
        diags?.push({
            message: 'Multiple rights found in metadata',
            data: { records },
        })
    }
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            diags,
        }))
        ?.map(r => r['#text']).join(' ')
}

function extractTags(epubMetadata: EpubMetadata, diags?: Diagnoser): BooqMetaTag[] {
    const {
        date,
        cover, // Ignoring this
        ...rest
    } = epubMetadata
    const {
        source, publisher,
        'calibre:timestamp': calibreTimestamp,
        'calibre:title_sort': calibreSeries,
        'calibre:series': calibreTitleSort,
        'calibre:series_index': calibreSeriesIndex,
        ...unexpected
    } = rest
    for (const key of Object.keys(unexpected)) {
        diags?.push({
            message: `Unexpected attribute ${key} in metadata`,
            severity: 'warning',
        })
    }
    const tags = [
        ...extractDates(date, diags),
        ...extractRest(rest, diags),
    ]

    return tags
}

function extractDates(records: Records, diags?: Diagnoser): BooqMetaTag[] {
    return records
        ?.filter(r => validateMetadataRecord(r, {
            expectedAttributes: ['#text'],
            optionalAttributes: ['@event'],
            diags,
        }))
        ?.map(r => r['@event']
            ? [r['@event'], r['#text']]
            : ['date', r['#text']]
        )
        ?? []
}

function extractRest(epubMetadata: EpubMetadata, _diags?: Diagnoser): BooqMetaTag[] {
    const result = Object.entries(epubMetadata)
        .map(([key, value]) => {
            return (value ?? []).map(value => {
                return Object.entries(value ?? {})
                    .map<BooqMetaTag>(([subKey, subValue]) => {
                        if (subKey === '#text') {
                            return [key, subValue]
                        } else {
                            return [`${key}:${subKey}`, subValue]
                        }
                    })
            })
        }).flat(2)
    return result
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