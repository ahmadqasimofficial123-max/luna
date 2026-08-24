import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3, MessageSquarePlus, PanelLeft, Sparkles, WandSparkles } from "lucide-react";
import { useLocation } from "wouter";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { trpc } from "@/lib/trpc";

const suggestedPrompts = ["What can I do in Luna Social?", "Recommend a game from the Games library", "Help me troubleshoot a page"];
const HISTORY_KEY = "luna-agent-history";
type ChatSession = { id: string; title: string; updatedAt: number; messages: Message[] };

function loadSessions(): ChatSession[] { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as ChatSession[]; } catch { return []; } }

export default function AIAgent() {
  const [, navigate] = useLocation();
  const { settings } = useAppSettings();
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const chat = trpc.ai.chat.useMutation({
    onSuccess: ({ content }) => setMessages(current => [...current, { role: "assistant", content }]),
    onError: (error) => setMessages(current => [...current, { role: "assistant", content: `I couldn’t answer that right now. ${error.message}` }]),
  });
  const activeSession = useMemo(() => sessions.find(session => session.id === activeId), [sessions, activeId]);

  useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 30))); } catch { /* history is best effort */ } }, [sessions]);
  useEffect(() => { if (activeSession) setMessages(activeSession.messages); }, [activeSession]);
  useEffect(() => { if (!activeId || messages.length === 0) return; setSessions(current => current.map(session => session.id === activeId ? { ...session, messages, updatedAt: Date.now() } : session)); }, [messages, activeId]);

  const startNewChat = () => { if (messages.length > 0) { const firstUser = messages.find(message => message.role === "user"); const next: ChatSession = { id: activeId || crypto.randomUUID(), title: firstUser?.content.slice(0, 42) || "New conversation", updatedAt: Date.now(), messages }; setSessions(current => [next, ...current.filter(session => session.id !== next.id)]); } setActiveId(null); setMessages([]); };
  const openChat = (session: ChatSession) => { setActiveId(session.id); setMessages(session.messages); setHistoryOpen(false); };
  const sendMessage = (content: string) => { const next = [...messages, { role: "user" as const, content }]; const id = activeId || crypto.randomUUID(); setActiveId(id); setMessages(next); setSessions(current => current.some(session => session.id === id) ? current : [{ id, title: content.slice(0, 42), updatedAt: Date.now(), messages: next }, ...current]); chat.mutate({ messages: next.filter(message => message.role !== "system").map(message => ({ role: message.role as "user" | "assistant", content: message.content })) }); };

  return <main className="ai-agent-page"><header className="ai-agent-topbar"><Button type="button" variant="ghost" onClick={() => navigate("/")}><ArrowLeft size={16} /> Back to Luna</Button><div className="ai-agent-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>{settings.appName} Agent</span></div><Button type="button" variant="ghost" className="ai-history-toggle" onClick={() => setHistoryOpen(value => !value)} aria-label="Toggle chat history"><PanelLeft size={17} /></Button></header><div className="ai-agent-layout">{historyOpen && <aside className="ai-history"><Button type="button" className="ai-new-chat" onClick={startNewChat}><MessageSquarePlus size={17} /> New chat</Button><p className="ai-history-label">Recent</p>{sessions.length === 0 ? <p className="ai-history-empty">Your previous chats will appear here.</p> : sessions.map(session => <button type="button" key={session.id} className={`ai-history-item ${session.id === activeId ? "active" : ""}`} onClick={() => openChat(session)}><Clock3 size={15} /><span>{session.title}</span></button>)}</aside>}<section className="ai-agent-content"><div className="ai-agent-hero"><div className="ai-agent-orb"><WandSparkles size={26} /></div><div><p className="eyebrow">YOUR CONVERSATIONAL COPILOT</p><h1>Meet Luna Agent.</h1><p>Ask about Luna Social, games, coding, troubleshooting, recommendations, or anything you are working through.</p></div></div><AIChatBox messages={messages} onSendMessage={sendMessage} isLoading={chat.isPending} suggestedPrompts={suggestedPrompts} emptyStateMessage="Start a conversation with Luna Agent" placeholder="Ask anything" height="min(620px, calc(100vh - 250px))" className="ai-agent-chat" showComposerControls /></section></div></main>;
}
