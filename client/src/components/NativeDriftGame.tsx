import { useEffect, useRef, useState } from "react";
import { RotateCcw, Gauge, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type DriftGameState = { score: number; combo: number; speed: number; x: number; velocity: number; road: number; finished: boolean };

export default function NativeDriftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef({ left: false, right: false });
  const gameRef = useRef<DriftGameState>({ score: 0, combo: 1, speed: 0, x: 0, velocity: 0, road: 0, finished: false });
  const frameRef = useRef<number | null>(null);
  const [stats, setStats] = useState({ score: 0, combo: 1, speed: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { const ratio = Math.min(window.devicePixelRatio || 1, 2); canvas.width = canvas.clientWidth * ratio; canvas.height = canvas.clientHeight * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0); };
    const onKey = (event: KeyboardEvent, down: boolean) => { if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) event.preventDefault(); if (["ArrowLeft", "a", "A"].includes(event.key)) keysRef.current.left = down; if (["ArrowRight", "d", "D"].includes(event.key)) keysRef.current.right = down; };
    const down = (event: KeyboardEvent) => onKey(event, true); const up = (event: KeyboardEvent) => onKey(event, false);
    window.addEventListener("resize", resize); window.addEventListener("keydown", down); window.addEventListener("keyup", up); resize();
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now; const state = gameRef.current; const w = canvas.clientWidth; const h = canvas.clientHeight;
      if (!state.finished) {
        const steering = Number(keysRef.current.right) - Number(keysRef.current.left); state.velocity += steering * 430 * dt; state.velocity *= Math.pow(.035, dt); state.x += state.velocity * dt; state.x = Math.max(-w * .36, Math.min(w * .36, state.x)); state.speed = Math.min(180, state.speed + 34 * dt); state.road += state.speed * dt;
        const drifting = Math.abs(state.velocity) > 38 && Math.abs(steering) > 0; if (drifting) { state.score += Math.round(state.speed * dt * state.combo); state.combo = Math.min(9, state.combo + dt * .55); } else state.combo = Math.max(1, state.combo - dt * .7); if (state.road > 8000) state.finished = true;
        if (Math.floor(now / 100) % 3 === 0) setStats({ score: Math.floor(state.score), combo: Number(state.combo.toFixed(1)), speed: Math.round(state.speed) });
      }
      const gradient = ctx.createLinearGradient(0, 0, 0, h); gradient.addColorStop(0, "#17162b"); gradient.addColorStop(1, "#090912"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#191b2a"; ctx.fillRect(0, h * .25, w, h * .75);
      const roadWidth = Math.min(520, w * .78); const center = w / 2 + Math.sin(state.road / 900) * w * .12; ctx.fillStyle = "#343646"; ctx.beginPath(); ctx.moveTo(center - roadWidth * .36, 0); ctx.lineTo(center + roadWidth * .36, 0); ctx.lineTo(center + roadWidth * .5, h); ctx.lineTo(center - roadWidth * .5, h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#e4bc5c"; ctx.lineWidth = 3; ctx.setLineDash([26, 26]); ctx.lineDashOffset = -state.road % 52; ctx.beginPath(); ctx.moveTo(center, 0); ctx.lineTo(center, h); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < 12; i++) { const y = (i * 82 + state.road * .55) % (h + 100) - 50; const curve = Math.sin((state.road + i * 170) / 900) * w * .12; ctx.fillStyle = i % 2 ? "#5e507e" : "#2c6b68"; ctx.beginPath(); ctx.arc(w * .13 + curve, y, 13, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(w * .87 + curve, y + 32, 11, 0, Math.PI * 2); ctx.fill(); }
      const carX = w / 2 + state.x; const carY = h * .68; ctx.save(); ctx.translate(carX, carY); ctx.rotate(state.velocity / 1100); ctx.shadowColor = "#ff715f88"; ctx.shadowBlur = 24; ctx.fillStyle = "#ef665c"; ctx.roundRect(-29, -52, 58, 104, 17); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#27233a"; ctx.roundRect(-20, -27, 40, 26, 9); ctx.fill(); ctx.fillStyle = "#f8d47d"; ctx.fillRect(-22, 35, 12, 5); ctx.fillRect(10, 35, 12, 5); ctx.restore();
      if (state.finished) { ctx.fillStyle = "#0a0912cc"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "600 26px Space Grotesk"; ctx.fillText("Run complete", w / 2, h / 2 - 12); ctx.font = "14px DM Sans"; ctx.fillStyle = "#c4bbd1"; ctx.fillText(`Final score ${Math.floor(state.score).toLocaleString()}`, w / 2, h / 2 + 18); }
      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw); return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); window.removeEventListener("resize", resize); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const setSteer = (side: "left" | "right", pressed: boolean) => { keysRef.current[side] = pressed; };
  const restart = () => { gameRef.current = { score: 0, combo: 1, speed: 0, x: 0, velocity: 0, road: 0, finished: false }; setStats({ score: 0, combo: 1, speed: 0 }); };
  return <div className="native-drift-game"><div className="native-drift-hud"><span><strong>{stats.score.toLocaleString()}</strong> score</span><span><strong>x{stats.combo}</strong> combo</span><span><Gauge size={15} /> {stats.speed} km/h</span><Button type="button" size="sm" variant="outline" onClick={restart}><RotateCcw size={14} /> Restart</Button></div><canvas ref={canvasRef} aria-label="Playable native drift game. Use left and right arrow keys or A and D to steer." /><div className="native-drift-controls"><button type="button" aria-label="Steer left" onPointerDown={() => setSteer("left", true)} onPointerUp={() => setSteer("left", false)} onPointerCancel={() => setSteer("left", false)}><ArrowLeft /></button><p>Steer with A/D or arrow keys</p><button type="button" aria-label="Steer right" onPointerDown={() => setSteer("right", true)} onPointerUp={() => setSteer("right", false)} onPointerCancel={() => setSteer("right", false)}><ArrowRight /></button></div></div>;
}
