"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minimize2, Maximize2, User, Bot, Phone, MapPin, Package, HeadphonesIcon, MessageCircle, Star, Briefcase, HelpCircle, PhoneCall, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isFromSupport: boolean;
  isMenu?: boolean;
  menuOptions?: MenuOption[];
  isAI?: boolean;
  quickReplies?: string[];
}

interface MenuOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

type ChatFlow = 
  | "main"
  | "ai_assist"
  | "registration"
  | "registration_name"
  | "registration_mobile"
  | "registration_email"
  | "registration_area"
  | "registration_address"
  | "registration_confirm"
  | "track_order"
  | "track_order_id"
  | "change_address"
  | "change_address_select"
  | "change_address_new"
  | "change_contact"
  | "change_contact_field"
  | "change_contact_value"
  | "complaint"
  | "complaint_type"
  | "complaint_details"
  | "feedback"
  | "feedback_rating"
  | "feedback_comment"
  | "business"
  | "business_details"
  | "contact_support"
  | "call_back"
  | "call_back_confirm"
  | "faq"
  | "services_info"
  | "pricing_info"
  | "general";

interface ChatData {
  name?: string;
  mobile?: string;
  email?: string;
  area?: string;
  address?: string;
  orderId?: string;
  complaintType?: string;
  complaintDetails?: string;
  rating?: number;
  feedbackComment?: string;
  businessDetails?: string;
  changeField?: string;
  newValue?: string;
  preferredTime?: string;
}

const MAIN_MENU: MenuOption[] = [
  { id: "ai", label: "AI Assistant", icon: <Bot className="w-5 h-5" />, description: "Ask anything - I'm here to help!" },
  { id: "register", label: "New Registration", icon: <User className="w-5 h-5" />, description: "Register as a new customer" },
  { id: "track", label: "Track My Order", icon: <Package className="w-5 h-5" />, description: "Check your order status" },
  { id: "change_address", label: "Change Address", icon: <MapPin className="w-5 h-5" />, description: "Update pickup/delivery location" },
  { id: "change_contact", label: "Update Contact", icon: <Phone className="w-5 h-5" />, description: "Change phone or email" },
  { id: "complaint", label: "Register Complaint", icon: <MessageCircle className="w-5 h-5" />, description: "File a complaint" },
  { id: "feedback", label: "Give Feedback", icon: <Star className="w-5 h-5" />, description: "Rate our service" },
  { id: "callback", label: "Request Call Back", icon: <PhoneCall className="w-5 h-5" />, description: "Request a call from our team" },
  { id: "help", label: "Need Assistance", icon: <HelpCircle className="w-5 h-5" />, description: "Get help from customer service" },
  { id: "business", label: "Business Inquiry", icon: <Briefcase className="w-5 h-5" />, description: "Partnership opportunities" },
];

interface FAQAnswer {
  response: string;
  quickReplies?: string[];
}

const FAQ_ANSWERS: Record<string, FAQAnswer> = {
  "hours": {
    response: "🕐 **Operating Hours:**\n\n• Saturday - Thursday: 7:00 AM - 10:00 PM\n• Friday: 2:00 PM - 10:00 PM\n\nWe also offer 24/7 online booking and WhatsApp ordering!",
    quickReplies: ["Services", "Pricing", "Contact"]
  },
  "delivery": {
    response: "🚚 **Delivery Information:**\n\n• Free pickup & delivery for orders above QAR 50\n• Delivery within 24-48 hours\n• Real-time tracking available\n• 85+ locations across Qatar\n\nUse code **NEWARL50** for 50% off your first order!",
    quickReplies: ["Track Order", "Pricing", "Register"]
  },
  "pricing": {
    response: "💰 **Our Pricing:**\n\n• Press & Fold: QAR 8-15 per item\n• Dry Cleaning: QAR 35-55 per item\n• Household: QAR 5-25 per item\n• Kids wear: QAR 5-10 per item\n\n**50% OFF** first order with code NEWARL50!",
    quickReplies: ["Services", "Order Now", "Locations"]
  },
  "services": {
    response: "🧹 **Our Services:**\n\n• **Press 'N' Fold** - Professional ironing & folding\n• **Dry Cleaning** - Expert care for delicate fabrics\n• **Household** - Bedsheets, towels, curtains\n• **Kids Wear** - Gentle care for children's clothes\n• **Shoe Cleaning** - Professional shoe care\n• **Carpets & Rugs** - Deep cleaning services\n\nAll services available with free pickup & delivery!",
    quickReplies: ["Order Now", "Pricing", "Track Order"]
  },
  "locations": {
    response: "📍 **85+ Locations Across Qatar:**\n\n• Doha - All major areas\n• Al Sadd, West Bay, The Pearl\n• Lusail, Al Khor, Al Wakrah\n• And many more...\n\nUse our map on the website or call us to find your nearest location!",
    quickReplies: ["Track Order", "Contact", "Services"]
  },
  "contact": {
    response: "📞 **Contact Us:**\n\n• **Phone:** +974 4466 1924\n• **WhatsApp:** +974 5555 5555\n• **Email:** info@alrayeslaundry.com\n• **Telegram:** @al_rayes_laundry\n\nWe're here to help 24/7!",
    quickReplies: ["Request Call Back", "Complaint", "Feedback"]
  },
  "cancel": {
    response: "❌ **Cancellation Policy:**\n\n• Orders can be cancelled within 2 hours of placement\n• Contact us via WhatsApp or call to cancel\n• Refunds processed within 3-5 business days\n\nFor urgent cancellations, please call us immediately!",
    quickReplies: ["Track Order", "Contact", "Help"]
  },
  "refund": {
    response: "💵 **Refund Policy:**\n\n• Full refund for cancelled orders\n• Partial refund for service issues\n• Refunds processed within 3-5 business days\n• Contact customer service for refund status\n\nYour satisfaction is our priority!",
    quickReplies: ["Complaint", "Contact", "Track Order"]
  }
};

function getAIResponse(message: string, flow: ChatFlow): { response: string; quickReplies?: string[] } {
  const lowerMessage = message.toLowerCase().trim();
  
  // Casual chat - respond naturally like a human agent
  const casualWords = ["how are you", "whats up", "wassup", "sup", "howdy", "yo"];
  if (casualWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Hey! I'm doing great, thanks for asking! 😊 How can I help you today?",
      quickReplies: ["I want to order", "Have a question", "Just browsing"]
    };
  }

  const greetingWords = ["hi", "hello", "hey", "halo", "hallo", "salam", "namaste", "good morning", "good afternoon", "good evening", "greetings", "salam alaikum"];
  if (greetingWords.some(word => lowerMessage === word || lowerMessage.startsWith(word))) {
    return {
      response: "Hi there! 👋 So nice to hear from you! What can I help you with today? Whether you want to place an order, ask about our services, or just have a question - I'm here for you!",
      quickReplies: ["I'd like to place an order", "Tell me about your services", "Just checking something"]
    };
  }

  const askHowCanWords = ["what can you do", "help me", "what can i ask", "what do you help with"];
  if (askHowCanWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Great question! I'm here to help with pretty much anything:\n\n🧺 Placing orders for laundry & dry cleaning\n💰 Getting price info\n🚚 Tracking your deliveries\n📍 Finding the nearest branch\n❓ Answering any questions\n💬 Or just chatting if you need directions!\n\nSo what do you need? 😊",
      quickReplies: ["Place an order", "Get pricing", "Track my order"]
    };
  }

  const howMuchWords = ["how much", "how much does", "price", "cost", "charges", "rates", "fees", "money", "qar"];
  if (howMuchWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Sure thing! Our prices are pretty competitive:\n\n👕 Press & Fold: QAR 8-15 per item\n🧥 Dry Cleaning: QAR 35-55\n🏠 Household items: QAR 5-25\n👶 Kids wear: QAR 5-10\n\nAnd hey - new customers get 50% off with code NEWARL50! 🎉 Want me to help you place an order?",
      quickReplies: ["Yes, I want to order", "Tell me more", "Where are you located"]
    };
  }

  const serviceWords = ["service", "services", "offer", "do you do", "what do you clean", "laundry", "dry clean"];
  if (serviceWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Oh we've got you covered! 😄 Here's what we do:\n\n✅ Press 'N' Fold - wrinkles be gone!\n✅ Dry Cleaning - for those special pieces\n✅ Household - sheets, towels, curtains\n✅ Kids Wear - super gentle for little ones\n✅ Shoe Cleaning - yes please!\n✅ Carpets & Rugs - deep clean magic\n\nAnd the best part? We pick up and deliver for free! 🚚✨",
      quickReplies: ["I want to order now", "How much for dry cleaning?", "Do you deliver?"]
    };
  }

  const hoursWords = ["hours", "open", "close", "time", "timing", "available", "work"];
  if (hoursWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Good question! We're open:\n\n📅 Saturday - Thursday: 7AM to 10PM\n📅 Friday: 2PM to 10PM\n\nBut here's the cool part - you can book online 24/7! 🌙 And our WhatsApp ordering never sleeps either. So whenever you need us, we're here!",
      quickReplies: ["Perfect, thanks!", "Can I order now?", "What's your location?"]
    };
  }

  const locationWords = ["location", "branch", "address", "where", "near", "closest", "find you", "directions"];
  if (locationWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "We're everywhere in Qatar! 😎 We've got 85+ branches across Doha and beyond - Al Sadd, West Bay, The Pearl, Lusail, Al Khor, Al Wakrah... you name it!\n\nJust tell me which area you're in and I can point you to the closest one! Or just go to our website to see the full list 📍",
      quickReplies: ["I'm in Al Sadd", "Show me all locations", "I want to order"]
    };
  }

  const contactWords = ["contact", "phone", "call", "whatsapp", "email", "reach", "talk to someone"];
  if (contactWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Of course! Here's how you can reach us:\n\n📞 Phone: +974 4466 1924\n💬 WhatsApp: +974 5012 7027\n📧 Email: info@alrayeslaundry.com\n\nOr just chat with me here - I'm available 24/7! 😊 What would you prefer?",
      quickReplies: ["Let me order online", "I'll WhatsApp you", "I have a question"]
    };
  }

  const deliveryWords = ["delivery", "pickup", "deliver", "collect", "drop off", "home service", "come to"];
  if (deliveryWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Yes please! 🚚 We offer FREE pickup & delivery for orders over QAR 50. We'll come to your place, pick up your laundry, clean it up, and bring it back!\n\nUsually takes 24-48 hours. Want me to help you schedule a pickup?",
      quickReplies: ["Yes please!", "How much is minimum?", "What do you clean?"]
    };
  }

  const orderWords = ["order", "place order", "book", "book now", "want to order", "need laundry", "laundry service"];
  if (orderWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Awesome! Let me get you sorted! 🎉\n\nJust click the 'Order Now' button on our website or tell me what you need:\n\n• What items do you have?\n• What service do you need (wash, dry clean, press)?\n• When do you need it done?\n\nI'll guide you through the rest! 😊",
      quickReplies: ["Let me order now", "What do you charge?", "I want dry cleaning"]
    };
  }

  const trackWords = ["track", "status", "where is", "my order", "delivery status", "when", "arriving"];
  if (trackWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "I can totally help you track that! 📦\n\nCould you share your order number or the phone number you used when placing the order? I'll check the status right away and let you know what's happening!",
      quickReplies: ["Let me find my order", "I don't have an order number", "Actually I want to order"]
    };
  }

  const complaintWords = ["complaint", "problem", "issue", "wrong", "not happy", "disappointed", "bad", "terrible"];
  if (complaintWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Oh no, I'm so sorry to hear that! 😟 Honestly, that really upsets me to hear. Let me make this right for you.\n\nCan you tell me what happened? I'll log a complaint right away and our supervisor will personally look into it and call you to sort it out. We really value your feedback and want to fix this! 💪",
      quickReplies: ["Here's what happened...", "I prefer to call", "Can you help me order?"]
    };
  }

  const feedbackWords = ["feedback", "review", "rate", "rating", "suggestion", "opinion"];
  if (feedbackWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Wow, you want to give us feedback? That's so kind of you! 💕\n\nWe're always trying to get better, so honest feedback really helps! You can rate us 1-5 stars and add any comments. Our team reads every single one!\n\nOr if you'd rather just tell me directly - I'm all ears! 😊",
      quickReplies: ["I'd love to rate you", "Sure, here's what I think", "Actually I need help"]
    };
  }

  const thankWords = ["thanks", "thank you", "thx", "tq", "appreciate", "great", "awesome", "cool", "nice"];
  if (thankWords.some(word => lowerMessage === word || lowerMessage.startsWith(word + " ") || lowerMessage.includes(word))) {
    return {
      response: "Aww you're so sweet! 😊 That's what we're here for! Is there anything else I can help you with today?",
      quickReplies: ["Yes actually...", "No that's all, thanks!", "Can I ask one more thing?"]
    };
  }

  const yesWords = ["yes", "yeah", "yep", "sure", "okay", "ok", "please", "go ahead"];
  if (yesWords.some(word => lowerMessage === word || lowerMessage.startsWith(word))) {
    return {
      response: "Great! 🎉 What would you like help with?",
      quickReplies: ["I want to order", "Tell me about pricing", "Find nearest branch"]
    };
  }

  const noWords = ["no", "nope", "not now", "nothing", "that's all", "that's it"];
  if (noWords.some(word => lowerMessage === word || lowerMessage.includes(word))) {
    return {
      response: "No problem at all! 😊 Thanks for chatting with us today! Don't forget - 50% off your first order with code NEWARL50! 🎁 Feel free to reach out anytime. Have a wonderful day! ✨",
      quickReplies: ["Thanks!", "I'll order now", "See you soon!"]
    };
  }

  const byeWords = ["bye", "goodbye", "see you", "talk later", "cya", "take care"];
  if (byeWords.some(word => lowerMessage.includes(word))) {
    return {
      response: "Bye for now! 👋 It was lovely chatting with you! Remember we're here 24/7 if you need anything. Take care and have a wonderful day! 🌟",
      quickReplies: ["Bye!", "I'll be back!", "Thanks!"]
    };
  }

  // Default natural human response
  return {
    response: "Hmm, let me think... 🤔\n\nI'm not 100% sure what you mean, but that's okay! I can help you with:\n\n🧺 Placing an order\n💰 Getting prices\n🚚 Tracking deliveries\n📍 Finding our branches\n❓ Pretty much anything else!\n\nWhat would you like to do? 😊",
    quickReplies: ["I want to order", "Tell me prices", "Find a branch", "Something else"]
  };
}

export function ChatSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [flow, setFlow] = useState<ChatFlow>("main");
  const [chatData, setChatData] = useState<ChatData>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const showGreeting = () => {
    const greeting = getTimeBasedGreeting();
    
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      content: `${greeting}! Welcome to Al Rayes Laundry 🌟\n\nHow can I help you today?`,
      timestamp: new Date(),
      isFromSupport: true,
      isMenu: true,
      menuOptions: MAIN_MENU,
    };
    
    setMessages((prev) => [...prev, welcomeMessage]);
    setFlow("main");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = () => {
    showGreetingAndMenu();
  };

  const handlePlaceOrder = () => {
    window.open("/services", "_blank");
  };

  const handleGetInfo = () => {
    const infoResponse = FAQ_ANSWERS["services"];
    addBotMessage(infoResponse.response, false, undefined, true, infoResponse.quickReplies);
  };

  const showGreetingAndMenu = () => {
    const greeting = getTimeBasedGreeting();
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      content: `${greeting}! Welcome to Al Rayes Laundry 🌟\n\nHow can I help you today?`,
      timestamp: new Date(),
      isFromSupport: true,
      isMenu: true,
      menuOptions: MAIN_MENU,
    };
    setMessages((prev) => [...prev, welcomeMessage]);
    setFlow("main");
  };

  const addBotMessage = (content: string, isMenu = false, menuOptions?: MenuOption[], isAI = false, quickReplies?: string[]) => {
    setIsBotTyping(true);
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        timestamp: new Date(),
        isFromSupport: true,
        isMenu,
        menuOptions,
        isAI,
        quickReplies,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsBotTyping(false);
    }, 500);
  };

  const handleMenuSelect = (optionId: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: MAIN_MENU.find(o => o.id === optionId)?.label || optionId,
      timestamp: new Date(),
      isFromSupport: false,
    };
    setMessages((prev) => [...prev, userMessage]);

    switch (optionId) {
      case "ai":
        setFlow("ai_assist");
        addBotMessage(
          "🤖 **Hi! I'm your AI Assistant**\n\nI can help you with:\n\n• 📦 Orders - Track, place, or modify\n• 💰 Pricing - Get latest rates\n• 🕐 Hours - Find our operating times\n• 📍 Locations - Nearest branch\n• ❓ General FAQs\n• 📞 Contact - Phone & WhatsApp\n\nJust ask me anything! Or type **MENU** to go back.",
          false,
          undefined,
          true,
          ["Services", "Pricing", "Track Order"]
        );
        break;
      case "register":
        setFlow("registration");
        addBotMessage("Great! Let's get you registered.\n\nPlease enter your **Full Name**:");
        break;
      case "track":
        setFlow("track_order");
        addBotMessage("To track your order, please enter your **Order Number** or **Phone Number**:");
        break;
      case "change_address":
        setFlow("change_address");
        addBotMessage("To change your address, please enter your **Phone Number** to verify your account:");
        break;
      case "change_contact":
        setFlow("change_contact");
        addBotMessage("To update your contact details, please enter your **Phone Number** to verify your account:");
        break;
      case "complaint":
        setFlow("complaint_type");
        addBotMessage("We're sorry to hear that. Please select the type of issue:");
        break;
      case "feedback":
        setFlow("feedback_rating");
        addBotMessage("We'd love your feedback! How would you rate our service? (1-5 stars)");
        break;
      case "callback":
        setFlow("call_back");
        addBotMessage("📞 **Request a Call Back**\n\nI'll arrange for one of our team members to call you. Please enter your **Phone Number**:");
        break;
      case "help":
        setFlow("contact_support");
        addBotMessage("🆘 **Need Assistance?**\n\nI'm connecting you with our customer service team. Please describe your issue:\n\nAlternatively, you can call us at **+974 4466 1924** or WhatsApp at **+974 5555 5555**");
        break;
      case "business":
        setFlow("business_details");
        addBotMessage("Thank you for your interest in business opportunities! Please describe your inquiry or leave your contact details:");
        break;
      case "support":
        setFlow("contact_support");
        addBotMessage("Connecting you to our customer service team...\n\nPlease describe your issue and our team will assist you shortly.");
        break;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputValue,
      timestamp: new Date(),
      isFromSupport: false,
    };
    setMessages((prev) => [...prev, userMessage]);

    const input = inputValue;

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          isFromBot: false,
          flow: flow,
        }),
      });
    } catch (error) {
      console.error("Failed to send chat message:", error);
    }

    setInputValue("");

    await processUserInput(input);
  };

  const processUserInput = async (input: string) => {
    switch (flow) {
      case "registration":
        setChatData({ ...chatData, name: input });
        setFlow("registration_mobile");
        addBotMessage(`Great, ${input}! Please enter your **Mobile Number** (e.g., +974 XXXX XXXX):`);
        break;

      case "registration_mobile":
        setChatData({ ...chatData, mobile: input });
        setFlow("registration_email");
        addBotMessage("Perfect! Now please enter your **Email Address** (or type 'skip' to skip):");
        break;

      case "registration_email":
        if (input.toLowerCase() !== "skip") {
          setChatData({ ...chatData, email: input });
        }
        setFlow("registration_area");
        addBotMessage("Please enter your **Area/Location** (e.g., Al Sadd, The Pearl, Doha):");
        break;

      case "registration_area":
        setChatData({ ...chatData, area: input });
        setFlow("registration_address");
        addBotMessage("Please enter your **Full Address** for pickup/delivery:");
        break;

      case "registration_address":
        setChatData({ ...chatData, address: input });
        setFlow("registration_confirm");
        addBotMessage(
          `Please confirm your details:\n\n` +
          `**Name:** ${chatData.name}\n` +
          `**Mobile:** ${chatData.mobile}\n` +
          `**Email:** ${chatData.email || "Not provided"}\n` +
          `**Area:** ${chatData.area}\n` +
          `**Address:** ${input}\n\n` +
          `Type **YES** to confirm and register, or **NO** to start over.`,
          true,
          [
            { id: "yes", label: "✅ Confirm & Register", icon: <User className="w-5 h-5" />, description: "Confirm and complete registration" },
            { id: "no", label: "🔄 Start Over", icon: <X className="w-5 h-5" />, description: "Restart registration" },
          ]
        );
        break;

      case "registration_confirm":
        if (input.toLowerCase() === "yes") {
          setIsBotTyping(true);
          try {
            const res = await fetch("/api/customers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                firstName: chatData.name?.split(" ")[0] || "",
                lastName: chatData.name?.split(" ").slice(1).join(" ") || "",
                mobile: chatData.mobile,
                email: chatData.email,
                area: chatData.area,
                fullAddress: chatData.address,
              }),
            });
            if (res.ok) {
              addBotMessage("🎉 **Registration Successful!**\n\nWelcome to Al Rayes Laundry! You can now place orders and track them through this chat.\n\nType **MENU** to see all options.");
              setFlow("general");
            } else {
              addBotMessage("❌ Registration failed. This mobile number might already be registered. Please try again or type **MENU** to go back.");
            }
          } catch {
            addBotMessage("❌ Something went wrong. Please try again or type **MENU** to go back.");
          }
          setIsBotTyping(false);
        } else if (input.toLowerCase() === "no") {
          setChatData({});
          setFlow("registration");
          addBotMessage("Let's start over. Please enter your **Full Name**:");
        }
        break;

      case "track_order":
        setChatData({ ...chatData, orderId: input });
        setFlow("general");
        addBotMessage(
          `📦 Order Status for **${input}**:\n\n` +
          `**Status:** Ready for Pickup\n` +
          `**Estimated Delivery:** Tomorrow by 6 PM\n` +
          `**Items:** 5 items (Shirts, Trousers)\n` +
          `**Total:** QAR 45\n\n` +
          `Type **MENU** for more options.`
        );
        break;

      case "change_address":
        setChatData({ ...chatData, mobile: input });
        setFlow("change_address_new");
        addBotMessage("Account verified! Please enter your **New Address**:");
        break;

      case "change_address_new":
        setFlow("general");
        addBotMessage(
          `✅ **Address Updated Successfully!**\n\n` +
          `New Address: ${input}\n\n` +
          `This will be used for your next pickup/delivery.\n\n` +
          `Type **MENU** for more options.`
        );
        break;

      case "change_contact":
        setChatData({ ...chatData, mobile: input });
        setFlow("change_contact_field");
        addBotMessage("Account verified! What would you like to update?", true, [
          { id: "mobile", label: "📱 Mobile Number", icon: <Phone className="w-5 h-5" />, description: "Change your phone number" },
          { id: "email", label: "📧 Email Address", icon: <MessageCircle className="w-5 h-5" />, description: "Change your email" },
          { id: "both", label: "📝 Both", icon: <User className="w-5 h-5" />, description: "Update both" },
        ]);
        break;

      case "change_contact_field":
        setChatData({ ...chatData, changeField: input });
        setFlow("change_contact_value");
        const fieldLabel = input === "mobile" ? "new Mobile Number" : input === "email" ? "new Email Address" : "new Mobile and Email";
        addBotMessage(`Please enter your **${fieldLabel}**:`);
        break;

      case "change_contact_value":
        setFlow("general");
        addBotMessage(
          `✅ **Contact Details Updated!**\n\n` +
          `New ${chatData.changeField}: ${input}\n\n` +
          `Type **MENU** for more options.`
        );
        break;

      case "complaint_type":
        setChatData({ ...chatData, complaintType: input });
        setFlow("complaint_details");
        addBotMessage("Please describe the issue in detail:");
        break;

      case "complaint_details":
        setChatData({ ...chatData, complaintDetails: input });
        setFlow("general");
        addBotMessage(
          `✅ **Complaint Registered Successfully!**\n\n` +
          `**Type:** ${chatData.complaintType}\n` +
          `**Details:** ${input}\n` +
          `**Reference:** COMP-${crypto.randomUUID().slice(0, 6).toUpperCase()}\n\n` +
          `Our team will review your complaint and contact you within 24 hours.\n\n` +
          `Type **MENU** for more options.`
        );
        break;

      case "feedback_rating":
        setChatData({ ...chatData, rating: parseInt(input) });
        setFlow("feedback_comment");
        addBotMessage("Thank you! Please share any additional comments (or type 'skip'):");
        break;

      case "feedback_comment":
        const comment = input.toLowerCase() !== "skip" ? input : "No additional comments";
        setFlow("general");
        addBotMessage(
          `⭐ **Thank You for Your Feedback!**\n\n` +
          `**Rating:** ${"⭐".repeat(chatData.rating || 0)}\n` +
          `**Comment:** ${comment}\n\n` +
          `We appreciate your input and will use it to improve our service!\n\n` +
          `Type **MENU** for more options.`
        );
        break;

      case "business_details":
      case "contact_support":
      case "call_back":
      case "call_back_confirm":
      case "general":
        if (input.toLowerCase() === "menu") {
          showGreetingAndMenu();
        } else {
          addBotMessage(
            `Thank you for your message! Our team has received it and will respond shortly.\n\n` +
            `For immediate assistance, you can call us at **+974 4466 1924** or WhatsApp us.\n\n` +
            `Type **MENU** to see all options.`
          );
        }
        break;

      default:
        if (input.toLowerCase() === "menu") {
          showGreetingAndMenu();
        } else {
          const aiResponse = getAIResponse(input, flow);
          addBotMessage(aiResponse.response, false, undefined, true, aiResponse.quickReplies);
        }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Main button - pill shape with clear visibility */}
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f97316 100%)",
            boxShadow: "0 8px 25px rgba(234, 88, 12, 0.5), 0 0 0 3px rgba(251, 146, 60, 0.3)",
          }}
        >
          {/* Animated glow effect */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse opacity-50"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
              filter: "blur(10px)",
            }}
          />
          
          {/* Avatar with white circle */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
              <MessageSquare className="w-4 h-4 text-orange-600" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-orange-500 rounded-full" />
          </div>
          
          {/* Text - clear and bold */}
          <div className="flex flex-col items-start">
            <span 
              className="font-bold text-sm leading-tight"
              style={{
                color: "#ffffff",
                textShadow: "0 1px 2px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.3)",
              }}
            >
              Halo! Talk to me
            </span>
            <span 
              className="text-[10px] font-medium"
              style={{
                color: "#fef3c7",
              }}
            >
              Click to chat
            </span>
          </div>

          {/* Chat icon on right */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💬</span>
            </div>
          </div>
        </button>

        {/* Floating bubbles decoration */}
        <div className="absolute -top-8 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-bounce opacity-60" />
        <div className="absolute -top-4 -left-4 w-3 h-3 bg-orange-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: "200ms" }} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden transition-all duration-300",
        isMinimized ? "w-80 h-16" : "w-[380px] h-[600px]"
      )}
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {/* Header with Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <MessageSquare className="h-5 w-5 text-white" />
          <span className="font-semibold text-white text-sm">Al Rayes Laundry</span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Minimize/Maximize Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="h-7 w-7 flex items-center justify-center text-white hover:bg-white/30 rounded transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
          </button>
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="h-7 w-7 flex items-center justify-center text-white hover:bg-red-500 rounded transition-colors"
            title="Close Chat"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2", message.isFromSupport ? "" : "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "flex items-start gap-2 max-w-[85%]",
                    message.isFromSupport ? "" : "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      message.isFromSupport
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {message.isFromSupport ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      message.isFromSupport
                        ? "bg-gradient-to-r from-emerald-50 to-cyan-50 text-slate-800 border border-emerald-100"
                        : "bg-slate-100 text-slate-800"
                    )}
                  >
                    {message.isAI && (
                      <div className="flex items-center gap-1 mb-2 text-xs font-medium text-emerald-600">
                        <Bot className="w-3 h-3" />
                        AI Assistant
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.quickReplies && message.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.quickReplies?.map((reply, idx) => {
                          const handleQuickReply = async () => {
                            const userMessage: ChatMessage = {
                              id: crypto.randomUUID(),
                              content: reply,
                              timestamp: new Date(),
                              isFromSupport: false,
                            };
                            setMessages((prev) => [...prev, userMessage]);
                            
                            if (flow === "ai_assist") {
                              const aiResponse = getAIResponse(reply, flow);
                              addBotMessage(aiResponse.response, false, undefined, true, aiResponse.quickReplies);
                            } else if (reply === "Start Chat") {
                              showGreetingAndMenu();
                            } else if (reply === "Place Order") {
                              window.open("/services", "_blank");
                            } else if (reply === "Get Info") {
                              const infoResponse = FAQ_ANSWERS["services"];
                              addBotMessage(infoResponse.response, false, undefined, true, infoResponse.quickReplies);
                            } else if (reply === "MENU") {
                              showGreetingAndMenu();
                            } else if (reply === "Services") {
                              const serviceResponse = FAQ_ANSWERS["services"];
                              addBotMessage(serviceResponse.response, false, undefined, true, serviceResponse.quickReplies);
                            } else if (reply === "Pricing") {
                              const pricingResponse = FAQ_ANSWERS["pricing"];
                              addBotMessage(pricingResponse.response, false, undefined, true, pricingResponse.quickReplies);
                            } else if (reply === "Track Order") {
                              setFlow("track_order");
                              addBotMessage("To track your order, please enter your **Order Number** or **Phone Number**:");
                            } else if (reply === "Contact") {
                              const contactResponse = FAQ_ANSWERS["contact"];
                              addBotMessage(contactResponse.response, false, undefined, true, contactResponse.quickReplies);
                            } else if (reply === "Locations") {
                              const locationResponse = FAQ_ANSWERS["locations"];
                              addBotMessage(locationResponse.response, false, undefined, true, locationResponse.quickReplies);
                            } else if (reply === "Order Now") {
                              window.open("/services", "_blank");
                            } else {
                              addBotMessage(`You selected: ${reply}. How can I help you further?`);
                            }
                          };
                          
                          return (
                            <button
                              key={idx}
                              onClick={handleQuickReply}
                              className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                              {reply}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>

            ))}

            {isBotTyping && (
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl px-4 py-3 border border-emerald-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {!isMinimized && (
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              <button
                onClick={handleStartChat}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                Start Chat
              </button>
              <button
                onClick={handlePlaceOrder}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Place Order
              </button>
              <button
                onClick={handleGetInfo}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Get Info
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">
            Al Rayes Laundry Chat • Available 24/7
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatSupportWidget;
