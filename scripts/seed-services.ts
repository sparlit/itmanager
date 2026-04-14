import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete all existing services
  await prisma.$executeRaw`DELETE FROM "ServiceCatalog"`;
  console.log("Cleared existing services");

  // Insert IT services
  const services = [
    { name: "Laptop Request", category: "Hardware", description: "Request a new laptop for work. Includes specification selection, approval process, and delivery to your office.", icon: "💻", estimatedTime: "2-5 days", approvalRequired: true },
    { name: "Monitor Setup", category: "Hardware", description: "Request additional monitors or display setup for your workstation. Includes installation and configuration.", icon: "🖥️", estimatedTime: "1-2 days", approvalRequired: false },
    { name: "Keyboard & Mouse", category: "Hardware", description: "Request replacement or additional keyboard and mouse. Wireless and wired options available.", icon: "🖱️", estimatedTime: "1-2 days", approvalRequired: false },
    { name: "Software Installation", category: "Software", description: "Request installation of approved software applications.", icon: "📀", estimatedTime: "4-24 hours", approvalRequired: false },
    { name: "Software License Request", category: "Software", description: "Request new software licenses for business needs.", icon: "🔑", estimatedTime: "1-3 days", approvalRequired: true },
    { name: "Email Setup", category: "Account", description: "Setup new email accounts, aliases, and distribution lists.", icon: "📧", estimatedTime: "4-8 hours", approvalRequired: true },
    { name: "Password Reset", category: "Account", description: "Request password reset for your account.", icon: "🔐", estimatedTime: "15-30 min", approvalRequired: false },
    { name: "VPN Access", category: "Network", description: "Request VPN access credentials for secure remote work.", icon: "🌐", estimatedTime: "4-24 hours", approvalRequired: true },
    { name: "Network Drive Access", category: "Network", description: "Request access to shared network drives and folders.", icon: "📁", estimatedTime: "4-8 hours", approvalRequired: false },
    { name: "WiFi Access", category: "Network", description: "Request WiFi access for guest devices.", icon: "📶", estimatedTime: "1-2 hours", approvalRequired: false },
    { name: "Antivirus Installation", category: "Security", description: "Request antivirus software installation or renewal.", icon: "🛡️", estimatedTime: "1-2 hours", approvalRequired: false },
    { name: "Security Token", category: "Security", description: "Request physical security token or smart card.", icon: "💳", estimatedTime: "2-3 days", approvalRequired: true },
    { name: "New Employee Setup", category: "Onboarding", description: "Complete IT setup for new employees.", icon: "👤", estimatedTime: "1-2 days", approvalRequired: true },
    { name: "Equipment Return", category: "Offboarding", description: "Schedule return of IT equipment.", icon: "↩️", estimatedTime: "1 day", approvalRequired: false },
    { name: "Printer Setup", category: "Hardware", description: "Request printer installation and configuration.", icon: "🖨️", estimatedTime: "2-4 hours", approvalRequired: false },
    { name: "Printer Toner", category: "Supplies", description: "Request replacement toner or ink cartridges.", icon: "🩸", estimatedTime: "4-24 hours", approvalRequired: false },
    { name: "Phone System", category: "Communication", description: "Request desk phone setup or VoIP configuration.", icon: "📞", estimatedTime: "1-2 days", approvalRequired: false },
    { name: "Video Conferencing", category: "Communication", description: "Request video conferencing equipment setup.", icon: "📹", estimatedTime: "1-3 days", approvalRequired: true },
    { name: "Cloud Storage", category: "Cloud", description: "Request additional cloud storage space.", icon: "☁️", estimatedTime: "4-24 hours", approvalRequired: false },
    { name: "Data Backup", category: "Cloud", description: "Request data backup setup or restore.", icon: "💾", estimatedTime: "1-2 days", approvalRequired: true },
    { name: "Remote Support", category: "Support", description: "Request remote desktop support.", icon: "🎧", estimatedTime: "30-60 min", approvalRequired: false },
    { name: "On-Site Support", category: "Support", description: "Request on-site IT support.", icon: "🔧", estimatedTime: "1-4 hours", approvalRequired: false },
    { name: "System Upgrade", category: "Software", description: "Request operating system or software upgrades.", icon: "⬆️", estimatedTime: "1-2 hours", approvalRequired: false },
    { name: "Data Recovery", category: "Support", description: "Request data recovery services.", icon: "🔍", estimatedTime: "1-3 days", approvalRequired: true },
    { name: "Access Card", category: "Security", description: "Request building access card setup.", icon: "🚪", estimatedTime: "1-2 days", approvalRequired: true },
  ];

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await prisma.$executeRaw`
      INSERT INTO "ServiceCatalog" (id, name, description, category, icon, status, "estimatedTime", "approvalRequired", "sortOrder", "views", "requests", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${s.name}, ${s.description}, ${s.category}, ${s.icon}, 'Active', ${s.estimatedTime}, ${s.approvalRequired}, ${i}, 0, 0, NOW(), NOW())
    `;
  }

  console.log(`Inserted ${services.length} IT services`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());