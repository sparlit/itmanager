import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(6, 'Password must be 6+ characters'),
});

// Staff schemas
export const staffSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const staffUpdateSchema = staffSchema.partial();

// Asset schemas
export const assetSchema = z.object({
  name: z.string().min(1, 'Name required'),
  serialNumber: z.string().min(1, 'Serial number required'),
  category: z.string().min(1, 'Category required'),
  status: z.enum(['Available', 'In Use', 'Maintenance', 'Retired']).optional(),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']).optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().optional(),
  warrantyEnd: z.string().optional(),
  vendor: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const assetAssignmentSchema = z.object({
  assetId: z.string().min(1, 'Asset ID required'),
  staffId: z.string().min(1, 'Staff ID required'),
  notes: z.string().optional(),
});

export const assetMaintenanceSchema = z.object({
  type: z.string().min(1, 'Type required'),
  description: z.string().min(1, 'Description required'),
  performedBy: z.string().min(1, 'Performed by required'),
  cost: z.number().optional(),
});

// Inventory schemas
export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name required'),
  category: z.string().min(1, 'Category required'),
  sku: z.string().min(1, 'SKU required'),
  barcode: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  minStockLevel: z.number().int().min(0).optional(),
  maxStockLevel: z.number().int().min(0).optional(),
  reorderQty: z.number().int().min(0).optional(),
  unitPrice: z.number().optional(),
  unitCost: z.number().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  binLocation: z.string().optional(),
  notes: z.string().optional(),
});

export const inventoryTransactionSchema = z.object({
  itemId: z.string().min(1, 'Item ID required'),
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number().int().min(1, 'Quantity must be positive'),
  notes: z.string().optional(),
});

// Vendor schemas
export const vendorSchema = z.object({
  name: z.string().min(1, 'Name required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

// Ticket schemas
export const ticketSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  category: z.string().optional(),
});

export const ticketCommentSchema = z.object({
  content: z.string().min(1, 'Comment required'),
  isInternal: z.boolean().optional(),
});

// License schemas
export const licenseSchema = z.object({
  name: z.string().min(1, 'Name required'),
  productKey: z.string().min(1, 'Product key required'),
  licenseType: z.string().min(1, 'License type required'),
  vendor: z.string().optional(),
  expirationDate: z.string().optional(),
  assignedTo: z.string().optional(),
  seats: z.number().int().min(1).optional(),
});

// User schemas
export const userSchema = z.object({
  username: z.string().min(1, 'Username required'),
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['Admin', 'Manager', 'Staff', 'Customer']),
  status: z.enum(['Active', 'Inactive']).optional(),
});

// Announcement schemas
export const announcementSchema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string().min(1, 'Content required'),
  priority: z.enum(['Low', 'Normal', 'High']).optional(),
  expiresAt: z.string().optional(),
});

// Notification schemas
export const notificationSchema = z.object({
  title: z.string().min(1, 'Title required'),
  message: z.string().min(1, 'Message required'),
  type: z.enum(['info', 'success', 'warning', 'error']).optional(),
  link: z.string().optional(),
});

// Budget schemas
export const budgetSchema = z.object({
  category: z.string().min(1, 'Category required'),
  amount: z.number().positive('Amount must be positive'),
  year: z.number().int().min(2020),
  description: z.string().optional(),
});

// Change request schemas
export const changeRequestSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  type: z.string().min(1, 'Type required'),
});

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type AssetInput = z.infer<typeof assetSchema>;
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;