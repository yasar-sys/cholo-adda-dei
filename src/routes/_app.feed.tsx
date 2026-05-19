import { createFileRoute } from "@tanstack/react-router";
import { StoriesBar } from "@/components/StoriesBar";
import { PostCard } from "@/components/PostCard";
import { LiveAddaRoom } from "@/components/LiveAddaRoom";
import { ReactionDock } from "@/components/LiveLayer";
import { samplePosts } from "@/lib/sample-data";
import { useI18n } from "@/lib/i18n";
import { Image as ImageIcon, MapPin, Smile, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_app/feed")({
  component: FeedPage,
});

function Composer() {
  const { t, lang } = useI18n();
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-grad-indigo font-display text-sm font-bold text-primary-foreground">আ</div>
        <textarea
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
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
            <ShieldCheck className="size-3.5" /> {t("composer_verify")}
          </button>
          <button className="rounded-full bg-grad-indigo px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-soft hover:opacity-95">
            {t("composer_publish")}
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {lang === "bn"
          ? "পোস্ট করার আগে AI স্বয়ংক্রিয়ভাবে কনটেন্টের বিশ্বাসযোগ্যতা যাচাই করবে।"
          : "AI will automatically verify content credibility before posting."}
      </p>
    </div>
  );
}

function FeedPage() {
  return (
    <div className="space-y-0">
      <StoriesBar />
      <LiveAddaRoom />
      <Composer />
      {samplePosts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
      <ReactionDock />
    </div>
  );
}
