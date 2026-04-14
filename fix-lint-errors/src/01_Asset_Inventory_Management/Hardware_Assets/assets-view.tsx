"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Monitor,
  Eye,
  SlidersHorizontal,
  X,
  Inbox,
  Trash2,
  Tag,
  DollarSign,
  MapPin,
  Download,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Asset } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Color Maps ─────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Use": "bg-sky-50 text-sky-700 border-sky-200",
  "Under Maintenance": "bg-amber-50 text-amber-700 border-amber-200",
  Retired: "bg-slate-100 text-slate-600 border-slate-200",
};

const CONDITION_COLORS: Record<string, string> = {
  Excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Good: "bg-sky-50 text-sky-700 border-sky-200",
  Fair: "bg-amber-50 text-amber-700 border-amber-200",
  Poor: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  Available: "bg-emerald-500",
  "In Use": "bg-sky-500",
  "Under Maintenance": "bg-amber-500",
  Retired: "bg-slate-400",
};

// ─── Constants ──────────────────────────────────────────────────
const STATUSES = ["All", "Available", "In Use", "Under Maintenance", "Retired"];
const CATEGORIES = [
  "All",
  "Laptop",
  "Desktop",
  "Monitor",
  "Network",
  "Software",
  "Peripheral",
  "Infrastructure",
];

// ─── Form Schema ────────────────────────────────────────────────
const assetFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  serialNumber: z.string().min(1, "Serial number is required"),
  category: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  condition: z.string().min(1, "Condition is required"),
  purchaseDate: z.string().optional(),
  purchaseCost: z.string().optional(),
  warrantyEnd: z.string().optional(),
  vendor: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

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
export function AssetsView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(-1);

  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { setView } = useAppStore();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      category: "Laptop",
      status: "Available",
      condition: "Good",
      purchaseDate: "",
      purchaseCost: "",
      warrantyEnd: "",
      vendor: "",
      location: "",
      notes: "",
    },
  });

  const fetchAssets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/assets?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAssets(json.assets || []);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchAssets();
      setLoading(false);
    }
    loadData();
  }, [fetchAssets]);

  async function onSubmit(values: AssetFormValues) {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name,
        serialNumber: values.serialNumber,
        category: values.category,
        status: values.status,
        condition: values.condition,
      };
      if (values.purchaseDate) body.purchaseDate = values.purchaseDate;
      if (values.purchaseCost && values.purchaseCost !== "")
        body.purchaseCost = parseFloat(values.purchaseCost);
      if (values.warrantyEnd) body.warrantyEnd = values.warrantyEnd;
      if (values.vendor) body.vendor = values.vendor;
      if (values.location) body.location = values.location;
      if (values.notes) body.notes = values.notes;

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Asset created successfully");
        setDialogOpen(false);
        form.reset();
        await fetchAssets();
      }
    } catch (err) {
      toast.error("Failed to create asset");
      console.error("Failed to create asset:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetch(`/api/assets/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Asset deleted successfully");
        await fetchAssets();
      }
    } catch (err) {
      toast.error("Failed to delete asset");
    }
  }

  function navigateAssetRecord(direction: "next" | "prev" | "first" | "last") {
    if (assets.length === 0) return;
    let idx = currentRecordIndex;
    if (direction === "first") idx = 0;
    else if (direction === "last") idx = assets.length - 1;
    else if (direction === "next") idx = Math.min(assets.length - 1, currentRecordIndex + 1);
    else if (direction === "prev") idx = Math.max(0, currentRecordIndex - 1);
    if (idx >= 0 && idx < assets.length) {
      const asset = assets[idx];
      setCurrentRecordIndex(idx);
      form.reset({ name: asset.name, serialNumber: asset.serialNumber, category: asset.category, status: asset.status, condition: asset.condition, purchaseDate: asset.purchaseDate || "", purchaseCost: asset.purchaseCost ? String(asset.purchaseCost) : "", warrantyEnd: asset.warrantyEnd || "", vendor: asset.vendor || "", location: asset.location || "", notes: asset.notes || "" });
    }
  }

  async function handleExport() {
    try {
      const res = await fetch("/api/export?type=assets");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const disposition = res.headers.get("Content-Disposition");
        const filename = disposition
          ? disposition.split("filename=")[1]?.replace(/"/g, "")
          : "assets-export.csv";
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
    setCategoryFilter("All");
    setSearchQuery("");
  }

  const hasActiveFilters =
    statusFilter !== "All" ||
    categoryFilter !== "All" ||
    searchQuery !== "";

  const totalAssets = assets.length;
  const inUseCount = assets.filter((a) => a.status === "In Use").length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const maintenanceCount = assets.filter(
    (a) => a.status === "Under Maintenance"
  ).length;

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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-40 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-slate-200/60">
          <CardContent className="p-0">
            {Array.from({ length: 6 }).map((_, i) => (
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
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
            Asset Management
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Track and manage all IT assets and equipment
          </p>
        </div>
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
            Add Asset
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
          { label: "Total", count: totalAssets, dot: "bg-slate-400" },
          { label: "In Use", count: inUseCount, dot: "bg-sky-500" },
          { label: "Available", count: availableCount, dot: "bg-emerald-500" },
          { label: "Maintenance", count: maintenanceCount, dot: "bg-amber-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3.5 py-2"
          >
            <span className={cn("h-2 w-2 rounded-full", stat.dot)} />
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
                <SelectTrigger className="w-[165px] h-9 rounded-lg text-[13px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
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
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search assets..."
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
                {assets.length} result{assets.length !== 1 ? "s" : ""}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Assets Table ─────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pl-5 text-[12px] font-medium text-slate-500">
                      Name
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Serial #
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Category
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium text-slate-500">
                      Condition
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 hidden md:table-cell text-[12px] font-medium text-slate-500">
                      Location
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 hidden lg:table-cell text-[12px] font-medium text-slate-500">
                      Cost
                    </TableHead>
                    <TableHead className="border border-slate-200/60 bg-slate-50/80 pr-5 text-[12px] font-medium text-slate-500 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-52 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                            <Inbox className="h-8 w-8 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-slate-600">
                              No assets found
                            </p>
                            <p className="text-[12px] mt-0.5">
                              {hasActiveFilters
                                ? "Try adjusting your filters"
                                : "Add your first asset to get started"}
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
                    assets.map((asset, index) => (
                      <TableRow
                        key={asset.id}
                        className={cn(
                          "cursor-pointer transition-colors border-slate-100 hover:bg-slate-50/80",
                          index % 2 === 1 && "bg-slate-50/40"
                        )}
                        onClick={() => setView("asset-detail", asset.id)}
                      >
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                              <Monitor className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="text-[13px] font-medium text-slate-900 truncate max-w-[180px]">
                              {asset.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-slate-400">
                          {asset.serialNumber}
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-500">
                          {asset.category}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] rounded-lg border font-medium",
                              STATUS_COLORS[asset.status] || ""
                            )}
                          >
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] rounded-lg border font-medium",
                              CONDITION_COLORS[asset.condition] || ""
                            )}
                          >
                            {asset.condition}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-[13px] text-slate-500">
                          {asset.location || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-[13px] font-medium text-slate-900">
                          {asset.purchaseCost != null
                            ? `$${asset.purchaseCost.toLocaleString()}`
                            : "—"}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-[12px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                setView("asset-detail", asset.id);
                              }}
                            >
                              View
                              <Eye className="ml-1 h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(asset.id);
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

      {/* ─── Add Asset Window ──────────────────────────────────── */}
      <StandardWindow
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Register New Asset"
        description="Fill in the details below to register a new IT asset."
        icon={<Monitor className="h-4 w-4 text-white" />}
        headerGradient="from-violet-600 to-purple-500"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => form.reset()}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<Monitor className="h-3.5 w-3.5" />}
        statusMessages={[
          `${assets.length} total assets`,
          `${assets.filter((a) => a.status === "Available").length} available`,
          `${assets.filter((a) => a.status === "In Use").length} in use`,
          `$${assets.reduce((s, a) => s + (a.purchaseCost || 0), 0).toLocaleString()} total value`,
        ]}
        defaultWidth={800}
        defaultHeight={700}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Asset Identification */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Monitor className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Asset Identification</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="mb-4"><FormLabel className="text-[13px] font-medium text-slate-700">Asset Name <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder='e.g. MacBook Pro 16"' className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Serial Number <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="SN-XXXXX" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>

              {/* Classification */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Tag className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Classification</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Category <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select category..." className="h-10 text-[13px]" options={[{ value: "Laptop", label: "💻 Laptop" }, { value: "Desktop", label: "🖥️ Desktop" }, { value: "Monitor", label: "🖥️ Monitor" }, { value: "Network", label: "🌐 Network" }, { value: "Software", label: "💿 Software" }, { value: "Peripheral", label: "🖱️ Peripheral" }, { value: "Infrastructure", label: "🏗️ Infrastructure" }]} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Status <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select status..." className="h-10 text-[13px]" options={[{ value: "Available", label: "🟢 Available" }, { value: "In Use", label: "🔵 In Use" }, { value: "Under Maintenance", label: "🟡 Under Maintenance" }, { value: "Retired", label: "⚫ Retired" }]} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="condition" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Condition <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select condition..." className="h-10 text-[13px]" options={[{ value: "Excellent", label: "⭐ Excellent" }, { value: "Good", label: "✅ Good" }, { value: "Fair", label: "⚠️ Fair" }, { value: "Poor", label: "❌ Poor" }]} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
              </div>

              <Separator />

              {/* Purchase Information */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700"><DollarSign className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Purchase Information</h3>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">optional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <FormField control={form.control} name="purchaseDate" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Purchase Date</FormLabel><FormControl><Input type="date" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="purchaseCost" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Purchase Cost</FormLabel><FormControl><Input type="number" min={0} step="0.01" placeholder="0.00" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="warrantyEnd" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Warranty End</FormLabel><FormControl><Input type="date" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="vendor" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Vendor</FormLabel><FormControl><Input placeholder="Vendor name" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
              </div>

              <Separator />

              {/* Location & Notes */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><MapPin className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Location & Notes</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Location</FormLabel><FormControl><Input placeholder="Building, Room, etc." className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Notes</FormLabel><FormControl><Textarea placeholder="Additional notes..." className="text-[13px] border-slate-200 min-h-[40px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </StandardWindow>
    </motion.div>
  );
}
