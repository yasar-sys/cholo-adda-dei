import { useEffect, useRef, useState } from "react";
import { Send, Radio } from "lucide-react";
import { useRealtime } from "@/lib/realtime";
import { useI18n } from "@/lib/i18n";

export function LiveAddaRoom() {
  const { chat, sendChat, myName, online } = useRealtime();
  const { lang } = useI18n();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat.length]);

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center gap-2 px-4 pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-destructive">
          <Radio className="size-3 animate-pulse" /> Live
        </span>
        <h2 className="font-display text-base font-bold text-foreground">
          {lang === "bn" ? "আড্ডা ঘর" : "Adda Room"}
        </h2>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {online} {lang === "bn" ? "জন" : "people"}
        </span>
      </div>

      <div className="mx-4 mt-3 h-56 overflow-y-auto rounded-2xl border border-border bg-background px-3 py-2 text-sm">
        {chat.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">
            {lang === "bn" ? "প্রথম বার্তাটি আপনার হোক!" : "Be the first to say something!"}
          </p>
        ) : (
          chat.map((m) => (
            <div key={m.id} className="mb-1.5 leading-snug">
              <span className="font-display text-xs font-bold text-primary">{m.user}</span>
              <span className="ml-2 text-foreground">{m.text}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); sendChat(text); setText(""); }}
        className="m-4 flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5"
      >
        <span className="px-2 text-[11px] font-bold text-muted-foreground">{myName}</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          placeholder={lang === "bn" ? "সবার সাথে আড্ডা দিন…" : "Join the live chat…"}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="grid size-8 place-items-center rounded-full bg-grad-indigo text-primary-foreground shadow-soft disabled:opacity-40"
          aria-label="send"
        >
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
