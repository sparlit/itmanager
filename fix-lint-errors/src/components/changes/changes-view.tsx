"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, Search, Filter, GitBranch, AlertTriangle, CheckCircle2, Clock, XCircle,
  MoreHorizontal, Trash2, Pencil, Calendar, User, Shield, FileText,
  ChevronDown, Eye, ThumbsUp, ThumbsDown, Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { ChangeRequest } from "@/types";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

const changeFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  changeType: z.string().min(1, "Change type is required"),
  priority: z.string().min(1, "Priority is required"),
  riskLevel: z.string().min(1, "Risk level is required"),
  status: z.string().min(1, "Status is required"),
  reason: z.string().optional(),
  implementationPlan: z.string().optional(),
  rollbackPlan: z.string().optional(),
  impactAnalysis: z.string().optional(),
  requestedByName: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  affectedAssets: z.string().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
});

type ChangeFormValues = z.infer<typeof changeFormSchema>;

const CHANGE_TYPES = ["Standard", "Normal", "Emergency", "Major"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];
const CHANGE_STATUSES = ["Draft", "Pending Review", "Approved", "Scheduled", "In Progress", "Completed", "Rejected", "Cancelled"];
const CHANGE_CATEGORIES = ["Infrastructure", "Application", "Network", "Security", "Database", "Hardware", "Process"];

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "Draft": "bg-slate-50 text-slate-700 border-slate-200",
    "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Scheduled": "bg-sky-50 text-sky-700 border-sky-200",
    "In Progress": "bg-violet-50 text-violet-700 border-violet-200",
    "Completed": "bg-teal-50 text-teal-700 border-teal-200",
    "Rejected": "bg-rose-50 text-rose-700 border-rose-200",
    "Cancelled": "bg-gray-50 text-gray-700 border-gray-200",
  };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

function getRiskColor(risk: string): string {
  const colors: Record<string, string> = { Low: "text-emerald-600", Medium: "text-amber-600", High: "text-orange-600", Critical: "text-rose-600" };
  return colors[risk] || "text-slate-600";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function ChangesView() {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingChange, setEditingChange] = useState<ChangeRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { setView } = useAppStore();

  const form = useForm<ChangeFormValues>({
    resolver: zodResolver(changeFormSchema),
    defaultValues: { title: "", description: "", changeType: "Standard", priority: "Medium", riskLevel: "Low", status: "Draft", reason: "", implementationPlan: "", rollbackPlan: "", impactAnalysis: "", requestedByName: "", category: "Infrastructure", affectedAssets: "", scheduledStart: "", scheduledEnd: "" },
  });

  const fetchChanges = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/changes?${params.toString()}`);
      if (res.ok) { const json = await res.json(); setChanges(json.changes || []); }
    } catch (err) { console.error("Failed to fetch changes:", err); }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => { async function loadData() { setLoading(true); await fetchChanges(); setLoading(false); } loadData(); }, [fetchChanges]);

  const onSubmit = async (values: ChangeFormValues) => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...values };
      if (editingChange) body.id = editingChange.id;
      const url = editingChange ? "/api/changes/update" : "/api/changes";
      const method = editingChange ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editingChange ? "Change request updated" : "Change request created");
        setDialogOpen(false); setEditingChange(null); form.reset(); fetchChanges();
      } else { const error = await res.json(); toast.error(error.error || "Failed to save"); }
    } catch { toast.error("An unexpected error occurred"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this change request?")) return;
    try { const res = await fetch("/api/changes/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); if (res.ok) { toast.success("Deleted"); fetchChanges(); } }
    catch { toast.error("Failed to delete"); }
  };

  const handleEdit = (change: ChangeRequest) => {
    setEditingChange(change);
    form.reset({ title: change.title, description: change.description, changeType: change.changeType, priority: change.priority, riskLevel: change.riskLevel, status: change.status, reason: change.reason, implementationPlan: change.implementationPlan, rollbackPlan: change.rollbackPlan, impactAnalysis: change.impactAnalysis, requestedByName: change.requestedByName, category: change.category, affectedAssets: change.affectedAssets, scheduledStart: change.scheduledStart || "", scheduledEnd: change.scheduledEnd || "" });
    setDialogOpen(true);
  };

  const stats = {
    total: changes.length,
    draft: changes.filter((c) => c.status === "Draft").length,
    inProgress: changes.filter((c) => c.status === "In Progress").length,
    completed: changes.filter((c) => c.status === "Completed").length,
    highRisk: changes.filter((c) => c.riskLevel === "High" || c.riskLevel === "Critical").length,
  };

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEditingChange(null); form.reset(); setDialogOpen(true); }} className="gap-2 h-10 px-5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 shadow-sm shadow-violet-200"><Plus className="h-4 w-4" />New Change</Button>
          <Button variant="outline" className="gap-2 h-10" onClick={async () => { try { const res = await fetch("/api/export?type=changes"); if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "changes.csv"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast.success("Export downloaded"); } } catch { toast.error("Export failed"); } }}><Download className="h-4 w-4" />Export</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Changes", value: stats.total, icon: GitBranch, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Draft", value: stats.draft, icon: FileText, color: "text-slate-600", bg: "bg-slate-50" },
            { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-sky-600", bg: "bg-sky-50" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "High Risk", value: stats.highRisk, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}><stat.icon className={cn("h-5 w-5", stat.color)} /></div><div><p className="text-[18px] font-bold text-slate-900">{stat.value}</p><p className="text-[11px] text-slate-500">{stat.label}</p></div></CardContent></Card>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search changes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-[13px] border-slate-200" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px] h-10 text-[13px] border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="All">All Status</SelectItem>{CHANGE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[150px] h-10 text-[13px] border-slate-200"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="All">All Categories</SelectItem>{CHANGE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent></Card>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-0"><div className="overflow-x-auto">
          {loading ? (<div className="flex items-center justify-center py-16"><div className="h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>)
            : changes.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><GitBranch className="h-12 w-12 mb-3 opacity-30" /><p className="text-[14px] font-medium">No change requests</p><p className="text-[12px] mt-1">Create your first change request</p></div>)
            : (<Table><TableHeader><TableRow className="border-slate-200/70"><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Title</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Type</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Risk</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Status</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Requested By</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Scheduled</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 w-[50px]" /></TableRow></TableHeader><TableBody>
              {changes.map((change) => (
                <TableRow key={change.id} className="border-slate-100 hover:bg-slate-50/50 cursor-pointer" onClick={() => setView("change-detail", change.id)}>
                  <TableCell><div><p className="text-[13px] font-medium text-slate-900">{change.title}</p><p className="text-[11px] text-slate-500">{change.category}</p></div></TableCell>
                  <TableCell><Badge variant="outline" className="text-[11px]">{change.changeType}</Badge></TableCell>
                  <TableCell><span className={cn("text-[13px] font-medium", getRiskColor(change.riskLevel))}>{change.riskLevel}</span></TableCell>
                  <TableCell><Badge className={cn("text-[11px] font-medium border", getStatusColor(change.status))}>{change.status}</Badge></TableCell>
                  <TableCell className="text-[12px] text-slate-600">{change.requestedByName || "—"}</TableCell>
                  <TableCell className="text-[12px] text-slate-600">{formatDate(change.scheduledStart)}</TableCell>
                  <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(change); }}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem><DropdownMenuItem className="text-rose-600" onClick={(e) => { e.stopPropagation(); handleDelete(change.id); }}><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>)}  </div></CardContent></Card>
      </motion.div>

      <StandardWindow
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingChange(null); }}
        title={editingChange ? "Edit Change Request" : "New Change Request"}
        description={editingChange ? "Update change details" : "Submit a new change request for review"}
        icon={<GitBranch className="h-4 w-4 text-white" />}
        headerGradient="from-violet-600 to-violet-700"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => { form.reset(); setEditingChange(null); }}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<GitBranch className="h-3.5 w-3.5" />}
        statusMessages={[
          `${changes.length} total changes`,
          `${changes.filter((c) => c.status === "Draft").length} drafts`,
          `${changes.filter((c) => c.status === "In Progress").length} in progress`,
          `${changes.filter((c) => c.status === "Completed").length} completed`,
        ]}
        defaultWidth={850}
        defaultHeight={750}
      >
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Title <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="Brief title for the change" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Description <span className="text-rose-400">*</span></FormLabel><FormControl><Textarea placeholder="Detailed description of the change" className="text-[13px] border-slate-200 min-h-[60px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="changeType" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Change Type <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{CHANGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Priority <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="riskLevel" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Risk Level <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{RISK_LEVELS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Category <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{CHANGE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Status <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{CHANGE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
            </div>
            <FormField control={form.control} name="reason" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Reason / Justification</FormLabel><FormControl><Textarea placeholder="Why is this change needed?" className="text-[13px] border-slate-200 min-h-[50px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <FormField control={form.control} name="implementationPlan" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Implementation Plan</FormLabel><FormControl><Textarea placeholder="How will this change be implemented?" className="text-[13px] border-slate-200 min-h-[50px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <FormField control={form.control} name="rollbackPlan" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Rollback Plan</FormLabel><FormControl><Textarea placeholder="How to revert if something goes wrong?" className="text-[13px] border-slate-200 min-h-[50px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          </div>
        </form></Form>
      </StandardWindow>
    </motion.div>
  );
}
