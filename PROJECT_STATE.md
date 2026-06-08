name: Polly Mission Control
domain: grids
status: deployed (static)
last_worked: 2026-06-08
next_session: All 12 widgets ported with detail views — ready for GitHub push
maturity: 🌱
deployment:
  type: static
  port: 3000
  serve_command: "npx serve dist -l 3000"
  build_output: dist/
phases_complete:
  - "Phase 0: Scaffold Next.js 16 + Tailwind v4"
  - "Phase 1: Build Linear-inspired shell (sidebar, top nav, theme system)"
  - "Phase 2: Port core widgets with detail views (DailyCost, RoutineChecklist, Calendar)"
  - "Phase 3: Port remaining widgets (AgentStatus, LiveMessageFeed, ProjectKanban, VaultHealth, etc.)"
  - "Phase 4: All 12 widgets integrated, build passes"
notes: >
  Polly Mission Control — Linear-inspired personal + agent operations dashboard.
  
  Architecture:
  - Next.js 16.2.7 + Tailwind v4 + App Router + TypeScript
  - CSS custom properties for 8 themes (Linear, Reas, Fidenza, Ghost Box, Martens, Jetset, Riley, Albers)
  - Sidebar: collapsible (64px ↔ 224px), persists to localStorage
  - Top nav: breadcrumbs, search, theme switcher, notifications, user avatar
  - WidgetCard: reusable card with header, hover-reveal expand button, loading state
  - WidgetDetail: modal dialog for expanded views
  
  Widgets (12 total):
  | # | Widget | Status | Detail View |
  |---|--------|--------|-------------|
  | 1 | DailyCost | ✅ Real API | ✅ Stats grid, sparkline, provider breakdown |
  | 2 | RoutineChecklist | ✅ Real API | ✅ Full list, heatmaps, streaks |
  | 3 | Calendar | ✅ Real API | ✅ Month grid, events, day selection |
  | 4 | AgentStatusGrid | ✅ Real API | ✅ Search, filter, team breakdown |
  | 5 | LiveMessageFeed | ✅ Real API | ✅ Full feed with type badges |
  | 6 | ProjectKanban | ✅ Real API | ✅ All projects with progress |
  | 7 | VaultHealth | ✅ Real API | ✅ Detailed stats, health status |
  | 8 | CronSchedule | ✅ Demo data | — |
  | 9 | QuickActions | ✅ Demo data | — |
  | 10 | SystemStatus | ✅ Demo data | — |
  | 11 | RecentActivity | ✅ Demo data | — |
  | 12 | ProjectStatus | ✅ Demo data | — |
  
  Routes:
  - / — Overview dashboard with 12 widgets + 4 stat cards
  - /agents, /tasks, /calendar, /projects, /activity, /settings
  
  Build: ✅ Passes cleanly
  
  Next:
  - GitHub push to polly-mission-control repo
  - Cloudflare Tunnel or Vercel deploy
  - Add real API routes for remaining widgets
  - Consider "Attention Queue" concept from cartographer research
