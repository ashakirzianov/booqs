import { EpubFile } from './epub'
import { BooqMeta, BooqMetaTag } from '../core'
import { Diagnoser, PackageDocument, Unvalidated } from 'booqs-epub'

export async function buildMeta(epub: EpubFile, diags?: Diagnoser): Promise<BooqMeta> {
    const epubMetadata = await epub.metadata()
    const pkgMeta = getMetadata(epubMetadata, diags)
    const result: BooqMeta = {
        title: undefined,
        authors: undefined,
        languages: undefined,
        contributors: undefined,
        description: undefined,
        subjects: undefined,
        rights: undefined,
        tags: undefined,
        coverSrc: undefined,
    }
    const cover = pkgMeta.items.find(i => i.name === 'cover')
    if (cover) {
        result.coverSrc = cover.href
    }
    const titles: string[] = []
    for (let [key, value] of Object.entries(pkgMeta.fields)) {
        if (key.startsWith('@')) {
            continue
        }
        if (!value) {
            continue
        }
        if (!Array.isArray(value)) {
            diags?.push({
                message: `Unexpected metadata for key: ${key}, value: ${value}`,
                severity: 'warning',
            })
            continue
        }
        if (key.startsWith('dc:')) {
            key = key.substring('dc:'.length)
        }
        const texts = value
            .map(v => v['#text'])
            .filter((v): v is string => v !== undefined)
        switch (key) {
            case 'title':
                titles.push(...texts)
                break
            case 'creator':
                if (!result.authors) {
                    result.authors = []
                }
                result.authors.push(...texts)
                break
            case 'contributor':
                if (!result.contributors) {
                    result.contributors = []
                }
                result.contributors.push(...texts)
                break
            case 'language':
                if (!result.languages) {
                    result.languages = []
                }
                result.languages.push(...texts)
                break
            case 'description':
                if (!result.description) {
                    result.description = texts.join(' ,')
                } else {
                    result.description += ', ' + texts.join(', ')
                }
                break
            case 'subject':
                if (!result.subjects) {
                    result.subjects = []
                }
                result.subjects.push(...texts.map(v => v.split(' -- ')).flat())
                break
            case 'rights':
                if (result.rights || texts.length > 1) {
                    diags?.push({
                        message: 'Multiple rights tags found',
                        severity: 'warning',
                    })
                }
                result.rights = result.rights
                    ? result.rights + ' ' + texts.join(' ')
                    : texts.join(' ')
                break
            case 'date': {
                const vals = value
                    .map((v): BooqMetaTag => {
                        const event = v['@opf:event']
                        if (event) {
                            return [event, v['#text'] ?? '']
                        } else {
                            return ['date', v['#text'] ?? '']
                        }
                    })
                if (!result.tags) {
                    result.tags = []
                }
                result.tags.push(...vals)
            }
                break
            default:
                if (!result.tags) {
                    result.tags = []
                }
                result.tags.push([key, texts.join(', ')])

        }
    }
    if (titles.length === 0) {
        diags?.push({
            message: 'No title found',
            severity: 'error',
        })
    }
    result.title = titles.join(', ')
    return result
}

// TODO: rethink and remove this
export type EpubMetadata = {
    fields: Record<string, Array<Record<string, string | undefined>> | undefined>,
    items: Array<{
        name: string,
        href: string,
        id: string,
    }>,
}

function getMetadata(document: Unvalidated<PackageDocument>, diagnoser?: Diagnoser): EpubMetadata {
    const metadata = document.package?.[0]?.metadata?.[0]
    const manifest = document.package?.[0]?.manifest?.[0]?.item
    if (!metadata || !manifest) {
        diagnoser?.push({
            message: 'bad package: no metadata or manifest',
        })
        return {
            fields: {},
            items: [],
        }
    }
    const { meta, ...rest } = metadata
    const fields: EpubMetadata['fields'] = rest
    const items: EpubMetadata['items'] = []
    for (const m of meta ?? []) {
        const record = m as Record<string, string>
        const name = record['@name']
        if (name) {
            const contentId = record['@content']
            if (!contentId) {
                diagnoser?.push({
                    message: 'bad package: meta without content',
                })
                continue
            }
            const manifestItem = manifest.find(i => i['@id'] === contentId)
            if (!manifestItem) {
                fields[name] = [{ '#text': contentId }]
                continue
            }
            const { '@id': id, '@href': href } = manifestItem
            if (!id || !href) {
                diagnoser?.push({
                    message: 'bad package: meta with bad content',
                })
                continue
            }
            items.push({
                name,
                href,
                id,
            })
        }
    }
    return {
        fields,
        items,
    }
}