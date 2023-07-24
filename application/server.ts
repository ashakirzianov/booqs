import { DocumentNode } from 'graphql'

export async function fetchQuery<T = any>({ query, variables }: {
    query: DocumentNode,
    variables?: Object,
}): Promise<{ data: T }> {
    const url = process.env.NEXT_PUBLIC_BACKEND
    if (url === undefined)
        throw new Error('NEXT_PUBLIC_BACKEND is undefined')
    const response = await fetch(
        url,
        {
            method: 'POST',
            body: JSON.stringify({
                query: query.loc?.source.body,
                variables,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
    const data = await response.json()
    return data
}