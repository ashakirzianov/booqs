import { GetStaticPaths, GetStaticProps } from "next";
import { pathFromString } from "app";
import { BooqPage, BooqPageProps } from "components/BooqPage";

type QueryParams = {
    source: string,
    id: string,
    path: string,
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
    const { source, id, path } = params ?? {};
    const booqPath = path ? pathFromString(path) : undefined;
    if (!booqPath || !source || !id) {
        return { props: { data: { kind: 'not-found' } } };
    }
    const booqId = `${source}/${id}`;
    return { props: { data: { kind: 'client-side', booqId, path: booqPath } } };
};

export default BooqPage;
