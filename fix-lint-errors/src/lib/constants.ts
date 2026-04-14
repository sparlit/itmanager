// ─── Animation Variants ────────────────────────────────────────────────────
export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export const itemVariantsFast = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Status Colors ──────────────────────────────────────────────────────────
export const TICKET_STATUS_COLORS: Record<string, string> = {
  Open: "bg-sky-50 text-sky-700 border-sky-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-50 text-slate-600 border-slate-200",
};

export const TICKET_PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-sky-50 text-sky-700 border-sky-200",
};

export const ASSET_STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Use": "bg-sky-50 text-sky-700 border-sky-200",
  "Under Maintenance": "bg-amber-50 text-amber-700 border-amber-200",
  Retired: "bg-slate-100 text-slate-600 border-slate-200",
};

export const ASSET_CONDITION_COLORS: Record<string, string> = {
  Excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Good: "bg-sky-50 text-sky-700 border-sky-200",
  Fair: "bg-amber-50 text-amber-700 border-amber-200",
  Poor: "bg-rose-50 text-rose-700 border-rose-200",
};

export const STAFF_STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-slate-50 text-slate-500 border-slate-200",
};

export const VENDOR_STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-50 text-slate-500 border-slate-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
};

export const LICENSE_STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Expired: "bg-rose-50 text-rose-700 border-rose-200",
  Suspended: "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-sky-50 text-sky-700 border-sky-200",
};

export const CHANGE_STATUS_COLORS: Record<string, string> = {
  Draft: "bg-slate-50 text-slate-700 border-slate-200",
  "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  "In Progress": "bg-violet-50 text-violet-700 border-violet-200",
  Completed: "bg-teal-50 text-teal-700 border-teal-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  Cancelled: "bg-gray-50 text-gray-700 border-gray-200",
};

export const CHANGE_RISK_COLORS: Record<string, string> = {
  Low: "text-emerald-600 bg-emerald-50",
  Medium: "text-amber-600 bg-amber-50",
  High: "text-orange-600 bg-orange-50",
  Critical: "text-rose-600 bg-rose-50",
};

// ─── Module Theme Colors ───────────────────────────────────────────────────
export const MODULE_THEMES: Record<string, string> = {
  dashboard: "from-slate-600 to-slate-500",
  tickets: "from-sky-600 to-blue-500",
  assets: "from-violet-600 to-purple-500",
  inventory: "from-emerald-600 to-green-500",
  staff: "from-emerald-600 to-teal-500",
  vendors: "from-amber-600 to-orange-500",
  "knowledge-base": "from-blue-600 to-indigo-500",
  calendar: "from-cyan-600 to-teal-500",
  reports: "from-indigo-600 to-violet-500",
  licenses: "from-indigo-600 to-blue-500",
  changes: "from-rose-600 to-pink-500",
  "time-tracking": "from-cyan-600 to-teal-500",
  "audit-log": "from-slate-600 to-gray-500",
  "sla-config": "from-amber-600 to-amber-500",
  "service-catalog": "from-teal-600 to-emerald-500",
  budgets: "from-emerald-600 to-teal-500",
  backups: "from-sky-600 to-blue-500",
};

// ─── Default Window Sizes ──────────────────────────────────────────────────
export const WINDOW_SIZES: Record<string, { w: number; h: number }> = {
  staff: { w: 700, h: 650 },
  tickets: { w: 800, h: 700 },
  assets: { w: 850, h: 750 },
  inventory: { w: 800, h: 700 },
  vendors: { w: 800, h: 700 },
  licenses: { w: 750, h: 700 },
  changes: { w: 850, h: 750 },
  "time-tracking": { w: 600, h: 550 },
  "sla-config": { w: 650, h: 550 },
  "knowledge-base": { w: 850, h: 750 },
};
