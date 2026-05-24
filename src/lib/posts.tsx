import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { samplePosts, type SamplePost } from "./sample-data";

interface NewPostInput {
  contentBn: string;
  contentEn?: string;
  image?: string;
  trustScore?: number;
  trust?: SamplePost["trust"];
}

interface PostsCtx {
  posts: SamplePost[];
  addPost: (p: NewPostInput) => void;
  hidePost: (id: string) => void;
  reportPost: (id: string, reason: string) => void;
  reports: Record<string, string>;
}

const Ctx = createContext<PostsCtx | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<SamplePost[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<Record<string, string>>({});

  const value = useMemo<PostsCtx>(() => ({
    posts: [...extra, ...samplePosts].filter((p) => !hidden.has(p.id)),
    addPost: (p) => {
      const score = p.trustScore ?? 85;
      const trust: SamplePost["trust"] =
        p.trust ?? (score >= 70 ? "verified" : score >= 40 ? "suspicious" : "false");
      setExtra((cur) => [{
        id: `u-${Date.now()}`,
        authorBn: "আপনি",
        authorEn: "You",
        handle: "@you",
        avatar: "/logo.png",
        timeBn: "এইমাত্র",
        timeEn: "just now",
        contentBn: p.contentBn,
        contentEn: p.contentEn || p.contentBn,
        image: p.image,
        trust,
        trustScore: score,
        likes: 0,
        comments: 0,
        shares: 0,
      }, ...cur]);
    },
    hidePost: (id) => setHidden((s) => new Set(s).add(id)),
    reportPost: (id, reason) => setReports((r) => ({ ...r, [id]: reason })),
    reports,
  }), [extra, hidden, reports]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePosts() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePosts must be used inside PostsProvider");
  return c;
}
