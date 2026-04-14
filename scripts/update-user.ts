import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if simon exists
  const simonResult = await prisma.$queryRaw<{id: string, username: string, email: string, role: string}[]>`SELECT id, username, email, role FROM "User" WHERE username = 'simon'`;
  
  if (simonResult && simonResult.length > 0) {
    // Update simon to admin
    await prisma.$queryRaw`UPDATE "User" SET role = 'admin' WHERE username = 'simon'`;
    console.log('✅ User simon updated to admin role');
  } else {
    // Create simon as admin
    const passwordHash = await bcrypt.hash('simon123', 10);
    await prisma.$queryRaw`
      INSERT INTO "User" (id, username, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'simon', 'simon@itmanager.com', ${passwordHash}, 'Simon Admin', 'admin', true, NOW(), NOW())
    `;
    console.log('✅ Created user simon as admin');
  }
  
  // Show all users
  const users = await prisma.$queryRaw<{username: string, role: string}[]>`SELECT username, role FROM "User" ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'manager' THEN 2 
      WHEN 'staff' THEN 3 
      WHEN 'user' THEN 4 
      WHEN 'guest' THEN 5 
    END`;
  
  console.log('\n📋 All Users with Roles:');
  console.log('─'.repeat(40));
  users.forEach(u => console.log(`  ${u.username.padEnd(15)} → ${u.role}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
