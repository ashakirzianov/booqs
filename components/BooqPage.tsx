import { useEffect } from "react";
import { useRouter } from "next/router";
import { useBooq, BooqData, pathToId } from "app";
import { BooqPath, BooqRange } from 'core';
import { Spinner } from "../controls/Spinner";
import { Page } from "./Page";
import { BooqScreen } from "./BooqScreen";

type PageData = {
    kind: 'preloaded',
    booq: BooqData,
    path?: BooqPath,
    quote?: BooqRange,
} | {
    kind: 'client-side',
    booqId: string,
    path: BooqPath,
    quote?: BooqRange,
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
                booq={data.booq} path={data.path} quote={data.quote}
            />;
        case 'client-side':
            return <ClientSidePage
                booqId={data.booqId} path={data.path} quote={data.quote}
            />;
        case 'not-found':
            return <NotFoundPage />;
        default:
            return <LoadingPage />;
    }
}

function LoadingPage() {
    return <Page title='Loading...'>
        <Spinner />
    </Page>;
}

function NotFoundPage() {
    return <Page title='Booq not found'>
        <span>Not found</span>
    </Page>;
}

function ClientSidePage({ booqId, path, quote }: {
    booqId: string,
    path?: BooqPath,
    quote?: BooqRange,
}) {
    const { loading, booq } = useBooq(booqId, path);
    if (loading) {
        return <LoadingPage />;
    } else if (!booq) {
        return <NotFoundPage />;
    }

    return <LoadedBooqPage booq={booq} path={path} quote={quote} />;
}

function LoadedBooqPage({ booq, path }: {
    booq: BooqData,
    path?: BooqPath,
    quote?: BooqRange,
}) {
    usePathNavigation(path);
    return <Page title={booq?.title ?? 'Booq'}>
        <BooqScreen booq={booq} />
    </Page>;
}

function usePathNavigation(path?: BooqPath) {
    const { replace, asPath } = useRouter();
    useEffect(() => {
        if (path) {
            const [withoutHash] = asPath.split('#');
            const withHash = `${withoutHash}#${pathToId(path)}`;
            replace(withHash, undefined, { shallow: true });
        }
    }, []);
}
