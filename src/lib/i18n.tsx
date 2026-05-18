import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "bn" | "en";

const dict = {
  appName:        { bn: "ইনফিনিটি",            en: "Infinity" },
  tagline:        { bn: "বাংলার বিশ্বস্ত সামাজিক জগৎ", en: "Bangla's trusted social world" },

  // nav
  nav_feed:    { bn: "ফিড",       en: "Feed" },
  nav_reels:   { bn: "রিলস",      en: "Reels" },
  nav_post:    { bn: "পোস্ট",     en: "Post" },
  nav_chat:    { bn: "মেসেজ",     en: "Chat" },
  nav_trust:   { bn: "AI বিশ্বাস", en: "AI Trust" },
  nav_profile: { bn: "প্রোফাইল",   en: "Profile" },

  // composer
  composer_placeholder: { bn: "আপনি কী ভাবছেন?", en: "What's on your mind?" },
  composer_publish:     { bn: "পোস্ট করুন",       en: "Publish" },
  composer_verify:      { bn: "AI দিয়ে যাচাই",   en: "Verify with AI" },

  // post actions
  like:    { bn: "ভালো",     en: "Like" },
  comment: { bn: "মন্তব্য",  en: "Comment" },
  share:   { bn: "শেয়ার",    en: "Share" },
  save:    { bn: "সংরক্ষণ",   en: "Save" },

  // stories
  stories: { bn: "গল্প",     en: "Stories" },
  your_story: { bn: "আপনার গল্প", en: "Your story" },

  // trust badges
  trust_verified:   { bn: "যাচাইকৃত",          en: "Verified" },
  trust_suspicious: { bn: "সন্দেহজনক",          en: "Suspicious" },
  trust_false:      { bn: "ভুয়া তথ্য",          en: "False info" },
  trust_score:      { bn: "বিশ্বাসযোগ্যতা",     en: "Trust score" },

  // AI hub
  ai_hub_title:      { bn: "AI বিশ্বাস কেন্দ্র", en: "AI Trust Center" },
  ai_hub_sub:        { bn: "তথ্য যাচাই, ডিপফেক শনাক্তকরণ, ভুল তথ্য ফিল্টার ও জনমত বিশ্লেষণ — একসাথে।", en: "Fact-checking, deepfake detection, misinformation filter and sentiment — all in one." },
  ai_factcheck:      { bn: "তথ্য যাচাই",         en: "Fact Check" },
  ai_factcheck_desc: { bn: "একটি দাবি লিখুন — উৎসসহ যাচাই পাবেন", en: "Paste a claim — get a sourced verdict" },
  ai_deepfake:       { bn: "ডিপফেক শনাক্ত",      en: "Deepfake Detect" },
  ai_deepfake_desc:  { bn: "ছবি বা ভিডিও লিংক বিশ্লেষণ",      en: "Analyze an image or video link" },
  ai_misinfo:        { bn: "ভুল তথ্য ফিল্টার",     en: "Misinformation Filter" },
  ai_misinfo_desc:   { bn: "কনটেন্ট বিশ্লেষণ ও ব্যাখ্যা",      en: "Explainable content moderation" },
  ai_sentiment:      { bn: "জনমত বিশ্লেষণ",       en: "Sentiment Intelligence" },
  ai_sentiment_desc: { bn: "জনসাধারণের প্রতিক্রিয়া বুঝুন",     en: "Understand audience reactions" },
  ai_trust_score:    { bn: "বিশ্বাস স্কোর",         en: "Trust Score" },
  ai_trust_score_desc:{bn: "যেকোনো উৎসের নির্ভরযোগ্যতা",        en: "Credibility of any source" },

  analyze: { bn: "বিশ্লেষণ করুন", en: "Analyze" },
  analyzing: { bn: "বিশ্লেষণ হচ্ছে…", en: "Analyzing…" },
  input_placeholder: { bn: "এখানে দাবি, লিংক বা টেক্সট লিখুন…", en: "Paste claim, link or text here…" },
  verdict:    { bn: "রায়",        en: "Verdict" },
  confidence: { bn: "নিশ্চয়তা",   en: "Confidence" },
  reasoning:  { bn: "ব্যাখ্যা",     en: "Reasoning" },
  sources:    { bn: "উৎস",        en: "Sources" },
  result_empty: { bn: "ফলাফল এখানে দেখা যাবে।", en: "Results will appear here." },

  // chat
  chat_search: { bn: "খুঁজুন…", en: "Search…" },
  online_now:  { bn: "এখন অনলাইন", en: "Online now" },

  // home
  trending: { bn: "ট্রেন্ডিং", en: "Trending" },
} as const;

type Key = keyof typeof dict;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  toggle: () => void;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("infinity-lang") as Lang | null;
    if (saved === "bn" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("infinity-lang", l);
  };

  const t = (k: Key) => dict[k][lang];

  return (
    <Ctx.Provider value={{ lang, setLang, t, toggle: () => setLang(lang === "bn" ? "en" : "bn") }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used inside I18nProvider");
  return c;
}
