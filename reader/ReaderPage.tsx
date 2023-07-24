import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useBooq, BooqData, pathToId } from '@/application'
import { BooqPath, BooqRange } from '@/core'
import { Page } from '@/components/Page'
import { Reader, LoadingBooqScreen } from './Reader'

type PageData = {
    kind: 'preloaded',
    booq: BooqData,
    path: BooqPath | null,
    quote: BooqRange | null,
} | {
    kind: 'client-side',
    booqId: string,
    path: BooqPath | null,
    quote: BooqRange | null,
} | {
    kind: 'not-found',
};
export type BooqPageProps = {
    data: PageData,
};

export function BooqPage({ data }: BooqPageProps) {
    switch (data?.kind) {
        case 'preloaded':
            return <LoadedBooqPage
                booq={data.booq}
                path={data.path ?? undefined}
                quote={data.quote ?? undefined}
            />
        case 'client-side':
            return <ClientSidePage
                booqId={data.booqId}
                path={data.path ?? undefined}
                quote={data.quote ?? undefined}
            />
        case 'not-found':
            return <NotFoundPage />
        default:
            return <LoadingPage />
    }
}

function LoadingPage() {
    return <Page title='Loading...'>
        <LoadingBooqScreen />
    </Page>
}

function NotFoundPage() {
    return <Page title='Booq not found'>
        <span>Not found</span>
    </Page>
}

function ClientSidePage({ booqId, path, quote }: {
    booqId: string,
    path?: BooqPath,
    quote?: BooqRange,
}) {
    const { loading, booq } = useBooq(booqId, path)
    if (loading) {
        return <LoadingBooqScreen />
    } else if (!booq) {
        return <NotFoundPage />
    }

    return <LoadedBooqPage booq={booq} path={path} quote={quote} />
}

function LoadedBooqPage({ booq, path, quote }: {
    booq: BooqData,
    path?: BooqPath,
    quote?: BooqRange,
}) {
    usePathNavigation(path)
    return <Page title={booq?.title ?? 'Booq'}>
        <Reader booq={booq} quote={quote} />
    </Page>
}

function usePathNavigation(path?: BooqPath) {
    const { replace } = useRouter()
    const withoutHash = usePathname()
    const withHash = path && withoutHash
        ? `${withoutHash}#${pathToId(path)}`
        : undefined
    useEffect(() => {
        if (withHash) {
            setTimeout(() => {
                replace(withHash, { scroll: true })
            })
        }
    }, [withHash, replace])
}
