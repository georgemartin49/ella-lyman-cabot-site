import { useState, useEffect } from "react";
import Page from "./Page";
import { ACCENT, TX_SOFT, MUTED } from "../theme";
import { replaceQuery } from "../router";
import { DKEYS } from "../data/figures";
import { searchFigures } from "../data/search";
import FigureList from "./FigureList";
import ConnectionKey from "./ConnectionKey";

// Figures A to Z: search and names first, the guide to the labels after.
export default function FigureIndex({ theme, onToggleTheme, initialQuery }) {
  const [query, setQuery] = useState(function() { return (initialQuery && initialQuery.q) || ""; });
  useEffect(function() { replaceQuery("figures", { q: query.trim() }); }, [query]);
  const q = query.trim();
  const count = q ? searchFigures(q).length : DKEYS.length;

  return (
    <Page current="figures" theme={theme} onToggleTheme={onToggleTheme}>
      <h1 style={{ color: ACCENT, fontSize: "40px", fontWeight: 600, margin: "0 0 14px", lineHeight: 1.1 }}>Figures A to Z</h1>
      <form role="search" aria-label="Search figures" onSubmit={function(e) { e.preventDefault(); }} style={{ margin: "0 0 6px" }}>
        <label htmlFor="index-search" style={{ display: "block", color: MUTED, fontSize: "15px", marginBottom: "6px" }}>Search names and entry text</label>
        <input id="index-search" type="search" className="pw-search" value={query}
          onChange={function(e) { setQuery(e.target.value); }}
          style={{ width: "100%", boxSizing: "border-box", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "4px", padding: "10px 12px", fontSize: "17px", fontFamily: "inherit" }} />
      </form>
      <p role="status" aria-live="polite" style={{ color: TX_SOFT, fontSize: "15px", margin: "0 0 10px" }}>
        {q ? count + (count === 1 ? " figure matches, best matches first." : " figures match, best matches first.") : count + " figures, alphabetical by surname."}
      </p>
      <h2 id="index-list" className="elc-eyebrow" style={{ marginTop: "14px" }}>{q ? "Results" : "All figures"}</h2>
      <FigureList query={query} headingId="index-list" />
      <div style={{ marginTop: "36px" }}>
        <ConnectionKey />
      </div>
    </Page>
  );
}
