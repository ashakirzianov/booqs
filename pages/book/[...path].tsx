import { GetStaticPaths, GetStaticProps } from "next";
import { Page } from "../../components/Page";
import { useBooq, Booq, fetchBooq, BooqPath, pathFromString } from "../../app";
import { Spinner } from "../../controls/Spinner";
import { BooqScreen } from "../../components/Booq";

type PageData = {
    kind: 'preloaded',
    booq: Booq,
} | {
    kind: 'client-side',
    booqId: string,
    path: BooqPath,
} | {
    kind: 'not-found',
};
type BooqPageProps = {
    data: PageData,
};
type QueryParams = {
    path: string[],
};
export const getStaticPaths: GetStaticPaths<QueryParams> = async () => {
    return {
        paths: [],
        fallback: true,
    };
}

export const getStaticProps: GetStaticProps<
    BooqPageProps, QueryParams
> = async ({ params }) => {
    if (!params) {
        return { props: { data: { kind: 'not-found' } } };
    }
    const { path: [source, id, qualifier, parameter, ...rest] } = params;
    if (rest.length || !id || !source) {
        return { props: { data: { kind: 'not-found' } } };
    }

    const booqId = `${source}/${id}`;
    if (qualifier === undefined || (qualifier === 'path' && parameter === '0')) {
        const booq = await fetchBooq(booqId);
        if (booq) {
            return { props: { data: { kind: 'preloaded', booq } } };
        }
    } else if (qualifier === 'path') {
        const path = parameter ? pathFromString(parameter) : undefined;
        if (path) {
            return { props: { data: { kind: 'client-side', booqId, path } } }
        }
    }
    return { props: { data: { kind: 'not-found' } } };
};

export default function BooqPage({ data }: BooqPageProps) {
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
    console.log(booqId, path);
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
