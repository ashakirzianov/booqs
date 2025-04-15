import typeDefs from '@/graphql/schema.graphql' assert { type: 'text' }
import { createYoga, createSchema } from 'graphql-yoga'
import { context, resolvers } from '@/graphql'
import { ResolverContext } from '@/graphql/context'
import { cookies, headers } from 'next/headers'

const schema = createSchema<ResolverContext>({
  typeDefs,
  resolvers,
})

const yoga = createYoga({
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
      clearCookie(name, options) {
        cookieStore.delete(name)
      },
    })
  },
})

export { yoga as GET, yoga as POST }