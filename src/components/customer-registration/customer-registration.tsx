"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Phone, Mail, MessageCircle, User, Home, Building, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LocationPickerMap } from "@/components/location-picker-map/location-picker-map";

interface CustomerRegistrationProps {
  onClose: () => void;
  onSuccess: (customer: { id: string; name: string; mobile: string; email?: string }) => void;
  prefillData?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

export function CustomerRegistration({ onClose, onSuccess, prefillData }: CustomerRegistrationProps) {
  void prefillData;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    landline: "",
    whatsapp: "",
    fullAddress: "",
    area: "",
    building: "",
    villaNo: "",
    landmark: "",
    latitude: "",
    longitude: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapLatitude, setMapLatitude] = useState<number>(25.2854);
  const [mapLongitude, setMapLongitude] = useState<number>(51.5310);

  const handleLocationChange = (lat: number, lng: number) => {
    setMapLatitude(lat);
    setMapLongitude(lng);
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapLatitude(latitude);
          setMapLongitude(longitude);
          setFormData({
            ...formData,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          });
          setShowMap(true);
        },
        () => {
          setError("Unable to get your location. Please enable location services.");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("This mobile number is already registered. Please login or use a different number.");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      onSuccess(data.customer);
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-4 md:inset-10 bg-white rounded-3xl shadow-2xl z-[60] overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Customer Registration</h2>
              <p className="text-white/80">Please fill your details to continue</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form id="registration-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+974 XXXX XXXX"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+974 XXXX XXXX"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="landline">Landline</Label>
                <Input
                  id="landline"
                  type="tel"
                  value={formData.landline}
                  onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                  placeholder="+974 XXXX XXXX"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g., Al Sadd, Doha, The Pearl"
                required
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="building">Building/Villa No.</Label>
                <Input
                  id="building"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="Building No."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="villaNo">Villa/Apartment No.</Label>
                <Input
                  id="villaNo"
                  value={formData.villaNo}
                  onChange={(e) => setFormData({ ...formData, villaNo: e.target.value })}
                  placeholder="Villa/Apt No."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="landmark">Nearest Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fullAddress">Full Address *</Label>
              <Textarea
                id="fullAddress"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                placeholder="Complete delivery address"
                required
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Pickup Location on Map</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Navigation className="w-3 h-3" />
                    Use My Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-xs flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    <MapPin className="w-3 h-3" />
                    {showMap ? "Hide Map" : "Pick on Map"}
                  </button>
                </div>
              </div>

              {showMap && (
                <div className="mt-2">
                  <LocationPickerMap
                    latitude={mapLatitude}
                    longitude={mapLongitude}
                    onLocationChange={handleLocationChange}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    📍 Click on the map to pin your exact location • Lat: {mapLatitude.toFixed(6)}, Lng: {mapLongitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="25.2854"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="51.5310"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions..."
                rows={2}
                className="mt-1"
              />
            </div>
          </form>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> +974 4466 1924</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> WhatsApp</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">Cancel</Button>
            <Button
              type="submit"
              form="registration-form"
              onClick={handleSubmit}
              disabled={loading || !formData.firstName || !formData.lastName || !formData.mobile || !formData.area || !formData.fullAddress}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 border-0 px-8"
            >
              {loading ? "Registering..." : "Register & Continue"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default CustomerRegistration;
