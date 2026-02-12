# UX Descriptions — Meme Data Collection App

> Layout, hierarchy, interaction patterns, micro-feedback, and accessibility guidelines for every page. **No theme or color specifications** — this document is purely about the experience.

---

## Shared Patterns (All Pages)

### Navigation Bar
- **Position:** Fixed top bar, always visible while scrolling.
- **Content:** App logo/title on the left; contextual right-side actions (Logout for users, Logout + label "Admin" for admin).
- **Mobile:** Collapses into a compact bar with an overflow menu (hamburger) for any secondary links.
- **Active state:** The current page link has a distinct underline or weight shift so users always know where they are.

### Feedback & Loading
- All async operations (form submit, data fetch) show an inline **spinner** or **skeleton placeholder** in the exact space where content will appear — never a blank screen.
- On success: a brief **toast notification** slides in from the top-right and auto-dismisses after 3 seconds.
- On error: the error message appears **immediately below the triggering element** (not in a separate alert banner), with a retry/dismiss action.

### Accessibility Baseline
- Every interactive element has a visible **focus ring** on keyboard focus (`:focus-visible`).
- Touch targets are **minimum 44 × 44 px**.
- All form inputs use `<label>` elements — never placeholder-only.
- `prefers-reduced-motion` is respected for all animations.

---

## 1. Registration Page — `/register`

### Purpose
Onboard new annotators by collecting their demographic profile alongside credentials. The form must feel short and approachable despite having 7 fields.

### Layout & Hierarchy

```
┌──────────────────────────────────────────────┐
│  (Centered card, max-width ~480px)           │
│                                              │
│  ┌── Heading ─────────────────────────────┐  │
│  │  App title / logo                      │  │
│  │  "Create your annotator account"       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌── Section: Credentials ────────────────┐  │
│  │  [Username]  text input                │  │
│  │  [Password]  password input + toggle   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌── Section: About You ──────────────────┐  │
│  │  [Age]  number stepper (13–100)        │  │
│  │  [Political Outlook]  segmented pills  │  │
│  │  [Religious Perspective]  segmented    │  │
│  │  [Internet Literacy]  segmented pills  │  │
│  │  [Dark Humor Tolerance]  labeled       │  │
│  │      slider (1–10) with tick marks     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [ Register ]  full-width primary button     │
│                                              │
│  "Already have an account? Log in" link      │
│                                              │
└──────────────────────────────────────────────┘
```

### Interaction Details

| Element | Behavior |
|---------|----------|
| **Username input** | Real-time availability check after 500ms debounce. Inline icon: ✓ available / ✗ taken. |
| **Password input** | Eye-toggle to reveal/hide. Strength hint below (e.g. "min 6 characters"). |
| **Age stepper** | Number input with `+` / `−` buttons. Restricts range 13–100 via `min` / `max`. |
| **Segmented pills** | Horizontally laid-out options (like iOS segmented control). One selected at a time. Keyboard-navigable with arrow keys. |
| **Dark humor slider** | Continuous slider, snap-to-integer. Current value displayed in a floating label above the thumb. Tick marks at 1, 5, 10. |
| **Register button** | Disabled until all fields are valid. On click: shows spinner inside button, disables all inputs. |

### Validation Feedback
- **Inline, field-level errors** appear directly below each field on blur or on submit.
- The first field with an error auto-scrolls into view and receives focus.
- Successful registration triggers a redirect with a brief "Welcome, {username}!" toast.

### Responsive
- On viewports < 480px, the card becomes edge-to-edge with horizontal padding.
- Segmented pills stack to **two rows** if they overflow, maintaining tap target sizes.

---

## 2. Login Page — `/login`

### Purpose
Single entry point for both annotators and the admin. Minimal, fast, zero-friction.

### Layout & Hierarchy

```
┌──────────────────────────────────────────────┐
│  (Centered card, max-width ~400px)           │
│                                              │
│  ┌── Heading ─────────────────────────────┐  │
│  │  App title / logo                      │  │
│  │  "Sign in to continue"                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Username]  text input                      │
│  [Password]  password input + eye toggle     │
│                                              │
│  [ Sign In ]  full-width primary button      │
│                                              │
│  "Don't have an account? Register" link      │
│                                              │
└──────────────────────────────────────────────┘
```

### Interaction Details

| Element | Behavior |
|---------|----------|
| **Username input** | Auto-focus on page load. Accepts free text. |
| **Password input** | Eye-toggle for visibility. Enter key triggers submit. |
| **Sign In button** | Disabled when either field is empty. Shows spinner on click. |
| **Error state** | "Invalid username or password" appears below the password field — never reveals which field is wrong. |

### Success Flows
- **Admin match:** Redirect to `/admin` with admin session.
- **Regular user:** Redirect to `/gallery` with user session.
- Both redirects are instant (client-side navigation), no full page reload.

### Responsive
- Card remains centered; minor padding adjustments below 400px.

---

## 3. Gallery Page — `/gallery`

### Purpose
The annotator's home base. At a glance: how much work is done, how much remains, and a one-tap shortcut to continue where they left off.

### Layout & Hierarchy

```
┌───────────────────────────────────────────────────────────┐
│  NavBar  [ Gallery ]  [ Logout ]                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌── Progress Section ──────────────────────────────────┐ │
│  │  Progress bar  ████████░░░░░░░░  128 / 500           │ │
│  │  Percentage label: "25.6% complete"                  │ │
│  │  [ Continue ]  prominent action button               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌── Meme Grid ─────────────────────────────────────────┐ │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │ │
│  │  │ img │  │ img │  │ img │  │ img │  │ img │       │ │
│  │  │  ✅ │  │  ✅ │  │  ⬜ │  │  ⬜ │  │  ⬜ │       │ │
│  │  │#001 │  │#002 │  │#003 │  │#004 │  │#005 │       │ │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘       │ │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │ │
│  │  │ img │  │ img │  │ img │  │ img │  │ img │       │ │
│  │  │  ⬜ │  │  ⬜ │  │  ⬜ │  │  ⬜ │  │  ⬜ │       │ │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘       │ │
│  │                     ...                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Interaction Details

| Element | Behavior |
|---------|----------|
| **Progress bar** | Fills proportionally. Numerical label updates in real-time on return from a review. |
| **"Continue" button** | Always visible in the progress section. Navigates to the **first incomplete meme**. If all done, label changes to "All Done! 🎉" and is disabled. |
| **Meme card** | Displays a square thumbnail, a status badge (completed / pending), and meme number. On hover: subtle lift + cursor pointer. On click: navigates to `/meme/[id]`. |
| **Status badge** | A small icon overlay on the card corner — checkmark for done, empty circle for pending. Uses iconography, not text, for scannability. |
| **Grid** | CSS Grid: 5 columns on desktop, 3 on tablet, 2 on mobile. Gap consistent. |

### Performance
- Images load with `loading="lazy"` — only in-viewport cards fetch their thumbnail.
- The grid reserves fixed-dimension slots per card to prevent **Cumulative Layout Shift**.
- An initial skeleton grid of empty cards shows while data loads.

### Responsive
- Columns reduce 5 → 3 → 2 as viewport shrinks.
- Progress section stacks vertically; button becomes full-width on mobile.

---

## 4. Meme Review Page — `/meme/[id]`

### Purpose
The core annotation experience. The user views one meme at a time and answers 5 survey questions. Must minimize cognitive load and encourage completion.

### Layout & Hierarchy

```
┌───────────────────────────────────────────────────────────┐
│  NavBar  [ ← Gallery ]                   [ Meme 42/500 ] │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌── Left / Top: Meme Display ──────────────────────────┐ │
│  │                                                       │ │
│  │          ┌──────────────────────┐                     │ │
│  │          │                      │                     │ │
│  │          │    Meme Image        │                     │ │
│  │          │    (max-height 60vh  │                     │ │
│  │          │     object-fit:      │                     │ │
│  │          │     contain)         │                     │ │
│  │          │                      │                     │ │
│  │          └──────────────────────┘                     │ │
│  │                                                       │ │
│  │  "ক্যাপশন: বাংলা ক্যাপশন..."                          │ │
│  │  (Bangla caption, readable font size)                 │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌── Right / Bottom: Survey Form ───────────────────────┐ │
│  │                                                       │ │
│  │  Q1  "How do you perceive this meme?"                 │ │
│  │      ○ Very Negative  ○ Negative  ○ Neutral           │ │
│  │      ○ Positive  ○ Very Positive                      │ │
│  │                                                       │ │
│  │  ── thin divider ──────────────────────                │ │
│  │                                                       │ │
│  │  Q2  "Is this meme offensive to any group?"           │ │
│  │      ○ Strongly Disagree  ○ Disagree  ○ Neutral       │ │
│  │      ○ Agree  ○ Strongly Agree                        │ │
│  │                                                       │ │
│  │  ── thin divider ──────────────────────                │ │
│  │                                                       │ │
│  │  Q3  "Contains Vulgarity?"                            │ │
│  │      ○ Yes   ○ No                                     │ │
│  │                                                       │ │
│  │  ── thin divider ──────────────────────                │ │
│  │                                                       │ │
│  │  Q4  "Primary Target (if any)"                        │ │
│  │      ○ None/General   ○ Political Figure              │ │
│  │      ○ Religious Group  ○ Gender/Identity             │ │
│  │      ○ Individual                                     │ │
│  │                                                       │ │
│  │  ── thin divider ──────────────────────                │ │
│  │                                                       │ │
│  │  Q5  "Should this be removed from a general feed?"    │ │
│  │      ○ Keep   ○ Flag/Filter   ○ Remove                │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌── Action Bar (sticky bottom) ────────────────────────┐ │
│  │  [ ← Previous ]              [ Submit & Next → ]     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Layout Modes
- **Desktop (≥ 1024px):** Two-column — meme image pinned left, survey form scrollable right.
- **Tablet/Mobile (< 1024px):** Single column — meme image on top (scrolls away), survey below.

### Interaction Details

| Element | Behavior |
|---------|----------|
| **Meme image** | Constrained to max 60% viewport height. Click/tap opens a **lightbox overlay** for full-resolution viewing. Pinch-to-zoom on mobile. |
| **Caption** | Displayed below the image in a readable Bangla-capable font. Uses `lang="bn"` for proper rendering. |
| **Radio groups** | Large tap targets (full row clickable, not just the circle). Selected option has a filled indicator + subtle background highlight. Keyboard: arrow keys navigate options. |
| **Question dividers** | Thin horizontal rules between questions to visually separate them without clutter. |
| **"Previous" button** | Navigates to `/meme/[id-1]`. **Disabled with reduced opacity** on the first meme. Does not require saving. |
| **"Submit & Next" button** | Disabled until all 5 questions are answered. On click: spinner in button → save → auto-navigate to next meme. If this is the last meme, label reads "Submit & Finish" and redirects to gallery. |
| **Pre-filled state** | If the user has already reviewed this meme, all radio buttons pre-select their previous answers. They can modify and re-submit (UPSERT). |

### Sticky Action Bar
- The Previous / Submit & Next buttons live in a **sticky bar pinned to the bottom** of the viewport.
- It sits above any mobile browser chrome and has a subtle top-edge separator.
- On desktop: the bar is contained within the content column, not full-width.

### Progress Awareness
- **NavBar right side:** Shows "Meme 42 / 500" as a small counter — light, unobtrusive, always present.
- Serves as a reminder of progress without dominating the page.

### Keyboard Shortcuts (Desktop)
- **← Arrow:** Previous meme
- **→ Arrow:** Submit & Next (only if all questions answered)
- **1–5 keys:** Jump to question (focus that radio group)

---

## 5. Admin Dashboard — `/admin`

### Purpose
Give the single admin a quick overview of annotation progress and one-click data export. This is a utility page, not a daily-use workspace — clarity over decoration.

### Layout & Hierarchy

```
┌───────────────────────────────────────────────────────────┐
│  NavBar  [ Admin Dashboard ]               [ Logout ]     │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌── Stats Cards Row ───────────────────────────────────┐ │
│  │                                                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ Total    │  │ Total    │  │ Active   │            │ │
│  │  │ Users    │  │ Reviews  │  │ Annotators│           │ │
│  │  │   47     │  │  8,230   │  │   31     │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │                                                       │ │
│  │  ┌──────────┐                                         │ │
│  │  │Completion│                                         │ │
│  │  │   Rate   │                                         │ │
│  │  │  34.8%   │                                         │ │
│  │  └──────────┘                                         │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌── Export Section ────────────────────────────────────┐  │
│  │                                                      │  │
│  │  "Download Data"                                     │  │
│  │                                                      │  │
│  │  [ ↓ Download User Details CSV ]   secondary button  │  │
│  │  Caption: "All annotator profiles (excludes          │  │
│  │  password hashes)"                                   │  │
│  │                                                      │  │
│  │  [ ↓ Download Meme Reviews CSV ]   secondary button  │  │
│  │  Caption: "All survey responses with annotator       │  │
│  │  usernames"                                          │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Interaction Details

| Element | Behavior |
|---------|----------|
| **Stats cards** | Each card shows a label and a large number. Numbers load with a brief count-up animation (if motion allowed). Data refreshes on every page visit. |
| **Completion rate** | Calculated as `(total reviews) / (total users × 500) × 100`. Displayed as a percentage with one decimal. |
| **Download buttons** | Standard secondary buttons with a download icon prefix. On click: brief spinner → browser download dialog. No page navigation. |
| **Captions** | Small descriptive text below each download button explaining what the CSV contains. |

### Responsive
- Stats cards: 3 columns on desktop, 2 on tablet, 1 on mobile (stacked).
- Download section stacks naturally; buttons become full-width on mobile.

### Access Guard
- If a non-admin session somehow reaches this page, they see a "403 — Access Denied" message with a link back to `/gallery`.

---

## Cross-Cutting UX Principles Applied

| Principle | How It's Applied |
|-----------|-----------------|
| **Progressive disclosure** | Registration splits fields into two logical sections (Credentials → About You) to reduce perceived complexity. |
| **Spatial consistency** | Navigation bar is identical across all authenticated pages — same position, same logout button location. |
| **Forgiving inputs** | Slider snaps to integers; segmented pills prevent invalid choices; age stepper enforces range. |
| **Immediate feedback** | Username availability check, field-level validation errors, spinner on submit, toast on success. |
| **Resumability** | Gallery's "Continue" button always takes the user to exactly where they left off. Pre-filled answers let users edit without re-entering. |
| **Scannability** | Gallery grid uses icons (✓ / ○) over text for completed/pending status. Admin uses large numbers in cards. |
| **Keyboard-first** | Login auto-focuses first field. Meme review supports arrow-key navigation and shortcuts. All radio groups are keyboard-navigable. |
| **Error prevention** | Submit buttons are disabled until forms are valid. Destructive actions (none exist here) would require confirmation. |
| **Minimal memory load** | Meme counter ("42 / 500") is always visible. Progress bar on gallery. User never has to remember where they are. |
