<p align="center">
  <img src="public/logo.svg" alt="Hyr Logo" width="120" />
</p>

<h1 align="center">Hyr</h1>

<p align="center">
  <strong>AI-Powered Resume Platform</strong>
</p>

<p align="center">
  Build, tailor, optimize, and track your job search — all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?logo=google" alt="Google Gemini" />
</p>

---

![Hyr Platform Screenshot](public/screenshot.png)

> **Note:** Run `pnpm dev` and capture a screenshot of the application to replace the placeholder above.

---

## What is Hyr?

Hyr is an AI-powered job application platform that helps you win more interviews. Upload your resume once, and let Hyr's AI tailor it for every job you apply to — matching keywords, tone, and requirements to beat ATS systems and land more callbacks.

---

## Features

### Resume Builder
- **Upload & Parse** — Drop any PDF resume and Hyr parses it into a fully structured, editable format
- **Inline Editing** — Edit every section directly in the browser: name, contact info, work experience, education, certifications, and skills — no forms, no modals
- **Skills Combobox** — Smart autocomplete with a library of popular skills (React, TypeScript, AWS, Docker, Kubernetes, and more); free-form entry also supported
- **PDF Export** — One-click download of your resume as a polished PDF; warns if your resume exceeds one page
- **Multi-Resume** — Maintain multiple resume variants for different roles (engineering, management, etc.)

### AI Resume Tailoring
- **Paste or Fetch Job Description** — Paste text directly or enter a job URL and Hyr scrapes the page automatically (HTML → clean Markdown via Mozilla Readability + Turndown)
- **AI Rewrite** — Powered by Google Gemini, rewrites your resume to match the specific job: keywords, responsibilities, and tone
- **Match Score** — See a relevance score before and after tailoring
- **HyperText Animation** — Smooth scramble-text animation plays during the AI tailoring process

### ATS Optimizer
- **ATS Score** — Detailed compatibility score showing how well your resume passes Applicant Tracking Systems
- **Category Breakdown** — Scores across formatting, keywords, structure, and readability
- **Actionable Suggestions** — Specific, prioritized improvements to maximize your score
- **Skeleton Loading** — Structured skeleton UI renders instantly while the AI analysis loads

### Application Tracker
- **DataTable View** — All your applications in a clean, grouped table organized by status
- **Status Groups** — Applied → Screening → Interview → Offer → Rejected, each rendered as a collapsible group
- **Auto-Apply Badge** — Highlights applications submitted via Beast Mode
- **Status Updates** — Change an application's status inline with a dropdown action menu

### Beast Mode (Auto-Apply)
- **Bulk Apply** — Set preferences (role, location, salary, remote) and Beast Mode searches and applies to matching jobs automatically
- **Job Selection** — Browse matched jobs and cherry-pick which ones to include; individual checkboxes work correctly (no double-toggle)
- **Progress Tracking** — Real-time progress bar as Beast Mode submits applications

### Jobs Board
- **Curated Listings** — Browse job listings matched to your resume and preferences
- **Quick Apply** — Apply to any listing in one click using your active resume
- **Skeleton Loading** — Fast skeleton UI on page load

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui |
| AI | Google Gemini (via AI SDK) |
| Animations | Motion (Framer Motion), MagicUI HyperText |
| State | Zustand with persistence |
| Tables | TanStack Table v8 |
| Web Scraping | Mozilla Readability, Turndown, jsdom |
| Fonts | Geist Sans, Geist Mono, Bricolage Grotesque |
| Icons | Lucide React |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

---

## Project Structure

```
app/
├── (app)/              # Authenticated app routes
│   └── app/
│       ├── resume/     # Resume list + detail + ATS optimizer
│       ├── tailor/     # AI resume tailoring
│       ├── applications/ # Application tracker
│       ├── jobs/       # Jobs board
│       └── beast-mode/ # Auto-apply
├── (marketing)/        # Landing page
└── api/
    ├── resume/         # PDF generation + resume AI
    ├── tailor/         # Tailoring AI endpoint
    ├── optimize/       # ATS analysis endpoint
    └── scrape/         # Job URL → Markdown scraper
components/
├── app/                # App-specific components (sidebar, breadcrumb)
├── ui/                 # shadcn/ui primitives
└── shared/             # Shared utilities (theme toggle, etc.)
lib/
├── resume/             # Resume types and parsing logic
└── store/              # Zustand stores (resumes, applications, jobs)
```

---

## License

MIT
