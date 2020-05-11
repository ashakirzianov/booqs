import { ApolloServer } from 'apollo-server';
import { config as configEnv } from 'dotenv';
import { typeDefs, resolvers, context } from './graphql';
import { syncWithS3 } from './syncGutenberg';
import { connectDb } from './mongoose';

configEnv();
startup();

export async function startup() {
    connectDb();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context,
    });
    const { url } = await server.listen();
    console.info(`Server ready at ${url}`);
    runWorkers();
}

async function runWorkers() {
    // eslint-disable-next-line no-constant-condition
    if (false) {
        syncWithS3();
    }
}
