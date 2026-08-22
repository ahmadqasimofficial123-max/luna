import { ArrowRight, Moon, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { startLogin } from "@/const";
import { useAppSettings } from "@/contexts/AppSettingsContext";

export default function Landing() {
  const { settings } = useAppSettings();
  return <div className="landing-page"><header className="landing-nav"><div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>{settings.appName}</span></div><button type="button" className="landing-login" onClick={() => startLogin()}>Enter {settings.appName} <ArrowRight size={15} /></button></header><main className="landing-main"><div className="landing-copy"><p className="eyebrow">A QUIET PLACE TO BE SEEN</p><h1>Find your people<br /><em>under the same sky.</em></h1><p>{settings.tagline}</p><button type="button" className="primary-button landing-cta" onClick={() => startLogin()}>Join your orbit <ArrowRight size={17} /></button><div className="landing-proof"><span><Moon size={16} /> Night-first by design</span><span><UsersRound size={16} /> 24k+ quiet connections</span><span><ShieldCheck size={16} /> Built with care</span></div></div><div className="landing-orbit"><div className="landing-glow" /><div className="landing-card landing-card-main"><img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85" alt="Moonlit mountain landscape" /><div><strong>Tonight's signal</strong><span>There is still light in the quiet places.</span></div></div><div className="landing-card landing-card-small"><div className="landing-mini-avatar"><img src="https://i.pravatar.cc/120?img=32" alt="" /></div><span><strong>1,284</strong> people felt this moment</span></div></div></main></div>;
}

