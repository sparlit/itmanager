"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X, Truck, ShoppingBag, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomerRegistration } from "@/components/customer-registration/customer-registration";
import { readCustomerSession, writeCustomerSession, type CustomerSession } from "@/lib/customer-portal";

interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

interface OrderFormProps {
  service: {
    id: number;
    title: string;
    price: string;
    icon: React.ComponentType<{ className?: string }>;
  } | null;
  onClose: () => void;
  onSubmit: (order: unknown) => void;
}

const PRICE_LIST: Record<string, LaundryItem[]> = {
  "Gent & Ladies": [
    { id: "100041_1", name: "ABAYA - Dry Cleaning", price: 15, category: "Gent & Ladies" },
    { id: "100041_2", name: "ABAYA - Pressing Only", price: 10, category: "Gent & Ladies" },
    { id: "100041_3", name: "ABAYA - Washing & Pressing", price: 12, category: "Gent & Ladies" },
    { id: "100040_1", name: "ABAYA SPECIAL - Dry Cleaning", price: 25, category: "Gent & Ladies" },
    { id: "100040_2", name: "ABAYA SPECIAL - Pressing Only", price: 10, category: "Gent & Ladies" },
    { id: "100040_3", name: "ABAYA SPECIAL - Washing & Pressing", price: 20, category: "Gent & Ladies" },
    { id: "100007_1", name: "SHIRT - Dry Cleaning", price: 6, category: "Gent & Ladies" },
    { id: "100007_2", name: "SHIRT - Pressing Only", price: 3, category: "Gent & Ladies" },
    { id: "100007_3", name: "SHIRT - Washing & Pressing", price: 5, category: "Gent & Ladies" },
    { id: "100002_1", name: "TROUSER - Dry Cleaning", price: 8, category: "Gent & Ladies" },
    { id: "100002_2", name: "TROUSER - Pressing Only", price: 3, category: "Gent & Ladies" },
    { id: "100002_3", name: "TROUSER - Washing & Pressing", price: 6, category: "Gent & Ladies" },
    { id: "100034_1", name: "GENTS SUIT (3 PCS) - Dry Cleaning", price: 21, category: "Gent & Ladies" },
    { id: "100034_2", name: "GENTS SUIT (3 PCS) - Pressing Only", price: 12, category: "Gent & Ladies" },
    { id: "100034_3", name: "GENTS SUIT (3 PCS) - Washing & Pressing", price: 18, category: "Gent & Ladies" },
    { id: "100197_1", name: "SUIT - Dry Cleaning", price: 20, category: "Gent & Ladies" },
    { id: "100197_2", name: "SUIT - Pressing Only", price: 10, category: "Gent & Ladies" },
    { id: "100197_3", name: "SUIT - Washing & Pressing", price: 13, category: "Gent & Ladies" },
    { id: "100032_1", name: "JACKET - Dry Cleaning", price: 14, category: "Gent & Ladies" },
    { id: "100032_2", name: "JACKET - Pressing Only", price: 7, category: "Gent & Ladies" },
    { id: "100032_3", name: "JACKET - Washing & Pressing", price: 12, category: "Gent & Ladies" },
    { id: "100071_1", name: "SWEATER - Dry Cleaning", price: 8, category: "Gent & Ladies" },
    { id: "100071_2", name: "SWEATER - Pressing Only", price: 4, category: "Gent & Ladies" },
    { id: "100071_3", name: "SWEATER - Washing & Pressing", price: 6, category: "Gent & Ladies" },
    { id: "100024_1", name: "T SHIRT - Dry Cleaning", price: 5, category: "Gent & Ladies" },
    { id: "100024_2", name: "T SHIRT - Pressing Only", price: 2, category: "Gent & Ladies" },
    { id: "100024_3", name: "T SHIRT - Washing & Pressing", price: 4, category: "Gent & Ladies" },
    { id: "100159_1", name: "DRESS SHORT - Dry Cleaning", price: 20, category: "Gent & Ladies" },
    { id: "100159_2", name: "DRESS SHORT - Pressing Only", price: 10, category: "Gent & Ladies" },
    { id: "100159_3", name: "DRESS SHORT - Washing & Pressing", price: 15, category: "Gent & Ladies" },
    { id: "100160_1", name: "DRESS LONG - Dry Cleaning", price: 25, category: "Gent & Ladies" },
    { id: "100160_2", name: "DRESS LONG - Pressing Only", price: 15, category: "Gent & Ladies" },
    { id: "100160_3", name: "DRESS LONG - Washing & Pressing", price: 20, category: "Gent & Ladies" },
    { id: "100042_1", name: "BISHT - Dry Cleaning", price: 40, category: "Gent & Ladies" },
    { id: "100042_2", name: "BISHT - Pressing Only", price: 25, category: "Gent & Ladies" },
    { id: "100042_3", name: "BISHT - Washing & Pressing", price: 40, category: "Gent & Ladies" },
    { id: "100050_1", name: "HIJAB - Dry Cleaning", price: 4, category: "Gent & Ladies" },
    { id: "100050_2", name: "HIJAB - Pressing Only", price: 2, category: "Gent & Ladies" },
    { id: "100050_3", name: "HIJAB - Washing & Pressing", price: 3, category: "Gent & Ladies" },
    { id: "100048_1", name: "SARI - Dry Cleaning", price: 15, category: "Gent & Ladies" },
    { id: "100048_2", name: "SARI - Pressing Only", price: 10, category: "Gent & Ladies" },
    { id: "100048_3", name: "SARI - Washing & Pressing", price: 12, category: "Gent & Ladies" },
    { id: "100013_1", name: "DISHDASHA - Dry Cleaning", price: 10, category: "Gent & Ladies" },
    { id: "100013_2", name: "DISHDASHA - Pressing Only", price: 4, category: "Gent & Ladies" },
    { id: "100013_3", name: "DISHDASHA - Washing & Pressing", price: 6, category: "Gent & Ladies" },
    { id: "100113_1", name: "LAB COAT - Dry Cleaning", price: 10, category: "Gent & Ladies" },
    { id: "100113_2", name: "LAB COAT - Pressing Only", price: 4, category: "Gent & Ladies" },
    { id: "100113_3", name: "LAB COAT - Washing & Pressing", price: 8, category: "Gent & Ladies" },
  ],
  "Household": [
    { id: "100010_1", name: "BED COVER DOUBLE - Dry Cleaning", price: 15, category: "Household" },
    { id: "100010_2", name: "BED COVER DOUBLE - Pressing Only", price: 8, category: "Household" },
    { id: "100010_3", name: "BED COVER DOUBLE - Washing & Pressing", price: 12, category: "Household" },
    { id: "100059_1", name: "BED COVER SINGLE - Dry Cleaning", price: 12, category: "Household" },
    { id: "100059_2", name: "BED COVER SINGLE - Pressing Only", price: 6, category: "Household" },
    { id: "100059_3", name: "BED COVER SINGLE - Washing & Pressing", price: 10, category: "Household" },
    { id: "100052_1", name: "BED SHEET DOUBLE - Dry Cleaning", price: 8, category: "Household" },
    { id: "100052_2", name: "BED SHEET DOUBLE - Pressing Only", price: 4, category: "Household" },
    { id: "100052_3", name: "BED SHEET DOUBLE - Washing & Pressing", price: 6, category: "Household" },
    { id: "100060_1", name: "BED SHEET SINGLE - Dry Cleaning", price: 6, category: "Household" },
    { id: "100060_2", name: "BED SHEET SINGLE - Pressing Only", price: 3, category: "Household" },
    { id: "100060_3", name: "BED SHEET SINGLE - Washing & Pressing", price: 5, category: "Household" },
    { id: "100011_1", name: "BLANKET DOUBLE - Dry Cleaning", price: 18, category: "Household" },
    { id: "100011_3", name: "BLANKET DOUBLE - Washing & Pressing", price: 15, category: "Household" },
    { id: "100062_1", name: "BLANKET SINGLE - Dry Cleaning", price: 15, category: "Household" },
    { id: "100062_3", name: "BLANKET SINGLE - Washing & Pressing", price: 10, category: "Household" },
    { id: "100055_1", name: "CURTAIN LARGE - Dry Cleaning", price: 25, category: "Household" },
    { id: "100055_3", name: "CURTAIN LARGE - Washing & Pressing", price: 20, category: "Household" },
    { id: "100063_1", name: "CURTAIN SMALL - Dry Cleaning", price: 20, category: "Household" },
    { id: "100063_2", name: "CURTAIN SMALL - Pressing Only", price: 8, category: "Household" },
    { id: "100063_3", name: "CURTAIN SMALL - Washing & Pressing", price: 15, category: "Household" },
    { id: "100087_1", name: "COMFORTER DOUBLE - Dry Cleaning", price: 20, category: "Household" },
    { id: "100087_3", name: "COMFORTER DOUBLE - Washing & Pressing", price: 15, category: "Household" },
    { id: "100088_1", name: "COMFORTER SINGLE - Dry Cleaning", price: 12, category: "Household" },
    { id: "100088_3", name: "COMFORTER SINGLE - Washing & Pressing", price: 10, category: "Household" },
    { id: "100053_1", name: "PILLOW CASE - Dry Cleaning", price: 3, category: "Household" },
    { id: "100053_2", name: "PILLOW CASE - Pressing Only", price: 1, category: "Household" },
    { id: "100053_3", name: "PILLOW CASE - Washing & Pressing", price: 2, category: "Household" },
    { id: "100054_1", name: "TOWEL LARGE - Dry Cleaning", price: 7, category: "Household" },
    { id: "100054_2", name: "TOWEL LARGE - Pressing Only", price: 3, category: "Household" },
    { id: "100054_3", name: "TOWEL LARGE - Washing & Pressing", price: 6, category: "Household" },
    { id: "100065_1", name: "TOWEL SMALL - Dry Cleaning", price: 6, category: "Household" },
    { id: "100065_2", name: "TOWEL SMALL - Pressing Only", price: 2, category: "Household" },
    { id: "100065_3", name: "TOWEL SMALL - Washing & Pressing", price: 5, category: "Household" },
    { id: "100125", name: "BATH TOWEL - Washing & Pressing", price: 5, category: "Household" },
    { id: "100080", name: "BATH MAT - Washing & Pressing", price: 5, category: "Household" },
    { id: "100095", name: "HAND TOWEL - Washing & Pressing", price: 3, category: "Household" },
  ],
  "Kids": [
    { id: "100170_1", name: "CHILD ABAYA - Dry Cleaning", price: 7, category: "Kids" },
    { id: "100170_2", name: "CHILD ABAYA - Pressing Only", price: 3, category: "Kids" },
    { id: "100170_3", name: "CHILD ABAYA - Washing & Pressing", price: 5, category: "Kids" },
    { id: "100172_1", name: "CHILD DRESS - Dry Cleaning", price: 13, category: "Kids" },
    { id: "100172_2", name: "CHILD DRESS - Pressing Only", price: 6, category: "Kids" },
    { id: "100172_3", name: "CHILD DRESS - Washing & Pressing", price: 10, category: "Kids" },
    { id: "100174_1", name: "CHILD SHIRT - Dry Cleaning", price: 3, category: "Kids" },
    { id: "100174_2", name: "CHILD SHIRT - Pressing Only", price: 1, category: "Kids" },
    { id: "100174_3", name: "CHILD SHIRT - Washing & Pressing", price: 3, category: "Kids" },
    { id: "100176_1", name: "CHILD SUIT - Dry Cleaning", price: 8, category: "Kids" },
    { id: "100176_2", name: "CHILD SUIT - Pressing Only", price: 4, category: "Kids" },
    { id: "100176_3", name: "CHILD SUIT - Washing & Pressing", price: 6, category: "Kids" },
    { id: "100178_1", name: "CHILD TROUSER - Dry Cleaning", price: 4, category: "Kids" },
    { id: "100178_2", name: "CHILD TROUSER - Pressing Only", price: 2, category: "Kids" },
    { id: "100178_3", name: "CHILD TROUSER - Washing & Pressing", price: 3, category: "Kids" },
    { id: "100179_1", name: "CHILD T-SHIRT - Dry Cleaning", price: 2, category: "Kids" },
    { id: "100179_2", name: "CHILD T-SHIRT - Pressing Only", price: 1, category: "Kids" },
    { id: "100179_3", name: "CHILD T-SHIRT - Washing & Pressing", price: 2, category: "Kids" },
    { id: "100195", name: "SCHOOL UNIFORM SET - Washing & Pressing", price: 8, category: "Kids" },
  ],
  "Others": [
    { id: "100123", name: "HAND BAG LARGE - Dry Cleaning", price: 15, category: "Others" },
    { id: "100122", name: "HAND BAG SMALL - Dry Cleaning", price: 10, category: "Others" },
    { id: "100120", name: "SUITCASE LARGE - Dry Cleaning", price: 15, category: "Others" },
    { id: "100121", name: "SUITCASE SMALL - Dry Cleaning", price: 10, category: "Others" },
    { id: "100102", name: "STUFFED TOY LARGE - Dry Cleaning", price: 12, category: "Others" },
    { id: "100104", name: "STUFFED TOY SMALL - Dry Cleaning", price: 6, category: "Others" },
    { id: "100193", name: "QATAR FLAG LARGE - Washing & Pressing", price: 20, category: "Others" },
    { id: "100192", name: "QATAR FLAG MEDIUM - Washing & Pressing", price: 15, category: "Others" },
    { id: "100191", name: "QATAR FLAG SMALL - Washing & Pressing", price: 10, category: "Others" },
  ],
};

export function OrderForm({ service, onClose, onSubmit }: OrderFormProps) {
  const [showRegistration, setShowRegistration] = useState(false);
  const [customer, setCustomer] = useState<CustomerSession | null>(() => readCustomerSession());
  
  const [formData, setFormData] = useState(() => {
    const savedCustomer = readCustomerSession();
    return {
      name: savedCustomer?.name || "",
      phone: savedCustomer?.mobile || "",
      email: savedCustomer?.email || "",
      address: "",
      area: savedCustomer?.area || "",
      building: "",
      villaNo: "",
      landmark: "",
      pickupDate: "",
      pickupTime: "",
      notes: "",
      serviceType: "Washing & Pressing",
    };
  });
  
  const [activeCategory, setActiveCategory] = useState("Gent & Ladies");
  const [items, setItems] = useState<LaundryItem[]>([]);

  const addItem = (item: LaundryItem) => {
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      removeItem(item.id);
    } else {
      setItems([...items, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setItems(items.filter((i) => i.id !== id));
    } else {
      setItems(items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleSave = async () => {
    if (!customer) {
      setShowRegistration(true);
      return;
    }

    const orderData = {
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      service: service?.title,
      serviceType: formData.serviceType,
      items,
      total,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      pickupAddress: `${formData.address}, ${formData.area}`,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Order placed successfully!");
        onSubmit(data.order);
      } else {
        toast.error("Failed to place order");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleCustomerRegistered = (registeredCustomer: { id: string; name: string; mobile: string; email?: string }) => {
    writeCustomerSession(registeredCustomer);
    setCustomer(registeredCustomer);
    setFormData({
      ...formData,
      name: registeredCustomer.name,
      phone: registeredCustomer.mobile,
      email: registeredCustomer.email || "",
    });
    setShowRegistration(false);
    toast.success("Registration successful! Please continue with your order.");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-4 md:inset-10 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Laundry Order Form</h2>
              {service && <p className="text-white/80">{service.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {customer ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{customer.name}</p>
                    <p className="text-sm text-emerald-700">{customer.mobile}</p>
                  </div>
                </div>
                <button onClick={() => setCustomer(null)} className="text-sm text-emerald-600 hover:text-emerald-800">
                  Change
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800">Please register or login to confirm your order</p>
                  </div>
                  <Button onClick={() => setShowRegistration(true)} size="sm" className="bg-amber-500 hover:bg-amber-600">
                    Register / Login
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label className="text-base font-semibold">Service Type *</Label>
              <div className="mt-2 flex gap-2 flex-wrap">
                {["Washing & Pressing", "Dry Cleaning", "Pressing Only"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, serviceType: type })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.serviceType === type
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupDate">Preferred Pickup Date *</Label>
                <Input id="pickupDate" type="date" value={formData.pickupDate} onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="pickupTime">Preferred Time *</Label>
                <select id="pickupTime" value={formData.pickupTime} onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })} required className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Select time slot</option>
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="evening">Evening (4PM - 8PM)</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Area *</Label>
                <Input id="area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="e.g., Al Sadd, The Pearl" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="landmark">Nearest Landmark</Label>
                <Input id="landmark" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} placeholder="Near..." className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Full Address *</Label>
              <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Complete pickup address" required rows={2} className="mt-1" />
            </div>

            <div>
              <Label className="text-base font-semibold">Select Items ({formData.serviceType})</Label>
              
              <div className="mt-2 flex gap-2 flex-wrap">
                {["Gent & Ladies", "Household", "Kids", "Others"].map((cat) => (
                  <button key={cat} type="button" onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                {PRICE_LIST[activeCategory]?.map((item) => (
                  <button key={item.id} type="button" onClick={() => addItem(item)} className={`p-2 rounded-lg border text-left transition-all hover:shadow-md text-xs ${items.find((i) => i.id === item.id) ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}>
                    <div className="font-medium truncate">{item.name.split(" - ")[0]}</div>
                    <div className="text-slate-500">QAR {item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {items.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold mb-3">Your Order ({items.length} items)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name.split(" - ")[0]}</div>
                        <div className="text-xs text-slate-500">QAR {item.price}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-slate-100 text-sm">-</button>
                        <span className="w-5 text-center font-medium text-sm">{item.quantity || 1}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-slate-100 text-sm">+</button>
                        <button type="button" onClick={() => removeItem(item.id)} className="ml-1 text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-emerald-600">QAR {total}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any special requirements..." rows={2} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck className="w-4 h-4" />
            <span>Free pickup & delivery across Qatar</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">Cancel</Button>
            <Button onClick={handleSave} disabled={items.length === 0 || !customer} className="bg-gradient-to-r from-emerald-500 to-cyan-500 border-0 px-8">
              {customer ? `Save Order (QAR ${total})` : "Register to Continue"}
            </Button>
          </div>
        </div>
      </motion.div>

      {showRegistration && (
        <CustomerRegistration
          onClose={() => setShowRegistration(false)}
          onSuccess={handleCustomerRegistered}
        />
      )}
    </>
  );
}

export default OrderForm;
