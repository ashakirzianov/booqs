import { GetStaticPaths, GetStaticProps } from "next";
import { fetchBooqFragment } from "app";
import { BooqPage, BooqPageProps } from "components/BooqPage";

type QueryParams = {
    source: string,
    id: string,
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
    const { source, id } = params;
    const booqId = `${source}/${id}`;
    const booq = await fetchBooqFragment(booqId);
    if (booq) {
        return { props: { data: { kind: 'preloaded', booq } } };
    } else {
        return { props: { data: { kind: 'not-found' } } };
    }
};

export default BooqPage;
