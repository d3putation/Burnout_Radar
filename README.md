# Burnout Radar (MVP)

Burnout Radar estimates burnout risk from lightweight work signals and explains what drove the score.

Product message: **"We don't treat — we warn early."**

## Safety
- This app is **not a medical device**.
- It does not diagnose, treat, or provide medical advice.
- If symptoms are severe or persistent, consult a qualified professional.

## What this MVP includes
- Next.js (App Router) + React + TypeScript + Tailwind frontend
- Next API routes backend
- Deterministic transparent risk scoring (0-100)
- Risk drivers + confidence indicator
- Rule-based recommendations + LLM-ready recommendation interface
- MockLLM provider by default; real provider hook via env vars
- Weekly plan generator with recovery slots + deep-work blocks + ICS export
- Team/HR anonymized aggregate demo view
- Manual input + JSON import for meetings/tasks
- Demo mode with seeded sample data

## Routes
- `/` Dashboard
- `/inputs` Manual input + import JSON
- `/plan` Weekly plan
- `/team` Team aggregate (anonymized only)
- `/settings` Work hours, thresholds, privacy

## API Endpoints
- `POST /api/score` -> score breakdown, factors, trends, sparkline
- `POST /api/recommend` -> rule-based + LLM-style explanation/actions
- `POST /api/plan` -> proposed weekly schedule + ICS text
- `POST /api/team/aggregate` -> anonymized team aggregates

## Project structure
```
app/
  api/
    score/route.ts
    recommend/route.ts
    plan/route.ts
    team/aggregate/route.ts
  inputs/page.tsx
  plan/page.tsx
  team/page.tsx
  settings/page.tsx
  page.tsx
components/
  ScoreGauge.tsx
  Sparkline.tsx
  DriversCards.tsx
  MicroCoach.tsx
  PrivacyNotice.tsx
lib/
  scoring/index.ts
  derivations/index.ts
  recommendations/index.ts
  llm/
    types.ts
    mock-provider.ts
    real-provider.ts
    index.ts
  plan/index.ts
  ics/index.ts
  storage/local.ts
  hooks/useBurnoutData.ts
  types.ts
data/
  sample-data.ts
  import-meetings.json
  import-tasks.json
```

## Setup
1. Install dependencies:
```bash
npm install
```
2. (Optional) Configure real LLM provider:
```bash
cp .env.example .env.local
# set LLM_API_KEY + LLM_BASE_URL
```
3. Run dev server:
```bash
npm run dev
```
4. Open `http://localhost:3000`

## LLM provider behavior
- Default behavior uses `MockLLMProvider`.
- If both `LLM_API_KEY` and `LLM_BASE_URL` are set, `/api/recommend` switches to `RealLLMProvider`.
- `RealLLMProvider` is a clean interface stub meant for easy replacement with your production vendor/client.

## Data privacy in MVP
- Stored: daily manual signals, meeting/task aggregates, derived message counts.
- Not stored: raw message content.
- Team page only returns aggregated anonymized stats. No individual drill-down.

## Scoring architecture overview
`lib/scoring/index.ts` computes a daily score from six weighted factors:
- Sleep debt (7-day avg + today delta)
- Overtime (hour thresholds + streak)
- Meeting density (hours/count/back-to-back)
- No-window blocks (long low-gap stretches)
- Task pace/load (backlog growth + overdue)
- Self-report (stress + low energy + after-hours activity)

The score is smoothed with a short moving average to reduce jitter and returns:
- total score + label (Low/Medium/High)
- confidence (High/Medium/Low)
- per-factor score/weight/contribution/notes
- top drivers

## Weekly plan overview
`lib/plan/index.ts` builds a proposal for next week:
- Inserts 20-min recovery breaks between near back-to-back meetings
- Suggests/protects daily deep-work block when possible
- Flags conflicts and suggests moving optional meetings
- Exports proposal as ICS via `lib/ics/index.ts`

## Demo import files
- Meetings sample: `data/import-meetings.json`
- Tasks sample: `data/import-tasks.json`

Paste these into `/inputs` import panel.
