"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound, Search, Sparkles, ClipboardList, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerRegistration } from "@/components/customer-registration/customer-registration";
import { CustomerPortalNav } from "@/components/customer/customer-portal-nav";
import { readCustomerSession, writeCustomerSession, type CustomerSession } from "@/lib/customer-portal";
import { toast } from "sonner";

export default function AccountPage() {
  const router = useRouter();
  const [intent, setIntent] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [lookupMobile, setLookupMobile] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    setCustomer(readCustomerSession());
    setIntent(new URLSearchParams(window.location.search).get("intent"));
  }, []);

  const handleContinue = (nextRoute?: string) => {
    router.push(nextRoute || (intent === "order" ? "/services" : "/orders"));
  };

  const handleLookup = async () => {
    if (!lookupMobile.trim() && !lookupEmail.trim()) {
      toast.error("Enter your mobile number or email");
      return;
    }

    setLookupLoading(true);
    try {
      const query = new URLSearchParams();
      if (lookupMobile.trim()) query.set("mobile", lookupMobile.trim());
      if (lookupEmail.trim()) query.set("email", lookupEmail.trim());

      const res = await fetch(`/api/customers?${query.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.exists || !data.customer) {
        toast.error("We could not find a customer profile with those details");
        return;
      }

      writeCustomerSession(data.customer);
      setCustomer(data.customer);
      toast.success("Customer portal unlocked");
      handleContinue();
    } catch {
      toast.error("Failed to look up your customer profile");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <CustomerPortalNav
        customer={customer}
        onSignOut={() => {
          setCustomer(null);
          toast.success("Signed out of customer portal");
          router.push("/account");
        }}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserRound className="h-6 w-6 text-emerald-600" />
              Customer Access
            </CardTitle>
            <CardDescription>
              Register a new laundry customer account or recover your existing customer profile to manage orders, tracking, and support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {customer ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Active Customer</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{customer.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{customer.mobile}{customer.email ? ` · ${customer.email}` : ""}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => handleContinue("/orders")} className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    My Orders
                  </Button>
                  <Button variant="outline" onClick={() => handleContinue("/services")} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Place Order
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New Customer</CardTitle>
                  <CardDescription>Create a customer profile for laundry orders and service access.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setShowRegistration(true)}>
                    Register Customer
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Existing Customer</CardTitle>
                  <CardDescription>Use your mobile number or email to open your customer portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile">Mobile number</Label>
                    <Input
                      id="mobile"
                      value={lookupMobile}
                      onChange={(e) => setLookupMobile(e.target.value)}
                      placeholder="+974 XXXX XXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <Button className="w-full gap-2" onClick={handleLookup} disabled={lookupLoading}>
                    <Search className="h-4 w-4" />
                    {lookupLoading ? "Checking..." : "Open My Portal"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">What this portal gives customers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p>Place laundry orders with registration-backed customer identity instead of one-off forms.</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p>Track live order history and status using your customer profile.</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p>Use support routes for complaints, feedback, and chat-driven customer service.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" onClick={() => router.push("/")}>← Back to Home</Button>
              <Button variant="outline" onClick={() => router.push("/services")}>Browse Services</Button>
              <Button variant="outline" onClick={() => router.push("/track")}>Track an Order</Button>
              <Button variant="outline" onClick={() => router.push("/support")}>Customer Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {showRegistration ? (
        <CustomerRegistration
          onClose={() => setShowRegistration(false)}
          onSuccess={(newCustomer) => {
            writeCustomerSession(newCustomer);
            setCustomer(newCustomer);
            setShowRegistration(false);
            toast.success("Customer profile created");
            handleContinue();
          }}
        />
      ) : null}
    </div>
  );
}
