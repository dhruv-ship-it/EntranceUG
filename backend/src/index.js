const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const prisma = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const mentorRoutes = require("./routes/mentor.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/mentor", mentorRoutes);
app.use("/api/v1/student", studentRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
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
