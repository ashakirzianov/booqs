import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { Page } from "../../components/Page";
import { useBooq, Booq, fetchBooq } from "../../app";
import { Spinner } from "../../controls/Spinner";

type PageData = {
    kind: 'preloaded',
    booq: Booq,
} | {
    kind: 'not-found',
};
type BooqPageProps = {
    data?: PageData,
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
    const { path } = params;
    const booqId = path.join('/');
    const booq = await fetchBooq(booqId);
    if (booq) {
        return { props: { data: { kind: 'preloaded', booq } } };
    } else {
        return { props: { data: { kind: 'not-found' } } };
    }
};

export default function BooqPage({ data }: BooqPageProps) {
    if (!data) {
        return <Spinner />;
    } else if (data.kind === 'preloaded') {
        const booq = data.booq;
        return <Page title={booq?.title ?? 'Booq'}>
            <span>{JSON.stringify(booq)}</span>
        </Page>;
    } else {
        return <Page title='Booq not found'>
            <span>Not found</span>
        </Page>;
    }
}
