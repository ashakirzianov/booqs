import { READING_LIST_COLLECTION } from '@/application/collections'
import { fetchQuery } from '@/application/server'
import { BooqCollection } from '@/components/BooqCollection'
import { gql } from '@apollo/client'
import { cookies } from 'next/headers'

export const revalidate = 1
export const dynamic = 'force-dynamic'

export default async function MyBooqs() {
    console.log('COOKIES', cookies().getAll())
    console.log('DYNAMIC', dynamic)
    console.log('COLLECTIONS')
    let readingList = await fetchCollection(READING_LIST_COLLECTION)
    let uploads = await fetchCollection('uploads')
    return <>
        <BooqCollection
            title='Uploads'
            cards={uploads}
        />
        <BooqCollection
            title='My Booqs'
            cards={readingList}
            collection={READING_LIST_COLLECTION}
        />
    </>
}

async function fetchCollection(collection: string) {
    const CollectionQuery = gql`query Collection($name: String!) {
        collection(name: $name) {
            booqs {
                id
                title
                cover
                tags {
                    tag
                    value
                }
            }
        }
    }`
    type CollectionData = {
        collection: {
            booqs: {
                id: string,
                title: string,
                cover?: string,
                tags: Array<{
                    tag: string,
                    value?: string,
                }>,
            }[],
        }
    };
    type CollectionVars = {
        name: string,
    }

    console.log('COOKIES', cookies().getAll())
    const result = await fetchQuery<CollectionData, CollectionVars>({
        query: CollectionQuery,
        variables: { name: collection },
        cookies: cookies().getAll(),
        options: {
            cache: 'no-store',
            headers: {
                'booqs-operation': `collection:${collection}`,
                'booqs-version': '1.0',
            },
        },
    })
    return result.success ? result.data.collection.booqs : []
}