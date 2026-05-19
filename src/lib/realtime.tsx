import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Reaction = { id: string; emoji: string; x: number; postId?: string };
type ChatMsg = { id: string; user: string; text: string; ts: number };

interface RealtimeCtx {
  online: number;
  myId: string;
  myName: string;
  setName: (n: string) => void;
  reactions: Reaction[];
  sendReaction: (emoji: string, postId?: string) => void;
  likes: Record<string, number>;
  toggleLike: (postId: string) => void;
  liked: Record<string, boolean>;
  chat: ChatMsg[];
  sendChat: (text: string) => void;
}

const Ctx = createContext<RealtimeCtx | null>(null);

const EMOJIS = ["❤️", "🔥", "🌸", "👏", "🎉", "😍"];
const NAMES_BN = ["আদিল", "তানিয়া", "সাকিব", "মীম", "অর্ণব", "ফারিয়া", "জারিফ", "রিয়া"];

function randomName() {
  return NAMES_BN[Math.floor(Math.random() * NAMES_BN.length)] + " " + Math.floor(Math.random() * 99);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(1);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [myName, setMyName] = useState<string>("");
  const myIdRef = useRef<string>("");
  const channelRef = useRef<RealtimeChannel | null>(null);

  if (!myIdRef.current && typeof window !== "undefined") {
    myIdRef.current = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("adda-name");
    setMyName(saved && saved.trim() ? saved : randomName());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !myName) return;
    const ch = supabase.channel("adda:lobby", {
      config: { presence: { key: myIdRef.current }, broadcast: { self: false } },
    });
    channelRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      setOnline(Object.keys(state).length || 1);
    });
    ch.on("broadcast", { event: "reaction" }, ({ payload }) => {
      const r: Reaction = { id: Math.random().toString(36).slice(2), emoji: payload.emoji, x: payload.x, postId: payload.postId };
      setReactions((prev) => [...prev, r]);
      setTimeout(() => setReactions((p) => p.filter((x) => x.id !== r.id)), 2600);
    });
    ch.on("broadcast", { event: "like" }, ({ payload }) => {
      setLikes((prev) => ({ ...prev, [payload.postId]: (prev[payload.postId] ?? 0) + (payload.delta as number) }));
    });
    ch.on("broadcast", { event: "chat" }, ({ payload }) => {
      setChat((prev) => [...prev.slice(-49), payload as ChatMsg]);
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ name: myName, at: Date.now() });
      }
    });

    return () => { supabase.removeChannel(ch); channelRef.current = null; };
  }, [myName]);

  const sendReaction = (emoji: string, postId?: string) => {
    const x = typeof window !== "undefined" ? Math.random() * (window.innerWidth - 80) + 20 : 100;
    const r: Reaction = { id: Math.random().toString(36).slice(2), emoji, x, postId };
    setReactions((prev) => [...prev, r]);
    setTimeout(() => setReactions((p) => p.filter((x) => x.id !== r.id)), 2600);
    channelRef.current?.send({ type: "broadcast", event: "reaction", payload: { emoji, x, postId } });
  };

  const toggleLike = (postId: string) => {
    const isLiked = !!liked[postId];
    const delta = isLiked ? -1 : 1;
    setLiked((p) => ({ ...p, [postId]: !isLiked }));
    setLikes((p) => ({ ...p, [postId]: (p[postId] ?? 0) + delta }));
    if (!isLiked) sendReaction("❤️", postId);
    channelRef.current?.send({ type: "broadcast", event: "like", payload: { postId, delta } });
  };

  const sendChat = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMsg = { id: Math.random().toString(36).slice(2), user: myName, text: text.trim(), ts: Date.now() };
    setChat((prev) => [...prev.slice(-49), msg]);
    channelRef.current?.send({ type: "broadcast", event: "chat", payload: msg });
  };

  const setName = (n: string) => {
    setMyName(n);
    if (typeof window !== "undefined") localStorage.setItem("adda-name", n);
  };

  const value = useMemo<RealtimeCtx>(() => ({
    online, myId: myIdRef.current, myName, setName,
    reactions, sendReaction, likes, toggleLike, liked, chat, sendChat,
  }), [online, myName, reactions, likes, liked, chat]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRealtime() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRealtime must be used inside RealtimeProvider");
  return c;
}

export const REACTION_EMOJIS = EMOJIS;
