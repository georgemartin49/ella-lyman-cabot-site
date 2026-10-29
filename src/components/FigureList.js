import { DATA, DKEYS } from "../data/figures";
import { RING_NAMES } from "../data/rings";
import { CONNECTION_TYPES, connectionOf, fullName, sortName } from "../data/connections";
import { searchFigures } from "../data/search";
import { TX, TX_SOFT, BORD, RING_COLORS, OUTER_COLOR } from "../theme";
import { hrefFor } from "../router";

// The same matching rule as the map highlights: any name or entry text.
export function matchesQuery(key, q) {
  if (!q) return true;
  return searchFigures(q).some(function(r) { return r.key === key; });
}

export const sortedKeys = DKEYS.slice().sort(function(a, b) {
  return sortName(a).localeCompare(sortName(b)) || fullName(a).localeCompare(fullName(b));
});

function Row({ k, snippet }) {
  const fig = DATA[k];
  const color = fig.ring === 5 ? OUTER_COLOR : RING_COLORS[fig.ring - 1];
  const conn = CONNECTION_TYPES[connectionOf(k).type];
  return (
    <li style={{ borderBottom: "1px solid " + BORD }}>
      <a href={hrefFor({ name: "figure", figure: k })} className="elc-figure-link" style={{ margin: 0, padding: "10px 8px" }}>
        <span style={{ display: "block", color: TX, fontSize: "18px", fontWeight: 600 }}>
          {fullName(k)} <span style={{ color: TX_SOFT, fontWeight: 400, fontSize: "15px" }}>({fig.dates.replace(/[–—]/g, "-")})</span>
        </span>
        <span style={{ display: "block", color: TX_SOFT, fontSize: "15px", lineHeight: 1.5 }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: "9px", height: "9px", borderRadius: "50%", background: color, marginRight: "6px" }} />
          {conn.label} · {RING_NAMES[fig.ring - 1]}
        </span>
        {snippet && (
          <span style={{ display: "block", color: TX, fontSize: "15px", lineHeight: 1.5, marginTop: "2px" }}>
            {snippet.before}<mark style={{ background: "var(--accent-faint-strong)", color: "inherit" }}>{snippet.match}</mark>{snippet.after}
          </span>
        )}
      </a>
    </li>
  );
}

// With a query: figures ranked by relevance, with snippets for text matches.
// Without one: every figure in alphabetical order. `filter(key)` can narrow either.
export default function FigureList({ query, headingId, filter }) {
  const q = (query || "").trim();
  const keep = filter || function() { return true; };
  const rows = q
    ? searchFigures(q).filter(function(r) { return keep(r.key); })
    : sortedKeys.filter(keep).map(function(k) { return { key: k, snippet: null }; });

  if (rows.length === 0) {
    return <p style={{ color: TX_SOFT, fontStyle: "italic" }}>No figures match{q ? <> &ldquo;{q}&rdquo;</> : null}. Try a surname, or clear the filters.</p>;
  }
  return (
    <ul aria-labelledby={headingId} style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rows.map(function(r) { return <Row key={r.key} k={r.key} snippet={r.snippet} />; })}
    </ul>
  );
}
