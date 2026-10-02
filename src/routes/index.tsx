import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Coffee, FlaskConical, Pause, Play, RotateCcw, Siren, Timer, X, Zap, Target, GraduationCap } from "lucide-react";
import hero from "@/assets/study-desk.jpg";
import { SUBJECTS, STRATEGY, type Status } from "@/lib/syllabus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyllabusSprint • KJSCE Edition — Exam Revision Triage" },
      { name: "description", content: "Triage your KJSCE first-year syllabus, rate topics, and generate a 45-minute sprint roadmap before MSE or ESE." },
      { property: "og:title", content: "SyllabusSprint • KJSCE Edition" },
      { property: "og:description", content: "90-second revision triage and sprint roadmap for KJSCE Semester 1." },
    ],
  }),
  component: App,
});

type Exam = "mse" | "ese";
type State = { subjectId: string; exam: Exam; active: Record<string, string[]>; status: Record<string, Status>; hours: number; rescue: boolean };
const KEY = "syllabussprint-v1";
const defaultActive = (sid: string, exam: Exam) => {
  const s = SUBJECTS.find((x) => x.id === sid)!;
  return (exam === "mse" ? s.modules.slice(0, 3) : s.modules).map((m) => m.id);
};
const initial: State = { subjectId: "am1", exam: "mse", active: {}, status: {}, hours: 10, rescue: false };

const STATUS_META: Record<Status, { label: string; dot: string; on: string }> = {
  clueless: { label: "Clueless", dot: "bg-clueless", on: "bg-clueless text-primary-foreground border-clueless" },
  fuzzy: { label: "Fuzzy", dot: "bg-fuzzy", on: "bg-fuzzy text-primary border-fuzzy" },
  mastered: { label: "Mastered", dot: "bg-mastered", on: "bg-mastered text-primary-foreground border-mastered" },
};
const WEIGHT = { clueless: 3, unset: 2.2, fuzzy: 2, mastered: 0.6 };

function App() {
  const [st, setSt] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);
  const [vault, setVault] = useState(false);
  const [sprint, setSprint] = useState<string | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setSt({ ...initial, ...JSON.parse(raw) }); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(st)); }, [st, loaded]);

  const subject = SUBJECTS.find((s) => s.id === st.subjectId)!;
  const activeKey = `${st.subjectId}:${st.exam}`;
  const activeIds = st.active[activeKey] ?? defaultActive(st.subjectId, st.exam);
  const marks = st.exam === "mse" ? subject.mse : subject.ese;
  const passMark = Math.ceil(marks * 0.4);
  const activeModules = subject.modules.filter((m) => activeIds.includes(m.id));

  const rescueModules = useMemo(() => {
    const total = activeModules.reduce((a, m) => a + m.hours, 0);
    const sorted = [...activeModules].sort((a, b) => b.hours - a.hours);
    const out: string[] = []; let got = 0;
    for (const m of sorted) { if (got >= passMark * 1.25) break; out.push(m.id); got += (m.hours / total) * marks; }
    return { ids: out, projected: Math.round(got) };
  }, [activeModules, passMark, marks]);

  const scopeModules = st.rescue ? activeModules.filter((m) => rescueModules.ids.includes(m.id)) : activeModules;

  const plan = useMemo(() => {
    const topics = scopeModules.flatMap((m) => m.topics.map((t, i) => {
      const key = `${m.id}#${i}`; const s = st.status[key];
      return { key, name: t, module: m, status: s, score: WEIGHT[s ?? "unset"] * m.hours };
    })).filter((t) => !(st.rescue && t.status === "mastered")).sort((a, b) => b.score - a.score);
    const queue = topics.flatMap((t) => (t.status === "clueless" ? [t, { ...t, part: 2 }] : [t])) as (typeof topics[number] & { part?: number })[];
    const n = Math.max(1, Math.floor((st.hours * 60 + 10) / 55));
    const blocks = Array.from({ length: n }, (_, i) => {
      const startMin = i * 55;
      return { i, startMin, topic: queue[i] ?? null };
    });
    return { blocks, uncovered: Math.max(0, queue.length - n) };
  }, [scopeModules, st.status, st.hours, st.rescue]);

  const setExam = (exam: Exam) => setSt((s) => ({ ...s, exam }));
  const toggleModule = (id: string) => setSt((s) => ({ ...s, active: { ...s.active, [activeKey]: activeIds.includes(id) ? activeIds.filter((x) => x !== id) : [...activeIds, id] } }));
  const setStatus = (key: string, v: Status) => setSt((s) => { const status = { ...s.status }; status[key] === v ? delete status[key] : (status[key] = v); return { ...s, status }; });
  const fmt = (min: number) => { const h = Math.floor(min / 60), mm = min % 60; return `${h}h ${mm.toString().padStart(2, "0")}m`; };
  const sprintTopic = plan.blocks.find((b) => b.topic?.key + "-" + b.i === sprint)?.topic;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="relative overflow-hidden">
        <img src={hero} alt="Warm study desk with notebook, fountain pen and coffee" width={1600} height={768} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-background" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground backdrop-blur">
              <GraduationCap className="h-4 w-4" /> K. J. Somaiya College of Engineering
            </span>
            <button onClick={() => setVault(true)} className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground shadow-warm transition hover:brightness-110">
              <FlaskConical className="h-4 w-4" /> Formula Vault
            </button>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-14 text-5xl font-extrabold tracking-tight text-primary-foreground md:text-7xl">
            SyllabusSprint <span className="italic font-medium text-fuzzy">• KJSCE Edition</span>
          </motion.h1>
          <p className="mt-4 max-w-xl font-serif text-lg italic text-primary-foreground/85">"Not everything deserves your time the night before. Triage ruthlessly, sprint deliberately."</p>

          <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-warm md:grid-cols-[1.4fr_1fr]">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject</span>
              <select value={st.subjectId} onChange={(e) => setSt((s) => ({ ...s, subjectId: e.target.value }))} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 font-serif text-lg font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-ring">
                {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </label>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Exam Type</span>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                {([["mse", "Mid-Sem", subject.mse, Zap], ["ese", "End-Sem", subject.ese, Target]] as const).map(([id, l, mk, Icon]) => (
                  <button key={id} onClick={() => setExam(id)} className={`relative rounded-lg px-3 py-2.5 text-sm font-bold transition ${st.exam === id ? "text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}>
                    {st.exam === id && <motion.span layoutId="exam" className="absolute inset-0 rounded-lg bg-primary" />}
                    <span className="relative inline-flex items-center gap-1.5"><Icon className="h-4 w-4" />{l} ({mk})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-2 grid max-w-6xl gap-8 px-5 lg:grid-cols-[340px_1fr]">
        {/* Module scope */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-warm">
            <h2 className="text-2xl font-bold text-primary">Module Scope</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tick what's appearing in the paper.</p>
            <ul className="mt-5 space-y-2">
              {subject.modules.map((m, i) => {
                const on = activeIds.includes(m.id);
                return (
                  <li key={m.id}>
                    <button onClick={() => toggleModule(m.id)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${on ? "border-secondary bg-accent" : "border-border opacity-60 hover:opacity-100"}`}>
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{on && "✓"}</span>
                      <span className="flex-1">
                        <span className="block text-xs font-bold uppercase tracking-wider text-secondary">Module {i + 1}</span>
                        <span className="block font-semibold leading-snug text-primary">{m.name}</span>
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{m.hours}h</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-warm">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-bold text-primary">Revision Time</h3>
              <span className="font-serif text-4xl font-extrabold text-primary">{st.hours}<span className="text-base font-sans text-muted-foreground"> hrs</span></span>
            </div>
            <input type="range" min={2} max={30} value={st.hours} onChange={(e) => setSt((s) => ({ ...s, hours: +e.target.value }))} className="wood-range mt-5 w-full" aria-label="Available revision hours" />
            <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground"><span>2h</span><span>30h</span></div>
            <p className="mt-3 text-sm text-muted-foreground">{plan.blocks.length} sprint blocks · 45 min focus + 10 min break</p>
          </section>

          <section className={`rounded-2xl border p-6 shadow-warm transition ${st.rescue ? "border-clueless bg-clueless/10" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Siren className={`h-5 w-5 ${st.rescue ? "text-clueless" : "text-secondary"}`} /><h3 className="text-lg font-bold text-primary">40% Pass Rescue</h3></div>
              <button role="switch" aria-checked={st.rescue} onClick={() => setSt((s) => ({ ...s, rescue: !s.rescue }))} className={`relative h-7 w-12 rounded-full transition ${st.rescue ? "bg-clueless" : "bg-muted"}`}>
                <motion.span layout className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow ${st.rescue ? "right-1" : "left-1"}`} />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Target: <b className="text-primary">{passMark}/{marks}</b>. {st.rescue ? <>Focusing on {rescueModules.ids.length} heaviest module(s) — projected ≈ <b className="text-primary">{rescueModules.projected} marks</b>. Mastered topics skipped.</> : "Turn on to keep only the highest-weightage modules needed to pass."}
            </p>
          </section>
        </aside>

        <div className="space-y-10">
          {/* Triage */}
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Step 01</p>
                <h2 className="text-3xl font-bold text-primary md:text-4xl">The 90-Second Triage Matrix</h2>
              </div>
              <div className="flex gap-3 text-xs font-semibold text-muted-foreground">
                {(Object.keys(STATUS_META) as Status[]).map((k) => <span key={k} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[k].dot}`} />{STATUS_META[k].label}</span>)}
              </div>
            </div>
            {activeModules.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Select at least one module to begin triage.</p>}
            <div className="mt-6 space-y-6">
              {activeModules.map((m) => {
                const dim = st.rescue && !rescueModules.ids.includes(m.id);
                return (
                  <div key={m.id} className={dim ? "opacity-40" : ""}>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-primary"><BookOpen className="h-4 w-4 text-secondary" />{m.name} <span className="font-sans text-xs font-bold text-muted-foreground">· {m.hours} hrs{dim && " · skipped in rescue"}</span></h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {m.topics.map((t, i) => {
                        const key = `${m.id}#${i}`; const cur = st.status[key];
                        return (
                          <motion.div key={key} layout className="rounded-xl border border-border bg-card p-4 shadow-warm">
                            <p className="font-semibold leading-snug text-primary">{t}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {(Object.keys(STATUS_META) as Status[]).map((s) => (
                                <button key={s} onClick={() => setStatus(key, s)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition ${cur === s ? STATUS_META[s].on : "border-border text-muted-foreground hover:border-secondary"}`}>
                                  {cur !== s && <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />}{STATUS_META[s].label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Roadmap */}
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Step 02</p>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">Your Sprint Roadmap</h2>
            <p className="mt-1 text-muted-foreground">Clueless topics in heavy modules go first. Clueless topics get two sprints.</p>
            {plan.uncovered > 0 && <p className="mt-3 rounded-lg bg-clueless/10 px-4 py-2 text-sm font-semibold text-clueless">{plan.uncovered} sprint(s) don't fit in {st.hours}h — add time or switch on Rescue Mode.</p>}
            <ol className="relative mt-8 space-y-4 border-l-2 border-border pl-8">
              {plan.blocks.map((b) => (
                <motion.li key={b.i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="relative">
                  <span className={`absolute -left-[42px] top-5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-background ${b.topic?.status ? STATUS_META[b.topic.status].dot : "bg-secondary"}`} />
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-warm">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Sprint {b.i + 1} · {fmt(b.startMin)} – {fmt(b.startMin + 45)}</span>
                      {b.topic && <span className="text-secondary">{b.topic.module.name}</span>}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-primary">{b.topic ? b.topic.name + (b.topic.part ? " (Part 2: problems)" : "") : "Mixed PYQ practice & weak-spot review"}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.topic ? STRATEGY[b.topic.status ?? "unset"] : "Solve a full previous-year section under timed conditions and revisit your fuzziest topic."}</p>
                    <button onClick={() => setSprint((b.topic?.key ?? "pyq") + "-" + b.i)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:bg-secondary">
                      <Play className="h-4 w-4" /> Start Study Sprint
                    </button>
                  </div>
                  {b.i < plan.blocks.length - 1 && <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Coffee className="h-3.5 w-3.5" /> 10-min break</p>}
                </motion.li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      {/* Formula Vault */}
      <AnimatePresence>
        {vault && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVault(false)} className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm" />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-background p-7 shadow-warm">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Formula Vault</p><h2 className="text-2xl font-bold text-primary">{subject.name}</h2></div>
                <button onClick={() => setVault(false)} aria-label="Close" className="rounded-full p-2 text-primary hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-6 space-y-5">
                {subject.formulas.map((g) => (
                  <div key={g.title} className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-lg font-semibold text-primary">{g.title}</h3>
                    <ul className="mt-2 space-y-1.5">{g.items.map((f) => <li key={f} className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm text-primary">{f}</li>)}</ul>
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{sprint && <Pomodoro title={sprintTopic?.name ?? "Mixed PYQ practice"} onClose={() => setSprint(null)} />}</AnimatePresence>
    </div>
  );
}

function Pomodoro({ title, onClose }: { title: string; onClose: () => void }) {
  const TOTAL = 45 * 60;
  const [left, setLeft] = useState(TOTAL);
  const [run, setRun] = useState(true);
  useEffect(() => {
    if (!run || left <= 0) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [run, left]);
  const pct = 1 - left / TOTAL; const R = 110; const C = 2 * Math.PI * R;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-primary/85 p-5 backdrop-blur-md">
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md rounded-3xl border border-border bg-background p-8 text-center shadow-warm">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-primary hover:bg-muted"><X className="h-5 w-5" /></button>
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary"><Timer className="h-4 w-4" /> Deep Focus Sprint</p>
        <h3 className="mt-2 text-2xl font-bold text-primary">{title}</h3>
        <div className="relative mx-auto mt-6 h-64 w-64">
          <svg viewBox="0 0 260 260" className="h-full w-full -rotate-90">
            <circle cx="130" cy="130" r={R} className="fill-none stroke-muted" strokeWidth="12" />
            <circle cx="130" cy="130" r={R} className="fill-none stroke-secondary transition-all duration-1000" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-6xl font-extrabold tabular-nums text-primary">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</span>
            <span className="mt-1 text-sm text-muted-foreground">{left === 0 ? "Sprint complete — take your break ☕" : run ? "Phone face-down. Breathe." : "Paused"}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => setRun((r) => !r)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-secondary">{run ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Play</>}</button>
          <button onClick={() => { setLeft(TOTAL); setRun(false); }} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 font-bold text-primary hover:bg-muted"><RotateCcw className="h-4 w-4" />Reset</button>
        </div>
        <p className="mt-6 font-serif italic text-muted-foreground">"Small daily improvements are the key to staggering long-term results."</p>
      </motion.div>
    </motion.div>
  );
}
