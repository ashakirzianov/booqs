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

function LoadedBooqPage({ booq }: {
    booq: BooqData,
    path?: BooqPath,
}) {
    useHashNavigation();
    return <Page title={booq?.title ?? 'Booq'}>
        <BooqScreen booq={booq} />
    </Page>;
}

function useHashNavigation() {
    const { replace, asPath, query } = useRouter();
    useEffect(() => {
        let navigateTo: BooqPath | undefined = undefined
        if (typeof query.p === 'string') {
            navigateTo = pathFromString(query.p);
        } else {
            const components = asPath.split('/');
            const qualifier = components[components.length - 2];
            const path = components[components.length - 1];
            if (qualifier === 'path') {
                navigateTo = pathFromString(path);
            }
        }
        if (navigateTo) {
            const [withoutHash] = asPath.split('#');
            const withHash = `${withoutHash}#${pathToId(navigateTo)}`;
            replace(withHash, undefined, { shallow: true });
        }
    }, []);
}
