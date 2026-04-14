import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const IT_GROUP_CHAT_ID = process.env.TELEGRAM_IT_GROUP_CHAT_ID;

const bot = TELEGRAM_BOT_TOKEN ? new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false }) : null;

export interface TelegramMessage {
  chatId: string;
  text: string;
}

export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  if (!bot || !IT_GROUP_CHAT_ID) {
    console.log("[Telegram] Bot not configured. Message would be sent:", message);
    return false;
  }

  try {
    await bot.sendMessage(message.chatId, message.text, { parse_mode: "Markdown" });
    console.log("[Telegram] Message sent successfully to", message.chatId);
    return true;
  } catch (error) {
    console.error("[Telegram] Failed to send message:", error);
    return false;
  }
}

export async function notifyITGroup(message: string): Promise<boolean> {
  if (!IT_GROUP_CHAT_ID) {
    console.log("[Telegram] No IT group chat ID configured. Message:", message);
    return false;
  }

  return sendTelegramMessage({ chatId: IT_GROUP_CHAT_ID, text: message });
}

export function formatServiceRequestNotification(
  requestId: string,
  serviceName: string,
  userName: string,
  priority: string,
  notes: string
): string {
  return `*New Service Request*

*Request ID:* \`${requestId}\`
*Service:* ${serviceName}
*Requested By:* ${userName}
*Priority:* ${priority}
*Notes:* ${notes}

Please review and assign.`;
}

export function formatTicketNotification(
  ticketId: string,
  title: string,
  reporterName: string,
  priority: string,
  category: string
): string {
  return `*New Ticket*

*Ticket ID:* \`${ticketId}\`
*Title:* ${title}
*Reported By:* ${reporterName}
*Priority:* ${priority}
*Category:* ${category}

Please review and assign.`;
}
