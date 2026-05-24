import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { SafetyMenu } from "./SafetyMenu";
import { useI18n } from "@/lib/i18n";
import { useRealtime } from "@/lib/realtime";
import { TrustBadge } from "./TrustBadge";
import { cn } from "@/lib/utils";
import type { SamplePost } from "@/lib/sample-data";

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

export function PostCard({ post }: { post: SamplePost }) {
  const { lang } = useI18n();
  const { likes, liked, toggleLike, sendReaction } = useRealtime();
  const author = lang === "bn" ? post.authorBn : post.authorEn;
  const time = lang === "bn" ? post.timeBn : post.timeEn;
  const content = lang === "bn" ? post.contentBn : post.contentEn;
  const liveLikes = post.likes + (likes[post.id] ?? 0);
  const isLiked = !!liked[post.id];

  return (
    <article className="border-b border-border bg-card">
      <header className="flex items-center gap-3 px-4 pt-4">
        <img
          src={post.avatar}
          alt={author}
          width={40}
          height={40}
          loading="lazy"
          className="size-10 rounded-full object-cover ring-2 ring-card outline outline-1 outline-border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate font-display text-sm font-bold text-foreground">{author}</span>
            <TrustBadge level={post.trust} score={post.trustScore} compact />
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-en">{post.handle}</span> · <span>{time}</span>
          </div>
        </div>
        <SafetyMenu postId={post.id} shareText={content} />
      </header>




      <p className="px-4 pt-3 text-[15px] leading-relaxed text-foreground">{content}</p>

      {post.image && (
        <div className="mt-3 overflow-hidden border-y border-border">
          <img src={post.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </div>
      )}

      {post.trust !== "verified" && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-border bg-secondary/60 p-3 text-xs">
          <div className="font-display font-semibold text-foreground">
            {lang === "bn" ? "AI সতর্কতা:" : "AI alert:"}
          </div>
          <p className="text-muted-foreground">
            {lang === "bn"
              ? "এই দাবির পক্ষে নির্ভরযোগ্য উৎস পাওয়া যায়নি। শেয়ার করার আগে যাচাই করুন।"
              : "No reliable sources found for this claim. Verify before sharing."}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between px-2 py-2 text-muted-foreground">
        <button
          onClick={() => toggleLike(post.id)}
          className={cn(
            "group flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition hover:bg-secondary",
            isLiked && "text-destructive"
          )}
        >
          <Heart className={cn("size-4 transition", isLiked && "fill-destructive stroke-destructive", !isLiked && "group-hover:fill-destructive group-hover:stroke-destructive")} />
          <span className="tabular-nums">{fmt(liveLikes)}</span>
        </button>
        <button
          onClick={() => sendReaction("💬", post.id)}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          <MessageCircle className="size-4" />
          <span>{fmt(post.comments)}</span>
        </button>
        <button className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium hover:bg-secondary">
          <Share2 className="size-4" />
          <span>{fmt(post.shares)}</span>
        </button>
        <button className="grid size-9 place-items-center rounded-full hover:bg-secondary" aria-label="save">
          <Bookmark className="size-4" />
        </button>
      </div>
    </article>
  );
}
