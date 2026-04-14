"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Truck, 
  Star,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Shirt,
  Briefcase,
  Sofa,
  Gem,
  Baby,
  Palette,
  Leaf
} from "lucide-react";
import { IT_SERVICES } from "@/data/it-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderForm } from "@/components/order-form/order-form";

  const LAUNDRY_SERVICES = [
  {
    id: 1,
    icon: Briefcase,
    title: "Dry Cleaning",
    description: "Professional dry cleaning service for suits, dresses, and formal wear. We use eco-friendly solvents to gently clean delicate fabrics while removing tough stains.",
    features: ["Stain Removal", "Professional Pressing", "Leather Care", "Fabric Treatment"],
    price: "From QAR 35",
    popular: true
  },
  {
    id: 2,
    icon: Shirt,
    title: "Press 'N' Fold",
    description: "Perfect crease and professional finish for your clothes. Steam ironing with precision for a crisp, polished look every time.",
    features: ["Steam Ironing", "Crease Removal", "Neat Folding", "Wrinkle Free"],
    price: "From QAR 15"
  },
  {
    id: 3,
    icon: Palette,
    title: "Shoe Cleaning",
    description: "Professional shoe cleaning and restoration for all types of shoes. Includes leather conditioning and color restoration.",
    features: ["All Types", "Color Restoration", "Leather Treatment", "Deep Clean"],
    price: "From QAR 25"
  },
  {
    id: 4,
    icon: Droplets,
    title: "Washing",
    description: "Professional machine washing with premium detergents. Hot and cold water options with fabric-specific care.",
    features: ["Hot & Cold Water", "Multiple Cycles", "Fabric Care", "Premium Detergents"],
    price: "From QAR 20"
  },
  {
    id: 5,
    icon: Gem,
    title: "Wedding Dress",
    description: "Specialized care for wedding gowns and formal wear. Expert handling with beading care and fabric preservation.",
    features: ["Beading Care", "Fabric Preservation", "Expert Handling", "White Glove Service"],
    price: "From QAR 300",
    premium: true
  },
  {
    id: 6,
    icon: Sofa,
    title: "Carpet Cleaning",
    description: "Deep cleaning for all types of carpets and rugs. Advanced equipment removes embedded dirt and stains.",
    features: ["Deep Stain Removal", "Sanitization", "Quick Drying", "Stain Protection"],
    price: "From QAR 50"
  },
  {
    id: 7,
    icon: Baby,
    title: "Curtains & Blinds",
    description: "Professional cleaning for curtains, blinds, and drapes. Fabric care with steam cleaning and same-day service.",
    features: ["Fabric Care", "Steam Cleaning", "Hardware Service", "Same Day Service"],
    price: "From QAR 40"
  },
  {
    id: 8,
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Environmentally conscious cleaning options. Green detergents and reduced water usage for sustainable care.",
    features: ["Green Detergents", "Reduced Water Usage", "Carbon Neutral", "Safe for Babies"],
    price: "From QAR 30"
  },
  {
    id: 9,
    icon: Gem,
    title: "Leather Cleaning",
    description: "Specialized cleaning and conditioning for leather garments with color restoration.",
    features: ["Leather Care", "Color Restoration", "Waterproofing"],
    price: "From QAR 50"
  },
  {
    id: 10,
    icon: Leaf,
    title: "Bedding & Linen",
    description: "Cleaning for duvet covers, sheets, and bulky linen items.",
    features: ["Duvet Care", "Linen Care"],
    price: "From QAR 40"
  },
  {
    id: 11,
    icon: Sofa,
    title: "Upholstery Cleaning",
    description: "Deep cleaning for sofas, chairs, and cushions with fabric-safe cleaners.",
    features: ["Fabric Care", "Deep Clean"],
    price: "From QAR 60"
  },
  {
    id: 12,
    icon: Droplets,
    title: "Mattress Cleaning",
    description: "Sanitizing and deodorizing mattresses for a healthier sleep environment.",
    features: ["Sanitization", "Deodorization"],
    price: "From QAR 45"
  },
  {
    id: 13,
    icon: Shirt,
    title: "Delicate Garment Cleaning",
    description: "Gentle handling for silk, lace, and other delicate fabrics.",
    features: ["Delicate Care", "Hand Finish"],
    price: "From QAR 30"
  },
  {
    id: 14,
    icon: Briefcase,
    title: "Curtain Cleaning (Heavy)",
    description: "Deep curtain cleaning with stain removal and sanitization.",
    features: ["Heavy Cleaning", "Stain Removal"],
    price: "From QAR 35"
  }
];

// IT services catalogue will be loaded from data module and rendered in the UI

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ServicesPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<typeof LAUNDRY_SERVICES[0] | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleBookNow = (service: typeof LAUNDRY_SERVICES[0]) => {
    setSelectedService(service);
    setShowOrderForm(true);
  };

  const handleOrderSubmit = (order: unknown) => {
    console.log("Order submitted:", order);
    toast.success("Order placed successfully! We will contact you shortly.");
    setShowOrderForm(false);
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/landing")}>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md">
                <img 
                  src="/arl-logo.png" 
                  alt="Al Rayes Laundry" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Al Rayes Laundry</h1>
                <p className="text-xs text-slate-500">Your Traditional Laundry Pioneer</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push("/landing")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-sky-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Services</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Comprehensive laundry solutions tailored to your needs across Qatar. 
              Professional care for every type of garment.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>80+ Locations</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Free Pickup & Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {LAUNDRY_SERVICES.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="relative">
                    {service.popular && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        Popular
                      </div>
                    )}
                    {service.premium && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        Premium
                      </div>
                    )}
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6">
                      <service.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-cyan-600">{service.price}</span>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Fast Service</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Choose Al Rayes Laundry?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Free Delivery", desc: "Free pickup and delivery across 80+ locations in Qatar" },
              { icon: Clock, title: "24/7 Service", desc: "Round-the-clock customer support for all your needs" },
              { icon: Star, title: "Quality Guaranteed", desc: "15+ years of excellence with ISO 9001 certification" }
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-3xl bg-slate-50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Contact us today for free pickup! Use code <span className="text-amber-400 font-bold">newarl20</span> for 20% off your first order.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 border-0 px-8 py-3 rounded-full font-bold">
              <Phone className="w-4 h-4 mr-2" /> Call +974 33969659
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10 px-8 py-3 rounded-full">
              <Mail className="w-4 h-4 mr-2" /> info@alrayeslaundry.com
            </Button>
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedService(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <selectedService.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedService.title}</h2>
                  <p className="text-cyan-100">{selectedService.price}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600">{selectedService.description}</p>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">What&apos;s Included:</h3>
                <ul className="space-y-2">
                  {selectedService.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-cyan-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Estimated time: Same day or next day</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedService(null)}>Close</Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 border-0" onClick={() => handleBookNow(selectedService)}>
                Book Now
              </Button>
            </div>
          </motion.div>
        </>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          service={selectedService}
          onClose={() => { setShowOrderForm(false); setSelectedService(null); }}
          onSubmit={handleOrderSubmit}
        />
      )}
    </div>
  );
}
