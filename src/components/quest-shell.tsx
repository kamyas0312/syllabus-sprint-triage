import { Link } from "@tanstack/react-router";
import { Compass, MoonStar, ScrollText, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import scene from "@/assets/agrabah-night.jpg";

export function QuestShell({ children, immersive = false }: { children: ReactNode; immersive?: boolean }) {
  return <div className="quest-page min-h-screen text-foreground">
    <div className="stars pointer-events-none fixed inset-0" aria-hidden="true" />
    <header className="relative z-10 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-primary sm:text-xl"><MoonStar className="size-6 shrink-0" /> AgrabahScribe<span className="hidden text-muted-foreground sm:inline">.</span></Link>
        <nav className="flex items-center gap-4 text-xs font-semibold uppercase text-muted-foreground sm:gap-7 sm:text-sm">
    
          <Link to="/" className="flex items-center gap-1.5 transition hover:text-primary"><Compass className="size-4" /> <span className="hidden sm:inline">Traveler</span></Link>
        </nav>
      </div>
    </header>
    {immersive && <div className="pointer-events-none absolute inset-x-0 top-18 h-[740px] overflow-hidden"><img src={scene} width={1536} height={1024} alt="" className="h-full w-full object-cover object-center opacity-65" /><div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" /></div>}
    <main className="relative z-10">{children}</main>
    <footer className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 border-t border-border/60 px-5 py-7 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><Sparkles className="size-3.5 text-primary" /> AgrabahScribe • KJSCE Edition</span><span>One quest at a time.</span></footer>
  </div>;
}
export const pageHead = (title: string, description: string) => ({ meta: [
  { title: `${title} | AgrabahScribe` }, { name: "description", content: description },
  { property: "og:title", content: `${title} | AgrabahScribe` }, { property: "og:description", content: description },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] });
