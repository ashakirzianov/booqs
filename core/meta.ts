import { BooqMetaTag, BooqMetaTagValue } from './model'

export function getValuesForTag(
    tag: string,
    tags: BooqMetaTag[],
): BooqMetaTagValue[] {
    return tags
        .map(([name, value]) => name === tag ? value : undefined)
        .filter((v) => v !== undefined)
}