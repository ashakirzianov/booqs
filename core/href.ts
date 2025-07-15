import { BooqPath, pathToString, BooqRange, pathToId, BooqId } from '@/core'

export function booqHref({ booqId, path }: {
    booqId: BooqId,
    path?: BooqPath,
}) {
    return path?.length
        ? `/booq/${booqId}/${pathToString(path)}#${pathToId(path)}`
        : `/booq/${booqId}`
}

export function quoteHref({ id, range }: {
    id: string,
    range: BooqRange,
}) {
    return `/booq/${id}/${pathToString(range.start)}/?start=${pathToString(range.start)}&end=${pathToString(range.end)}#${pathToId(range.start)}`
}

export function feedHref() {
    return '/'
}

export function searchHref({ query }: {
    query: string,
}) {
    return `/search?query=${encodeURIComponent(query)}`
}

export function authHref({ returnTo }: {
    returnTo?: string,
}) {
    return `/auth${returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : ''}`
}

export function accountHref() {
    return '/account'
}

export function myBooqsHref() {
    return `/account/collection`
}

export function authorHref({ name }: { name: string }) {
    return `/author/${encodeURIComponent(name)}`
}