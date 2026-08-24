import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, Clock3, Compass, Gamepad2, Home as HomeIcon, MessageCircle, MessageSquarePlus, PanelLeft, PanelLeftClose, PanelLeftOpen, Palette, Settings, ShieldCheck, Sparkles, UserRound, Users, WandSparkles } from "lucide-react";
import { useLocation } from "wouter";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const suggestedPrompts = ["What can I do in Luna Social?", "Recommend a game from the Games library", "Help me troubleshoot a page"];
const HISTORY_KEY = "luna-agent-history";
type ChatSession = { id: string; title: string; updatedAt: number; messages: Message[] };
function loadSessions(): ChatSession[] { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as ChatSession[]; } catch { return []; } }

export default function AIAgent() {
  const [, navigate] = useLocation();
  const { settings } = useAppSettings();
  const { loading, user, logout } = useAuth();
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem("luna-sidebar-collapsed") === "true"; } catch { return false; } });
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const chat = trpc.ai.chat.useMutation({ onSuccess: (result: { content: string }) => setMessages(current => [...current, { role: "assistant", content: result.content }]), onError: (error: { message: string }) => setMessages(current => [...current, { role: "assistant", content: `I couldn’t answer that right now. ${error.message}` }]) });
  const activeSession = useMemo(() => sessions.find(session => session.id === activeId), [sessions, activeId]);

  useEffect(() => { try { localStorage.setItem("luna-sidebar-collapsed", String(sidebarCollapsed)); } catch { /* storage unavailable */ } }, [sidebarCollapsed]);
  useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 30))); } catch { /* history is best effort */ } }, [sessions]);
  useEffect(() => { if (activeSession) setMessages(activeSession.messages); }, [activeSession]);
  useEffect(() => { if (!activeId || messages.length === 0) return; setSessions(current => current.map(session => session.id === activeId ? { ...session, messages, updatedAt: Date.now() } : session)); }, [messages, activeId]);

  const navigateWorkspace = (label: string) => { setMobileNav(false); if (label === "Home") navigate("/"); else if (label === "Messages") navigate("/messages"); else if (label === "Games") navigate("/games"); else if (label === "AI Agent") navigate("/ai"); else navigate(`/?workspace=${encodeURIComponent(label.toLowerCase().replaceAll(" ", "-"))}`); };
  const startNewChat = () => { if (messages.length > 0) { const firstUser = messages.find(message => message.role === "user"); const next = { id: activeId || crypto.randomUUID(), title: firstUser?.content.slice(0, 42) || "New conversation", updatedAt: Date.now(), messages }; setSessions(current => [next, ...current.filter(session => session.id !== next.id)]); } setActiveId(null); setMessages([]); };
  const openChat = (session: ChatSession) => { setActiveId(session.id); setMessages(session.messages); setHistoryOpen(false); };
  const sendMessage = (content: string) => { const next = [...messages, { role: "user" as const, content }]; const id = activeId || crypto.randomUUID(); setActiveId(id); setMessages(next); setSessions(current => current.some(session => session.id === id) ? current : [{ id, title: content.slice(0, 42), updatedAt: Date.now(), messages: next }, ...current]); chat.mutate({ messages: next.filter(message => message.role !== "system").map(message => ({ role: message.role as "user" | "assistant", content: message.content })) }); };

  if (loading) return <div className="auth-gate"><div className="auth-gate-card"><div className="brand-mark"><Sparkles size={22} /></div><p className="muted">Loading your orbit…</p></div></div>;
  if (!user) return <div className="auth-gate"><div className="auth-gate-card"><div className="brand-mark"><Sparkles size={22} /></div><h1>Sign in to use Luna Agent</h1><Button type="button" onClick={() => navigate("/welcome")}>Continue to sign in</Button></div></div>;

  const navItems = [{ label: "Home", icon: HomeIcon }, { label: "Explore", icon: Compass }, { label: "Members", icon: Users }, { label: "Messages", icon: MessageCircle }, { label: "Notifications", icon: Bell }, { label: "Profile", icon: UserRound }, { label: "AI Agent", icon: Sparkles }, ...(user.role === "admin" ? [{ label: "Admin", icon: ShieldCheck }, { label: "App settings", icon: Palette }] : [])];
  return (
    <div className="app-shell ai-app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>{settings.appName}</span><button type="button" className="sidebar-toggle" onClick={() => setSidebarCollapsed(value => !value)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button></div>
        <button type="button" className="sidebar-profile" onClick={() => navigateWorkspace("Profile")}><img src={user.avatarUrl || "https://i.pravatar.cc/120?img=32"} alt="" /><div className="sidebar-profile-copy"><strong>{user.name || "Your profile"}</strong><span>@{user.username || "luna_member"}</span></div></button>
        <nav>{navItems.map(item => <button type="button" key={item.label} className={item.label === "AI Agent" ? "nav-item active" : "nav-item"} onClick={() => navigateWorkspace(item.label)}><item.icon size={19} /><span>{item.label}</span></button>)}<span className="nav-section-label">Games</span><button type="button" className="nav-item" onClick={() => navigateWorkspace("Games")}><Gamepad2 size={19} /><span>Games</span></button></nav>
        <div className="sidebar-bottom"><button type="button" className="nav-item" onClick={() => navigateWorkspace("Settings")}><Settings size={19} /><span>Settings</span></button><button type="button" className="nav-item" onClick={() => navigateWorkspace("Settings")}><ShieldCheck size={19} /><span>Privacy center</span></button><button type="button" className="logout-link" onClick={() => void logout()}>Log out</button></div>
      </aside>
      {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)} />}
      <main className="main-column ai-agent-page">
        <header className="topbar ai-agent-topbar"><button type="button" className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><PanelLeft size={20} /></button><Button type="button" variant="ghost" onClick={() => navigate("/")}><ArrowLeft size={16} /> Back to Luna</Button><div className="ai-agent-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>{settings.appName} Agent</span></div><Button type="button" variant="ghost" className="ai-history-toggle" onClick={() => setHistoryOpen(value => !value)} aria-label="Toggle chat history"><PanelLeft size={17} /></Button></header>
        <div className="ai-agent-layout">
          {historyOpen && <aside className="ai-history"><Button type="button" className="ai-new-chat" onClick={startNewChat}><MessageSquarePlus size={17} /> New chat</Button><p className="ai-history-label">Recent</p>{sessions.length === 0 ? <p className="ai-history-empty">Your previous chats will appear here.</p> : sessions.map(session => <button type="button" key={session.id} className={`ai-history-item ${session.id === activeId ? "active" : ""}`} onClick={() => openChat(session)}><Clock3 size={15} /><span>{session.title}</span></button>)}</aside>}
          <section className="ai-agent-content"><div className="ai-agent-hero"><div className="ai-agent-orb"><WandSparkles size={26} /></div><div><p className="eyebrow">YOUR CONVERSATIONAL COPILOT</p><h1>Meet Luna Agent.</h1><p>Ask about Luna Social, games, coding, troubleshooting, recommendations, or anything you are working through.</p></div></div><AIChatBox messages={messages} onSendMessage={sendMessage} isLoading={chat.isPending} suggestedPrompts={suggestedPrompts} emptyStateMessage="Start a conversation with Luna Agent" placeholder="Ask anything" height="min(620px, calc(100vh - 250px))" className="ai-agent-chat" /></section>
        </div>
      </main>
    </div>
  );
}
