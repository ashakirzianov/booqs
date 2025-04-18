import typeDefs from '@/graphql/schema.graphql' assert { type: 'text' }
import { createYoga, createSchema } from 'graphql-yoga'
import { resolvers } from '@/graphql/resolvers'
import { ResolverContext, context } from '@/graphql/context'
import { cookies, headers } from 'next/headers'
import { NextRequest } from 'next/server'

const schema = createSchema<ResolverContext>({
  typeDefs,
  resolvers,
})

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request, Response },
  async context() {
    const cookieStore = await cookies()
    const hs = await headers()
    const origin = hs.get('origin') ?? undefined
    let domain: string | undefined = origin?.startsWith('https://') ? origin.substring('https://'.length)
      : origin?.startsWith('http://') ? origin.substring('http://'.length)
        : (process.env.APP_DOMAIN ?? 'booqs.app')
    if (domain?.startsWith('localhost')) {
      domain = undefined
    }
    return context({
      origin,
      getCookie(name) { return cookieStore.get(name)?.value },
      setCookie(name, value, options) {
        cookieStore.set(name, value, options)
      },
      clearCookie(name, _options) {
        cookieStore.delete(name)
      },
    })
  },
})

// export { handleRequest as GET, handleRequest as POST }

export async function GET(request: NextRequest) {
  return handleRequest(request, {})
}

export async function POST(request: NextRequest) {
  return handleRequest(request, {})
}