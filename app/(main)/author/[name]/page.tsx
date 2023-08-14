import { fetchQuery } from '@/application/server'
import { BooqCard } from '@/components/BooqCard'
import { gql } from '@apollo/client'

export default async function Author({
    params: { name },
}: {
    params: { name: string },
}) {
    let decoded = decodeURIComponent(name)
    let booqs = await fetchBooqsForAuthor(decoded)
    return (
        <div className='flex flex-row justify-center'>
            <div className='flex flex-col items-center w-panel gap-1'>
                <h1 className='font-bold p-4 text-2xl'>Books by {decoded}</h1>
                <ul>
                    {booqs.map(booq => (
                        <li key={booq.id}>
                            <BooqCard card={booq} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

async function fetchBooqsForAuthor(name: string) {
    const AuthorQuery = gql`query Author($name: String!) {
        author(name: $name) {
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
    type AuthorData = {
        author: {
            booqs: {
                id: string,
                title?: string,
                cover?: string,
                tags: Array<{
                    tag: string,
                    value?: string,
                }>,
            }[],
        }
    };
    type AuthorVars = {
        name: string,
    }

    const result = await fetchQuery<AuthorData, AuthorVars>({
        query: AuthorQuery,
        variables: { name },
    })
    return result.success ? result.data.author.booqs : []
}