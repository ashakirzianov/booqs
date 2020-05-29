import { GetStaticPaths, GetStaticProps } from "next";
import { pathFromString, rangeFromString } from 'core';
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
                    return {
                        props: { data: { kind: 'preloaded', booq } },
                    };
                }
            } else {
                const path = pathFromString(param);
                if (path) {
                    return {
                        props: { data: { kind: 'client-side', booqId, path } },
                    };
                }
            }
            break;
        }
        case 'quote': {
            const quote = rangeFromString(param);
            if (quote) {
                const booq = await fetchBooqFragment(booqId, quote.start);
                if (booq) {
                    const path = quote.start.slice(0, quote.start.length - 1);
                    return {
                        props: {
                            data: {
                                kind: 'preloaded', path, booq, quote,
                            },
                        },
                    };
                }
            }
            break;
        }
        case undefined: {
            const booq = await fetchBooqFragment(booqId);
            if (booq) {
                return {
                    props: { data: { kind: 'preloaded', booq } },
                };
            }
            break;
        }
    }
    return { props: { data: { kind: 'not-found' } } };
};

export default BooqPage;
