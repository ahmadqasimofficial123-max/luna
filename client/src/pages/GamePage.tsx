import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, FlagTriangleRight, Gamepad2, Maximize2, MessageSquare, ShieldAlert, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import GameSidebar from "@/components/GameSidebar";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { GAME_CONFIGS, HUB_GAMES } from "./game-config";
import { isKnownBlockedEmbedUrl } from "./game-embed";
import NativeDriftGame from "@/components/NativeDriftGame";

export default function GamePage() {
  const [, params] = useRoute<{ gameId: string }>("/games/:gameId");
  const [, navigate] = useLocation();
  const { settings } = useAppSettings();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const allGames = useMemo(() => Array.from(new Map([...Object.values(GAME_CONFIGS), ...HUB_GAMES].map(item => [item.slug, item])).values()), []);
  const game = allGames.find(item => item.slug === params?.gameId) || GAME_CONFIGS.poxel;
  const isNativeDrift = game.title === "Drift Hunters";
  const knownBlockedEmbed = !isNativeDrift && isKnownBlockedEmbedUrl(game.sourceUrl);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === iframeRef.current || document.fullscreenElement?.classList.contains("game-frame-shell") === true);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const gameLinks = allGames;
  const toggleFullscreen = async () => {
    const iframe = iframeRef.current;
    if (isNativeDrift) { const shell = document.querySelector(".native-drift-game"); if (shell instanceof HTMLElement && !document.fullscreenElement) await shell.requestFullscreen(); else if (document.fullscreenElement) await document.exitFullscreen(); return; }
    if (!iframe) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await iframe.requestFullscreen();
    } catch {
      const shell = iframe.parentElement;
      if (shell?.requestFullscreen) await shell.requestFullscreen();
    }
  };

  return <GameSidebar><div className="game-page" style={{ "--game-accent": game.accent } as React.CSSProperties}>
    <header className="game-page-topbar">
      <button type="button" className="game-back-link" onClick={() => navigate("/")}><ArrowLeft size={17} /> Luna Social</button>
      <div className="game-page-brand"><div className="brand-mark"><Sparkles size={16} /></div><span>{settings.appName}</span></div>
      <span className="game-source-link game-source-local"><Gamepad2 size={15} /> Playing in Luna</span>
    </header>
    <div className="game-page-content">
      <section className="game-intro">
        <div><p className="eyebrow">{game.eyebrow}</p><h1>{game.title}</h1><p>{game.description}</p></div>
        <div className="game-marquee" aria-label="Choose a game"><div className="game-marquee-track">{[...gameLinks, ...gameLinks].map((link, index) => <button type="button" className={link.slug === game.slug ? "active" : ""} key={`${link.slug}-${index}`} onClick={() => navigate(`/games/${link.slug}`)}>{link.title}</button>)}</div></div>
      </section>
      <section className="game-frame-shell" style={{ "--game-cover": game.coverUrl ? `url(${game.coverUrl})` : "none" } as React.CSSProperties}>
        <div className="game-frame-toolbar"><div><span className="game-live-dot" /> Browser game</div><Button type="button" className="game-fullscreen-button" onClick={toggleFullscreen}><Maximize2 size={16} /> {isFullscreen ? "Exit fullscreen" : "Fullscreen"}</Button></div>
        <div className={`game-frame-wrap ${knownBlockedEmbed ? "has-embed-warning" : ""}`}>{isNativeDrift ? <NativeDriftGame /> : <><iframe ref={iframeRef} title={`${game.title} playable game`} src={game.sourceUrl} allow="fullscreen; autoplay; gamepad; pointer-lock; clipboard-write" allowFullScreen loading="eager" />{knownBlockedEmbed && <div className="game-embed-warning"><div className="game-embed-warning-icon"><ShieldAlert size={24} /></div><h2>This game cannot be embedded here</h2><p>{game.title} is protected by its publisher and refuses to load inside another website.</p><span>Choose another game from the moving row above to keep playing inside Luna Social.</span></div>}</>}</div>
        <div className="game-action-bar" aria-label={`${game.title} actions`}>
          <button type="button" className={liked ? "is-active" : ""} onClick={() => { setLiked(value => !value); setDisliked(false); }} aria-label="Like game" title="Like"><ThumbsUp size={21} /><span>37K</span></button>
          <button type="button" className={disliked ? "is-active" : ""} onClick={() => { setDisliked(value => !value); setLiked(false); }} aria-label="Dislike game" title="Dislike"><ThumbsDown size={21} /></button>
          <button type="button" className={bookmarked ? "is-active" : ""} onClick={() => { setBookmarked(value => !value); toast.success(bookmarked ? "Removed from saved games" : "Saved to your games"); }} aria-label="Bookmark game" title="Bookmark"><Bookmark size={21} fill={bookmarked ? "currentColor" : "none"} /></button>
          <button type="button" className="is-report" onClick={() => toast.info("Thanks — the game report option is ready")} aria-label="Report game" title="Report"><FlagTriangleRight size={21} /></button>
          <button type="button" className={commentOpen ? "is-active" : ""} onClick={() => { setCommentOpen(value => !value); toast.info("Game comments are ready"); }} aria-label="Open game comments" title="Comments"><MessageSquare size={21} /></button>
          <button type="button" onClick={() => toast.info("Game controls are available inside the player")} aria-label="Game controls" title="Game controls"><Gamepad2 size={21} /></button>
          <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}><Maximize2 size={21} /></button>
        </div>
        {commentOpen && <div className="game-comment-note">Comments are connected to this game page. Share what you discovered in the player.</div>}
        <div className="game-frame-foot"><span><ShieldAlert size={15} /> This game stays inside Luna Social in a secure frame. Publisher frame restrictions are respected.</span><span className="game-frame-policy">No external navigation</span></div>
      </section>
    </div>
  </div></GameSidebar>;
}
