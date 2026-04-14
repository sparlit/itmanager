"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  Calendar,
  User,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  UserCircle,
  Shield,
  Zap,
  Archive,
  Pencil,
  Trash2,
  FileText,
  UserRoundCheck,
  Save,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComboboxInput } from "@/components/ui/combobox-input";
import { useAppStore } from "@/store/app-store";
import type { Ticket, TicketComment, Staff } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-sky-500",
];

// ─── Helpers ────────────────────────────────────────────────────
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Status Transitions ─────────────────────────────────────────
const NEXT_STATUS_MAP: Record<string, string[]> = {
  Open: ["In Progress", "On Hold", "Closed"],
  "In Progress": ["Resolved", "On Hold", "Open"],
  "On Hold": ["Open", "In Progress", "Closed"],
  Resolved: ["Closed", "Reopened"],
  Closed: ["Reopened"],
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Open: <AlertCircle className="h-4 w-4" />,
  "In Progress": <PlayCircle className="h-4 w-4" />,
  "On Hold": <PauseCircle className="h-4 w-4" />,
  Resolved: <CheckCircle2 className="h-4 w-4" />,
  Closed: <XCircle className="h-4 w-4" />,
};

// ─── Animation ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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
export function TicketDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    reportedByName: "",
    reportedById: "",
    reportedFromDepartment: "",
    reportDate: "",
    reportTime: "",
    assignedToName: "",
    assignedToId: "",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // ─── Data Fetching ────────────────────────────────────────────
  const fetchTicket = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const json = await res.json();
        const found = (json.tickets || []).find(
          (t: Ticket) => t.id === selectedItemId
        );
        setTicket(found || null);
      }
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
    }
  }, [selectedItemId]);

  const fetchComments = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch(
        `/api/tickets/comments?ticketId=${selectedItemId}`
      );
      if (res.ok) {
        const json = await res.json();
        setComments(json.comments || []);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [selectedItemId]);

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
      await Promise.all([fetchTicket(), fetchComments(), fetchStaff()]);
      setLoading(false);
    }
    loadData();
  }, [fetchTicket, fetchComments, fetchStaff]);

  // ─── Actions ──────────────────────────────────────────────────
  async function handleStatusChange(newStatus: string) {
    if (!selectedItemId) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tickets/update?id=${selectedItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus === "Reopened" ? "Open" : newStatus,
        }),
      });
      if (res.ok) {
        toast.success("Ticket status updated");
        await fetchTicket();
      }
    } catch (err) {
      toast.error("Failed to update ticket status");
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleReassign(staffId: string) {
    if (!selectedItemId) return;
    try {
      const res = await fetch(`/api/tickets/update?id=${selectedItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: staffId === "none" ? null : staffId }),
      });
      if (res.ok) {
        toast.success("Ticket reassigned successfully");
        await fetchTicket();
      }
    } catch (err) {
      toast.error("Failed to reassign ticket");
      console.error("Failed to reassign ticket:", err);
    }
  }

  async function handleAddComment(isInternal: boolean) {
    if (!selectedItemId || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const author = staff.length > 0 ? staff[0] : null;
      const authorId = author?.id || "";
      const authorName = author?.name || "System";

      const res = await fetch("/api/tickets/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedItemId,
          authorId,
          authorName,
          content: commentText.trim(),
          isInternal,
        }),
      });

      if (res.ok) {
        toast.success("Comment added");
        setCommentText("");
        await fetchComments();
      }
    } catch (err) {
      toast.error("Failed to add comment");
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  }

  function openEditDialog() {
    if (!ticket) return;
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      category: ticket.category,
      reportedByName: ticket.reportedByName || ticket.reporter?.name || "",
      reportedById: ticket.reportedBy || "",
      reportedFromDepartment: ticket.reportedFromDepartment || "",
      reportDate: ticket.reportDate || "",
      reportTime: ticket.reportTime || "",
      assignedToName: ticket.assignedToName || ticket.assignee?.name || "",
      assignedToId: ticket.assignedTo || "",
    });
    setEditDialogOpen(true);
  }

  async function handleEditSubmit() {
    if (!selectedItemId) return;
    setSubmittingEdit(true);
    try {
      const res = await fetch(`/api/tickets/update?id=${selectedItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          priority: editForm.priority,
          category: editForm.category,
          reportedByName: editForm.reportedByName,
          reportedById: editForm.reportedById || undefined,
          reportedFromDepartment: editForm.reportedFromDepartment,
          reportDate: editForm.reportDate,
          reportTime: editForm.reportTime,
          assignedToName: editForm.assignedToName || undefined,
          assignedToId: editForm.assignedToId || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Ticket updated successfully");
        setEditDialogOpen(false);
        await fetchTicket();
      }
    } catch (err) {
      toast.error("Failed to update ticket");
    } finally {
      setSubmittingEdit(false);
    }
  }

  async function handleDeleteTicket() {
    if (!selectedItemId) return;
    if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/tickets/delete?id=${selectedItemId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Ticket deleted successfully");
        setView("tickets");
      }
    } catch (err) {
      toast.error("Failed to delete ticket");
    }
  }

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <div className="flex-1 space-y-5">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="w-full lg:w-[300px] space-y-5">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
          <AlertCircle className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-[13px] text-slate-500">Ticket not found.</p>
        <Button
          variant="outline"
          onClick={() => setView("tickets")}
          className="text-[13px] rounded-lg border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
      </div>
    );
  }

  const availableStatuses = NEXT_STATUS_MAP[ticket.status] || [];

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Back Navigation ───────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <button
          className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-emerald-600 transition-colors"
          onClick={() => setView("tickets")}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Tickets</span>
        </button>
      </motion.div>

      {/* ─── Header Section ────────────────────────────────────── */}
      <motion.div
        className="flex flex-col gap-4"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2.5">
            <h1 className="text-[20px] font-bold tracking-tight text-slate-900 leading-snug">
              {ticket.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] rounded-lg border font-medium",
                  STATUS_COLORS[ticket.status] || ""
                )}
              >
                {STATUS_ICON[ticket.status] && (
                  <span className="mr-1">{STATUS_ICON[ticket.status]}</span>
                )}
                {ticket.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] rounded-lg border font-medium",
                  PRIORITY_COLORS[ticket.priority] || ""
                )}
              >
                {ticket.priority}
              </Badge>
              <Badge
                variant="outline"
                className="text-[11px] rounded-lg border border-slate-200 text-slate-600 font-medium"
              >
                {ticket.category}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Change Dropdown */}
            {availableStatuses.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingStatus}
                    className="text-[12px] rounded-lg border-slate-200"
                  >
                    {updatingStatus ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                        Updating...
                      </span>
                    ) : (
                      <>
                        <Zap className="mr-1.5 h-3.5 w-3.5" />
                        Change Status
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-lg">
                  {availableStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="text-[13px]"
                    >
                      {STATUS_ICON[status === "Reopened" ? "Open" : status]}
                      <span className="ml-2">{status}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={openEditDialog}
              className="text-[12px] rounded-lg border-slate-200"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteTicket}
              className="text-[12px] rounded-lg border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Report Info Bar */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500 bg-slate-50/60 border border-slate-100 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Reported By:</span>
            <span className="font-medium text-slate-700">{ticket.reportedByName || ticket.reporter?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Dept:</span>
            <span className="font-medium text-slate-700">{ticket.reportedFromDepartment || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Date:</span>
            <span className="font-medium text-slate-700">{ticket.reportDate || format(new Date(ticket.createdAt), "yyyy-MM-dd")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Time:</span>
            <span className="font-medium text-slate-700">{ticket.reportTime || format(new Date(ticket.createdAt), "HH:mm")}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400">
              Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─── Two Column Layout ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* ─── Left Column (Main) ───────────────────────────────── */}
        <div className="flex-1 space-y-5 min-w-0">
          {/* Description Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-700">
                  {ticket.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comments Section */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  Comments
                  <Badge
                    variant="secondary"
                    className="text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    {comments.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Comment Input */}
                  <div className="space-y-2.5 rounded-lg bg-slate-50/60 p-3.5 border border-slate-100">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="rounded-lg text-[13px] border-slate-200 resize-none bg-white"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Supports Markdown
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[12px] rounded-lg border-slate-200 h-8"
                          onClick={() => handleAddComment(true)}
                          disabled={
                            !commentText.trim() || submittingComment
                          }
                        >
                          <Lock className="mr-1.5 h-3 w-3 text-amber-500" />
                          Internal Note
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg h-8 shadow-sm shadow-emerald-600/20"
                          onClick={() => handleAddComment(false)}
                          disabled={
                            !commentText.trim() || submittingComment
                          }
                        >
                          <Send className="mr-1.5 h-3 w-3" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Comments List */}
                  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
                    {comments.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 mx-auto mb-2.5">
                          <MessageSquare className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium">
                          No comments yet
                        </p>
                        <p className="text-[12px] text-slate-400 mt-0.5">
                          Be the first to respond!
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="group flex gap-3 rounded-lg p-2 -mx-2 hover:bg-slate-50/60 transition-colors"
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-[11px] font-semibold shadow-sm",
                              getAvatarColor(comment.authorName)
                            )}
                          >
                            {getInitials(comment.authorName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-medium text-slate-800">
                                {comment.authorName}
                              </span>
                              {comment.isInternal && (
                                <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 rounded-md font-medium px-1.5 py-0">
                                  <Shield className="mr-0.5 h-2.5 w-2.5" />
                                  Internal
                                </Badge>
                              )}
                              <span className="text-[11px] text-slate-400">
                                {formatDistanceToNow(
                                  new Date(comment.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                            <p className="text-[13px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Right Column (Sidebar) ───────────────────────────── */}
        <div className="w-full lg:w-[300px] space-y-5">
          {/* Details Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {[
                  {
                    icon: User,
                    label: "Reporter",
                    value: ticket.reportedByName || ticket.reporter?.name || "Unknown",
                  },
                  {
                    icon: Tag,
                    label: "Department",
                    value: ticket.reportedFromDepartment || "N/A",
                  },
                  {
                    icon: Calendar,
                    label: "Report Date",
                    value: ticket.reportDate || format(new Date(ticket.createdAt), "yyyy-MM-dd"),
                  },
                  {
                    icon: Clock,
                    label: "Report Time",
                    value: ticket.reportTime || format(new Date(ticket.createdAt), "HH:mm"),
                  },
                  {
                    icon: UserCircle,
                    label: "Assigned To",
                    value: ticket.assignedToName || ticket.assignee?.name,
                    empty: "Unassigned",
                  },
                  {
                    icon: AlertCircle,
                    label: "Priority",
                    value: null,
                    badge: ticket.priority,
                    badgeColor: PRIORITY_COLORS[ticket.priority],
                  },
                  {
                    icon: CheckCircle2,
                    label: "Status",
                    value: null,
                    badge: ticket.status,
                    badgeColor: STATUS_COLORS[ticket.status],
                  },
                ].map((item, idx) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
                        <item.icon className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">
                          {item.label}
                        </p>
                        {item.badge ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-0.5 text-[11px] rounded-lg border font-medium",
                              item.badgeColor || ""
                            )}
                          >
                            {item.badge}
                          </Badge>
                        ) : item.value ? (
                          <p className="text-[13px] font-medium text-slate-800">
                            {item.value}
                          </p>
                        ) : (
                          <p className="text-[13px] text-slate-400 italic">
                            {item.empty}
                          </p>
                        )}
                      </div>
                    </div>
                    {idx < 6 && <Separator className="bg-slate-100" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0">
                  {/* Created */}
                  <TimelineItem
                    icon={AlertCircle}
                    iconBg="bg-emerald-100"
                    iconColor="text-emerald-600"
                    label="Created"
                    time={format(
                      new Date(ticket.createdAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                    showLine={
                      !!ticket.assignedTo ||
                      !!ticket.resolvedAt ||
                      !!ticket.closedAt
                    }
                  />

                  {/* Assigned */}
                  {ticket.assignedTo && (
                    <TimelineItem
                      icon={UserCircle}
                      iconBg="bg-blue-100"
                      iconColor="text-blue-600"
                      label="Assigned"
                      time={`to ${ticket.assignee?.name || "Staff member"}`}
                      showLine={!!ticket.resolvedAt || !!ticket.closedAt}
                    />
                  )}

                  {/* Resolved */}
                  {ticket.resolvedAt && (
                    <TimelineItem
                      icon={CheckCircle2}
                      iconBg="bg-teal-100"
                      iconColor="text-teal-600"
                      label="Resolved"
                      time={format(
                        new Date(ticket.resolvedAt),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                      showLine={!!ticket.closedAt}
                    />
                  )}

                  {/* Closed */}
                  {ticket.closedAt && (
                    <TimelineItem
                      icon={XCircle}
                      iconBg="bg-gray-100"
                      iconColor="text-gray-500"
                      label="Closed"
                      time={format(
                        new Date(ticket.closedAt),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                      showLine={false}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Change ticket status with one click
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {ticket.status === "Open" && (
                  <ActionButton
                    icon={PlayCircle}
                    label="Mark In Progress"
                    className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-100"
                    onClick={() => handleStatusChange("In Progress")}
                    disabled={updatingStatus}
                  />
                )}

                {(ticket.status === "Open" ||
                  ticket.status === "In Progress" ||
                  ticket.status === "On Hold") && (
                  <ActionButton
                    icon={CheckCircle2}
                    label="Resolve"
                    className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 border-teal-100"
                    onClick={() => handleStatusChange("Resolved")}
                    disabled={updatingStatus}
                  />
                )}

                {ticket.status === "Resolved" && (
                  <ActionButton
                    icon={Archive}
                    label="Close Ticket"
                    className="text-gray-700 hover:text-gray-800 hover:bg-gray-50 border-gray-100"
                    onClick={() => handleStatusChange("Closed")}
                    disabled={updatingStatus}
                  />
                )}

                {(ticket.status === "Resolved" ||
                  ticket.status === "Closed") && (
                  <ActionButton
                    icon={RotateCcw}
                    label="Reopen"
                    className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-100"
                    onClick={() => handleStatusChange("Reopened")}
                    disabled={updatingStatus}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      {/* ─── Edit Dialog ────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[780px] rounded-2xl border-slate-200/60 p-0 gap-0 overflow-hidden">
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-slate-700 via-slate-600 to-emerald-600 px-7 py-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-50" />
            <DialogHeader className="relative">
              <DialogTitle className="text-[18px] font-semibold text-white flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                Edit Ticket
              </DialogTitle>
              <DialogDescription className="text-[13px] text-slate-200 mt-1">
                Modify the ticket details below and save your changes.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[calc(85vh-180px)]">
            <div className="px-7 py-6 space-y-6">

              {/* ═══ Section 1: Issue Details ═══ */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Issue Details</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Title <span className="text-rose-400">*</span>
                    </label>
                    <Input className="mt-1.5 h-11 rounded-lg text-[14px] border-slate-200 bg-white" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Description <span className="text-rose-400">*</span>
                    </label>
                    <Textarea className="mt-1.5 rounded-lg text-[14px] border-slate-200 resize-none bg-white leading-relaxed" rows={5} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* ═══ Section 2: Classification ═══ */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Tag className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Classification</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Priority <span className="text-rose-400">*</span>
                    </label>
                    <ComboboxInput
                      className="mt-1.5"
                      value={editForm.priority}
                      onChange={(val) => setEditForm({ ...editForm, priority: val })}
                      placeholder="Select priority level..."
                      emptyMessage="Type a custom priority."
                      options={[
                        { value: "Critical", label: "🔴 Critical" },
                        { value: "High", label: "🟠 High" },
                        { value: "Medium", label: "🟡 Medium" },
                        { value: "Low", label: "🔵 Low" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <ComboboxInput
                      className="mt-1.5"
                      value={editForm.category}
                      onChange={(val) => setEditForm({ ...editForm, category: val })}
                      placeholder="Select category..."
                      emptyMessage="Type a custom category."
                      options={[
                        { value: "Hardware", label: "🖥️ Hardware" },
                        { value: "Software", label: "💿 Software" },
                        { value: "Network", label: "🌐 Network" },
                        { value: "Access", label: "🔑 Access" },
                        { value: "Security", label: "🔒 Security" },
                        { value: "Infrastructure", label: "🏗️ Infrastructure" },
                        { value: "General", label: "📋 General" },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* ═══ Section 3: Reporter Information ═══ */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <UserCircle className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Reporter Information</h3>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    type or select
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Reported By <span className="text-rose-400">*</span>
                    </label>
                    <ComboboxInput
                      className="mt-1.5"
                      value={editForm.reportedByName}
                      onChange={(val) => {
                        setEditForm({ ...editForm, reportedByName: val });
                        const match = staff.find((s) => s.name.toLowerCase() === val.toLowerCase());
                        setEditForm((prev) => ({ ...prev, reportedById: match ? match.id : "" }));
                      }}
                      placeholder="Type name or select..."
                      emptyMessage="No staff found. Type a custom name."
                      options={staff.map((s) => ({ value: s.name, label: s.name, description: s.department }))}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Department <span className="text-rose-400">*</span>
                    </label>
                    <ComboboxInput
                      className="mt-1.5"
                      value={editForm.reportedFromDepartment}
                      onChange={(val) => setEditForm({ ...editForm, reportedFromDepartment: val })}
                      placeholder="Type department or select..."
                      emptyMessage="No match. Type a custom department."
                      options={Array.from(new Set(staff.map((s) => s.department))).map((dept) => ({ value: dept, label: dept }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Report Date <span className="text-rose-400">*</span>
                    </label>
                    <Input type="date" className="mt-1.5 h-11 rounded-lg text-[14px] border-slate-200 bg-white" value={editForm.reportDate} onChange={(e) => setEditForm({ ...editForm, reportDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Report Time <span className="text-rose-400">*</span>
                    </label>
                    <Input type="time" className="mt-1.5 h-11 rounded-lg text-[14px] border-slate-200 bg-white" value={editForm.reportTime} onChange={(e) => setEditForm({ ...editForm, reportTime: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* ═══ Section 4: Assignment ═══ */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <UserRoundCheck className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Assignment</h3>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    optional
                  </span>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <ComboboxInput
                  value={editForm.assignedToName || ""}
                  onChange={(val) => {
                    setEditForm({ ...editForm, assignedToName: val });
                    const match = staff.find((s) => s.name.toLowerCase() === val.toLowerCase());
                    setEditForm((prev) => ({ ...prev, assignedToId: match ? match.id : "" }));
                  }}
                  placeholder="Type name or select from list..."
                  emptyMessage="No staff found. Type a custom name."
                  options={staff.map((s) => ({ value: s.name, label: s.name, description: s.role }))}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-7 py-4 flex items-center justify-between gap-3">
            <p className="text-[12px] text-slate-400 hidden sm:block">
              Fields marked with <span className="text-rose-400">*</span> are required
            </p>
            <div className="flex items-center gap-2.5 ml-auto">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-lg text-[13px] border-slate-200 h-10 px-5">
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-600/20 h-10 px-6 text-[13px] font-medium" disabled={submittingEdit} onClick={handleEditSubmit}>
                {submittingEdit ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────

function TimelineItem({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  time,
  showLine,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  time: string;
  showLine: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            iconBg
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        </div>
        {showLine && <div className="w-px flex-1 bg-slate-100 mt-1" />}
      </div>
      <div className={cn("pb-4", !showLine && "pb-0")}>
        <p className="text-[13px] font-medium text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  className,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      variant="outline"
      className={cn("w-full justify-start gap-2 text-[13px] rounded-lg", className)}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
