import { Page } from "./Page";
import { useBooq, Booq, BooqPath } from "../app";
import { Spinner } from "../controls/Spinner";
import { BooqScreen } from "./BooqScreen";

type PageData = {
    kind: 'preloaded',
    booq: Booq,
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

    return <LoadedBooqPage booq={booq} />;
}

function LoadedBooqPage({ booq }: {
    booq: Booq,
}) {
    return <Page title={booq?.title ?? 'Booq'}>
        <BooqScreen booq={booq} />
    </Page>;
}
