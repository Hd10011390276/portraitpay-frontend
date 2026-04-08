# PortraitPay AI — DESIGN.md

> Design system for PortraitPay AI portrait rights management platform.
> AI agents should read this file to generate consistent UI that matches PortraitPay's visual identity.

---

## 1. Visual Theme & Atmosphere

**Product Identity:** Modern AI SaaS platform for portrait rights management and blockchain certification.

**Aesthetic Direction:** Clean, professional, trust-inspiring. Inspired by Apple-style minimalism meets fintech clarity. Light mode is the primary experience; dark mode is fully supported via `data-theme="dark"` / `class="dark"` on `<html>`.

**Mood & Density:**
- Light mode: Airy, bright, generous whitespace — white backgrounds with subtle gray sections
- Dark mode: Deep blacks (`#000000` / `#111113`) with soft elevated surfaces — never flat
- Density: Medium — cards have comfortable padding, sections breathe with 80-100px vertical spacing
- Overall feel: Authoritative, safe, premium but accessible

**Design Philosophy:**
- "Clarity over cleverness" — every element has a clear purpose
- Dark mode is not an afterthought — surfaces use distinct elevation levels (not just color inversion)
- Animations are subtle and purposeful (fade, slide-up) — never distracting

---

## 2. Color Palette & Roles

### Primary Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `blue-600` | `#2563eb` | Primary CTAs, links, active states |
| `blue-700` | `#1d4ed8` | Primary hover state |
| `blue-100` | `#dbeafe` | Light backgrounds, badges, tints |
| `blue-900/40` | `rgba(30, 58, 138, 0.4)` | Dark badge backgrounds |
| `violet-600` | `#7c3aed` | Accent, Pro tier, gradient partner |
| `violet-950/40` | `rgba(46, 16, 101, 0.4)` | Dark mode accent backgrounds |

### Neutral Palette

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Background Primary | `#ffffff` | `#000000` |
| Background Secondary | `#f8f8fa` | `#111113` |
| Card Surface | `#ffffff` | `#1c1c1e` |
| Text Primary | `#1d1d1f` | `#f5f5f7` |
| Text Secondary | `#6e6e73` | `#a1a1a6` |
| Border | `#e5e5e5` | `#2d2d2d` |

### Semantic Colors

| Usage | Light | Dark |
|-------|-------|------|
| Success | `#22c55e` (green-500) | same |
| Error / Danger | `#ef4444` (red-500) | same |
| Warning | `#f59e0b` (amber-500) | same |
| Info | `#3b82f6` (blue-500) | same |

### Gradient Usage

```css
/* Hero background */
background: linear-gradient(to bottom right, blue-50, white, purple-50)
/* Dark: gray-950, gray-950, purple-950/20 */

/* CTA Banner */
background: linear-gradient(to right, blue-600, violet-600)

/* Avatar stack gradient */
background: linear-gradient(to bottom right, blue-400, purple-500)

/* Card glow on hover */
box-shadow: 0 0 20px rgba(37, 99, 235, 0.3)  /* blue glow */
```

---

## 3. Typography Rules

**Font Stack:**
```css
font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
font-family: var(--font-geist-mono), ui-monospace, monospace;
```

**Source:** `next/font/google` with `Inter` as the primary font.

**Type Scale:**

| Element | Size | Weight | Line Height | Tracking |
|---------|------|--------|-------------|----------|
| Hero H1 | `3.75rem`–`4.5rem` (60–72px) | 700 bold | tight (~1.1) | `-0.02em` |
| Section H2 | `1.875rem`–`2.25rem` (30–36px) | 700 bold | tight | `-0.02em` |
| Card Title | `1.25rem` (20px) | 600 semibold | tight | default |
| Body Large | `1.125rem`–`1.25rem` (18–20px) | 400 | relaxed (~1.7) | default |
| Body | `0.875rem`–`1rem` (14–16px) | 400 | relaxed | default |
| Small / Caption | `0.75rem` (12px) | 400 / 500 | default | default |
| Badge | `0.875rem` (14px) | 500 medium | default | default |

**Font Features:**
```css
font-feature-settings: "cv11", "ss01";  /* Stylistic alternates for Inter */
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## 4. Component Stylings

### Buttons

**Primary CTA Button:**
```jsx
// Classes
inline-flex items-center justify-center px-8 py-3.5
text-base font-semibold text-white
bg-blue-600 rounded-xl
hover:bg-blue-700 transition-all
shadow-lg shadow-blue-600/25
hover:shadow-blue-600/40 hover:-translate-y-0.5
```

**Secondary Button:**
```jsx
// Classes
inline-flex items-center justify-center px-8 py-3.5
text-base font-semibold text-gray-700 dark:text-gray-300
bg-white dark:bg-gray-800 rounded-xl
hover:bg-gray-50 dark:hover:bg-gray-700 transition-all
border border-gray-200 dark:border-gray-700
hover:-translate-y-0.5
```

**Ghost Button:**
```jsx
// Classes
inline-flex items-center px-4 py-2
text-sm font-medium text-gray-700 dark:text-gray-300
hover:text-gray-900 dark:hover:text-white transition-colors
```

### Cards

**Standard Card:**
```css
/* Light */
background: #ffffff;
border: 1px solid #e5e5e5;
border-radius: 0.75rem;  /* xl */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Dark */
background: #1c1c1e;
border: 1px solid #2d2d2d;
```

**Card Hover State:**
```css
hover:shadow-md;
hover:border-blue-200;       /* light mode */
dark:hover:border-blue-700;  /* dark mode */
```

**Feature Card (gradient background):**
```jsx
// Classes
bg-gradient-to-br [color-from] to [color-to]
rounded-2xl p-6 border [border-color]
hover:shadow-lg transition-shadow
```

### Navigation Bar

```jsx
// Header (sticky, glass)
fixed inset-x-0 top-0 z-50
bg-white/80 dark:bg-gray-950/80
backdrop-blur-md
border-b border-gray-100 dark:border-gray-800
h-16

// Nav links
text-sm text-gray-600 dark:text-gray-400
hover:text-gray-900 dark:hover:text-white transition-colors
gap-8 between items
```

### Form Inputs

```css
/* See globals.css card class for input containers */
border border-gray-200 dark:border-gray-700
rounded-xl px-4 py-3
focus-visible: ring-2 ring-blue-500 ring-offset-2
```

### Badges / Pills

```jsx
// Status badge
inline-flex items-center gap-2
px-4 py-1.5 rounded-full
text-sm font-medium
bg-blue-100 dark:bg-blue-900/40
text-blue-700 dark:text-blue-300

// Pro badge
inline-block px-3 py-1
text-xs font-semibold
bg-purple-600 text-white rounded-full
```

### Avatar Stack

```jsx
// Light: gradient from blue-400 to purple-500
// Circle, border-2 border-white dark:border-gray-950
// w-8 h-8, rounded-full, text-xs font-bold
```

### Mac Window Chrome (Hero Visual)

```jsx
// Window header bar
flex items-center gap-1.5 px-4 py-3
border-b border-gray-100 dark:border-gray-800

// Traffic lights
w-3 h-3 rounded-full (red, yellow, green in 400 variants)

// Window title in center
text-xs text-gray-400
```

---

## 5. Layout Principles

### Spacing Scale

Uses Tailwind's default scale. Key tokens:
- `px-4` / `sm:px-6` / `lg:px-8` — page gutters
- `py-24` — section vertical padding (96px)
- `gap-8` — card grid gap (32px)
- `space-y-8` — vertical stack spacing (32px)

### Container

```jsx
max-w-7xl mx-auto   // Full-width content container (1280px max)
max-w-3xl mx-auto   // Narrow centered content (768px)
max-w-4xl mx-auto   // Medium (896px)
```

### Grid

- Feature cards: `grid md:grid-cols-2 lg:grid-cols-3 gap-8`
- Hero stats: `grid grid-cols-2 md:grid-cols-4 gap-4`
- Pricing: `grid md:grid-cols-2 gap-8 max-w-3xl mx-auto`

### Section Pattern

Every major section follows:
1. Heading block: `text-center max-w-2xl mx-auto mb-16`
2. Content block with max-width container
3. `py-24 px-4` for vertical breathing room

---

## 6. Depth & Elevation

### Shadow System

| Name | Value | Usage |
|------|-------|-------|
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` | Subtle, inputs |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Cards default |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Feature cards, nav |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Hero visual |
| `shadow-glow` | `0 0 20px rgb(37 99 235 / 0.3)` | Primary button glow |

### Backdrop Blur

```css
backdrop-blur-md   /* Standard glass navbar */
backdrop-blur-xs   /* 2px — subtle overlays */
```

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Small badges, tags |
| `rounded` / `rounded-md` | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Medium cards |
| `rounded-xl` | 16px | Standard cards |
| `rounded-2xl` | 24px | Large cards, pricing |
| `rounded-full` | full | Avatars, pills |

### Dark Mode Elevation

Dark mode does NOT simply invert colors. Surfaces use distinct elevation:
- Base: `#000000` or `#111113`
- Card: `#1c1c1e` (slightly lighter)
- Elevated: `#1c1c1e` with colored border on hover
- Glass navbar: `bg-gray-950/80` with `backdrop-blur-md`

---

## 7. Do's and Don'ts

### ✅ DO

- Use the glass navbar (`bg-white/80 dark:bg-gray-950/80 backdrop-blur-md`) for sticky headers
- Always pair `blue-600` CTAs with a subtle `shadow-blue-600/25` glow
- Include the traffic-light window chrome in any dashboard mockup
- Use `tracking-tight` for all headings (H1–H4)
- Dark mode: use `#1c1c1e` for cards, not pure `#000000`
- Use gradient hero backgrounds: `from-blue-50 via-white to-purple-50` (light) / equivalent dark variants
- Include avatar stack with gradient circles for social proof sections

### ❌ DON'T

- Don't use flat black (`#000000`) for card surfaces in dark mode — use `#1c1c1e`
- Don't mix `blue-600` and `violet-600` arbitrarily — blue is primary, violet is accent/pro only
- Don't use `backdrop-blur-sm` (too subtle) or `backdrop-blur-xl` (too heavy) — `md` is the sweet spot
- Don't use more than 3 shadow levels on a single page (shadow-sm → shadow-lg max)
- Don't use harsh transitions (`transition-all` with 300ms+) on text or small elements — stick to `transition-colors`
- Don't use emoji as the sole icon in dashboard UI — use SVG icons (Heroicons style, stroke-width 1.5)

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Key Responsive Patterns

```jsx
// Navbar: hide desktop nav on mobile, show hamburger
hidden md:flex items-center gap-8  // desktop nav

// Grid: 2 cols mobile → 4 cols desktop for hero stats
grid grid-cols-2 md:grid-cols-4 gap-4

// Feature grid: 1 col mobile → 2 cols tablet → 3 cols desktop
grid md:grid-cols-2 lg:grid-cols-3 gap-8

// Hero text: scale down on mobile
text-5xl sm:text-6xl lg:text-7xl

// Buttons: full width on mobile, auto on desktop
w-full sm:w-auto inline-flex items-center justify-center
```

### Touch Targets

- Minimum touch target: `44×44px` (iOS guideline)
- Nav links: `px-4 py-2` minimum
- CTA buttons: `px-8 py-3.5` minimum

---

## 9. Agent Prompt Guide

### Quick Color Reference

```
Primary Blue:    #2563eb  (blue-600)   — CTAs, links, active states
Primary Hover:   #1d4ed8  (blue-700)
Light Tint:      #dbeafe  (blue-100)   — badges, backgrounds
Accent Violet:  #7c3aed  (violet-600) — Pro tier, gradients
Dark Card:       #1c1c1e                 — Dark mode card surface
Dark BG:        #000000 / #111113       — Dark mode background
```

### Ready-to-Use Prompt Templates

**"Build a new dashboard page for [feature]"**
```
Create a new page at /dashboard/[feature] matching PortraitPay's design system.
- Use the Header component from @/components/layout/Header
- Card style: bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700
- Primary button: bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm
- Use Inter font, tracking-tight for headings
- Follow the grid pattern: grid grid-cols-2 md:grid-cols-4 gap-4
- Include glass navbar styling for sticky header
```

**"Add a settings form with dark mode support"**
```
Build a settings form for PortraitPay:
- Use CSS variables from globals.css for colors (--bg-primary, --text-primary, --accent)
- Input fields: border border-gray-200 dark:border-gray-700 rounded-xl
- Focus state: ring-2 ring-blue-500 ring-offset-2
- Save button: bg-blue-600 text-white rounded-xl px-6 py-3
- Dark mode via data-theme="dark" on html element
```

**"Create a pricing card component"**
```
Create a pricing card matching PortraitPay:
- White/dark card: bg-white dark:bg-gray-900 rounded-2xl border-2
- Pro card: bg-gradient-to-b from-purple-50 to-white (light) / from-purple-950/40 to-gray-900 (dark)
- Border: border-purple-500 for Pro tier
- Badge: inline-block px-3 py-1 text-xs font-semibold bg-purple-600 text-white rounded-full
- Checkmark icons: svg w-4 h-4 text-green-500 or text-purple-500
- CTA: full-width rounded-xl bg-blue-600 or bg-purple-600
```

**"Build an FAQ accordion"**
```
FAQ accordion for PortraitPay:
- Container: bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700
- Summary: flex items-center justify-between px-6 py-4 cursor-pointer font-medium
- Details open: rotate-180 on chevron svg, transition-transform
- Content: px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm
- Divider: border-t border-gray-100 dark:border-gray-800 pt-3
```

**"Design a data table for the dashboard"**
```
Data table for PortraitPay dashboard:
- Container: bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden
- Header row: bg-gray-50 dark:bg-gray-800/50 px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
- Data rows: px-6 py-4 border-t border-gray-100 dark:border-gray-800
- Hover: hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
- Use blue-600 for link text, not underline
```

### Dark Mode Implementation Pattern

```tsx
// Always use BOTH class and data-theme for dark mode support
<html lang="zh-CN" className="dark">  // class for Tailwind
  <html data-theme="dark">            // data-theme for CSS variables

// In component:
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <button className="bg-blue-600 hover:bg-blue-700">CTA</button>
</div>
```

### Animation Defaults

```css
/* Fade in page content */
animation: fade-in 0.2s ease-out forwards;

/* Slide up (entrance) */
animation: slide-up 0.2s ease-out forwards;

/* Shimmer (loading skeleton) */
background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;

/* Button hover lift */
hover:-translate-y-0.5 transition-all
```

---

*Last updated: 2026-04-08 — PortraitPay v1.0*
*Format: Google Stitch DESIGN.md spec v1.0*
