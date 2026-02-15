# Bitcoin Risk Management Framework (BitcoinRMF)

## Project Overview
Institutional-grade Bitcoin risk management platform applying NIST RMF, FAIR, and STRIDE frameworks to Bitcoin's threat landscape. Identifies threats, maps vulnerabilities, scores severity, tracks remediation, evaluates BIP necessity, and counters FUD narratives.

## Tech Stack
- **Framework:** Next.js 16 + TypeScript + React 19
- **Styling:** Tailwind CSS 4 (via @tailwindcss/postcss)
- **State:** Zustand with localStorage persistence
- **AI:** Claude API via @anthropic-ai/sdk
- **Database:** Supabase (PostgreSQL + Row Level Security)
- **Auth:** NextAuth.js
- **Icons:** lucide-react

## Project Structure
```
src/
  app/              # Next.js App Router pages
    api/            # API routes (threats/analyze, bips/evaluate, fud/analyze)
    dashboard/      # Main dashboard
    threats/        # Threat register + detail pages
    risk-matrix/    # 5x5 risk heatmap
    bips/           # BIP evaluator
    fud/            # FUD tracker
  components/       # Reusable UI components
  lib/              # Utilities (store, scoring, seed-data, security, supabase)
  types/            # TypeScript type definitions
supabase/           # Database schema
```

## Key Patterns
- API routes: auth check → rate limit → input validation → Claude API → structured response
- State: Zustand store with seed data initialization, localStorage persistence
- Security: Rate limiting, input sanitization, security headers (same as AI-C-Level)
- Styling: Dark theme, Tailwind CSS 4 with CSS variables

## Domain Model
- **STRIDE:** Threat categorization (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege)
- **FAIR:** Quantitative risk analysis (Threat Event Frequency, Vulnerability, Loss Event Frequency, Loss Magnitude)
- **NIST RMF:** Risk management lifecycle (Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor)
- **Risk Matrix:** 5x5 heatmap (Likelihood 1-5 × Impact 1-5)

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm test` — Run all tests once (Vitest)
- `npm run test:watch` — Run tests in watch mode
