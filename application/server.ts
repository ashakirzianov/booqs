import { prepareServer } from '@/server/prepare'
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
    let server = await prepareServer()
    let res = await server.executeOperation({
        query, variables,
    })
    if (res.body.kind !== 'single') {
        return {
            success: false,
            error: `Unexpected response kind: ${res.body.kind}`,
        }
    }
    if (res.body.singleResult.errors) {
        return {
            success: false,
            error: res.body.singleResult.errors.map(e => e.message).join('\n'),
        }
    }
    return {
        success: true,
        data: filterNonSerializable(res.body.singleResult.data) as T,
    }
}

function filterNonSerializable(obj: object | null | undefined): object | null {
    if (!obj) {
        return null
    }
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function' || value === undefined) {
            return undefined
        }
        return value
    }))
}
