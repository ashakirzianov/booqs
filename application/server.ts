import { DocumentNode } from 'graphql'

export async function fetchQuery<T = any>({
    query, variables, options,
}: {
    query: DocumentNode,
    variables?: Object,
    options?: {
        cache?: RequestCache,
        headers?: HeadersInit,
    },
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
    try {
        const response = await fetch(
            url,
            {
                ...options,
                method: 'POST',
                body: JSON.stringify({
                    query: query.loc?.source.body,
                    variables,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            }
        )
        if (!response.ok) {
            console.error(response)
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
    } catch (e) {
        console.error(e)
        return {
            success: false,
            error: `${e}`,
        }
    }
}

// NOTE: This is the way to fetch directly from db without going through the graphql server
// import { prepareServer } from '@/server/prepare'
// import { DocumentNode } from 'graphql'

// export async function fetchQuery<T = any>({ query, variables }: {
//     query: DocumentNode,
//     variables?: Object,
// }): Promise<{
//     success: true,
//     data: T,
// } | {
//     success: false,
//     error: string,
// }> {
//     let server = await prepareServer()
//     let res = await server.executeOperation({
//         query, variables,
//     })
//     if (res.body.kind !== 'single') {
//         return {
//             success: false,
//             error: `Unexpected response kind: ${res.body.kind}`,
//         }
//     }
//     if (res.body.singleResult.errors) {
//         return {
//             success: false,
//             error: res.body.singleResult.errors.map(e => e.message).join('\n'),
//         }
//     }
//     return {
//         success: true,
//         data: filterNonSerializable(res.body.singleResult.data) as T,
//     }
// }

// function filterNonSerializable(obj: object | null | undefined): object | null {
//     if (!obj) {
//         return null
//     }
//     return JSON.parse(JSON.stringify(obj, (key, value) => {
//         if (typeof value === 'function' || value === undefined) {
//             return undefined
//         }
//         return value
//     }))
// }
