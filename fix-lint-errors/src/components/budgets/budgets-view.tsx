"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Budget } from "@/types";

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
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Completed: "bg-sky-50 text-sky-700 border-sky-200",
    OverBudget: "bg-rose-50 text-rose-700 border-rose-200",
    OnHold: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

function getProgressColor(pct: number): string {
  if (pct >= 90) return "bg-rose-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function BudgetsView() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch("/api/budgets");
      if (res.ok) {
        const json = await res.json();
        setBudgets(json.budgets || []);
      }
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const filteredBudgets = budgets.filter((b) => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    if (departmentFilter !== "All" && (b.department || "") !== departmentFilter)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (b.name || "").toLowerCase().includes(q) ||
        (b.department || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalBudget = budgets.reduce((sum, b) => sum + (b.totalBudget || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const activeBudgets = budgets.filter((b) => b.status === "Active").length;

  const departments = [
    "All",
    ...Array.from(new Set(budgets.map((b) => b.department))),
  ];
  const statuses = [
    "All",
    ...Array.from(new Set(budgets.map((b) => b.status))),
  ];

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Stat Cards ──────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Budget",
              value: formatCurrency(totalBudget),
              icon: Wallet,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Total Spent",
              value: formatCurrency(totalSpent),
              icon: TrendingUp,
              color: "text-rose-600",
              bg: "bg-rose-50",
            },
            {
              label: "Remaining",
              value: formatCurrency(remaining),
              icon: TrendingDown,
              color: "text-sky-600",
              bg: "bg-sky-50",
            },
            {
              label: "Active Budgets",
              value: activeBudgets,
              icon: PieChart,
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
                  placeholder="Search budgets..."
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
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[160px] h-10 text-[13px] border-slate-200">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d === "All" ? "All Departments" : d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Budget Cards ────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
            <DollarSign className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-[14px] font-medium">No budgets found</p>
            <p className="text-[12px] mt-1">
              {searchQuery || statusFilter !== "All" || departmentFilter !== "All"
                ? "Try adjusting your filters"
                : "Budget data will appear here when available"}
            </p>
          </div>
        ) : (
          filteredBudgets.map((budget) => {
            const pct =
              budget.totalBudget > 0
                ? (budget.spent / budget.totalBudget) * 100
                : 0;
            const remainingAmt = budget.totalBudget - budget.spent;
            const isOverBudget = budget.spent > budget.totalBudget;

            return (
              <motion.div
                key={budget.id}
                variants={itemVariants}
                viewport={{ once: true }}
              >
                <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-semibold text-slate-900 truncate">
                          {budget.name}
                        </h3>
                        <p className="text-[12px] text-slate-500 mt-0.5">
                          {budget.department} · {budget.category}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-medium border shrink-0 ml-2",
                          getStatusColor(budget.status)
                        )}
                      >
                        {budget.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500">
                          {formatCurrency(budget.spent)} spent
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isOverBudget ? "text-rose-600" : "text-slate-600"
                          )}
                        >
                          {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            getProgressColor(pct)
                          )}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3 w-3 text-slate-400" />
                          <span className="text-[11px] text-slate-500">
                            {formatCurrency(budget.totalBudget)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isOverBudget ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        <span
                          className={cn(
                            "text-[11px] font-medium",
                            isOverBudget ? "text-rose-600" : "text-emerald-600"
                          )}
                        >
                          {isOverBudget
                            ? `${formatCurrency(Math.abs(remainingAmt))} over`
                            : `${formatCurrency(remainingAmt)} left`}
                        </span>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>FY {budget.fiscalYear}</span>
                      <span>
                        {formatDate(budget.startDate)} –{" "}
                        {formatDate(budget.endDate)}
                      </span>
                    </div>
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
