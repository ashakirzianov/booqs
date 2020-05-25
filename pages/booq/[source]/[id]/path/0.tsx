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
    const { source, id } = params ?? {};
    if (!source || !id) {
        return { props: { data: { kind: 'not-found' } } };
    }
    const booqId = `${source}/${id}`;
    const booqPath = [0];
    const booq = await fetchBooqFragment(booqId, booqPath);
    if (booq) {
        return { props: { data: { kind: 'preloaded', booq, path: booqPath } } };
    } else {
        return { props: { data: { kind: 'not-found' } } };
    }
};

export default BooqPage;
