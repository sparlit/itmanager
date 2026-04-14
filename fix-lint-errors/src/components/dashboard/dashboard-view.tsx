"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  formatDistanceToNow,
  differenceInDays,
  format,
} from "date-fns";
import {
  TicketCheck,
  Monitor,
  Users,
  AlertTriangle,
  Plus,
  PackageCheck,
  ClipboardList,
  UserCog,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowDownRight,
  RefreshCw,
  GripVertical,
  MessageSquare,
  User,
  Tag,
  Inbox,
  CircleAlert,
  CircleDot,
  PauseCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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
import { useAppStore } from "@/store/app-store";
import type { Ticket, ActivityItem } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// ─── API Response Shape ─────────────────────────────────────────
interface DashboardApiResponse {
  staffCount: { total: number; active: number };
  assetCount: {
    total: number;
    inUse: number;
    available: number;
    underMaintenance: number;
    byCategory: Record<string, number>;
  };
  inventoryCount: { total: number; lowStock: number };
  ticketCount: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  };
  recentTickets: Ticket[];
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
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
  recentTransactions: Array<{
    id: string;
    type: string;
    quantity: number;
    performedBy: string;
    notes: string | null;
    item: { name: string; sku: string };
    createdAt: string;
  }>;
}

// ─── Color Maps ─────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "On Hold": "bg-slate-100 text-slate-600 border-slate-200",
  Resolved: "bg-teal-50 text-teal-700 border-teal-200",
  Closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Low: "bg-sky-50 text-sky-700 border-sky-200",
};

const STATUS_BAR_COLORS: Record<string, string> = {
  Open: "var(--color-emerald-500)",
  "In Progress": "var(--color-amber-500)",
  "On Hold": "var(--color-slate-400)",
  Resolved: "var(--color-teal-500)",
  Closed: "var(--color-gray-400)",
};

const PIE_COLORS = [
  "var(--color-emerald-600)",
  "var(--color-blue-500)",
  "var(--color-violet-500)",
  "var(--color-amber-500)",
  "var(--color-rose-500)",
  "var(--color-teal-600)",
  "var(--color-orange-500)",
  "var(--color-sky-500)",
];

const AGING_BAR_COLORS: Record<string, string> = {
  "0-24h": "var(--color-emerald-500)",
  "24-72h": "var(--color-amber-500)",
  "3-7d": "var(--color-orange-500)",
  "7d+": "var(--color-rose-500)",
};

const TX_TYPE_COLORS: Record<string, string> = {
  IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OUT: "bg-rose-50 text-rose-700 border-rose-200",
  ADJUSTMENT: "bg-amber-50 text-amber-700 border-amber-200",
  RETURN: "bg-blue-50 text-blue-700 border-blue-200",
  STOCKTAKE: "bg-violet-50 text-violet-700 border-violet-200",
  TRANSFER: "bg-sky-50 text-sky-700 border-sky-200",
};

// ─── Kanban Config ─────────────────────────────────────────────
type TicketStatus = "Open" | "In Progress" | "On Hold" | "Resolved" | "Closed";

const KANBAN_COLUMNS: {
  id: TicketStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  dotColor: string;
  headerBg: string;
  borderAccent: string;
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyMessage: string;
}[] = [
  { id: "Open", label: "Open", icon: CircleDot, gradient: "from-emerald-500 to-emerald-600", dotColor: "bg-emerald-500", headerBg: "bg-gradient-to-r from-emerald-500 to-emerald-600", borderAccent: "border-l-emerald-500", emptyIcon: Inbox, emptyMessage: "No open tickets" },
  { id: "In Progress", label: "In Progress", icon: CircleAlert, gradient: "from-sky-500 to-sky-600", dotColor: "bg-sky-500", headerBg: "bg-gradient-to-r from-sky-500 to-sky-600", borderAccent: "border-l-sky-500", emptyIcon: CircleAlert, emptyMessage: "No tickets in progress" },
  { id: "On Hold", label: "On Hold", icon: PauseCircle, gradient: "from-amber-500 to-amber-600", dotColor: "bg-amber-500", headerBg: "bg-gradient-to-r from-amber-500 to-amber-600", borderAccent: "border-l-amber-500", emptyIcon: PauseCircle, emptyMessage: "No tickets on hold" },
  { id: "Resolved", label: "Resolved", icon: CheckCircle2, gradient: "from-violet-500 to-violet-600", dotColor: "bg-violet-500", headerBg: "bg-gradient-to-r from-violet-500 to-violet-600", borderAccent: "border-l-violet-500", emptyIcon: CheckCircle2, emptyMessage: "No resolved tickets" },
  { id: "Closed", label: "Closed", icon: XCircle, gradient: "from-slate-400 to-slate-500", dotColor: "bg-slate-400", headerBg: "bg-gradient-to-r from-slate-400 to-slate-500", borderAccent: "border-l-slate-400", emptyIcon: XCircle, emptyMessage: "No closed tickets" },
];

const KANBAN_PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Critical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  High: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  Low: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
};

// ─── Chart Configs ──────────────────────────────────────────────
const statusChartConfig: ChartConfig = {
  open: { label: "Open", color: "var(--color-emerald-500)" },
  inProgress: { label: "In Progress", color: "var(--color-amber-500)" },
  onHold: { label: "On Hold", color: "var(--color-slate-400)" },
  resolved: { label: "Resolved", color: "var(--color-teal-500)" },
  closed: { label: "Closed", color: "var(--color-gray-400)" },
};

const assetChartConfig: ChartConfig = {
  laptop: { label: "Laptop", color: "var(--color-emerald-600)" },
  monitor: { label: "Monitor", color: "var(--color-blue-500)" },
  desktop: { label: "Desktop", color: "var(--color-violet-500)" },
  network: { label: "Network", color: "var(--color-amber-500)" },
  software: { label: "Software", color: "var(--color-rose-500)" },
  peripheral: { label: "Peripheral", color: "var(--color-teal-600)" },
  infrastructure: { label: "Infrastructure", color: "var(--color-orange-500)" },
};

const agingChartConfig: ChartConfig = {
  count: { label: "Tickets", color: "var(--color-amber-500)" },
};

// ─── Helpers ────────────────────────────────────────────────────
function mapRecentActivity(
  item: DashboardApiResponse["recentActivity"][number]
): ActivityItem {
  return {
    id: item.id,
    type: item.type,
    title: item.type === "ticket" ? "New Ticket" : "New Comment",
    description: item.description,
    timestamp: item.createdAt,
    userName: "",
  };
}

// ─── Animation Variants ─────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Stat Card Config ───────────────────────────────────────────
const STAT_CARDS = [
  {
    key: "tickets",
    label: "Open Tickets",
    icon: TicketCheck,
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    trend: "↑ 12% from last week",
  },
  {
    key: "assets",
    label: "Total Assets",
    icon: Monitor,
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    trend: "↑ 3 new this month",
  },
  {
    key: "staff",
    label: "Staff Members",
    icon: Users,
    gradient: "from-violet-500 to-violet-600",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    trend: "7 active members",
  },
  {
    key: "alerts",
    label: "Low Stock Alerts",
    icon: AlertTriangle,
    gradient: "from-rose-500 to-rose-600",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    trend: "Action needed",
  },
] as const;

// ─── Dashboard Kanban Card ─────────────────────────────────────
function DashboardKanbanCard({
  ticket,
  onClick,
}: {
  ticket: Ticket;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = KANBAN_PRIORITY_STYLES[ticket.priority] || KANBAN_PRIORITY_STYLES.Low;
  const assigneeName = ticket.assignedToName || ticket.assignee?.name || null;
  const reporterName = ticket.reportedByName || ticket.reporter?.name || "Unknown";
  const commentCount = ticket._count?.comments || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-white shadow-sm transition-all duration-200 cursor-pointer",
        isDragging
          ? "opacity-50 shadow-lg scale-[1.02] z-10 ring-2 ring-emerald-400/50"
          : "hover:shadow-md hover:border-slate-200 border-slate-200/70"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "absolute top-1.5 left-1.5 rounded-md p-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 hover:bg-slate-100 transition-colors",
          "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <div className="p-2.5 pl-7 space-y-2">
        <h4 className="text-[12px] font-semibold text-slate-900 leading-snug line-clamp-2">
          {ticket.title}
        </h4>
        <div className="flex items-center flex-wrap gap-1">
          <Badge variant="outline" className={cn("text-[9px] rounded-md border font-medium px-1.5 py-0", priority.bg, priority.text, priority.border)}>
            <span className={cn("h-1 w-1 rounded-full mr-0.5", priority.dot)} />
            {ticket.priority}
          </Badge>
          <Badge variant="secondary" className="text-[9px] rounded-md bg-slate-100 text-slate-600 font-medium px-1.5 py-0">
            <Tag className="h-2 w-2 mr-0.5" />
            {ticket.category}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 min-w-0">
            {assigneeName ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 truncate">
                    <User className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{assigneeName}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top"><p className="text-[10px]">Assigned to {assigneeName}</p></TooltipContent>
              </Tooltip>
            ) : (
              <span className="flex items-center gap-0.5 italic text-slate-300">
                <User className="h-2.5 w-2.5 shrink-0" />
                Unassigned
              </span>
            )}
            <span className="text-slate-300">·</span>
            <span className="truncate">{reporterName}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                <MessageSquare className="h-2.5 w-2.5" />
                {commentCount}
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: false })}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top"><p className="text-[10px]">{new Date(ticket.createdAt).toLocaleString()}</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function DashboardView() {
  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setView } = useAppStore();
  // Trigger to open ticket creation dialog from quick actions
  const [openNewTicket, setOpenNewTicket] = useState(false);

  // ─── Kanban Board State ─────────────────────────────────────
  const [kanbanTickets, setKanbanTickets] = useState<Ticket[]>([]);
  const [activeKanbanTicket, setActiveKanbanTicket] = useState<Ticket | null>(null);
  const [kanbanUpdating, setKanbanUpdating] = useState<string | null>(null);
  const kanbanSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchKanbanTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const json = await res.json();
        setKanbanTickets(json.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch kanban tickets:", err);
    }
  }, []);
  // Pass down to TicketsView via store flag
  useEffect(() => {
    if (openNewTicket) {
      setView("tickets");
      // TicketsView watches for this custom event
      window.dispatchEvent(new CustomEvent("open-create-ticket"));
      setOpenNewTicket(false);
    }
  }, [openNewTicket, setView]);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
    fetchKanbanTickets();
  }, [fetchKanbanTickets]);

  function handleRefresh() {
    setRefreshing(true);
    fetchDashboard();
    fetchKanbanTickets();
  }

  // ─── Kanban Drag Handlers ────────────────────────────────────
  const getTicketsByStatus = (status: TicketStatus): Ticket[] =>
    kanbanTickets.filter((t) => t.status === status);

  const findKanbanColumn = (ticketId: UniqueIdentifier): TicketStatus | null => {
    const ticket = kanbanTickets.find((t) => t.id === ticketId);
    return ticket ? (ticket.status as TicketStatus) : null;
  };

  function handleKanbanDragStart(event: DragStartEvent) {
    const ticket = kanbanTickets.find((t) => t.id === event.active.id);
    if (ticket) setActiveKanbanTicket(ticket);
  }

  async function handleKanbanDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveKanbanTicket(null);
    if (!over) return;
    const ticketId = String(active.id);
    const ticket = kanbanTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    let targetStatus: TicketStatus | null = null;
    if (typeof over.id === "string" && KANBAN_COLUMNS.some((c) => c.id === over.id)) {
      targetStatus = over.id as TicketStatus;
    } else {
      const overTicket = kanbanTickets.find((t) => t.id === over.id);
      if (overTicket) targetStatus = overTicket.status as TicketStatus;
    }
    if (!targetStatus || targetStatus === ticket.status) return;

    setKanbanUpdating(ticketId);
    try {
      const res = await fetch(`/api/tickets/update?id=${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        setKanbanTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: targetStatus } : t)));
        toast.success(`Ticket moved to "${targetStatus}"`);
      } else {
        toast.error("Failed to update ticket status");
      }
    } catch {
      toast.error("Failed to update ticket status");
    } finally {
      setKanbanUpdating(null);
    }
  }

  function handleKanbanDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeStatus = findKanbanColumn(active.id);
    const overStatus = findKanbanColumn(over.id);
    if (!activeStatus || !overStatus || activeStatus !== overStatus) return;
    setKanbanTickets((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        {/* Header skeleton */}
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-slate-200/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-7 w-14 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* New stats skeleton row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-slate-200/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-7 w-20 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
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
        {/* New charts skeleton row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-slate-200/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Bottom skeleton */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 rounded-xl border-slate-200/60">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32 rounded" />
            </CardHeader>
            <CardContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="mb-3 h-11 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
          <div className="space-y-5">
            <Card className="rounded-xl border-slate-200/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28 rounded" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-xl border-slate-200/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32 rounded" />
              </CardHeader>
              <CardContent>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="mb-3 h-12 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Recent transactions skeleton */}
        <Card className="rounded-xl border-slate-200/60">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-40 rounded" />
          </CardHeader>
          <CardContent>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="mb-3 h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-[13px] text-slate-500">
          Failed to load dashboard data.
        </p>
      </div>
    );
  }

  // ─── Computed Values ──────────────────────────────────────────
  const openTickets = data.ticketCount.byStatus["Open"] || 0;
  const inProgressTickets = data.ticketCount.byStatus["In Progress"] || 0;
  const criticalTickets = data.ticketCount.byPriority["Critical"] || 0;
  const totalActiveTickets = openTickets + inProgressTickets;

  const statValues = [
    totalActiveTickets,
    data.assetCount.total,
    data.staffCount.total,
    data.inventoryCount.lowStock,
  ];

  const statSubtexts = [
    `${openTickets} open · ${inProgressTickets} in progress`,
    `${data.assetCount.inUse} in use · ${data.assetCount.available} available`,
    `${data.staffCount.active} active · ${data.staffCount.total - data.staffCount.active} inactive`,
    `out of ${data.inventoryCount.total} items tracked`,
  ];

  // SLA computed values
  const slaMetrics = data.slaMetrics ?? { avgResolutionHours: 0, overdueTicketCount: 0 };
  const inventoryValue = data.inventoryValue ?? { totalValue: 0, top5Items: [] };

  // Transform data for charts
  const statusChartData = Object.entries(data.ticketCount.byStatus).map(
    ([key, value]) => ({
      status: key,
      count: value as number,
      fill: STATUS_BAR_COLORS[key] || "var(--color-gray-400)",
    })
  );

  const assetPieData = Object.entries(data.assetCount.byCategory).map(
    ([key, value]) => ({
      category: key,
      count: value as number,
    })
  );

  // Ticket aging chart data
  const ticketAgingData = data.ticketAging
    ? (["0-24h", "24-72h", "3-7d", "7d+"] as const).map((key) => ({
        bucket: key,
        count: (data.ticketAging as Record<string, number>)[key] ?? 0,
        fill: AGING_BAR_COLORS[key] || "var(--color-gray-400)",
      }))
    : [];

  // Warranty data with computed days remaining
  const now = new Date();
  const warrantyData = (data.upcomingWarranties ?? []).map((w) => ({
    ...w,
    daysRemaining: differenceInDays(new Date(w.warrantyEnd), now),
  }));

  const activities = data.recentActivity.map(mapRecentActivity);

  const recentTransactions = data.recentTransactions ?? [];

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Page Header ───────────────────────────────────────── */}
      <motion.div className="flex items-center justify-end" variants={itemVariants} viewport={{ once: true }}>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-8 rounded-lg border-slate-200 p-0",
            refreshing && "text-emerald-600"
          )}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
        </Button>
      </motion.div>

      {/* ─── Stats Cards (Original 4) ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card, index) => (
          <motion.div
            key={card.key}
            variants={itemVariants}
            viewport={{ once: true }}
          >
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        card.iconBg
                      )}
                    >
                      <card.icon
                        className={cn("h-5 w-5", card.iconColor)}
                      />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                        {card.label}
                      </p>
                      <p className="text-[26px] font-bold text-slate-900 leading-tight mt-0.5">
                        {statValues[index]}
                      </p>
                    </div>
                  </div>
                  {index === 0 && criticalTickets > 0 && (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] rounded-lg">
                      {criticalTickets} critical
                    </Badge>
                  )}
                  {index === 3 && data.inventoryCount.lowStock > 0 && (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] rounded-lg">
                      Action needed
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  <p className="text-[11px] text-slate-400">{card.trend}</p>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {statSubtexts[index]}
                </p>
              </CardContent>
              {/* Bottom gradient accent line */}
              <div
                className={cn(
                  "h-0.5 bg-gradient-to-r w-full",
                  card.gradient
                )}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── New Stats Row (SLA + Inventory Value) ─────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* SLA Metrics Card */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      slaMetrics.overdueTicketCount > 0
                        ? "bg-rose-50"
                        : "bg-emerald-50"
                    )}
                  >
                    <Clock
                      className={cn(
                        "h-5 w-5",
                        slaMetrics.overdueTicketCount > 0
                          ? "text-rose-600"
                          : "text-emerald-600"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                      Avg. Resolution
                    </p>
                    <p className="text-[26px] font-bold text-slate-900 leading-tight mt-0.5">
                      {slaMetrics.avgResolutionHours.toFixed(1)}h
                    </p>
                  </div>
                </div>
                {slaMetrics.overdueTicketCount > 0 && (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] rounded-lg">
                    {slaMetrics.overdueTicketCount} overdue
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                <p className="text-[11px] text-slate-400">
                  SLA target tracking
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {slaMetrics.overdueTicketCount > 0
                  ? `${slaMetrics.overdueTicketCount} overdue tickets need attention`
                  : "All tickets within SLA"}
              </p>
            </CardContent>
            <div
              className={cn(
                "h-0.5 bg-gradient-to-r w-full",
                slaMetrics.overdueTicketCount > 0
                  ? "from-rose-500 to-rose-600"
                  : "from-emerald-500 to-emerald-600"
              )}
            />
          </Card>
        </motion.div>

        {/* Inventory Value Card */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                    <DollarSign className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                      Inventory Value
                    </p>
                    <p className="text-[26px] font-bold text-slate-900 leading-tight mt-0.5">
                      ${inventoryValue.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                {inventoryValue.top5Items.length > 0 && (
                  <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[11px] rounded-lg">
                    Top {inventoryValue.top5Items.length} items
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-teal-600" />
                <p className="text-[11px] text-slate-400">
                  Total portfolio value
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Across {data.inventoryCount.total} items tracked
              </p>
            </CardContent>
            <div className="h-0.5 bg-gradient-to-r w-full from-teal-500 to-teal-600" />
          </Card>
        </motion.div>
      </div>

      {/* ─── Ticket Board (Kanban) ─────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Ticket Board
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Drag tickets between columns to update their status
                </CardDescription>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-slate-50/80 px-3.5 py-2">
                  <span className="text-[12px] font-medium text-slate-500">
                    {kanbanTickets.length} ticket{kanbanTickets.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="h-8 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[12px]"
                  onClick={() => setView("tickets")}
                >
                  List View
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
            {/* Status summary pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {KANBAN_COLUMNS.map((col) => {
                const count = getTicketsByStatus(col.id).length;
                return (
                  <div key={col.id} className="flex items-center gap-1.5 rounded-lg border border-slate-200/60 bg-white px-2.5 py-1">
                    <span className={cn("h-2 w-2 rounded-full", col.dotColor)} />
                    <span className="text-[11px] font-medium text-slate-600">{col.label}</span>
                    <span className="text-[12px] font-semibold text-slate-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <DndContext
              sensors={kanbanSensors}
              collisionDetection={closestCorners}
              onDragStart={handleKanbanDragStart}
              onDragOver={handleKanbanDragOver}
              onDragEnd={handleKanbanDragEnd}
            >
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-3 min-w-max">
                  {KANBAN_COLUMNS.map((column) => {
                    const ColumnIcon = column.icon;
                    const EmptyIcon = column.emptyIcon;
                    const tickets = getTicketsByStatus(column.id);
                    return (
                      <div key={column.id} className="flex flex-col min-w-[260px] w-[260px] shrink-0">
                        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-t-lg", column.headerBg)}>
                          <ColumnIcon className="h-3.5 w-3.5 text-white/90" />
                          <h3 className="text-[12px] font-semibold text-white">{column.label}</h3>
                          <span className="ml-auto flex h-5 min-w-[18px] items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white px-1.5">
                            {tickets.length}
                          </span>
                        </div>
                        <div className={cn("flex-1 rounded-b-lg border border-t-0 border-slate-200/70 bg-slate-50/50", column.borderAccent, "border-l-[3px]")}>
                          <div className="p-1.5 space-y-1.5 max-h-[320px] overflow-y-auto">
                            {tickets.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-6 px-3 text-slate-300">
                                <EmptyIcon className="h-6 w-6 mb-1.5 opacity-50" />
                                <p className="text-[10px] font-medium text-center">{column.emptyMessage}</p>
                              </div>
                            ) : (
                              <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                                {tickets.map((ticket) => (
                                  <DashboardKanbanCard key={ticket.id} ticket={ticket} onClick={() => setView("ticket-detail", ticket.id)} />
                                ))}
                              </SortableContext>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <DragOverlay dropAnimation={null}>
                {activeKanbanTicket ? (
                  <div className="rounded-xl border border-emerald-300 bg-white shadow-xl shadow-emerald-600/10 ring-2 ring-emerald-400/40 rotate-[2deg] p-3 w-[240px]">
                    <h4 className="text-[12px] font-semibold text-slate-900 line-clamp-2 mb-1.5">{activeKanbanTicket.title}</h4>
                    <div className="flex items-center flex-wrap gap-1">
                      <Badge variant="outline" className={cn("text-[10px] rounded-md border font-medium px-1.5 py-0", KANBAN_PRIORITY_STYLES[activeKanbanTicket.priority]?.bg, KANBAN_PRIORITY_STYLES[activeKanbanTicket.priority]?.text, KANBAN_PRIORITY_STYLES[activeKanbanTicket.priority]?.border)}>
                        {activeKanbanTicket.priority}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] rounded-md bg-slate-100 text-slate-600 font-medium px-1.5 py-0">
                        {activeKanbanTicket.category}
                      </Badge>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </CardContent>
        </Card>
      </motion.div>

      {/* Updating indicator */}
      {kanbanUpdating && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span className="text-[13px] font-medium">Updating status...</span>
        </div>
      )}

      {/* ─── Charts Row 1 (Existing) ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Ticket Status Distribution */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900">
                Ticket Status Distribution
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Current tickets by status
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer
                config={statusChartConfig}
                className="h-[260px] w-full"
              >
                <BarChart
                  data={statusChartData}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="status"
                    type="category"
                    width={88}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assets by Category */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900">
                Assets by Category
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Distribution across asset types
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer
                config={assetChartConfig}
                className="h-[260px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={assetPieData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {assetPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="category" />}
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Charts Row 2 (Ticket Aging + Warranties) ──────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Ticket Aging Distribution */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-1">
              <CardTitle className="text-[14px] font-semibold text-slate-900">
                Ticket Aging Distribution
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Open tickets by age bracket
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {ticketAgingData.length > 0 ? (
                <ChartContainer
                  config={agingChartConfig}
                  className="h-[220px] w-full"
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
                      width={52}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                      {ticketAgingData.map((entry, index) => (
                        <Cell key={`aging-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center">
                  <p className="text-[13px] text-slate-400">
                    No ticket aging data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Warranty Expirations */}
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[14px] font-semibold text-slate-900">
                    Upcoming Warranties
                  </CardTitle>
                  <CardDescription className="text-[12px] text-slate-500">
                    Assets with expiring warranties
                  </CardDescription>
                </div>
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pl-5 text-[12px] font-medium text-slate-500">
                      Asset
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 hidden sm:table-cell text-[12px] font-medium text-slate-500">
                      Category
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500 text-right">
                      Expires
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pr-5 text-[12px] font-medium text-slate-500 text-right">
                      Days Left
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warrantyData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-20 text-center text-[13px] text-slate-400"
                      >
                        No upcoming warranty expirations
                      </TableCell>
                    </TableRow>
                  ) : (
                    warrantyData.slice(0, 5).map((warranty, idx) => (
                      <TableRow
                        key={warranty.id}
                        className={cn(
                          "border-slate-100 hover:bg-slate-50/80 transition-colors",
                          idx % 2 === 1 && "bg-slate-50/40",
                          warranty.daysRemaining <= 14 &&
                            warranty.daysRemaining > 0 &&
                            "bg-rose-50/50 hover:bg-rose-50/80",
                          warranty.daysRemaining <= 0 &&
                            "bg-rose-50 hover:bg-rose-100/60"
                        )}
                      >
                        <TableCell className="pl-5">
                          <div className="text-[13px] font-medium text-slate-900 truncate max-w-[160px]">
                            {warranty.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-[12px] text-slate-500">
                          {warranty.category}
                        </TableCell>
                        <TableCell className="text-[12px] text-slate-500 text-right">
                          {format(new Date(warranty.warrantyEnd), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] rounded-lg border font-medium",
                              warranty.daysRemaining <= 0
                                ? "bg-rose-100 text-rose-700 border-rose-200"
                                : warranty.daysRemaining <= 14
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : warranty.daysRemaining <= 30
                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                            )}
                          >
                            {warranty.daysRemaining <= 0
                              ? "Expired"
                              : `${warranty.daysRemaining}d`}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Bottom Row (Existing) ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Tickets */}
        <motion.div
          className="lg:col-span-2"
          variants={itemVariants}
          viewport={{ once: true }}
        >
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[14px] font-semibold text-slate-900">
                    Recent Tickets
                  </CardTitle>
                  <CardDescription className="text-[12px] text-slate-500">
                    Latest tickets created
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[12px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setView("tickets")}
                >
                  View all
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pl-5 text-[12px] font-medium text-slate-500">
                      Title
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 hidden sm:table-cell text-[12px] font-medium text-slate-500">
                      Reporter
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 hidden md:table-cell text-[12px] font-medium text-slate-500">
                      Priority
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pr-5 text-[12px] font-medium text-slate-500 text-right">
                      Reported
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTickets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-[13px] text-slate-400"
                      >
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentTickets.map((ticket, idx) => (
                      <TableRow
                        key={ticket.id}
                        className={cn(
                          "cursor-pointer transition-colors border-slate-100 hover:bg-slate-50/80",
                          idx % 2 === 1 && "bg-slate-50/40"
                        )}
                        onClick={() => setView("ticket-detail", ticket.id)}
                      >
                        <TableCell className="pl-5">
                          <div className="max-w-[200px] truncate text-[13px] font-medium text-slate-900">
                            {ticket.title}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-[13px] text-slate-500">
                          {ticket.reportedByName || ticket.reporter?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] rounded-lg border font-medium",
                              STATUS_COLORS[ticket.status] || ""
                            )}
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] rounded-lg border font-medium",
                              PRIORITY_COLORS[ticket.priority] || ""
                            )}
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-5 text-right text-[12px] text-slate-400">
                          {ticket.reportDate || formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Quick Actions + Activity */}
        <motion.div
          className="space-y-5"
          variants={itemVariants}
          viewport={{ once: true }}
        >
          {/* Quick Actions */}
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-semibold text-slate-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 py-3.5 rounded-xl border-slate-200/60 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all"
                onClick={() => setOpenNewTicket(true)}
              >
                <Plus className="h-5 w-5 text-emerald-600" />
                <span className="text-[11px] font-medium">New Ticket</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 py-3.5 rounded-xl border-slate-200/60 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                onClick={() => setView("assets")}
              >
                <Monitor className="h-5 w-5 text-blue-500" />
                <span className="text-[11px] font-medium">Add Asset</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 py-3.5 rounded-xl border-slate-200/60 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
                onClick={() => setView("inventory")}
              >
                <PackageCheck className="h-5 w-5 text-violet-500" />
                <span className="text-[11px] font-medium">Inventory</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 py-3.5 rounded-xl border-slate-200/60 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all"
                onClick={() => setView("staff")}
              >
                <UserCog className="h-5 w-5 text-rose-500" />
                <span className="text-[11px] font-medium">View Staff</span>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Recent Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-slate-400" />
              </div>
              <CardDescription className="text-[12px] text-slate-500">
                Latest actions across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3">
                {activities.length === 0 ? (
                  <p className="text-[13px] text-slate-400 text-center py-6">
                    No recent activity
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 group"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                        {activity.type === "ticket" ? (
                          <TicketCheck className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-slate-700 leading-snug line-clamp-2">
                          {activity.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDistanceToNow(
                            new Date(activity.timestamp),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Recent Inventory Transactions ─────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Recent Inventory Transactions
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Latest stock movements and adjustments
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[12px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => setView("inventory")}
              >
                View all
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-[13px] text-slate-400 text-center py-8">
                No recent transactions
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentTransactions.slice(0, 6).map((tx) => {
                  const isInbound =
                    tx.type === "IN" || tx.type === "RETURN";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Type badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] rounded-lg border font-medium shrink-0 min-w-[60px] justify-center",
                          TX_TYPE_COLORS[tx.type] ||
                            "bg-slate-50 text-slate-600 border-slate-200"
                        )}
                      >
                        {tx.type}
                      </Badge>

                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-900 truncate">
                          {tx.item?.name || "Unknown Item"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {tx.item?.sku || "N/A"}
                        </p>
                      </div>

                      {/* Quantity indicator */}
                      <div
                        className={cn(
                          "flex items-center gap-1 text-[13px] font-semibold shrink-0",
                          isInbound
                            ? "text-emerald-600"
                            : "text-rose-600"
                        )}
                      >
                        {isInbound ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isInbound ? "+" : "-"}
                          {tx.quantity}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <p className="text-[11px] text-slate-400 shrink-0 hidden sm:block">
                        {formatDistanceToNow(new Date(tx.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
