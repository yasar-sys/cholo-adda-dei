import { useRealtime, REACTION_EMOJIS } from "@/lib/realtime";
import { useI18n } from "@/lib/i18n";

export function FloatingReactions() {
  const { reactions } = useRealtime();
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {reactions.map((r) => (
        <span
          key={r.id}
          className="absolute bottom-20 select-none text-3xl will-change-transform animate-float-up drop-shadow-lg"
          style={{ left: r.x }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  );
}

export function ReactionDock() {
  const { sendReaction } = useRealtime();
  return (
    <div className="pointer-events-auto fixed bottom-24 right-3 z-40 flex flex-col gap-1.5 rounded-full border border-border bg-card/90 p-1.5 shadow-glow backdrop-blur">
      {REACTION_EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => sendReaction(e)}
          className="grid size-9 place-items-center rounded-full text-lg transition hover:scale-110 hover:bg-secondary active:scale-95"
          aria-label={`react ${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

export function OnlinePill() {
  const { online } = useRealtime();
  const { lang } = useI18n();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground">
      <span className="relative grid place-items-center">
        <span className="absolute size-2 animate-ping rounded-full bg-trust-high opacity-75" />
        <span className="size-2 rounded-full bg-trust-high" />
      </span>
      <span className="tabular-nums">{online}</span>
      <span className="text-muted-foreground">{lang === "bn" ? "অনলাইন" : "online"}</span>
    </span>
  );
}
