"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, startOfDay, isSameDay, isToday, addMonths, subMonths, addDays, differenceInDays, isAfter, isBefore } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  Clock,
  CalendarDays,
  Monitor,
  TicketCheck,
  Filter,
  X,
  ArrowRight,
  CalendarRange,
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/app-store";
import type { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────
interface EventFilter {
  warranty: boolean;
  maintenance: boolean;
  review: boolean;
}

interface CalendarStats {
  expiringWarranties: number;
  scheduledMaintenance: number;
  criticalTickets: number;
}

// ─── Animation Variants ─────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Event Type Config ──────────────────────────────────────────
const EVENT_TYPE_CONFIG = {
  warranty: {
    label: "Warranty",
    icon: ShieldAlert,
    color: "#f43f5e",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    color: "#0ea5e9",
    bgClass: "bg-sky-50",
    textClass: "text-sky-700",
    borderClass: "border-sky-200",
    dotClass: "bg-sky-500",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  review: {
    label: "Ticket Review",
    icon: AlertTriangle,
    color: "#f59e0b",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function CalendarView() {
  const { setView } = useAppStore();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    startOfDay(new Date())
  );
  const [filters, setFilters] = useState<EventFilter>({
    warranty: true,
    maintenance: true,
    review: true,
  });

  // ─── Fetch Events ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/calendar");
        if (res.ok) {
          const json = await res.json();
          setEvents(json.events || []);
        }
      } catch (err) {
        console.error("Failed to fetch calendar events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // ─── Filtered Events ──────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return events.filter((e) => filters[e.type as keyof EventFilter]);
  }, [events, filters]);

  // ─── Events grouped by date ───────────────────────────────────
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of filteredEvents) {
      const list = map.get(event.date) || [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [filteredEvents]);

  // ─── Events for selected date ─────────────────────────────────
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return eventsByDate.get(key) || [];
  }, [selectedDate, eventsByDate]);

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo<CalendarStats>(() => {
    const now = startOfDay(new Date());
    const thirtyDaysLater = addDays(now, 30);

    let expiringWarranties = 0;
    let scheduledMaintenance = 0;
    let criticalTickets = 0;

    for (const event of events) {
      const eventDate = parseISO(event.date);
      if (event.type === "warranty") {
        if (isAfter(eventDate, now) && isBefore(eventDate, thirtyDaysLater)) {
          expiringWarranties++;
        }
      } else if (event.type === "maintenance") {
        if (isAfter(eventDate, now) && isBefore(eventDate, thirtyDaysLater)) {
          scheduledMaintenance++;
        }
      } else if (event.type === "review") {
        if (event.description?.includes("Critical")) {
          criticalTickets++;
        }
      }
    }

    return { expiringWarranties, scheduledMaintenance, criticalTickets };
  }, [events]);

  // ─── Navigate to related item ─────────────────────────────────
  const handleEventClick = (event: CalendarEvent) => {
    if (event.relatedType === "ticket") {
      setView("ticket-detail", event.relatedId);
    } else if (event.relatedType === "asset") {
      setView("asset-detail", event.relatedId);
    }
  };

  // ─── Toggle filter ────────────────────────────────────────────
  const toggleFilter = (type: keyof EventFilter) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // ─── Skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Skeleton className="h-[480px] rounded-xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[480px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Page Header ─────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        viewport={{ once: true }}
        className="flex items-center gap-2"
      >
        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-1">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {(Object.keys(EVENT_TYPE_CONFIG) as Array<keyof typeof EVENT_TYPE_CONFIG>).map(
              (type) => {
                const config = EVENT_TYPE_CONFIG[type];
                const isActive = filters[type as keyof EventFilter];
                return (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type as keyof EventFilter)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all",
                      isActive
                        ? `${config.bgClass} ${config.textClass} shadow-xs`
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isActive ? config.dotClass : "bg-slate-300"
                      )}
                    />
                    <span className="hidden sm:inline">{config.label}</span>
                  </button>
                );
              }
            )}
          </div>
      </motion.div>

      {/* ─── Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                    Warranties Expiring
                  </p>
                  <p className="text-[24px] font-bold text-slate-900 leading-tight mt-0.5">
                    {stats.expiringWarranties}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 ml-14">
                Within the next 30 days
              </p>
            </CardContent>
            <div className="h-0.5 bg-gradient-to-r w-full from-rose-500 to-rose-600" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50">
                  <Wrench className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                    Scheduled Maintenance
                  </p>
                  <p className="text-[24px] font-bold text-slate-900 leading-tight mt-0.5">
                    {stats.scheduledMaintenance}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 ml-14">
                Upcoming in next 30 days
              </p>
            </CardContent>
            <div className="h-0.5 bg-gradient-to-r w-full from-sky-500 to-sky-600" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white card-hover overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                    Critical Tickets
                  </p>
                  <p className="text-[24px] font-bold text-slate-900 leading-tight mt-0.5">
                    {stats.criticalTickets}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 ml-14">
                Require immediate attention
              </p>
            </CardContent>
            <div className="h-0.5 bg-gradient-to-r w-full from-amber-500 to-amber-600" />
          </Card>
        </motion.div>
      </div>

      {/* ─── Main Calendar + Event Panel ─────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Calendar Grid (3/5) */}
        <motion.div
          className="lg:col-span-3"
          variants={itemVariants}
          viewport={{ once: true }}
        >
          <Card className="rounded-xl border-slate-200/60 bg-white">
            {/* Month Navigation Header */}
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <CalendarRange className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-[16px] font-semibold text-slate-900">
                      {format(currentMonth, "MMMM yyyy")}
                    </CardTitle>
                    <CardDescription className="text-[12px] text-slate-500">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} in range
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-[12px]"
                    onClick={() => {
                      setCurrentMonth(new Date());
                      setSelectedDate(startOfDay(new Date()));
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Custom Calendar Grid */}
              <div className="w-full">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Days Grid */}
                <CalendarDayGrid
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  eventsByDate={eventsByDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Legend
                </span>
                {(Object.keys(EVENT_TYPE_CONFIG) as Array<
                  keyof typeof EVENT_TYPE_CONFIG
                >).map((type) => {
                  const config = EVENT_TYPE_CONFIG[type];
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-1.5 text-[12px] text-slate-500"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      {config.label}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Detail Panel (2/5) */}
        <motion.div
          className="lg:col-span-2"
          variants={itemVariants}
          viewport={{ once: true }}
        >
          <Card className="rounded-xl border-slate-200/60 bg-white h-[520px] flex flex-col overflow-hidden">
            <CardHeader className="pb-0 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[14px] font-semibold text-slate-900">
                    {selectedDate
                      ? format(selectedDate, "EEEE, MMM d")
                      : "Select a date"}
                  </CardTitle>
                  <CardDescription className="text-[12px] text-slate-500">
                    {selectedDateEvents.length > 0
                      ? `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? "s" : ""} scheduled`
                      : "No events for this date"}
                  </CardDescription>
                </div>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <Separator className="mt-2" />
            <CardContent className="pt-3 pb-4 flex-1 overflow-hidden">
              {selectedDateEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <CalendarDays className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-500">
                      No events scheduled
                    </p>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {selectedDate
                        ? format(selectedDate, "MMMM d, yyyy")
                        : "Select a date to view events"}
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full max-h-[360px]">
                  <div className="space-y-2.5 pr-2">
                    {selectedDateEvents.map((event) => {
                      const config =
                        EVENT_TYPE_CONFIG[
                          event.type as keyof typeof EVENT_TYPE_CONFIG
                        ];
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => handleEventClick(event)}
                            className="w-full text-left group"
                          >
                            <div
                              className={cn(
                                "rounded-lg border p-3.5 transition-all hover:shadow-sm",
                                "border-slate-200/80 bg-white hover:bg-slate-50/50",
                                "group-hover:border-slate-300"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5",
                                    config.bgClass
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "h-4 w-4",
                                      config.textClass
                                    )}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[13px] font-semibold text-slate-900 truncate">
                                      {event.title}
                                    </p>
                                  </div>
                                  <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">
                                    {event.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px] rounded-md border font-medium px-1.5 py-0",
                                        config.badgeClass
                                      )}
                                    >
                                      {config.label}
                                    </Badge>
                                    {event.relatedType === "asset" && (
                                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                        <Monitor className="h-3 w-3" />
                                        Asset
                                      </span>
                                    )}
                                    {event.relatedType === "ticket" && (
                                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                        <TicketCheck className="h-3 w-3" />
                                        Ticket
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-2" />
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Upcoming Events Timeline ────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Upcoming Events
                </CardTitle>
                <CardDescription className="text-[12px] text-slate-500">
                  Next 30 days at a glance
                </CardDescription>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <CalendarRange className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(() => {
              const now = startOfDay(new Date());
              const thirtyDaysLater = addDays(now, 30);
              const upcoming = filteredEvents
                .filter((e) => {
                  const d = parseISO(e.date);
                  return (
                    isAfter(d, now) || isSameDay(d, now)
                  ) && isBefore(d, thirtyDaysLater);
                })
                .sort((a, b) => a.date.localeCompare(b.date));

              if (upcoming.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-2">
                      <CalendarDays className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-[13px] text-slate-500">
                      No upcoming events
                    </p>
                    <p className="text-[12px] text-slate-400">
                      Events will appear here as they are scheduled
                    </p>
                  </div>
                );
              }

              return (
                <ScrollArea className="max-h-80">
                  <div className="divide-y divide-slate-100">
                    {upcoming.slice(0, 15).map((event, idx) => {
                      const config =
                        EVENT_TYPE_CONFIG[
                          event.type as keyof typeof EVENT_TYPE_CONFIG
                        ];
                      const Icon = config.icon;
                      const eventDate = parseISO(event.date);
                      const daysUntil = differenceInDays(eventDate, now);

                      return (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="w-full text-left group"
                        >
                          <div
                            className={cn(
                              "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/80",
                              idx % 2 === 1 && "bg-slate-50/40"
                            )}
                          >
                            {/* Date Column */}
                            <div className="w-12 text-center shrink-0">
                              <p className="text-[11px] font-medium text-slate-400 uppercase">
                                {format(eventDate, "EEE")}
                              </p>
                              <p className="text-[18px] font-bold text-slate-900 leading-tight">
                                {format(eventDate, "d")}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {format(eventDate, "MMM")}
                              </p>
                            </div>

                            {/* Color Bar */}
                            <div
                              className="w-1 h-10 rounded-full shrink-0"
                              style={{ backgroundColor: event.color }}
                            />

                            {/* Icon */}
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                                config.bgClass
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4",
                                  config.textClass
                                )}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-slate-900 truncate">
                                {event.title}
                              </p>
                              <p className="text-[12px] text-slate-500 truncate">
                                {event.description}
                              </p>
                            </div>

                            {/* Days Badge */}
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] rounded-lg border font-medium shrink-0",
                                daysUntil === 0
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : daysUntil <= 7
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                              )}
                            >
                              {daysUntil === 0
                                ? "Today"
                                : `${daysUntil}d`}
                            </Badge>

                            <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              );
            })()}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Custom Calendar Day Grid
// ═══════════════════════════════════════════════════════════════
function CalendarDayGrid({
  currentMonth,
  selectedDate,
  eventsByDate,
  onSelectDate,
}: {
  currentMonth: Date;
  selectedDate: Date | undefined;
  eventsByDate: Map<string, CalendarEvent[]>;
  onSelectDate: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const startDay = monthStart.getDay();
  const daysInMonth = endOfMonth(currentMonth).getDate();
  const daysInPrevMonth = endOfMonth(subMonths(currentMonth, 1)).getDate();

  const today = startOfDay(new Date());

  // Build the grid cells
  const cells: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        daysInPrevMonth - i
      ),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d),
      isCurrentMonth: true,
    });
  }

  // Next month padding (fill to complete rows, 6 rows = 42 cells)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        d
      ),
      isCurrentMonth: false,
    });
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-200/80">
      {cells.map((cell, idx) => {
        const key = format(cell.date, "yyyy-MM-dd");
        const dayEvents = eventsByDate.get(key) || [];
        const isTodayDate = isToday(cell.date);
        const isSelected =
          selectedDate && isSameDay(cell.date, selectedDate);

        return (
          <button
            key={idx}
            onClick={() => onSelectDate(cell.date)}
            className={cn(
              "relative flex flex-col items-center justify-center py-2 min-h-[52px] transition-colors",
              "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500",
              cell.isCurrentMonth ? "bg-white" : "bg-slate-50/50",
              isSelected && !isTodayDate && "bg-emerald-50",
              isTodayDate && !isSelected && "bg-emerald-50/60"
            )}
          >
            {/* Selected ring overlay */}
            {isSelected && (
              <div className="absolute inset-0 border-2 border-emerald-600 rounded-none pointer-events-none z-10" />
            )}

            {/* Day number */}
            <span
              className={cn(
                "text-[13px] leading-none",
                !cell.isCurrentMonth && "text-slate-300",
                cell.isCurrentMonth && !isTodayDate && !isSelected && "text-slate-700",
                isTodayDate && !isSelected && "font-bold text-emerald-700",
                isSelected && "font-bold text-emerald-700"
              )}
            >
              {cell.date.getDate()}
            </span>

            {/* Today indicator */}
            {isTodayDate && !isSelected && (
              <div className="h-1 w-1 rounded-full bg-emerald-600 mt-1" />
            )}

            {/* Event dots */}
            {dayEvents.length > 0 && cell.isCurrentMonth && (
              <div className="flex gap-0.5 mt-1">
                {dayEvents.slice(0, 4).map((event, i) => (
                  <div
                    key={i}
                    className="h-1 w-1 rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-emerald-600)"
                        : event.color,
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
