import React, { ReactNode } from 'react'
import Link from 'next/link'
import { BooqPath, pathToString, BooqRange, rangeToString } from 'core'
import { pathToId } from 'app'

export function BooqLink({ booqId, path, children }: {
    booqId: string,
    path?: BooqPath,
    children: ReactNode,
}) {
    return <Link href='/booq/[...slug]' as={booqHref(booqId, path)} style={{
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

export function booqHref(booqId: string, path?: BooqPath) {
    return path?.length
        ? `/booq/${booqId}/path/${pathToString(path)}#${pathToId(path)}`
        : `/booq/${booqId}`
}

export function quoteRef(booqId: string, range: BooqRange) {
    return `/booq/${booqId}/quote/${rangeToString(range)}`
}

export function feedHref() {
    return '/'
}