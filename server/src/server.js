import http from "node:http";

import { Server } from "socket.io";

import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { registerSocketHandlers } from "./socket/registerSocketHandlers.js";

const bootstrap = async () => {
  await connectDatabase(env.mongoUri);

  const app = createApp({ clientOrigins: env.clientOrigins });
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigins,
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  const shutdown = async () => {
    io.close();
    httpServer.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  httpServer.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
