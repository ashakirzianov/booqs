import { ApolloServer } from 'apollo-server-micro';
import { typeDefs, resolvers, context } from './graphql';
import { connectDb } from './mongoose';
import { config as configEnv } from 'dotenv';

configEnv();

let microServer: ApolloServer;
export function createHandler(path: string) {
    connectDb();
    if (!microServer) {
        microServer = new ApolloServer({
            typeDefs,
            resolvers,
            context,
        });
    }

    return microServer.createHandler({ path });
}
