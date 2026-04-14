"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Settings, Download, Brain, Minus, Maximize2, CornerDownLeft, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
}

interface AIChatConfig {
  model: string;
  endpoint: string;
  temperature: number;
  maxTokens: number;
  provider: string;
  apiKey?: string;
}

const DEFAULT_CONFIG: AIChatConfig = {
  model: "llama3.2:latest",
  endpoint: "http://localhost:11434/api/chat",
  temperature: 0.7,
  maxTokens: 2048,
  provider: "ollama",
};

// Free online AI providers
export const AI_PROVIDERS = [
  { id: "ollama", name: "Ollama (Local)", type: "local", description: "Run locally - fastest & private", icon: "🖥️" },
  { id: "groq", name: "Groq (Free)", type: "cloud", description: "Fast inference - 500 req/day free", icon: "⚡" },
  { id: "huggingface", name: "Hugging Face", type: "cloud", description: "Free inference API", icon: "🌐" },
  { id: "openrouter", name: "OpenRouter", type: "cloud", description: "Aggregates free models", icon: "🔗" },
];

export const AI_MODELS = [
  { id: "llama3.2:latest", name: "Llama 3.2", provider: "ollama", description: "Meta's latest - fast" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "groq", description: "Fast & free" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "groq", description: "Large context" },
  { id: "meta-llama/Llama-3.2-1B-Instruct", name: "Llama 3.2 1B", provider: "huggingface", description: "Lightweight" },
  { id: "meta-llama/llama-3.2-1b-instruct", name: "Llama 3.2", provider: "openrouter", description: "Free tier" },
];

interface AIChatWidgetProps {
  className?: string;
}

export function AIChatWidget({ className }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<AIChatConfig>(DEFAULT_CONFIG);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [trainingData, setTrainingData] = useState<AIMessage[]>([]);
  const [showTraining, setShowTraining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setTrainingData(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          config,
          history: messages.slice(-10), // Last 10 messages for context
        }),
      });

      const data = await response.json();

      if (data.response) {
        const aiMessage: AIMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setTrainingData(prev => [...prev, aiMessage]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I'm having trouble responding. Please check that Ollama is running locally.",
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Connection error. Make sure Ollama is running at " + config.endpoint,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const exportTrainingData = () => {
    const data = JSON.stringify(trainingData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectModel = (modelId: string) => {
    setConfig(prev => ({ ...prev, model: modelId }));
    setShowModelSelect(false);
  };

  const currentModel = AI_MODELS.find(m => m.id === config.model) || AI_MODELS[0];

  return (
    <>
      {/* Toggle Button - Left Bottom - Always Shows "Ask AI" Label */}
      <div className="fixed bottom-20 left-6 z-50 flex items-center gap-3">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
          Ask AI
        </div>
        <Button
          onClick={() => {
            if (isOpen) {
              if (isMinimized) {
                setIsMinimized(false);
              } else {
                setIsOpen(false);
              }
            } else {
              setIsOpen(true);
              setIsMinimized(false);
            }
          }}
          className={cn(
            "h-16 w-16 rounded-full shadow-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white",
            "flex items-center justify-center transition-all duration-300",
            className
          )}
        >
          {isOpen && !isMinimized ? <X className="h-8 w-8" /> : <Brain className="h-8 w-8" />}
        </Button>
      </div>

      {/* Chat Window - With minimize/maximize support */}
      {isOpen && !isMinimized && (
        <div className={cn(
          "fixed z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden",
          isMaximized 
            ? "inset-4" 
            : "bottom-24 left-6 w-[500px] h-[650px] max-w-[95vw] max-h-[80vh]"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-violet-900/50 to-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ask AI</h3>
                <p className="text-xs text-violet-300">Powered by Ollama</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTraining(!showTraining)}
                className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {isMaximized ? <CornerDownLeft className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-slate-300 hover:text-red-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-slate-700 bg-slate-800/30 space-y-3 max-h-64 overflow-y-auto">
              {/* Provider Selection */}
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Globe className="h-3 w-3" /> AI Provider
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {AI_PROVIDERS.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => setConfig(prev => ({ ...prev, provider: provider.id }))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-left text-sm transition-all",
                        config.provider === provider.id
                          ? "bg-violet-600 text-white"
                          : "bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{provider.icon}</span>
                        <span className="font-medium">{provider.name}</span>
                      </div>
                      <div className="text-xs opacity-70">{provider.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection - Filter by provider */}
              <div className="relative">
                <label className="text-xs text-slate-400">Model</label>
                <button
                  onClick={() => setShowModelSelect(!showModelSelect)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm mt-1"
                >
                  <span>{currentModel.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showModelSelect && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden z-10 max-h-40 overflow-y-auto">
                    {AI_MODELS.filter(m => m.provider === config.provider || config.provider === 'ollama').map(model => (
                      <button
                        key={model.id}
                        onClick={() => selectModel(model.id)}
                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700"
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-slate-400">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400">Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Max Tokens</label>
                  <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Training Data Panel */}
          {showTraining && (
            <div className="p-4 border-b border-slate-700 bg-slate-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Training Data ({trainingData.length} messages)</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTrainingData}
                  className="text-xs"
                >
                  Export JSON
                </Button>
              </div>
              <div className="text-xs text-slate-400">
                Data is stored locally for model training
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">Ask me anything!</p>
                  <p className="text-slate-500 text-xs mt-1">Powered by {currentModel.name}</p>
                </div>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800 px-3 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/30">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-[120px] bg-slate-800 border-slate-600 text-white resize-none"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-auto bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatWidget;