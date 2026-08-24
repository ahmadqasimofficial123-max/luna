import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Maximize2, ShieldAlert, Sparkles } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { GAME_CONFIGS } from "./game-config";

export default function GamePage() {
  const [, params] = useRoute<{ gameId: string }>("/games/:gameId");
  const [, navigate] = useLocation();
  const { settings } = useAppSettings();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const game = GAME_CONFIGS[params?.gameId || "poxel"] || GAME_CONFIGS.poxel;

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === iframeRef.current || document.fullscreenElement?.classList.contains("game-frame-shell") === true);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const gameLinks = useMemo(() => Object.values(GAME_CONFIGS), []);
  const toggleFullscreen = async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await iframe.requestFullscreen();
    } catch {
      const shell = iframe.parentElement;
      if (shell?.requestFullscreen) await shell.requestFullscreen();
    }
  };

  return <main className="game-page" style={{ "--game-accent": game.accent } as React.CSSProperties}>
    <header className="game-page-topbar">
      <button type="button" className="game-back-link" onClick={() => navigate("/welcome")}><ArrowLeft size={17} /> Luna Social</button>
      <div className="game-page-brand"><div className="brand-mark"><Sparkles size={16} /></div><span>{settings.appName}</span></div>
      <a className="game-source-link" href={game.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink size={15} /></a>
    </header>
    <div className="game-page-content">
      <section className="game-intro">
        <div><p className="eyebrow">{game.eyebrow}</p><h1>{game.title}</h1><p>{game.description}</p></div>
        <div className="game-nav-pills" aria-label="Choose a game">{gameLinks.map(link => <button type="button" className={link.slug === game.slug ? "active" : ""} key={link.slug} onClick={() => navigate(`/games/${link.slug}`)}>{link.title}</button>)}</div>
      </section>
      <section className="game-frame-shell" style={{ "--game-cover": game.coverUrl ? `url(${game.coverUrl})` : "none" } as React.CSSProperties}>
        <div className="game-frame-toolbar"><div><span className="game-live-dot" /> Browser game</div><Button type="button" className="game-fullscreen-button" onClick={toggleFullscreen}><Maximize2 size={16} /> {isFullscreen ? "Exit fullscreen" : "Fullscreen"}</Button></div>
        <div className="game-frame-wrap"><iframe ref={iframeRef} title={`${game.title} playable game`} src={game.sourceUrl} allow="fullscreen; autoplay; gamepad; pointer-lock; clipboard-write" allowFullScreen loading="eager" /></div>
        <div className="game-frame-foot"><span><ShieldAlert size={15} /> The game is hosted by its original publisher inside a secure frame.</span><a href={game.sourceUrl} target="_blank" rel="noreferrer">Open in a new tab <ExternalLink size={14} /></a></div>
      </section>
    </div>
  </main>;
}
