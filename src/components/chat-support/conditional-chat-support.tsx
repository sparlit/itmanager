"use client";

import { usePathname } from "next/navigation";
import { ChatSupportWidget } from "@/components/chat-support/chat-support-widget";

const hiddenPrefixes = ["/login", "/portal", "/internal", "/admin"];

export function ConditionalChatSupport() {
  const pathname = usePathname();

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return <ChatSupportWidget />;
}
