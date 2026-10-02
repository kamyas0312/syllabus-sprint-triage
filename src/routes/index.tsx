import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Lamp, Map, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { QuestShell, pageHead } from "@/components/quest-shell";
import { useQuest } from "@/lib/quest";

export const Route = createFileRoute("/")({ head: () => pageHead("Cave of Wonders", "Begin your KJSCE exam preparation journey through the Cave of Wonders."), component: Onboarding });
const personas = [
  { name: "Genie's Scholar", icon: Lamp, subtitle: "Curious & clever" },
  { name: "Royal Grand Vizier", icon: Crown, subtitle: "Strategic & steady" },
  { name: "Desert Nomad", icon: Map, subtitle: "Bold & adaptable" },
];
function Onboarding() {
  const { state, update, ready } = useQuest();
  const [name, setName] = useState(""); const [branch, setBranch] = useState("COMPS"); const [persona, setPersona] = useState(personas[0].name);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();
  function submit(e: FormEvent) { e.preventDefault(); setTouched(true); if (!name.trim()) return; update({ ...state, name: name.trim(), branch, persona }); navigate({ to: "/subjects" }); }
  return <QuestShell immersive><div className="mx-auto grid min-h-[calc(100vh-146px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-[1fr_440px] lg:gap-20">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="mb-7 inline-flex items-center gap-2 border-b border-primary/50 pb-2 text-xs font-bold uppercase tracking-[0.24em] text-primary"><Sparkles className="size-4" /> Your exam odyssey begins here</div>
      <h1 className="font-display text-5xl leading-[1.15] text-foreground sm:text-6xl lg:text-7xl">Enter the <span className="text-primary">Cave of Wonders</span></h1>
      <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">Seven scrolls. One destiny. Turn your syllabus into a quest worth conquering.</p>
      <div className="mt-12 flex items-center gap-4 text-sm text-primary/80"><span className="h-px w-12 bg-primary/50" /> AGRABAH NIGHTS · SEMESTER I</div>
    </motion.div>
    <motion.form initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }} onSubmit={submit} className="glass-panel w-full p-6 sm:p-8">
      <div className="mb-7 flex items-center gap-3"><div className="flex size-10 items-center justify-center border border-primary/40 bg-primary/10 text-primary"><Lamp className="size-5" /></div><div><p className="text-xs uppercase tracking-[0.2em] text-primary">The first chapter</p><h2 className="font-display text-xl">Reveal your identity</h2></div></div>
      <label htmlFor="traveler" className="block text-sm font-semibold text-foreground">Speak your name, Traveler</label>
      <input id="traveler" value={ready && !touched && !name ? state.name : name} onChange={(e) => { setName(e.target.value); setTouched(true); }} placeholder="Your name" className="quest-input mt-2 w-full" required />
      <label htmlFor="branch" className="mt-5 block text-sm font-semibold">Choose your KJSCE guild</label>
      <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="quest-input mt-2 w-full">{["COMPS", "AI & DS", "IT", "EXTC", "EXCP", "MECH", "RAI"].map((b) => <option key={b}>{b}</option>)}</select>
      <p className="mb-3 mt-6 text-sm font-semibold">Choose your persona</p>
      <div className="grid grid-cols-3 gap-2">{personas.map(({ name: label, icon: Icon, subtitle }) => <Button type="button" key={label} onClick={() => setPersona(label)} variant="outline" aria-pressed={persona === label} className={`h-auto min-w-0 flex-col gap-2 whitespace-normal border p-3 text-center ${persona === label ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/40 text-muted-foreground"}`}><Icon className="!size-5" /><span className="text-xs leading-tight">{label}</span><span className="hidden text-[10px] font-normal opacity-70 sm:block">{subtitle}</span></Button>)}</div>
      <Button type="submit" size="lg" className="mt-7 h-12 w-full font-bold">Begin the Odyssey <ArrowRight /></Button>
      <p className="mt-4 text-center text-xs text-muted-foreground">Your journey is saved on this device.</p>
    </motion.form>
  </div></QuestShell>;
}
