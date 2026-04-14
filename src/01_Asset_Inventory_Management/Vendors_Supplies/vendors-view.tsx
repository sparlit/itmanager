"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Building2,
  Eye,
  SlidersHorizontal,
  X,
  Inbox,
  Trash2,
  Tag,
  Globe,
  MapPin,
  Star,
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
import { ComboboxInput } from "@/components/ui/combobox-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAppStore } from "@/store/app-store";
import type { Vendor } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Color Maps ─────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  Active: "bg-emerald-500",
  Inactive: "bg-slate-400",
};

const CATEGORY_COLORS: Record<string, string> = {
  Hardware: "bg-sky-50 text-sky-700 border-sky-200",
  Software: "bg-violet-50 text-violet-700 border-violet-200",
  Services: "bg-amber-50 text-amber-700 border-amber-200",
  Network: "bg-teal-50 text-teal-700 border-teal-200",
  Security: "bg-rose-50 text-rose-700 border-rose-200",
  General: "bg-slate-50 text-slate-600 border-slate-200",
  Cloud: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Telecom: "bg-orange-50 text-orange-700 border-orange-200",
};

// ─── Constants ──────────────────────────────────────────────────
const STATUSES = ["All", "Active", "Inactive"];
const CATEGORIES = [
  "All",
  "Hardware",
  "Software",
  "Services",
  "Network",
  "Security",
  "General",
  "Cloud",
  "Telecom",
];

// ─── Form Schema ────────────────────────────────────────────────
const vendorFormSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  contractStart: z.string().optional(),
  contractEnd: z.string().optional(),
  rating: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

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

// ─── Star Rating Component ─────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          )}
        />
      ))}
    </div>
  );
}

// ─── Contract Status Badge ─────────────────────────────────────
function ContractBadge({ start, end }: { start: string | null; end: string | null }) {
  if (!start || !end) {
    return (
      <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
        No contract
      </span>
    );
  }

  const now = new Date();
  const endDate = new Date(end);
  const startDate = new Date(start);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (now < startDate) {
    return (
      <span className="text-[11px] text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md font-medium">
        Starts {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
    );
  }

  if (daysUntilExpiry < 0) {
    return (
      <span className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-medium">
        Expired
      </span>
    );
  }

  if (daysUntilExpiry <= 90) {
    return (
      <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
        Expiring in {daysUntilExpiry}d
      </span>
    );
  }

  return (
    <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
      Active
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function VendorsView() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { setView } = useAppStore();

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      contractStart: "",
      contractEnd: "",
      rating: "",
      category: "General",
      status: "Active",
      notes: "",
    },
  });

  const fetchVendors = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        let filtered = json.vendors || [];

        // Client-side filtering for status and category
        if (statusFilter !== "All") {
          filtered = filtered.filter((v: Vendor) => v.status === statusFilter);
        }
        if (categoryFilter !== "All") {
          filtered = filtered.filter((v: Vendor) => v.category === categoryFilter);
        }

        setVendors(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchVendors();
      setLoading(false);
    }
    loadData();
  }, [fetchVendors]);

  async function onSubmit(values: VendorFormValues) {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name,
        contactPerson: values.contactPerson || "",
        email: values.email || "",
        phone: values.phone || "",
        website: values.website || "",
        address: values.address || "",
        contractStart: values.contractStart || null,
        contractEnd: values.contractEnd || null,
        rating: values.rating ? parseFloat(values.rating) : 0,
        category: values.category,
        status: values.status,
        notes: values.notes || "",
      };

      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Vendor created successfully");
        setDialogOpen(false);
        form.reset();
        await fetchVendors();
      }
    } catch (err) {
      toast.error("Failed to create vendor");
      console.error("Failed to create vendor:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      const res = await fetch(`/api/vendors/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Vendor deleted successfully");
        await fetchVendors();
      }
    } catch (err) {
      toast.error("Failed to delete vendor");
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

  const totalVendors = vendors.length;
  const activeCount = vendors.filter((v) => v.status === "Active").length;
  const inactiveCount = vendors.filter((v) => v.status === "Inactive").length;
  const avgRating = totalVendors > 0
    ? (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / totalVendors).toFixed(1)
    : "0.0";

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
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
            Vendor Management
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Track and manage all vendors and service providers
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-600/20"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </motion.div>

      {/* ─── Stats Mini-Bar ────────────────────────────────────── */}
      <motion.div
        className="flex flex-wrap gap-3"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {[
          { label: "Total", count: totalVendors, dot: "bg-slate-400" },
          { label: "Active", count: activeCount, dot: "bg-emerald-500" },
          { label: "Inactive", count: inactiveCount, dot: "bg-slate-300" },
          { label: "Avg Rating", count: `${avgRating} ★`, dot: "bg-amber-400" },
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
                <SelectTrigger className="w-[155px] h-9 rounded-lg text-[13px] border-slate-200">
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
                  placeholder="Search vendors..."
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
                {vendors.length} result{vendors.length !== 1 ? "s" : ""}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Vendor Cards Grid ─────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {vendors.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mb-4">
              <Inbox className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-[14px] font-medium text-slate-600">
              No vendors found
            </p>
            <p className="text-[12px] mt-0.5 text-slate-400">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Add your first vendor to get started"}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-3 text-[12px] rounded-lg"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          vendors.map((vendor) => (
            <motion.div
              key={vendor.id}
              variants={itemVariants}
              viewport={{ once: true }}
            >
              <Card
                className="rounded-xl border-slate-200/60 bg-white cursor-pointer hover:shadow-md hover:border-emerald-200/60 transition-all duration-200 group h-full"
                onClick={() => setView("vendor-detail", vendor.id)}
              >
                <CardContent className="p-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {vendor.name}
                        </h3>
                        {vendor.contactPerson && (
                          <p className="text-[12px] text-slate-500 truncate mt-0.5">
                            {vendor.contactPerson}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        onClick={(e) => handleDelete(vendor.id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] rounded-lg border font-medium",
                        STATUS_COLORS[vendor.status] || ""
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", STATUS_DOT_COLORS[vendor.status])} />
                      {vendor.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] rounded-lg border font-medium",
                        CATEGORY_COLORS[vendor.category] || ""
                      )}
                    >
                      {vendor.category}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 mb-3">
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-[12px] text-slate-500">
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-[12px] text-slate-500">
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Rating + Contract */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <StarRating rating={vendor.rating} />
                    <ContractBadge start={vendor.contractStart} end={vendor.contractEnd} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ─── Add Vendor Window ──────────────────────────────────── */}
      <StandardWindow
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add New Vendor"
        description="Fill in the details below to register a new vendor."
        icon={<Building2 className="h-4 w-4 text-white" />}
        headerGradient="from-amber-600 to-orange-500"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => form.reset()}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<Building2 className="h-3.5 w-3.5" />}
        statusMessages={[
          `${vendors.length} total vendors`,
          `${vendors.filter((v) => v.status === "Active").length} active`,
          `${vendors.filter((v) => v.category).length} categories`,
        ]}
        defaultWidth={800}
        defaultHeight={700}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Building2 className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Vendor Information</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="mb-4"><FormLabel className="text-[13px] font-medium text-slate-700">Vendor Name <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="Company name" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="contactPerson" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Contact Person</FormLabel><FormControl><Input placeholder="Primary contact" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700"><Globe className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Contact Details</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Email</FormLabel><FormControl><Input type="email" placeholder="vendor@company.com" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Phone</FormLabel><FormControl><Input placeholder="+1 (555) 000-0000" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="website" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Website</FormLabel><FormControl><Input placeholder="https://vendor.com" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Address</FormLabel><FormControl><Input placeholder="Full address" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Tag className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Classification</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Category <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select category..." className="h-10 text-[13px]" options={[{ value: "Hardware", label: "Hardware" }, { value: "Software", label: "Software" }, { value: "Services", label: "Services" }, { value: "Network", label: "Network" }, { value: "Security", label: "Security" }, { value: "General", label: "General" }, { value: "Cloud", label: "Cloud" }, { value: "Telecom", label: "Telecom" }]} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Status <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select status..." className="h-10 text-[13px]" options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Under Review", label: "Under Review" }]} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Rating</FormLabel><FormControl><Input type="number" min={0} max={5} step="0.1" placeholder="0-5" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><MapPin className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Contract & Notes</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="contractStart" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Contract Start</FormLabel><FormControl><Input type="date" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="contractEnd" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Contract End</FormLabel><FormControl><Input type="date" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (<FormItem className="mt-4"><FormLabel className="text-[13px] font-medium text-slate-700">Notes</FormLabel><FormControl><Textarea placeholder="Notes about this vendor..." rows={3} className="rounded-lg text-[13px] border-slate-200 resize-none" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
            </div>
          </form>
        </Form>
      </StandardWindow>
    </motion.div>
  );
}
