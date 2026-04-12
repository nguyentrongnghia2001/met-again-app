import cors from "cors";
import express from "express";

export const createApp = ({ clientOrigins }) => {
  const app = express();

  app.use(
    cors({
      origin: clientOrigins,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: "met-again-server",
      timestamp: new Date().toISOString(),
    });
  });

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({
      ok: false,
      message: "Unexpected server error.",
    });
  });

  return app;
};
