import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Atom, BookOpen, Braces, FlaskConical, Leaf, Ruler, Sigma, Sparkles, Zap } from "lucide-react";
import { QuestShell, pageHead } from "@/components/quest-shell";
import { QUEST_SUBJECTS, useQuest } from "@/lib/quest";

export const Route = createFileRoute("/subjects")({ head: () => pageHead("The Sultan's Library", "Choose from seven KJSCE Semester 1 subjects and begin your revision quest."), component: Library });
const icons = { sigma: Sigma, atom: Atom, bolt: Zap, flask: FlaskConical, ruler: Ruler, leaf: Leaf, code: Braces };
function Library() {
  const { state } = useQuest();
  return <QuestShell immersive><div className="mx-auto max-w-7xl px-5 pb-24 pt-14">
    <div className="mb-11 max-w-3xl"><p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-primary"><Sparkles className="size-4" /> Chapter I · The collection</p><h1 className="font-display text-4xl leading-tight sm:text-5xl">The Sultan's <span className="text-primary">Library</span></h1><p className="mt-4 text-lg text-muted-foreground">Welcome, Scholar {state.name || "Traveler"} • {state.branch} Guild. Which scroll calls to you tonight?</p></div>
    <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground"><BookOpen className="size-4 text-primary" /> Semester 01 <span className="h-px flex-1 bg-border" /> 07 scrolls</div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{QUEST_SUBJECTS.map((subject, index) => { const Icon = icons[subject.icon as keyof typeof icons]; const progress = state.subjects[subject.id]; const count = progress?.conquered.length ?? 0; return <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }}><Link to="/triage/$subjectId" params={{ subjectId: subject.id }} className="scroll-card group flex h-64 flex-col justify-between p-6"><div className="flex items-start justify-between"><div className="scroll-icon flex size-14 items-center justify-center border border-primary/35 bg-primary/10 text-primary"><Icon className="size-7" /></div><ArrowUpRight className="size-5 text-primary/50 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" /></div><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.2em] text-primary/75">Golden scroll {String(index + 1).padStart(2, "0")}</p><h2 className="font-display text-2xl leading-tight text-foreground">{subject.short}</h2><p className="mt-2 text-xs text-muted-foreground">{subject.modules.length} modules <span className="mx-1">·</span> {count ? `${count} conquered` : "Awaiting your quest"}</p></div></Link></motion.div>; })}</div>
  </div></QuestShell>;
}
