# CipherSQLStudio — UI Layout Wireframe Structure

> **Type:** Layout reference and component hierarchy guide  
> **Format:** Text-based wireframes + SCSS layout notes  
> **Draw actual wireframes by hand or in Figma/Excalidraw using these as reference.**

---

## PAGE HIERARCHY

```
App (Router)
├── /login             → LoginPage
├── /register          → RegisterPage
└── (auth-protected)
    ├── /dashboard     → DashboardPage
    ├── /assignment/:id → AssignmentPage    ← most complex
    └── /profile        → ProfilePage
```

---

## PAGE 1 — Login / Register

### Mobile Layout (320px base)

```
┌─────────────────────────┐
│        [LOGO]           │
│    CipherSQL Studio     │
│                         │
│  ┌───────────────────┐  │
│  │  Email            │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  Password     [👁]│  │
│  └───────────────────┘  │
│                         │
│  [ Login / Register ]   │  ← full width CTA button
│                         │
│  ─────── or ───────     │
│                         │
│  Don't have an account? │
│  [ Sign Up ]            │
└─────────────────────────┘
```

### Desktop Layout (≥ 1024px)

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   LEFT PANEL (50%)           RIGHT PANEL (50%)   │
│   ─────────────────          ─────────────────   │
│   Brand illustration         Login form card     │
│   or tagline                 centered vertically │
│   "Learn SQL by doing"                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

**SCSS Layout Notes:**

```
.auth-layout
  → Mobile: single column, padding $space-4
  → Tablet+: CSS Grid, 1fr  (form card centered)
  → Laptop+: CSS Grid, 1fr 1fr (split panel)

.auth-layout__brand
  → Hidden on mobile
  → Visible at laptop breakpoint

.auth-layout__form-card
  → max-width: 420px
  → padding: $space-6
  → border-radius, card-shadow mixin
```

---

## PAGE 2 — Dashboard

### Mobile Layout

```
┌─────────────────────────┐
│ [≡] CipherSQL   [👤]    │  ← Navbar: hamburger + avatar
├─────────────────────────┤
│                         │
│  Hello, Piyush 👋       │
│  3 / 12 completed       │
│  [████░░░░░░] 25%       │  ← progress bar
│                         │
├─────────────────────────┤
│  Filter: [All] [Easy]   │
│          [Med] [Hard]   │  ← filter chips, scrollable horizontal
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │ 🟢 EASY           │  │  ← difficulty color-coded left border
│  │ Basic SELECT      │  │
│  │ Filter and sort   │  │
│  │ employees table   │  │
│  │                   │  │
│  │ [Start →]         │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🟡 MEDIUM         │  │
│  │ JOIN Challenge    │  │
│  │ ...               │  │
│  │ [Start →]         │  │
│  └───────────────────┘  │
│         ...             │
└─────────────────────────┘
```

### Desktop Layout (≥ 1024px)

```
┌────────────────────────────────────────────────────────┐
│ [Logo]  CipherSQL Studio        [Dashboard] [Profile]  │  ← full Navbar
├────────────────────────────────────────────────────────┤
│                                                        │
│  Hello, Piyush 👋                       Progress: 25%  │
│  ─────────────────────────────────────────────────── │
│                                                        │
│  [All] [SELECT] [JOIN] [GROUP BY] [Subquery]  Sort ▼  │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 🟢 EASY      │  │ 🟡 MEDIUM    │  │ 🔴 HARD      │ │
│  │ Basic SELECT │  │ JOIN ...     │  │ Subquery...  │ │
│  │ 3 min        │  │ 8 min        │  │ 15 min       │ │
│  │ [Start →]    │  │ [Continue →] │  │ [Start →]    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  3-column grid at laptop, 2-column at tablet           │
└────────────────────────────────────────────────────────┘
```

**SCSS Layout Notes:**

```
.dashboard-layout
  → Sidebar: hidden on mobile, sticky left on desktop (250px)
  → Main: full width mobile, flex-grow on desktop

.assignment-grid
  → Mobile:  1 column
  → Tablet:  grid-template-columns: 1fr 1fr
  → Laptop:  grid-template-columns: repeat(3, 1fr)
  → gap: $space-4

.progress-bar
  → width: 100%
  → height: 8px
  → inner div width controlled by inline style (percentage)
  → transition on width change
```

---

## PAGE 3 — Assignment Page (Core UI)

This is the most complex layout. Study it carefully.

### Mobile Layout (Stacked, single column)

```
┌─────────────────────────┐
│ [←] Basic SELECT  🟢    │  ← Navbar with back + title + difficulty
├─────────────────────────┤
│ TASK DESCRIPTION        │  ← Collapsible on mobile
│ ─────────────────────   │
│ Find all employees in   │
│ the Sales department    │
│ earning > 50000         │
│ [Show schema ▼]         │  ← expands table structure below
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ SQL EDITOR          │ │  ← Monaco editor
│ │                     │ │
│ │ SELECT ...          │ │
│ │                     │ │
│ │ ─── language: SQL ─ │ │
│ └─────────────────────┘ │
│                         │
│ [⚡ Execute Query]       │  ← full width button below editor
│                         │
├─────────────────────────┤
│ RESULTS                 │
│ ─────────────────────── │
│ (results table scrolls  │
│  horizontally)          │
│                         │
│ ← scroll for columns →  │
│                         │
│ Rows: 24 | 0.3ms        │  ← meta row
├─────────────────────────┤
│ [💡 Get Hint]           │  ← bottom, collapsible hint panel
│ Hints used: 2 / 5       │
└─────────────────────────┘
```

### Desktop Layout (3-panel split)

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo]   Basic SELECT  [🟢 Easy]               [Submit] [Profile]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  LEFT PANEL (30%)       CENTER PANEL (40%)    RIGHT PANEL (30%)   │
│  ─────────────────       ────────────────      ──────────────────  │
│  ASSIGNMENT BRIEF        SQL EDITOR            HINT PANEL          │
│  ─────────────────       ────────────────      ──────────────────  │
│  Title                   [ Monaco Editor ]     [💡 Get Hint]       │
│  Description                                  Hints: 2/5 used      │
│  ─                       [ Execute Query ]                         │
│  SCHEMA REFERENCE                             Hint #2:             │
│  employees               ────────────────     "Think about what    │
│   └ employee_id          RESULTS TABLE        relationship exists  │
│   └ first_name            col1 | col2 |...    between employees    │
│   └ salary                row  | row  |...    and departments.     │
│   └ dept_id               row  | row  |...    What column links    │
│  departments                                  them together?"       │
│   └ dept_id               Rows: 24 | 0.3ms                         │
│   └ dept_name                                                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**SCSS Layout Notes:**

```
.assignment-layout
  → Mobile:    display: flex; flex-direction: column
  → Tablet:    display: grid; grid-template-columns: 1fr 1fr
               (brief + editor on left, results + hint on right)
  → Laptop:    display: grid; grid-template-columns: 30% 40% 30%
               (3-panel split)

.assignment-layout__brief
  → Mobile: collapsible accordion (controlled by state)
  → Desktop: always visible, overflow-y: auto, sticky

.assignment-layout__editor
  → height: 300px mobile, 480px desktop
  → Monaco fills the container: width: 100%, height: 100%

.assignment-layout__results
  → overflow-x: auto (allow horizontal scroll for wide tables)
  → max-height: 300px mobile, auto desktop
  → overflow-y: auto

.assignment-layout__hints
  → Mobile: fixed to bottom (position: fixed, bottom: 0)
             expands upward when "Get Hint" clicked
  → Desktop: static panel on right, scrolls within its own container
```

---

## PAGE 4 — Profile Page

### Layout Structure

```
┌──────────────────────────────────────────────────┐
│ [←] Back to Dashboard                            │
├──────────────────────────────────────────────────┤
│  [ Avatar ]  Piyush K.                           │
│              piyush@example.com                  │
│              Joined: Feb 2026                    │
├──────────────────────────────────────────────────┤
│  STATS                                           │
│  ──────────────────────────                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │    3     │ │    47    │ │   5/5    │         │
│  │ Completed│ │ Queries  │ │  Hints   │         │
│  └──────────┘ └──────────┘ └──────────┘         │
├──────────────────────────────────────────────────┤
│  RECENT SUBMISSIONS                              │
│  ──────────────────────────                      │
│  ✅ Basic SELECT      Feb 28  Correct on 3rd     │
│  🔴 JOIN Challenge    Feb 27  Last attempt error │
│  ✅ GROUP BY Basics   Feb 26  Correct on 1st     │
└──────────────────────────────────────────────────┘
```

---

## COMPONENT CATALOG (All Components To Build)

```
Shared (used across multiple pages):
  ├── Navbar          → responsive, auth-aware
  ├── Button          → variants: primary, secondary, danger, ghost
  ├── Badge           → difficulty badges: Easy/Medium/Hard
  ├── LoadingSpinner  → used during API calls
  ├── ErrorMessage    → inline error display
  └── Modal           → confirmation dialogs

Dashboard specific:
  ├── AssignmentCard  → BEM block (see _card.scss)
  ├── ProgressBar     → visual completion indicator
  └── FilterChips     → category filter buttons

Assignment page specific:
  ├── EditorWrapper   → Monaco container with toolbar
  ├── ExecuteButton   → with loading state
  ├── ResultsPanel    → table + meta row + error state
  ├── SchemaViewer    → tree-style schema display
  └── HintPanel       → trigger + hint display + counter

Auth pages:
  ├── AuthForm        → shared form shell (login + register)
  ├── FormInput       → controlled input with label + error
  └── PasswordInput   → FormInput + visibility toggle
```

---

## RESPONSIVE BREAKPOINT BEHAVIOR SUMMARY

```
Component        Mobile (< 641px)     Tablet (641–1023px)   Desktop (≥ 1024px)
──────────────────────────────────────────────────────────────────────────────
Navbar           Hamburger menu       Hamburger menu        Full horizontal nav
AssignmentGrid   1 column             2 columns             3 columns
AssignmentPage   Stacked panels       2-column split        3-panel split
HintPanel        Fixed bottom sheet   Right sidebar         Right sidebar
SchemaViewer     Accordion (hidden)   Accordion (hidden)    Always visible
ResultsTable     Horizontal scroll    Horizontal scroll     Full width
EditorWrapper    300px height         380px height          480px height
```

---

## STATE MANAGEMENT PER PAGE

```
DashboardPage  (local state or Context)
  → assignments: Assignment[]
  → isLoading: boolean
  → filter: "all" | "easy" | "medium" | "hard"
  → category: string

AssignmentPage  (QueryContext + local)
  → currentQuery: string             (Monaco value)
  → queryResult: { columns, rows }   (from API)
  → isExecuting: boolean
  → executionError: string | null
  → hints: string[]                  (accumulate per session)
  → hintsUsed: number
  → assignment: Assignment

AuthContext  (global, persisted across pages)
  → user: { userId, email, displayName }
  → accessToken: string              (memory only, NOT localStorage)
  → isAuthenticated: boolean
  → login(token, user): void
  → logout(): void
```

---

## NAVIGATION & ROUTING NOTES

```
Use React Router v6:

Protected Route wrapper pseudocode:
  ProtectedRoute({ children }):
    isAuthenticated = useAuthContext()
    IF !isAuthenticated:
      REDIRECT to /login with { state: { from: currentLocation } }
    RETURN children

After login:
  Navigate to: location.state?.from || "/dashboard"
  (takes user back to page they were trying to reach)

Route definitions in App.jsx:
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/assignment/:id" element={<AssignmentPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
  <Route path="*" element={<Navigate to="/dashboard" />} />
```
