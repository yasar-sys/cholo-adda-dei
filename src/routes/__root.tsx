import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { RealtimeProvider } from "@/lib/realtime";
import { FloatingReactions } from "@/components/LiveLayer";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">৪০৪</h1>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center rounded-full bg-grad-indigo px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95">
            হোমে ফিরুন · Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold text-foreground">কিছু একটা ভুল হয়েছে</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "আড্ডা — বাংলার বিশ্বস্ত সামাজিক জগৎ" },
      { name: "description", content: "Adda — a Bangla-first social network with built-in AI fact-checking, deepfake detection and trust scoring." },
      { property: "og:title", content: "আড্ডা — বাংলার বিশ্বস্ত সামাজিক জগৎ" },
      { property: "og:description", content: "Adda — a Bangla-first social network with built-in AI fact-checking, deepfake detection and trust scoring." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "আড্ডা — বাংলার বিশ্বস্ত সামাজিক জগৎ" },
      { name: "twitter:description", content: "Adda — a Bangla-first social network with built-in AI fact-checking, deepfake detection and trust scoring." },
      { property: "og:image", content: "/banner.jpg" },
      { name: "twitter:image", content: "/banner.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <RealtimeProvider>
          <Outlet />
          <FloatingReactions />
          <Toaster position="top-center" richColors />
        </RealtimeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
