const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log("[seed] Seeding database...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: "admin@entranceug.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@entranceug.com",
      phone: "+91 99999 99999",
      password: hashedPassword,
      role: "ADMIN",
      examPrimary: "IPMAT_INDORE",
      classYear: "DROPPER",
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "ELITE",
    },
  });

  console.log("[seed] Admin user created:");
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: admin123`);
  console.log(`  Role:     ADMIN`);

  // Create default mentor user
  const hashedMentorPassword = await bcrypt.hash("mentor123", SALT_ROUNDS);
  const mentor = await prisma.user.upsert({
    where: { email: "mentor@entranceug.com" },
    update: {},
    create: {
      name: "Default Mentor",
      email: "mentor@entranceug.com",
      phone: "+91 98765 43210",
      password: hashedMentorPassword,
      role: "MENTOR",
      examPrimary: "IPMAT_INDORE",
      classYear: "CLASS_12",
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "BASIC",
    },
  });

  console.log("[seed] Mentor user created:");
  console.log(`  Email:    ${mentor.email}`);
  console.log(`  Password: mentor123`);
  console.log(`  Role:     MENTOR`);

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
