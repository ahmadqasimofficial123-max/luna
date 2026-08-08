import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bookmark, Camera, Compass, Heart, Home as HomeIcon, LogIn, MessageCircle, MoreHorizontal, Plus, Search, Send, Settings, ShieldCheck, Sparkles, UserRound, Users, Video, Bell, Menu, X } from "lucide-react";

const demoPosts = [
  { id: 1, name: "Maya Chen", handle: "mayachen", avatar: "https://i.pravatar.cc/120?img=47", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85", caption: "Found a little more sky than usual today.", likes: 1284, comments: 42, liked: false, saved: false, time: "18 min" },
  { id: 2, name: "Andre Wallace", handle: "andre.w", avatar: "https://i.pravatar.cc/120?img=12", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=85", caption: "Quiet places, loud thoughts.", likes: 891, comments: 19, liked: false, saved: false, time: "2 h" },
];
const stories = [
  { name: "Your story", avatar: "https://i.pravatar.cc/120?img=32", own: true },
  { name: "Maya", avatar: "https://i.pravatar.cc/120?img=47" },
  { name: "Jules", avatar: "https://i.pravatar.cc/120?img=5" },
  { name: "Nia", avatar: "https://i.pravatar.cc/120?img=25" },
  { name: "Theo", avatar: "https://i.pravatar.cc/120?img=68" },
];

function Avatar({ src, size = "md", ring = false }: { src: string; size?: "sm" | "md" | "lg"; ring?: boolean }) { return <div className={`${ring ? "story-ring" : ""} avatar avatar-${size}`}><img src={src} alt="" /></div>; }

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [active, setActive] = useState("Home");
  const [mobileNav, setMobileNav] = useState(false);
  const [posts, setPosts] = useState(demoPosts);
  const [composerOpen, setComposerOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [search, setSearch] = useState("");
  const feedQuery = trpc.social.feed.useQuery({ limit: 10 }, { enabled: isAuthenticated });
  const likeMutation = trpc.social.like.useMutation();
  const saveMutation = trpc.social.save.useMutation();
  const profileName = user?.name || "your profile";
  const shownPosts = useMemo(() => posts.filter(p => !search || `${p.name} ${p.handle} ${p.caption}`.toLowerCase().includes(search.toLowerCase())), [posts, search]);

  const toggle = (id: number, key: "liked" | "saved") => { setPosts(current => current.map(post => post.id === id ? { ...post, [key]: !post[key], likes: key === "liked" ? post.likes + (post.liked ? -1 : 1) : post.likes } : post)); const post = posts.find(p => p.id === id); if (isAuthenticated && post) (key === "liked" ? likeMutation : saveMutation).mutate({ postId: id }, { onError: () => toast.error("Could not update this right now") }); };
  const createPost = () => { if (!caption.trim()) return; setPosts([{ ...demoPosts[0], id: Date.now(), name: user?.name || "You", handle: "you", caption, likes: 0, comments: 0, time: "now", liked: false, saved: false }, ...posts]); setCaption(""); setComposerOpen(false); toast.success("Post shared with your circle"); };
  const navItems = [{ label: "Home", icon: HomeIcon }, { label: "Explore", icon: Compass }, { label: "Messages", icon: MessageCircle }, { label: "Notifications", icon: Bell }, { label: "Profile", icon: UserRound }];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>LUNA</span></div>
      <div className="sidebar-profile"><Avatar src={user ? "https://i.pravatar.cc/120?img=32" : "https://i.pravatar.cc/120?img=32"} size="md" /><div><strong>{profileName}</strong><span>@luna_member</span></div><MoreHorizontal size={16} /></div>
      <nav>{navItems.map(item => <button key={item.label} className={active === item.label ? "nav-item active" : "nav-item"} onClick={() => { setActive(item.label); setMobileNav(false); }}><item.icon size={19} /><span>{item.label}</span>{item.label === "Notifications" && <b className="nav-badge">3</b>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={19} /><span>Settings</span></button><button className="nav-item"><ShieldCheck size={19} /><span>Privacy center</span></button>{isAuthenticated ? <button className="logout-link" onClick={() => logout()}>Log out</button> : <button className="logout-link" onClick={() => startLogin()}><LogIn size={16} /> Sign in</button>}</div>
    </aside>
    {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)} />}
    <main className="main-column">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21} /></button><div className="mobile-brand"><div className="brand-mark"><Sparkles size={15} /></div><span>LUNA</span></div><div className="search-box"><Search size={17} /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Luna" /></div><div className="top-actions"><button className="icon-button"><Bell size={19} /><i /></button><Avatar src="https://i.pravatar.cc/120?img=32" size="sm" /></div></header>
      <div className="feed-wrap">
        <section className="welcome-row"><div><p className="eyebrow">SATURDAY, AUGUST 8</p><h1>Good evening, {user?.name?.split(" ")[0] || "there"}<span className="wave">✦</span></h1><p className="muted">A little inspiration from your orbit.</p></div><Dialog open={composerOpen} onOpenChange={setComposerOpen}><DialogTrigger asChild><Button className="primary-button"><Plus size={18} /> Create post</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Share something with your circle</DialogTitle></DialogHeader><div className="composer-dialog"><div className="composer-author"><Avatar src="https://i.pravatar.cc/120?img=32" size="sm" /><strong>{profileName}</strong></div><Textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="What's on your mind?" rows={5} /><div className="composer-tools"><Button variant="outline"><Camera size={16} /> Add media</Button><Button onClick={createPost} className="primary-button">Share post</Button></div></div></DialogContent></Dialog></section>
        <section className="story-strip"><div className="section-title"><h2>Stories</h2><button>View all</button></div><div className="stories">{stories.map((story, i) => <button className="story" key={story.name} onClick={() => toast.info(story.own ? "Create a story to share your moment" : `${story.name}'s story is opening`)}><div className="story-avatar-wrap"><Avatar src={story.avatar} size="lg" ring={!story.own} />{story.own && <span className="story-plus"><Plus size={12} /></span>}</div><span>{story.name}</span></button>)}</div></section>
        <div className="content-grid"><section className="feed"><div className="feed-header"><h2>For you</h2><button className="sort-button">Latest <span>⌄</span></button></div>{shownPosts.map(post => <article className="post-card" key={post.id}><div className="post-head"><div className="post-author"><Avatar src={post.avatar} size="md" ring /><div><strong>{post.name}</strong><span>@{post.handle} · {post.time}</span></div></div><button className="more-button"><MoreHorizontal size={20} /></button></div><div className="post-media"><img src={post.image} alt="" /><span className="media-count"><Camera size={13} /> 1 / 1</span></div><div className="post-body"><div className="post-actions"><button className={post.liked ? "action active" : "action"} onClick={() => toggle(post.id, "liked")}><Heart size={21} fill={post.liked ? "currentColor" : "none"} /></button><button className="action" onClick={() => toast.info("Comments are ready for your reply")}><MessageCircle size={21} /></button><button className="action"><Send size={20} /></button><button className={post.saved ? "action save active" : "action save"} onClick={() => toggle(post.id, "saved")}><Bookmark size={20} fill={post.saved ? "currentColor" : "none"} /></button></div><strong className="like-count">{post.likes.toLocaleString()} likes</strong><p><strong>{post.handle}</strong> {post.caption}</p><button className="comments-link" onClick={() => toast.info("Open the conversation to see all comments")}>View all {post.comments} comments</button><div className="comment-row"><Input placeholder="Add a comment..." /><button onClick={() => toast.success("Comment posted")}>Post</button></div></div></article>)}</section>
          <aside className="right-rail"><div className="rail-card profile-card"><div className="rail-card-title"><span>Your orbit</span><button>Manage</button></div><div className="orbit-profile"><Avatar src="https://i.pravatar.cc/120?img=32" size="lg" /><div><strong>{profileName}</strong><span>@luna_member</span></div></div><div className="stat-row"><div><strong>24</strong><span>Posts</span></div><div><strong>1.8k</strong><span>Followers</span></div><div><strong>284</strong><span>Following</span></div></div></div><div className="rail-card"><div className="rail-card-title"><span>Suggested for you</span><button>See all</button></div>{["Lena Ortiz", "Sofia Park", "Ravi Singh"].map((name, i) => <div className="suggestion" key={name}><Avatar src={`https://i.pravatar.cc/120?img=${i + 14}`} size="sm" /><div><strong>{name}</strong><span>Suggested for you</span></div><button onClick={() => toast.success(`Follow request sent to ${name}`)}>Follow</button></div>)}</div><div className="rail-card live-card"><div className="live-icon"><Video size={18} /></div><div><strong>Private circles</strong><span>Share closer moments with the people who matter.</span></div><button onClick={() => toast.info("Circles are ready to set up")}>Explore</button></div><p className="footer-note">About · Help · Privacy · Terms · Community Guidelines<br />© 2026 Luna Social</p></aside>
        </div>
      </div>
    </main>
    <nav className="mobile-nav">{navItems.slice(0, 4).map(item => <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => setActive(item.label)}><item.icon size={21} /></button>)}<button onClick={() => setComposerOpen(true)} className="mobile-create"><Plus size={21} /></button></nav>
  </div>;
}
