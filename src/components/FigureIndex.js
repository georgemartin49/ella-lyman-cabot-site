import { useState, useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { BG, ACCENT, TX, TX_SOFT, MUTED } from "../theme";
import { hrefFor, replaceQuery } from "../router";
import { DKEYS } from "../data/figures";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
import FigureList, { matchesQuery } from "./FigureList";
import ConnectionKey from "./ConnectionKey";

const COL = "720px";

// A to Z index of every figure, searchable, with the search kept in the address.
export default function FigureIndex({ theme, onToggleTheme, initialQuery }) {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState(function() { return (initialQuery && initialQuery.q) || ""; });
  useEffect(function() { replaceQuery("figures", { q: query.trim() }); }, [query]);
  const q = query.trim().toLowerCase();
  const count = DKEYS.filter(function(k) { return matchesQuery(k, q); }).length;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <a href="#index-main" className="elc-skip">Skip to content</a>
      <div style={{ maxWidth: COL, margin: "0 auto", padding: isMobile ? "16px 16px 0" : "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <a href={hrefFor({ name: "landing" })} className="elc-btn">Home</a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <main id="index-main" tabIndex={-1} style={{ maxWidth: COL, margin: "0 auto", padding: isMobile ? "24px 16px 48px" : "32px 24px 64px", boxSizing: "border-box" }}>
        <h1 style={{ color: ACCENT, fontSize: isMobile ? "34px" : "44px", fontWeight: 600, margin: "0 0 8px", lineHeight: 1.1 }}>Figures A to Z</h1>
        <p style={{ color: TX_SOFT, fontSize: "18px", lineHeight: 1.6, margin: "0 0 18px" }}>
          Every figure in the <a href={hrefFor({ name: "web" })}>Philosophical Web</a>, with the ring the editor places them in and their historical connection to Cabot.
        </p>
        <ConnectionKey />
        <form role="search" aria-label="Search figures" onSubmit={function(e) { e.preventDefault(); }} style={{ margin: "20px 0 8px" }}>
          <label htmlFor="index-search" style={{ display: "block", color: MUTED, fontSize: "14px", marginBottom: "6px" }}>Search names and entry text</label>
          <input id="index-search" type="search" className="pw-search" value={query}
            onChange={function(e) { setQuery(e.target.value); }}
            style={{ width: "100%", boxSizing: "border-box", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "4px", padding: "9px 12px", fontSize: "16px", fontFamily: "inherit" }} />
        </form>
        <p role="status" aria-live="polite" style={{ color: MUTED, fontSize: "14px", fontStyle: "italic", margin: "0 0 10px" }}>
          {q ? count + (count === 1 ? " figure matches" : " figures match") : count + " figures"}
        </p>
        <h2 id="index-list" className="elc-eyebrow">Figures</h2>
        <FigureList query={query} headingId="index-list" />
      </main>
      <Footer inset={COL} />
    </div>
  );
}
