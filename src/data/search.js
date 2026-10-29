import { DATA, DKEYS } from "./figures";
import { fullName, sortName } from "./connections";

const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Rank every figure against a query: an exact name first, then a partial
// name, then a match in the entry's text (with a snippet showing where).
// Ties are broken alphabetically by surname.
export function searchFigures(query) {
  const q = norm(query.trim());
  if (!q) return [];
  const results = [];
  DKEYS.forEach(function(key) {
    const fig = DATA[key];
    const names = [key, fullName(key), sortName(key)].map(norm);
    let rank = 0;
    let snippet = null;
    if (names.some(function(n) { return n === q; })) rank = 3;
    else if (names.some(function(n) { return n.includes(q); })) rank = 2;
    else {
      const fields = [fig.title, fig.elc, fig.desc];
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i] || "";
        const at = norm(f).indexOf(q);
        if (at !== -1) { rank = 1; snippet = makeSnippet(f, at, q.length); break; }
      }
    }
    if (rank) results.push({ key: key, rank: rank, snippet: snippet });
  });
  return results.sort(function(a, b) {
    return b.rank - a.rank || sortName(a.key).localeCompare(sortName(b.key));
  });
}

function makeSnippet(text, at, len) {
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 60)));
  const end = Math.min(text.length, text.indexOf(" ", at + len + 60) === -1 ? text.length : text.indexOf(" ", at + len + 60));
  return {
    before: (start > 0 ? "…" : "") + text.slice(start, at).trimStart(),
    match: text.slice(at, at + len),
    after: text.slice(at + len, end) + (end < text.length ? "…" : ""),
  };
}
