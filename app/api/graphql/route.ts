import { NextRequest } from 'next/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { ApolloServer } from '@apollo/server'
import { readTypeDefs, resolvers, context } from '@/server/graphql'
import { serialize } from 'cookie'
import { mongoDbConnection } from '@/server/mongoose'

type Handler = Awaited<ReturnType<typeof startServerAndCreateNextHandler<NextRequest>>>
const handlerPromise: Promise<Handler> = makeHandler()
async function makeHandler() {
    mongoDbConnection()
    const server = new ApolloServer({
        typeDefs: await readTypeDefs(),
        resolvers,
        apollo: {
            graphVariant: process.env.NODE_ENV !== 'development'
                ? 'current' : 'dev',
        },
    })
    return startServerAndCreateNextHandler<NextRequest>(server, {
        context(req) {
            return context({
                getCookie(name) {
                    let cookie = req.cookies.get(name)
                    return cookie?.value
                },
                setCookie(name, value, options) {
                    req.headers.append('Set-Cookie', serialize(name, value, options))
                },
                clearCookie(name) {
                    req.cookies.delete(name)
                },
            })
        },
    })
}

export async function GET(request: NextRequest) {
    return (await handlerPromise)(request)
}

export async function POST(request: NextRequest) {
    return (await handlerPromise)(request)
}