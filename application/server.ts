import { DocumentNode } from 'graphql'

export async function fetchQuery<T = any>({ query, variables }: {
    query: DocumentNode,
    variables?: Object,
}): Promise<{
    success: true,
    data: T,
} | {
    success: false,
    error: string,
}> {
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
    if (!response.ok) {
        return {
            success: false,
            error: `${response.status}: ${response.statusText}`,
        }
    }
    const data = await response.json()
    return {
        success: true,
        data: data.data,
    }
}