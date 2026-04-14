"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  ChevronDown, 
  Menu, 
  X, 
  Star,
  CheckCircle,
  Clock,
  Award,
  Truck,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Shirt,
  Briefcase,
  Sofa,
  Baby,
  Palette,
  Gem,
  Leaf,
  Sparkles,
  Waves,
  Flame,
  Moon,
  Sun,
  Rainbow,
  Building2,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderNowButton } from "@/components/order-now-button/order-now-button";
import { PRICE_LIST } from "@/data/price-list";

// Theme configurations - High contrast for readability
const THEMES = [
  {
    id: "ocean",
    name: "Ocean Fresh",
    primary: "#0284c7",
    secondary: "#0ea5e9",
    accent: "#38bdf8",
    gradient: "from-sky-600 via-blue-500 to-cyan-400",
    bgGradient: "from-sky-50 via-blue-50 to-cyan-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Fresh and clean like ocean waves",
    heroImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=800&fit=crop"
  },
  {
    id: "emerald",
    name: "Emerald Luxe",
    primary: "#059669",
    secondary: "#10b981",
    accent: "#34d399",
    gradient: "from-emerald-600 via-green-500 to-teal-400",
    bgGradient: "from-emerald-50 via-green-50 to-teal-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Premium freshness for your garments",
    heroImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=800&fit=crop"
  },
  {
    id: "royal",
    name: "Royal Gold",
    primary: "#b45309",
    secondary: "#d97706",
    accent: "#fbbf24",
    gradient: "from-amber-600 via-orange-500 to-yellow-400",
    bgGradient: "from-amber-50 via-orange-50 to-yellow-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Royal treatment for your clothes",
    heroImage: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=800&fit=crop"
  },
  {
    id: "rose",
    name: "Rose Petals",
    primary: "#e11d48",
    secondary: "#f43f5e",
    accent: "#fb7185",
    gradient: "from-rose-600 via-pink-500 to-rose-400",
    bgGradient: "from-rose-50 via-pink-50 to-rose-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Gentle care for delicate fabrics",
    heroImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop"
  },
  {
    id: "midnight",
    name: "Midnight Elegance",
    primary: "#4338ca",
    secondary: "#6366f1",
    accent: "#818cf8",
    gradient: "from-indigo-600 via-violet-500 to-purple-400",
    bgGradient: "from-slate-900 via-slate-800 to-slate-900",
    textColor: "text-white",
    lightText: "text-slate-300",
    description: "Luxurious midnight experience",
    heroImage: "https://images.unsplash.com/photo-1566015665328-27d6492a367f?w=1200&h=800&fit=crop",
    darkMode: true
  },
  {
    id: "pearl",
    name: "Pearl White",
    primary: "#64748b",
    secondary: "#94a3b8",
    accent: "#cbd5e1",
    gradient: "from-slate-600 via-zinc-500 to-stone-400",
    bgGradient: "from-slate-100 via-zinc-100 to-stone-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Pure perfection in every fold",
    heroImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&h=800&fit=crop"
  },
  {
    id: "nature",
    name: "Green Nature",
    primary: "#15803d",
    secondary: "#22c55e",
    accent: "#4ade80",
    gradient: "from-green-600 via-emerald-500 to-lime-400",
    bgGradient: "from-green-50 via-emerald-50 to-lime-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Eco-friendly cleaning excellence",
    heroImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=800&fit=crop"
  },
  {
    id: "lavender",
    name: "Lavender Dreams",
    primary: "#7c3aed",
    secondary: "#8b5cf6",
    accent: "#a78bfa",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
    bgGradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Soothing fragrance of fresh laundry",
    heroImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=800&fit=crop"
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    primary: "#0d9488",
    secondary: "#14b8a6",
    accent: "#2dd4bf",
    gradient: "from-teal-600 via-cyan-500 to-emerald-400",
    bgGradient: "from-teal-50 via-cyan-50 to-emerald-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Crystal clear cleaning perfection",
    heroImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop"
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    primary: "#ea580c",
    secondary: "#f97316",
    accent: "#fb923c",
    gradient: "from-orange-600 via-red-500 to-amber-400",
    bgGradient: "from-orange-50 via-red-50 to-amber-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Warmth in every garment",
    heroImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop"
  },
  {
    id: "arctic",
    name: "Arctic Ice",
    primary: "#0369a1",
    secondary: "#0ea5e9",
    accent: "#38bdf8",
    gradient: "from-sky-700 via-blue-600 to-cyan-500",
    bgGradient: "from-sky-100 via-blue-100 to-cyan-100",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Ice-cold freshness guaranteed",
    heroImage: "https://images.unsplash.com/photo-1566015665328-27d6492a367f?w=1200&h=800&fit=crop"
  },
  {
    id: "coral",
    name: "Coral Reef",
    primary: "#e11d48",
    secondary: "#f43f5e",
    accent: "#fb7185",
    gradient: "from-rose-600 via-pink-500 to-rose-400",
    bgGradient: "from-rose-50 via-pink-50 to-rose-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Vibrant freshness for your clothes",
    heroImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop"
  },
  {
    id: "copper",
    name: "Copper Luxe",
    primary: "#c2410c",
    secondary: "#ea580c",
    accent: "#f97316",
    gradient: "from-orange-700 via-red-600 to-orange-500",
    bgGradient: "from-orange-50 via-red-50 to-orange-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Premium metallic shine",
    heroImage: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=800&fit=crop"
  },
  {
    id: "sapphire",
    name: "Sapphire Blue",
    primary: "#1d4ed8",
    secondary: "#2563eb",
    accent: "#60a5fa",
    gradient: "from-blue-700 via-indigo-600 to-blue-500",
    bgGradient: "from-blue-50 via-indigo-50 to-blue-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Deep blue cleaning excellence",
    heroImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=800&fit=crop"
  },
  {
    id: "mint",
    name: "Fresh Mint",
    primary: "#059669",
    secondary: "#10b981",
    accent: "#6ee7b7",
    gradient: "from-emerald-600 via-teal-500 to-emerald-400",
    bgGradient: "from-emerald-50 via-teal-50 to-emerald-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Cool minty freshness",
    heroImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=800&fit=crop"
  },
  {
    id: "burgundy",
    name: "Burgundy Elegance",
    primary: "#881337",
    secondary: "#9f1239",
    accent: "#f43f5e",
    gradient: "from-rose-800 via-red-700 to-rose-600",
    bgGradient: "from-rose-50 via-red-50 to-rose-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Rich burgundy luxury",
    heroImage: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=800&fit=crop"
  },
  {
    id: "jade",
    name: "Jade Green",
    primary: "#047857",
    secondary: "#059669",
    accent: "#34d399",
    gradient: "from-emerald-700 via-green-600 to-emerald-500",
    bgGradient: "from-emerald-50 via-green-50 to-emerald-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Jade-green perfection",
    heroImage: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&h=800&fit=crop"
  },
  {
    id: "plum",
    name: "Plum Purple",
    primary: "#6b21a8",
    secondary: "#7c3aed",
    accent: "#a78bfa",
    gradient: "from-purple-700 via-violet-600 to-purple-500",
    bgGradient: "from-purple-50 via-violet-50 to-purple-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Royal purple grandeur",
    heroImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=800&fit=crop"
  },
  {
    id: "turquoise",
    name: "Turquoise Dream",
    primary: "#0d9488",
    secondary: "#14b8a6",
    accent: "#5eead4",
    gradient: "from-teal-600 via-cyan-500 to-teal-400",
    bgGradient: "from-teal-50 via-cyan-50 to-teal-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Turquoise tropical freshness",
    heroImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=800&fit=crop"
  },
  {
    id: "marigold",
    name: "Marigold Gold",
    primary: "#ca8a04",
    secondary: "#d97706",
    accent: "#facc15",
    gradient: "from-yellow-600 via-amber-500 to-yellow-400",
    bgGradient: "from-yellow-50 via-amber-50 to-yellow-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Golden sunny freshness",
    heroImage: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=800&fit=crop"
  },
  {
    id: "crimson",
    name: "Crimson Red",
    primary: "#b91c1c",
    secondary: "#dc2626",
    accent: "#f87171",
    gradient: "from-red-700 via-red-600 to-red-500",
    bgGradient: "from-red-50 via-rose-50 to-red-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Bold red energy",
    heroImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop"
  },
  {
    id: "azure",
    name: "Azure Sky",
    primary: "#2563eb",
    secondary: "#3b82f6",
    accent: "#60a5fa",
    gradient: "from-blue-600 via-indigo-500 to-blue-400",
    bgGradient: "from-blue-50 via-indigo-50 to-blue-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Sky high freshness",
    heroImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&h=800&fit=crop"
  },
  {
    id: "lime",
    name: "Lime Zest",
    primary: "#65a30d",
    secondary: "#84cc16",
    accent: "#a3e635",
    gradient: "from-lime-600 via-green-500 to-lime-400",
    bgGradient: "from-lime-50 via-green-50 to-lime-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Zesty lime freshness",
    heroImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=800&fit=crop"
  },
  {
    id: "violet",
    name: "Violet Twist",
    primary: "#7c3aed",
    secondary: "#8b5cf6",
    accent: "#c4b5fd",
    gradient: "from-violet-600 via-purple-500 to-violet-400",
    bgGradient: "from-violet-50 via-fuchsia-50 to-violet-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Twist of violet freshness",
    heroImage: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&h=800&fit=crop"
  },
  {
    id: "peach",
    name: "Peach Blush",
    primary: "#ea580c",
    secondary: "#f97316",
    accent: "#fdba74",
    gradient: "from-orange-500 via-red-400 to-orange-400",
    bgGradient: "from-orange-50 via-amber-50 to-orange-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Peachy clean perfection",
    heroImage: "https://images.unsplash.com/photo-1566015665328-27d6492a367f?w=1200&h=800&fit=crop"
  },
  {
    id: "slate",
    name: "Slate Gray",
    primary: "#475569",
    secondary: "#64748b",
    accent: "#94a3b8",
    gradient: "from-slate-600 via-gray-500 to-slate-400",
    bgGradient: "from-slate-100 via-zinc-100 to-slate-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Classic clean gray",
    heroImage: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&h=800&fit=crop"
  },
  {
    id: "indigo",
    name: "Indigo Night",
    primary: "#4338ca",
    secondary: "#4f46e5",
    accent: "#818cf8",
    gradient: "from-indigo-600 via-blue-500 to-indigo-400",
    bgGradient: "from-indigo-50 via-blue-50 to-indigo-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Indigo midnight freshness",
    heroImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&h=800&fit=crop"
  },
  {
    id: "teal",
    name: "Teal Wave",
    primary: "#0f766e",
    secondary: "#14b8a6",
    accent: "#2dd4bf",
    gradient: "from-teal-700 via-cyan-600 to-teal-500",
    bgGradient: "from-teal-50 via-cyan-50 to-teal-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Wave of fresh teal",
    heroImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=800&fit=crop"
  },
  {
    id: "fuchsia",
    name: "Fuchsia Fun",
    primary: "#c026d3",
    secondary: "#d946ef",
    accent: "#e879f9",
    gradient: "from-fuchsia-600 via-pink-500 to-fuchsia-400",
    bgGradient: "from-fuchsia-50 via-rose-50 to-fuchsia-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Fun fuchsia freshness",
    heroImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=800&fit=crop"
  },
  {
    id: "amber",
    name: "Amber Glow",
    primary: "#d97706",
    secondary: "#f59e0b",
    accent: "#fbbf24",
    gradient: "from-amber-500 via-yellow-500 to-amber-400",
    bgGradient: "from-amber-50 via-orange-50 to-amber-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Glowing amber freshness",
    heroImage: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=800&fit=crop"
  },
  {
    id: "emerald",
    name: "Emerald Isle",
    primary: "#059669",
    secondary: "#10b981",
    accent: "#6ee7b7",
    gradient: "from-emerald-600 via-teal-500 to-emerald-400",
    bgGradient: "from-emerald-50 via-green-50 to-emerald-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Emerald island freshness",
    heroImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop"
  },
  {
    id: "sky",
    name: "Sky Blue",
    primary: "#0284c7",
    secondary: "#0ea5e9",
    accent: "#7dd3fc",
    gradient: "from-sky-500 via-blue-500 to-sky-400",
    bgGradient: "from-sky-50 via-blue-50 to-sky-50",
    textColor: "text-slate-800",
    lightText: "text-slate-600",
    description: "Clear sky freshness",
    heroImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&h=800&fit=crop"
  }
];

const SERVICES = [
  {
    icon: Briefcase,
    title: "Dry Cleaning",
    description: "Expert dry cleaning for delicate fabrics and suits - we know how and what we do to give your garments the best possible.",
    features: ["Stain Removal", "Professional Pressing", "Leather Care", "Fabric Treatment"],
    price: "From QAR 35"
  },
  {
    icon: Shirt,
    title: "Press 'N' Fold",
    description: "Perfect crease and professional finish for your clothes.",
    features: ["Steam Ironing", "Crease Removal", "Neat Folding", "Wrinkle Free"],
    price: "From QAR 15"
  },
  {
    icon: Palette,
    title: "Shoe Cleaning",
    description: "Professional shoe cleaning and restoration for all types of shoes.",
    features: ["All Types", "Color Restoration", "Leather Treatment", "Deep Clean"],
    price: "From QAR 25"
  },
  {
    icon: Droplets,
    title: "Washing",
    description: "Professional machine washing with premium detergents.",
    features: ["Hot & Cold Water", "Multiple Cycles", "Fabric Care", "Premium Detergents"],
    price: "From QAR 20"
  },
  {
    icon: Gem,
    title: "Wedding Dress",
    description: "Specialized care for wedding gowns and formal wear.",
    features: ["Beading Care", "Fabric Preservation", "Expert Handling", "White Glove Service"],
    price: "From QAR 300"
  },
  {
    icon: Sofa,
    title: "Carpet Cleaning",
    description: "Deep cleaning for all types of carpets and rugs.",
    features: ["Deep Stain Removal", "Sanitization", "Quick Drying", "Stain Protection"],
    price: "From QAR 50"
  },
  {
    icon: Baby,
    title: "Curtains & Blinds",
    description: "Professional cleaning for curtains, blinds, and drapes.",
    features: ["Fabric Care", "Steam Cleaning", "Hardware Service", "Same Day Service"],
    price: "From QAR 40"
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Environmentally conscious cleaning options available.",
    features: ["Green Detergents", "Reduced Water Usage", "Carbon Neutral", "Safe for Babies"],
    price: "From QAR 30"
  },
  {
    icon: Truck,
    title: "Home Pickup & Delivery",
    description: "Free pickup and delivery service at your doorstep across Qatar.",
    features: ["Free Delivery", "Flexible Timing", "Same Day Pickup", "Real-time Tracking"],
    price: "Free"
  },
  {
    icon: Building2,
    title: "Hotel Laundry",
    description: "Professional laundry services for hotels with bulk capacity and quick turnaround.",
    features: ["Bulk Orders", "24/7 Service", "Commercial Grade", "Quality Guaranteed"],
    price: "Custom Pricing"
  },
  {
    icon: Briefcase,
    title: "Corporate Accounts",
    description: "Business accounts with monthly invoicing and dedicated account manager.",
    features: ["Monthly Invoicing", "Dedicated Manager", "Custom Solutions", "Priority Service"],
    price: "Contact Us"
  }
];

const LOCATIONS = [
  "Doha", "Al Sadd", "Al Rayyan", "Al Wakrah", "Al Wakrah",
  "Abu Hamour", "Al Dafna", "The Pearl", "Lusail", "Al Khor",
  "Airport", "Ras Abu Aboud", "Mamoura", "Mansoura", "Markhiya",
  "Al Mirqab", "Al Masmak", "Al Gharrafa", "Al Kheesa", "Al Duhail",
  "Umm Ghwalina", "Al Hitmi", "Al Najada", "Al Rumaila", "Al Bidda",
  "Al Daayen", "Al Shahaniya", "Al Sheehaniya", "Al Thakhira",
  "Al Kharrara", "Al Shamal", "Umm Salal", "Al Karaana",
  "Industrial Area", "Al Mahanda", "Al Muntazah", "Al Meshash",
  "Al Sail", "Al Khulaifat", "New Al Khulaifat", "Old Al Ghanim",
  "New Al Ghanim", "Al Asiri", "Al Doha Al Jadeeda", "Al Sawda",
  "Al Tarfa", "Al Murra", "Al Rufaa", "Al Nasiriya", "Al Aziziya",
  "Al Areesh", "Bu Sidra", "Al Sunaidi", "Al Naama", "Al Masyir",
  "Al Sailiya", "Al Aabid", "Al Khulaifat South", "Doha Airport",
  "Diplomatic Area", "West Bay", "Al Corniche", "Al Dafna",
  "Khalifa International", "Qatar University", "Education City",
  "Barwa City", "Barwa Al Baraha", "Madinat Khalifa North",
  "Madinat Khalifa South", "Al Meethgar", "Al Taeeb", "Jabal Thuaileb"
];

const TESTIMONIALS = [
  {
    name: "Ahmed Hassan",
    role: "Hotel Manager",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    text: "Al Rayes Laundry has been our trusted partner for 5 years. Their quality and reliability are unmatched in Qatar.",
    rating: 5,
    company: "Grand Hotel Doha"
  },
  {
    name: "Fatima Al-Mansour",
    role: "Business Owner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    text: "Excellent service! They handle our office uniforms with great care. The free pickup and delivery is very convenient.",
    rating: 5,
    company: "Al Mansour Trading"
  },
  {
    name: "Khalid Ibrahim",
    role: "Resident",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    text: "Best laundry in Qatar! My wife and I use their services weekly. The quality is consistently excellent.",
    rating: 5,
    company: "Al Daayen Resident"
  }
];

function generateFloatingOrbs(count: number) {
  return Array.from({ length: count }, () => ({
    width: `${Math.random() * 200 + 30}px`,
    height: `${Math.random() * 200 + 30}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 4 + 3}s`,
  }));
}

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState(THEMES[0]);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [showPriceList, setShowPriceList] = useState(false);
  const [floatingOrbs] = useState(() => generateFloatingOrbs(20));
  const [priceFilter, setPriceFilter] = useState("all");
  const [priceSearch, setPriceSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const heroImages = [
    "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop"
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1566015665328-27d6492a367f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581578731117-e04f1a4edc81?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556909212-d5b604d0c6d4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556909212-5fc2c4a7a754?w=600&h=400&fit=crop"
  ];

  const processImages = [
    "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=500&fit=crop"
  ];

  const teamImages = [
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=500&fit=crop",
    "https://images.unsplash.com/photo-1556909212-d5b604d0c6d4?w=600&h=500&fit=crop",
    "https://images.unsplash.com/photo-1581578731117-e04f1a4edc81?w=600&h=500&fit=crop",
    "https://images.unsplash.com/photo-1556909212-5fc2c4a7a754?w=600&h=500&fit=crop"
  ];

  // Set random theme and image on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
      const randomImage = Math.floor(Math.random() * heroImages.length);
      setTheme(randomTheme);
      setHeroImageIndex(randomImage);
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Rotate theme every 15 seconds
  useEffect(() => {
    const themeInterval = setInterval(() => {
      const currentIndex = THEMES.findIndex(t => t.id === theme.id);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      setTheme(THEMES[nextIndex]);
    }, 15000);
    return () => clearInterval(themeInterval);
  }, [theme]);

  // Rotate hero image every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (!mounted) return null;

  const isDark = theme.darkMode;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Dynamic Theme Styles */}
      <style jsx global>{`
        .theme-primary { color: ${theme.primary}; }
        .theme-bg { background: linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15); }
        .theme-gradient { background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}); }
        .theme-gradient-text {
          background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .theme-btn { 
          background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}); 
          color: white;
        }
        
        /* 3D Card Effects */
        .card-3d {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .card-3d-inner {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }
        .card-3d:hover .card-3d-inner {
          transform: rotateX(5deg) rotateY(-5deg) translateZ(20px);
        }
        
        /* 3D Button */
        .btn-3d {
          position: relative;
          transform: translateZ(0);
          transition: all 0.2s ease;
        }
        .btn-3d:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px ${theme.primary}40, 0 8px 10px ${theme.primary}20;
        }
        .btn-3d:active {
          transform: translateY(-1px);
          box-shadow: 0 5px 10px ${theme.primary}30;
        }
        
        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-20px) rotateX(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Glow Effect */
        .glow {
          box-shadow: 0 0 40px ${theme.primary}30, 0 0 80px ${theme.secondary}20;
        }
        
        /* 3D Section */
        .section-3d {
          transform-style: preserve-3d;
          position: relative;
        }
        .section-3d::before {
          content: '';
          position: absolute;
          inset: -50px;
          background: linear-gradient(135deg, ${theme.primary}10, ${theme.secondary}10);
          transform: translateZ(-50px);
          filter: blur(40px);
          border-radius: 50%;
          z-index: -1;
        }
        
        /* Layer Shadow */
        .layer-shadow {
          box-shadow: 
            0 1px 1px rgba(0,0,0,0.05),
            0 2px 2px rgba(0,0,0,0.05),
            0 4px 4px rgba(0,0,0,0.05),
            0 8px 8px rgba(0,0,0,0.05),
            0 16px 16px rgba(0,0,0,0.05);
        }
        
        .layer-shadow-hover:hover {
          box-shadow: 
            0 2px 2px rgba(0,0,0,0.05),
            0 4px 4px rgba(0,0,0,0.05),
            0 8px 8px rgba(0,0,0,0.05),
            0 16px 16px rgba(0,0,0,0.05),
            0 32px 32px rgba(0,0,0,0.05);
        }
        
        /* Shine Effect */
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .shine::after {
          content: '';
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shine 3s infinite;
        }
        
        /* Particle Animation */
        @keyframes particle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        /* Tilt Effect */
        .tilt {
          transition: transform 0.3s ease;
        }
        .tilt:hover {
          transform: perspective(1000px) rotateX(10deg) rotateY(-10deg) scale(1.02);
        }
        
        /* Gradient Border */
        .gradient-border {
          position: relative;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
          z-index: -1;
        }
        
        /* Neon Glow */
        .neon-glow {
          box-shadow: 0 0 20px ${theme.primary}40, 0 0 40px ${theme.primary}20;
        }
        
        /* Image Hover Zoom */
        .img-zoom {
          overflow: hidden;
        }
        .img-zoom img {
          transition: transform 0.5s ease;
        }
        .img-zoom:hover img {
          transform: scale(1.1);
        }
        
        /* Reveal on Scroll */
        .reveal-3d {
          opacity: 0;
          transform: translateY(50px) rotateX(10deg);
          transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal-3d.visible {
          opacity: 1;
          transform: translateY(0) rotateX(0);
        }
        
        /* Glow Border Hover */
        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.primary});
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-border:hover::before {
          opacity: 1;
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* Bounce In */
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        /* Flip Card */
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Navigation - White Left → Solid Theme Color Right Gradient (Background Only) */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-500"
        style={{ 
          background: `linear-gradient(90deg, #ffffff 0%, #ffffff 30%, ${theme.primary} 60%, ${theme.primary} 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderBottom: `3px solid ${theme.primary}`
        }}
      >
        <style>{`
          .nav-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 2s infinite;
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .nav-link {
            position: relative;
          }
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
            transition: all 0.3s ease;
            transform: translateX(-50%);
            border-radius: 2px;
          }
          .nav-link:hover::after {
            width: 80%;
          }
          .nav-glow {
            box-shadow: 0 4px 20px ${theme.primary}40, 0 0 40px ${theme.secondary}20;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Stunning Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              onDoubleClick={() => router.push("/login")}
            >
              <div className="relative">
                {/* Glow effect behind logo */}
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl opacity-50 transition-all duration-500 group-hover:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                />
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center relative z-10">
                  <img src="/arl-logo.png" alt="Al Rayes Laundry" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold whitespace-nowrap text-slate-900">
                  Al Rayes Laundry
                </h1>
                <p className="text-xs font-medium text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" style={{ color: theme.primary }} />
                  Your Traditional Laundry Pioneer
                </p>
              </div>
            </div>

            {/* Desktop Menu - Modern & Stunning */}
            <div className="hidden md:flex items-center gap-2">
              {['Home', 'Services', 'Pricing', 'Locations', 'About', 'Testimonials', 'Contact'].map((item, i) => (
                <button 
                  key={item}
                  onClick={() => item === 'Home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : scrollToSection(item.toLowerCase())}
                  className="nav-link px-3 py-2 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5 text-slate-900"
                >
                  {item}
                </button>
              ))}
              
              {/* Login Button - 3D Effect Always Visible */}
              <Button 
                onClick={() => router.push("/account")} 
                className="group relative ml-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  boxShadow: `0 6px 0 ${theme.primary}, 0 8px 20px ${theme.primary}40, 0 0 40px ${theme.secondary}30`,
                  transform: 'translateZ(0)'
                }}
              >
                <span className="flex items-center gap-2 relative z-10">
                  <span className="transition-transform group-hover:scale-110">🔐</span>
                  <span>Login</span>
                </span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 nav-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl"
                  style={{ background: `radial-gradient(circle at center, ${theme.accent}, transparent)` }}
                />
              </Button>
            </div>

            {/* Mobile Menu Button - Animated */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden p-2 rounded-xl transition-all duration-300 bg-slate-100"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 w-6 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? 'top-3 rotate-45' : 'top-1'}`} />
                <span className={`absolute left-0 top-3 w-6 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute left-0 w-6 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? 'top-3 -rotate-45' : 'top-5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Beautiful Slide Down */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 z-40 transition-all duration-300 shadow-2xl bg-white"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <div className="px-4 py-6 space-y-2">
              {['Home', 'Services', 'Pricing', 'Locations', 'About', 'Testimonials', 'Contact'].map((item, i) => (
                <button 
                  key={item}
                  onClick={() => { 
                    item === 'Home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : scrollToSection(item.toLowerCase()); 
                    setMenuOpen(false); 
                  }}
                  className="block w-full text-left py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 hover:translate-x-2 text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
                        color: theme.primary
                      }}
                    >
                      {i + 1}
                    </span>
                    {item}
                  </span>
                </button>
              ))}
              <div className="pt-4 mt-2 border-t border-slate-200">
                <Button 
                  onClick={() => { router.push("/account"); setMenuOpen(false); }} 
                  className="group w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    boxShadow: `0 4px 15px ${theme.primary}40`
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="transition-transform group-hover:scale-110">🔐</span>
                    <span>Login / Register</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Dynamic Background */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : theme.bgGradient}`}>
          {/* Floating Orbs */}
          {floatingOrbs.map((orb, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                width: orb.width,
                height: orb.height,
                left: orb.left,
                top: orb.top,
                background: i % 2 === 0 ? theme.primary : theme.secondary,
                animationDelay: orb.animationDelay,
                animationDuration: orb.animationDuration,
                filter: 'blur(60px)'
              }}
            />
          ))}
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg mb-4">
                <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                <span className="text-xs sm:text-sm font-medium text-slate-700">{theme.description}</span>
              </div>
              
              <h1 className={`text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} leading-tight mb-4`}>
                Your Traditional
                <br />
                <span className="theme-gradient-text">Laundry Pioneer</span>
                <br className="hidden sm:block" />in Qatar
              </h1>
              
              <p className={`text-base sm:text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-6 max-w-xl mx-auto lg:mx-0`}>
                More Time for What Matters — Leave the Laundry to Us.
                Professional laundry services with free pickup & delivery across 85+ locations in Qatar.
              </p>

              {/* Mobile Hero Image */}
              <div className="lg:hidden relative rounded-2xl overflow-hidden shadow-xl mb-6">
                <img 
                  key={heroImageIndex}
                  src={heroImages[heroImageIndex]}
                  alt="Laundry Service"
                  className="w-full h-48 sm:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 pt-6 border-t border-slate-200/30">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-gradient-text">85+</div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Branches</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-gradient-text">1 Million+</div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Happy Customers</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-gradient-text">46+</div>
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Years</div>
                </div>
              </div>

              {/* Big Bold Order Now Button - Strategic Placement */}
              <div className="mt-8 relative z-10 flex flex-col items-center">
                <OrderNowButton 
                  onClick={() => router.push("/account?intent=order")} 
                  theme={theme}
                />
                <div className={`mt-6 px-6 py-3 rounded-full text-base font-medium ${isDark ? 'bg-slate-800/80 text-slate-200' : 'bg-white/90 text-slate-700'} shadow-lg backdrop-blur-sm`} style={{ border: `1px solid ${theme.primary}30` }}>
                  🆓 Free pickup & delivery • 📍 85+ locations • 🎁 50% off first order!
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block card-3d">
              <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl layer-shadow card-3d-inner animate-float">
                <img 
                  key={heroImageIndex}
                  src={heroImages[heroImageIndex]}
                  alt="Laundry Service"
                  className="w-full h-full object-cover animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              
              {/* Floating Cards - Below image */}
              <div className="flex gap-4 mt-6 justify-center lg:justify-start">
                <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl theme-gradient flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">100% Quality</p>
                    <p className="text-xs text-slate-500">Guaranteed</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl theme-gradient flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Free Delivery</p>
                    <p className="text-xs text-slate-500">Locations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={() => scrollToSection("services")} className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>
      </section>

      {/* Discount Banner */}
      <section className="py-8 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0wIDBoNHY0SDBWMHptNCAwaDR2NEg0VjB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center md:text-left">
            <span className="text-2xl md:text-3xl font-bold text-white">🎉 New Customer Special!</span>
            <span className="text-white text-lg ml-2">Use code <strong className="bg-white px-2 py-1 rounded-lg" style={{ color: theme.primary }}>newarl50</strong> for 50% OFF your first order!</span>
          </div>
          <button 
            type="button"
            onClick={() => router.push("/account?intent=order")} 
            className="group px-8 py-4 rounded-xl font-bold text-xl text-white transition-all duration-300 hover:-translate-y-1"
            style={{
              background: `linear-gradient(180deg, ${theme.secondary} 0%, ${theme.primary} 100%)`,
              boxShadow: `0 6px 0 ${theme.primary}, 0 8px 20px ${theme.primary}50`,
            }}
          >
            <span className="flex items-center gap-3">
              <span className="transition-transform group-hover:scale-110">🎁</span>
              <span className="transition-all group-hover:text-yellow-200">ORDER NOW</span>
              <span className="transition-transform group-hover:scale-110">✨</span>
            </span>
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${theme.accent} 0%, transparent 100%)` }}
            />
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
            />
          </button>
        </div>
      </section>

      {/* Features/Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: "Quality over everything", desc: "We are committed to provide you with the quality you deserve." },
              { icon: Clock, title: "24/7 Customer Support", desc: "We are available around the clock to assist you with your inquiries." },
              { icon: MapPin, title: "Wide Range of Branches", desc: "Wide network of branches to assist you wherever you are in and around Qatar." }
            ].map((feature, i) => (
              <div key={i} className="card-3d text-center p-8 rounded-3xl bg-slate-50 layer-shadow hover:shadow-2xl transition-all">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl theme-gradient flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={`py-12 lg:py-24 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className={`text-2xl lg:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-4`}>Our Services</h2>
            <p className={`text-base lg:text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto`}>
              Comprehensive laundry solutions tailored to your needs across Qatar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {SERVICES.map((service, index) => (
              <div 
                key={index}
                className={`card-3d ${isDark ? 'bg-slate-700' : 'bg-white'} rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group layer-shadow`}
              >
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl theme-gradient flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className={`text-base lg:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1 lg:mb-2`}>{service.title}</h3>
                <p className={`text-xs lg:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2 lg:mb-4 line-clamp-2`}>{service.description}</p>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle className="w-4 h-4" style={{ color: theme.primary }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-bold" style={{ color: theme.primary }}>{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className={`text-2xl lg:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 lg:mb-4`}>Our Pricing</h2>
            <p className={`text-base lg:text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto`}>
              Transparent pricing - No hidden fees
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1 mb-6">
            {[
              { id: 'Gent & Ladies', name: 'Gent & Ladies', icon: Shirt, color: 'blue' },
              { id: 'Household', name: 'Household', icon: Sofa, color: 'green' },
              { id: 'Kids', name: 'Kids Wear', icon: Baby, color: 'purple' },
              { id: 'Others', name: 'Others', icon: Briefcase, color: 'orange' }
            ].map((category) => {
              const items = PRICE_LIST.filter(item => item.group === category.id && item.price > 0);
              const isExpanded = expandedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    isExpanded 
                      ? `${category.color === 'blue' ? 'bg-blue-500' : category.color === 'green' ? 'bg-green-500' : category.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'} text-white shadow-lg` 
                      : `${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} shadow-md hover:shadow-lg`
                  }`}
                  style={isExpanded ? {
                    transform: 'translateY(-2px)',
                    boxShadow: category.color === 'blue' ? '0 4px 0 #2563eb, 0 6px 12px rgba(37,99,235,0.3)' :
                               category.color === 'green' ? '0 4px 0 #16a34a, 0 6px 12px rgba(22,163,74,0.3)' :
                               category.color === 'purple' ? '0 4px 0 #9333ea, 0 6px 12px rgba(147,51,234,0.3)' :
                               '0 4px 0 #ea580c, 0 6px 12px rgba(234,88,12,0.3)'
                  } : {}}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className={`text-xs ${isExpanded ? 'text-white/80' : 'opacity-60'}`}>({items.length})</span>
                </button>
              );
            })}
          </div>

          {expandedCategory && (() => {
            const category = [
              { id: 'Gent & Ladies', name: 'Gent & Ladies', icon: Shirt, color: 'blue', headerBg: 'bg-blue-500', headerText: 'text-white', altRowBg: 'bg-blue-50', borderColor: 'border-blue-200' },
              { id: 'Household', name: 'Household', icon: Sofa, color: 'green', headerBg: 'bg-green-500', headerText: 'text-white', altRowBg: 'bg-green-50', borderColor: 'border-green-200' },
              { id: 'Kids', name: 'Kids Wear', icon: Baby, color: 'purple', headerBg: 'bg-purple-500', headerText: 'text-white', altRowBg: 'bg-purple-50', borderColor: 'border-purple-200' },
              { id: 'Others', name: 'Others', icon: Briefcase, color: 'orange', headerBg: 'bg-orange-500', headerText: 'text-white', altRowBg: 'bg-orange-50', borderColor: 'border-orange-200' }
            ].find(c => c.id === expandedCategory);
            const items = PRICE_LIST.filter(item => item.group === expandedCategory && item.price > 0).sort((a, b) => a.name.localeCompare(b.name) || a.price - b.price);
            
            const getPriceColor = (color: string) => {
              switch(color) {
                case 'blue': return 'text-blue-600';
                case 'green': return 'text-green-600';
                case 'purple': return 'text-purple-600';
                case 'orange': return 'text-orange-600';
                default: return 'text-emerald-600';
              }
            };
            
            return (
              <div className="w-fit mx-auto">
                <div className="p-2 overflow-x-auto">
                  <table className={`w-auto text-xs mx-auto border ${isDark ? 'border-slate-500' : `border-${category?.color}-200`}`}>
                    <thead>
                      <tr>
                        <th className={`text-left px-3 py-2 font-semibold ${category?.headerBg} ${category?.headerText}`}>Item</th>
                        <th className={`text-center px-3 py-2 font-semibold ${category?.headerBg} ${category?.headerText} border-l border-white/20`}>Service</th>
                        <th className={`text-right px-3 py-2 font-semibold ${category?.headerBg} ${category?.headerText} border-l border-white/20`}>QAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : category?.altRowBg} border-b ${isDark ? 'border-slate-200' : `border-${category?.color}-100`}`}>
                          <td className={`px-3 py-2 font-medium text-slate-800 text-left`}>{item.name}</td>
                          <td className={`px-3 py-2 text-slate-500 text-center border-l ${isDark ? 'border-slate-200' : `border-${category?.color}-100`}`}>{item.serviceType}</td>
                          <td className={`px-3 py-2 text-right font-bold border-l ${isDark ? 'border-slate-200' : `border-${category?.color}-100`}`} style={{ color: category?.color === 'blue' ? '#2563eb' : category?.color === 'green' ? '#16a34a' : category?.color === 'purple' ? '#9333ea' : '#ea580c' }}>{item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          <div className="text-center mt-8">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>* Prices may vary based on material and complexity. Contact us for exact quotes.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 lg:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -top-4 -left-4 w-32 lg:w-72 h-32 lg:h-72 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-20 blur-2xl lg:blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 lg:w-72 h-32 lg:h-72 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full opacity-20 blur-2xl lg:blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className={`aspect-video rounded-2xl lg:rounded-3xl theme-gradient p-1.5 lg:p-2 relative z-10`}>
                <div className="w-full h-full bg-slate-100 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=600&fit=crop"
                    alt="Our Facility"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-white rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 z-20">
                <div className="flex items-center gap-3 lg:gap-4">
                  <Award className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: theme.primary }} />
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold" style={{ color: theme.primary }}>46+</p>
                    <p className="text-xs lg:text-sm text-slate-500">Years</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 lg:-top-6 lg:-left-6 bg-white rounded-xl lg:rounded-2xl shadow-xl p-3 lg:p-4 z-20 hidden lg:block">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl theme-gradient flex items-center justify-center">
                    <Star className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-base lg:text-lg font-bold text-slate-800">4.9/5</p>
                    <p className="text-xs text-slate-500">Rating</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-4 lg:mb-6">
                Your Trusted Laundry Partner in Qatar
              </h2>
              <p className="text-base lg:text-lg text-slate-600 mb-4 lg:mb-6">
                At Al Rayes Laundry, we strive to give you the best! With over 46 years of experience, we have been delivering exceptional laundry services to homes, hotels, and businesses across Qatar.
              </p>
              <p className="text-base lg:text-lg text-slate-600 mb-6 lg:mb-8">
                More Time for What Matters — Leave the Laundry to Us.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Clock, label: "24/7 Support", value: "Always Available" },
                  { icon: Award, label: "Quality Certified", value: "ISO 9001" },
                  { icon: Truck, label: "Free Pickup", value: "Locations" },
                  { icon: Star, label: "Best Rates", value: "In Qatar" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl theme-gradient flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className={`py-24 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Locations Across Qatar</h2>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Visit us at any of our branches near you
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {LOCATIONS.map((location, i) => (
              <span 
                key={i} 
                className={`px-6 py-3 rounded-full font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700'} shadow-md`}
              >
                {location}
              </span>
            ))}
          </div>

          <p className="text-center mt-8 text-slate-500">
            And many more locations across Doha and Qatar...
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Our Gallery</h2>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Take a peek at our state-of-the-art facilities</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <div 
                key={i} 
                className={`card-3d relative group overflow-hidden rounded-2xl ${i === 0 || i === 5 ? 'md:row-span-2' : ''}`}
              >
                <img 
                  src={img} 
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-medium">Premium Laundry Care</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-white/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-slate-600">Trusted by thousands of families and businesses</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="card-3d bg-slate-50 rounded-3xl p-8 border border-slate-100 layer-shadow hover:shadow-2xl transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-24 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Get In Touch</h2>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ready to experience the best laundry service?</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Phone, title: "Call Us", value: "+974 4466 1924", color: "blue" },
              { icon: Mail, title: "Email Us", value: "info@alrayeslaundry.com", color: "purple" },
              { icon: MapPin, title: "Visit Us", value: "PO Box 3312, Doha, Qatar", color: "green" },
              { icon: MessageCircle, title: "WhatsApp", value: "+974 5012 7027", color: "green" }
            ].map((item, index) => (
              <div key={index} className={`card-3d ${isDark ? 'bg-slate-700' : 'bg-white'} rounded-3xl p-6 text-center shadow-lg layer-shadow hover:shadow-2xl transition-all`}>
                <div className="w-14 h-14 mx-auto rounded-2xl theme-gradient flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>{item.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white">
                  <img src="/arl-logo.png" alt="Al Rayes Laundry" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-white">Al Rayes Laundry</h3>
              </div>
              <p className="text-slate-400 mb-4">Your Traditional Laundry Pioneer in Qatar since 2009.</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-theme-primary transition-colors cursor-pointer">
                  <span className="text-white text-sm">FB</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-theme-primary transition-colors cursor-pointer">
                  <span className="text-white text-sm">IG</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-theme-primary transition-colors cursor-pointer">
                  <span className="text-white text-sm">WA</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Our Services</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer">Dry Cleaning</li>
                <li className="hover:text-white cursor-pointer">Press &apos;N&apos; Fold</li>
                <li className="hover:text-white cursor-pointer">Shoe Cleaning</li>
                <li className="hover:text-white cursor-pointer">Washing</li>
                <li className="hover:text-white cursor-pointer">Carpet Cleaning</li>
                <li className="hover:text-white cursor-pointer">Wedding Dress</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">FAQ</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
                <li className="hover:text-white cursor-pointer">Delivery & Return Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact Us</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>PO Box 3312, Doha, Qatar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+974 33969659</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@alrayeslaundry.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Service</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>© Copyright 2026 Al Rayes Laundry. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Full Price List Modal */}
      {showPriceList && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setShowPriceList(false)} />
          <div className="fixed inset-4 md:inset-12 bg-white rounded-xl shadow-2xl z-[60] overflow-hidden flex flex-col w-auto max-w-3xl mx-auto my-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Full Price List</h2>
                  <p className="text-white/80 text-xs">All services pricing</p>
                </div>
              </div>
              <button onClick={() => setShowPriceList(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-2 border-b bg-slate-50">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Search..."
                  value={priceSearch}
                  onChange={(e) => setPriceSearch(e.target.value)}
                  className="max-w-[150px] h-8 text-xs"
                />
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg border bg-white text-xs h-8"
                >
                  <option value="all">All</option>
                  <option value="Gent & Ladies">Gent & Ladies</option>
                  <option value="Household">Household</option>
                  <option value="Kids">Kids</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className={`w-auto text-xs mx-auto border ${isDark ? 'border-slate-500' : 'border-slate-300'}`}>
                <thead>
                  <tr>
                    <th className={`text-left px-3 py-2 font-semibold ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-slate-100 text-slate-700'} border-b ${isDark ? 'border-slate-500' : 'border-slate-300'}`}>Item</th>
                    <th className={`text-center px-3 py-2 font-semibold ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-slate-100 text-slate-700'} border-b ${isDark ? 'border-slate-500' : 'border-slate-300'} border-l ${isDark ? 'border-slate-500' : 'border-slate-300'}`}>Category</th>
                    <th className={`text-center px-3 py-2 font-semibold ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-slate-100 text-slate-700'} border-b ${isDark ? 'border-slate-500' : 'border-slate-300'} border-l ${isDark ? 'border-slate-500' : 'border-slate-300'}`}>Service</th>
                    <th className={`text-right px-3 py-2 font-semibold ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-slate-100 text-slate-700'} border-b ${isDark ? 'border-slate-500' : 'border-slate-300'} border-l ${isDark ? 'border-slate-500' : 'border-slate-300'}`}>QAR</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_LIST.filter(item => item.price > 0).sort((a, b) => a.name.localeCompare(b.name) || a.price - b.price).map((item, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50'} border-b border-slate-200`}>
                      <td className="px-3 py-2 font-medium text-slate-800 text-left">{item.name}</td>
                      <td className="px-3 py-2 text-center border-l border-slate-200">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.group === 'Gent & Ladies' ? 'bg-blue-100 text-blue-700' :
                          item.group === 'Household' ? 'bg-green-100 text-green-700' :
                          item.group === 'Kids' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>{item.group}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 text-center border-l border-slate-200">{item.serviceType}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-600 border-l border-slate-200">{item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-2 bg-slate-50 text-center text-xs text-slate-500">
              Showing {PRICE_LIST.filter(item => item.price > 0).length} items
            </div>
          </div>
        </>
      )}
    </div>
  );
}
