"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Search,
  HardDrive,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Calendar,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BackupRecord } from "@/types";

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

// ─── Helpers ────────────────────────────────────────────────────
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Failed: "bg-rose-50 text-rose-700 border-rose-200",
    Running: "bg-sky-50 text-sky-700 border-sky-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

function getStatusIcon(status: string): React.ElementType {
  switch (status) {
    case "Completed":
      return CheckCircle2;
    case "Failed":
      return XCircle;
    case "Running":
      return RefreshCw;
    case "Pending":
      return Clock;
    default:
      return AlertTriangle;
  }
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function BackupsView() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/api/backups");
      if (res.ok) {
        const json = await res.json();
        setBackups(json.backups || []);
      }
    } catch (err) {
      console.error("Failed to fetch backups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleRunBackup = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "Full" }),
      });
      if (res.ok) {
        toast.success("Backup started successfully");
        fetchBackups();
      } else {
        toast.error("Failed to start backup");
      }
    } catch {
      toast.error("Failed to start backup");
    } finally {
      setRunning(false);
    }
  };

  const filteredBackups = backups.filter((b) => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    if (typeFilter !== "All" && b.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (b.name || "").toLowerCase().includes(q) ||
        (b.type || "").toLowerCase().includes(q) ||
        (b.location || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalBackups = backups.length;
  const successful = backups.filter((b) => b.status === "Completed").length;
  const failed = backups.filter((b) => b.status === "Failed").length;
  const lastBackup =
    backups.length > 0
      ? backups
          .sort(
            (a, b) =>
              new Date(b.startedAt || 0).getTime() -
              new Date(a.startedAt || 0).getTime()
          )[0]
      : null;

  const types = [
    "All",
    ...Array.from(new Set(backups.map((b) => b.type))),
  ];
  const statuses = [
    "All",
    ...Array.from(new Set(backups.map((b) => b.status))),
  ];

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-center justify-end">
          <Button
            onClick={handleRunBackup}
            disabled={running}
            className="gap-2 h-10 px-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-sm shadow-emerald-200"
          >
            {running ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run Backup
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* ─── Stat Cards ──────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Backups",
              value: totalBackups,
              icon: Database,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Successful",
              value: successful,
              icon: CheckCircle2,
              color: "text-sky-600",
              bg: "bg-sky-50",
            },
            {
              label: "Failed",
              value: failed,
              icon: XCircle,
              color: "text-rose-600",
              bg: "bg-rose-50",
            },
            {
              label: "Last Backup",
              value: lastBackup
                ? formatDate(lastBackup.startedAt)
                : "N/A",
              icon: Calendar,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border-slate-200/70 shadow-sm"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[18px] font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* ─── Filters ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search backups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-[13px] border-slate-200"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[140px] h-10 text-[13px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "All" ? "All Status" : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-10 text-[13px] border-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "All" ? "All Types" : t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Backup History Table ────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredBackups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <HardDrive className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-[14px] font-medium">No backups found</p>
                <p className="text-[12px] mt-1">
                  {searchQuery || statusFilter !== "All" || typeFilter !== "All"
                    ? "Try adjusting your filters"
                    : "Backup history will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200/70">
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">
                      Name
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">
                      Type
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">
                      Status
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">
                      Size
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">
                      Date
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">
                      Duration
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBackups.map((backup) => {
                    const StatusIcon = getStatusIcon(backup.status);
                    return (
                      <TableRow
                        key={backup.id}
                        className="border-slate-100 hover:bg-slate-50/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                              <FileText className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-slate-900 truncate max-w-[200px]">
                                {backup.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {backup.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">
                            {backup.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[11px] font-medium border gap-1.5",
                              getStatusColor(backup.status)
                            )}
                          >
                            <StatusIcon
                              className={cn(
                                "h-3 w-3",
                                backup.status === "Running" && "animate-spin"
                              )}
                            />
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-600 font-mono">
                          {formatBytes(backup.size)}
                        </TableCell>
                        <TableCell className="text-[12px] text-slate-600">
                          {formatDate(backup.startedAt)}
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-600 font-mono">
                          {formatDuration(backup.duration)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
