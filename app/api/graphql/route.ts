import { NextRequest } from 'next/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { context } from '@/server/graphql'
import { serialize } from 'cookie'
import { prepareServer } from '@/server/prepare'

type Handler = Awaited<ReturnType<typeof startServerAndCreateNextHandler<NextRequest>>>
const handlerPromise: Promise<Handler> = makeHandler()
async function makeHandler() {
    const server = await prepareServer()
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