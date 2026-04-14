"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  TicketCheck,
  Monitor,
  Package,
  Users,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  PieChartIcon,
  Clock,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Staff, Ticket, InventoryItem } from "@/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

// ─── API Response Shape ─────────────────────────────────────────
interface DashboardApiResponse {
  staffCount: { total: number; active: number };
  assetCount: {
    total: number;
    inUse: number;
    available: number;
    underMaintenance: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
  inventoryCount: { total: number; lowStock: number };
  ticketCount: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  };
  slaMetrics: {
    avgResolutionHours: number;
    overdueTicketCount: number;
  };
  inventoryValue: {
    totalValue: number;
    top5Items: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      unitPrice: number;
      totalValue: number;
    }>;
  };
  ticketAging: {
    "0-24h": number;
    "24-72h": number;
    "3-7d": number;
    "7d+": number;
  };
  staffWorkload: Array<{
    staffId: string;
    staffName: string;
    ticketCount: number;
  }>;
  upcomingWarranties: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
    warrantyEnd: string;
  }>;
}

// ─── Color Maps ─────────────────────────────────────────────────
const PIE_COLORS = [
  "var(--color-emerald-600)",
  "var(--color-sky-500)",
  "var(--color-violet-500)",
  "var(--color-amber-500)",
  "var(--color-rose-500)",
  "var(--color-teal-600)",
  "var(--color-orange-500)",
  "var(--color-blue-500)",
];

const STATUS_BAR_COLORS: Record<string, string> = {
  Open: "var(--color-emerald-500)",
  "In Progress": "var(--color-amber-500)",
  "On Hold": "var(--color-slate-400)",
  Resolved: "var(--color-teal-500)",
  Closed: "var(--color-gray-400)",
};

const ASSET_STATUS_COLORS: Record<string, string> = {
  Available: "var(--color-emerald-500)",
  "In Use": "var(--color-sky-500)",
  "Under Maintenance": "var(--color-amber-500)",
  Retired: "var(--color-slate-400)",
};

const PRIORITY_BADGE_COLORS: Record<string, string> = {
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Low: "bg-sky-50 text-sky-700 border-sky-200",
};

const TICKET_STATUS_BADGE_COLORS: Record<string, string> = {
  Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "On Hold": "bg-slate-100 text-slate-600 border-slate-200",
  Resolved: "bg-teal-50 text-teal-700 border-teal-200",
  Closed: "bg-slate-100 text-slate-500 border-slate-200",
};

const AGING_COLORS: Record<string, string> = {
  "0-24h": "var(--color-emerald-500)",
  "24-72h": "var(--color-amber-500)",
  "3-7d": "var(--color-orange-500)",
  "7d+": "var(--color-rose-500)",
};

const WORKLOAD_GRADIENTS = [
  "var(--color-emerald-700)",
  "var(--color-emerald-600)",
  "var(--color-emerald-500)",
  "var(--color-teal-500)",
  "var(--color-teal-400)",
];

// ─── Chart Configs ──────────────────────────────────────────────
const ticketCategoryChartConfig: ChartConfig = {
  count: { label: "Tickets", color: "var(--color-emerald-500)" },
};

const priorityChartConfig: ChartConfig = {
  Critical: { label: "Critical", color: "var(--color-rose-500)" },
  High: { label: "High", color: "var(--color-orange-500)" },
  Medium: { label: "Medium", color: "var(--color-yellow-500)" },
  Low: { label: "Low", color: "var(--color-emerald-500)" },
};

const assetStatusChartConfig: ChartConfig = {
  count: { label: "Assets", color: "var(--color-sky-500)" },
};

const inventoryChartConfig: ChartConfig = {
  quantity: { label: "Current Stock", color: "var(--color-emerald-500)" },
  minStockLevel: { label: "Min Level", color: "var(--color-rose-400)" },
};

const staffWorkloadChartConfig: ChartConfig = {
  ticketCount: { label: "Tickets", color: "var(--color-emerald-500)" },
};

const ticketAgingChartConfig: ChartConfig = {
  count: { label: "Tickets", color: "var(--color-emerald-500)" },
  "0-24h": { label: "0-24h", color: "var(--color-emerald-500)" },
  "24-72h": { label: "24-72h", color: "var(--color-amber-500)" },
  "3-7d": { label: "3-7d", color: "var(--color-orange-500)" },
  "7d+": { label: "7d+", color: "var(--color-rose-500)" },
};

// ─── Animation Variants ─────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function ReportsView() {
  const [dashboardData, setDashboardData] =
    useState<DashboardApiResponse | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { setView } = useAppStore();

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const json = await res.json();
        setStaff(json.staff || []);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const json = await res.json();
        setInventory(json.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([
        fetchDashboard(),
        fetchStaff(),
        fetchInventory(),
        fetchTickets(),
      ]);
      setLoading(false);
    }
    loadData();
  }, [fetchDashboard, fetchStaff, fetchInventory, fetchTickets]);

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-slate-200/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-7 w-14 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-slate-200/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[260px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-slate-200/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-40 rounded" />
              </CardHeader>
              <CardContent>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="mb-2 h-10 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-[13px] text-slate-500">
          Failed to load report data.
        </p>
      </div>
    );
  }

  // ─── Transform Data ────────────────────────────────────────────
  const ticketsByCategoryData = Object.entries(
    dashboardData.ticketCount.byCategory
  ).map(([category, count], idx) => ({
    category,
    count: count as number,
    fill: PIE_COLORS[idx % PIE_COLORS.length],
  }));

  const ticketsByPriorityData = Object.entries(
    dashboardData.ticketCount.byPriority
  ).map(([priority, count]) => ({
    priority,
    count: count as number,
    fill:
      priority === "Critical"
        ? "var(--color-rose-500)"
        : priority === "High"
          ? "var(--color-orange-500)"
          : priority === "Medium"
            ? "var(--color-yellow-500)"
            : "var(--color-emerald-500)",
  }));

  const assetStatusData = Object.entries(
    dashboardData.assetCount.byStatus || {}
  ).map(([status, count]) => ({
    status,
    count: count as number,
    fill: ASSET_STATUS_COLORS[status] || "var(--color-gray-400)",
  }));

  // Filter low stock items for the table
  const lowStockItems = inventory.filter(
    (item) => item.quantity < item.minStockLevel
  );

  // For inventory health chart - show all items fetched
  const allInventoryData = inventory.slice(0, 10).map((item) => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + "..." : item.name,
    quantity: item.quantity,
    minStockLevel: item.minStockLevel,
  }));

  const topStaff = [...staff]
    .sort(
      (a, b) =>
        (b._count?.assignedTickets || 0) - (a._count?.assignedTickets || 0)
    )
    .slice(0, 5);

  const urgentTickets = tickets.filter(
    (t) =>
      (t.priority === "Critical" || t.priority === "High") &&
      t.status !== "Closed" &&
      t.status !== "Resolved"
  );

  const totalTicketCount = dashboardData.ticketCount.total;
  const openCount = dashboardData.ticketCount.byStatus["Open"] || 0;
  const inProgressCount =
    dashboardData.ticketCount.byStatus["In Progress"] || 0;
  const resolvedCount = dashboardData.ticketCount.byStatus["Resolved"] || 0;
  const closedCount = dashboardData.ticketCount.byStatus["Closed"] || 0;

  // ─── New Data Transforms ───────────────────────────────────────
  const slaMetrics = dashboardData.slaMetrics || {
    avgResolutionHours: 0,
    overdueTicketCount: 0,
  };

  const inventoryValue = dashboardData.inventoryValue || {
    totalValue: 0,
    top5Items: [],
  };

  const ticketAging = dashboardData.ticketAging || {
    "0-24h": 0,
    "24-72h": 0,
    "3-7d": 0,
    "7d+": 0,
  };

  const ticketAgingData = Object.entries(ticketAging).map(
    ([bucket, count]) => ({
      bucket,
      count: count as number,
      fill: AGING_COLORS[bucket] || "var(--color-gray-400)",
    })
  );

  const staffWorkloadData = (dashboardData.staffWorkload || [])
    .slice()
    .sort((a, b) => b.ticketCount - a.ticketCount)
    .slice(0, 8)
    .map((entry, idx) => ({
      name:
        entry.staffName.length > 18
          ? entry.staffName.slice(0, 18) + "..."
          : entry.staffName,
      ticketCount: entry.ticketCount,
      fill: WORKLOAD_GRADIENTS[idx % WORKLOAD_GRADIENTS.length],
    }));

  const upcomingWarranties = dashboardData.upcomingWarranties || [];

  const getDaysRemaining = (warrantyEnd: string) => {
    return Math.ceil(
      (new Date(warrantyEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };


  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Summary Cards ─────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {[
          {
            label: "Total Tickets",
            value: totalTicketCount,
            icon: TicketCheck,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
            gradient: "from-emerald-500 to-emerald-600",
            breakdown: [
              { color: "bg-emerald-500", label: `${openCount} open` },
              {
                color: "bg-amber-500",
                label: `${inProgressCount} in progress`,
              },
              { color: "bg-teal-500", label: `${resolvedCount} resolved` },
              { color: "bg-gray-400", label: `${closedCount} closed` },
            ],
          },
          {
            label: "Total Assets",
            value: dashboardData.assetCount.total,
            icon: Monitor,
            bg: "bg-sky-50",
            color: "text-sky-600",
            gradient: "from-sky-500 to-sky-600",
            breakdown: [
              {
                color: "bg-sky-500",
                label: `${dashboardData.assetCount.inUse} in use`,
              },
              {
                color: "bg-emerald-500",
                label: `${dashboardData.assetCount.available} available`,
              },
              {
                color: "bg-amber-500",
                label: `${dashboardData.assetCount.underMaintenance} maint.`,
              },
            ],
          },
          {
            label: "Inventory Items",
            value: dashboardData.inventoryCount.total,
            icon: Package,
            bg: "bg-amber-50",
            color: "text-amber-600",
            gradient: "from-amber-500 to-amber-600",
            breakdown: [
              {
                color: dashboardData.inventoryCount.lowStock > 0
                  ? "bg-rose-500"
                  : "bg-emerald-500",
                label: `${dashboardData.inventoryCount.lowStock} below min stock`,
              },
            ],
            badge:
              dashboardData.inventoryCount.lowStock > 0
                ? {
                    text: `${dashboardData.inventoryCount.lowStock} low`,
                    className:
                      "bg-rose-50 text-rose-700 border-rose-200 text-[11px] rounded-lg",
                  }
                : null,
          },
          {
            label: "Low Stock Alerts",
            value: dashboardData.inventoryCount.lowStock,
            icon: AlertTriangle,
            bg: dashboardData.inventoryCount.lowStock > 0
              ? "bg-rose-50"
              : "bg-emerald-50",
            color:
              dashboardData.inventoryCount.lowStock > 0
                ? "text-rose-600"
                : "text-emerald-600",
            gradient:
              dashboardData.inventoryCount.lowStock > 0
                ? "from-rose-500 to-rose-600"
                : "from-emerald-500 to-emerald-600",
            breakdown: [],
          },
        ].map((card) => (
          <Card
            key={card.label}
            className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      card.bg
                    )}
                  >
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                      {card.label}
                    </p>
                    <p className="text-[26px] font-bold text-slate-900 leading-tight mt-0.5">
                      {card.value}
                    </p>
                  </div>
                </div>
                {card.badge && (
                  <Badge className={card.badge.className}>
                    {card.badge.text}
                  </Badge>
                )}
              </div>
              {card.breakdown.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
                  {card.breakdown.map((b, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1.5 text-[11px] text-slate-400"
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", b.color)}
                      />
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            <div
              className={cn("h-0.5 bg-gradient-to-r w-full", card.gradient)}
            />
          </Card>
        ))}
      </motion.div>

      {/* ─── SLA & Performance + Inventory Value Cards ─────────── */}
      <motion.div
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {/* SLA & Performance Summary */}
        <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              SLA & Performance
            </CardTitle>
            <CardDescription className="text-[12px] text-slate-500">
              Service level agreement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-sky-50/80 p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                  <Clock className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Avg Resolution
                  </p>
                  <p className="text-[22px] font-bold text-slate-900 leading-tight mt-0.5">
                    {slaMetrics.avgResolutionHours.toFixed(1)}h
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3.5",
                  slaMetrics.overdueTicketCount > 0
                    ? "bg-rose-50/80"
                    : "bg-emerald-50/80"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    slaMetrics.overdueTicketCount > 0
                      ? "bg-rose-100"
                      : "bg-emerald-100"
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      "h-5 w-5",
                      slaMetrics.overdueTicketCount > 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    )}
                  />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Overdue Tickets
                  </p>
                  <p
                    className={cn(
                      "text-[22px] font-bold leading-tight mt-0.5",
                      slaMetrics.overdueTicketCount > 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    )}
                  >
                    {slaMetrics.overdueTicketCount}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="h-0.5 bg-gradient-to-r w-full from-sky-500 to-emerald-500" />
        </Card>

        {/* Inventory Value Summary */}
        <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              Inventory Value
            </CardTitle>
            <CardDescription className="text-[12px] text-slate-500">
              Total portfolio value &amp; top items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50/80 p-3.5 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Total Value
                </p>
                <p className="text-[22px] font-bold text-slate-900 leading-tight mt-0.5">
                  ${inventoryValue.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
            {inventoryValue.top5Items.length > 0 && (
              <>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Top 5 Items by Value
                </p>
                <div className="max-h-[130px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-medium text-slate-500">
                          Item
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-medium text-slate-500 text-right">
                          Qty
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-medium text-slate-500 text-right">
                          Unit Price
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-medium text-slate-500 text-right">
                          Value
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryValue.top5Items.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                        >
                          <TableCell>
                            <p className="text-[12px] font-medium text-slate-900 truncate max-w-[120px]">
                              {item.name}
                            </p>
                          </TableCell>
                          <TableCell className="text-[12px] text-slate-600 text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-[12px] text-slate-600 text-right tabular-nums">
                            ${item.unitPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-[12px] font-semibold text-slate-900 text-right tabular-nums">
                            ${item.totalValue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
          <div className="h-0.5 bg-gradient-to-r w-full from-emerald-500 to-teal-500" />
        </Card>
      </motion.div>

      {/* ─── Charts Grid (2-col) ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Tickets by Category */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-500" />
                Tickets by Category
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Distribution across ticket categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {ticketsByCategoryData.length > 0 ? (
                <ChartContainer
                  config={ticketCategoryChartConfig}
                  className="h-[280px] w-full"
                >
                  <BarChart
                    data={ticketsByCategoryData}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="category"
                      type="category"
                      width={90}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                      {ticketsByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-[13px] text-slate-400">
                  No ticket data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tickets by Priority (Pie/Donut) */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-slate-500" />
                Tickets by Priority
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Priority distribution of all tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {ticketsByPriorityData.length > 0 ? (
                <ChartContainer
                  config={priorityChartConfig}
                  className="h-[280px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={ticketsByPriorityData}
                      dataKey="count"
                      nameKey="priority"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {ticketsByPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="priority" />}
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-[13px] text-slate-400">
                  No priority data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Asset Status Distribution */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <Monitor className="h-4 w-4 text-slate-500" />
                Asset Status Distribution
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Current status of all IT assets
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {assetStatusData.length > 0 ? (
                <ChartContainer
                  config={assetStatusChartConfig}
                  className="h-[280px] w-full"
                >
                  <BarChart
                    data={assetStatusData}
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
                      {assetStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-[13px] text-slate-400">
                  No asset data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Health */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-500" />
                Inventory Health
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Stock levels vs minimum required levels
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {allInventoryData.length > 0 ? (
                <ChartContainer
                  config={inventoryChartConfig}
                  className="h-[280px] w-full"
                >
                  <BarChart
                    data={allInventoryData}
                    margin={{ left: 0, right: 16, top: 4, bottom: 40 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="minStockLevel"
                      fill="var(--color-rose-400)"
                      radius={[4, 4, 0, 0]}
                      name="Min Level"
                      barSize={16}
                    />
                    <Bar
                      dataKey="quantity"
                      fill="var(--color-emerald-500)"
                      radius={[4, 4, 0, 0]}
                      name="Current Stock"
                      barSize={16}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-[13px] text-slate-400">
                  No low stock items to display
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Staff Workload Distribution */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                Staff Workload Distribution
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Top staff by open ticket count
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {staffWorkloadData.length > 0 ? (
                <ChartContainer
                  config={staffWorkloadChartConfig}
                  className="h-[280px] w-full"
                >
                  <BarChart
                    data={staffWorkloadData}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="ticketCount"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    >
                      {staffWorkloadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-[13px] text-slate-400">
                  No workload data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Ticket Response Aging */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Ticket Response Aging
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Open tickets grouped by response time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {ticketAgingData.some((d) => d.count > 0) ? (
                <ChartContainer
                  config={ticketAgingChartConfig}
                  className="h-[280px] w-full"
                >
                  <BarChart
                    data={ticketAgingData}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="bucket"
                      type="category"
                      width={48}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                    >
                      {ticketAgingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-[13px] text-slate-400">
                  No aging data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Data Tables Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Top Staff by Assignments */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                Top Staff by Assignments
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Staff with most assigned tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[280px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                        #
                      </TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                        Staff
                      </TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500 text-right">
                        Tickets
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topStaff.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-[13px] text-slate-400"
                        >
                          No staff data
                        </TableCell>
                      </TableRow>
                    ) : (
                      topStaff.map((member, index) => (
                        <TableRow
                          key={member.id}
                          className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                        >
                          <TableCell>
                            <span
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                                index === 0
                                  ? "bg-amber-100 text-amber-700"
                                  : index === 1
                                    ? "bg-slate-100 text-slate-600"
                                    : index === 2
                                      ? "bg-orange-50 text-orange-700"
                                      : "bg-slate-50 text-slate-400"
                              )}
                            >
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-[13px] font-medium text-slate-900">
                                {member.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {member.role}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="secondary"
                              className="text-[11px] rounded-lg font-semibold"
                            >
                              {member._count?.assignedTickets || 0}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Items */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Low Stock Items
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Items below minimum stock level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[280px] overflow-y-auto">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-50 mb-2">
                      <Package className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-[13px] text-slate-400">
                      All items are well stocked
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                          Item
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500 text-right">
                          Stock
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                        >
                          <TableCell>
                            <div>
                              <p className="text-[13px] font-medium text-slate-900 truncate max-w-[140px]">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {item.category}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "text-[13px] font-semibold tabular-nums",
                                item.quantity < item.minStockLevel
                                  ? "text-rose-600"
                                  : "text-amber-600"
                              )}
                            >
                              {item.quantity}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {" "}
                              / {item.minStockLevel}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Urgent Open Tickets */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Urgent Open Tickets
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Critical and high priority tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                {urgentTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-50 mb-2">
                      <TicketCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-[13px] text-slate-400">
                      No urgent tickets — great job!
                    </p>
                  </div>
                ) : (
                  urgentTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50/80 hover:border-slate-200 transition-all cursor-pointer"
                      onClick={() => setView("ticket-detail", ticket.id)}
                    >
                      <div className="flex items-start gap-2">
                        <p className="text-[13px] font-medium text-slate-900 flex-1 truncate">
                          {ticket.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] rounded-lg border font-medium",
                            PRIORITY_BADGE_COLORS[ticket.priority] || ""
                          )}
                        >
                          {ticket.priority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] rounded-lg border font-medium",
                            TICKET_STATUS_BADGE_COLORS[ticket.status] || ""
                          )}
                        >
                          {ticket.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Warranty Expiring Soon */}
        <motion.div variants={itemVariants} viewport={{ once: true }} className="lg:col-span-3">
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Upcoming Warranty Expirations
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Assets with warranties expiring soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[320px] overflow-y-auto">
                {upcomingWarranties.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-50 mb-2">
                      <ShieldAlert className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-[13px] text-slate-400">
                      No upcoming warranty expirations
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                          Asset Name
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                          Category
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                          Status
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                          Warranty End
                        </TableHead>
                        <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500 text-right">
                          Days Remaining
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingWarranties.map((asset) => {
                        const daysRemaining = getDaysRemaining(asset.warrantyEnd);
                        const isExpired = daysRemaining <= 0;
                        const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 14;

                        return (
                          <TableRow
                            key={asset.id}
                            className={cn(
                              "border-slate-100 hover:bg-slate-50/80 transition-colors",
                              isExpiringSoon && "bg-amber-50/50",
                              isExpired && "bg-rose-50/50"
                            )}
                          >
                            <TableCell>
                              <p className="text-[13px] font-medium text-slate-900">
                                {asset.name}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-[12px] text-slate-600">
                                {asset.category}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] rounded-lg border font-medium",
                                  ASSET_STATUS_COLORS[asset.status]
                                    ? ASSET_STATUS_COLORS[asset.status].replace("var(--color-", "bg-").replace(")", "/10 text-").replace("500", "700")
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                )}
                              >
                                {asset.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-[12px] text-slate-600">
                                {new Date(asset.warrantyEnd).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              {isExpired ? (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] rounded-lg font-semibold">
                                  Expired
                                </Badge>
                              ) : isExpiringSoon ? (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] rounded-lg font-semibold">
                                  {daysRemaining}d left
                                </Badge>
                              ) : (
                                <span className="text-[12px] font-medium text-slate-600 tabular-nums">
                                  {daysRemaining} days
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
