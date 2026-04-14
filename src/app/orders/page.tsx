"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, CalendarDays, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerPortalNav } from "@/components/customer/customer-portal-nav";
import { clearCustomerSession, readCustomerSession, type CustomerSession } from "@/lib/customer-portal";
import { toast } from "sonner";

interface LaundryOrderRecord {
  id: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [orders, setOrders] = useState<LaundryOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeCustomer = readCustomerSession();
    setCustomer(activeCustomer);

    async function loadOrders() {
      if (!activeCustomer) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders?customerId=${activeCustomer.id}`);
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <CustomerPortalNav
        customer={customer}
        onSignOut={() => {
          clearCustomerSession();
          setCustomer(null);
          setOrders([]);
          toast.success("Signed out of customer portal");
          router.push("/account");
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!customer ? (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Customer sign-in required</CardTitle>
              <CardDescription>Use the customer portal first so we know which orders belong to you.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => router.push("/account")}>Open Customer Portal</Button>
              <Button variant="outline" onClick={() => router.push("/track")}>Track by order or mobile</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Laundry Orders</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Order history and active jobs</h2>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/services")}>Place New Order</Button>
                <Button variant="outline" onClick={() => router.push("/track")}>Track Orders</Button>
              </div>
            </div>

            {loading ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-10 text-center text-sm text-slate-500">Loading your order history...</CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-12 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">No orders found yet for this customer profile.</p>
                  <Button className="mt-4" onClick={() => router.push("/services")}>Place your first order</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {orders.map((order) => (
                  <Card key={order.id} className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{order.serviceType}</CardTitle>
                          <CardDescription className="mt-1">Order #{order.id.slice(-8).toUpperCase()}</CardDescription>
                        </div>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-sky-600" />
                        <span>{order.pickupDate} at {order.pickupTime}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Truck className="mt-0.5 h-4 w-4 text-sky-600" />
                        <span>{order.pickupAddress}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <span className="inline-flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          Total
                        </span>
                        <strong className="text-slate-900">QAR {Number(order.totalAmount).toFixed(2)}</strong>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
