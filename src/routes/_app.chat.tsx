import { createFileRoute } from "@tanstack/react-router";
import { Search, Phone, Video, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { sampleChats } from "@/lib/sample-data";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
});

function ChatPage() {
  const { t, lang } = useI18n();
  return (
    <div>
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">
            {lang === "bn" ? "মেসেজ" : "Messages"}
          </h1>
          <button className="grid size-9 place-items-center rounded-full bg-grad-indigo text-primary-foreground shadow-soft" aria-label="new">
            <Plus className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" placeholder={t("chat_search")} />
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{t("online_now")}</div>
          <div className="scroll-hide flex gap-3 overflow-x-auto">
            {sampleChats.filter((c) => c.online).map((c) => (
              <button key={c.id} className="flex w-14 shrink-0 flex-col items-center gap-1">
                <div className="relative">
                  <img src={c.avatar} alt="" width={48} height={48} loading="lazy" className="size-12 rounded-full object-cover" />
                  <span className="absolute bottom-0 right-0 size-3 rounded-full bg-trust-high ring-2 ring-card" />
                </div>
                <span className="truncate text-[10px] font-medium">{lang === "bn" ? c.nameBn : c.nameEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-border bg-card">
        {sampleChats.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3 active:bg-secondary">
            <div className="relative">
              <img src={c.avatar} alt="" width={52} height={52} loading="lazy" className="size-13 rounded-full object-cover" />
              {c.online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-trust-high ring-2 ring-card" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-display text-sm font-bold text-foreground">{lang === "bn" ? c.nameBn : c.nameEn}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">{lang === "bn" ? c.lastBn : c.lastEn}</span>
                {c.unread > 0 && (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-grad-indigo text-[10px] font-bold text-primary-foreground">{c.unread}</span>
                )}
              </div>
            </div>
            <button className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="call">
              <Phone className="size-4" />
            </button>
            <button className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="video">
              <Video className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <p className="px-4 py-6 text-center text-[11px] text-muted-foreground">
        {lang === "bn" ? "🔒 এন্ড-টু-এন্ড এনক্রিপ্টেড · AI স্ক্যাম সতর্কতা চালু" : "🔒 End-to-end encrypted · AI scam alerts on"}
      </p>
    </div>
  );
}
