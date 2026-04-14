"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<{ className?: string }>;
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: number;
  uptime: number;
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function SystemHealthView() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: "CPU Usage", value: 23, unit: "%", status: "healthy", trend: "stable", icon: Cpu },
    { name: "Memory", value: 67, unit: "%", status: "healthy", trend: "up", icon: MemoryStick },
    { name: "Disk Usage", value: 45, unit: "%", status: "healthy", trend: "up", icon: HardDrive },
    { name: "Network I/O", value: 12, unit: "MB/s", status: "healthy", trend: "down", icon: Network },
    { name: "Active Connections", value: 142, unit: "", status: "healthy", trend: "stable", icon: Activity },
    { name: "Server Load", value: 0.8, unit: "", status: "healthy", trend: "stable", icon: Server },
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Database", status: "operational", latency: 12, uptime: 99.99 },
    { name: "API Server", status: "operational", latency: 8, uptime: 99.97 },
    { name: "File Storage", status: "operational", latency: 24, uptime: 99.95 },
    { name: "Email Service", status: "degraded", latency: 340, uptime: 98.5 },
    { name: "Backup Service", status: "operational", latency: 45, uptime: 99.9 },
  ]);

  const [lastChecked, setLastChecked] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const refreshMetrics = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setMetrics((prev) =>
      prev.map((m) => ({
        ...m,
        value: m.name === "CPU Usage" ? Math.floor(Math.random() * 40 + 10) : m.value,
        trend: (["up", "down", "stable"] as const)[Math.floor(Math.random() * 3)],
      }))
    );
    setLastChecked(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const statusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "warning":
      case "degraded":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "critical":
      case "down":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const statusDot = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "bg-emerald-500";
      case "warning":
      case "degraded":
        return "bg-amber-500";
      case "critical":
      case "down":
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-slate-900">System Health</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Real-time monitoring and service status
              <span className="ml-2 text-slate-400">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={refreshing}
            className="gap-1.5 h-9"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* System Metrics */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((metric) => (
            <Card key={metric.name} className="border-slate-200/70 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", 
                    metric.status === "healthy" ? "bg-emerald-50" : metric.status === "warning" ? "bg-amber-50" : "bg-rose-50"
                  )}>
                    <metric.icon className={cn("h-4 w-4",
                      metric.status === "healthy" ? "text-emerald-600" : metric.status === "warning" ? "text-amber-600" : "text-rose-600"
                    )} />
                  </div>
                  {metric.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-rose-500" />}
                  {metric.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />}
                  {metric.trend === "stable" && <Activity className="h-3.5 w-3.5 text-slate-400" />}
                </div>
                <p className="text-[20px] font-bold text-slate-900">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{metric.name}</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500",
                      metric.status === "healthy" ? "bg-emerald-500" : metric.status === "warning" ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Service Status */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Service Status</CardTitle>
            <CardDescription className="text-[12px]">Current status of all system services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2.5 w-2.5 rounded-full", statusDot(service.status))} />
                    <span className="text-[13px] font-medium text-slate-700">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      {service.latency}ms
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {service.uptime}% uptime
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] rounded-md", statusColor(service.status))}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Recent Alerts</CardTitle>
            <CardDescription className="text-[12px]">System alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "2 min ago", message: "Email service response time degraded", type: "warning" },
                { time: "15 min ago", message: "Database backup completed successfully", type: "success" },
                { time: "1 hour ago", message: "CPU usage spike detected and resolved", type: "info" },
                { time: "3 hours ago", message: "System health check passed", type: "success" },
              ].map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  {alert.type === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  ) : alert.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <Activity className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-700">{alert.message}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
