import { EpubPackage } from './epub'
import { BooqMeta, BooqMetaTag } from '../core'
import { Diagnoser } from 'booqs-epub'

export function buildMeta(epub: EpubPackage, diags?: Diagnoser): BooqMeta {
    const pkgMeta = epub.metadata
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