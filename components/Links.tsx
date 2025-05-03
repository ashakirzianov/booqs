import React, { ReactNode } from 'react'
import Link from 'next/link'
import { BooqPath, pathToString, BooqRange, rangeToString, pathToId } from '@/core'

// TODO: remove this
export function BooqLink({ booqId, path, children }: {
    booqId: string,
    path?: BooqPath,
    children: ReactNode,
}) {
    return <Link href={booqHref({ id: booqId, path })} style={{
        textDecoration: 'none',
        color: 'inherit',
    }}>
        {children}
    </Link>
}

export function FeedLink({ children }: {
    children: ReactNode,
}) {
    return <Link href='/'>
        {children}
    </Link>
}

export function booqHref({ id, path }: {
    id: string,
    path?: BooqPath,
}) {
    return path?.length
        ? `/booq/${id}/path/${pathToString(path)}#${pathToId(path)}`
        : `/booq/${id}`
}

export function quoteHref({ id, range }: {
    id: string,
    range: BooqRange,
}) {
    return `/booq/${id}/quote/${rangeToString(range)}#${pathToId(range.start)}`
}

export function feedHref() {
    return '/'
}

export function searchHref({ query }: {
    query: string,
}) {
    return `/search?query=${encodeURIComponent(query)}`
}

export function signInHref({ returnTo }: {
    returnTo?: string,
}) {
    return `/signin${returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : ''}`
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