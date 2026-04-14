export type ViewType =
  | "dashboard"
  | "tickets"
  | "ticket-detail"
  | "assets"
  | "asset-detail"
  | "inventory"
  | "inventory-detail"
  | "staff"
  | "staff-detail"
  | "vendors"
  | "vendor-detail"
  | "knowledge-base"
  | "knowledge-base-detail"
  | "calendar"
  | "reports"
  | "licenses"
  | "license-detail"
  | "audit-log"
  | "sla-config"
  | "service-catalog"
  | "budgets"
  | "backups"
  | "notifications"
  | "bulk-upload"
  | "system-health"
  | "profile-settings"
  | "preferences"
  | "help-center"
  | "chat-support"
  | "user-management"
  | "announcements";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  isFromSupport: boolean;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  role: string;
  avatar: string | null;
  status: string;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignedTickets: number;
    reportedTickets: number;
    assetAssignments: number;
  };
}

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: string;
  condition: string;
  purchaseDate: string | null;
  purchaseCost: number | null;
  warrantyEnd: string | null;
  vendor: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignments?: AssetAssignment[];
  maintenance?: MaintenanceRecord[];
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  staffId: string;
  assignedAt: string;
  returnedAt: string | null;
  notes: string | null;
  staff?: Staff;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: string;
  description: string;
  performedBy: string;
  performedAt: string;
  cost: number | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  barcode: string | null;
  quantity: number;
  reservedQty: number;
  minStockLevel: number;
  maxStockLevel: number | null;
  reorderQty: number | null;
  unitPrice: number | null;
  unitCost: number | null;
  supplier: string | null;
  location: string | null;
  binLocation: string | null;
  lastRestocked: string | null;
  expiryDate: string | null;
  isActive: boolean;
  deletedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  transactions?: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  batchId: string | null;
  type: string;
  quantity: number;
  performedBy: string;
  notes: string | null;
  referenceNo: string;
  fromLocation: string;
  toLocation: string;
  issuedTo: string;
  issuedToDepartment: string;
  supplierRef: string;
  deliveryNote: string;
  purpose: string;
  transactionNumber: string;
  transactionDate: string;
  transactionTime: string;
  requestedBy: string;
  authorisedBy: string;
  itemCode: string;
  itemDescription: string;
  unitPrice: number;
  totalValue: number;
  createdAt: string;
  batch?: TransactionBatch | null;
}

export interface TransactionBatch {
  id: string;
  batchNumber: string;
  type: string;
  transactionDate: string;
  transactionTime: string;
  requestedBy: string;
  department: string;
  authorisedBy: string;
  fromLocation: string;
  toLocation: string;
  supplierRef: string;
  deliveryNote: string;
  purpose: string;
  notes: string;
  totalItems: number;
  totalValue: number;
  status: string;
  createdAt: string;
  transactions?: InventoryTransaction[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  reportedBy: string | null;
  reportedByName: string;
  reportedFromDepartment: string;
  reportDate: string;
  reportTime: string;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  reporter?: Staff | null;
  assignee?: Staff | null;
  comments?: TicketComment[];
  _count?: {
    comments: number;
  };
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStaff: number;
  activeStaff: number;
  totalAssets: number;
  assetsInUse: number;
  assetsAvailable: number;
  assetsMaintenance: number;
  totalInventoryItems: number;
  lowStockItems: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  onHoldTickets: number;
  criticalTickets: number;
  highTickets: number;
  ticketsByCategory: { category: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  ticketsByStatus: { status: string; count: number }[];
  assetsByCategory: { category: string; count: number }[];
  assetsByStatus: { status: string; count: number }[];
  recentTickets: Ticket[];
  recentActivity: ActivityItem[];
}

export interface TransactionLineItem {
  _tempId: string;
  itemId: string;
  itemCode: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  notes: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  userName: string;
}

// ─── New Module Types ───────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  contractStart: string | null;
  contractEnd: string | null;
  rating: number;
  category: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "warranty" | "maintenance" | "review" | "custom";
  description: string;
  relatedId?: string;
  relatedType?: string;
  color: string;
}

// ── Software License Management ────────────────────────────────
export interface SoftwareLicense {
  id: string;
  name: string;
  vendor: string;
  licenseKey: string;
  licenseType: string;
  totalSeats: number;
  usedSeats: number;
  purchaseDate: string | null;
  expiryDate: string | null;
  autoRenew: boolean;
  cost: number | null;
  status: string;
  category: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  assignments?: LicenseAssignment[];
}

export interface LicenseAssignment {
  id: string;
  licenseId: string;
  staffId: string;
  assignedAt: string;
  returnedAt: string | null;
  notes: string | null;
  staff?: Staff;
}

// ── Change Management ──────────────────────────────────────────
export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  changeType: string;
  priority: string;
  status: string;
  riskLevel: string;
  reason: string;
  implementationPlan: string;
  rollbackPlan: string;
  impactAnalysis: string;
  requestedBy: string | null;
  requestedByName: string;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  completedAt: string | null;
  category: string;
  affectedAssets: string;
  createdAt: string;
  updatedAt: string;
  comments?: ChangeComment[];
}

export interface ChangeComment {
  id: string;
  changeId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// ── Time Tracking ──────────────────────────────────────────────
export interface TimeEntry {
  id: string;
  ticketId: string | null;
  staffId: string | null;
  staffName: string;
  description: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  billable: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ── Audit Log ──────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string | null;
  userName: string;
  details: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  createdAt: string;
}

// ── SLA Policy ─────────────────────────────────────────────────
export interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  responseTime: number;
  resolutionTime: number;
  escalationTime: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Service Catalog ────────────────────────────────────────────
export interface ServiceCatalog {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: string;
  estimatedTime: string;
  approvalRequired: boolean;
  formFields: string;
  sortOrder: number;
  views: number;
  requests: number;
  createdAt: string;
  updatedAt: string;
}

// ── File Attachments ───────────────────────────────────────────
export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  entityType: string;
  entityId: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

// ── Notifications ──────────────────────────────────────────────
export interface AppNotification {
  id: string;
  userId: string;
  userName: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

// ── Budget ─────────────────────────────────────────────────────
export interface Budget {
  id: string;
  name: string;
  department: string;
  fiscalYear: number;
  totalBudget: number;
  spent: number;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Backup Record ──────────────────────────────────────────────
export interface BackupRecord {
  id: string;
  name: string;
  type: string;
  status: string;
  size: number | null;
  location: string;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  notes: string;
  createdAt: string;
}
