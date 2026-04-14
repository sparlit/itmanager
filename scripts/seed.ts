import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  const passwordHash = await bcrypt.hash("password123", 10);
  const adminPasswordHash = await bcrypt.hash("simon123", 10);

  // 1. Users (7)
  console.log("📝 Creating users...");
  const users = [
    { username: "admin", email: "admin@itmanager.com", name: "System Administrator", role: "admin", passwordHash: adminPasswordHash },
    { username: "simon", email: "simon@itmanager.com", name: "Simon Admin", role: "admin", passwordHash: adminPasswordHash },
    { username: "manager", email: "manager@itmanager.com", name: "IT Manager", role: "manager", passwordHash },
    { username: "john", email: "john@itmanager.com", name: "John Smith", role: "manager", passwordHash },
    { username: "staff", email: "staff@itmanager.com", name: "IT Staff", role: "staff", passwordHash },
    { username: "user", email: "user@itmanager.com", name: "Regular User", role: "user", passwordHash },
    { username: "guest", email: "guest@itmanager.com", name: "Guest User", role: "guest", passwordHash },
  ];

  for (const user of users) {
    await prisma.$executeRaw`
      INSERT INTO "User" (id, username, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${user.username}, ${user.email}, ${user.passwordHash}, ${user.name}, ${user.role}, true, NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `;
  }
  console.log(`✅ Created ${users.length} users`);

  // 2. Staff (10) - Skip if exists
  console.log("👥 Creating staff...");
  const staffData = [
    { name: "Alice Johnson", email: "alice@company.com", department: "IT", role: "Manager" },
    { name: "Bob Williams", email: "bob@company.com", department: "IT", role: "Senior Engineer" },
    { name: "Carol Davis", email: "carol@company.com", department: "IT", role: "Engineer" },
    { name: "David Brown", email: "david@company.com", department: "IT", role: "Engineer" },
    { name: "Emma Wilson", email: "emma@company.com", department: "HR", role: "Coordinator" },
    { name: "Frank Miller", email: "frank@company.com", department: "Finance", role: "Analyst" },
    { name: "Grace Lee", email: "grace@company.com", department: "IT", role: "Support" },
    { name: "Henry Taylor", email: "henry@company.com", department: "Operations", role: "Manager" },
    { name: "Iris Martinez", email: "iris@company.com", department: "IT", role: "Administrator" },
    { name: "Jack Anderson", email: "jack@company.com", department: "IT", role: "Engineer" },
  ];

  for (const s of staffData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "Staff" WHERE email = ${s.email}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "Staff" (id, name, email, department, role, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${s.name}, ${s.email}, ${s.department}, ${s.role}, 'Active', NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Staff data ready`);

  // 3. Assets (10)
  console.log("💻 Creating assets...");
  const assetData = [
    { name: "Dell Laptop XPS 15", serialNumber: "DL-XPS-001", category: "Laptop", status: "In Use", condition: "Good" },
    { name: "MacBook Pro 16", serialNumber: "MB-PRO-001", category: "Laptop", status: "In Use", condition: "Excellent" },
    { name: "Dell Monitor 27\"", serialNumber: "DL-MON-001", category: "Monitor", status: "Available", condition: "Good" },
    { name: "HP Printer LaserJet", serialNumber: "HP-PRT-001", category: "Printer", status: "In Use", condition: "Good" },
    { name: "Cisco Router 2900", serialNumber: "CI-RT-001", category: "Network", status: "Available", condition: "Good" },
    { name: "iPhone 14 Pro", serialNumber: "IP-14P-001", category: "Mobile", status: "In Use", condition: "Good" },
    { name: "iPad Pro 12.9", serialNumber: "IP-PR-001", category: "Tablet", status: "Available", condition: "Excellent" },
    { name: "Logitech Mouse MX", serialNumber: "LG-MX-001", category: "Accessory", status: "In Use", condition: "Good" },
    { name: "Keyboard Mechanical", serialNumber: "KB-MECH-001", category: "Accessory", status: "In Use", condition: "Good" },
    { name: "Webcam HD 1080p", serialNumber: "WC-HD-001", category: "Accessory", status: "Available", condition: "Good" },
  ];

  for (const a of assetData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "Asset" WHERE "serialNumber" = ${a.serialNumber}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "Asset" (id, name, "serialNumber", category, status, condition, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${a.name}, ${a.serialNumber}, ${a.category}, ${a.status}, ${a.condition}, NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Assets data ready`);

  // 4. Inventory Items (10)
  console.log("📦 Creating inventory items...");
  const inventoryData = [
    { name: "Laptop Dell XPS 15", category: "Electronics", quantity: 15, minStock: 5, unitPrice: 1299.99, sku: "ELEC-001" },
    { name: "USB-C Cable 2m", category: "Cables", quantity: 50, minStock: 20, unitPrice: 12.99, sku: "CABL-001" },
    { name: "Wireless Mouse", category: "Accessories", quantity: 30, minStock: 10, unitPrice: 29.99, sku: "ACC-001" },
    { name: "HDMI Cable 1.5m", category: "Cables", quantity: 40, minStock: 15, unitPrice: 9.99, sku: "CABL-002" },
    { name: "External SSD 1TB", category: "Storage", quantity: 8, minStock: 3, unitPrice: 119.99, sku: "STOR-001" },
    { name: "USB Hub 7-Port", category: "Accessories", quantity: 20, minStock: 5, unitPrice: 24.99, sku: "ACC-002" },
    { name: "Laptop Bag", category: "Accessories", quantity: 25, minStock: 10, unitPrice: 39.99, sku: "ACC-003" },
    { name: "Webcam 1080p", category: "Electronics", quantity: 12, minStock: 5, unitPrice: 69.99, sku: "ELEC-002" },
    { name: "Headset Wireless", category: "Electronics", quantity: 18, minStock: 5, unitPrice: 79.99, sku: "ELEC-003" },
    { name: "Docking Station", category: "Electronics", quantity: 6, minStock: 2, unitPrice: 199.99, sku: "ELEC-004" },
  ];

  for (const inv of inventoryData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "InventoryItem" WHERE sku = ${inv.sku}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "InventoryItem" (id, name, category, sku, "minStockLevel", quantity, "unitPrice", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${inv.name}, ${inv.category}, ${inv.sku}, ${inv.minStock}, ${inv.quantity}, ${inv.unitPrice}, true, NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Inventory data ready`);

  // 5. Vendors (5)
  console.log("🏢 Creating vendors...");
  const vendorData = [
    { name: "Dell Technologies", category: "Hardware", email: "sales@dell.com", phone: "1-800-999-3355" },
    { name: "Apple Inc", category: "Hardware", email: "sales@apple.com", phone: "1-800-275-2273" },
    { name: "CDW Corporation", category: "IT Services", email: "sales@cdw.com", phone: "1-800-767-4239" },
    { name: "Amazon Business", category: "E-Commerce", email: "support@amazon.com", phone: "1-888-282-2408" },
    { name: "TechData Corp", category: "Distributor", email: "sales@techdata.com", phone: "1-800-445-3356" },
  ];

  for (const v of vendorData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "Vendor" WHERE name = ${v.name}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "Vendor" (id, name, category, email, phone, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${v.name}, ${v.category}, ${v.email}, ${v.phone}, 'Active', NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Vendors data ready`);

  // 6. Tickets (10)
  console.log("🎫 Creating tickets...");
  const ticketData = [
    { title: "Laptop not booting", priority: "High", category: "Hardware" },
    { title: "Password reset needed", priority: "Medium", category: "Account" },
    { title: "Software installation request", priority: "Low", category: "Software" },
    { title: "Network connectivity issues", priority: "High", category: "Network" },
    { title: "Printer not working", priority: "Medium", category: "Hardware" },
    { title: "Email not syncing", priority: "Medium", category: "Software" },
    { title: "VPN access needed", priority: "High", category: "Access" },
    { title: "Monitor flickering", priority: "Low", category: "Hardware" },
    { title: "New employee setup", priority: "Medium", category: "Onboarding" },
    { title: "Software license expired", priority: "High", category: "Software" },
  ];

  for (const t of ticketData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "Ticket" WHERE title = ${t.title}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "Ticket" (id, title, description, priority, category, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${t.title}, 'Description for: ' || ${t.title}, ${t.priority}, ${t.category}, 'Open', NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Tickets data ready`);

  // 7. Knowledge Base Articles (5)
  console.log("📚 Creating knowledge base articles...");
  const kbData = [
    { title: "How to Reset Password", category: "Security", tags: "password,security,reset" },
    { title: "VPN Setup Guide", category: "Network", tags: "vpn,network,remote" },
    { title: "Email Configuration", category: "Software", tags: "email,outlook,configuration" },
    { title: "Printer Troubleshooting", category: "Hardware", tags: "printer,troubleshooting,hardware" },
    { title: "New Employee IT Onboarding", category: "Onboarding", tags: "onboarding,new hire,setup" },
  ];

  for (const kb of kbData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "KnowledgeBaseArticle" WHERE title = ${kb.title}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBaseArticle" (id, title, content, category, tags, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${kb.title}, 'Content for: ' || ${kb.title}, ${kb.category}, ${kb.tags}, 'Published', NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Knowledge Base data ready`);

  // 8. Software Licenses (5)
  console.log("🔑 Creating software licenses...");
  const licenseData = [
    { name: "Microsoft 365 Business", vendor: "Microsoft", seats: 50, used: 35 },
    { name: "Adobe Creative Cloud", vendor: "Adobe", seats: 20, used: 15 },
    { name: "Zoom Business", vendor: "Zoom", seats: 100, used: 45 },
    { name: "Slack Enterprise", vendor: "Slack", seats: 75, used: 60 },
    { name: "Atlassian Jira", vendor: "Atlassian", seats: 30, used: 25 },
  ];

  for (const l of licenseData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "SoftwareLicense" WHERE name = ${l.name}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "SoftwareLicense" (id, name, vendor, "totalSeats", "usedSeats", status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${l.name}, ${l.vendor}, ${l.seats}, ${l.used}, 'Active', NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Licenses data ready`);

  // 9. Service Catalog (IT services)
  console.log("🛠️ Creating service catalog...");
  const serviceData = [
    { name: "Laptop Request", category: "Hardware", description: "Request a new laptop for work. Includes specification selection, approval process, and delivery to your office.", icon: "💻", estimatedTime: "2-5 days", approvalRequired: true },
    { name: "Monitor Setup", category: "Hardware", description: "Request additional monitors or display setup for your workstation. Includes installation and configuration.", icon: "🖥️", estimatedTime: "1-2 days", approvalRequired: false },
    { name: "Keyboard & Mouse", category: "Hardware", description: "Request replacement or additional keyboard and mouse. Wireless and wired options available.", icon: "🖱️", estimatedTime: "1-2 days", approvalRequired: false },
    { name: "Software Installation", category: "Software", description: "Request installation of approved software applications. Includes productivity tools, development tools, and business applications.", icon: "📀", estimatedTime: "4-24 hours", approvalRequired: false },
    { name: "Software License Request", category: "Software", description: "Request new software licenses for business needs. Includes license purchase and activation.", icon: "🔑", estimatedTime: "1-3 days", approvalRequired: true },
    { name: "Email Setup", category: "Account", description: "Setup new email accounts, aliases, and distribution lists. Includes signature configuration.", icon: "📧", estimatedTime: "4-8 hours", approvalRequired: true },
    { name: "Password Reset", category: "Account", description: "Request password reset for your account. Secure verification required.", icon: "🔐", estimatedTime: "15-30 min", approvalRequired: false },
    { name: "VPN Access", category: "Network", description: "Request VPN access credentials for secure remote work. Includes setup guide and troubleshooting.", icon: "🌐", estimatedTime: "4-24 hours", approvalRequired: true },
    { name: "Network Drive Access", category: "Network", description: "Request access to shared network drives and folders. Specify required permissions.", icon: "📁", estimatedTime: "4-8 hours", approvalRequired: false },
    { name: "WiFi Access", category: "Network", description: "Request WiFi access for guest devices or new employee setup.", icon: "📶", estimatedTime: "1-2 hours", approvalRequired: false },
    { name: "Antivirus Installation", category: "Security", description: "Request antivirus software installation or renewal. Includes system scan and configuration.", icon: "🛡️", estimatedTime: "1-2 hours", approvalRequired: false },
    { name: "Security Token", category: "Security", description: "Request physical security token or smart card for secure authentication.", icon: "💳", estimatedTime: "2-3 days", approvalRequired: true },
    { name: "New Employee Setup", category: "Onboarding", description: "Complete IT setup for new employees including hardware, software, and access permissions.", icon: "👤", estimatedTime: "1-2 days", approvalRequired: true },
    { name: "Equipment Return", category: "Offboarding", description: "Schedule return of IT equipment during employee offboarding. Includes data wipe verification.", icon: "↩️", estimatedTime: "1 day", approvalRequired: false },
    { name: "Printer Setup", category: "Hardware", description: "Request printer installation and configuration on your workstation.", icon: "🖨️", estimatedTime: "2-4 hours", approvalRequired: false },
    { name: "Printer Toner", category: "Supplies", description: "Request replacement toner or ink cartridges for office printers.", icon: "🩸", estimatedTime: "4-24 hours", approvalRequired: false },
    { name: "Phone System", category: "Communication", description: "Request desk phone setup, headset, or VoIP configuration.", icon: "📞", estimatedTime: "1-2 days", approvalRequired: false },
    { name: "Video Conferencing", category: "Communication", description: "Request video conferencing equipment setup for meeting rooms.", icon: "📹", estimatedTime: "1-3 days", approvalRequired: true },
    { name: "Cloud Storage", category: "Cloud", description: "Request additional cloud storage space or new cloud service access.", icon: "☁️", estimatedTime: "4-24 hours", approvalRequired: false },
    { name: "Data Backup", category: "Cloud", description: "Request data backup setup or restore from previous backups.", icon: "💾", estimatedTime: "1-2 days", approvalRequired: true },
    { name: "Remote Support", category: "Support", description: "Request remote desktop support for troubleshooting software or hardware issues.", icon: "🎧", estimatedTime: "30-60 min", approvalRequired: false },
    { name: "On-Site Support", category: "Support", description: "Request on-site IT support for hardware issues, network problems, or complex setups.", icon: "🔧", estimatedTime: "1-4 hours", approvalRequired: false },
    { name: "System Upgrade", category: "Software", description: "Request operating system or software upgrades for your workstation.", icon: "⬆️", estimatedTime: "1-2 hours", approvalRequired: false },
    { name: "Data Recovery", category: "Support", description: "Request data recovery services for lost or corrupted files.", icon: "🔍", estimatedTime: "1-3 days", approvalRequired: true },
    { name: "Access Card", category: "Security", description: "Request building access card or security badge setup.", icon: "🚪", estimatedTime: "1-2 days", approvalRequired: true },
  ];

  for (const s of serviceData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "ServiceCatalog" WHERE name = ${s.name}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "ServiceCatalog" (id, name, description, category, icon, status, "estimatedTime", "approvalRequired", "sortOrder", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${s.name}, ${s.description}, ${s.category}, ${s.icon}, 'Active', ${s.estimatedTime}, ${s.approvalRequired}, 0, NOW(), NOW())
      `;
    }
  }
  console.log(`✅ Services data ready`);

  // 10. SLA Policies (3)
  console.log("⏱️ Creating SLA policies...");
  const slaData = [
    { name: "Critical Priority", responseTime: 1, resolutionTime: 4, description: "For critical issues" },
    { name: "High Priority", responseTime: 4, resolutionTime: 24, description: "For high priority issues" },
    { name: "Standard", responseTime: 8, resolutionTime: 48, description: "For standard requests" },
  ];

  for (const sla of slaData) {
    const exists = await prisma.$queryRaw`SELECT id FROM "SLAPolicy" WHERE name = ${sla.name}`;
    if (!Array.isArray(exists) || exists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "SLAPolicy" (id, name, description, "responseTime", "resolutionTime", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${sla.name}, ${sla.description}, ${sla.responseTime}, ${sla.resolutionTime}, true, NOW(), NOW())
      `;
    }
  }
  console.log(`✅ SLA policies data ready`);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("✅ DATABASE SEED COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📊 Record Summary:");
  console.log("  • Users: 7");
  console.log("  • Staff: 10");
  console.log("  • Assets: 10");
  console.log("  • Inventory: 10");
  console.log("  • Vendors: 5");
  console.log("  • Tickets: 10");
  console.log("  • Knowledge Base: 5");
  console.log("  • Licenses: 5");
  console.log("  • Services: 5");
  console.log("  • SLA Policies: 3");
  console.log("\n  TOTAL: 70+ records");
  console.log("\n🔑 Login credentials (password: password123 / simon123):");
  console.log("  • simon@itmanager.com (admin)");
  console.log("  • admin@itmanager.com (admin)");
  console.log("  • manager@itmanager.com (manager)");
  console.log("  • staff@itmanager.com (staff)");
  console.log("  • user@itmanager.com (user)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
