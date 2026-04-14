const BASE = "http://localhost:3003";

async function test(name, url, method = "GET", body = null) {
  try {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => null);
    const ok = res.ok ? "✅" : "❌";
    console.log(`${ok} ${name} [${res.status}]`);
    if (!res.ok) console.log(`   Error: ${JSON.stringify(data)}`);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.log(`❌ ${name} [ERROR: ${err.message}]`);
    return { ok: false, status: 0, data: null, error: err.message };
  }
}

async function main() {
  console.log("=== IT Manager API Test Suite ===\n");

  // 1. Staff
  console.log("--- Staff ---");
  await test("Staff GET", `${BASE}/api/staff`);
  const staffPost = await test("Staff POST", `${BASE}/api/staff`, "POST", { name: "Test User", email: "test@example.com", department: "IT", role: "Admin", status: "Active" });
  if (staffPost.data?.staff) {
    await test("Staff UPDATE", `${BASE}/api/staff/update`, "PUT", { id: staffPost.data.staff.id, name: "Updated User" });
    await test("Staff DELETE", `${BASE}/api/staff/delete`, "DELETE", { id: staffPost.data.staff.id });
  }

  // 2. Assets
  console.log("\n--- Assets ---");
  await test("Assets GET", `${BASE}/api/assets`);
  const assetPost = await test("Asset POST", `${BASE}/api/assets`, "POST", { name: "Test Laptop", serialNumber: "SN-TEST-001", category: "Laptop", status: "Available", condition: "Good" });
  if (assetPost.data?.asset) {
    await test("Asset UPDATE", `${BASE}/api/assets/update`, "PUT", { id: assetPost.data.asset.id, name: "Updated Laptop" });
    await test("Asset DELETE", `${BASE}/api/assets/delete`, "DELETE", { id: assetPost.data.asset.id });
  }

  // 3. Inventory
  console.log("\n--- Inventory ---");
  await test("Inventory GET", `${BASE}/api/inventory`);
  const invPost = await test("Inventory POST", `${BASE}/api/inventory`, "POST", { name: "Test Item", category: "Supplies", sku: "SKU-TEST-001", quantity: 10, minStockLevel: 5 });
  if (invPost.data?.item) {
    await test("Inventory UPDATE", `${BASE}/api/inventory/update`, "PUT", { id: invPost.data.item.id, name: "Updated Item" });
    await test("Inventory DELETE", `${BASE}/api/inventory/delete`, "DELETE", { id: invPost.data.item.id });
  }

  // 4. Tickets
  console.log("\n--- Tickets ---");
  await test("Tickets GET", `${BASE}/api/tickets`);
  const ticketPost = await test("Ticket POST", `${BASE}/api/tickets`, "POST", { title: "Test Ticket", description: "Test description", category: "Hardware", priority: "Medium", status: "Open", reportedByName: "Test User" });
  if (ticketPost.data?.ticket) {
    await test("Ticket UPDATE", `${BASE}/api/tickets/update`, "PUT", { id: ticketPost.data.ticket.id, title: "Updated Ticket" });
    await test("Ticket Comment POST", `${BASE}/api/tickets/comments`, "POST", { ticketId: ticketPost.data.ticket.id, content: "Test comment", authorName: "Test User" });
    await test("Ticket Comment GET", `${BASE}/api/tickets/comments?ticketId=${ticketPost.data.ticket.id}`);
    await test("Ticket DELETE", `${BASE}/api/tickets/delete`, "DELETE", { id: ticketPost.data.ticket.id });
  }

  // 5. Vendors
  console.log("\n--- Vendors ---");
  await test("Vendors GET", `${BASE}/api/vendors`);
  const vendorPost = await test("Vendor POST", `${BASE}/api/vendors`, "POST", { name: "Test Vendor", email: "vendor@test.com", category: "Hardware", status: "Active" });
  if (vendorPost.data?.vendor) {
    await test("Vendor UPDATE", `${BASE}/api/vendors/update`, "PUT", { id: vendorPost.data.vendor.id, name: "Updated Vendor" });
    await test("Vendor DELETE", `${BASE}/api/vendors/delete`, "DELETE", { id: vendorPost.data.vendor.id });
  }

  // 6. Knowledge Base
  console.log("\n--- Knowledge Base ---");
  await test("KB GET", `${BASE}/api/knowledge-base`);
  const kbPost = await test("KB POST", `${BASE}/api/knowledge-base`, "POST", { title: "Test Article", content: "Test content", category: "General", author: "Test", status: "Published" });
  if (kbPost.data?.article) {
    await test("KB UPDATE", `${BASE}/api/knowledge-base/update`, "PUT", { id: kbPost.data.article.id, title: "Updated Article" });
    await test("KB DELETE", `${BASE}/api/knowledge-base/delete?id=${kbPost.data.article.id}`);
  }

  // 7. Licenses
  console.log("\n--- Licenses ---");
  await test("Licenses GET", `${BASE}/api/licenses`);
  const licPost = await test("License POST", `${BASE}/api/licenses`, "POST", { name: "Test License", vendor: "Test Vendor", licenseType: "Perpetual", totalSeats: 10, status: "Active", category: "Software" });
  if (licPost.data?.license) {
    await test("License UPDATE", `${BASE}/api/licenses/update`, "PUT", { id: licPost.data.license.id, name: "Updated License" });
    await test("License DELETE", `${BASE}/api/licenses/delete`, "DELETE", { id: licPost.data.license.id });
  }

  // 8. Changes
  console.log("\n--- Changes ---");
  await test("Changes GET", `${BASE}/api/changes`);
  const changePost = await test("Change POST", `${BASE}/api/changes`, "POST", { title: "Test Change", description: "Test description", changeType: "Standard", priority: "Medium", riskLevel: "Low", status: "Draft", category: "Infrastructure" });
  if (changePost.data?.change) {
    await test("Change UPDATE", `${BASE}/api/changes/update`, "PUT", { id: changePost.data.change.id, title: "Updated Change" });
    await test("Change Comment POST", `${BASE}/api/changes/comments`, "POST", { changeId: changePost.data.change.id, authorName: "Test User", content: "Test comment" });
    await test("Change DELETE", `${BASE}/api/changes/delete`, "DELETE", { id: changePost.data.change.id });
  }

  // 9. Time Entries
  console.log("\n--- Time Tracking ---");
  await test("Time Entries GET", `${BASE}/api/time-entries`);
  await test("Time Entry POST", `${BASE}/api/time-entries`, "POST", { description: "Test work", staffName: "Test User", startTime: new Date().toISOString(), duration: 1.5, category: "Work" });

  // 10. Calendar
  console.log("\n--- Calendar ---");
  await test("Calendar GET", `${BASE}/api/calendar`);

  // 11. Dashboard
  console.log("\n--- Dashboard ---");
  await test("Dashboard GET", `${BASE}/api/dashboard`);

  // 12. Notifications
  console.log("\n--- Notifications ---");
  await test("Notifications GET", `${BASE}/api/notifications`);
  const notifPost = await test("Notification POST", `${BASE}/api/notifications`, "POST", { userId: "system", title: "Test", message: "Test notification", type: "info" });
  if (notifPost.data?.notification) {
    await test("Notification UPDATE", `${BASE}/api/notifications/update`, "PUT", { id: notifPost.data.notification.id, isRead: true });
    await test("Notification DELETE", `${BASE}/api/notifications/delete`, "DELETE", { id: notifPost.data.notification.id });
  }

  // 13. SLA Policies
  console.log("\n--- SLA Policies ---");
  await test("SLA GET", `${BASE}/api/sla-policies`);
  const slaPost = await test("SLA POST", `${BASE}/api/sla-policies`, "POST", { name: "Test SLA", category: "All", priority: "All", responseTime: 60, resolutionTime: 480, escalationTime: 240 });
  if (slaPost.data?.policy) {
    await test("SLA UPDATE", `${BASE}/api/sla-policies`, "PUT", { id: slaPost.data.policy.id, name: "Updated SLA" });
    await test("SLA DELETE", `${BASE}/api/sla-policies/delete`, "DELETE", { id: slaPost.data.policy.id });
  }

  // 14. Service Catalog
  console.log("\n--- Service Catalog ---");
  await test("Service Catalog GET", `${BASE}/api/service-catalog`);
  const svcPost = await test("Service POST", `${BASE}/api/service-catalog`, "POST", { name: "Test Service", description: "Test", category: "General", icon: "Package" });
  if (svcPost.data?.service) {
    await test("Service Request POST", `${BASE}/api/service-requests`, "POST", { serviceId: svcPost.data.service.id });
  }

  // 15. Budgets
  console.log("\n--- Budgets ---");
  await test("Budgets GET", `${BASE}/api/budgets`);
  const budgetPost = await test("Budget POST", `${BASE}/api/budgets`, "POST", { name: "Test Budget", department: "IT", fiscalYear: 2026, totalBudget: 10000, category: "General" });
  if (budgetPost.data?.budget) {
    await test("Budget UPDATE", `${BASE}/api/budgets`, "PUT", { id: budgetPost.data.budget.id, name: "Updated Budget" });
    await test("Budget DELETE", `${BASE}/api/budgets`, "DELETE", { id: budgetPost.data.budget.id });
  }

  // 16. Backups
  console.log("\n--- Backups ---");
  await test("Backups GET", `${BASE}/api/backups`);
  const backupPost = await test("Backup POST", `${BASE}/api/backups`, "POST", { name: "Test Backup", type: "Manual" });
  if (backupPost.data?.backup) {
    await test("Backup UPDATE", `${BASE}/api/backups`, "PUT", { id: backupPost.data.backup.id, status: "Completed" });
  }

  // 17. Audit Log
  console.log("\n--- Audit Log ---");
  await test("Audit Log GET", `${BASE}/api/audit-log`);

  // 18. Attachments
  console.log("\n--- Attachments ---");
  await test("Attachments GET", `${BASE}/api/attachments`);
  const attachPost = await test("Attachment POST", `${BASE}/api/attachments`, "POST", { fileName: "test.pdf", originalName: "test.pdf", mimeType: "application/pdf", size: 1024, path: "/tmp", entityType: "ticket", entityId: "test" });
  if (attachPost.data?.attachment) {
    await test("Attachment DELETE", `${BASE}/api/attachments`, "DELETE", { id: attachPost.data.attachment.id });
  }

  // 19. Export
  console.log("\n--- Export ---");
  await test("Export GET", `${BASE}/api/export`);

  console.log("\n=== Test Complete ===");
}

main().catch(console.error);
