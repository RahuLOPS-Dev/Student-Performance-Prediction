/**
 * Design System Tokens — Student Performance Prediction System
 * ------------------------------------------------------------
 * A single source of truth for all visual decisions.
 * Colors, spacing, typography, radius, shadows, motion, z-index.
 * Mirrors the CSS custom properties in globals.css so Tailwind + raw CSS agree.
 */

export const tokens = {
  // ── Color Roles ──────────────────────────────────────────────
  // Semantic, not decorative. Every color has a job.
  color: {
    // Brand — emerald (academic, trustworthy)
    primary: "oklch(0.45 0.11 162)",       // actions, active states, links
    primaryHover: "oklch(0.50 0.12 162)",   // 10% lighter
    primarySubtle: "oklch(0.93 0.04 165)",  // tints, soft backgrounds
    // Surface
    background: "oklch(0.99 0.004 160)",
    card: "oklch(1 0 0)",
    cardGlass: "rgba(255,255,255,0.7)",     // glassmorphism
    muted: "oklch(0.96 0.008 165)",
    // Text
    foreground: "oklch(0.18 0.02 165)",     // primary text
    mutedForeground: "oklch(0.5 0.02 165)",// secondary text
    // Feedback
    success: "oklch(0.55 0.13 162)",
    warning: "oklch(0.75 0.16 70)",
    danger: "oklch(0.58 0.20 20)",
    info: "oklch(0.6 0.11 230)",
    // Chart palette (distinct, colorblind-friendly-ish)
    chart: [
      "oklch(0.55 0.13 162)", // 1 emerald
      "oklch(0.62 0.14 50)",  // 2 amber
      "oklch(0.6 0.11 230)",  // 3 blue
      "oklch(0.75 0.16 70)",  // 4 gold
      "oklch(0.58 0.2 20)",   // 5 red
    ],
  },

  // ── Typography ───────────────────────────────────────────────
  type: {
    fontSans: "var(--font-geist-sans), system-ui, sans-serif",
    fontMono: "var(--font-geist-mono), monospace",
    // Scale — 1.25 ratio, modular
    h1: { size: "3.5rem", weight: 800, leading: 1.05, tracking: "-0.03em" },
    h2: { size: "2rem",    weight: 700, leading: 1.15, tracking: "-0.02em" },
    h3: { size: "1.25rem", weight: 600, leading: 1.3,  tracking: "-0.01em" },
    body: { size: "1rem",    weight: 400, leading: 1.6,  tracking: "0" },
    small: { size: "0.875rem", weight: 400, leading: 1.5, tracking: "0" },
    xs: { size: "0.75rem", weight: 500, leading: 1.4, tracking: "0.02em" },
    // Uppercase eyebrow label
    eyebrow: { size: "0.75rem", weight: 600, leading: 1, tracking: "0.08em", transform: "uppercase" },
  },

  // ── Spacing — 4px base ──────────────────────────────────────
  space: {
    px: "4px",   // 1
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
  },

  // ── Layout ──────────────────────────────────────────────────
  layout: {
    maxWidth: "72rem",      // 1152px — content never wider than this
    maxWidthProse: "42rem",  // 672px — readable text blocks
    navHeight: "3.5rem",     // 56px
    sectionPaddingY: "5rem",// 80px — generous section rhythm
    pagePaddingX: "1rem",   // 16px — mobile-first gutters
    cardPadding: "1.5rem",   // 24px
    gridGap: "1.5rem",       // 24px — standard grid gap
  },

  // ── Radius ──────────────────────────────────────────────────
  radius: {
    sm: "0.375rem",  // 6px — small chips
    md: "0.5rem",    // 8px — inputs, buttons
    lg: "0.75rem",   // 12px — cards
    xl: "1rem",      // 16px — large cards
    full: "9999px",  // pills
  },

  // ── Shadows — layered, not flat ────────────────────────────
  shadow: {
    sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)",
    glow: "0 0 20px -5px rgba(0,0,0,0.15)",
    primaryGlow: "0 8px 30px -5px oklch(0.45 0.11 162 / 0.25)",
  },

  // ── Motion ─────────────────────────────────────────────────
  motion: {
    durationFast: "150ms",
    durationBase: "200ms",
    durationSlow: "400ms",
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",  // smooth deceleration
    easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // gentle overshoot
  },

  // ── Z-index scale ──────────────────────────────────────────
  z: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    toast: 1070,
    tooltip: 1080,
  },
} as const;

// ── Design Principles ─────────────────────────────────────────
export const principles = {
  // 1. Clarity over cleverness — every element should communicate its purpose
  clarity: "If a user has to guess what something does, it's wrong.",

  // 2. Consistent rhythm — spacing follows the 4px grid everywhere
  rhythm: "Spacing is never arbitrary. It's 4px, 8px, 12px, 16px, 24px, 32px, 48px, 80px.",

  // 3. Interactive elements must look interactive
  interactive: "Clickable = pointer cursor + hover state + focus ring. Static = neither.",

  // 4. Restraint with decoration — gradients/glass for depth, not show
  restraint: "Use mesh gradients and glassmorphism sparingly — only for hero/featured areas, not every card.",

  // 5. Loading > empty > error — always communicate state
  states: "Never leave the user staring at a blank space. Show skeletons, empty states, or error messages.",

  // 6. Accessibility is not optional
  a11y: "WCAG AA contrast, keyboard navigable, screen-reader friendly, reduced-motion respected.",

  // 7. Responsive by default
  responsive: "Design mobile-first. Every layout works at 390px before it works at 1440px.",
} as const;
