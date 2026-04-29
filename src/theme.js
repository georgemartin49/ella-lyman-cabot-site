// Color tokens are CSS variables defined in src/index.css under :root and
// [data-theme="dark"]. Components reference them via these constants so a
// theme swap (light/dark) only updates the variable values.

export const BG = "var(--bg)";
export const BG_DEEP = "var(--bg-deep)";
export const SURF = "var(--surface)";
export const BORD = "var(--border)";
export const RULE = "var(--rule)";
export const TX = "var(--text)";
export const TX_SOFT = "var(--text-soft)";
export const MUTED = "var(--text-muted)";
export const ACCENT = "var(--accent)";
export const ACCENT_SOFT = "var(--accent-soft)";
export const ACCENT_FAINT = "var(--accent-faint)";
export const ACCENT_FAINT_STRONG = "var(--accent-faint-strong)";
export const WARN = "var(--warn)";
export const WARN_BG = "var(--warn-bg)";
export const WARN_BORDER = "var(--warn-border)";
export const GOLD = "var(--gold)";
export const GOLD_TEXT = "var(--gold-text)";
export const INF = "var(--text-soft)";

// Ring colors are deliberately palette-independent — they encode ring
// identity, not chrome, and they read well over both backgrounds.
export const RING_COLORS = ["#7C9EC9", "#5CB89E", "#8A8FAA", "#B87070"];
export const OUTER_COLOR = "#9E8EC8";
