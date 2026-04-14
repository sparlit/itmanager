"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Search, Package, Clock, CheckCircle, XCircle, Loader2, 
  FileText, Send, Calendar, Tag, User, Plus, Filter, BarChart3, Settings,
  ChevronRight, AlertTriangle, Users, TrendingUp, Award, Eye, Edit
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 }
};

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: string;
  estimatedTime: string;
  approvalRequired: boolean;
  requests: number;
}

interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  serviceIcon: string;
  userName: string;
  userEmail: string;
  status: string;
  priority: string;
  notes: string;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  completedAt: string | null;
}

const CATEGORIES = [
  { value: "All", label: "All Services", icon: "✨" },
  { value: "Hardware", label: "Hardware", icon: "💻" },
  { value: "Software", label: "Software", icon: "📀" },
  { value: "Network", label: "Network", icon: "🌐" },
  { value: "Security", label: "Security", icon: "🛡️" },
  { value: "Account", label: "Account", icon: "👤" },
  { value: "Cloud", label: "Cloud", icon: "☁️" },
  { value: "Support", label: "Support", icon: "🛠️" },
  { value: "Communication", label: "Communication", icon: "📞" },
  { value: "Supplies", label: "Supplies", icon: "📦" },
  { value: "Onboarding", label: "Onboarding", icon: "👥" },
  { value: "Offboarding", label: "Offboarding", icon: "↩️" },
];

const PRIORITIES = [
  { value: "Low", label: "Low", color: "bg-slate-100 text-slate-700" },
  { value: "Medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "High", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "Critical", label: "Critical", color: "bg-rose-100 text-rose-700" },
];

const STATUSES = [
  { value: "Pending", label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  { value: "In Progress", label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  { value: "Completed", label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  { value: "Rejected", label: "Rejected", color: "bg-rose-100 text-rose-700", icon: XCircle },
];

const STATS_CONFIG = [
  { label: "Total Requests", key: "total", icon: FileText, color: "bg-blue-500" },
  { label: "Pending", key: "Pending", icon: Clock, color: "bg-amber-500" },
  { label: "In Progress", key: "In Progress", icon: Loader2, color: "bg-violet-500" },
  { label: "Completed", key: "Completed", icon: CheckCircle, color: "bg-emerald-500" },
];

export function ServiceCatalogView() {
  const [activeTab, setActiveTab] = useState<"catalog" | "requests" | "reports">("catalog");
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requestForm, setRequestForm] = useState({
    priority: "Medium",
    notes: "",
    deliveryLocation: "",
    preferredDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetch("/api/service-catalog")
      .then(res => res.json())
      .then(json => setServices(json.services || []))
      .catch(err => console.error("Failed to fetch services:", err));
  }, []);

  // Fetch requests when tab changes
  useEffect(() => {
    if (activeTab === "requests") {
      fetch("/api/service-requests?view=all-requests")
        .then(res => res.json())
        .then(json => setRequests(json.requests || []))
        .catch(err => console.error("Failed to fetch requests:", err));
    }
  }, [activeTab]);

  const handleSubmitRequest = async () => {
    if (!selectedService) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          priority: requestForm.priority,
          notes: requestForm.notes,
          deliveryLocation: requestForm.deliveryLocation,
          preferredDate: requestForm.preferredDate,
        }),
      });
      if (res.ok) {
        toast.success(`Request submitted for "${selectedService.name}"`);
        setShowModal(false);
        setRequestForm({ priority: "Medium", notes: "", deliveryLocation: "", preferredDate: "" });
        setSelectedService(null);
        setActiveTab("requests");
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to submit request");
      }
    } catch {
      toast.error("Failed to submit request");
    }
    setSubmitting(false);
  };

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch("/api/service-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      if (res.ok) {
        toast.success(`Request ${status.toLowerCase()}`);
        setActiveTab("requests");
      } else {
        toast.error("Failed to update request");
      }
    } catch {
      toast.error("Failed to update request");
    }
  };

  // Stats calculation
  const stats = useMemo(() => ({
    total: requests.length,
    Pending: requests.filter(r => r.status === "Pending").length,
    "In Progress": requests.filter(r => r.status === "In Progress").length,
    Completed: requests.filter(r => r.status === "Completed").length,
  }), [requests]);

  // Filtering
  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => STATUSES.find(s => s.value === status) || STATUSES[0];
  const getPriorityConfig = (priority: string) => PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS_CONFIG.map(stat => (
          <div key={stat.key} className={`${stat.color} rounded-xl p-4 text-white`}>
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 opacity-80" />
              <span className="text-[11px] opacity-80">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.key === "total" ? stats.total : stats[stat.key as keyof typeof stats] || 0}</p>
          </div>
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.div variants={itemVariants} className="flex gap-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "catalog" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Package className="h-4 w-4" /> Catalog
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "requests" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FileText className="h-4 w-4" /> Requests
          {stats.Pending > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 rounded-full">{stats.Pending}</span>}
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "reports" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Reports
        </button>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Catalog */}
        {activeTab === "catalog" && (
          <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    categoryFilter === cat.value 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-[13px] border-slate-200"
              />
            </div>

            {/* Services Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredServices.map(service => (
                  <motion.div key={service.id} variants={itemVariants}>
                    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => { setSelectedService(service); setShowModal(true); }}>
                      <CardContent className="p-4">
                        <div className="text-2xl mb-2">{service.icon}</div>
                        <h3 className="text-[14px] font-semibold text-slate-900 mb-1">{service.name}</h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className="text-[9px] bg-slate-100 text-slate-600">{service.category}</Badge>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {service.estimatedTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Requests */}
        {activeTab === "requests" && (
          <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 text-[13px]" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-10"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : filteredRequests.length === 0 ? (
              <Card><CardContent className="py-20 text-center text-slate-400"><FileText className="h-12 w-12 mx-auto mb-3" /><p>No requests found</p></CardContent></Card>
            ) : (
              <div className="space-y-2">
                {filteredRequests.map(req => {
                  const statusConfig = getStatusConfig(req.status);
                  const priorityConfig = getPriorityConfig(req.priority);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <Card key={req.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{req.serviceIcon || "📦"}</span>
                            <div>
                              <p className="text-[14px] font-semibold text-slate-900">{req.serviceName}</p>
                              <p className="text-[11px] text-slate-500">by {req.userName} • {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] px-2 py-1 rounded-full ${priorityConfig.color}`}>{req.priority}</span>
                            <Badge className={`text-[10px] ${statusConfig.color}`}><StatusIcon className="h-3 w-3 mr-1" />{statusConfig.label}</Badge>
                            {req.assignedToName && <span className="text-[10px] text-slate-400">→ {req.assignedToName}</span>}
                          </div>
                        </div>
                        {req.status === "Pending" && (
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button size="sm" className="bg-blue-600" onClick={() => handleUpdateStatus(req.id, "In Progress")}>Start</Button>
                            <Button size="sm" className="bg-emerald-600" onClick={() => handleUpdateStatus(req.id, "Completed")}>Complete</Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(req.id, "Rejected")}>Reject</Button>
                          </div>
                        )}
                        {req.status === "In Progress" && (
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button size="sm" className="bg-emerald-600" onClick={() => handleUpdateStatus(req.id, "Completed")}>Complete</Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(req.id, "Rejected")}>Reject</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><p className="text-[12px] text-slate-500">By Category</p><p className="text-xl font-bold text-slate-900">{CATEGORIES.length - 1}</p><p className="text-[10px] text-slate-400">Service categories</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-[12px] text-slate-500">Avg Resolution</p><p className="text-xl font-bold text-slate-900">2.3 days</p><p className="text-[10px] text-slate-400">Average completion time</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-[12px] text-slate-500">Satisfaction</p><p className="text-xl font-bold text-emerald-600">94%</p><p className="text-[10px] text-slate-400">Completed requests</p></CardContent></Card>
            </div>
            <Card>
              <CardContent className="p-6 text-center text-slate-400">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-[15px]">Detailed analytics dashboard coming soon</p>
                <p className="text-[12px]">Track trends, staff performance, and service metrics</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {showModal && selectedService && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50">
              <div className="bg-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedService.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedService.name}</h2>
                    <p className="text-[12px] text-emerald-100">{selectedService.category}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-[13px] text-slate-600">{selectedService.description}</p>
                  <div className="flex gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedService.estimatedTime}</span>
                    {selectedService.approvalRequired && <Badge className="text-[9px] bg-amber-100 text-amber-700">Approval Required</Badge>}
                  </div>
                </div>
                <div>
                  <Label className="text-[13px]">Priority</Label>
                  <div className="flex gap-2 mt-2">
                    {PRIORITIES.map(p => (
                      <button key={p.value} onClick={() => setRequestForm({ ...requestForm, priority: p.value })}
                        className={`flex-1 py-2 rounded-lg text-[12px] font-medium border-2 transition-all ${requestForm.priority === p.value ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-[13px]">Delivery Location</Label>
                  <Input value={requestForm.deliveryLocation} onChange={(e) => setRequestForm({ ...requestForm, deliveryLocation: e.target.value })} placeholder="Office, Floor, Room..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-[13px]">Preferred Date</Label>
                  <Input type="date" value={requestForm.preferredDate} onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-[13px]">Notes</Label>
                  <Textarea value={requestForm.notes} onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })} placeholder="Additional details..." className="mt-1 h-20" />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSubmitRequest} disabled={submitting} className="bg-emerald-600">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Request"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
