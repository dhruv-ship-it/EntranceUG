const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const prisma = require("./config/database");

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Route ─────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// ─── Start Server ─────────────────────────────────────────────
const server = app.listen(env.port, () => {
  console.log(`[server] Running on http://localhost:${env.port}`);
  console.log(`[server] Environment: ${env.nodeEnv}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[server] ${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("[server] Database disconnected. Process exiting.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
