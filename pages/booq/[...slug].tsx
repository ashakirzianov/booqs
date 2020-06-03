import { GetStaticPaths, GetStaticProps } from "next";
import { pathFromString, rangeFromString, BooqPath, BooqRange } from 'core';
import { fetchBooqFragment, fetchFeatured } from "app";
import { BooqPage, BooqPageProps } from "components/BooqPage";
import { booqHref } from "controls/Links";

type QueryParams = {
    slug: string[],
};
export const getStaticPaths: GetStaticPaths<QueryParams> = async () => {
    const featured = await fetchFeatured();
    const paths = featured.map(
        f => booqHref(f.id, [0]),
    );
    return {
        paths,
        fallback: true,
    };
}

async function buildProps({ booqId, path, quote, preload }: {
    booqId: string,
    path: BooqPath | null,
    quote: BooqRange | null,
    preload: boolean,
}) {
    path = quote?.start ?? path;
    if (preload) {
        const booq = await fetchBooqFragment(booqId, path ?? undefined);
        if (booq) {
            return {
                props: {
                    data: {
                        kind: 'preloaded' as const,
                        booq, path, quote,
                    }
                },
            };
        } else {
            return { props: { data: { kind: 'not-found' as const } } };
        }
    } else {
        return {
            props: {
                data: {
                    kind: 'client-side' as const,
                    booqId, quote, path,
                },
            },
        };
    }
}

export const getStaticProps: GetStaticProps<
    BooqPageProps, QueryParams
> = async ({ params }) => {
    const { slug: [source, id, qualifier, param] } = params ?? { slug: [] };
    if (!source || !id) {
        return { props: { data: { kind: 'not-found' } } };
    }
    const booqId = `${source}/${id}`;
    const preload = source !== 'uu';
    switch (qualifier) {
        case 'path':
            return buildProps({
                booqId,
                path: pathFromString(param) ?? null,
                quote: null,
                preload,
            });
        case 'quote': {
            return buildProps({
                booqId,
                quote: rangeFromString(param) ?? null,
                path: null,
                preload,
            });
        }
        case undefined:
            return buildProps({ booqId, preload, path: null, quote: null });
    }
    return { props: { data: { kind: 'not-found' } } };
};

export default BooqPage;
