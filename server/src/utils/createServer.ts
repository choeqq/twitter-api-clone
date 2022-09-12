import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-fastify";
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { buildSchema } from "type-graphql";
import UserResolver from "../modules/user/user.resolver";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, GraphQLSchema, subscribe } from "graphql";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";

const app = fastify();

app.register(fastifyCors, {
  credentials: true,
  origin: (origin, cb) => {
    if (
      ["http://localhost:3000", "https://studio.apollographql.com"].includes(
        origin
      )
    ) {
      return cb(null, true);
    }

    return cb(new Error("Not allowed"), false);
  },
});

app.register(fastifyCookie, { parseOption: {} });

app.register(fastifyJwt, {
  secret: "change-me",
  cookie: {
    cookieName: "token",
    signed: "false",
  },
});

function fastifyAppClosePlugin(app: FastifyInstance): ApolloServerPlugin {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}

function buildContext({
  request,
  reply,
  connectionParams,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  connectionParams: Object;
}) {
  return { request, reply };
}

export async function createServer() {
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const server = new ApolloServer({
    schema,
    plugins: [
      fastifyAppClosePlugin(app),
      ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
    ],
    context: buildContext,
  });

  return { app, server };
}

const subscriptionServer = ({
  schema,
  server,
}: {
  schema: GraphQLSchema;
  server: ApolloServer;
}) => {
  return SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      async onConnect(connectionParams: Object) {
        return buildContext({ connectionParams });
      },
    },
    {
      server,
      path: "/graphql",
    }
  );
};
