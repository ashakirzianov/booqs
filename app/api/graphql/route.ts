import typeDefs from '@/graphql/schema.graphql' assert { type: 'text' }
import { createYoga, createSchema } from 'graphql-yoga'
import { useValidationRule } from '@envelop/core'
import { resolvers } from '@/graphql/resolvers'
import { ResolverContext, context } from '@/graphql/context'
import { cookies, headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { depthLimitRule } from '@/graphql/depthLimit'

const schema = createSchema<ResolverContext>({
  typeDefs,
  resolvers,
})

const isProduction = process.env.NODE_ENV === 'production'

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request, Response },
  maskedErrors: isProduction,
  graphiql: !isProduction,
  plugins: [
    // eslint-disable-next-line react-hooks/rules-of-hooks -- envelop plugin, not a React hook
    useValidationRule(depthLimitRule(10)),
  ],
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
      getHeader(name) { return hs.get(name) ?? undefined },
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