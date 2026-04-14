"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Monitor,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Wrench,
  UserPlus,
  Undo2,
  Shield,
  Tag,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { Input } from "@/components/ui/input";
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
import { useAppStore } from "@/store/app-store";
import type { Asset, Staff } from "@/types";
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

const MAINTENANCE_TYPE_COLORS: Record<string, string> = {
  Preventive: "bg-sky-50 text-sky-700 border-sky-200",
  Corrective: "bg-rose-50 text-rose-700 border-rose-200",
  Upgrade: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inspection: "bg-amber-50 text-amber-700 border-amber-200",
};

const MAINTENANCE_TYPES = ["Preventive", "Corrective", "Upgrade", "Inspection"];

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
export function AssetDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [returning, setReturning] = useState(false);
  const [addingMaintenance, setAddingMaintenance] = useState(false);

  // Assign form state
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  // Maintenance form state
  const [maintType, setMaintType] = useState("Preventive");
  const [maintDescription, setMaintDescription] = useState("");
  const [maintPerformedBy, setMaintPerformedBy] = useState("");
  const [maintCost, setMaintCost] = useState("");

  const fetchAsset = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const json = await res.json();
        const found = (json.assets || []).find(
          (a: Asset) => a.id === selectedItemId
        );
        setAsset(found || null);
      }
    } catch (err) {
      console.error("Failed to fetch asset:", err);
    }
  }, [selectedItemId]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff?status=Active");
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
      await Promise.all([fetchAsset(), fetchStaff()]);
      setLoading(false);
    }
    loadData();
  }, [fetchAsset, fetchStaff]);

  async function handleAssign() {
    if (!selectedItemId || !selectedStaffId) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/assets/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedItemId,
          staffId: selectedStaffId,
          notes: assignNotes || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Asset assigned successfully");
        setSelectedStaffId("");
        setAssignNotes("");
        await fetchAsset();
      }
    } catch (err) {
      toast.error("Failed to assign asset");
      console.error("Failed to assign asset:", err);
    } finally {
      setAssigning(false);
    }
  }

  async function handleReturn() {
    const currentAssignment = asset?.assignments?.find(
      (a) => !a.returnedAt
    );
    if (!currentAssignment) return;
    setReturning(true);
    try {
      const res = await fetch(`/api/assets/assign?assignmentId=${currentAssignment.id}`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("Asset returned successfully");
        await fetchAsset();
      }
    } catch (err) {
      toast.error("Failed to return asset");
      console.error("Failed to return asset:", err);
    } finally {
      setReturning(false);
    }
  }

  async function handleAddMaintenance() {
    if (!selectedItemId || !maintDescription.trim()) return;
    setAddingMaintenance(true);
    try {
      const body: Record<string, unknown> = {
        assetId: selectedItemId,
        type: maintType,
        description: maintDescription,
        performedBy: maintPerformedBy || "IT Staff",
      };
      if (maintCost && Number(maintCost) > 0) {
        body.cost = Number(maintCost);
      }

      const res = await fetch("/api/assets/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Maintenance record added");
        setMaintType("Preventive");
        setMaintDescription("");
        setMaintPerformedBy("");
        setMaintCost("");
        await fetchAsset();
      }
    } catch (err) {
      toast.error("Failed to add maintenance record");
      console.error("Failed to add maintenance record:", err);
    } finally {
      setAddingMaintenance(false);
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
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <div className="w-full lg:w-[340px] space-y-5">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
          <Monitor className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-[13px] text-slate-500">Asset not found.</p>
        <Button
          variant="outline"
          onClick={() => setView("assets")}
          className="rounded-lg text-[13px] border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Button>
      </div>
    );
  }

  const currentAssignment = asset.assignments?.find((a) => !a.returnedAt);
  const pastAssignments =
    asset.assignments?.filter((a) => a.returnedAt) || [];
  const maintenanceRecords = asset.maintenance || [];

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
          onClick={() => setView("assets")}
          className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Assets</span>
        </button>
      </motion.div>

      {/* ─── Header ───────────────────────────────────────────── */}
      <motion.div
        className="space-y-3"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
          {asset.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] rounded-lg border font-medium",
              STATUS_COLORS[asset.status] || ""
            )}
          >
            {asset.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] rounded-lg border font-medium",
              CONDITION_COLORS[asset.condition] || ""
            )}
          >
            {asset.condition}
          </Badge>
          <span className="text-[12px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-md">
            {asset.serialNumber}
          </span>
          <Badge
            variant="outline"
            className="text-[11px] rounded-lg border font-medium bg-slate-50 text-slate-600 border-slate-200"
          >
            {asset.category}
          </Badge>
        </div>
      </motion.div>

      {/* ─── Two Column Layout ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left Column */}
        <div className="flex-1 space-y-5 min-w-0">
          {/* Details Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Tag,
                      label: "Category",
                      value: asset.category,
                    },
                    {
                      icon: MapPin,
                      label: "Location",
                      value: asset.location || "Not specified",
                    },
                    {
                      icon: Calendar,
                      label: "Purchase Date",
                      value: asset.purchaseDate
                        ? format(new Date(asset.purchaseDate), "MMM dd, yyyy")
                        : "Not specified",
                    },
                    {
                      icon: DollarSign,
                      label: "Purchase Cost",
                      value:
                        asset.purchaseCost != null
                          ? `$${asset.purchaseCost.toLocaleString()}`
                          : "Not specified",
                    },
                    {
                      icon: Shield,
                      label: "Warranty End",
                      value: asset.warrantyEnd
                        ? format(new Date(asset.warrantyEnd), "MMM dd, yyyy")
                        : "Not specified",
                    },
                    {
                      icon: Building2,
                      label: "Vendor",
                      value: asset.vendor || "Not specified",
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
                {asset.notes && (
                  <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                      Notes
                    </p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      {asset.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Depreciation Calculator Card */}
          {asset.purchaseCost != null && asset.purchaseDate && (
            <motion.div variants={itemVariants} viewport={{ once: true }}>
              <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <TrendingDown className="h-3.5 w-3.5" />
                    </div>
                    Asset Depreciation
                  </CardTitle>
                  <CardDescription className="text-[12px] text-slate-500">
                    Straight-line method · {(() => {
                      const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
                      const yearsElapsed = Math.max(0, (Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                      const usefulLife = 5;
                      return `${Math.min(yearsElapsed, usefulLife).toFixed(1)} of ${usefulLife} years`;
                    })()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const purchaseCost = asset.purchaseCost ?? 0;
                    const salvageValue = 0;
                    const usefulLife = 5;
                    const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
                    const yearsElapsed = Math.max(0, (Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    const annualDep = (purchaseCost - salvageValue) / usefulLife;
                    const monthlyDep = annualDep / 12;
                    const totalDepreciated = Math.min(annualDep * yearsElapsed, purchaseCost - salvageValue);
                    const currentValue = Math.max(purchaseCost - totalDepreciated, salvageValue);
                    const pctRemaining = purchaseCost > 0 ? (currentValue / purchaseCost) * 100 : 100;
                    const pctDepreciated = 100 - pctRemaining;

                    const colorMap: Record<string, { bg: string; border: string; text: string; bold: string; bar: string }> = {
                      emerald: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", bold: "text-emerald-700", bar: "bg-gradient-to-r from-emerald-500 to-emerald-400" },
                      amber: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", bold: "text-amber-700", bar: "bg-gradient-to-r from-amber-500 to-amber-400" },
                      rose: { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-600", bold: "text-rose-700", bar: "bg-gradient-to-r from-rose-500 to-rose-400" },
                    };
                    const depColor = pctRemaining > 66 ? "emerald" : pctRemaining > 33 ? "amber" : "rose";
                    const dc = colorMap[depColor];

                    const chartData = Array.from({ length: usefulLife + 1 }, (_, i) => ({
                      year: i === 0 ? "Start" : `Yr ${i}`,
                      value: Math.max(purchaseCost - annualDep * i, salvageValue),
                    }));

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className={cn("rounded-lg border p-3", dc.bg, dc.border)}>
                            <p className={cn("text-[10px] font-medium uppercase tracking-wide", dc.text)}>Current Value</p>
                            <p className={cn("text-[18px] font-bold mt-0.5", dc.bold)}>${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Depreciated</p>
                            <p className="text-[18px] font-bold text-slate-700 mt-0.5">${totalDepreciated.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Annual Depreciation</p>
                            <p className="text-[14px] font-bold text-slate-700 mt-0.5">${annualDep.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly Depreciation</p>
                            <p className="text-[14px] font-bold text-slate-700 mt-0.5">${monthlyDep.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-medium text-slate-500">Depreciation Progress</span>
                            <span className="text-[11px] font-semibold text-slate-700">{pctDepreciated.toFixed(1)}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-500", dc.bar)}
                              style={{ width: `${Math.min(pctDepreciated, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-slate-400">${purchaseCost.toLocaleString()}</span>
                            <span className={cn("text-[10px] font-medium", dc.text)}>${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining ({pctRemaining.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="h-[140px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Maintenance History Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-slate-500" />
                  Maintenance History
                  {maintenanceRecords.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[11px] rounded-lg"
                    >
                      {maintenanceRecords.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[240px] overflow-y-auto space-y-2.5 pr-1">
                  {maintenanceRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-slate-50 mb-2">
                        <Wrench className="h-5 w-5 text-slate-300" />
                      </div>
                      <p className="text-[13px] text-slate-400">
                        No maintenance records yet
                      </p>
                    </div>
                  ) : (
                    maintenanceRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] rounded-lg border font-medium",
                                MAINTENANCE_TYPE_COLORS[record.type] || ""
                              )}
                            >
                              {record.type}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              {format(
                                new Date(record.performedAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-700 leading-snug">
                            {record.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                            <span>By: {record.performedBy}</span>
                            {record.cost != null && (
                              <span className="font-medium text-slate-500">
                                ${record.cost.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator className="my-4 bg-slate-100" />

                {/* Add Maintenance Record */}
                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-slate-900">
                    Add Maintenance Record
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Type
                      </label>
                      <Select
                        value={maintType}
                        onValueChange={setMaintType}
                      >
                        <SelectTrigger className="mt-1 h-9 rounded-lg text-[13px] border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAINTENANCE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Performed By
                      </label>
                      <Input
                        className="mt-1 h-9 rounded-lg text-[13px] border-slate-200"
                        placeholder="Technician name"
                        value={maintPerformedBy}
                        onChange={(e) => setMaintPerformedBy(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      Description
                    </label>
                    <Textarea
                      className="mt-1 rounded-lg text-[13px] border-slate-200 resize-none"
                      placeholder="What was done..."
                      rows={2}
                      value={maintDescription}
                      onChange={(e) => setMaintDescription(e.target.value)}
                    />
                  </div>
                  <div className="w-48">
                    <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      Cost ($)
                    </label>
                    <Input
                      className="mt-1 h-9 rounded-lg text-[13px] border-slate-200"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={maintCost}
                      onChange={(e) => setMaintCost(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-600/20"
                    onClick={handleAddMaintenance}
                    disabled={addingMaintenance || !maintDescription.trim()}
                  >
                    {addingMaintenance ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Adding...
                      </span>
                    ) : (
                      <>
                        <Wrench className="mr-1.5 h-3.5 w-3.5" />
                        Add Record
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[340px] space-y-5">
          {/* Assignment Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-slate-500" />
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentAssignment ? (
                  <div>
                    <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-100 mb-4">
                      <p className="text-[11px] font-medium text-sky-500 uppercase tracking-wide mb-1">
                        Currently Assigned To
                      </p>
                      <p className="text-[14px] font-semibold text-sky-900">
                        {currentAssignment.staff?.name || "Unknown Staff"}
                      </p>
                      <p className="text-[12px] text-sky-600 mt-1">
                        Since{" "}
                        {format(
                          new Date(currentAssignment.assignedAt),
                          "MMM dd, yyyy"
                        )}
                      </p>
                      {currentAssignment.notes && (
                        <p className="text-[12px] text-sky-700 mt-1 italic">
                          {currentAssignment.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-lg text-[13px] border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all"
                      onClick={handleReturn}
                      disabled={returning}
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      {returning ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Returning...
                        </span>
                      ) : (
                        "Return Asset"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-100 mb-4">
                      <p className="text-[13px] font-medium text-emerald-700">
                        This asset is available
                      </p>
                      <p className="text-[12px] text-emerald-600 mt-0.5">
                        Assign it to a staff member below
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                          Select Staff
                        </label>
                        <Select
                          value={selectedStaffId}
                          onValueChange={setSelectedStaffId}
                        >
                          <SelectTrigger className="mt-1 h-9 rounded-lg text-[13px] border-slate-200">
                            <SelectValue placeholder="Choose staff..." />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <div className="flex items-center gap-2">
                                  <span>{s.name}</span>
                                  <span className="text-slate-400">—</span>
                                  <span className="text-slate-400 text-[12px]">
                                    {s.department}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                          Notes{" "}
                          <span className="normal-case text-slate-400">
                            (optional)
                          </span>
                        </label>
                        <Input
                          className="mt-1 h-9 rounded-lg text-[13px] border-slate-200"
                          placeholder="Assignment notes..."
                          value={assignNotes}
                          onChange={(e) => setAssignNotes(e.target.value)}
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-600/20"
                        onClick={handleAssign}
                        disabled={assigning || !selectedStaffId}
                      >
                        {assigning ? (
                          <span className="flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Assigning...
                          </span>
                        ) : (
                          <>
                            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                            Assign Asset
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assignment History Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Assignment History
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Past assignments for this asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[240px] overflow-y-auto space-y-2.5 pr-1">
                  {pastAssignments.length === 0 ? (
                    <p className="text-[13px] text-slate-400 text-center py-6">
                      No past assignments
                    </p>
                  ) : (
                    pastAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-slate-900">
                            {assignment.staff?.name || "Unknown Staff"}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span>
                              {format(
                                new Date(assignment.assignedAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                            <span className="text-slate-300">→</span>
                            <span>
                              {format(
                                new Date(assignment.returnedAt!),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                          {assignment.notes && (
                            <p className="text-[11px] text-slate-400 mt-1 italic">
                              {assignment.notes}
                            </p>
                          )}
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
