import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { Gamepad2, Home, Menu, MessageCircle, Sparkles, X } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";

export default function GameSidebar({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { settings } = useAppSettings();
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.localStorage.getItem("luna-sidebar-collapsed") === "true"; } catch { return false; }
  });
  useEffect(() => {
    try { window.localStorage.setItem("luna-sidebar-collapsed", String(collapsed)); } catch { /* storage unavailable */ }
  }, [collapsed]);
  const closeMobile = () => setMobileNav(false);
  const go = (path: string) => { closeMobile(); navigate(path); };

  return <div className={`game-app-shell ${collapsed ? "game-app-shell-collapsed" : ""}`}>
    <aside className={`game-sidebar ${mobileNav ? "game-sidebar-open" : ""}`} aria-label="Luna Social navigation">
      <div className="game-sidebar-brand"><div className="brand-mark"><Sparkles size={17} /></div><span>{settings.appName}</span><button type="button" className="game-sidebar-toggle" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <span>›</span> : <span>‹</span>}</button><button type="button" className="game-sidebar-close" onClick={closeMobile} aria-label="Close navigation"><X size={18} /></button></div>
      <button type="button" className="game-sidebar-profile" onClick={() => go("/?workspace=profile")}><div className="game-sidebar-avatar">{settings.appName.slice(0, 1).toUpperCase()}</div><span>My orbit</span></button>
      <nav className="game-sidebar-nav">
        <button type="button" onClick={() => go("/")}><Home size={18} /><span>Home</span></button>
        <button type="button" onClick={() => go("/messages")}><MessageCircle size={18} /><span>Messages</span></button>
        <button type="button" className="active"><Gamepad2 size={18} /><span>Games</span></button>
      </nav>
      <p className="game-sidebar-caption">PLAY INSIDE LUNA</p>
      <div className="game-sidebar-foot"><button type="button" onClick={() => go("/games")}><Gamepad2 size={17} /><span>Game library</span></button></div>
    </aside>
    {mobileNav && <button type="button" className="game-sidebar-scrim" onClick={closeMobile} aria-label="Close navigation" />}
    <main className="game-app-main"><header className="game-mobile-topbar"><button type="button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="brand-mark"><Sparkles size={15} /></div><span>{settings.appName}</span></header>{children}</main>
  </div>;
}
