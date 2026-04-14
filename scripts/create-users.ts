import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [
    { username: "admin", email: "admin@itmanager.com", name: "System Administrator", role: "admin" },
    { username: "manager", email: "manager@itmanager.com", name: "IT Manager", role: "manager" },
    { username: "staff", email: "staff@itmanager.com", name: "IT Staff", role: "staff" },
    { username: "user", email: "user@itmanager.com", name: "Regular User", role: "user" },
    { username: "guest", email: "guest@itmanager.com", name: "Guest User", role: "guest" },
  ];

  for (const user of users) {
    const existing = await prisma.$queryRaw`SELECT id FROM "User" WHERE username = ${user.username}`;
    
    if (!Array.isArray(existing) || existing.length === 0) {
      await prisma.$queryRaw`
        INSERT INTO "User" (id, username, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${user.username}, ${user.email}, ${passwordHash}, ${user.name}, ${user.role}, true, NOW(), NOW())
      `;
      console.log(`Created user: ${user.username} (${user.role})`);
    } else {
      console.log(`User ${user.username} already exists`);
    }
  }

  console.log("\n✅ Users created successfully!");
  console.log("\nLogin credentials (password: password123):");
  console.log("  admin@itmanager.com / admin");
  console.log("  manager@itmanager.com / manager");
  console.log("  staff@itmanager.com / staff");
  console.log("  user@itmanager.com / user");
  console.log("  guest@itmanager.com / guest");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
