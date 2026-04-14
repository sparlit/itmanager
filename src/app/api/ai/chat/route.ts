import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Store chat history and training data in memory
const chatHistory: Array<{ role: "user" | "assistant"; content: string; timestamp: Date }> = [];
const trainingData: Array<{ role: "user" | "assistant"; content: string; timestamp: Date }> = [];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIProvider {
  id: string;
  name: string;
  type: "local" | "cloud";
  endpoint: string;
  model: string;
  apiKey?: string;
  free: boolean;
  description: string;
}

// Available free AI providers
export const AI_PROVIDERS: AIProvider[] = [
  // Local (Ollama)
  { id: "ollama", name: "Ollama (Local)", type: "local", endpoint: "http://localhost:11434/api/chat", model: "llama3.2:latest", free: true, description: "Run locally - fastest & private" },
  
  // Cloud - Free tier
  { id: "huggingface", name: "Hugging Face", type: "cloud", endpoint: "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct", model: "meta-llama/Llama-3.2-1B-Instruct", free: true, description: "Free inference API" },
  { id: "groq", name: "Groq", type: "cloud", endpoint: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.1-8b-instant", free: true, description: "Fast inference - 500 req/day free" },
  { id: "openrouter", name: "OpenRouter", type: "cloud", endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "meta-llama/llama-3.2-1b-instruct", free: true, description: "Aggregates free models" },
  { id: "openai", name: "OpenAI (Free)", type: "cloud", endpoint: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini", free: true, description: "Limited free tier" },
];

const systemPrompt = `You are a helpful IT support assistant for a laundry service company. 
You help customers with:
- Placing and tracking laundry orders
- Understanding pricing and services
- Technical support questions
- General inquiries about the service

Always be friendly, concise, and helpful. Keep responses under 200 words unless detailed explanation is needed.`;

async function callOllama(message: string, history: ChatMessage[], model: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });

  if (!response.ok) throw new Error("Ollama failed");
  const data = await response.json();
  return data.message?.content || "No response";
}

async function callHuggingFace(message: string, history: ChatMessage[]): Promise<string> {
  const conversation = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
    { role: "user", content: message },
  ];
  
  const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      // Add your HF token for higher rate limits: Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`
    },
    body: JSON.stringify({
      inputs: conversation,
      parameters: { max_new_tokens: 500, temperature: 0.7 },
    }),
  });

  if (!response.ok) throw new Error("HuggingFace failed");
  const data = await response.json();
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text.slice(data[0].generated_text.lastIndexOf("\n") + 1);
  }
  return "No response from model";
}

async function callGroq(message: string, history: ChatMessage[], apiKey?: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  // Use free tier without API key or with key for higher limits
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq failed: ${err}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
}

async function callOpenRouter(message: string, history: ChatMessage[], apiKey?: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : { "HTTP-Referer": "http://localhost:3003" }),
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.2-1b-instruct",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) throw new Error("OpenRouter failed");
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const { message, config, history, provider } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const providerId = provider || config?.provider || "ollama";
    const mappedHistory: ChatMessage[] = (history || []).slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    let aiResponse = "";
    let usedProvider = providerId;

    try {
      // Try selected provider
      switch (providerId) {
        case "ollama":
          aiResponse = await callOllama(message, mappedHistory, config?.model || "llama3.2:latest");
          break;
        case "huggingface":
          aiResponse = await callHuggingFace(message, mappedHistory);
          break;
        case "groq":
          aiResponse = await callGroq(message, mappedHistory, config?.apiKey);
          break;
        case "openrouter":
          aiResponse = await callOpenRouter(message, mappedHistory, config?.apiKey);
          break;
        default:
          // Fallback to Ollama
          aiResponse = await callOllama(message, mappedHistory, "llama3.2:latest");
          usedProvider = "ollama";
      }
    } catch (err) {
      logger.error({ err, provider: providerId }, "AI provider failed, trying fallbacks");
      
      // Try fallbacks if primary fails
      try {
        if (providerId !== "ollama") {
          aiResponse = await callOllama(message, mappedHistory, "llama3.2:latest");
          usedProvider = "ollama";
        } else {
          throw new Error("No fallbacks available");
        }
      } catch {
        return NextResponse.json({
          response: "AI services are currently unavailable. Please try again later or configure an API key in settings.",
          unavailable: true,
          provider: providerId,
        });
      }
    }

    // Store in training data
    chatHistory.push(
      { role: "user", content: message, timestamp: new Date() },
      { role: "assistant", content: aiResponse, timestamp: new Date() }
    );
    trainingData.push(
      { role: "user", content: message, timestamp: new Date() },
      { role: "assistant", content: aiResponse, timestamp: new Date() }
    );

    // Keep last 1000 messages
    if (chatHistory.length > 1000) chatHistory.splice(0, chatHistory.length - 1000);
    if (trainingData.length > 1000) trainingData.splice(0, trainingData.length - 1000);

    logger.info({ duration: Date.now() - start, provider: usedProvider, responseLength: aiResponse.length }, "AI chat completed");

    return NextResponse.json({
      response: aiResponse,
      provider: usedProvider,
      trainingDataCount: trainingData.length,
    });
  } catch (err) {
    logger.error({ err }, "AI chat error");
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    providers: AI_PROVIDERS,
    stats: {
      chatHistoryCount: chatHistory.length,
      trainingDataCount: trainingData.length,
    },
  });
}