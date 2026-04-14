"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Star,
  User,
  Tag,
  StickyNote,
  Pencil,
  Trash2,
  ShieldCheck,
  AlertTriangle,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComboboxInput } from "@/components/ui/combobox-input";
import { useAppStore } from "@/store/app-store";
import type { Vendor } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Color Maps ─────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
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
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
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
      <span className="text-[13px] font-semibold text-slate-700 ml-2">{rating}.0</span>
    </div>
  );
}

function getContractStatus(start: string | null, end: string | null) {
  if (!start || !end) return { status: "none", label: "No Contract", color: "bg-slate-100 text-slate-600 border-slate-200" };

  const now = new Date();
  const endDate = new Date(end);
  const startDate = new Date(start);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (now < startDate) {
    return { status: "upcoming", label: `Starts ${format(startDate, "MMM dd, yyyy")}`, color: "bg-sky-50 text-sky-700 border-sky-200" };
  }
  if (daysUntilExpiry < 0) {
    return { status: "expired", label: `Expired ${format(endDate, "MMM dd, yyyy")}`, color: "bg-rose-50 text-rose-700 border-rose-200" };
  }
  if (daysUntilExpiry <= 90) {
    return { status: "expiring", label: `Expiring in ${daysUntilExpiry} days`, color: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  return { status: "active", label: `Active until ${format(endDate, "MMM dd, yyyy")}`, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function VendorDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    contractStart: "",
    contractEnd: "",
    rating: 0,
    category: "",
    status: "",
    notes: "",
  });

  const fetchVendor = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch("/api/vendors");
      if (res.ok) {
        const json = await res.json();
        const found = (json.vendors || []).find(
          (v: Vendor) => v.id === selectedItemId
        );
        setVendor(found || null);
      }
    } catch (err) {
      console.error("Failed to fetch vendor:", err);
    }
  }, [selectedItemId]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchVendor();
      setLoading(false);
    }
    loadData();
  }, [fetchVendor]);

  function openEditDialog() {
    if (!vendor) return;
    setEditForm({
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      website: vendor.website,
      address: vendor.address,
      contractStart: vendor.contractStart ? format(new Date(vendor.contractStart), "yyyy-MM-dd") : "",
      contractEnd: vendor.contractEnd ? format(new Date(vendor.contractEnd), "yyyy-MM-dd") : "",
      rating: vendor.rating,
      category: vendor.category,
      status: vendor.status,
      notes: vendor.notes,
    });
    setEditDialogOpen(true);
  }

  async function handleSave() {
    if (!vendor) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vendors/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vendor.id, ...editForm }),
      });
      if (res.ok) {
        toast.success("Vendor updated successfully");
        setEditDialogOpen(false);
        await fetchVendor();
      }
    } catch (err) {
      toast.error("Failed to update vendor");
      console.error("Failed to update vendor:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!vendor) return;
    if (!confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/vendors/delete?id=${vendor.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Vendor deleted successfully");
        setView("vendors");
      }
    } catch (err) {
      toast.error("Failed to delete vendor");
      console.error("Failed to delete vendor:", err);
    } finally {
      setDeleting(false);
    }
  }

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-28 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="w-full lg:w-[380px] space-y-5">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
          <Building2 className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-[13px] text-slate-500">Vendor not found.</p>
        <Button
          variant="outline"
          onClick={() => setView("vendors")}
          className="rounded-lg text-[13px] border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
      </div>
    );
  }

  const contractInfo = getContractStatus(vendor.contractStart, vendor.contractEnd);

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
          onClick={() => setView("vendors")}
          className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Vendors</span>
        </button>
      </motion.div>

      {/* ─── Header ───────────────────────────────────────────── */}
      <motion.div
        className="space-y-3"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
              {vendor.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] rounded-lg border font-medium",
                  STATUS_COLORS[vendor.status] || ""
                )}
              >
                {vendor.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] rounded-lg border font-medium",
                  CATEGORY_COLORS[vendor.category] || ""
                )}
              >
                {vendor.category}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] rounded-lg border font-medium",
                  contractInfo.color
                )}
              >
                {contractInfo.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-lg text-[13px] border-slate-200 h-9 px-4"
              onClick={openEditDialog}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="rounded-lg text-[13px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-9 px-4"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ─── Rating Bar ───────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-center gap-6 rounded-xl border border-slate-200/60 bg-white px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Vendor Rating</p>
              <StarRating rating={vendor.rating} />
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-slate-100" />
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Contract Status</p>
            <p className="text-[13px] font-medium text-slate-700 mt-0.5">
              {vendor.contractStart && vendor.contractEnd
                ? `${format(new Date(vendor.contractStart), "MMM dd, yyyy")} — ${format(new Date(vendor.contractEnd), "MMM dd, yyyy")}`
                : "No contract dates set"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Two Column Layout ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left Column */}
        <div className="flex-1 space-y-5 min-w-0">
          {/* Contact Information Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: User,
                      label: "Contact Person",
                      value: vendor.contactPerson || "Not specified",
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value: vendor.email || "Not specified",
                      href: vendor.email ? `mailto:${vendor.email}` : undefined,
                    },
                    {
                      icon: Phone,
                      label: "Phone",
                      value: vendor.phone || "Not specified",
                      href: vendor.phone ? `tel:${vendor.phone}` : undefined,
                    },
                    {
                      icon: Globe,
                      label: "Website",
                      value: vendor.website || "Not specified",
                      href: vendor.website ? (vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`) : undefined,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 group/item"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 group-hover/item:bg-emerald-50 transition-colors mt-0.5">
                        <item.icon className="h-4 w-4 text-slate-400 group-hover/item:text-emerald-600 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-[13px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline mt-0.5 block truncate"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className={cn("text-[13px] font-medium text-slate-900 mt-0.5", !vendor.contactPerson && item.label === "Contact Person" && "text-slate-400")}>
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contract Details Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Calendar,
                      label: "Contract Start",
                      value: vendor.contractStart
                        ? format(new Date(vendor.contractStart), "MMM dd, yyyy")
                        : "Not specified",
                    },
                    {
                      icon: Calendar,
                      label: "Contract End",
                      value: vendor.contractEnd
                        ? format(new Date(vendor.contractEnd), "MMM dd, yyyy")
                        : "Not specified",
                    },
                    {
                      icon: Tag,
                      label: "Category",
                      value: vendor.category,
                    },
                    {
                      icon: Building2,
                      label: "Status",
                      value: vendor.status,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 group/item"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 group-hover/item:bg-emerald-50 transition-colors mt-0.5">
                        <item.icon className="h-4 w-4 text-slate-400 group-hover/item:text-emerald-600 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className="text-[13px] font-medium text-slate-900 mt-0.5">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {contractInfo.status === "expiring" && (
                  <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-[13px] text-amber-700 font-medium">
                        {contractInfo.label}
                      </p>
                    </div>
                    <p className="text-[12px] text-amber-600 mt-1">
                      Consider reviewing and renewing the contract before it expires.
                    </p>
                  </div>
                )}

                {contractInfo.status === "expired" && (
                  <div className="mt-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      <p className="text-[13px] text-rose-700 font-medium">
                        Contract has expired
                      </p>
                    </div>
                    <p className="text-[12px] text-rose-600 mt-1">
                      This vendor&apos;s contract expired on {vendor.contractEnd ? format(new Date(vendor.contractEnd), "MMM dd, yyyy") : "unknown date"}.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes Card */}
          {vendor.notes && (
            <motion.div variants={itemVariants} viewport={{ once: true }}>
              <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-slate-500" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {vendor.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[380px] space-y-5">
          {/* Quick Info Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Quick Info
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Vendor summary at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[12px] text-slate-500 font-medium">Rating</span>
                  <StarRating rating={vendor.rating} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[12px] text-slate-500 font-medium">Status</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] rounded-lg border font-medium",
                      STATUS_COLORS[vendor.status] || ""
                    )}
                  >
                    {vendor.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[12px] text-slate-500 font-medium">Category</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] rounded-lg border font-medium",
                      CATEGORY_COLORS[vendor.category] || ""
                    )}
                  >
                    {vendor.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[12px] text-slate-500 font-medium">Contract</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] rounded-lg border font-medium",
                      contractInfo.color
                    )}
                  >
                    {contractInfo.status === "none" ? "None" : contractInfo.status === "active" ? "Active" : contractInfo.status === "expiring" ? "Expiring" : contractInfo.status === "expired" ? "Expired" : "Upcoming"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Address Card */}
          {vendor.address && (
            <motion.div variants={itemVariants} viewport={{ once: true }}>
              <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      {vendor.address}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Timestamps Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Record Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500 font-medium">Created</span>
                  <span className="text-slate-700">
                    {format(new Date(vendor.createdAt), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500 font-medium">Last Updated</span>
                  <span className="text-slate-700">
                    {format(new Date(vendor.updatedAt), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-rose-200/60 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-rose-700">
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-[12px] text-rose-500">
                  Irreversible actions for this vendor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full rounded-lg text-[13px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Deleting...
                    </span>
                  ) : (
                    <>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete this vendor
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ─── Edit Dialog ──────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[780px] rounded-2xl border-slate-200/60 p-0 gap-0 overflow-hidden max-h-[90vh]">
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-slate-600 via-emerald-600 to-teal-500 px-7 py-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-50" />
            <DialogHeader className="relative">
              <DialogTitle className="text-[18px] font-semibold text-white flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                Edit Vendor
              </DialogTitle>
              <DialogDescription className="text-[13px] text-white/80 mt-1">
                Update the vendor information below.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[calc(85vh-180px)]">
            <div className="px-7 py-6 space-y-6">

              {/* ═══ Section 1: Vendor Information ═══ */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Vendor Information</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Vendor Name <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                      placeholder="Vendor name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-medium text-slate-700">Contact Person</label>
                      <Input
                        value={editForm.contactPerson}
                        onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                        className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-slate-700">Email</label>
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                        placeholder="contact@vendor.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-medium text-slate-700">Phone</label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-slate-700">Website</label>
                      <Input
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                        placeholder="https://www.vendor.com"
                      />
                    </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <div className="mt-1">
                      <ComboboxInput
                        value={editForm.category}
                        onChange={(val) => setEditForm({ ...editForm, category: val })}
                        placeholder="Select category..."
                        emptyMessage="Type a custom category."
                        className="h-11 text-[14px]"
                        options={[
                          { value: "Hardware", label: "🖥️ Hardware" },
                          { value: "Software", label: "💿 Software" },
                          { value: "Services", label: "🔧 Services" },
                          { value: "Network", label: "🌐 Network" },
                          { value: "Security", label: "🔒 Security" },
                          { value: "Cloud", label: "☁️ Cloud" },
                          { value: "Telecom", label: "📞 Telecom" },
                          { value: "General", label: "📦 General" },
                        ]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">
                      Status <span className="text-rose-400">*</span>
                    </label>
                    <div className="mt-1">
                      <ComboboxInput
                        value={editForm.status}
                        onChange={(val) => setEditForm({ ...editForm, status: val })}
                        placeholder="Select status..."
                        emptyMessage="Type a custom status."
                        className="h-11 text-[14px]"
                        options={[
                          { value: "Active", label: "🟢 Active" },
                          { value: "Inactive", label: "⚫ Inactive" },
                        ]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">Rating (0-5)</label>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="1"
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) || 0 })}
                        className="h-11 rounded-lg text-[14px] border-slate-200 bg-white pr-10"
                      />
                      <Star className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ Section 3: Contract & Address ═══ */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Contract & Address</h3>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    optional
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">Contract Start</label>
                    <Input
                      type="date"
                      value={editForm.contractStart}
                      onChange={(e) => setEditForm({ ...editForm, contractStart: e.target.value })}
                      className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">Contract End</label>
                    <Input
                      type="date"
                      value={editForm.contractEnd}
                      onChange={(e) => setEditForm({ ...editForm, contractEnd: e.target.value })}
                      className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700">Address</label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="h-11 rounded-lg text-[14px] border-slate-200 bg-white mt-1"
                    placeholder="123 Business St, City, State"
                  />
                </div>
              </div>

              {/* ═══ Section 4: Notes ═══ */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <StickyNote className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Additional Notes</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="rounded-lg text-[14px] border-slate-200 resize-none bg-white leading-relaxed"
                  placeholder="Notes about this vendor..."
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="rounded-lg text-[13px] border-slate-200 h-10 px-5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-600/20 h-10 px-6 text-[13px] font-medium"
                onClick={handleSave}
                disabled={saving || !editForm.name.trim()}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Pencil className="mr-1.5 h-4 w-4" />
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
