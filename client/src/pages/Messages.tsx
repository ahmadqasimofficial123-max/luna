import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, Check, CheckCheck, FilePlus2, Image as ImageIcon, Mic, MoreHorizontal, Paperclip, Phone, Pin, Search, Send, Smile, Sparkles, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { selectConversationAfterInboxRefresh } from "./messages-selection";

type ChatMessage = { id: number; conversationId: number; senderId: number; body: string; attachmentUrl?: string | null; attachmentType?: "image" | "video" | "voice" | null; createdAt: Date; readAt?: Date | null; optimistic?: boolean; reaction?: string };
type Conversation = { id: number; name: string; username: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean; group?: boolean; pinned?: boolean };
type MemberResult = { id: number; name: string | null; displayName: string | null; username: string | null; avatarUrl: string | null; isPrivate: boolean };
export function outgoingMessageStatus(message: { optimistic?: boolean }) { return message.optimistic ? "Sending…" : "Sent"; }



function formatTime(value: Date | string) { return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function fileToBase64(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] || ""); reader.onerror = reject; reader.readAsDataURL(file); }); }

export default function Messages() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ conversationId: string }>("/messages/:conversationId");
  const routeConversationId = Number(params?.conversationId || 0);
  const [selectedId, setSelectedId] = useState(routeConversationId || 0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [reactionById, setReactionById] = useState<Record<number, string>>({});
  const composerRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const inboxQuery = trpc.social.inbox.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 10000 });
  const memberSearchQuery = trpc.social.memberSearch.useQuery({ query: search.trim() }, { enabled: isAuthenticated && search.trim().length >= 2, staleTime: 20_000 });
  const openConversationMutation = trpc.social.openDirectConversation.useMutation({ onSuccess: async result => { if (result.conversationId > 0) { await selectConversationAfterInboxRefresh({ conversationId: result.conversationId, refreshInbox: () => inboxQuery.refetch(), clearSearch: () => setSearch(""), navigate }); } } });
  const messagesQuery = trpc.social.messages.useQuery({ conversationId: selectedId || undefined }, { enabled: isAuthenticated && selectedId > 0, refetchInterval: 5000 });
  const sendMutation = trpc.social.sendMessage.useMutation();
  const reactMessageMutation = trpc.social.reactToMessage.useMutation();
  const markReadMutation = trpc.social.markMessagesRead.useMutation();
  const uploadMutation = trpc.media.upload.useMutation();
  const conversations = useMemo<Conversation[]>(() => (inboxQuery.data || []).map(item => ({ id: item.conversation, name: item.member.displayName || item.member.name || "Luna member", username: item.member.username ? `@${item.member.username}` : "Luna member", avatar: item.member.avatarUrl || "https://i.pravatar.cc/120?img=47", lastMessage: item.lastMessage?.body || (item.lastMessage?.attachmentType ? `Sent a ${item.lastMessage.attachmentType}` : "Start a new signal"), time: item.lastMessage ? formatTime(item.lastMessage.createdAt) : "New", unread: item.unreadCount || 0, online: false })), [inboxQuery.data]);
  const selected = conversations.find(item => item.id === selectedId);
  const serverMessages = useMemo<ChatMessage[]>(() => (messagesQuery.data || []).map(message => ({ id: message.id, conversationId: message.conversationId, senderId: message.senderId, body: message.body || "", attachmentUrl: message.attachmentUrl, attachmentType: message.attachmentType, createdAt: new Date(message.createdAt), readAt: message.readAt ? new Date(message.readAt) : null })), [messagesQuery.data]);
  const messages = [...serverMessages, ...localMessages.filter(message => message.conversationId === selectedId && !serverMessages.some(server => server.id === message.id))];
  const visibleConversations = conversations.filter(item => (!search || `${item.name} ${item.username} ${item.lastMessage}`.toLowerCase().includes(search.toLowerCase())) && (filter === "all" || (filter === "unread" ? item.unread > 0 : item.group)));
  const memberResults = (memberSearchQuery.data || []) as MemberResult[];
  const selectMember = (member: MemberResult) => { if (openConversationMutation.isPending) return; void openConversationMutation.mutateAsync({ memberId: member.id }).catch(() => toast.error("Could not open this conversation")); };

  useEffect(() => { setSelectedId(routeConversationId || 0); }, [routeConversationId]);
  useEffect(() => { if (inboxQuery.data && selectedId > 0 && !inboxQuery.data.some(item => item.conversation === selectedId)) { setSelectedId(0); navigate("/messages"); } }, [inboxQuery.data, selectedId, navigate]);
  useEffect(() => { if (!loading && !isAuthenticated) navigate("/welcome"); }, [loading, isAuthenticated, navigate]);
  useEffect(() => { setLocalMessages([]); setDraft(""); setAttachment(null); }, [selectedId]);
  useEffect(() => { if (selectedId > 0 && messagesQuery.data?.length) void markReadMutation.mutateAsync({ conversationId: selectedId }); }, [selectedId, messagesQuery.data?.length]);
  const selectedConversation = selected || { id: 0, name: "Luna Social", username: "Choose a conversation", avatar: "https://i.pravatar.cc/120?img=32", lastMessage: "", time: "", unread: 0, online: false };

  const selectConversation = (id: number) => { setSelectedId(id); navigate(`/messages/${id}`); };
  const send = async () => {
    const body = draft.trim();
    if ((!body && !attachment) || sendMutation.isPending || uploadMutation.isPending) return;
    const optimisticId = -Date.now();
    const previewUrl = attachment ? URL.createObjectURL(attachment) : undefined;
    const attachmentType = attachment?.type.startsWith("image") ? "image" : attachment?.type.startsWith("video") ? "video" : undefined;
    const optimistic: ChatMessage = { id: optimisticId, conversationId: selectedId, senderId: user?.id || 0, body, attachmentUrl: previewUrl, attachmentType, createdAt: new Date(), optimistic: true };
    setLocalMessages(current => [...current, optimistic]); setDraft(""); setAttachment(null); setEmojiOpen(false);
    try {
      let uploadedUrl: string | undefined;
      if (attachment) uploadedUrl = (await uploadMutation.mutateAsync({ filename: attachment.name, contentType: attachment.type || "application/octet-stream", data: await fileToBase64(attachment) })).url;
      const created = await sendMutation.mutateAsync({ conversationId: selectedId, body, attachmentUrl: uploadedUrl, attachmentType });
      setLocalMessages(current => current.map(message => message.id === optimisticId ? { ...message, id: created.id, attachmentUrl: uploadedUrl, optimistic: false, createdAt: new Date() } : message));
      await messagesQuery.refetch();
    } catch { setLocalMessages(current => current.map(message => message.id === optimisticId ? { ...message, optimistic: false } : message)); toast.error("Message could not be sent"); }
  };
  const onComposerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } };
  const addReaction = async (messageId: number, reaction: string) => { const nextReaction = reactionById[messageId] === reaction ? "" : reaction; setReactionById(current => ({ ...current, [messageId]: nextReaction })); try { await reactMessageMutation.mutateAsync({ messageId, reaction: nextReaction }); toast.success(nextReaction ? "Reaction added" : "Reaction removed"); } catch { toast.error("Could not save reaction"); } };

  if (loading || !isAuthenticated) return <div className="auth-gate"><div className="auth-gate-card"><div className="brand-mark"><Sparkles size={22} /></div><p className="muted">Loading your messages…</p></div></div>;
  return <div className={`messages-page ${selectedId ? "has-selection" : "no-selection"}`}>
    <aside className="messages-sidebar">
      <div className="messages-sidebar-head"><div><p className="eyebrow">YOUR PRIVATE ORBIT</p><h1>Messages</h1></div><Button className="primary-button" size="icon" aria-label="Start a new message" onClick={() => { setSearch(""); searchRef.current?.focus(); }}><FilePlus2 size={17} /></Button></div>
      <div className="message-search"><Search size={16} /><Input ref={searchRef} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search conversations or members" /></div>
      {search.trim().length >= 2 && <div className="member-search-results" aria-label="Matching members">{memberSearchQuery.isLoading && <p className="member-search-hint">Searching members…</p>}{!memberSearchQuery.isLoading && memberResults.map(member => <button type="button" className="member-search-result" key={member.id} onClick={() => selectMember(member)} disabled={openConversationMutation.isPending}><img src={member.avatarUrl || "https://i.pravatar.cc/120?img=47"} alt="" /><span><strong>{member.displayName || member.name || "Luna member"}</strong><small>{member.username ? `@${member.username}` : "Luna member"}</small></span><FilePlus2 size={15} /></button>)}{!memberSearchQuery.isLoading && !memberResults.length && <p className="member-search-hint">No members match “{search.trim()}”.</p>}</div>}
      <div className="message-filters">{(["all", "unread", "groups"] as const).map(item => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item[0].toUpperCase() + item.slice(1)}{item === "unread" && conversations.reduce((total, conversation) => total + conversation.unread, 0) > 0 && <span>{conversations.reduce((total, conversation) => total + conversation.unread, 0)}</span>}</button>)}</div>
      <div className="conversation-list">{visibleConversations.map(item => <button type="button" key={item.id} className={`conversation-row ${item.id === selectedId ? "active" : ""}`} onClick={() => selectConversation(item.id)}><div className="conversation-avatar"><img src={item.avatar} alt="" />{item.online && <i />}</div><div className="conversation-copy"><div><strong>{item.name}</strong><small>{item.time}</small></div><p>{item.lastMessage}</p></div>{item.pinned && <Pin size={13} className="conversation-pin" />}{item.unread > 0 && <b className="unread-badge">{item.unread}</b>}</button>)}{!visibleConversations.length && <div className="message-empty-small"><Search size={18} /><p>No conversations match that filter.</p></div>}</div>
      <Link href="/" className="messages-back-link"><ArrowLeft size={15} /> Back to your orbit</Link>
    </aside>
    <main className="chat-panel">
      {selectedId > 0 && <header className="chat-header"><div className="chat-person"><button type="button" className="mobile-back" onClick={() => navigate("/messages")} aria-label="Back to inbox"><ArrowLeft size={18} /></button><div className="conversation-avatar large"><img src={selectedConversation.avatar} alt="" />{selectedConversation.online && <i />}</div><div><h2>{selectedConversation.name}</h2><p>{selectedConversation.online ? "Active now" : "Last seen recently"} · {selectedConversation.username}</p></div></div><div className="chat-actions"><button type="button" aria-label="Search messages" onClick={() => toast.info("Message search is ready for this conversation")}><Search size={18} /></button><button type="button" aria-label="Start voice call" onClick={() => toast.info("Voice calls will connect when your circle is online")}><Phone size={18} /></button><button type="button" aria-label="Start video call" onClick={() => toast.info("Video calls will connect when your circle is online")}><Video size={18} /></button><button type="button" aria-label="More conversation actions" onClick={() => toast.info("Conversation controls opened")}><MoreHorizontal size={18} /></button></div></header>}
      <section className="chat-messages" aria-live="polite">{!selectedId && <div className="chat-empty"><div className="chat-empty-orb"><Sparkles size={23} /></div><h2>Luna Social Messages</h2><p>Select a conversation to start chatting.</p><Button className="primary-button" onClick={() => { setSearch(""); searchRef.current?.focus(); }}><FilePlus2 size={16} /> New message</Button></div>}{selectedId > 0 && messages.length === 0 && <div className="chat-empty"><div className="chat-empty-orb"><Sparkles size={23} /></div><h2>Start a new signal</h2><p>Say hello to {selectedConversation.name} and keep the orbit moving.</p></div>}{messages.map(message => { const own = message.senderId === user?.id; const reaction = reactionById[message.id] || message.reaction; return <div className={`message-line ${own ? "own" : ""}`} key={message.id}><div className="message-bubble" onContextMenu={event => { event.preventDefault(); void addReaction(message.id, "❤️"); }}><p>{message.body}</p>{message.attachmentUrl && (message.attachmentType === "video" ? <video src={message.attachmentUrl} controls className="message-media" /> : <img src={message.attachmentUrl} alt="Message attachment" className="message-media" />)}<div className="message-meta"><span>{formatTime(message.createdAt)}</span>{own && <span>{outgoingMessageStatus(message)}</span>}</div>{reaction && <span className="message-reaction">{reaction}</span>}</div><button type="button" className="reaction-button" aria-label="React with heart" onClick={() => void addReaction(message.id, "❤️")}>{reaction || "♡"}</button></div>; })}</section>
      <div className="typing-hint"><span /><span /><span /> {selected ? (selected.online ? `${selected.name.split(" ")[0]} is active now` : "Your messages are private") : "Choose a conversation to begin"}</div>
      {selectedId > 0 && attachment && <div className="attachment-preview"><div><Paperclip size={15} /> {attachment.name}<small>{Math.ceil(attachment.size / 1024)} KB</small></div><button type="button" onClick={() => setAttachment(null)} aria-label="Remove attachment"><X size={15} /></button></div>}
      {selectedId > 0 && <footer className="chat-composer"><div className="composer-icon-wrap"><label className="composer-icon" aria-label="Attach image or video"><ImageIcon size={18} /><input type="file" accept="image/*,video/*" onChange={event => setAttachment(event.target.files?.[0] || null)} /></label><button type="button" className="composer-icon" aria-label="Add attachment" onClick={() => toast.info("Images and videos can be attached with the media button")}><Paperclip size={18} /></button></div><div className="composer-input-wrap">{emojiOpen && <div className="emoji-popover">{["❤️", "😂", "👍", "😮", "✨", "🌙"].map(emoji => <button type="button" key={emoji} onClick={() => { setDraft(current => current + emoji); composerRef.current?.focus(); }}>{emoji}</button>)}</div>}<Input ref={composerRef} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={onComposerKeyDown} placeholder="Write a message…" aria-label="Message text" /><button type="button" className="emoji-button" onClick={() => setEmojiOpen(open => !open)} aria-label="Choose emoji"><Smile size={17} /></button></div><button type="button" className="composer-icon voice-button" onClick={() => toast.info("Voice messages need microphone permission and are ready to connect")} aria-label="Record voice message"><Mic size={18} /></button><Button className="primary-button send-button" disabled={!draft.trim() && !attachment} onClick={() => void send()} aria-label="Send message"><Send size={17} /></Button></footer>}
    </main>
  </div>;
}
