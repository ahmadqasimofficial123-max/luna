import { ExternalLink, Gamepad2, Play, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { HUB_GAMES } from "./game-config";
import { useAppSettings } from "@/contexts/AppSettingsContext";

export default function GamesHub() {
  const [, navigate] = useLocation();
  const { settings } = useAppSettings();

  return <main className="games-hub-page">
    <header className="games-hub-topbar"><button type="button" className="game-back-link" onClick={() => navigate("/")}><span className="brand-mark"><Sparkles size={15} /></span>{settings.appName}</button><div className="games-hub-topmark"><Gamepad2 size={18} /> Games</div><button type="button" className="game-source-link" onClick={() => navigate("/")}>Back to Luna <ExternalLink size={15} /></button></header>
    <div className="games-hub-content">
      <section className="games-hub-hero"><div><p className="eyebrow">THE LUNA ARCADE</p><h1>Play something<br /><em>unexpected.</em></h1><p>Pick a game and jump in. Some games open in their original publisher window so the experience stays true to the creators.</p></div><div className="games-hub-stat"><strong>{HUB_GAMES.length}</strong><span>games ready<br />for your orbit</span></div></section>
      <section className="games-grid" aria-label="Available games">{HUB_GAMES.map(game => <article className="game-card" key={game.slug} style={{ "--card-accent": game.accent } as React.CSSProperties}>
        <div className="game-card-art">{game.coverUrl ? <img src={game.coverUrl} alt="" /> : <div className="game-card-art-placeholder"><Gamepad2 size={45} /></div>}<span className="game-card-genre">{game.genre}</span><span className="game-card-glow" /></div>
        <div className="game-card-body"><p className="eyebrow">{game.eyebrow}</p><h2>{game.title}</h2><p>{game.description}</p><div className="game-card-actions">{game.mode === "embedded" ? <button type="button" className="game-play-button" onClick={() => navigate(`/games/${game.slug}`)}><Play size={15} fill="currentColor" /> Play here</button> : <a className="game-play-button" href={game.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open game</a>}<span className="game-card-host">{game.mode === "embedded" ? "Luna player" : "Publisher site"}</span></div></div>
      </article>)}</section>
      <p className="games-hub-note">Games marked <strong>Publisher site</strong> open in a new tab because their original hosts control the playable experience and may restrict embedding.</p>
    </div>
  </main>;
}
