import { BooqExtraMetadata } from './model'

export function getExtraMetadataValues(
    name: string,
    extra: BooqExtraMetadata[],
): string[] {
    return extra
        .map((extra) => extra.name === name ? extra.value : undefined)
        .filter((v) => v !== undefined)
}