import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.assetAssignment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.knowledgeBaseArticle.deleteMany();

  // Create Staff
  const staff = await Promise.all([
    prisma.staff.create({
      data: { name: "Sarah Johnson", email: "sarah.johnson@company.com", phone: "+1-555-0101", department: "IT Management", role: "Admin", status: "Active", joinDate: new Date("2021-03-15") },
    }),
    prisma.staff.create({
      data: { name: "Michael Chen", email: "michael.chen@company.com", phone: "+1-555-0102", department: "IT Support", role: "Technician", status: "Active", joinDate: new Date("2022-01-10") },
    }),
    prisma.staff.create({
      data: { name: "Emily Davis", email: "emily.davis@company.com", phone: "+1-555-0103", department: "IT Support", role: "Technician", status: "Active", joinDate: new Date("2022-06-20") },
    }),
    prisma.staff.create({
      data: { name: "James Wilson", email: "james.wilson@company.com", phone: "+1-555-0104", department: "Network Ops", role: "Manager", status: "Active", joinDate: new Date("2020-09-01") },
    }),
    prisma.staff.create({
      data: { name: "Aisha Patel", email: "aisha.patel@company.com", phone: "+1-555-0105", department: "IT Support", role: "Technician", status: "Active", joinDate: new Date("2023-02-14") },
    }),
    prisma.staff.create({
      data: { name: "Robert Taylor", email: "robert.taylor@company.com", phone: "+1-555-0106", department: "Security", role: "Technician", status: "On Leave", joinDate: new Date("2021-11-30") },
    }),
    prisma.staff.create({
      data: { name: "Lisa Martinez", email: "lisa.martinez@company.com", phone: "+1-555-0107", department: "DevOps", role: "Manager", status: "Active", joinDate: new Date("2021-07-22") },
    }),
    prisma.staff.create({
      data: { name: "David Brown", email: "david.brown@company.com", phone: "+1-555-0108", department: "Engineering", role: "Staff", status: "Active", joinDate: new Date("2023-05-01") },
    }),
  ]);

  // Create Assets
  const now = new Date();
  const assets = await Promise.all([
    prisma.asset.create({ data: { name: "MacBook Pro 16\"", serialNumber: "MBP-2024-001", category: "Laptop", status: "In Use", condition: "Excellent", purchaseDate: new Date("2024-01-15"), purchaseCost: 2499.99, warrantyEnd: new Date("2027-01-15"), vendor: "Apple Inc.", location: "Building A - Floor 3" } }),
    prisma.asset.create({ data: { name: "Dell XPS 15", serialNumber: "DLX-2024-002", category: "Laptop", status: "In Use", condition: "Good", purchaseDate: new Date("2023-06-10"), purchaseCost: 1899.99, warrantyEnd: new Date("2026-06-10"), vendor: "Dell Technologies", location: "Building A - Floor 2" } }),
    prisma.asset.create({ data: { name: "ThinkPad X1 Carbon", serialNumber: "TPC-2023-003", category: "Laptop", status: "Under Maintenance", condition: "Fair", purchaseDate: new Date("2023-03-20"), purchaseCost: 1699.99, warrantyEnd: new Date("2026-03-20"), vendor: "Lenovo", location: "IT Workshop" } }),
    prisma.asset.create({ data: { name: "HP EliteDisplay E27", serialNumber: "HPE-2024-004", category: "Monitor", status: "In Use", condition: "Excellent", purchaseDate: new Date("2024-02-01"), purchaseCost: 449.99, warrantyEnd: new Date("2027-02-01"), vendor: "HP Inc.", location: "Building A - Floor 3" } }),
    prisma.asset.create({ data: { name: "Cisco Catalyst 9300", serialNumber: "CSC-2022-005", category: "Network", status: "In Use", condition: "Good", purchaseDate: new Date("2022-08-15"), purchaseCost: 5499.99, warrantyEnd: new Date("2025-08-15"), vendor: "Cisco Systems", location: "Server Room B1" } }),
    prisma.asset.create({ data: { name: "Microsoft 365 License", serialNumber: "MSF-2024-006", category: "Software", status: "In Use", condition: "Excellent", purchaseDate: new Date("2024-01-01"), purchaseCost: 432.00, warrantyEnd: new Date("2024-12-31"), vendor: "Microsoft", location: "Cloud" } }),
    prisma.asset.create({ data: { name: "Dell OptiPlex 7090", serialNumber: "DOP-2023-007", category: "Desktop", status: "Available", condition: "Good", purchaseDate: new Date("2023-04-10"), purchaseCost: 1299.99, warrantyEnd: new Date("2026-04-10"), vendor: "Dell Technologies", location: "IT Storage Room" } }),
    prisma.asset.create({ data: { name: "Logitech MX Master 3S", serialNumber: "LGM-2024-008", category: "Peripheral", status: "Available", condition: "Excellent", purchaseDate: new Date("2024-03-01"), purchaseCost: 99.99, warrantyEnd: new Date("2025-03-01"), vendor: "Logitech", location: "IT Storage Room" } }),
    prisma.asset.create({ data: { name: "APC Smart-UPS 1500", serialNumber: "APC-2022-009", category: "Infrastructure", status: "In Use", condition: "Good", purchaseDate: new Date("2022-05-20"), purchaseCost: 899.99, warrantyEnd: new Date("2025-05-20"), vendor: "APC by Schneider Electric", location: "Server Room B1" } }),
    prisma.asset.create({ data: { name: "MacBook Air M2", serialNumber: "MBA-2023-010", category: "Laptop", status: "Retired", condition: "Poor", purchaseDate: new Date("2022-07-10"), purchaseCost: 1199.99, vendor: "Apple Inc.", location: "IT Storage Room" } }),
  ]);

  // Create Asset Assignments
  await Promise.all([
    prisma.assetAssignment.create({ data: { assetId: assets[0].id, staffId: staff[0].id, notes: "Primary work laptop" } }),
    prisma.assetAssignment.create({ data: { assetId: assets[1].id, staffId: staff[1].id, notes: "Support team laptop" } }),
    prisma.assetAssignment.create({ data: { assetId: assets[3].id, staffId: staff[0].id, notes: "External monitor" } }),
    prisma.assetAssignment.create({ data: { assetId: assets[5].id, staffId: staff[2].id, notes: "Annual subscription" } }),
  ]);

  // Create Maintenance Records
  await Promise.all([
    prisma.maintenanceRecord.create({ data: { assetId: assets[2].id, type: "Corrective", description: "Keyboard replacement - keys not responding", performedBy: "Michael Chen", cost: 150.00 } }),
    prisma.maintenanceRecord.create({ data: { assetId: assets[4].id, type: "Preventive", description: "Firmware update and cable audit", performedBy: "James Wilson" } }),
    prisma.maintenanceRecord.create({ data: { assetId: assets[8].id, type: "Preventive", description: "Battery replacement and self-test", performedBy: "James Wilson", cost: 320.00 } }),
  ]);

  // Create Inventory Items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({ data: { name: "Cat6 Ethernet Cable (3ft)", category: "Cables", sku: "CAB-CAT6-3FT", quantity: 45, minStockLevel: 20, unitPrice: 8.99, supplier: "Cable Matters", location: "IT Storage - Shelf A1", lastRestocked: new Date("2024-11-01") } }),
    prisma.inventoryItem.create({ data: { name: "HDMI Cable (6ft)", category: "Cables", sku: "CAB-HDMI-6FT", quantity: 32, minStockLevel: 15, unitPrice: 12.99, supplier: "Amazon Basics", location: "IT Storage - Shelf A1", lastRestocked: new Date("2024-10-15") } }),
    prisma.inventoryItem.create({ data: { name: "USB-C to USB-A Adapter", category: "Adapters", sku: "ADP-USBC-USA", quantity: 3, minStockLevel: 10, unitPrice: 9.99, supplier: "Anker", location: "IT Storage - Shelf A2", lastRestocked: new Date("2024-08-20") } }),
    prisma.inventoryItem.create({ data: { name: "Wireless Mouse", category: "Peripherals", sku: "PER-WMOUSE-01", quantity: 18, minStockLevel: 10, unitPrice: 29.99, supplier: "Logitech", location: "IT Storage - Shelf B1", lastRestocked: new Date("2024-09-10") } }),
    prisma.inventoryItem.create({ data: { name: "Mechanical Keyboard", category: "Peripherals", sku: "PER-MKEY-01", quantity: 2, minStockLevel: 5, unitPrice: 79.99, supplier: "Keychron", location: "IT Storage - Shelf B1", lastRestocked: new Date("2024-07-05") } }),
    prisma.inventoryItem.create({ data: { name: "Monitor Stand", category: "Accessories", sku: "ACC-MSTAND-01", quantity: 7, minStockLevel: 5, unitPrice: 49.99, supplier: "Amazon Basics", location: "IT Storage - Shelf C1", lastRestocked: new Date("2024-10-01") } }),
    prisma.inventoryItem.create({ data: { name: "Webcam HD 1080p", category: "Peripherals", sku: "PER-WEBCAM-01", quantity: 12, minStockLevel: 5, unitPrice: 69.99, supplier: "Logitech", location: "IT Storage - Shelf B2", lastRestocked: new Date("2024-11-10") } }),
    prisma.inventoryItem.create({ data: { name: "Laptop Lock Cable", category: "Security", sku: "SEC-LLOCK-01", quantity: 4, minStockLevel: 8, unitPrice: 24.99, supplier: "Kensington", location: "IT Storage - Shelf C2", lastRestocked: new Date("2024-06-15") } }),
    prisma.inventoryItem.create({ data: { name: "Screen Cleaning Kit", category: "Consumables", sku: "CON-SCLN-01", quantity: 25, minStockLevel: 10, unitPrice: 14.99, supplier: "WHOOSH!", location: "IT Storage - Shelf D1", lastRestocked: new Date("2024-11-05") } }),
    prisma.inventoryItem.create({ data: { name: "Docking Station USB-C", category: "Accessories", sku: "ACC-DOCK-01", quantity: 6, minStockLevel: 4, unitPrice: 149.99, supplier: "CalDigit", location: "IT Storage - Shelf C1", lastRestocked: new Date("2024-09-20") } }),
  ]);

  // Create Inventory Transactions
  await Promise.all([
    prisma.inventoryTransaction.create({ data: { itemId: inventoryItems[0].id, type: "CheckOut", quantity: 5, performedBy: "Michael Chen", notes: "New hire setup - Building A" } }),
    prisma.inventoryTransaction.create({ data: { itemId: inventoryItems[1].id, type: "CheckOut", quantity: 3, performedBy: "Emily Davis", notes: "Conference room setup" } }),
    prisma.inventoryTransaction.create({ data: { itemId: inventoryItems[3].id, type: "CheckIn", quantity: 20, performedBy: "Sarah Johnson", notes: "Monthly restock order received" } }),
    prisma.inventoryTransaction.create({ data: { itemId: inventoryItems[6].id, type: "CheckOut", quantity: 4, performedBy: "Aisha Patel", notes: "Remote workers equipment" } }),
    prisma.inventoryTransaction.create({ data: { itemId: inventoryItems[2].id, type: "CheckOut", quantity: 2, performedBy: "Michael Chen", notes: "Department request" } }),
  ]);

  // Create Tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: "Cannot connect to VPN from home office",
        description: "Getting error 'Connection timed out' when trying to connect to company VPN. Tried restarting the computer and reinstalling the VPN client but issue persists. Using macOS Sonoma 14.2.",
        status: "In Progress",
        priority: "High",
        category: "Network",
        reportedBy: staff[7].id,
        reportedByName: "David Brown",
        reportedFromDepartment: "Engineering",
        reportDate: "2025-01-10",
        reportTime: "09:15",
        assignedTo: staff[1].id,
        assignedToName: "Michael Chen",
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Need new laptop for onboarding",
        description: "New team member joining on Monday. Need a MacBook Pro or equivalent laptop with standard software stack pre-installed. Please prepare ASAP.",
        status: "Open",
        priority: "Medium",
        category: "Hardware",
        reportedBy: staff[3].id,
        reportedByName: "James Wilson",
        reportedFromDepartment: "Network Ops",
        reportDate: "2025-01-12",
        reportTime: "11:30",
        assignedTo: staff[2].id,
        assignedToName: "Emily Davis",
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Email account locked - unable to access",
        description: "My email account has been locked after multiple failed login attempts. I need access urgently as I have client meetings scheduled today.",
        status: "Resolved",
        priority: "Critical",
        category: "Access",
        reportedBy: staff[7].id,
        reportedByName: "David Brown",
        reportedFromDepartment: "Engineering",
        reportDate: "2025-01-08",
        reportTime: "08:00",
        assignedTo: staff[4].id,
        assignedToName: "Aisha Patel",
        resolvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Printer on 3rd floor jamming frequently",
        description: "The HP LaserJet on the 3rd floor has been jamming every 20-30 pages. Already tried replacing the paper tray and cleaning the rollers.",
        status: "In Progress",
        priority: "Medium",
        category: "Hardware",
        reportedBy: staff[0].id,
        reportedByName: "Sarah Johnson",
        reportedFromDepartment: "IT Management",
        reportDate: "2025-01-09",
        reportTime: "14:20",
        assignedTo: staff[1].id,
        assignedToName: "Michael Chen",
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Software license renewal - Adobe Creative Suite",
        description: "Annual licenses for Adobe Creative Suite need to be renewed for 5 users. Current license expires in 2 weeks.",
        status: "Open",
        priority: "High",
        category: "Software",
        reportedBy: staff[6].id,
        reportedByName: "Lisa Martinez",
        reportedFromDepartment: "DevOps",
        reportDate: "2025-01-11",
        reportTime: "10:45",
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Slow WiFi in Building B conference rooms",
        description: "Multiple complaints about slow WiFi connectivity in conference rooms B1, B2, and B3. Speed tests show less than 10Mbps when it should be 100Mbps+.",
        status: "In Progress",
        priority: "High",
        category: "Network",
        reportedBy: staff[3].id,
        reportedByName: "James Wilson",
        reportedFromDepartment: "Network Ops",
        reportDate: "2025-01-07",
        reportTime: "16:00",
        assignedTo: staff[3].id,
        assignedToName: "James Wilson",
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Request for additional monitor",
        description: "I need a second monitor for my setup. Currently using a single 24\" display. Would prefer a 27\" 4K display if available.",
        status: "Open",
        priority: "Low",
        category: "Hardware",
        reportedBy: staff[7].id,
        reportedByName: "David Brown",
        reportedFromDepartment: "Engineering",
        reportDate: "2025-01-13",
        reportTime: "09:50",
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Security audit - update firewall rules",
        description: "Quarterly security audit identified 3 firewall rules that need updating to comply with new security policies. Please review and implement changes.",
        status: "Closed",
        priority: "High",
        category: "Security",
        reportedBy: staff[5].id,
        reportedByName: "Robert Taylor",
        reportedFromDepartment: "Security",
        reportDate: "2025-01-05",
        reportTime: "07:30",
        assignedTo: staff[3].id,
        assignedToName: "James Wilson",
        resolvedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        closedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: "On Hold: Two-factor authentication setup",
        description: "Need help setting up 2FA for new security policy compliance. Waiting for hardware tokens to arrive from vendor.",
        status: "On Hold",
        priority: "Medium",
        category: "Access",
        reportedBy: staff[4].id,
        reportedByName: "Aisha Patel",
        reportedFromDepartment: "IT Support",
        reportDate: "2025-01-06",
        reportTime: "13:10",
        assignedTo: staff[5].id,
        assignedToName: "Robert Taylor",
      },
    }),
    prisma.ticket.create({
      data: {
        title: "Data backup verification needed",
        description: "Monthly backup verification shows 2 servers with incomplete backups from last week. Need investigation and remediation.",
        status: "Open",
        priority: "Critical",
        category: "Infrastructure",
        reportedBy: staff[6].id,
        reportedByName: "Lisa Martinez",
        reportedFromDepartment: "DevOps",
        reportDate: "2025-01-11",
        reportTime: "17:25",
        assignedTo: staff[2].id,
        assignedToName: "Emily Davis",
      },
    }),
  ]);

  // Create Ticket Comments
  await Promise.all([
    prisma.ticketComment.create({ data: { ticketId: tickets[0].id, authorId: staff[7].id, authorName: "David Brown", content: "This started happening yesterday after the latest macOS update." } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[0].id, authorId: staff[1].id, authorName: "Michael Chen", content: "I see the issue - the VPN server configuration was updated yesterday. Let me push a fix to your client.", isInternal: false } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[0].id, authorId: staff[1].id, authorName: "Michael Chen", content: "VPN config fix deployed. Please restart your VPN client and try connecting again.", isInternal: false } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[2].id, authorId: staff[4].id, authorName: "Aisha Patel", content: "Account unlocked. I've also reset your password and sent a temporary one to your personal email." } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[2].id, authorId: staff[7].id, authorName: "David Brown", content: "Got it, working now. Thanks for the quick response!" } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[3].id, authorId: staff[1].id, authorName: "Michael Chen", content: "I've inspected the printer. The fuser assembly needs replacement. Ordering the part now.", isInternal: true } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[5].id, authorId: staff[3].id, authorName: "James Wilson", content: "Initial investigation shows the access points in Building B are running old firmware. Starting firmware update process." } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[7].id, authorId: staff[3].id, authorName: "James Wilson", content: "Firewall rules updated and tested. All traffic flowing correctly with new policies." } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[7].id, authorId: staff[5].id, authorName: "Robert Taylor", content: "Verified the changes. Security audit passed. Great work!" } }),
    prisma.ticketComment.create({ data: { ticketId: tickets[9].id, authorId: staff[2].id, authorName: "Emily Davis", content: "Investigating the backup logs now. Will update shortly.", isInternal: true } }),
  ]);

  console.log("✅ Seed data created successfully!");
  console.log(`  - ${staff.length} staff members`);
  console.log(`  - ${assets.length} assets`);
  console.log(`  - ${inventoryItems.length} inventory items`);
  console.log(`  - ${tickets.length} tickets`);

  // Create Vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: "Apple Inc.",
        contactPerson: "John Smith",
        email: "enterprise@apple.com",
        phone: "+1-800-275-2273",
        website: "https://www.apple.com/business",
        address: "One Apple Park Way, Cupertino, CA 95014",
        contractStart: new Date("2023-01-01"),
        contractEnd: new Date("2025-12-31"),
        rating: 5,
        category: "Hardware",
        status: "Active",
        notes: "Preferred vendor for MacBooks and iOS devices. Volume discount agreement in place.",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Dell Technologies",
        contactPerson: "Maria Garcia",
        email: "sales@dell.com",
        phone: "+1-800-624-9896",
        website: "https://www.dell.com",
        address: "One Dell Way, Round Rock, TX 78682",
        contractStart: new Date("2022-06-01"),
        contractEnd: new Date("2025-05-31"),
        rating: 4,
        category: "Hardware",
        status: "Active",
        notes: "Primary vendor for desktops and laptops. Next business day warranty service.",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Cisco Systems",
        contactPerson: "Kevin Lee",
        email: "enterprise@cisco.com",
        phone: "+1-800-553-2447",
        website: "https://www.cisco.com",
        address: "170 West Tasman Drive, San Jose, CA 95134",
        contractStart: new Date("2021-01-01"),
        contractEnd: new Date("2026-12-31"),
        rating: 5,
        category: "Network",
        status: "Active",
        notes: "Network infrastructure provider. SmartNet support contract active.",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Microsoft",
        contactPerson: "Sarah Kim",
        email: "licensing@microsoft.com",
        phone: "+1-800-642-7676",
        website: "https://www.microsoft.com/business",
        address: "One Microsoft Way, Redmond, WA 98052",
        contractStart: new Date("2024-01-01"),
        contractEnd: new Date("2024-12-31"),
        rating: 4,
        category: "Software",
        status: "Active",
        notes: "Microsoft 365 and Azure services. Annual enterprise agreement renewal.",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Logitech",
        contactPerson: "Tom Brown",
        email: "b2b@logitech.com",
        phone: "+1-617-254-1000",
        website: "https://www.logitech.com",
        address: "7700 Gateway Blvd, Newark, CA 94560",
        rating: 3,
        category: "Peripherals",
        status: "Active",
        notes: "Peripheral devices - mice, keyboards, webcams. Standard procurement.",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "APC by Schneider Electric",
        contactPerson: "Lisa Wang",
        email: "sales@apc.com",
        phone: "+1-800-800-4272",
        website: "https://www.apc.com",
        address: "132 Fairgrounds Road, West Kingston, RI 02892",
        contractStart: new Date("2022-01-01"),
        contractEnd: new Date("2024-12-31"),
        rating: 4,
        category: "Infrastructure",
        status: "Active",
        notes: "UPS and power management solutions. Contract renewal pending.",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Anker Innovations",
        contactPerson: "David Chen",
        email: "wholesale@anker.com",
        phone: "+1-800-988-7973",
        website: "https://www.anker.com",
        address: "1992 S. Coast Hwy, Suite 400, Laguna Beach, CA 92651",
        rating: 4,
        category: "Accessories",
        status: "Active",
        notes: "USB adapters, charging solutions, and accessories.",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Lenovo",
        contactPerson: "Amy Zhang",
        email: "enterprise@lenovo.com",
        phone: "+1-855-253-6686",
        website: "https://www.lenovo.com",
        address: "1009 Think Place, Morrisville, NC 27560",
        contractStart: new Date("2023-04-01"),
        contractEnd: new Date("2025-03-31"),
        rating: 4,
        category: "Hardware",
        status: "Active",
        notes: "ThinkPad series laptops. Premier support included.",
      },
    }),
  ]);

  // Create Knowledge Base Articles
  const articles = await Promise.all([
    prisma.knowledgeBaseArticle.create({
      data: {
        title: "How to Reset Your Password",
        content: "## Password Reset Guide\n\nFollow these steps to reset your password:\n\n1. Go to the **Self-Service Portal** at `https://portal.company.com`\n2. Click **\"Forgot Password\"**\n3. Enter your work email address\n4. Check your email for the reset link\n5. Create a new password (minimum 12 characters, 1 uppercase, 1 number, 1 special)\n6. Log in with your new password\n\n### Requirements\n- Password must be at least 12 characters\n- Must contain uppercase and lowercase letters\n- Must contain at least one number\n- Must contain at least one special character\n- Cannot be the same as your last 5 passwords\n\n### If Self-Service Doesn't Work\nContact IT Support at ext. 4400 or create a ticket.",
        category: "How-To",
        tags: "password, reset, self-service, account",
        author: "Sarah Johnson",
        status: "Published",
        views: 156,
      },
    }),
    prisma.knowledgeBaseArticle.create({
      data: {
        title: "VPN Setup Guide for Remote Workers",
        content: "## VPN Configuration\n\n### Prerequisites\n- Company laptop with admin access\n- Active directory credentials\n\n### Installation Steps\n\n1. **Download** the VPN client from the IT portal\n2. **Install** with default settings\n3. **Configure** the connection profile:\n   - Server: `vpn.company.com`\n   - Protocol: IKEv2\n   - Port: 443\n4. **Connect** using your company email and password\n5. **Verify** connection by checking your IP address\n\n### Troubleshooting\n- **Error 429**: Too many login attempts. Wait 5 minutes and retry.\n- **Slow Connection**: Switch to a different VPN server region.\n- **Cannot Browse**: Check DNS settings in VPN preferences.\n\n### Support\nFor issues, contact Network Ops at ext. 4401.",
        category: "Network",
        tags: "vpn, remote, network, setup, configuration",
        author: "James Wilson",
        status: "Published",
        views: 89,
      },
    }),
    prisma.knowledgeBaseArticle.create({
      data: {
        title: "New Employee IT Equipment Checklist",
        content: "## Onboarding Equipment Checklist\n\n### Standard Equipment Package\n- [ ] Laptop (MacBook Pro or Dell XPS)\n- [ ] Monitor + stand\n- [ ] Keyboard + mouse\n- [ ] Headset (for video calls)\n- [ ] Laptop lock cable\n- [ ] USB-C hub/docking station\n\n### Software Setup\n- [ ] Microsoft 365 (Email, Teams, OneDrive)\n- [ ] VPN client\n- [ ] Antivirus software\n- [ ] Slack / Teams\n- [ ] Development tools (if applicable)\n\n### Access Setup\n- [ ] Active Directory account\n- [ ] Email account\n- [ ] WiFi access (Eduroam + Company)\n- [ ] VPN access\n- [ ] File share permissions\n- [ ] Printer access\n\n### Timeline\n- Equipment ready: **Day 1**\n- All access provisioned: **Day 1**\n- Software installed: **Day 2**\n- Orientation walkthrough: **Day 3**",
        category: "Policy",
        tags: "onboarding, new-employee, equipment, checklist",
        author: "Sarah Johnson",
        status: "Published",
        views: 234,
      },
    }),
    prisma.knowledgeBaseArticle.create({
      data: {
        title: "Printer Troubleshooting Guide",
        content: "## Common Printer Issues\n\n### Paper Jam\n1. Open the printer cover carefully\n2. Remove jammed paper in the direction of paper travel\n3. Check for torn pieces\n4. Close cover and retry\n\n### Print Quality Issues\n- **Streaks/Lines**: Clean the print head (Settings > Maintenance > Clean)\n- **Faded Print**: Replace toner cartridge\n- **Smudges**: Check drum unit and replace if needed\n\n### Cannot Connect\n1. Verify printer is powered on\n2. Check network cable / WiFi connection\n3. Restart the printer\n4. Reinstall the printer driver\n\n### Requesting New Toner\nSubmit a ticket through the IT portal. Include:\n- Printer model name\n- Printer location\n- Current toner level (if visible)\n\n### Emergency Contacts\n- HP Printer Support: ext. 4405\n- Canon Printer Support: ext. 4406",
        category: "Troubleshooting",
        tags: "printer, troubleshooting, paper-jam, toner, hardware",
        author: "Michael Chen",
        status: "Published",
        views: 67,
      },
    }),
    prisma.knowledgeBaseArticle.create({
      data: {
        title: "Software Request and Approval Process",
        content: "## Software Request Process\n\n### Step 1: Submit Request\nFill out the Software Request Form in the IT portal with:\n- Software name and version\n- Business justification\n- Number of licenses needed\n- Budget code\n\n### Step 2: Review\n- IT reviews for security compliance\n- Checks against approved software list\n- Evaluates license costs\n\n### Step 3: Approval\n- Requests under $500: IT Manager approval\n- Requests over $500: IT Director approval\n- Security-sensitive software: CISO review required\n\n### Step 4: Deployment\n- IT installs and configures the software\n- User receives access credentials if applicable\n- Training materials provided if needed\n\n### Turnaround Time\n- Standard requests: **3-5 business days**\n- Urgent requests: **1-2 business days** (with manager approval)\n\n### Approved Software List\nSee the internal wiki for the full list of pre-approved software that doesn't require additional approval.",
        category: "Policy",
        tags: "software, request, approval, process, policy",
        author: "Lisa Martinez",
        status: "Published",
        views: 45,
      },
    }),
    prisma.knowledgeBaseArticle.create({
      data: {
        title: "WiFi Network Setup and Troubleshooting",
        content: "## WiFi Networks\n\n### Available Networks\n| Network | Purpose | Auth |\n|---------|---------|------|\n| Company-Secure | Primary work network | 802.1X |\n| Company-Guest | Visitor network | Captive portal |\n| Company-IoT | IoT devices only | MAC auth |\n\n### Connecting to Company-Secure\n1. Select \"Company-Secure\" from WiFi list\n2. Enter your company email and password\n3. Accept the security certificate\n4. You're connected!\n\n### Troubleshooting\n- **Can't see network**: Check if WiFi is enabled\n- **Authentication failed**: Reset your network password\n- **Very slow**: Move closer to an access point or switch bands (2.4/5GHz)\n- **Keeps disconnecting**: Forget the network and rejoin\n\n### For Network Engineers\n- Access point management: `https://ap-manager.internal`\n- Monitoring dashboard: `https://grafana.internal/wifi`",
        category: "Network",
        tags: "wifi, network, troubleshooting, connection",
        author: "James Wilson",
        status: "Published",
        views: 112,
      },
    }),
  ]);

  console.log(`  - ${vendors.length} vendors`);
  console.log(`  - ${articles.length} knowledge base articles`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
