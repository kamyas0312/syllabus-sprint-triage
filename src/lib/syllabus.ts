export type Module = { id: string; name: string; hours: number; topics: string[] };
export type Subject = { id: string; name: string; code: string; mse: number; ese: number; modules: Module[]; formulas: { title: string; items: string[] }[] };

const m = (id: string, name: string, hours: number, topics: string[]): Module => ({ id, name, hours, topics });

export const SUBJECTS: Subject[] = [
  {
    id: "am1", name: "Applied Mathematics – I", code: "316U06C101", mse: 30, ese: 50,
    modules: [
      m("am1-1", "Rank of Matrix & Linear Systems", 8, ["Types of matrices & Orthogonal Decryption", "Rank using Row Echelon & Normal form", "System of Homogeneous/Non-homogeneous equations", "Gauss-Seidel & Jacobi Iteration"]),
      m("am1-2", "Partial Differentiation & Applications", 9, ["Higher order partial derivatives", "Composite functions differentiation", "Maxima & Minima of 2 variables", "Jacobians of 2 & 3 variables"]),
      m("am1-3", "Homogeneous Functions", 4, ["Euler's Theorem on 2 & 3 variables", "Corollaries & Deductions of Euler's"]),
      m("am1-4", "Linear Differential Equations", 12, ["Exact differential equations & Integrating factors", "Equations reducible to linear form", "Higher order LDE with constant coefficients", "Method of Variation of Parameters"]),
      m("am1-5", "Complex Numbers & Hyperbolic Functions", 12, ["De Moivre's Theorem & powers/roots", "Circular & Hyperbolic functions", "Logarithm of Complex Numbers", "Separation of real & imaginary parts"]),
    ],
    formulas: [
      { title: "Matrices", items: ["Orthogonal: AAᵀ = I", "Consistent iff ρ(A) = ρ([A|B])", "Unique solution iff ρ(A) = ρ(A|B) = n", "Infinite solutions: n − r free variables"] },
      { title: "Partial Differentiation", items: ["Euler: x·uₓ + y·u_y = n·u", "Second order: x²uₓₓ + 2xy·uₓᵧ + y²u_yy = n(n−1)u", "Maxima: rt − s² > 0, r < 0", "J = ∂(u,v)/∂(x,y) = uₓv_y − u_yvₓ"] },
      { title: "Differential Equations", items: ["Exact: ∂M/∂y = ∂N/∂x", "Linear: IF = e^∫P dx", "Variation of params: yₚ = −y₁∫y₂X/W dx + y₂∫y₁X/W dx", "W = y₁y₂′ − y₂y₁′"] },
      { title: "Complex Numbers", items: ["(cosθ + i sinθ)ⁿ = cos nθ + i sin nθ", "cosh x = (eˣ + e⁻ˣ)/2, sinh x = (eˣ − e⁻ˣ)/2", "cosh²x − sinh²x = 1", "log(x+iy) = ½log(x²+y²) + i·tan⁻¹(y/x)"] },
    ],
  },
  {
    id: "phy", name: "Engineering Physics", code: "316U06C102", mse: 30, ese: 50,
    modules: [
      m("phy-1", "Wave Optics", 8, ["Interference in thin films", "Newton's rings", "Diffraction grating", "Resolving power"]),
      m("phy-2", "Photonics & Lasers", 7, ["Spontaneous & stimulated emission", "Einstein's coefficients", "He-Ne & Nd:YAG lasers", "Optical fibre & numerical aperture"]),
      m("phy-3", "Quantum Mechanics – I", 7, ["de Broglie hypothesis", "Heisenberg uncertainty principle", "Schrödinger wave equations", "Particle in a 1D box"]),
      m("phy-4", "Semiconductors & Electromagnetism", 8, ["Fermi level in semiconductors", "Hall effect", "Maxwell's equations", "Gradient, divergence & curl"]),
    ],
    formulas: [
      { title: "Optics", items: ["Thin film: 2μt cos r = nλ (dark)", "Newton's rings: D²ₙ = 4nλR", "Grating: (a+b) sinθ = nλ", "RP = nN"] },
      { title: "Lasers & Fibres", items: ["NA = √(n₁² − n₂²)", "Δ = (n₁ − n₂)/n₁", "V = (2πa/λ)·NA", "A₂₁/B₂₁ = 8πhν³/c³"] },
      { title: "Quantum", items: ["λ = h/p = h/√(2mE)", "Δx·Δp ≥ ħ/2", "Eₙ = n²h²/8mL²", "ψₙ = √(2/L) sin(nπx/L)"] },
      { title: "Semiconductors & EM", items: ["R_H = 1/(nq)", "σ = nqμ", "∇·D = ρ, ∇·B = 0", "∇×E = −∂B/∂t"] },
    ],
  },
  {
    id: "bee", name: "Basic Electrical Engineering", code: "316U06C104", mse: 30, ese: 50,
    modules: [
      m("bee-1", "DC Circuits & Network Theorems", 10, ["KVL, KCL, mesh & nodal analysis", "Star-delta transformation", "Superposition & Thevenin's theorem", "Norton's & Maximum power transfer"]),
      m("bee-2", "Single Phase AC Circuits", 10, ["RMS, average & form factor", "Phasor representation", "Series RLC circuits & power factor", "Resonance in series & parallel"]),
      m("bee-3", "Three Phase AC Circuits", 5, ["Star & delta connections", "Line vs phase relations", "Power measurement (two wattmeter)"]),
      m("bee-4", "Electrical Machines", 5, ["Single phase transformer construction", "EMF equation & losses", "DC machine basics"]),
    ],
    formulas: [
      { title: "DC Networks", items: ["R_Y = R₁R₂/(R₁+R₂+R₃)", "P_max = V_th²/(4R_th)", "I_N = V_th/R_th"] },
      { title: "Single Phase AC", items: ["V_rms = V_m/√2, V_avg = 0.637V_m", "Z = √(R² + (X_L − X_C)²)", "pf = cos φ = R/Z", "f₀ = 1/(2π√LC), Q = (1/R)√(L/C)"] },
      { title: "Three Phase", items: ["Star: V_L = √3·V_ph, I_L = I_ph", "Delta: I_L = √3·I_ph", "P = √3·V_L·I_L·cos φ", "tan φ = √3(W₁−W₂)/(W₁+W₂)"] },
      { title: "Machines", items: ["E = 4.44·f·N·Φₘ", "K = N₂/N₁ = V₂/V₁", "η = output/(output + losses)", "DC: E_b = PΦNZ/(60A)"] },
    ],
  },
];

export type Status = "clueless" | "fuzzy" | "mastered";

export const STRATEGY: Record<Status | "unset", string> = {
  clueless: "Concept-first: watch one explainer, write a definitions sheet, then solve 3 textbook examples step-by-step.",
  fuzzy: "Active recall: close notes, attempt 4 PYQs, then patch gaps with targeted rereading.",
  mastered: "Speed drill: one timed PYQ, then teach-back in 2 minutes to lock it in.",
  unset: "Quick diagnostic: skim the topic, attempt 2 problems, then re-rate yourself.",
};
