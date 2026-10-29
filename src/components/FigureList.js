import { DATA, DKEYS } from "../data/figures";
import { RING_NAMES } from "../data/rings";
import { CONNECTION_TYPES, connectionOf, fullName, sortName } from "../data/connections";
import { TX, TX_SOFT, MUTED, BORD, RING_COLORS, OUTER_COLOR } from "../theme";
import { hrefFor } from "../router";

// The same matching rule as the map: name, full name, title, or entry text.
export function matchesQuery(key, q) {
  if (!q) return true;
  const fig = DATA[key];
  return [key, fullName(key), fig.title, fig.desc, fig.elc]
    .some(function(s) { return s && s.toLowerCase().includes(q); });
}

export const sortedKeys = DKEYS.slice().sort(function(a, b) {
  return sortName(a).localeCompare(sortName(b)) || fullName(a).localeCompare(fullName(b));
});

// An alphabetical list of figures with direct links to their entries.
export default function FigureList({ query, headingId }) {
  const q = (query || "").trim().toLowerCase();
  const keys = sortedKeys.filter(function(k) { return matchesQuery(k, q); });

  if (keys.length === 0) {
    return <p style={{ color: TX_SOFT, fontStyle: "italic" }}>No figures match &ldquo;{query}&rdquo;.</p>;
  }
  return (
    <ul aria-labelledby={headingId} style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {keys.map(function(key) {
        const fig = DATA[key];
        const ringIdx = fig.ring - 1;
        const color = fig.ring === 5 ? OUTER_COLOR : RING_COLORS[ringIdx];
        const conn = CONNECTION_TYPES[connectionOf(key).type];
        return (
          <li key={key} style={{ borderBottom: "1px solid " + BORD }}>
            <a href={hrefFor({ name: "figure", figure: key })} className="elc-figure-link" style={{ margin: 0, padding: "10px 8px" }}>
              <span style={{ display: "block", color: TX, fontSize: "18px", fontWeight: 600 }}>
                {fullName(key)} <span style={{ color: MUTED, fontWeight: 400, fontSize: "15px" }}>({fig.dates.replace(/[–—]/g, "-")})</span>
              </span>
              <span style={{ display: "block", color: TX_SOFT, fontSize: "15px", lineHeight: 1.5 }}>
                <span aria-hidden="true" style={{ display: "inline-block", width: "9px", height: "9px", borderRadius: "50%", background: color, marginRight: "6px" }} />
                {RING_NAMES[ringIdx]} · {conn.label}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
