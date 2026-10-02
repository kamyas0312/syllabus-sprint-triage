# Syllabus Sprint Planner

Build a complete single-page study sprint and exam revision triage engine called "SyllabusSprint • KJSCE Edition" using React, Tailwind CSS, Lucide React icons, and Framer Motion.

Aesthetic & Theme Requirements:

- Overall palette: Warm Academic Beige and Rich Chocolate Brown.

- Main background: #F7F4EE (warm beige paper texture).

- Card backgrounds: #FFFFFF with soft warm borders (#E6DEC8).

- Primary accents & headings: #2D1E18 (rich dark chocolate brown).

- Secondary buttons: #8C6239 (warm caramel/leather).

- Typography: Use a luxurious editorial serif font (like "Playfair Display" or "Cinzel") for titles, headers, and quote callouts, paired with a legible humanist sans-serif for UI numbers and buttons.

- Imagery & Atmosphere: Add warm, high-aesthetic student study banners/imagery (e.g., Unsplash study desks, open notebooks, fountain pens, coffee cups) with warm-toned overlays.

Core Data Preload:

Pre-configure First-Year Engineering Semester 1 subjects for KJSCE:

1. "Applied Mathematics – I (316U06C101)" (MSE: 30 marks, ESE: 50 marks)

   - Module 1: Rank of Matrix & Linear Systems (8 hrs)

     Topics: Types of matrices & Orthogonal Decryption, Rank using Row Echelon & Normal form, System of Homogeneous/Non-homogeneous equations, Gauss-Seidel & Jacobi Iteration.

   - Module 2: Partial Differentiation & Applications (9 hrs)

     Topics: Higher order partial derivatives, Composite functions differentiation, Maxima & Minima of 2 variables, Jacobians of 2 & 3 variables.

   - Module 3: Homogeneous Functions (4 hrs)

     Topics: Euler's Theorem on 2 & 3 variables, Corollaries & Deductions of Euler's.

   - Module 4: Linear Differential Equations (12 hrs)

     Topics: Exact differential equations & Integrating factors, Equations reducible to linear form, Higher order LDE with constant coefficients, Method of Variation of Parameters.

   - Module 5: Complex Numbers & Hyperbolic Functions (12 hrs)

     Topics: De Moivre's Theorem & powers/roots, Circular & Hyperbolic functions, Logarithm of Complex Numbers, Separation of real & imaginary parts.

2. "Engineering Physics (316U06C102)" (MSE: 30, ESE: 50)

   - Module 1: Wave Optics (8 hrs)

   - Module 2: Photonics & Lasers (7 hrs)

   - Module 3: Quantum Mechanics – I (7 hrs)

   - Module 4: Semiconductors & Electromagnetism (8 hrs)

3. "Basic Electrical Engineering (316U06C104)" (MSE: 30, ESE: 50)

   - Module 1: DC Circuits & Network Theorems (10 hrs)

   - Module 2: Single Phase AC Circuits (10 hrs)

   - Module 3: Three Phase AC Circuits (5 hrs)

   - Module 4: Electrical Machines (5 hrs)

Interactive UI Layout (Single-Page flow):

1. Editorial Header:

   - Rich serif title "SyllabusSprint", badge "K. J. Somaiya College of Engineering".

   - Subject selector dropdown with the 3 subjects above.

   - Exam Type toggle: [⚡ Mid-Sem (30 Marks)] vs [🎯 End-Sem (50 Marks)].

     * Selecting "Mid-Sem" automatically selects only Modules 1 to 3 by default.

     * Selecting "End-Sem" selects all modules by default.

2. Module Scope Checklist:

   - Warm card listing all modules for the chosen subject with their syllabus teaching hours.

   - Checkbox next to each module so students can toggle which ones are appearing.

3. The 90-Second Triage Matrix:

   - For all topics under the active modules, render a topic card.

   - 3 clickable earthy status chips on every card:

     [🔴 Clueless (Terracotta)]  [🟡 Fuzzy (Mustard)]  [🟢 Mastered (Sage Green)]

   - Available Revision Time slider: Range 2 to 30 hours (default 10 hours) in a rich wooden/brown dial design.

   - "🚨 40% Pass Rescue Mode" toggle: When switched ON, filters and prioritizes only the top high-weightage modules needed to cross the passing mark (12/30 for Mid-Sem or 20/50 for End-Sem).

4. Generated Sprint Roadmap:

   - Visual vertical timeline dividing the selected hours into 45-minute sprint blocks and 10-minute breaks.

   - Topics marked "Clueless" with higher module hours appear first.

   - Each card displays the topic name, recommended focus strategy, and an interactive "Start Study Sprint" button.

   - Active Pomodoro Modal: Clicking "Start Study Sprint" opens a clean modal with a 45-minute countdown timer with Play/Pause and ambient focus aesthetics.

5. Formula Vault Drawer:

   - A slide-over panel that shows essential quick formulas for the selected subject.

6. Persistence:

   - Store all selected states in browser localStorage so page refreshes do not erase progress.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8a829bce-b197-4d2e-856b-5df9c5a83c9d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
