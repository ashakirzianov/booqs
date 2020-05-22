import { GetStaticPaths, GetStaticProps } from "next";
import { Booq, fetchBooq, BooqPath, pathFromString } from "../../app";
import { BooqPage } from "../../components/BooqPage";

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

export default function ({ data }: BooqPageProps) {
    return <BooqPage data={data} />;
}
