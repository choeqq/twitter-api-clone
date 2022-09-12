import "reflect-metadata";
import { createServer } from "./utils/createServer";

async function main() {
  // start server
  const { app, server } = await createServer();

  app.get("/healthcheck", async () => "OK");

  await server.start();

  await app.listen({
    port: 4000,
  });

  console.log(`Server ready at http://localhostL400${server.graphqlPath}`);
}

main();
