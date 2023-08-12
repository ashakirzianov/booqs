import gql from 'graphql-tag'
import { BooqNode, BooqPath } from '@/core'
import { fetchQuery } from '@/application/server'

// TODO: decompose this file

export async function fetchMeServer(cookies: Array<{
    name: string,
    value: string,
}>) {
    const MeQuery = gql`query Me {
        me {
            username
            name
            pictureUrl
            joined
        }
    }`
    type MeData = {
        me: {
            username: string,
            joined: string,
            name?: string,
            pictureUrl?: string,
        },
    };

    let cookie = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    const result = await fetchQuery<MeData>({
        query: MeQuery,
        options: {
            headers: {
                'Cookie': cookie,
            },
            cache: 'no-cache',
        }
    })
    console.log(result)
    return result.success
        ? result.data?.me
        : undefined
}

export async function fetchFeaturedServer() {
    const FeaturedQuery = gql`query Featured {
        featured(limit: 10) {
            id
            title
            author
            cover(size: 210)
            tags {
                tag
                value
            }
        }
    }`
    type FeaturedData = {
        featured: {
            id: string,
            title?: string,
            author?: string,
            cover?: string,
            tags: {
                tag: string,
                value?: string,
            }[],
        }[],
    };

    const result = await fetchQuery<FeaturedData>({
        query: FeaturedQuery,
    })
    const featured = result.success
        ? result.data?.featured ?? []
        : []
    return featured
        .filter(f => f !== null && f !== undefined)
}

export type BooqData = Exclude<Awaited<ReturnType<typeof fetchBooqFragmentServer>>, undefined>
export async function fetchBooqFragmentServer(id: string, path?: BooqPath) {
    const BooqFragmentQuery = gql`query BooqFragment($id: ID!, $path: [Int!]) {
        booq(id: $id) {
            id
            title
            author
            language
            length
            preview(path: $path)
            fragment(path: $path) {
                nodes
                previous {
                    title
                    path
                }
                current {
                    path
                }
                next {
                    title
                    path
                }
            }
        }
    }`
    type BooqFragmentData = {
        booq: {
            id: string,
            title?: string,
            author?: string,
            language?: string,
            length: number,
            preview: string,
            fragment: {
                nodes: BooqNode[],
                previous?: BooqAnchor,
                current: BooqAnchor,
                next?: BooqAnchor,
            }
        },
    };
    type BooqAnchor = {
        title?: string,
        path: BooqPath,
    };
    type BooqData = BooqFragmentData['booq'];
    try {
        const result = await fetchQuery<BooqFragmentData>({
            query: BooqFragmentQuery,
            variables: {
                id, path,
            },
        })
        if (result.success) {
            return result.data.booq
        } else {
            console.error(result.error)
            return undefined
        }
    } catch (e) {
        console.error(e)
        return undefined
    }
}
