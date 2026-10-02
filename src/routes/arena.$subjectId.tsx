import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Coins,
  Crown,
  FileEdit,
  Hourglass,
  Info,
  Lock,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Scroll,
  ShieldAlert,
  Sigma,
  Sparkles,
  Sword,
  Target,
  Trash2,
  Trophy,
  Wind,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestShell, pageHead } from "@/components/quest-shell";
import { QUEST_SUBJECTS, makePlan, useSubjectQuest } from "@/lib/quest";

export const Route = createFileRoute("/arena/$subjectId")({
  head: ({ params }) =>
    pageHead(
      "Focus Arena",
      `Active timer, strict to-do checklist, and formula vault for ${params.subjectId}.`
    ),
  component: FocusArena,
});

type StudyStyle = "nomad" | "vizier" | "sultan";

const STYLE_MINUTES: Record<StudyStyle, { focus: number; rest: number }> = {
  nomad: { focus: 25, rest: 5 },
  vizier: { focus: 50, rest: 10 },
  sultan: { focus: 90, rest: 15 },
};

const DIFFICULTY_METADATA = {
  Cursed: { label: "Cursed (Hard)", bounty: 100 },
  Sands: { label: "Sands (Moderate)", bounty: 75 },
  Oasis: { label: "Oasis (Easy)", bounty: 50 },
};

interface CustomFormula {
  id: string;
  title: string;
  equation: string;
}

function FocusArena() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const subject = QUEST_SUBJECTS.find((s) => s.id === subjectId);
  const { config, updateConfig } = useSubjectQuest(subjectId);

  // Read configured settings
  const selectedStyle = ((localStorage.getItem(`persona_${subjectId}`) as StudyStyle) || "vizier");
  const coverageTarget = ((localStorage.getItem(`coverage_${subjectId}`) as "pass" | "full") || "full");
  const styleConfig = STYLE_MINUTES[selectedStyle];

  // Timer State
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(styleConfig.focus * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  // Briefing toggle
  const [showBriefing, setShowBriefing] = useState<boolean>(true);

  // Active topic
  const [activeTopicKey, setActiveTopicKey] = useState<string | null>(null);

  // Side-by-side vault
  const [vaultTab, setVaultTab] = useState<"formulas" | "notes">("formulas");
  const [newFormulaTitle, setNewFormulaTitle] = useState("");
  const [newFormulaEq, setNewFormulaEq] = useState("");
  const [showFullVaultModal, setShowFullVaultModal] = useState(false);

  // Persistent notes & formulas
  const [topicNotes, setTopicNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`notes_${subjectId}`) || "{}");
    } catch {
      return {};
    }
  });

  const [topicFormulas, setTopicFormulas] = useState<Record<string, CustomFormula[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`formulas_${subjectId}`) || "{}");
    } catch {
      return {};
    }
  });

  // Dinars & sessions
  const [goldCoins, setGoldCoins] = useState<number>(() => {
    return Number(localStorage.getItem(`gold_${subjectId}`) || 250);
  });
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(() => {
    return Number(localStorage.getItem(`sessions_${subjectId}`) || 0);
  });

  // Ambient sound synthesizer
  const [ambientWind, setAmbientWind] = useState<boolean>(false);
  const windAudioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (ambientWind) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        windAudioContext.current = ctx;
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(380, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start(0);
      } catch (e) {}
    } else {
      if (windAudioContext.current) {
        windAudioContext.current.close();
        windAudioContext.current = null;
      }
    }
    return () => {
      if (windAudioContext.current) windAudioContext.current.close();
    };
  }, [ambientWind]);

  // Timer Tick
  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionCompleted(true);
      setCompletedSessionsCount((c) => {
        const next = c + 1;
        localStorage.setItem(`sessions_${subjectId}`, String(next));
        return next;
      });

      try {
        const ctx = new AudioContext();
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.15);
          osc.stop(ctx.currentTime + idx * 0.15 + 0.4);
        });
      } catch (err) {}
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft]);

  if (!subject) {
    return (
      <QuestShell>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">Scroll Not Found</h1>
          <Link to="/subjects" className="mt-5 inline-block text-primary">
            Return to Library
          </Link>
        </div>
      </QuestShell>
    );
  }

  const rawPlan = makePlan(subject, config);

  const normalizedPlan = rawPlan.map((item) => {
    const rawDiff = (item.difficulty || "").toLowerCase();
    let standardized: "Cursed" | "Sands" | "Oasis" = "Sands";
    if (rawDiff.includes("hard") || rawDiff.includes("curse")) standardized = "Cursed";
    else if (rawDiff.includes("easy") || rawDiff.includes("oasis")) standardized = "Oasis";

    return {
      ...item,
      normalizedDifficulty: standardized,
      difficultyLabel: DIFFICULTY_METADATA[standardized].label,
      bountyAmount: DIFFICULTY_METADATA[standardized].bounty,
      isConquered: config.conquered.includes(item.key),
    };
  });

  let triageFiltered = [...normalizedPlan];
  if (coverageTarget === "pass") {
    const cursed = normalizedPlan.filter((t) => t.normalizedDifficulty === "Cursed");
    const sands = normalizedPlan.filter((t) => t.normalizedDifficulty === "Sands");
    const halfCount = Math.max(1, Math.ceil(normalizedPlan.length * 0.55));
    triageFiltered = [...cursed, ...sands].slice(0, halfCount);
  }

  const totalUserHours = config.hours || 6;
  const difficultyWeights = { Cursed: 3.0, Sands: 1.8, Oasis: 1.0 };
  const weightedSum = triageFiltered.reduce(
    (acc, cur) => acc + (difficultyWeights[cur.normalizedDifficulty] || 1.8),
    0
  );

  const studyBlocks = triageFiltered.map((item) => {
    const weight = difficultyWeights[item.normalizedDifficulty] || 1.8;
    const computedMinutes = Math.max(
      20,
      Math.round(((weight / (weightedSum || 1)) * totalUserHours * 60) / 5) * 5
    );
    const intervalsNeeded = Math.max(1, Math.round(computedMinutes / styleConfig.focus));

    return {
      ...item,
      allocatedMinutes: computedMinutes,
      intervalsCount: intervalsNeeded,
    };
  });

  const activeItem =
    studyBlocks.find((b) => b.key === activeTopicKey) ||
    studyBlocks.find((b) => !b.isConquered) ||
    studyBlocks[0];

  const conqueredCount = triageFiltered.filter((b) => b.isConquered).length;
  const progressPercent =
    triageFiltered.length > 0 ? Math.round((conqueredCount / triageFiltered.length) * 100) : 0;

  // Strict anti-cheat checkbox trigger
  const attemptToggleCheckbox = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeItem?.key !== key) {
      setActiveTopicKey(key);
      setLockWarning("Trial switched! Focus through the hourglass to unlock.");
      setTimeout(() => setLockWarning(null), 4000);
      return;
    }

    if (!sessionCompleted && secondsLeft > 0) {
      setLockWarning(`Sands are locked! Complete ${formatTime(secondsLeft)} in deep focus to conquer.`);
      setTimeout(() => setLockWarning(null), 4000);
      return;
    }

    handleClaimVictory(key);
  };

  const handleClaimVictory = (key: string) => {
    const target = studyBlocks.find((b) => b.key === key) || activeItem;
    if (!target) return;

    const isDone = config.conquered.includes(key);
    const updated = isDone
      ? config.conquered.filter((k) => k !== key)
      : [...config.conquered, key];

    updateConfig({ conquered: updated });

    if (!isDone) {
      const reward = target.bountyAmount || 50;
      const newCoins = goldCoins + reward;
      setGoldCoins(newCoins);
      localStorage.setItem(`gold_${subjectId}`, String(newCoins));
    }

    setSessionCompleted(false);
    setSecondsLeft(styleConfig.focus * 60);
    setLockWarning(null);
  };

  const handleAddFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !newFormulaTitle.trim() || !newFormulaEq.trim()) return;

    const currentList = topicFormulas[activeItem.key] || [];
    const newEntry: CustomFormula = {
      id: Date.now().toString(),
      title: newFormulaTitle.trim(),
      equation: newFormulaEq.trim(),
    };

    const updated = { ...topicFormulas, [activeItem.key]: [...currentList, newEntry] };
    setTopicFormulas(updated);
    localStorage.setItem(`formulas_${subjectId}`, JSON.stringify(updated));

    const newCoins = goldCoins + 10;
    setGoldCoins(newCoins);
    localStorage.setItem(`gold_${subjectId}`, String(newCoins));

    setNewFormulaTitle("");
    setNewFormulaEq("");
  };

  const handleDeleteFormula = (formulaId: string) => {
    if (!activeItem) return;
    const currentList = topicFormulas[activeItem.key] || [];
    const updatedList = currentList.filter((f) => f.id !== formulaId);
    const updated = { ...topicFormulas, [activeItem.key]: updatedList };
    setTopicFormulas(updated);
    localStorage.setItem(`formulas_${subjectId}`, JSON.stringify(updated));
  };

  const handleNoteSave = (text: string) => {
    if (!activeItem) return;
    const updated = { ...topicNotes, [activeItem.key]: text };
    setTopicNotes(updated);
    localStorage.setItem(`notes_${subjectId}`, JSON.stringify(updated));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  };

  const activeTopicFormulaList = (activeItem && topicFormulas[activeItem.key]) || [];

  return (
    <QuestShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-28 pt-8">
        {/* Top Status Bar with Dual Winds & Dinars */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            to="/study/$subjectId"
            params={{ subjectId }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="size-4" /> Back to Strategy & Timetable
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullVaultModal(true)}
              className="border-primary/40 text-primary hover:bg-primary/10 gap-1.5 text-xs rounded-xl shadow-sm"
            >
              <BookOpen className="size-3.5" /> Review All Saved Inscriptions
            </Button>

            <button
              onClick={() => setAmbientWind(!ambientWind)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                ambientWind
                  ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                  : "border-primary/20 bg-black/40 text-muted-foreground hover:text-white"
              }`}
            >
              <Wind className="size-3.5" />
              <span>{ambientWind ? "Wind Active" : "Dune Winds"}</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/40 bg-gradient-to-r from-amber-500/10 via-primary/15 to-amber-500/10 text-primary shadow-lg">
              <Crown className="size-3.5 text-amber-400" />
              <div className="flex items-center gap-1 font-mono text-xs font-extrabold text-amber-300">
                <Coins className="size-3.5 text-amber-400 animate-pulse" />
                <span>{goldCoins} Dinars</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP GLOWING PROGRESS BANNER */}
        <div className="bg-[#141B3D]/85 backdrop-blur-md rounded-2xl p-6 border border-primary/30 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="size-4" /> Focus Arena Progress
              </div>
              <h1 className="font-display text-2xl sm:text-3xl text-white mt-1">
                {subject.name}
              </h1>
            </div>

            <div className="text-right">
              <span className="font-mono text-primary font-bold text-2xl">{progressPercent}%</span>
              <p className="text-xs text-muted-foreground">
                Conquered {conqueredCount} of {triageFiltered.length} Trials
              </p>
            </div>
          </div>

          <div className="w-full h-3.5 bg-black/60 rounded-full border border-primary/20 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-primary to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(245,189,71,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* SCROLL OF ENGAGEMENT & BRIEFING */}
        <div className="mb-8 bg-gradient-to-r from-[#1E1736]/90 via-[#141B3D]/90 to-[#10243E]/90 rounded-2xl p-5 border border-primary/40 shadow-2xl">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowBriefing(!showBriefing)}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30">
                <Scroll className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  Scroll of Engagement: Mission Briefing & Exact Timeline
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active trial: <span className="text-primary font-bold">{activeItem?.name}</span> ({activeItem?.difficultyLabel}).
                </p>
              </div>
            </div>
            <button className="text-xs font-semibold text-primary flex items-center gap-1">
              {showBriefing ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>

          <AnimatePresence>
            {showBriefing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-primary/20 mt-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-primary/20">
                    <span className="font-mono text-xs font-bold text-primary block">PHASE 1 · FOCUS ({styleConfig.focus}m)</span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Undistracted study. Padlocks remain active until 00:00.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-primary/20">
                    <span className="font-mono text-xs font-bold text-cyan-400 block">PHASE 2 · REST ({styleConfig.rest}m)</span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Chime sounds at 00:00. Stretch, drink water, and recharge.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-primary/20">
                    <span className="font-mono text-xs font-bold text-amber-300 block">PHASE 3 · CLAIM (+{activeItem?.bountyAmount} Dinars)</span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Padlock shatters into victory button. Collect your dinars!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MAIN SPLIT: TIMER (LEFT) + NOTEPAD (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* TIMER */}
          <div className="lg:col-span-5 bg-[#141B3D]/90 backdrop-blur-md rounded-2xl p-6 border border-primary/30 shadow-2xl flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                {isBreak ? "Oasis Rest" : "Trial in Progress"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                +{activeItem?.bountyAmount} Dinars
              </span>
            </div>

            <h3 className="font-display text-xl text-white mt-3 truncate max-w-xs">{activeItem?.name}</h3>
            <span className="text-xs text-muted-foreground mt-1">{activeItem?.difficultyLabel} · {activeItem?.allocatedMinutes} Mins Allocated</span>

            <div className="w-52 h-52 rounded-full border-4 border-primary/30 bg-black/50 flex flex-col items-center justify-center my-6 shadow-[0_0_30px_rgba(245,189,71,0.15)]">
              <span className="font-mono text-5xl font-extrabold text-primary tracking-tight">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-widest mt-2">
                {isRunning ? "Sands in Motion" : "Hourglass Paused"}
              </span>
            </div>

            <div className="flex gap-3 mb-6">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl hover:opacity-90 flex items-center gap-2 shadow-lg"
              >
                {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
                {isRunning ? "Halt Sands" : "Awaken Focus"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRunning(false);
                  setSecondsLeft((isBreak ? styleConfig.rest : styleConfig.focus) * 60);
                }}
                className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>

            <AnimatePresence>
              {lockWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mb-4 p-3 rounded-xl border border-red-500/40 bg-red-500/15 text-xs text-red-300 flex items-center gap-2 text-left"
                >
                  <ShieldAlert className="size-4 text-red-400 shrink-0" />
                  <span>{lockWarning}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {activeItem && (
              <div className="w-full">
                {secondsLeft > 0 && !sessionCompleted ? (
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-black/40 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="size-4 text-primary shrink-0" />
                    <span>Conquest Locked: Complete {formatTime(secondsLeft)} focus session.</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleClaimVictory(activeItem.key)}
                    className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-primary to-amber-500 text-black shadow-lg"
                  >
                    <Trophy className="size-5" /> Claim Victory (+{activeItem.bountyAmount} Dinars)
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* NOTEPAD & FORMULA VAULT */}
          <div className="lg:col-span-7 bg-[#141B3D]/85 backdrop-blur-md rounded-2xl p-6 border border-primary/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setVaultTab("formulas")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      vaultTab === "formulas" ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Sigma className="size-3.5" /> Sacred Formulas ({activeTopicFormulaList.length})
                  </button>
                  <button
                    onClick={() => setVaultTab("notes")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      vaultTab === "notes" ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <FileEdit className="size-3.5" /> Scribe Notepad
                  </button>
                </div>
                <span className="text-[11px] font-mono text-primary truncate max-w-[200px]">
                  Trial: {activeItem?.name}
                </span>
              </div>

              {vaultTab === "formulas" ? (
                <div className="space-y-4">
                  <form onSubmit={handleAddFormula} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-black/40 p-3 rounded-xl border border-primary/20">
                    <input
                      type="text"
                      placeholder="Formula Name (e.g. Rank of Matrix)"
                      value={newFormulaTitle}
                      onChange={(e) => setNewFormulaTitle(e.target.value)}
                      className="sm:col-span-5 bg-black/60 border border-primary/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Equation (e.g. Rank(A) = Rank(A|B) = r)"
                      value={newFormulaEq}
                      onChange={(e) => setNewFormulaEq(e.target.value)}
                      className="sm:col-span-5 bg-black/60 border border-primary/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#F5BD47] placeholder-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <Button type="submit" size="sm" className="sm:col-span-2 h-auto py-1.5 text-xs font-bold bg-primary text-black">
                      <Plus className="size-3.5 mr-1" /> Inscribe (+10)
                    </Button>
                  </form>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {activeTopicFormulaList.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-primary/20 rounded-xl text-muted-foreground text-xs">
                        <Sigma className="size-6 text-primary/40 mx-auto mb-2" />
                        No formulas recorded yet. Inscribe them above!
                      </div>
                    ) : (
                      activeTopicFormulaList.map((formula) => (
                        <div key={formula.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-primary/15">
                          <div>
                            <span className="text-[11px] font-bold text-primary block">{formula.title}</span>
                            <span className="font-mono text-xs text-white block mt-0.5">{formula.equation}</span>
                          </div>
                          <button onClick={() => handleDeleteFormula(formula.id)} className="text-muted-foreground hover:text-red-400 p-1">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Auto-saved study reminders and notes:</p>
                  <textarea
                    value={topicNotes[activeItem?.key || ""] || ""}
                    onChange={(e) => handleNoteSave(e.target.value)}
                    placeholder="Write key steps, high-yield takeaways, and examiner warnings here..."
                    rows={10}
                    className="w-full bg-black/40 border border-primary/20 rounded-xl p-3.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-primary/15 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Saved locally to your personal scroll.</span>
              <button onClick={() => setShowFullVaultModal(true)} className="text-primary hover:underline font-semibold">
                Review complete formula deck →
              </button>
            </div>
          </div>
        </div>

        {/* STRICT TO-DO LIST */}
        <div className="bg-[#141B3D]/80 backdrop-blur-md rounded-2xl p-6 border border-primary/30 shadow-xl mb-8">
          <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <Clock className="size-4 text-primary" /> Active Trials & Strict Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studyBlocks.map((block, idx) => {
              const isSelected = activeItem?.key === block.key;
              const hasFormulas = (topicFormulas[block.key] || []).length > 0;
              const hasNotes = !!(topicNotes[block.key] || "").trim();

              return (
                <div
                  key={block.key}
                  onClick={() => {
                    setActiveTopicKey(block.key);
                    setIsBreak(false);
                    setIsRunning(false);
                    setSessionCompleted(false);
                    setSecondsLeft(styleConfig.focus * 60);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-primary/15 shadow-md"
                      : "border-primary/10 bg-black/30 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button onClick={(e) => attemptToggleCheckbox(block.key, e)} className="mt-0.5 hover:scale-110">
                        {block.isConquered ? (
                          <CheckCircle2 className="size-5 text-emerald-400" />
                        ) : (
                          <div className="size-5 rounded-md border border-primary/40 bg-black/50 flex items-center justify-center">
                            <Lock className="size-3 text-primary/70" />
                          </div>
                        )}
                      </button>

                      <div>
                        <span className="font-mono text-xs text-primary font-bold">#{String(idx + 1).padStart(2, "0")}</span>
                        <h4 className={`text-xs font-semibold ${block.isConquered ? "line-through text-muted-foreground" : "text-white"}`}>
                          {block.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{block.module}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-extrabold text-amber-300 block">+{block.bountyAmount} 🪙</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-primary/20 text-muted-foreground">
                        {block.difficultyLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-primary/10 text-[11px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {hasFormulas && <span className="text-primary text-[10px] flex items-center gap-0.5"><Sigma className="size-3" /> {(topicFormulas[block.key] || []).length}</span>}
                      {hasNotes && <span className="text-amber-400 text-[10px] flex items-center gap-0.5"><FileEdit className="size-3" /> Notes</span>}
                    </div>
                    <span className="font-mono text-xs font-bold text-primary">
                      {block.allocatedMinutes} Mins · {block.intervalsCount} Sprints
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation to Final Feedback Page */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-primary/20">
          <div>
            <h4 className="font-display text-base text-white">Finished Your Focus Session?</h4>
            <p className="text-xs text-muted-foreground">Share your feedback to help the Genie sharpen the Agrabah study experience.</p>
          </div>
          <Link
            to="/feedback"
            className="px-6 py-3 bg-[#1A2246] hover:bg-[#253063] border border-primary/40 text-primary font-bold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <MessageSquare className="size-4" /> Share Optional Feedback (+50 Dinars)
          </Link>
        </div>
      </div>

      {/* REVIEW ALL MODAL */}
      <AnimatePresence>
        {showFullVaultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#141B3D] border border-primary/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl p-6 relative"
            >
              <button onClick={() => setShowFullVaultModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-white">
                <X className="size-5" />
              </button>

              <div className="border-b border-primary/20 pb-4 mb-4">
                <span className="text-xs uppercase font-bold tracking-widest text-primary">Sacred Archive</span>
                <h2 className="font-display text-2xl text-white mt-1">{subject.name} · Complete Inscriptions Deck</h2>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {rawPlan.map((topic) => {
                  const formulas = topicFormulas[topic.key] || [];
                  const note = topicNotes[topic.key] || "";
                  if (formulas.length === 0 && !note) return null;

                  return (
                    <div key={topic.key} className="p-4 rounded-xl bg-black/40 border border-primary/20 space-y-3">
                      <h4 className="font-display text-sm font-bold text-primary border-b border-primary/15 pb-1">{topic.name}</h4>
                      {formulas.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {formulas.map((f) => (
                            <div key={f.id} className="p-2.5 rounded-lg bg-black/60 border border-primary/10">
                              <span className="text-[11px] font-semibold text-amber-300 block">{f.title}</span>
                              <span className="font-mono text-xs text-white block mt-0.5">{f.equation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {note && <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-black/30 p-2.5 rounded-lg border border-primary/10">{note}</p>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </QuestShell>
  );
}