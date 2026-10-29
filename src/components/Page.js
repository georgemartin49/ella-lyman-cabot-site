import { useState, useEffect, useRef } from "react";
import { BG, TX } from "../theme";
import { hrefFor } from "../router";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";

// The site's sections, in header order. `match` lists route names that count
// as being inside the section (a figure page belongs to Figures A to Z).
const SECTIONS = [
  { route: "life", label: "Life" },
  { route: "writings", label: "Writings", match: ["everyday-ethics"] },
  { route: "edition", label: "Edition" },
  { route: "figures", label: "Figures A to Z", match: ["figure"] },
  { route: "web", label: "Map" },
  { route: "timeline", label: "Timeline" },
];

const css = `
  .site-header { border-bottom: 1px solid var(--border); background: var(--surface); }
  .site-header-inner { max-width: 1100px; margin: 0 auto; padding: 10px 20px; display: flex; align-items: center; gap: 16px; }
  .site-home { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; color: var(--accent); text-decoration: none; white-space: nowrap; margin-right: auto; }
  .site-nav ul { list-style: none; display: flex; flex-wrap: wrap; gap: 2px 4px; margin: 0; padding: 0; }
  .site-nav a { display: block; padding: 6px 10px; border-radius: 4px; color: var(--text); text-decoration: none; font-size: 16px; }
  .site-nav a:hover { background: var(--accent-faint); }
  .site-nav a[aria-current="page"] { color: var(--accent); font-weight: 600; box-shadow: inset 0 -2px 0 var(--accent); border-radius: 0; }
  .site-menu-btn { display: none; }
  .site-toggle-narrow { display: none; }
  @media (max-width: 860px) {
    .site-header-inner { flex-wrap: wrap; }
    .site-menu-btn { display: inline-flex; }
    .site-toggle-wide { display: none; }
    .site-toggle-narrow { display: block; padding: 10px 0 4px; }
    .site-nav { display: none; width: 100%; }
    .site-nav.open { display: block; }
    .site-nav ul { flex-direction: column; }
    .site-nav a { padding: 10px 8px; border-bottom: 1px solid var(--border); }
    .site-nav a[aria-current="page"] { box-shadow: inset 3px 0 0 var(--accent); padding-left: 12px; }
  }
`;

function SiteHeader({ current, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  useEffect(function() {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") { setOpen(false); if (btn.current) btn.current.focus(); } }
    document.addEventListener("keydown", onKey);
    return function() { document.removeEventListener("keydown", onKey); };
  }, [open]);
  const isCurrent = function(s) { return s.route === current || (s.match || []).indexOf(current) !== -1; };
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="site-home" href={hrefFor({ name: "landing" })} aria-current={current === "landing" ? "page" : undefined}>Ella Lyman Cabot</a>
        <button ref={btn} type="button" className="elc-btn site-menu-btn" aria-expanded={open} aria-controls="site-nav" onClick={function() { setOpen(function(o) { return !o; }); }}>
          {open ? "Close menu" : "Menu"}
        </button>
        <span className="site-toggle-wide"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></span>
        <nav id="site-nav" className={"site-nav" + (open ? " open" : "")} aria-label="Site">
          <ul>
            {SECTIONS.map(function(s) {
              return <li key={s.route}><a href={hrefFor({ name: s.route })} aria-current={isCurrent(s) ? "page" : undefined}>{s.label}</a></li>;
            })}
          </ul>
          <div className="site-toggle-narrow"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
        </nav>
      </div>
    </header>
  );
}

// Every page: skip link, shared header, a main landmark, and the footer.
export default function Page({ current, theme, onToggleTheme, width, children }) {
  const w = width || "720px";
  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX, display: "flex", flexDirection: "column" }}>
      <style>{css}</style>
      <a href="#main" className="elc-skip" onClick={function(e) { e.preventDefault(); const m = document.getElementById("main"); if (m) { m.focus(); m.scrollIntoView(); } }}>Skip to content</a>
      <SiteHeader current={current} theme={theme} onToggleTheme={onToggleTheme} />
      <main id="main" tabIndex={-1} style={{ width: "100%", maxWidth: w, margin: "0 auto", padding: "28px 20px 56px", boxSizing: "border-box", flex: "1 0 auto" }}>
        {children}
      </main>
      <Footer inset={w} />
    </div>
  );
}
