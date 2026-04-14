"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, PackageSearch, ClipboardList, MessageCircle, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CustomerSession } from "@/lib/customer-portal";
import { clearCustomerSession } from "@/lib/customer-portal";

const navItems = [
  { href: "/account", label: "Account", icon: User },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/track", label: "Track", icon: PackageSearch },
  { href: "/support", label: "Support", icon: MessageCircle },
  { href: "/services", label: "Services", icon: Sparkles },
];

interface CustomerPortalNavProps {
  customer: CustomerSession | null;
  onSignOut?: () => void;
}

export function CustomerPortalNav({ customer, onSignOut }: CustomerPortalNavProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Laundry Customer Portal
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              {customer ? `Welcome back, ${customer.name}` : "Manage orders, support, and account details"}
            </h1>
          </div>
          {customer ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                clearCustomerSession();
                onSignOut?.();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
