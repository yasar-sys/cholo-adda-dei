import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  kind: z.enum(["factcheck", "deepfake", "misinfo", "sentiment", "trustscore"]),
  text: z.string().min(2).max(4000),
  lang: z.enum(["bn", "en"]).default("bn"),
});

interface AIResult {
  verdict: string;
  confidence: number; // 0-100
  reasoning: string;
  sources: { title: string; url?: string }[];
}

const systemPrompts: Record<string, (lang: "bn" | "en") => string> = {
  factcheck: (lang) =>
    lang === "bn"
      ? "আপনি একজন বাংলাভাষী তথ্য-যাচাইকারী। প্রদত্ত দাবিটি যাচাই করুন। উত্তর সংক্ষিপ্ত, প্রমাণ-ভিত্তিক ও বাংলায় দিন।"
      : "You are a careful Bangla/English fact-checker. Verify the given claim. Be concise and evidence-based.",
  deepfake: (lang) =>
    lang === "bn"
      ? "আপনি একজন মিডিয়া ফরেনসিক বিশ্লেষক। প্রদত্ত লিংক/বর্ণনার ভিত্তিতে সম্ভাব্য ডিপফেক লক্ষণ ব্যাখ্যা করুন।"
      : "You are a media forensics analyst. Explain likely deepfake indicators for the provided link/description.",
  misinfo: (lang) =>
    lang === "bn"
      ? "আপনি একজন বিষয়বস্তু মডারেটর। ভুল তথ্য, ক্ষতিকর দাবি বা বিভ্রান্তিকর সংকেত শনাক্ত করুন এবং কেন তা ব্যাখ্যা করুন।"
      : "You are a content moderator. Identify misinformation or harmful/misleading signals and explain why.",
  sentiment: (lang) =>
    lang === "bn"
      ? "আপনি একজন জনমত বিশ্লেষক। বাংলা/ইংরেজি কনটেন্টের সামগ্রিক অনুভূতি (ইতিবাচক/নেতিবাচক/মিশ্র), মূল থিম ও পরামর্শ দিন।"
      : "You are a sentiment analyst. Summarize overall sentiment (positive/negative/mixed), key themes and a recommendation.",
  trustscore: (lang) =>
    lang === "bn"
      ? "আপনি একজন উৎস বিশ্বাসযোগ্যতা বিশ্লেষক। প্রদত্ত উৎস/দাবির বিশ্বাসযোগ্যতা মূল্যায়ন করুন।"
      : "You are a source-credibility analyst. Evaluate the credibility of the given source/claim.",
};

export const analyzeWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AIResult> => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error("AI gateway not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY.");
    }

    const sys = systemPrompts[data.kind](data.lang);

    const responseSchema = {
      type: "object",
      properties: {
        verdict: { type: "string", description: data.lang === "bn" ? "এক বাক্যে রায়" : "One-sentence verdict" },
        confidence: { type: "number", description: "0-100 integer" },
        reasoning: { type: "string", description: data.lang === "bn" ? "২-৪ বাক্যে কারণ" : "2-4 sentences of reasoning" },
        sources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              url: { type: "string" },
            },
            required: ["title"],
          },
        },
      },
      required: ["verdict", "confidence", "reasoning", "sources"],
      additionalProperties: false,
    } as const;

    // Use Gemini's OpenAI-compatible endpoint or standard OpenAI endpoint
    const url = process.env.GEMINI_API_KEY
      ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

    const modelName = process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "gpt-4o-mini";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: sys + (data.lang === "bn" ? " সর্বদা JSON-এ উত্তর দিন।" : " Always answer in JSON.") },
          { role: "user", content: data.text },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_analysis",
              description: "Submit the structured analysis result",
              parameters: responseSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI error ${res.status}: ${t.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };

    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No structured output from AI.");

    const parsed = JSON.parse(args) as AIResult;
    return {
      verdict: String(parsed.verdict ?? ""),
      confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0))),
      reasoning: String(parsed.reasoning ?? ""),
      sources: Array.isArray(parsed.sources) ? parsed.sources.slice(0, 6) : [],
    };
  });
