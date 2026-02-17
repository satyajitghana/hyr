# Hyr - Comprehensive Implementation Plan

## Overview

**Hyr** is a modern AI-powered resume optimization and job application platform. It has two parts:

1. **Marketing Website** (`/`) — A stunning landing page that showcases Hyr's features and converts visitors
2. **App** (`/app`) — The actual product where users upload resumes, tailor them for jobs, optimize for ATS, and auto-apply

> **Note:** AI is mocked for now (no API key). The mock layer is designed so swapping in a real AI provider later is trivial.

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Package Manager | **pnpm** | Latest |
| Framework | Next.js | 16 (App Router, Turbopack) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 (CSS-first config) |
| UI Components | shadcn/ui | Latest (Tailwind v4 compatible) |
| Fancy Components | Magic UI, Aceternity UI, React Bits | Latest (installed via shadcn CLI) |
| Animations | Motion (formerly Framer Motion) | Latest |
| Fonts | Bricolage Grotesque (display) + Geist (body) + Geist Mono (mono) | next/font |
| Form Handling | React Hook Form + Zod | Latest |
| File Upload | react-dropzone | Latest |
| State Management | React Context + Zustand | Latest |
| PDF Parsing | pdf-parse (server-side) | Latest |
| PDF Generation | @react-pdf/renderer | Latest |

---

## Project Setup (from scratch)

### Step 1: Scaffold Next.js 16 Project
```bash
# Remove existing files (keep .git)
# Run create-next-app inside the repo
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --use-pnpm --yes
```

### Step 2: Install Tailwind v4 (should come with create-next-app)
Verify `postcss.config.mjs` uses `@tailwindcss/postcss` and `globals.css` has `@import "tailwindcss"`.

### Step 3: Initialize shadcn/ui
```bash
pnpm dlx shadcn@latest init
```

### Step 4: Install Motion
```bash
pnpm add motion
```

### Step 5: Install additional dependencies
```bash
pnpm add zustand react-hook-form @hookform/resolvers zod react-dropzone
pnpm add pdf-parse @react-pdf/renderer
pnpm add lucide-react
pnpm add -D @types/pdf-parse
```

### Step 6: Add shadcn components
```bash
pnpm dlx shadcn@latest add button card input textarea label select tabs badge dialog sheet separator avatar progress skeleton toast dropdown-menu command scroll-area tooltip sidebar navigation-menu
```

### Step 7: Add Magic UI components (via shadcn CLI)
```bash
pnpm dlx shadcn@latest add "https://magicui.design/r/shimmer-button"
pnpm dlx shadcn@latest add "https://magicui.design/r/animated-gradient-text"
pnpm dlx shadcn@latest add "https://magicui.design/r/typing-animation"
pnpm dlx shadcn@latest add "https://magicui.design/r/word-rotate"
pnpm dlx shadcn@latest add "https://magicui.design/r/number-ticker"
pnpm dlx shadcn@latest add "https://magicui.design/r/marquee"
pnpm dlx shadcn@latest add "https://magicui.design/r/bento-grid"
pnpm dlx shadcn@latest add "https://magicui.design/r/dock"
pnpm dlx shadcn@latest add "https://magicui.design/r/globe"
pnpm dlx shadcn@latest add "https://magicui.design/r/particles"
pnpm dlx shadcn@latest add "https://magicui.design/r/border-beam"
pnpm dlx shadcn@latest add "https://magicui.design/r/magic-card"
pnpm dlx shadcn@latest add "https://magicui.design/r/animated-list"
pnpm dlx shadcn@latest add "https://magicui.design/r/confetti"
pnpm dlx shadcn@latest add "https://magicui.design/r/icon-cloud"
```

### Step 8: Add Aceternity UI components (via shadcn CLI)
```bash
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/aurora-background"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/floating-navbar"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/lamp-effect"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/spotlight"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/3d-card-effect"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/timeline"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/sticky-scroll-reveal"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/text-generate-effect"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/flip-words"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/hero-highlight"
pnpm dlx shadcn@latest add "https://ui.aceternity.com/r/tracing-beam"
```

### Step 9: Add React Bits components (via shadcn CLI)
```bash
pnpm dlx shadcn@latest add "https://reactbits.dev/r/SplitText-TS-TW"
pnpm dlx shadcn@latest add "https://reactbits.dev/r/BlurText-TS-TW"
pnpm dlx shadcn@latest add "https://reactbits.dev/r/ShinyText-TS-TW"
```

### Step 10: Configure fonts in root layout.tsx
```tsx
import { Bricolage_Grotesque } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

// Geist is installed via: pnpm add geist
// GeistSans → --font-sans (body text)
// GeistMono → --font-mono (code/technical)
```

> **Note:** Install the `geist` package: `pnpm add geist`

---

## App Architecture

### Route Groups

The app uses Next.js **route groups** to separate the marketing site from the app:

- `(marketing)` — Public-facing website. No auth required. Rendered at `/`
- `(app)` — The actual product. Will require auth (future). Rendered at `/app/*`

Each group has its own layout, so the marketing site has a floating navbar + footer, while the app has a sidebar + top bar.

### Directory Structure
```
hyr/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, providers, theme)
│   ├── globals.css                   # Tailwind v4 @theme + global styles
│   │
│   ├── (marketing)/                  # Public marketing website
│   │   ├── layout.tsx                # Marketing layout (floating navbar + footer)
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── pricing/page.tsx          # Pricing page (future)
│   │   └── about/page.tsx            # About page (future)
│   │
│   ├── (app)/                        # The actual product
│   │   ├── layout.tsx                # App layout (sidebar + top bar)
│   │   ├── app/
│   │   │   └── page.tsx              # Dashboard home (/app)
│   │   ├── app/resume/
│   │   │   ├── page.tsx              # Resume list / upload (/app/resume)
│   │   │   ├── [id]/page.tsx         # View/edit a resume (/app/resume/[id])
│   │   │   └── [id]/optimize/page.tsx # ATS optimization (/app/resume/[id]/optimize)
│   │   ├── app/tailor/
│   │   │   └── page.tsx              # Resume tailoring (/app/tailor)
│   │   ├── app/jobs/
│   │   │   ├── page.tsx              # Job board (/app/jobs)
│   │   │   └── [id]/page.tsx         # Job detail (/app/jobs/[id])
│   │   └── app/applications/
│   │       └── page.tsx              # Application tracker (/app/applications)
│   │
│   └── api/
│       ├── resume/
│       │   ├── parse/route.ts        # Upload & parse resume (PDF → text)
│       │   ├── tailor/route.ts       # AI-tailor resume for a job
│       │   └── optimize/route.ts     # AI-optimize resume for ATS
│       ├── jobs/
│       │   ├── route.ts              # List/search mock jobs
│       │   └── [id]/route.ts         # Get job details
│       └── applications/
│           └── route.ts              # Track applications
│
├── components/
│   ├── ui/                           # shadcn components (auto-generated)
│   ├── magicui/                      # Magic UI components (auto-generated)
│   ├── aceternity/                   # Aceternity components (auto-generated)
│   ├── reactbits/                    # React Bits components (auto-generated)
│   │
│   ├── marketing/                    # Marketing website sections
│   │   ├── hero.tsx                  # Hero with animated text + CTA
│   │   ├── features.tsx              # Feature showcase (bento grid)
│   │   ├── how-it-works.tsx          # Step-by-step with timeline
│   │   ├── testimonials.tsx          # Marquee testimonials
│   │   ├── stats.tsx                 # Number tickers
│   │   ├── cta.tsx                   # Final call to action
│   │   ├── navbar.tsx                # Floating marketing navbar
│   │   └── footer.tsx                # Marketing footer
│   │
│   ├── app/                          # App-specific components
│   │   ├── app-sidebar.tsx           # Dashboard sidebar navigation
│   │   ├── app-topbar.tsx            # Dashboard top bar
│   │   └── app-shell.tsx             # Dashboard shell wrapper
│   │
│   ├── resume/
│   │   ├── resume-uploader.tsx       # Drag & drop upload
│   │   ├── resume-preview.tsx        # Resume preview card
│   │   ├── resume-editor.tsx         # Edit resume sections
│   │   ├── resume-comparison.tsx     # Before/after comparison
│   │   ├── ats-score.tsx             # ATS score display
│   │   └── ats-suggestions.tsx       # ATS improvement suggestions
│   │
│   ├── tailor/
│   │   ├── job-input.tsx             # Job description input
│   │   ├── tailoring-progress.tsx    # AI processing animation
│   │   └── tailored-result.tsx       # Result with diff view
│   │
│   ├── jobs/
│   │   ├── job-card.tsx              # Job listing card
│   │   ├── job-filters.tsx           # Filter/search controls
│   │   ├── job-detail.tsx            # Full job details
│   │   └── auto-apply-config.tsx     # Auto-apply preferences
│   │
│   ├── applications/
│   │   ├── application-tracker.tsx   # Application status board
│   │   └── application-card.tsx      # Individual application card
│   │
│   └── shared/
│       ├── motion-wrapper.tsx        # Motion client component wrapper
│       ├── section-header.tsx        # Reusable section heading
│       ├── theme-toggle.tsx          # Dark/light mode toggle
│       ├── loading-skeleton.tsx      # Loading states
│       └── empty-state.tsx           # Empty state displays
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts              # AI provider interface
│   │   ├── mock-provider.ts         # Mock AI implementation
│   │   └── prompts.ts               # Prompt templates
│   ├── resume/
│   │   ├── parser.ts                # PDF parsing logic
│   │   ├── types.ts                 # Resume data types
│   │   └── templates.ts             # Resume templates
│   ├── jobs/
│   │   ├── types.ts                 # Job data types
│   │   └── mock-data.ts             # Mock job listings
│   ├── store/
│   │   ├── resume-store.ts          # Zustand resume state
│   │   ├── job-store.ts             # Zustand job state
│   │   └── app-store.ts             # Zustand app state
│   ├── utils.ts                     # Utility functions (cn, etc.)
│   └── constants.ts                 # App constants
│
├── public/
│   ├── logo.svg                     # Hyr logo
│   └── og-image.png                 # Open Graph image
│
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
├── components.json                  # shadcn config
├── pnpm-lock.yaml
└── package.json
```

---

## Features Breakdown

### Feature 1: Marketing Landing Page (`/`)

A visually stunning landing page that showcases Hyr's capabilities and converts visitors to sign up.

**Layout:** Floating Navbar (Aceternity) + Footer. No sidebar.

**Sections:**
1. **Hero Section**
   - Aceternity Aurora Background or Spotlight effect
   - Bricolage Grotesque display heading with Magic UI Word Rotate: "Get **Hyr**-ed at {Google, Meta, Stripe, OpenAI}"
   - Subtitle with Aceternity Text Generate Effect (Geist body font)
   - Shimmer Button CTA → "Get Started Free" → links to `/app`
   - Secondary ghost button → "See How It Works" → smooth scroll

2. **Features Section**
   - Magic UI Bento Grid layout
   - 3 feature cards with Magic Card hover effects + Border Beam on featured:
     - **Resume Tailoring** — "AI rewrites your resume for every job"
     - **ATS Optimizer** — "Beat the bots. Score 95%+ on ATS systems"
     - **Auto Apply** — "Set it and forget it. We apply while you sleep"
   - Each card has an icon (Lucide), title (Bricolage Grotesque), description (Geist)

3. **How It Works**
   - Aceternity Timeline component
   - 3 steps with illustrations:
     1. Upload Resume → drag & drop illustration
     2. Paste Job Description → text editor illustration
     3. Get Tailored Resume → before/after illustration

4. **Stats Section**
   - Magic UI Number Tickers with stagger animation
   - "10,000+ resumes optimized" | "95% ATS pass rate" | "3x more interviews"
   - React Bits BlurText for section header

5. **Testimonials**
   - Magic UI Marquee (double row, opposite directions)
   - Testimonial cards with avatar, name, role, company, quote
   - Auto-scrolling, pausable on hover

6. **Final CTA**
   - Large centered section with Aceternity Spotlight
   - Bricolage Grotesque display heading: "Ready to land your dream job?"
   - Shimmer Button + Confetti trigger on click

### Feature 2: Resume Upload & Management (`/app/resume`)

Upload, parse, and manage multiple resumes.

**Pages:**
- `/app/resume` — Resume list + upload area
- `/app/resume/[id]` — View and edit a specific resume

**Functionality:**
- Drag & drop PDF upload (react-dropzone) with fancy upload animation
- Server-side PDF parsing (pdf-parse) via API route
- Parse into structured data: contact, summary, experience, education, skills, certifications
- Resume cards in a grid with preview, last modified date, tailoring count
- Click a resume card → full resume view with editable sections
- Inline section editing with auto-save
- Delete with confirmation dialog
- Download as PDF (@react-pdf/renderer)

**Mock AI:** Parser extracts raw text. Mock AI returns pre-defined structured data based on simple keyword matching.

### Feature 3: Resume Tailoring (`/app/tailor`)

Customize a resume for a specific job description.

**Page:** `/app/tailor`

**Flow:**
1. Select a resume from uploaded resumes (dropdown or card picker)
2. Paste job description into a rich textarea
3. Click "Tailor My Resume" (Shimmer Button)
4. Animated processing state:
   - Particles animation in background
   - Typing animation showing "Analyzing job requirements..."
   - Progress steps: Analyzing → Matching Keywords → Rewriting → Done
5. Side-by-side comparison: Original (left) vs. Tailored (right)
6. Highlighted changes: green for additions, yellow for modifications, red for removals
7. Accept/reject individual changes with checkboxes
8. Download tailored resume as PDF

**Mock AI:** Returns the original resume with mock modifications:
- Adds keywords from the job description into skills section
- Tweaks summary to mention the company/role
- Rewords 1-2 bullet points to match job requirements
- All changes are deterministic transformations based on keyword extraction

### Feature 4: ATS Optimizer (`/app/resume/[id]/optimize`)

Analyze and optimize a resume for Applicant Tracking Systems.

**Page:** `/app/resume/[id]/optimize`

**Functionality:**
- Overall ATS Score (0-100) displayed as an animated circular progress ring
- Category scores with progress bars: Formatting, Keywords, Structure, Readability
- Suggestions list grouped by severity:
  - Critical (red) — "Missing skills section"
  - Warning (yellow) — "Summary too short (< 50 words)"
  - Info (blue) — "Consider adding certifications"
- One-click "Apply Fix" button per suggestion
- "Optimize All" button to apply all fixes at once
- Before/after comparison view

**Mock AI:** Scoring based on heuristics:
- Section completeness: has summary? skills? education? (weighted)
- Keyword density vs. common industry keywords
- Length checks (too short / too long)
- Formatting checks (simple text vs. complex formatting)
- Returns deterministic score + fixed suggestions per missing element

### Feature 5: Job Board & Auto-Apply (`/app/jobs`)

Browse mock jobs and configure auto-apply.

**Pages:**
- `/app/jobs` — Job board with search and filters
- `/app/jobs/[id]` — Job detail with apply actions

**Functionality:**
- 20-30 mock job listings with realistic data (companies, salaries, descriptions)
- Search by title, company, location (instant filter)
- Filter pills: Remote / Onsite / Hybrid, Junior / Mid / Senior, salary range slider
- Job cards: company logo, title, company, location, salary range, posted date, tags
- Job detail page: full description, requirements, benefits, company info
- Two apply actions:
  - "Quick Apply" — applies with default resume, adds to tracker
  - "Tailor & Apply" — redirects to `/app/tailor` with job description pre-filled
- Auto-apply configuration panel (in sidebar or modal):
  - Toggle on/off
  - Set criteria: target roles, preferred locations, minimum salary, remote preference
  - Shows activity feed of "auto-applied" jobs with timestamps
  - All mock — no real applications sent

### Feature 6: Application Tracker (`/app/applications`)

Track all job applications in one place.

**Page:** `/app/applications`

**Functionality:**
- Stats overview at top: total applications, response rate, interview rate (Number Tickers)
- Kanban-style board with columns:
  - Applied → Screening → Interview → Offer → Rejected
- Application cards: company logo, role, date applied, resume version used, status badge
- Click card → detail dialog with full history
- Filter by status, date range, company
- List view toggle (table format) as alternative to kanban

---

## UI/UX Design System

### Color Palette (defined in globals.css @theme)
```
Primary:     Deep indigo/violet (#6366f1 → oklch equivalent)
Secondary:   Warm amber (#f59e0b)
Background:  Off-white (#fafafa) / Dark: near-black (#09090b)
Surface:     White (#ffffff) / Dark: dark gray (#171717)
Text:        Charcoal (#18181b) / Dark: off-white (#fafafa)
Muted:       Gray (#71717a)
Accent:      Teal (#14b8a6) for success states
Destructive: Red (#ef4444)
```

### Typography
- **Display/Headings:** Bricolage Grotesque (600-800 weight) — bold, modern, characterful
- **Body text:** Geist Sans (400-600 weight) — clean, readable, modern
- **Monospace:** Geist Mono — for ATS scores, technical data, code-like content
- **Font variables:** `--font-display`, `--font-sans`, `--font-mono`

### Spacing & Layout
- Max content width: 1280px
- Section padding: 80px-120px vertical
- Card border radius: 12-16px
- Consistent 8px grid system

### Animations (Motion)
- Page transitions: fade + slight Y translate (200ms)
- Card hover: subtle scale(1.02) + shadow elevation
- Section entrance: staggered fade-in on scroll (whileInView)
- Button interactions: whileTap scale(0.97)
- Loading states: skeleton shimmer + pulse
- Number counting: spring physics via Number Ticker
- Text reveals: character-by-character with stagger

### Dark Mode
- Full dark mode support via shadcn's `.dark` class
- Toggle in both marketing navbar and app top bar
- System preference detection on first visit
- Persisted to localStorage

---

## Mock AI Architecture

```typescript
// lib/ai/provider.ts
interface AIProvider {
  tailorResume(resume: Resume, jobDescription: string): Promise<TailoredResume>;
  optimizeForATS(resume: Resume): Promise<ATSResult>;
  scoreResume(resume: Resume): Promise<ATSScore>;
  extractJobDetails(description: string): Promise<JobDetails>;
}

// lib/ai/mock-provider.ts
class MockAIProvider implements AIProvider {
  // Simulates AI with 1-3 second delays
  // Returns deterministic results based on input keywords
  // Easy to swap with real provider later
}
```

The mock provider:
- Adds artificial delays (1-3s) to simulate AI processing
- Uses keyword extraction and template-based responses
- Returns realistic-looking results
- Implements the same interface as the future real provider
- Swap to real AI by changing one import when API key is available

---

## Implementation Order

### Phase 1: Project Foundation
1. Scaffold Next.js 16 project with `pnpm dlx create-next-app@latest`
2. Configure Tailwind v4 (verify CSS-first setup)
3. Initialize shadcn/ui with `pnpm dlx shadcn@latest init`
4. Install Motion, Zustand, Geist font, and other dependencies via `pnpm add`
5. Set up fonts: Bricolage Grotesque (next/font/google) + Geist (geist package)
6. Configure theme (colors, dark mode, font variables) in globals.css `@theme`
7. Create root layout with font variables and providers
8. Create `(marketing)` and `(app)` route groups with their respective layouts
9. Set up basic folder structure for components and lib

### Phase 2: Marketing Landing Page
1. Build marketing layout (floating navbar + footer)
2. Build hero section with Aurora/Spotlight + Word Rotate + Shimmer Button
3. Build features bento grid section with Magic Cards
4. Build "how it works" timeline section
5. Build stats section with Number Tickers
6. Build testimonials marquee section
7. Build final CTA section with Confetti
8. Add scroll-triggered animations (Motion whileInView) throughout
9. Add dark mode toggle in navbar

### Phase 3: App Shell & Resume Management
1. Build app layout with sidebar + top bar
2. Build app dashboard home page (`/app`)
3. Build resume upload page with drag & drop (`/app/resume`)
4. Implement PDF parsing API route (`/api/resume/parse`)
5. Build resume list view with cards
6. Build resume detail/edit view (`/app/resume/[id]`)
7. Implement resume data types and Zustand store

### Phase 4: AI Mock Layer & Resume Tailoring
1. Define AI provider interface (`lib/ai/provider.ts`)
2. Implement mock AI provider (`lib/ai/mock-provider.ts`)
3. Build tailoring page — job input + resume selector (`/app/tailor`)
4. Build processing animation with progress steps
5. Build side-by-side comparison view with highlighted changes
6. Build accept/reject individual changes UI

### Phase 5: ATS Optimizer
1. Build ATS scoring algorithm (mock heuristics)
2. Build ATS score display (animated circular progress ring)
3. Build category score bars
4. Build suggestions list grouped by severity
5. Build one-click fix functionality
6. Build before/after comparison

### Phase 6: Job Board & Auto-Apply
1. Create mock job data (20-30 realistic listings in `lib/jobs/mock-data.ts`)
2. Build job listing page with search + filter pills (`/app/jobs`)
3. Build job cards with hover effects
4. Build job detail page (`/app/jobs/[id]`)
5. Build quick apply + tailor & apply flows
6. Build auto-apply configuration panel
7. Build auto-apply activity feed

### Phase 7: Application Tracker
1. Build application tracker page (`/app/applications`)
2. Build stats overview with Number Tickers
3. Build kanban-style board with status columns
4. Build application cards with status badges
5. Build list view toggle (table alternative)
6. Connect all flows: apply actions → tracker entries

### Phase 8: Polish & Final Touches
1. Add page transitions between routes
2. Responsive design audit (mobile, tablet, desktop)
3. Loading states everywhere (skeletons)
4. Empty states for all lists
5. Error handling and error states
6. SEO metadata (title, description, OG image)
7. Performance audit (Lighthouse)
8. Final animation polish and timing tweaks

---

## Key Design Decisions

1. **Route groups** — `(marketing)` for the website, `(app)` for the product. Separate layouts, same codebase.
2. **App Router only** — No pages router. All routes use Next.js 16 App Router.
3. **Server Components by default** — Only use `"use client"` where needed (interactive components, animations).
4. **Motion wrapper pattern** — Wrap animated components in `"use client"` boundaries to keep parent pages as server components.
5. **CSS-first Tailwind v4** — No `tailwind.config.js`. All theme customization via `@theme` in `globals.css`.
6. **shadcn CLI for everything** — All third-party UI components (Magic UI, Aceternity, React Bits) installed via `pnpm dlx shadcn@latest add`.
7. **Mock-first AI** — Clean interface so the mock can be swapped for a real provider with zero UI changes.
8. **Zustand for state** — Lightweight, no boilerplate. Stores for resume data, job data, and app state.
9. **pnpm only** — All package operations use pnpm. No npm or yarn.
10. **API routes for server logic** — PDF parsing, AI calls, and data operations happen server-side via Next.js route handlers.
