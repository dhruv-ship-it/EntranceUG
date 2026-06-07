const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("[seed] Seeding database...");

  // Seed will be implemented with application models
  console.log("[seed] No seed data configured yet.");

  console.log("[seed] Database seed complete.");
}

main()
  .catch((e) => {
    console.error("[seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
