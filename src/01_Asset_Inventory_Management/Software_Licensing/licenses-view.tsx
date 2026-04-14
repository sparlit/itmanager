"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Filter,
  KeyRound,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  Trash2,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { SoftwareLicense } from "@/types";

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

// ─── Form Schema ────────────────────────────────────────────────
const licenseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  vendor: z.string().min(1, "Vendor is required"),
  licenseKey: z.string().optional(),
  licenseType: z.string().min(1, "License type is required"),
  totalSeats: z.number().int().min(1, "Must have at least 1 seat"),
  usedSeats: z.number().int().min(0).optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
  autoRenew: z.boolean().optional(),
  cost: z.union([z.number().positive(), z.literal("")]).optional(),
  status: z.string().min(1, "Status is required"),
  category: z.string().min(1, "Category is required"),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type LicenseFormValues = z.infer<typeof licenseFormSchema>;

const LICENSE_TYPES = ["Perpetual", "Subscription", "Concurrent", "Named User", "Device", "Volume"];
const LICENSE_CATEGORIES = ["Operating System", "Productivity", "Development", "Security", "Design", "Database", "Infrastructure", "Other"];
const LICENSE_STATUSES = ["Active", "Expired", "Suspended", "Pending"];

// ─── Helpers ────────────────────────────────────────────────────
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Expired: "bg-rose-50 text-rose-700 border-rose-200",
    Suspended: "bg-amber-50 text-amber-700 border-amber-200",
    Pending: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

function getSeatUtilization(used: number, total: number): { pct: number; color: string } {
  const pct = total > 0 ? (used / total) * 100 : 0;
  let color = "bg-emerald-500";
  if (pct >= 90) color = "bg-rose-500";
  else if (pct >= 70) color = "bg-amber-500";
  return { pct, color };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function LicensesView() {
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingLicense, setEditingLicense] = useState<SoftwareLicense | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { setView } = useAppStore();

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: {
      name: "",
      vendor: "",
      licenseKey: "",
      licenseType: "Perpetual",
      totalSeats: 1,
      usedSeats: 0,
      purchaseDate: "",
      expiryDate: "",
      autoRenew: false,
      cost: "",
      status: "Active",
      category: "Software",
      assignedTo: "",
      notes: "",
    },
  });

  const fetchLicenses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/licenses?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLicenses(json.licenses || []);
      }
    } catch (err) {
      console.error("Failed to fetch licenses:", err);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchLicenses();
      setLoading(false);
    }
    loadData();
  }, [fetchLicenses]);

  const onSubmit = async (values: LicenseFormValues) => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name,
        vendor: values.vendor,
        licenseKey: values.licenseKey || "",
        licenseType: values.licenseType,
        totalSeats: values.totalSeats,
        usedSeats: values.usedSeats || 0,
        status: values.status,
        category: values.category,
      };
      if (values.purchaseDate) body.purchaseDate = values.purchaseDate;
      if (values.expiryDate) body.expiryDate = values.expiryDate;
      if (values.autoRenew !== undefined) body.autoRenew = values.autoRenew;
      if (typeof values.cost === "number") body.cost = values.cost;
      if (values.assignedTo) body.assignedTo = values.assignedTo;
      if (values.notes) body.notes = values.notes;

      const url = editingLicense ? "/api/licenses/update" : "/api/licenses";
      const method = editingLicense ? "PUT" : "POST";
      if (editingLicense) body.id = editingLicense.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingLicense ? "License updated successfully" : "License created successfully");
        setDialogOpen(false);
        setEditingLicense(null);
        form.reset();
        fetchLicenses();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to save license");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this license?")) return;
    try {
      const res = await fetch("/api/licenses/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("License deleted successfully");
        fetchLicenses();
      }
    } catch {
      toast.error("Failed to delete license");
    }
  };

  const handleEdit = (license: SoftwareLicense) => {
    setEditingLicense(license);
    form.reset({
      name: license.name,
      vendor: license.vendor,
      licenseKey: license.licenseKey,
      licenseType: license.licenseType,
      totalSeats: license.totalSeats,
      usedSeats: license.usedSeats,
      purchaseDate: license.purchaseDate || "",
      expiryDate: license.expiryDate || "",
      autoRenew: license.autoRenew,
      cost: license.cost || "",
      status: license.status,
      category: license.category,
      assignedTo: license.assignedTo,
      notes: license.notes,
    });
    setDialogOpen(true);
  };

  const stats = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === "Active").length,
    expired: licenses.filter((l) => l.status === "Expired").length,
    totalCost: licenses.reduce((sum, l) => sum + (l.cost || 0), 0),
    totalSeats: licenses.reduce((sum, l) => sum + l.totalSeats, 0),
    usedSeats: licenses.reduce((sum, l) => sum + l.usedSeats, 0),
    expiringSoon: licenses.filter((l) => {
      if (!l.expiryDate) return false;
      const daysUntil = (new Date(l.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30;
    }).length,
  };

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-slate-900">Software Licenses</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Manage software licenses, seats, and renewals</p>
          </div>
          <Button
            onClick={() => {
              setEditingLicense(null);
              form.reset();
              setDialogOpen(true);
            }}
            className="gap-2 h-10 px-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-sm shadow-emerald-200"
          >
            <Plus className="h-4 w-4" />
            Add License
          </Button>
        </div>
      </motion.div>

      {/* ─── Stat Cards ──────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Licenses", value: stats.total, icon: KeyRound, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-sky-600", bg: "bg-sky-50" },
            { label: "Expiring Soon", value: stats.expiringSoon, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Seat Utilization", value: `${stats.totalSeats > 0 ? Math.round((stats.usedSeats / stats.totalSeats) * 100) : 0}%`, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-200/70 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[18px] font-bold text-slate-900">{stat.value}</p>
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
                  placeholder="Search licenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-[13px] border-slate-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-10 text-[13px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  {LICENSE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] h-10 text-[13px] border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {LICENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Licenses Table ──────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : licenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <KeyRound className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-[14px] font-medium">No licenses found</p>
                <p className="text-[12px] mt-1">Add your first software license to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200/70">
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">License</TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Vendor</TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Type</TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Seats</TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Expiry</TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Status</TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Cost</TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => {
                    const seatInfo = getSeatUtilization(license.usedSeats, license.totalSeats);
                    return (
                      <TableRow
                        key={license.id}
                        className="border-slate-100 hover:bg-slate-50/50 cursor-pointer"
                        onClick={() => setView("license-detail", license.id)}
                      >
                        <TableCell>
                          <div>
                            <p className="text-[13px] font-medium text-slate-900">{license.name}</p>
                            <p className="text-[11px] text-slate-500">{license.category}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-600">{license.vendor}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">{license.licenseType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[80px]">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-slate-600">{license.usedSeats}/{license.totalSeats}</span>
                              <span className="text-slate-400">{Math.round(seatInfo.pct)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all", seatInfo.color)} style={{ width: `${seatInfo.pct}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[12px] text-slate-600">{formatDate(license.expiryDate)}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[11px] font-medium border", getStatusColor(license.status))}>
                            {license.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-600">
                          {license.cost ? `$${license.cost.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(license); }}>
                                <Pencil className="h-3.5 w-3.5 mr-2" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-rose-600" onClick={(e) => { e.stopPropagation(); handleDelete(license.id); }}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Add/Edit Window ─────────────────────────────────────── */}
      <StandardWindow
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingLicense(null); }}
        title={editingLicense ? "Edit License" : "Add Software License"}
        description={editingLicense ? "Update license details" : "Register a new software license"}
        icon={<KeyRound className="h-4 w-4 text-white" />}
        headerGradient="from-indigo-600 to-blue-500"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => { form.reset(); setEditingLicense(null); }}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<KeyRound className="h-3.5 w-3.5" />}
        statusMessages={[
          `${licenses.length} total licenses`,
          `${licenses.filter((l) => l.status === "Active").length} active`,
          `${licenses.filter((l) => l.status === "Expired").length} expired`,
          `${licenses.reduce((s, l) => s + (l.cost || 0), 0).toLocaleString()} total cost`,
        ]}
        defaultWidth={750}
        defaultHeight={700}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">License Name <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="e.g. Microsoft Office 365" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="vendor" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Vendor <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="e.g. Microsoft" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
              <FormField control={form.control} name="licenseKey" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">License Key</FormLabel><FormControl><Input placeholder="XXXXX-XXXXX-XXXXX-XXXXX" className="h-10 rounded-lg text-[13px] font-mono border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="licenseType" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">License Type <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{LICENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Category <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{LICENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Status <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 rounded-lg text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{LICENSE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="totalSeats" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Total Seats <span className="text-rose-400">*</span></FormLabel><FormControl><Input type="number" min={1} className="h-10 rounded-lg text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="usedSeats" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Used Seats</FormLabel><FormControl><Input type="number" min={0} className="h-10 rounded-lg text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="purchaseDate" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Purchase Date</FormLabel><FormControl><Input type="date" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Expiry Date</FormLabel><FormControl><Input type="date" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Notes</FormLabel><FormControl><Textarea placeholder="Additional notes..." className="text-[13px] border-slate-200 min-h-[60px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            </div>
          </form>
        </Form>
      </StandardWindow>
    </motion.div>
  );
}
