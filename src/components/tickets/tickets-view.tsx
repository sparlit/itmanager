"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatDistanceToNow } from "date-fns";
import {
  Plus,
  Search,
  TicketCheck,
  MessageSquare,
  X,
  SlidersHorizontal,
  Inbox,
  Trash2,
  FileText,
  Tag,
  UserCircle,
  CalendarClock,
  UserRoundCheck,
  Download,
  KeyRound,
  Monitor,
  Package,
  Wifi,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboboxInput } from "@/components/ui/combobox-input";
import { useAppStore } from "@/store/app-store";
import { useDebounce } from "@/hooks";
import type { Ticket, Staff } from "@/types";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import { cn } from "@/lib/utils";

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

const STATUS_DOT_COLORS: Record<string, string> = {
  Open: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  Resolved: "bg-teal-500",
};

// ─── Constants ──────────────────────────────────────────────────
const STATUSES = ["All", "Open", "In Progress", "On Hold", "Resolved", "Closed"];
const PRIORITIES = ["All", "Critical", "High", "Medium", "Low"];
const CATEGORIES = [
  "All",
  "Hardware",
  "Software",
  "Network",
  "Access",
  "Security",
  "Infrastructure",
  "General",
];

// ─── Form Schema ────────────────────────────────────────────────
const ticketFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(1, "Description is required"),
  priority: z.string().min(1, "Priority is required"),
  category: z.string().min(1, "Category is required"),
  reportedByName: z.string().min(1, "Reporter is required"),
  reportedById: z.string().optional(),
  reportedFromDepartment: z.string().min(1, "Department is required"),
  reportDate: z.string().min(1, "Report date is required"),
  reportTime: z.string().min(1, "Report time is required"),
  assignedToName: z.string().optional(),
  assignedToId: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

// ─── Ticket Templates ────────────────────────────────────────
const TICKET_TEMPLATES = [
  {
    id: "password-reset",
    name: "Password Reset",
    icon: KeyRound,
    title: "Password Reset Request",
    category: "Access",
    priority: "Medium",
    description: "I need to reset my password. Please assist with resetting credentials for the following system:\n\n",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: "new-equipment",
    name: "New Equipment",
    icon: Monitor,
    title: "New Equipment Request",
    category: "Hardware",
    priority: "Medium",
    description: "I would like to request the following equipment:\n\n- Type:\n- Specifications:\n- Justification:\n",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    id: "software-install",
    name: "Software Install",
    icon: Package,
    title: "Software Installation",
    category: "Software",
    priority: "Low",
    description: "Please install the following software:\n\n- Software Name:\n- Version:\n- Machine:\n",
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
  {
    id: "network-issue",
    name: "Network Issue",
    icon: Wifi,
    title: "Network Connectivity Issue",
    category: "Network",
    priority: "High",
    description: "I am experiencing network issues:\n\n- Location:\n- Issue Description:\n- Impact:\n",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  {
    id: "vpn-setup",
    name: "VPN Setup",
    icon: Shield,
    title: "VPN Access Request",
    category: "Access",
    priority: "Medium",
    description: "I need VPN access configured:\n\n- Reason:\n- Required Resources:\n",
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
] as const;

// ─── Animation ──────────────────────────────────────────────────
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
export function TicketsView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { setView } = useAppStore();

  // Listen for the "open-create-ticket" custom event from Dashboard quick actions
  useEffect(() => {
    function handleOpenTicket() {
      setDialogOpen(true);
    }
    window.addEventListener("open-create-ticket", handleOpenTicket);
    return () => window.removeEventListener("open-create-ticket", handleOpenTicket);
  }, []);

  // Get current date/time for defaults
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const timeStr = format(now, "HH:mm");

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      category: "General",
      reportedByName: "",
      reportedById: "",
      reportedFromDepartment: "",
      reportDate: todayStr,
      reportTime: timeStr,
      assignedToName: "",
      assignedToId: "",
    },
  });

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (priorityFilter !== "All") params.set("priority", priorityFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  }, [statusFilter, priorityFilter, categoryFilter, debouncedSearch]);

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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchTickets(), fetchStaff()]);
      setLoading(false);
    }
    loadData();
  }, [fetchTickets, fetchStaff]);

  async function onSubmit(values: TicketFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          priority: values.priority,
          category: values.category,
          reportedByName: values.reportedByName,
          reportedById: values.reportedById || undefined,
          reportedFromDepartment: values.reportedFromDepartment,
          reportDate: values.reportDate,
          reportTime: values.reportTime,
          assignedToName: values.assignedToName || undefined,
          assignedToId: values.assignedToId || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Ticket created successfully");
        setDialogOpen(false);
        form.reset();
        await fetchTickets();
      }
    } catch (err) {
      toast.error("Failed to create ticket");
      console.error("Failed to create ticket:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const res = await fetch(`/api/tickets/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Ticket deleted successfully");
        await fetchTickets();
      }
    } catch (err) {
      toast.error("Failed to delete ticket");
    }
  }

  async function handleExport() {
    try {
      const res = await fetch("/api/export?type=tickets");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const disposition = res.headers.get("Content-Disposition");
        const filename = disposition
          ? disposition.split("filename=")[1]?.replace(/"/g, "")
          : "tickets-export.csv";
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Export downloaded successfully");
      }
    } catch (err) {
      toast.error("Failed to export data");
    }
  }

  function clearFilters() {
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setSearchQuery("");
  }

  const hasActiveFilters =
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    categoryFilter !== "All" ||
    searchQuery !== "";

  // Count stats from tickets
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "In Progress"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-44 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>
        <Card className="rounded-xl border-slate-200/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-40 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-slate-200/60">
          <CardContent className="p-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full border-b border-slate-100" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Page Header ───────────────────────────────────────── */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-600/20"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      </motion.div>

      {/* ─── Stats Mini-Bar ────────────────────────────────────── */}
      <motion.div
        className="flex flex-wrap gap-3"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {[
          { label: "Open", count: openCount, dot: "bg-emerald-500" },
          {
            label: "In Progress",
            count: inProgressCount,
            dot: "bg-amber-500",
          },
          {
            label: "Resolved",
            count: resolvedCount,
            dot: "bg-teal-500",
          },
          {
            label: "Total",
            count: tickets.length,
            dot: "bg-slate-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3.5 py-2"
          >
            <span
              className={cn("h-2 w-2 rounded-full", stat.dot)}
            />
            <span className="text-[12px] font-medium text-slate-600">
              {stat.label}
            </span>
            <span className="text-[13px] font-semibold text-slate-900">
              {stat.count}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ─── Filter Bar ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 mr-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-[12px] font-medium">Filters</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[148px] h-9 rounded-lg text-[13px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s === "All" ? "All" : s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[148px] h-9 rounded-lg text-[13px] border-slate-200">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p === "All" ? "All" : p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[165px] h-9 rounded-lg text-[13px] border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c === "All" ? "All" : c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg text-[13px] border-slate-200"
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[12px] text-slate-500 hover:text-slate-700 rounded-lg"
                  onClick={clearFilters}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear filters
                </Button>
              )}

              <div className="ml-auto text-[12px] font-medium text-slate-400">
                {tickets.length} result{tickets.length !== 1 ? "s" : ""}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Tickets Table ─────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pl-5 text-[12px] font-medium text-slate-500 w-[100px]">
                      ID
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Title
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Priority
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Category
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Reported By
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500 hidden lg:table-cell">
                      Dept
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Assigned To
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500 text-center w-[70px]">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pr-5 text-[12px] font-medium text-slate-500 text-right w-[140px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-52 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                            <Inbox className="h-8 w-8 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-slate-600">
                              No tickets found
                            </p>
                            <p className="text-[12px] mt-0.5">
                              {hasActiveFilters
                                ? "Try adjusting your filters"
                                : "Create your first ticket to get started"}
                            </p>
                          </div>
                          {hasActiveFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                              className="mt-1 text-[12px] rounded-lg"
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket, index) => (
                      <TableRow
                        key={ticket.id}
                        className={cn(
                          "cursor-pointer transition-colors border-slate-100 hover:bg-slate-50/80",
                          index % 2 === 1 && "bg-slate-50/40"
                        )}
                        onClick={() => setView("ticket-detail", ticket.id)}
                      >
                        <TableCell className="pl-5 font-mono text-[11px] text-slate-400">
                          {ticket.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[240px] truncate text-[13px] font-medium text-slate-900">
                            {ticket.title}
                          </div>
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
                        <TableCell>
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
                        <TableCell className="text-[13px] text-slate-500">
                          {ticket.category}
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-600 font-medium">
                          {ticket.reportedByName || ticket.reporter?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-500 hidden lg:table-cell">
                          {ticket.reportedFromDepartment ? (
                            <Badge
                              variant="secondary"
                              className="text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-100 rounded-md font-normal"
                            >
                              {ticket.reportedFromDepartment}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-500">
                          {ticket.assignedToName || ticket.assignee?.name || (
                            <span className="text-slate-400 italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
                            <MessageSquare className="h-3 w-3" />
                            {ticket._count?.comments || 0}
                          </span>
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[12px] text-slate-400">
                              {ticket.reportDate
                                ? `${ticket.reportDate} ${ticket.reportTime || ""}`
                                : formatDistanceToNow(new Date(ticket.createdAt), {
                                    addSuffix: true,
                                  })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(ticket.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {/* ─── Create Ticket Window ─────────────────────────────────── */}
      <StandardWindow
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create New Ticket"
        description="Fill in the details below to submit a new support ticket."
        icon={<TicketCheck className="h-4 w-4 text-white" />}
        headerGradient="from-sky-600 to-blue-500"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => form.reset()}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<TicketCheck className="h-3.5 w-3.5" />}
        statusMessages={[
          `${tickets.length} total tickets`,
          `${tickets.filter((t) => t.status === "Open").length} open`,
          `${tickets.filter((t) => t.status === "In Progress").length} in progress`,
          `${tickets.filter((t) => t.status === "Resolved").length} resolved`,
        ]}
        defaultWidth={800}
        defaultHeight={700}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Quick Templates */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-[12px] font-medium text-slate-500">Quick start with a template</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {TICKET_TEMPLATES.map((tmpl) => (
                    <button type="button" key={tmpl.id} className={cn("flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all hover:shadow-sm hover:-translate-y-0.5", tmpl.color)} onClick={() => { form.setValue("title", tmpl.title); form.setValue("category", tmpl.category); form.setValue("priority", tmpl.priority); form.setValue("description", tmpl.description); }}>
                      <tmpl.icon className="h-5 w-5" />
                      <span className="text-[11px] font-semibold leading-tight">{tmpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><FileText className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Issue Details</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem className="mb-4"><FormLabel className="text-[13px] font-medium text-slate-700">Title <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="Brief description of the issue" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Description <span className="text-rose-400">*</span></FormLabel><FormControl><Textarea placeholder="Provide a detailed description of the problem..." rows={5} className="rounded-lg text-[13px] border-slate-200 resize-none" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>

              <Separator />

              {/* Classification */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Tag className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Classification</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Priority <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select priority..." options={[{ value: "Critical", label: "🔴 Critical" }, { value: "High", label: "🟠 High" }, { value: "Medium", label: "🟡 Medium" }, { value: "Low", label: "🔵 Low" }]} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Category <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select category..." options={CATEGORIES.filter((c) => c !== "All").map((c) => ({ value: c, label: c }))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
              </div>

              <Separator />

              {/* Reporter Info */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700"><UserCircle className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Reporter Information</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="reportedByName" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Reported By <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="Your name" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="reportedFromDepartment" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Department <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="Your department" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="reportDate" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Report Date <span className="text-rose-400">*</span></FormLabel><FormControl><Input type="date" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="reportTime" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Report Time <span className="text-rose-400">*</span></FormLabel><FormControl><Input type="time" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
              </div>

              <Separator />

              {/* Assignment */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><UserRoundCheck className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Assignment</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <FormField control={form.control} name="assignedToName" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Assign To</FormLabel><FormControl><ComboboxInput value={field.value || ""} onChange={field.onChange} placeholder="Select staff member..." options={staff.map((s) => ({ value: s.name, label: s.name }))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
            </div>
          </form>
        </Form>
      </StandardWindow>
    </motion.div>
  );
}
