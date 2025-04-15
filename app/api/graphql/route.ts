import typeDefs from '@/graphql/schema.graphql' assert { type: 'text' }
import { createYoga, createSchema } from 'graphql-yoga'
import { resolvers } from '@/graphql/resolvers'

const schema = createSchema({
  typeDefs,
  resolvers,
})

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request, Response },
})

export { yoga as GET, yoga as POST }