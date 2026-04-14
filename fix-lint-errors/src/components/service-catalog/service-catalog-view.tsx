"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Package,
  Layers,
  Shield,
  Cloud,
  Settings,
  Database,
  Monitor,
  Network,
  Wrench,
  KeyRound,
  Mail,
  HardDrive,
  ArrowRight,
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ServiceCatalog } from "@/types";

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

// ─── Icon Map ───────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Package,
  Layers,
  Shield,
  Cloud,
  Settings,
  Database,
  Monitor,
  Network,
  Wrench,
  KeyRound,
  Mail,
  HardDrive,
};

function getCategoryIcon(icon: string): React.ElementType {
  return ICON_MAP[icon] || Package;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Inactive: "bg-slate-50 text-slate-600 border-slate-200",
    Draft: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

const CATEGORY_COLORS: Record<string, string> = {
  Hardware: "bg-sky-50 text-sky-700 border-sky-200",
  Software: "bg-violet-50 text-violet-700 border-violet-200",
  Network: "bg-teal-50 text-teal-700 border-teal-200",
  Security: "bg-rose-50 text-rose-700 border-rose-200",
  Support: "bg-amber-50 text-amber-700 border-amber-200",
  Cloud: "bg-indigo-50 text-indigo-700 border-indigo-200",
  General: "bg-slate-50 text-slate-600 border-slate-200",
};

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function ServiceCatalogView() {
  const [services, setServices] = useState<ServiceCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchServices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/service-catalog?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setServices(json.services || []);
      }
    } catch (err) {
      console.error("Failed to fetch service catalog:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleRequestService = async (service: ServiceCatalog) => {
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id }),
      });
      if (res.ok) {
        toast.success(`Service request submitted for "${service.name}"`);
        fetchServices();
      } else {
        toast.error("Failed to submit service request");
      }
    } catch {
      toast.error("Failed to submit service request");
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(services.map((s) => s.category))),
  ];

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Filters ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-[13px] border-slate-200"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[160px] h-10 text-[13px] border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "All" ? "All Categories" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Service Cards Grid ──────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-[14px] font-medium">No services found</p>
            <p className="text-[12px] mt-1">
              {searchQuery || categoryFilter !== "All"
                ? "Try adjusting your filters"
                : "No services are currently available"}
            </p>
          </div>
        ) : (
          services.map((service) => {
            const Icon = getCategoryIcon(service.icon);
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                viewport={{ once: true }}
              >
                <Card className="border-slate-200/70 shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-200 group h-full">
                  <CardContent className="p-5">
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] rounded-md border font-medium",
                              CATEGORY_COLORS[service.category] || ""
                            )}
                          >
                            {service.category}
                          </Badge>
                          <Badge
                            className={cn(
                              "text-[10px] font-medium border",
                              getStatusColor(service.status)
                            )}
                          >
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-slate-400">
                          Est. {service.estimatedTime || "N/A"}
                        </span>
                        {service.approvalRequired && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-amber-600 border-amber-200 bg-amber-50"
                          >
                            Approval Required
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {service.requests || 0} requests
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full mt-3 h-9 text-[12px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-sm shadow-emerald-200 gap-2"
                      onClick={() => handleRequestService(service)}
                      disabled={service.status !== "Active"}
                    >
                      Request Service
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
