import { useEffect, useState } from "react";
import { SUBJECTS, type Module } from "./syllabus";

export type Difficulty = "hard" | "moderate" | "easy";
export type Exam = "mse" | "ese";
export type QuestSubject = { id: string; name: string; short: string; icon: string; modules: Module[]; formulas: { title: string; items: string[] }[] };
const mod = (id: string, name: string, topics: string[]): Module => ({ id, name, hours: 8, topics });
const extra: QuestSubject[] = [
  { id: "chem", name: "Engineering Chemistry", short: "Chemistry", icon: "flask", modules: [
    mod("chem-1", "Water Technology", ["Hardness and its determination", "Water treatment and softening", "Boiler troubles"]),
    mod("chem-2", "Electrochemistry", ["Electrode potentials", "Nernst equation", "Batteries and fuel cells"]),
    mod("chem-3", "Corrosion", ["Mechanisms of corrosion", "Factors affecting corrosion", "Corrosion prevention"]),
    mod("chem-4", "Polymers", ["Polymerization mechanisms", "Engineering polymers", "Biodegradable polymers"]),
    mod("chem-5", "Green Chemistry", ["Principles of green chemistry", "Sustainable synthesis", "Nanomaterials and applications"]),
  ], formulas: [{ title: "Electrochemistry", items: ["Ecell = Ecathode − Eanode", "E = E° − (0.0591/n) log Q", "ΔG = −nFEcell"] }] },
  { id: "draw", name: "Engineering Drawing", short: "Drawing", icon: "ruler", modules: [
    mod("draw-1", "Drawing Fundamentals", ["Lines, lettering and scales", "Geometric constructions", "Dimensioning conventions"]),
    mod("draw-2", "Orthographic Projections", ["Projection of points", "Projection of lines", "Projection of planes"]),
    mod("draw-3", "Solids", ["Projection of solids", "Sections of solids", "Development of surfaces"]),
    mod("draw-4", "Isometric Projection", ["Isometric scale", "Isometric views of solids", "Conversion from orthographic views"]),
    mod("draw-5", "Computer-Aided Drawing", ["Drawing commands", "Layers and annotations", "Plotting and layouts"]),
  ], formulas: [{ title: "Drawing reminders", items: ["Isometric scale ≈ 0.816 × true length", "First-angle projection: top view below front view", "Third-angle projection: top view above front view"] }] },
  { id: "bio", name: "Engineering Biology", short: "Biology", icon: "leaf", modules: [
    mod("bio-1", "Cell Biology", ["Cell structure and organelles", "Cell membrane transport", "Cell division"]),
    mod("bio-2", "Biomolecules", ["Proteins and enzymes", "Carbohydrates and lipids", "Nucleic acids"]),
    mod("bio-3", "Genetics", ["DNA replication", "Transcription and translation", "Mendelian inheritance"]),
    mod("bio-4", "Microbiology", ["Microbial growth", "Sterilization", "Industrial microbiology"]),
    mod("bio-5", "Biotechnology", ["Recombinant DNA", "Biosensors", "Biomedical applications"]),
  ], formulas: [{ title: "Biology reminders", items: ["DNA base pairing: A–T, G–C", "Central dogma: DNA → RNA → protein", "Growth rate μ = (ln N₂ − ln N₁) / Δt"] }] },
  { id: "prog", name: "Computer Programming", short: "Programming", icon: "code", modules: [
    mod("prog-1", "Programming Basics", ["Algorithms and flowcharts", "Variables and data types", "Operators and expressions"]),
    mod("prog-2", "Control Flow", ["Conditional statements", "Loops and iteration", "Nested control structures"]),
    mod("prog-3", "Functions and Arrays", ["Functions and scope", "One and two dimensional arrays", "Strings"]),
    mod("prog-4", "Pointers and Structures", ["Pointer basics", "Structures and unions", "Dynamic memory concepts"]),
    mod("prog-5", "Files and Problem Solving", ["File operations", "Searching and sorting", "Debugging and testing"]),
  ], formulas: [{ title: "Programming reminders", items: ["Binary search: O(log n), sorted input", "Linear search: O(n)", "Array index range: 0 to n − 1"] }] },
];
export const QUEST_SUBJECTS: QuestSubject[] = [
  ...SUBJECTS.map((s, i) => ({ ...s, short: ["Math-I", "Physics", "BEE"][i] ?? s.name, icon: ["sigma", "atom", "bolt"][i] ?? "sigma", modules: s.modules.length === 5 ? s.modules : [...s.modules, mod(`${s.id}-5`, s.id === "phy" ? "Modern Physics & Materials" : "Electrical Safety & Applications", s.id === "phy" ? ["Crystal structures", "Nanomaterials", "Superconductivity basics"] : ["Earthing and protection", "Electrical wiring basics", "Energy efficiency"])] })),
  ...extra,
];

export type QuestState = {
  name: string; branch: string; persona: string;
  subjects: Record<string, { exam: Exam; modules: string[]; difficulty: Record<string, Difficulty>; hours: number; conquered: string[] }>;
};
const KEY = "agrabahscribe-v1";
const DEFAULT: QuestState = { name: "", branch: "COMPS", persona: "Genie's Scholar", subjects: {} };
export const defaultSubject = (id: string) => ({ exam: "mse" as Exam, modules: QUEST_SUBJECTS.find((s) => s.id === id)?.modules.slice(0, 3).map((m) => m.id) ?? [], difficulty: {} as Record<string, Difficulty>, hours: 8, conquered: [] as string[] });
export function readQuest(): QuestState {
  if (typeof window === "undefined") return DEFAULT;
  try { const raw = localStorage.getItem(KEY); return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT; } catch { return DEFAULT; }
}
export function useQuest() {
  const [state, setState] = useState<QuestState>(DEFAULT);
  const [ready, setReady] = useState(false);
  useEffect(() => { setState(readQuest()); setReady(true); }, []);
  const update = (next: QuestState | ((prev: QuestState) => QuestState)) => setState((prev) => {
    const value = typeof next === "function" ? next(prev) : next;
    localStorage.setItem(KEY, JSON.stringify(value)); return value;
  });
  return { state, update, ready };
}
export function useSubjectQuest(id: string) {
  const { state, update, ready } = useQuest();
  const config = state.subjects[id] ?? defaultSubject(id);
  const updateConfig = (patch: Partial<typeof config>) => update((prev) => ({ ...prev, subjects: { ...prev.subjects, [id]: { ...(prev.subjects[id] ?? defaultSubject(id)), ...patch } } }));
  return { state, ready, config, updateConfig };
}
export function makePlan(subject: QuestSubject, config: ReturnType<typeof defaultSubject>) {
  const items = subject.modules.filter((m) => config.modules.includes(m.id)).flatMap((m) => m.topics.map((name, i) => {
    const key = `${m.id}#${i}`; const difficulty = config.difficulty[key] ?? "moderate";
    return { key, name, module: m.name, difficulty, weight: { hard: 3, moderate: 1.7, easy: 1 }[difficulty], conquered: config.conquered.includes(key) };
  }));
  items.sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name));
  const totalWeight = items.reduce((sum, x) => sum + x.weight, 0);
  const total = config.hours * 60;
  let allocated = 0;
  return items.map((item, index) => {
    const minutes = index === items.length - 1 ? total - allocated : Math.floor(total * item.weight / totalWeight);
    allocated += minutes;
    return { ...item, minutes };
  });
}
