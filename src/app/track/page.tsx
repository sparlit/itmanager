"use client";

import { useState } from "react";
import { Search, PackageCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CustomerPortalNav } from "@/components/customer/customer-portal-nav";
import { readCustomerSession } from "@/lib/customer-portal";
import { toast } from "sonner";

interface LaundryOrderRecord {
  id: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
}

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState(readCustomerSession()?.mobile || "");
  const [results, setResults] = useState<LaundryOrderRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!orderId.trim() && !mobile.trim()) {
      toast.error("Enter an order ID or mobile number");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderId.trim()) params.set("orderId", orderId.trim());
      if (!orderId.trim() && mobile.trim()) params.set("mobile", mobile.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not load tracking results");
        return;
      }

      setResults(data.orders || []);
      if ((data.orders || []).length === 0) {
        toast.message("No matching orders found");
      }
    } catch {
      toast.error("Tracking request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <CustomerPortalNav customer={readCustomerSession()} />

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <PackageCheck className="h-6 w-6 text-amber-600" />
              Track Laundry Orders
            </CardTitle>
            <CardDescription>
              Search by order ID or by the mobile number used for the customer account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="order-id">Order ID</Label>
              <Input id="order-id" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Paste full order ID" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile number</Label>
              <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+974 XXXX XXXX" />
            </div>
            <div className="flex items-end">
              <Button className="w-full gap-2 md:w-auto" onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4" />
                {loading ? "Searching..." : "Track"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4">
          {results.map((order) => (
            <Card key={order.id} className="border-slate-200 shadow-sm">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-slate-600">{order.serviceType}</p>
                  <p className="text-xs text-slate-500">{order.pickupDate} at {order.pickupTime}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
                    <p className="text-sm font-semibold text-slate-900">QAR {Number(order.totalAmount).toFixed(2)}</p>
                  </div>
                  <Badge variant="outline" className="gap-2">
                    <Truck className="h-3.5 w-3.5" />
                    {order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
