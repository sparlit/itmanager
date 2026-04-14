"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "ar" | "fr" | "es" | "de" | "zh" | "hi" | "ur";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    "welcome": "Welcome",
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit",
    "close": "Close",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No",
    "search": "Search",
    "filter": "Filter",
    "clear": "Clear",
    "edit": "Edit",
    "delete": "Delete",
    "add": "Add",
    "back": "Back",
    "next": "Next",
    "done": "Done",
    "error": "Error",
    "success": "Success",
    "warning": "Warning",
    "info": "Info",

    // Navigation
    "home": "Home",
    "services": "Services",
    "pricing": "Pricing",
    "locations": "Locations",
    "about": "About",
    "contact": "Contact",
    "login": "Login",
    "register": "Register",
    "logout": "Logout",

    // Chat
    "halo_talk_to_me": "Halo! Talk to me",
    "click_to_chat": "Click to chat",
    "type_message": "Type your message...",
    "menu": "Menu",
    "ai_assistant": "AI Assistant",
    "new_registration": "New Registration",
    "track_order": "Track My Order",
    "change_address": "Change Address",
    "update_contact": "Update Contact",
    "register_complaint": "Register Complaint",
    "give_feedback": "Give Feedback",
    "request_callback": "Request Call Back",
    "need_assistance": "Need Assistance",
    "business_inquiry": "Business Inquiry",

    // Customer Registration
    "customer_registration": "Customer Registration",
    "first_name": "First Name",
    "last_name": "Last Name",
    "mobile_number": "Mobile Number",
    "whatsapp": "WhatsApp",
    "email": "Email Address",
    "landline": "Landline",
    "area": "Area",
    "building": "Building/Villa No.",
    "villa_no": "Villa/Apartment No.",
    "landmark": "Nearest Landmark",
    "full_address": "Full Address",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "notes": "Additional Notes",
    "pickup_location": "Pickup Location on Map",
    "use_my_location": "Use My Location",
    "pick_on_map": "Pick on Map",
    "register_continue": "Register & Continue",

    // Landing Page
    "order_now": "Order Now",
    "free_pickup": "Free pickup & delivery",
    "locations_count": "85+ locations",
    "discount_first_order": "50% off first order!",
    "new_customer_special": "New Customer Special!",
    "use_code": "Use code",
    "for_off": "for",
    "our_services": "Our Services",
    "our_pricing": "Our Pricing",
    "happy_customers": "Happy Customers",
    "years_experience": "Years",

    // Services
    "press_fold": "Press 'N' Fold",
    "dry_cleaning": "Dry Cleaning",
    "household": "Household",
    "kids_wear": "Kids Wear",
    "shoe_cleaning": "Shoe Cleaning",
    "carpet_cleaning": "Carpet Cleaning",
    "wedding_dress": "Wedding Dress",

    // Order
    "place_order": "Place Order",
    "order_details": "Order Details",
    "pickup_date": "Pickup Date",
    "pickup_time": "Pickup Time",
    "delivery_address": "Delivery Address",
    "special_instructions": "Special Instructions",
    "total_amount": "Total Amount",
    "confirm_order": "Confirm Order",
    "order_placed": "Order Placed Successfully!",

    // Contact Info
    "call_us": "Call Us",
    "email_us": "Email Us",
    "visit_us": "Visit Us",
    "whatsapp_us": "WhatsApp",
  },
  ar: {
    // General
    "welcome": "مرحباً",
    "loading": "جاري التحميل...",
    "save": "حفظ",
    "cancel": "إلغاء",
    "submit": "إرسال",
    "close": "إغلاق",
    "confirm": "تأكيد",
    "yes": "نعم",
    "no": "لا",
    "search": "بحث",
    "filter": "تصفية",
    "clear": "مسح",
    "edit": "تعديل",
    "delete": "حذف",
    "add": "إضافة",
    "back": "رجوع",
    "next": "التالي",
    "done": "تم",
    "error": "خطأ",
    "success": "نجاح",
    "warning": "تحذير",
    "info": "معلومات",

    // Navigation
    "home": "الرئيسية",
    "services": "الخدمات",
    "pricing": "الأسعار",
    "locations": "الفروع",
    "about": "من نحن",
    "contact": "اتصل بنا",
    "login": "تسجيل الدخول",
    "register": "تسجيل",
    "logout": "تسجيل الخروج",

    // Chat
    "halo_talk_to_me": "مرحبا! تحدث معي",
    "click_to_chat": "انقر للدردشة",
    "type_message": "اكتب رسالتك...",
    "menu": "القائمة",
    "ai_assistant": "المساعد الذكي",
    "new_registration": "تسجيل جديد",
    "track_order": "تتبع طلبي",
    "change_address": "تغيير العنوان",
    "update_contact": "تحديث الاتصال",
    "register_complaint": "تسجيل شكوى",
    "give_feedback": "إعطاء تقييم",
    "request_callback": "طلب اتصال",
    "need_assistance": "تحتاج مساعدة",
    "business_inquiry": "استفسار تجاري",

    // Customer Registration
    "customer_registration": "تسجيل العميل",
    "first_name": "الاسم الأول",
    "last_name": "اسم العائلة",
    "mobile_number": "رقم الهاتف",
    "whatsapp": "واتساب",
    "email": "البريد الإلكتروني",
    "landline": "الهاتف الأرضي",
    "area": "المنطقة",
    "building": "رقم المبنى/الفيلا",
    "villa_no": "رقم الشقة/الفيلا",
    "landmark": "أقرب معلم",
    "full_address": "العنوان الكامل",
    "latitude": "خط العرض",
    "longitude": "خط الطول",
    "notes": "ملاحظات إضافية",
    "pickup_location": "موقع الاستلام على الخريطة",
    "use_my_location": "استخدم موقعي",
    "pick_on_map": "اختر على الخريطة",
    "register_continue": "تسجيل ومتابعة",

    // Landing Page
    "order_now": "اطلب الآن",
    "free_pickup": "استلام والتوصيل مجاني",
    "locations_count": "+85 فرع",
    "discount_first_order": "خصم 50% على الطلب الأول!",
    "new_customer_special": "عرض العميل الجديد!",
    "use_code": "استخدم الكود",
    "for_off": "لخصم",
    "our_services": "خدماتنا",
    "our_pricing": "أسعارنا",
    "happy_customers": "عملاء سعيدون",
    "years_experience": "سنوات خبرة",

    // Services
    "press_fold": "كوي وطي",
    "dry_cleaning": "تنظيف جاف",
    "household": "منتجات منزلية",
    "kids_wear": "ملابس أطفال",
    "shoe_cleaning": "تنظيف أحذية",
    "carpet_cleaning": "تنظيف سجاد",
    "wedding_dress": "فسفاف",

    // Order
    "place_order": "تقديم الطلب",
    "order_details": "تفاصيل الطلب",
    "pickup_date": "تاريخ الاستلام",
    "pickup_time": "وقت الاستلام",
    "delivery_address": "عنوان التوصيل",
    "special_instructions": "تعليمات خاصة",
    "total_amount": "المبلغ الإجمالي",
    "confirm_order": "تأكيد الطلب",
    "order_placed": "تم تقديم الطلب بنجاح!",

    // Contact Info
    "call_us": "اتصل بنا",
    "email_us": "راسلنا",
    "visit_us": "زورنا",
    "whatsapp_us": "واتساب",
  },
  fr: {
    "welcome": "Bienvenue",
    "loading": "Chargement...",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "submit": "Soumettre",
    "close": "Fermer",
    "confirm": "Confirmer",
    "yes": "Oui",
    "no": "Non",
    "order_now": "Commander",
    "services": "Services",
    "pricing": "Tarifs",
    "locations": "Emplacements",
    "contact": "Contact",
    "menu": "Menu",
    "type_message": "Tapez votre message...",
  },
  es: {
    "welcome": "Bienvenido",
    "loading": "Cargando...",
    "save": "Guardar",
    "cancel": "Cancelar",
    "submit": "Enviar",
    "close": "Cerrar",
    "confirm": "Confirmar",
    "yes": "Sí",
    "no": "No",
    "order_now": "Pedir ahora",
    "services": "Servicios",
    "pricing": "Precios",
    "locations": "Ubicaciones",
    "contact": "Contacto",
    "menu": "Menú",
    "type_message": "Escribe tu mensaje...",
  },
  de: {
    "welcome": "Willkommen",
    "loading": "Laden...",
    "save": "Speichern",
    "cancel": "Abbrechen",
    "submit": "Absenden",
    "close": "Schließen",
    "confirm": "Bestätigen",
    "yes": "Ja",
    "no": "Nein",
    "order_now": "Jetzt bestellen",
    "services": "Dienstleistungen",
    "pricing": "Preise",
    "locations": "Standorte",
    "contact": "Kontakt",
    "menu": "Menü",
    "type_message": "Nachricht eingeben...",
  },
  zh: {
    "welcome": "欢迎",
    "loading": "加载中...",
    "save": "保存",
    "cancel": "取消",
    "submit": "提交",
    "close": "关闭",
    "confirm": "确认",
    "yes": "是",
    "no": "否",
    "order_now": "立即下单",
    "services": "服务",
    "pricing": "价格",
    "locations": "位置",
    "contact": "联系",
    "menu": "菜单",
    "type_message": "输入消息...",
  },
  hi: {
    "welcome": "स्वागत है",
    "loading": "लोड हो रहा है...",
    "save": "सहेजें",
    "cancel": "रद्द करें",
    "submit": "जमा करें",
    "close": "बंद करें",
    "confirm": "पुष्टि करें",
    "yes": "हाँ",
    "no": "नहीं",
    "order_now": "ऑर्डर करें",
    "services": "सेवाएं",
    "pricing": "कीमत",
    "locations": "स्थान",
    "contact": "संपर्क",
    "menu": "मेन्यू",
    "type_message": "संदेश लिखें...",
  },
  ur: {
    "welcome": "خوش آمدید",
    "loading": "لوڈ ہو رہا ہے...",
    "save": "محفوظ کریں",
    "cancel": "منسوخ کریں",
    "submit": "جمع کریں",
    "close": "بند کریں",
    "confirm": "تصدیق کریں",
    "yes": "ہاں",
    "no": "نہیں",
    "order_now": "آرڈر کریں",
    "services": "خدمات",
    "pricing": "قیمتیں",
    "locations": "مقام",
    "contact": "رابطہ",
    "menu": "مینو",
    "type_message": "پیام لکھیں...",
  }
};

const languageNames: Record<Language, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  zh: "中文",
  hi: "हिन्दी",
  ur: "اردو"
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const saved = localStorage.getItem("language") as Language | null;
    return saved && translations[saved] ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export { languageNames };

export default LanguageContext;
