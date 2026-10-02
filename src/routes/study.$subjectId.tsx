import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Coins,
  Compass,
  Flame,
  Layers,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestShell, pageHead } from "@/components/quest-shell";
import { QUEST_SUBJECTS, makePlan, useSubjectQuest } from "@/lib/quest";

export const Route = createFileRoute("/study/$subjectId")({
  head: ({ params }) =>
    pageHead(
      "Strategy Chamber",
      `Choose your study persona and review your timetable for ${params.subjectId}.`
    ),
  component: StudyStrategy,
});

type StudyStyle = "nomad" | "vizier" | "sultan";

interface StyleConfig {
  id: StudyStyle;
  title: string;
  subtitle: string;
  focusMinutes: number;
  breakMinutes: number;
  icon: typeof Zap;
  color: string;
}

const STUDY_STYLES: StyleConfig[] = [
  {
    id: "nomad",
    title: "The Desert Nomad",
    subtitle: "25m rapid sprint · 5m oasis rest",
    focusMinutes: 25,
    breakMinutes: 5,
    icon: Zap,
    color: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  {
    id: "vizier",
    title: "The Grand Vizier",
    subtitle: "50m tactical depth · 10m recharge",
    focusMinutes: 50,
    breakMinutes: 10,
    icon: Flame,
    color: "border-primary/40 bg-primary/10 text-primary",
  },
  {
    id: "sultan",
    title: "The Sultan's Marathon",
    subtitle: "90m mastery · 15m deep rest",
    focusMinutes: 90,
    breakMinutes: 15,
    icon: Trophy,
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  },
];

const DIFFICULTY_METADATA = {
  Cursed: { label: "Cursed (Hard)", bounty: 100, color: "border-red-500/40 bg-red-500/10 text-red-400" },
  Sands: { label: "Sands (Moderate)", bounty: 75, color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  Oasis: { label: "Oasis (Easy)", bounty: 50, color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
};

function StudyStrategy() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const subject = QUEST_SUBJECTS.find((s) => s.id === subjectId);
  const { config } = useSubjectQuest(subjectId);

  // Persona State
  const [selectedStyle, setSelectedStyle] = useState<StudyStyle>(() => {
    return (localStorage.getItem(`persona_${subjectId}`) as StudyStyle) || "vizier";
  });
  const currentStyleConfig = STUDY_STYLES.find((s) => s.id === selectedStyle)!;

  // Coverage State
  const [coverageTarget, setCoverageTarget] = useState<"pass" | "full">(() => {
    return (localStorage.getItem(`coverage_${subjectId}`) as "pass" | "full") || "full";
  });

  const handleSelectStyle = (id: StudyStyle) => {
    setSelectedStyle(id);
    localStorage.setItem(`persona_${subjectId}`, id);
  };

  const handleSelectCoverage = (target: "pass" | "full") => {
    setCoverageTarget(target);
    localStorage.setItem(`coverage_${subjectId}`, target);
  };

  if (!subject) {
    return (
      <QuestShell>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">Scroll Not Found</h1>
          <Link to="/subjects" className="mt-5 inline-block text-primary">
            Return to the Library
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

    const meta = DIFFICULTY_METADATA[standardized];

    return {
      ...item,
      normalizedDifficulty: standardized,
      difficultyLabel: meta.label,
      bountyAmount: meta.bounty,
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
    const intervalsNeeded = Math.max(1, Math.round(computedMinutes / currentStyleConfig.focusMinutes));

    return {
      ...item,
      allocatedMinutes: computedMinutes,
      intervalsCount: intervalsNeeded,
    };
  });

  const totalAllocatedMinutes = studyBlocks.reduce((acc, b) => acc + b.allocatedMinutes, 0);

  const proceedToArena = () => {
    localStorage.setItem(`persona_${subjectId}`, selectedStyle);
    localStorage.setItem(`coverage_${subjectId}`, coverageTarget);
    navigate({ to: "/arena/$subjectId", params: { subjectId } });
  };

  return (
    <QuestShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-28 pt-8">
        <Link
          to="/triage/$subjectId"
          params={{ subjectId }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="size-4" /> Back to Subject Oracle
        </Link>

        {/* Hero Section */}
        <div className="bg-[#141B3D]/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-primary/30 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Compass className="size-4" /> Step 1 · Study Strategy Chamber
              </span>
              <h1 className="font-display text-3xl sm:text-4xl text-white mt-1">
                {subject.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your focus rhythm and review your customized study timetable before entering the arena.
              </p>
            </div>

            {/* Coverage Target Toggle */}
            <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-xl border border-primary/20">
              <span className="text-[11px] font-semibold text-muted-foreground pl-2 uppercase tracking-wider">
                Target:
              </span>
              <button
                onClick={() => handleSelectCoverage("pass")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  coverageTarget === "pass"
                    ? "bg-amber-500 text-black shadow-md"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                50% High-Yield (Core Only)
              </button>
              <button
                onClick={() => handleSelectCoverage("full")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  coverageTarget === "full"
                    ? "bg-primary text-black shadow-md"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                100% Full Mastery
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Focus Persona Selector */}
        <div className="mb-10">
          <h2 className="text-sm uppercase font-bold tracking-widest text-primary mb-4 flex items-center gap-2">
            <Layers className="size-4" /> Choose Your Study Persona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STUDY_STYLES.map((style) => {
              const Icon = style.icon;
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => handleSelectStyle(style.id)}
                  className={`p-5 rounded-2xl border text-left transition duration-200 flex flex-col justify-between ${
                    isSelected
                      ? `${style.color} ring-2 ring-primary shadow-xl scale-[1.02]`
                      : "bg-[#141B3D]/50 border-primary/20 hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-black/50">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">{style.title}</h3>
                      <span className="font-mono text-xs text-primary font-semibold">
                        {style.focusMinutes}m Sprint · {style.breakMinutes}m Rest
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {style.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Dedicated Timetable */}
        <div className="bg-[#141B3D]/80 backdrop-blur-md rounded-2xl p-6 border border-primary/30 shadow-xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-primary/20 mb-5">
            <div>
              <h3 className="font-display text-xl text-white flex items-center gap-2">
                <Clock className="size-5 text-primary" /> Dedicated Timetable & Block Schedule
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculated based on {totalUserHours} available hours. Harder topics receive larger blocks.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-primary font-bold block">
                Total: {Math.round(totalAllocatedMinutes / 60)} hrs {totalAllocatedMinutes % 60} mins
              </span>
              <span className="text-[11px] text-muted-foreground">{studyBlocks.length} Dedicated Blocks</span>
            </div>
          </div>

          {/* Timetable List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
            {studyBlocks.map((block, idx) => (
              <div
                key={block.key}
                className="p-4 rounded-xl bg-black/40 border border-primary/15 flex flex-wrap items-center justify-between gap-3 hover:border-primary/40 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-primary px-2 py-1 rounded bg-primary/10 border border-primary/20">
                    Block {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{block.name}</h4>
                    <span className="text-xs text-muted-foreground">{block.module}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      block.normalizedDifficulty === "Cursed"
                        ? "border-red-500/40 bg-red-500/10 text-red-400"
                        : block.normalizedDifficulty === "Sands"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {block.difficultyLabel}
                  </span>

                  <div>
                    <span className="font-mono text-xs font-bold text-primary block">
                      {block.allocatedMinutes} Mins
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {block.intervalsCount} × {currentStyleConfig.focusMinutes}m sprint
                    </span>
                  </div>

                  <div className="pl-3 border-l border-primary/20 flex items-center gap-1 font-mono text-xs font-bold text-amber-300">
                    <Coins className="size-3.5 text-amber-400" />
                    +{block.bountyAmount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Big Action Button to Advance */}
        <div className="flex justify-end">
          <Button
            onClick={proceedToArena}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 via-primary to-amber-500 hover:opacity-95 text-black font-bold text-base rounded-2xl shadow-[0_0_30px_rgba(245,189,71,0.4)] flex items-center gap-2 transition"
          >
            Enter the Focus Arena <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
    </QuestShell>
  );
}