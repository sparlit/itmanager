"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Monitor,
  TicketCheck,
  UserCheck,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Timer,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/store/app-store";
import type { Staff, Asset, Ticket } from "@/types";
import { cn } from "@/lib/utils";

// ─── Color Maps ─────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
};

const ASSET_STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Use": "bg-sky-50 text-sky-700 border-sky-200",
  "Under Maintenance": "bg-amber-50 text-amber-700 border-amber-200",
  Retired: "bg-slate-100 text-slate-600 border-slate-200",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "On Hold": "bg-slate-100 text-slate-600 border-slate-200",
  Resolved: "bg-teal-50 text-teal-700 border-teal-200",
  Closed: "bg-slate-100 text-slate-500 border-slate-200",
};

const TICKET_PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-rose-50 text-rose-700 border-rose-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Low: "bg-sky-50 text-sky-700 border-sky-200",
};

// ─── Avatar Helpers ─────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-sky-500 to-sky-600",
  "from-violet-500 to-violet-600",
  "from-rose-500 to-rose-600",
  "from-teal-500 to-teal-600",
  "from-orange-500 to-orange-600",
  "from-blue-500 to-blue-600",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const TICKET_CHART_COLORS: Record<string, string> = {
  Open: "var(--color-emerald-500)",
  "In Progress": "var(--color-amber-500)",
  "On Hold": "var(--color-slate-400)",
  Resolved: "var(--color-teal-500)",
  Closed: "var(--color-gray-400)",
};

const TICKET_DOT_COLORS: Record<string, string> = {
  Open: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  "On Hold": "bg-slate-400",
  Resolved: "bg-teal-500",
  Closed: "bg-gray-400",
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
export function StaffDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [staffMember, setStaffMember] = useState<Staff | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const json = await res.json();
        const found = (json.staff || []).find(
          (s: Staff) => s.id === selectedItemId
        );
        setStaffMember(found || null);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  }, [selectedItemId]);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const json = await res.json();
        const allAssets: Asset[] = json.assets || [];
        const assigned = allAssets.filter((asset) =>
          asset.assignments?.some(
            (a) => a.staffId === selectedItemId && !a.returnedAt
          )
        );
        setAssets(assigned);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    }
  }, [selectedItemId]);

  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [reportedTickets, setReportedTickets] = useState<Ticket[]>([]);

   const fetchTickets = useCallback(async () => {
     if (!selectedItemId) return;
     try {
       const res = await fetch("/api/tickets");
       if (res.ok) {
         const json = await res.json();
         const allTickets: Ticket[] = json.tickets || [];
         const assigned = allTickets.filter(
           (t) => t.assignedTo === selectedItemId
         ).sort(
           (a, b) =>
             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         );
         const reported = allTickets.filter(
           (t) => t.reportedBy === selectedItemId || t.reportedByName === staffMember?.name
         ).sort(
           (a, b) =>
             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         );
         setAssignedTickets(assigned);
         setReportedTickets(reported);
       }
     } catch (err) {
       console.error("Failed to fetch tickets:", err);
     }
   }, [selectedItemId, staffMember?.name]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchStaff(), fetchAssets(), fetchTickets()]);
      setLoading(false);
    }
    loadData();
  }, [fetchStaff, fetchAssets, fetchTickets]);

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!staffMember) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
          <Users className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-[13px] text-slate-500">Staff member not found.</p>
        <Button
          variant="outline"
          onClick={() => setView("staff")}
          className="rounded-lg text-[13px] border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Team
        </Button>
      </div>
    );
  }

  const assignedTicketsCount =
    staffMember._count?.assignedTickets || assignedTickets.length;
  const reportedTicketsCount = staffMember._count?.reportedTickets || reportedTickets.length;
  const assetsCount = staffMember._count?.assetAssignments || assets.length;

  // Performance scorecard metrics
  const totalAssigned = assignedTickets.length;
  const resolvedTicketsList = assignedTickets.filter((t) => t.status === "Resolved" || t.status === "Closed");
  const activeTicketsList = assignedTickets.filter((t) => t.status === "Open" || t.status === "In Progress");
  const resolutionRate = totalAssigned > 0 ? (resolvedTicketsList.length / totalAssigned) * 100 : 0;
  const resolvedWithDates = resolvedTicketsList.filter(
    (t) => t.resolvedAt && t.createdAt
  );
  const avgResolutionMs =
    resolvedWithDates.length > 0
      ? resolvedWithDates.reduce(
          (sum, t) =>
            sum +
            (new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime()),
          0
        ) / resolvedWithDates.length
      : 0;
  const avgResolutionHours = avgResolutionMs / (1000 * 60 * 60);

  function formatAvgTime(hours: number): string {
    if (hours === 0) return "N/A";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  }

  // Ticket status breakdown for donut chart
  const statusBreakdown = [
    { name: "Open", value: assignedTickets.filter((t) => t.status === "Open").length },
    { name: "In Progress", value: assignedTickets.filter((t) => t.status === "In Progress").length },
    { name: "On Hold", value: assignedTickets.filter((t) => t.status === "On Hold").length },
    { name: "Resolved", value: assignedTickets.filter((t) => t.status === "Resolved").length },
    { name: "Closed", value: assignedTickets.filter((t) => t.status === "Closed").length },
  ].filter((d) => d.value > 0);

  const scorecards = [
    {
      label: "Total Assigned",
      value: totalAssigned,
      icon: TicketCheck,
      bg: "bg-slate-50",
      color: "text-slate-600",
    },
    {
      label: "Resolved",
      value: resolvedTicketsList.length,
      icon: CheckCircle2,
      bg: resolutionRate >= 50 ? "bg-emerald-50" : resolutionRate >= 25 ? "bg-amber-50" : "bg-rose-50",
      color: resolutionRate >= 50 ? "text-emerald-600" : resolutionRate >= 25 ? "text-amber-600" : "text-rose-600",
    },
    {
      label: "Active Tickets",
      value: activeTicketsList.length,
      icon: Timer,
      bg: activeTicketsList.length <= 3 ? "bg-emerald-50" : activeTicketsList.length <= 5 ? "bg-amber-50" : "bg-rose-50",
      color: activeTicketsList.length <= 3 ? "text-emerald-600" : activeTicketsList.length <= 5 ? "text-amber-600" : "text-rose-600",
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate.toFixed(0)}%`,
      icon: TrendingUp,
      bg: resolutionRate >= 50 ? "bg-emerald-50" : resolutionRate >= 25 ? "bg-amber-50" : "bg-rose-50",
      color: resolutionRate >= 50 ? "text-emerald-600" : resolutionRate >= 25 ? "text-amber-600" : "text-rose-600",
    },
    {
      label: "Avg. Resolution",
      value: formatAvgTime(avgResolutionHours),
      icon: Clock,
      bg: avgResolutionHours <= 24 ? "bg-emerald-50" : avgResolutionHours <= 72 ? "bg-amber-50" : "bg-rose-50",
      color: avgResolutionHours <= 24 ? "text-emerald-600" : avgResolutionHours <= 72 ? "text-amber-600" : "text-rose-600",
    },
  ];

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Back Button ──────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <button
          onClick={() => setView("staff")}
          className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Team</span>
        </button>
      </motion.div>

      {/* ─── Profile Header ───────────────────────────────────── */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white text-[26px] font-bold shadow-sm",
            getAvatarGradient(staffMember.name)
          )}
        >
          {getInitials(staffMember.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
              {staffMember.name}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] rounded-lg border font-medium",
                STATUS_COLORS[staffMember.status] || ""
              )}
            >
              {staffMember.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
            <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              {staffMember.role}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {staffMember.department}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {staffMember.email}
            </span>
            {staffMember.phone && (
              <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {staffMember.phone}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>
              Joined{" "}
              {staffMember.joinDate
                ? format(new Date(staffMember.joinDate), "MMM dd, yyyy")
                : "N/A"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─── Performance Scorecard ──────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {scorecards.map((sc) => (
          <Card
            key={sc.label}
            className="rounded-xl border-slate-200/60 bg-white card-hover"
          >
            <CardContent className="p-3.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    sc.bg
                  )}
                >
                  <sc.icon className={cn("h-4 w-4", sc.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    {sc.label}
                  </p>
                  <p
                    className={cn(
                      "text-[18px] font-bold leading-tight mt-0.5",
                      sc.color
                    )}
                  >
                    {sc.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ─── Ticket Status Donut Chart ────────────────────── */}
      {statusBreakdown.length > 0 && (
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-slate-500" />
                Ticket Status Breakdown
              </CardTitle>
              <CardDescription className="text-[12px] text-slate-500">
                Assigned tickets by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="h-[180px] w-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {statusBreakdown.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={TICKET_CHART_COLORS[entry.name] || "#94a3b8"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {statusBreakdown.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2.5">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", TICKET_DOT_COLORS[entry.name] || "bg-slate-400")} />
                      <span className="text-[13px] text-slate-600 flex-1">{entry.name}</span>
                      <span className="text-[13px] font-semibold text-slate-800">{entry.value}</span>
                      <span className="text-[11px] text-slate-400 w-10 text-right">
                        {totalAssigned > 0 ? `${((entry.value / totalAssigned) * 100).toFixed(0)}%` : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Stats Row ─────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {[
          {
            label: "Assigned Tickets",
            value: assignedTicketsCount,
            icon: TicketCheck,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
            valueColor: "text-emerald-600",
          },
          {
            label: "Reported Tickets",
            value: reportedTicketsCount,
            icon: UserCheck,
            bg: "bg-sky-50",
            color: "text-sky-600",
            valueColor: "text-sky-600",
          },
          {
            label: "Assets Assigned",
            value: assetsCount,
            icon: Monitor,
            bg: "bg-amber-50",
            color: "text-amber-600",
            valueColor: "text-amber-600",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="rounded-xl border-slate-200/60 bg-white card-hover"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "text-[22px] font-bold leading-tight mt-0.5",
                      stat.valueColor
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ─── Two Column Layout ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left Column */}
        <div className="flex-1 space-y-5 min-w-0">
          {/* Staff Information Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Staff Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "Full Name", value: staffMember.name },
                    { label: "Role", value: staffMember.role },
                    { label: "Department", value: staffMember.department },
                    {
                      label: "Status",
                      value: (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] rounded-lg border font-medium",
                            STATUS_COLORS[staffMember.status] || ""
                          )}
                        >
                          {staffMember.status}
                        </Badge>
                      ),
                    },
                    { label: "Email", value: staffMember.email },
                    {
                      label: "Phone",
                      value: staffMember.phone || "Not provided",
                    },
                    {
                      label: "Join Date",
                      value: staffMember.joinDate
                        ? format(new Date(staffMember.joinDate), "MMM dd, yyyy")
                        : "N/A",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-[13px] font-medium text-slate-900 mt-0.5">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assigned Assets Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-slate-500" />
                  Assigned Assets
                  <Badge
                    variant="secondary"
                    className="text-[11px] rounded-lg"
                  >
                    {assets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[260px] overflow-y-auto">
                  {assets.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-slate-50 mb-2">
                        <Monitor className="h-5 w-5 text-slate-300" />
                      </div>
                      <p className="text-[13px] text-slate-400">
                        No assets currently assigned
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="text-[12px] font-medium text-slate-500">
                            Asset Name
                          </TableHead>
                          <TableHead className="hidden sm:table-cell text-[12px] font-medium text-slate-500">
                            Serial #
                          </TableHead>
                          <TableHead className="text-[12px] font-medium text-slate-500">
                            Status
                          </TableHead>
                          <TableHead className="hidden md:table-cell text-[12px] font-medium text-slate-500">
                            Assigned
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assets.map((asset) => {
                          const assignment = asset.assignments?.find(
                            (a) =>
                              a.staffId === selectedItemId && !a.returnedAt
                          );
                          return (
                            <TableRow
                              key={asset.id}
                              className="cursor-pointer transition-colors border-slate-100 hover:bg-slate-50/80"
                              onClick={() =>
                                setView("asset-detail", asset.id)
                              }
                            >
                              <TableCell className="text-[13px] font-medium text-slate-900">
                                {asset.name}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell font-mono text-[11px] text-slate-400">
                                {asset.serialNumber}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] rounded-lg border font-medium",
                                    ASSET_STATUS_COLORS[asset.status] || ""
                                  )}
                                >
                                  {asset.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-[12px] text-slate-400">
                                {assignment
                                  ? format(
                                      new Date(assignment.assignedAt),
                                      "MMM dd, yyyy"
                                    )
                                  : "—"}
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

        {/* Right Column */}
        <div className="w-full lg:w-[380px] space-y-5">
          {/* Assigned Tickets Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <TicketCheck className="h-4 w-4 text-slate-500" />
                  Assigned Tickets
                  <Badge
                    variant="secondary"
                    className="text-[11px] rounded-lg"
                  >
                    {assignedTickets.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Tickets assigned to this staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
                  {assignedTickets.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-[13px] text-slate-400">No tickets assigned</p>
                    </div>
                  ) : (
                    assignedTickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-3 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50/80 hover:border-slate-200 transition-all group/ticket"
                        onClick={() => setView("ticket-detail", ticket.id)}
                      >
                        <p className="text-[13px] font-medium text-slate-900 truncate group-hover/ticket:text-emerald-700 transition-colors">{ticket.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className={cn("text-[10px] rounded-lg border font-medium", TICKET_STATUS_COLORS[ticket.status] || "")}>{ticket.status}</Badge>
                          <Badge variant="outline" className={cn("text-[10px] rounded-lg border font-medium", TICKET_PRIORITY_COLORS[ticket.priority] || "")}>{ticket.priority}</Badge>
                          <span className="text-[10px] text-slate-400 ml-auto">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reported Tickets Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-sky-500" />
                  Reported Tickets
                  <Badge
                    variant="secondary"
                    className="text-[11px] rounded-lg"
                  >
                    {reportedTickets.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Tickets reported by this staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
                  {reportedTickets.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-[13px] text-slate-400">No tickets reported</p>
                    </div>
                  ) : (
                    reportedTickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-3 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50/80 hover:border-slate-200 transition-all group/ticket"
                        onClick={() => setView("ticket-detail", ticket.id)}
                      >
                        <p className="text-[13px] font-medium text-slate-900 truncate group-hover/ticket:text-emerald-700 transition-colors">{ticket.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className={cn("text-[10px] rounded-lg border font-medium", TICKET_STATUS_COLORS[ticket.status] || "")}>{ticket.status}</Badge>
                          <Badge variant="outline" className={cn("text-[10px] rounded-lg border font-medium", TICKET_PRIORITY_COLORS[ticket.priority] || "")}>{ticket.priority}</Badge>
                          <span className="text-[10px] text-slate-400 ml-auto">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
