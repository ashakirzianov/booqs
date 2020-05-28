import { Page } from "./Page";
import { useBooq, BooqData, BooqPath, pathToId, pathFromString } from "../app";
import { Spinner } from "../controls/Spinner";
import { BooqScreen } from "./BooqScreen";
import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";

type PageData = {
    kind: 'preloaded',
    booq: BooqData,
    path?: BooqPath,
} | {
    kind: 'client-side',
    booqId: string,
    path: BooqPath,
} | {
    kind: 'not-found',
};
export type BooqPageProps = {
    data: PageData,
};

export function BooqPage({ data }: BooqPageProps) {
    switch (data?.kind) {
        case 'preloaded':
            return <LoadedBooqPage booq={data.booq} />;
        case 'client-side':
            return <ClientSidePage booqId={data.booqId} path={data.path} />;
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

function ClientSidePage({ booqId, path }: {
    booqId: string,
    path?: BooqPath,
}) {
    const { loading, booq } = useBooq(booqId, path);
    if (loading) {
        return <LoadingPage />;
    } else if (!booq) {
        return <NotFoundPage />;
    }

    return <LoadedBooqPage booq={booq} path={path} />;
}

function LoadedBooqPage({ booq, path }: {
    booq: BooqData,
    path?: BooqPath,
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
