import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, Search, LogOut, Loader2, MessageCircle, Smile, Phone, Video, Palette, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import CallModal from "@/components/CallModal";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
});

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}
interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

function Initials({ name }: { name: string }) {
  const ch = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="grid size-12 shrink-0 place-items-center rounded-full bg-grad-indigo font-display text-base font-bold text-primary-foreground">
      {ch}
    </div>
  );
}

function Avatar({ p, size = 48 }: { p: Profile; size?: number }) {
  if (p.avatar_url) {
    return <img src={p.avatar_url} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  const ch = p.display_name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-grad-indigo font-display font-bold text-primary-foreground"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >{ch}</div>
  );
}

function ChatPage() {
  const { lang } = useI18n();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="grid size-16 place-items-center rounded-3xl bg-grad-indigo shadow-glow">
          <MessageCircle className="size-8 text-primary-foreground" />
        </div>
        <h2 className="mt-5 font-display text-xl font-bold text-foreground">
          {lang === "bn" ? "চ্যাট শুরু করতে সাইন ইন করুন" : "Sign in to start chatting"}
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          {lang === "bn"
            ? "আড্ডায় লগইন করা যেকোনো ব্যবহারকারীর সাথে বাস্তব সময়ে বার্তা পাঠান।"
            : "Send real-time direct messages to any signed-in Adda user."}
        </p>
        <Link to="/login" className="mt-6 rounded-full bg-grad-indigo px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:opacity-95">
          {lang === "bn" ? "সাইন ইন / সাইন আপ" : "Sign in / Sign up"}
        </Link>
      </div>
    );
  }

  return <ChatInner userId={user.id} onSignOut={signOut} />;
}

const EMOJI_GROUPS: Record<string, string[]> = {
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😍", "🥰", "😘", "😜", "😎", "🥳", "🤔", "🥺", "😭", "😡"],
  gestures: ["👋", "👌", "✌️", "🤞", "🤟", "👍", "👎", "👊", "👏", "🙌", "🙏"],
  hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘"],
  fun: ["🔥", "✨", "🎉", "🎈", "🌟", "⭐", "🌈", "⚡", "💥", "💯", "🚀", "🛸", "👑", "💡", "🍀"]
};

const CHAT_THEMES = {
  jamdani: { bn: "জামদানি", en: "Jamdani", emoji: "🧵" },
  padma: { bn: "পদ্মা", en: "Padma", emoji: "🌸" },
  cyber: { bn: "সাইবার", en: "Cyber", emoji: "⚡" },
  night: { bn: "নাইট", en: "Night", emoji: "🌙" },
} as const;

type ChatTheme = keyof typeof CHAT_THEMES;

function ChatInner({ userId, onSignOut }: { userId: string; onSignOut: () => Promise<void> }) {
  const { lang } = useI18n();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [active, setActive] = useState<Profile | null>(null);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Custom Emoji Picker states
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiTab, setEmojiTab] = useState<keyof typeof EMOJI_GROUPS>("smileys");
  const emojiRef = useRef<HTMLDivElement>(null);
  const [chatTheme, setChatTheme] = useState<ChatTheme>("jamdani");
  const [showThemes, setShowThemes] = useState(false);

  // Calling States
  const [callActive, setCallActive] = useState(false);
  const [callRole, setCallRole] = useState<"caller" | "receiver">("caller");
  const [callType, setCallType] = useState<"audio" | "video">("video");
  const [callPeer, setCallPeer] = useState<Profile | null>(null);
  const [callRoomId, setCallRoomId] = useState<string>("");

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to calling signaling channel
  useEffect(() => {
    const ch = supabase
      .channel(`calls_${userId}`)
      .on("broadcast", { event: "incoming-call" }, ({ payload }) => {
        setCallRole("receiver");
        setCallType(payload.callType);
        setCallPeer(payload.caller);
        setCallRoomId(payload.callRoomId);
        setCallActive(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId]);

  const startCall = (type: "audio" | "video") => {
    if (!active) return;
    const room = [userId, active.user_id].sort().join("-");
    setCallRole("caller");
    setCallType(type);
    setCallPeer(active);
    setCallRoomId(room);
    setCallActive(true);
  };

  // Load all profiles (excluding self)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .order("display_name");
      if (error) { toast.error(error.message); return; }
      setProfiles((data ?? []).filter((p) => p.user_id !== userId));
      setMe((data ?? []).find((p) => p.user_id === userId) ?? null);
    })();
  }, [userId]);

  // Subscribe to new messages where I'm sender or recipient
  useEffect(() => {
    const ch = supabase
      .channel(`dm:${userId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${userId}` },
        (payload) => setMessages((prev) => {
          const m = payload.new as Message;
          if (prev.some((x) => x.id === m.id)) return prev;
          return [...prev, m];
        })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  // Load conversation when active changes
  useEffect(() => {
    if (!active) { setMessages([]); return; }
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${active.user_id}),and(sender_id.eq.${active.user_id},recipient_id.eq.${userId})`,
        )
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) { toast.error(error.message); return; }
      setMessages((data ?? []) as Message[]);
    })();
  }, [active, userId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, active]);

  useEffect(() => {
    if (typeof window === "undefined" || !active) return;
    const key = `adda-chat-theme:${active.user_id}`;
    const saved = localStorage.getItem(key) as ChatTheme | null;
    setChatTheme(saved && saved in CHAT_THEMES ? saved : "jamdani");
  }, [active]);

  const chooseChatTheme = (theme: ChatTheme) => {
    setChatTheme(theme);
    if (typeof window !== "undefined" && active) {
      localStorage.setItem(`adda-chat-theme:${active.user_id}`, theme);
    }
    setShowThemes(false);
  };

  const conversation = useMemo(() => {
    if (!active) return [];
    return messages.filter(
      (m) =>
        (m.sender_id === userId && m.recipient_id === active.user_id) ||
        (m.sender_id === active.user_id && m.recipient_id === userId),
    );
  }, [messages, active, userId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => p.display_name.toLowerCase().includes(q));
  }, [profiles, search]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    setSending(true);
    const content = text.trim();
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: userId, recipient_id: active.user_id, content });
    if (error) { toast.error(error.message); setText(content); }
    setSending(false);
  };

  return (
    <>
      {active ? (
        <div className={`chat-theme-${chatTheme} flex h-[calc(100vh-3.5rem-3.5rem)] flex-col bg-background`}>
          <header className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5">
            <button onClick={() => setActive(null)} className="grid size-9 place-items-center rounded-full hover:bg-secondary" aria-label="back">
              <ArrowLeft className="size-4" />
            </button>
            <Avatar p={active} size={36} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm font-bold text-foreground">{active.display_name}</div>
              <div className="text-[11px] text-trust-high">
                {lang === "bn" ? "🔒 এন্ড-টু-এন্ড সুরক্ষিত" : "🔒 End-to-end secured"}
              </div>
            </div>
            {/* Call Action Buttons */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowThemes((v) => !v)}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  aria-label="Chat theme"
                >
                  <Palette className="size-4" />
                </button>
                {showThemes && (
                  <div className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-border bg-popover p-2 shadow-glow">
                    {(Object.keys(CHAT_THEMES) as ChatTheme[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => chooseChatTheme(key)}
                        className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold transition hover:bg-secondary ${chatTheme === key ? "bg-secondary text-primary" : "text-foreground"}`}
                      >
                        <span className={`chat-theme-dot chat-theme-${key}`} />
                        <span className="flex-1">{CHAT_THEMES[key].emoji} {lang === "bn" ? CHAT_THEMES[key].bn : CHAT_THEMES[key].en}</span>
                        {chatTheme === key && <Check className="size-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => startCall("audio")}
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                aria-label="Audio Call"
              >
                <Phone className="size-4" />
              </button>
              <button
                onClick={() => startCall("video")}
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                aria-label="Video Call"
              >
                <Video className="size-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
            {conversation.length === 0 && (
              <p className="mt-10 text-center text-xs text-muted-foreground">
                {lang === "bn" ? "প্রথম বার্তাটি পাঠান 👋" : "Say hello 👋"}
              </p>
            )}
            {conversation.map((m) => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-soft ${
                      mine
                        ? "chat-bubble-out rounded-br-md text-primary-foreground"
                        : "rounded-bl-md border border-border bg-card text-foreground"
                    }`}
                  >
                    {m.content}
                    <div className={`mt-0.5 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="relative flex items-center gap-2 border-t border-border bg-card px-3 py-2">
            {/* Custom Emoji Picker Popover */}
            {showEmoji && (
              <div
                ref={emojiRef}
                className="absolute bottom-14 left-3 z-50 flex h-48 w-64 flex-col rounded-2xl border border-border bg-card p-2 shadow-glow animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="flex gap-2 border-b border-border pb-1 mb-1.5 text-[10px] text-muted-foreground font-bold">
                  <button
                    type="button"
                    onClick={() => setEmojiTab("smileys")}
                    className={`px-2 py-0.5 rounded-full transition ${emojiTab === "smileys" ? "bg-secondary text-foreground" : ""}`}
                  >
                    😀
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmojiTab("gestures")}
                    className={`px-2 py-0.5 rounded-full transition ${emojiTab === "gestures" ? "bg-secondary text-foreground" : ""}`}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmojiTab("hearts")}
                    className={`px-2 py-0.5 rounded-full transition ${emojiTab === "hearts" ? "bg-secondary text-foreground" : ""}`}
                  >
                    ❤️
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmojiTab("fun")}
                    className={`px-2 py-0.5 rounded-full transition ${emojiTab === "fun" ? "bg-secondary text-foreground" : ""}`}
                  >
                    🔥
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-1.5 p-1 content-start justify-items-center">
                  {EMOJI_GROUPS[emojiTab].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setText((prev) => prev + emo)}
                      className="text-lg hover:scale-125 active:scale-95 transition"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className={`grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background transition hover:bg-secondary ${
                showEmoji ? "text-accent border-accent" : "text-muted-foreground"
              }`}
              aria-label="Toggle Emojis"
            >
              <Smile className="size-5" />
            </button>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={lang === "bn" ? "বার্তা লিখুন…" : "Type a message…"}
              maxLength={4000}
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
            <button
              type="submit" disabled={sending || !text.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-grad-indigo text-primary-foreground shadow-glow disabled:opacity-40"
              aria-label="send"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="border-b border-border bg-card px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-bold text-foreground">
                {lang === "bn" ? "মেসেজ" : "Messages"}
              </h1>
              <button
                onClick={() => onSignOut().then(() => toast.success(lang === "bn" ? "সাইন আউট হয়েছে" : "Signed out"))}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <LogOut className="size-3.5" />
                {lang === "bn" ? "সাইন আউট" : "Sign out"}
              </button>
            </div>
            {me && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar p={me} size={24} />
                <span>{lang === "bn" ? "আপনি" : "You"}: <span className="font-bold text-foreground">{me.display_name}</span></span>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                placeholder={lang === "bn" ? "ব্যবহারকারী খুঁজুন…" : "Find a user…"}
              />
            </div>
          </div>

          <ul className="divide-y divide-border bg-card">
            {filtered.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                {lang === "bn"
                  ? "এখনো অন্য কেউ যোগ দেয়নি। কাউকে আড্ডায় আমন্ত্রণ জানান!"
                  : "Nobody else has signed up yet. Invite a friend to Adda!"}
              </li>
            )}
            {filtered.map((p) => (
              <li key={p.user_id}>
                <button
                  onClick={() => setActive(p)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-secondary"
                >
                  <Avatar p={p} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-bold text-foreground">{p.display_name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {lang === "bn" ? "চ্যাট শুরু করতে ট্যাপ করুন" : "Tap to start chatting"}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <p className="px-4 py-6 text-center text-[11px] text-muted-foreground">
            {lang === "bn" ? "🔒 বার্তাগুলো শুধু আপনি ও প্রাপক দেখতে পারবেন" : "🔒 Messages are visible only to you and the recipient"}
          </p>
        </div>
      )}

      {callActive && callPeer && (
        <CallModal
          isOpen={callActive}
          role={callRole}
          callType={callType}
          peer={callPeer}
          myProfile={me}
          callRoomId={callRoomId}
          onClose={() => setCallActive(false)}
        />
      )}
    </>
  );
}
