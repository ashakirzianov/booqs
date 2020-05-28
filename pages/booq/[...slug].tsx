import { GetStaticPaths, GetStaticProps } from "next";
import { pathFromString } from 'core';
import { fetchBooqFragment } from "app";
import { BooqPage, BooqPageProps } from "components/BooqPage";

type QueryParams = {
    slug: string[],
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
    const { slug: [source, id, qualifier, param] } = params ?? { slug: [] };
    if (!source || !id) {
        return { props: { data: { kind: 'not-found' } } };
    }
    const booqId = `${source}/${id}`;
    switch (qualifier) {
        case 'path': {
            if (param === '0') {
                const booq = await fetchBooqFragment(booqId, [0]);
                if (booq) {
                    return { props: { data: { kind: 'preloaded', booq } } };
                } else {
                    return { props: { data: { kind: 'not-found' } } };
                }
            }
            const path = pathFromString(param);
            return path
                ? { props: { data: { kind: 'client-side', booqId, path } } }
                : { props: { data: { kind: 'not-found' } } };
        }
        case undefined: {
            const booq = await fetchBooqFragment(booqId);
            if (booq) {
                return { props: { data: { kind: 'preloaded', booq } } };
            } else {
                return { props: { data: { kind: 'not-found' } } };
            }
        }
        default:
            return { props: { data: { kind: 'not-found' } } };
    }
};

export default BooqPage;
