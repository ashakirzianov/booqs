import React, { ReactNode } from 'react'
import Link from 'next/link'
import { BooqPath, pathToString, BooqRange, rangeToString, pathToId } from '@/core'

// TODO: remove this
export function BooqLink({ booqId, path, children }: {
    booqId: string,
    path?: BooqPath,
    children: ReactNode,
}) {
    return <Link href={booqHref(booqId, path)} style={{
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

export function quoteHref(booqId: string, range: BooqRange) {
    return `/booq/${booqId}/quote/${rangeToString(range)}#${pathToId(range.start)}`
}

export function feedHref() {
    return '/'
}

export function signInHref() {
    return '/signin'
}

export function accountHref() {
    return '/account'
}

export function myBooqsHref() {
    return `/account/collection`
}

export function authorHref(name: string) {
    return `/author/${encodeURIComponent(name)}`
}