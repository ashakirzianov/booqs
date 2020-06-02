import React, { ReactNode } from 'react';
import Link from 'next/link';
import { BooqPath, pathToString, BooqRange, rangeToString } from 'core';

export function BooqLink({ booqId, path, children }: {
    booqId: string,
    path?: BooqPath,
    children: ReactNode,
}) {
    return <>
        <Link href='/booq/[...slug]' as={booqHref(booqId, path)}>
            <a>{children}</a>
        </Link>
        <style jsx>{`
            a {
                text-decoration: none;
                color: inherit;
            }
            `}</style>
    </>;
}

export function FeedLink({ children }: {
    children: ReactNode,
}) {
    return <Link href='/'>
        <a>{children}</a>
    </Link>;
}

export function booqHref(booqId: string, path?: BooqPath) {
    return path?.length
        ? `/booq/${booqId}/path/${pathToString(path)}`
        : `/booq/${booqId}`;
}

export function quoteRef(booqId: string, range: BooqRange) {
    return `/booq/${booqId}/quote/${rangeToString(range)}`;
}

export function feedHref() {
    return '/';
}