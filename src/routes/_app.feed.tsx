import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { StoriesBar } from "@/components/StoriesBar";
import { PostCard } from "@/components/PostCard";
import { LiveAddaRoom } from "@/components/LiveAddaRoom";
import { ReactionDock } from "@/components/LiveLayer";
import { useI18n } from "@/lib/i18n";
import { usePosts } from "@/lib/posts";
import { analyzeWithAI } from "@/lib/ai-trust.functions";
import { Image as ImageIcon, MapPin, Smile, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/feed")({
  component: FeedPage,
});

function Composer() {
  const { t, lang } = useI18n();
  const { addPost } = usePosts();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const fn = useServerFn(analyzeWithAI);

  const verify = async () => {
    if (text.trim().length < 5) return toast.error(lang === "bn" ? "অন্তত ৫ অক্ষর" : "Min 5 chars");
    setBusy(true);
    try {
      const r = await fn({ data: { kind: "factcheck", text, lang } });
      setScore(r.confidence);
      toast.success(`${lang === "bn" ? "বিশ্বাস স্কোর" : "Trust"}: ${r.confidence}/100`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const publish = () => {
    if (text.trim().length < 2) return toast.error(lang === "bn" ? "কিছু লিখুন" : "Write something");
    addPost({ contentBn: text, contentEn: text, trustScore: score ?? 80 });
    setText(""); setScore(null);
    toast.success(lang === "bn" ? "পোস্ট প্রকাশিত!" : "Posted!");
  };

  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-grad-indigo font-display text-sm font-bold text-primary-foreground">আ</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder={t("composer_placeholder")}
          className="min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
        />
      </div>
      <div className="mt-2 flex items-center justify-between pl-[52px]">
        <div className="flex gap-1 text-muted-foreground">
          <button className="grid size-9 place-items-center rounded-full hover:bg-secondary" aria-label="image"><ImageIcon className="size-4" /></button>
          <button className="grid size-9 place-items-center rounded-full hover:bg-secondary" aria-label="location"><MapPin className="size-4" /></button>
          <button className="grid size-9 place-items-center rounded-full hover:bg-secondary" aria-label="emoji"><Smile className="size-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={verify} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60">
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
            {t("composer_verify")}
          </button>
          <button onClick={publish} className="rounded-full bg-grad-indigo px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-soft hover:opacity-95">
            {t("composer_publish")}
          </button>
        </div>
      </div>
      {score !== null && (
        <div className="ml-[52px] mt-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold">
          <ShieldCheck className="size-3" />
          {lang === "bn" ? "AI বিশ্বাস" : "AI trust"}: <span className="text-primary">{score}/100</span>
        </div>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        {lang === "bn"
          ? "পোস্ট করার আগে AI দিয়ে বিশ্বাসযোগ্যতা যাচাই করুন।"
          : "Verify credibility with AI before posting."}
      </p>
    </div>
  );
}

function FeedPage() {
  const { posts } = usePosts();
  return (
    <div className="space-y-0">
      <StoriesBar />
      <LiveAddaRoom />
      <Composer />
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
      <ReactionDock />
    </div>
  );
}
