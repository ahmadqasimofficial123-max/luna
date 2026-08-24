import { useState } from "react";
import { ArrowLeft, Sparkles, WandSparkles } from "lucide-react";
import { useLocation } from "wouter";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { trpc } from "@/lib/trpc";

const suggestedPrompts = ["What can I do in Luna Social?", "Recommend a game from the Games library", "Help me troubleshoot a page"];

export default function AIAgent() {
  const [, navigate] = useLocation();
  const { settings } = useAppSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const chat = trpc.ai.chat.useMutation({
    onSuccess: ({ content }) => setMessages(current => [...current, { role: "assistant", content }]),
    onError: (error) => setMessages(current => [...current, { role: "assistant", content: `I couldn’t answer that right now. ${error.message}` }]),
  });
  const sendMessage = (content: string) => {
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    chat.mutate({ messages: next.filter(message => message.role !== "system").map(message => ({ role: message.role as "user" | "assistant", content: message.content })) });
  };

  return <main className="ai-agent-page"><header className="ai-agent-topbar"><Button type="button" variant="ghost" onClick={() => navigate("/")}><ArrowLeft size={16} /> Back to Luna</Button><div className="ai-agent-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>{settings.appName} Agent</span></div></header><section className="ai-agent-content"><div className="ai-agent-hero"><div className="ai-agent-orb"><WandSparkles size={26} /></div><div><p className="eyebrow">YOUR CONVERSATIONAL COPILOT</p><h1>Meet Luna Agent.</h1><p>Ask about Luna Social, games, coding, troubleshooting, recommendations, or anything you are working through.</p></div></div><AIChatBox messages={messages} onSendMessage={sendMessage} isLoading={chat.isPending} suggestedPrompts={suggestedPrompts} emptyStateMessage="Start a conversation with Luna Agent" placeholder="Ask Luna Agent anything..." height="min(620px, calc(100vh - 250px))" className="ai-agent-chat" /></section></main>;
}
