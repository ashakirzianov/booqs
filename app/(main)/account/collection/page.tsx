import { READING_LIST_COLLECTION } from '@/application/collections'
import { fetchQuery } from '@/application/server'
import { BooqCollection } from '@/components/BooqCollection'
import { gql } from '@apollo/client'
import { cookies } from 'next/headers'

export default async function MyBooqs() {
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

    const result = await fetchQuery<CollectionData, CollectionVars>({
        query: CollectionQuery,
        variables: { name: collection },
        cookies: [
            ...cookies().getAll(),
            { name: 'booqs-test', value: '2023' },
        ],
        options: {
            cache: 'no-store',
        },
    })
    return result.success ? result.data.collection.booqs : []
}