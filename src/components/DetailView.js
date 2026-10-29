import { useEffect, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA, CITED_BY, ALIASES } from "../data/figures";
import { RINGS_CFG, OUTER_CFG, RING_NAMES } from "../data/rings";
import { CONNECTION_TYPES, connectionOf, fullName } from "../data/connections";
import { EVIDENCE, COMPARISONS } from "../data/evidence";
import { TX_SOFT, MUTED, BORD, WARN, RING_COLORS, OUTER_COLOR } from "../theme";
import { hrefFor } from "../router";
import Page from "./Page";
import { recordView } from "../hooks/useRecentlyViewed";

const ORIGIN = "https://ellalymancabot.org";
// The month of the last substantive revision, unless an entry records its own (`revised`).
const DEFAULT_REVISED = "October 2026";

const css = `
  .entry { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; }
  @media (min-width: 980px) { .entry { grid-template-columns: 180px minmax(0, 38em); } }
  .entry-toc-wide { display: none; }
  @media (min-width: 980px) { .entry-toc-wide { display: block; } .entry-toc-narrow { display: none; } }
  .entry-toc ol { list-style: none; margin: 0; padding: 0; }
  .entry-toc li { margin: 0 0 6px; }
  .entry-toc button { background: none; border: none; padding: 2px 0; font: inherit; font-size: 16px; color: var(--accent); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; text-align: left; }
  .entry-toc-wide nav { position: sticky; top: 16px; }
  .entry-body h2 { color: var(--accent); font-size: 24px; font-weight: 600; margin: 34px 0 10px; scroll-margin-top: 16px; }
  .entry-body h2:focus { outline: none; }
  .entry-body h3 { font-size: 19px; margin: 18px 0 6px; }
  .entry-body p, .entry-body li { font-size: 18px; line-height: 1.7; margin: 0 0 12px; }
  .entry-body .note { font-size: 15px; color: var(--text-soft); font-style: italic; }
  .entry-body .meta { font-size: 16px; color: var(--text-soft); }
  .entry-body blockquote { margin: 0 0 16px; padding-left: 16px; border-left: 3px solid var(--accent-border); }
  .entry-body .item { margin: 0 0 12px; }
  .entry-body .item strong { display: block; font-size: 18px; }
  .entry-body .item span { display: block; font-size: 16px; color: var(--text-soft); line-height: 1.5; }
`;

// Find the previous and next figure in the same ring.
function findSiblings(name) {
  const allRings = RINGS_CFG.map(function(r) { return r.nodes; }).concat([OUTER_CFG.nodes]);
  for (let r = 0; r < allRings.length; r++) {
    const ring = allRings[r];
    const idx = ring.indexOf(name);
    if (idx === -1) continue;
    const step = function(dir) {
      let i = idx;
      for (let k = 0; k < ring.length; k++) { i = (i + dir + ring.length) % ring.length; if (DATA[ring[i]]) return ring[i]; }
      return null;
    };
    return { prev: step(-1), next: step(1) };
  }
  return { prev: null, next: null };
}

function Item({ title, text, figKey }) {
  const head = figKey
    ? <a href={hrefFor({ name: "figure", figure: figKey })}>{fullName(figKey)}</a>
    : title;
  return <div className="item"><strong>{head}</strong>{text && <span>{text}</span>}</div>;
}

// "On this page": buttons rather than #fragment links, because the site's
// addresses live in the fragment. Each moves focus to its heading.
function Contents({ sections }) {
  function go(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "start" });
  }
  const list = (
    <ol>
      {sections.map(function(s) { return <li key={s.id}><button type="button" onClick={function() { go(s.id); }}>{s.label}</button></li>; })}
    </ol>
  );
  return (
    <>
      <div className="entry-toc entry-toc-wide"><nav aria-label="On this page"><p className="elc-eyebrow" style={{ marginBottom: "8px" }}>On this page</p>{list}</nav></div>
      <details className="entry-toc entry-toc-narrow"><summary style={{ cursor: "pointer", fontSize: "16px", padding: "4px 0" }}>On this page</summary><nav aria-label="On this page (collapsible)" style={{ padding: "6px 0 0" }}>{list}</nav></details>
    </>
  );
}

export default function DetailView({ name: requested, theme, onToggleTheme }) {
  // Entries that were split or renamed keep working at their old address.
  const name = ALIASES[requested] || requested;
  const fig = DATA[name];
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  useEffect(function() { if (DATA[name]) recordView(name); }, [name]);

  if (!fig) {
    return (
      <Page current="figure" theme={theme} onToggleTheme={onToggleTheme}>
        <h1 style={{ color: "var(--accent)" }}>Entry not found</h1>
        <p style={{ fontSize: "18px" }}>There is no entry for &ldquo;{requested}&rdquo;. <a href={hrefFor({ name: "figures" })}>See all figures, A to Z</a>.</p>
      </Page>
    );
  }

  const conn = connectionOf(name);
  const connType = CONNECTION_TYPES[conn.type];
  const evidence = EVIDENCE[name];
  const comparison = conn.type === "comparison" ? (COMPARISONS[name] || {}) : null;
  const hasPassages = Boolean(comparison && (comparison.cabot || comparison.other));
  const ringColor = fig.ring === 5 ? OUTER_COLOR : RING_COLORS[fig.ring - 1];
  const influences = fig.inf || [];
  const later = (fig.out || []).filter(function(item) { return item[0] !== "ELC"; });
  const mentions = CITED_BY[name] || [];
  const works = (fig.readings && fig.readings.length ? fig.readings : fig.works) || [];
  const archives = fig.archives || [];
  const siblings = findSiblings(name);
  const revised = fig.revised || DEFAULT_REVISED;
  const url = ORIGIN + "/" + hrefFor({ name: "figure", figure: name });

  // Sections in reading order; only those with content are shown or listed.
  const sections = [
    { id: "connection", label: "Connection" },
    (evidence || hasPassages) && { id: "evidence", label: evidence ? "Evidence" : "Comparison" },
    { id: "interpretation", label: "Interpretation" },
    works.length > 0 && { id: "works", label: fig.kind === "tradition" ? "Authors and texts" : "Works" },
    archives.length > 0 && { id: "sources", label: "Sources" },
    (influences.length || later.length || mentions.length) ? { id: "related", label: "Related" } : null,
    { id: "cite", label: "Cite this entry" },
  ].filter(Boolean);

  function copyLink() {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(function() { setCopied(true); setTimeout(function() { setCopied(false); }, 1600); });
  }

  return (
    <Page current="figure" theme={theme} onToggleTheme={onToggleTheme} width="1000px">
      <style>{css}</style>
      <p style={{ fontSize: "15px", margin: "0 0 6px" }}><a href={hrefFor({ name: "figures" })}>Figures A to Z</a></p>
      <h1 style={{ color: "var(--accent)", fontSize: isMobile ? "32px" : "40px", fontWeight: 600, margin: 0, lineHeight: 1.12 }}>{fullName(name)}</h1>
      <p style={{ color: TX_SOFT, fontSize: "18px", margin: "4px 0 6px" }}>{fig.dates.replace(/[–—]/g, "-")} · {fig.title}</p>
      <p style={{ color: TX_SOFT, fontSize: "15px", margin: "0 0 18px" }}>
        <span aria-hidden="true" style={{ display: "inline-block", width: "9px", height: "9px", borderRadius: "50%", background: ringColor, marginRight: "6px" }} />
        {RING_NAMES[fig.ring - 1]} · {connType.label}
        {!fig.confirmed && <> · <span style={{ color: WARN }}>some claims awaiting verification</span></>}
        <button type="button" className="elc-btn" style={{ fontSize: "13px", padding: "2px 8px", marginLeft: "10px" }} aria-live="polite" onClick={copyLink}>{copied ? "Link copied" : "Copy link"}</button>
      </p>

      <div className="entry">
        <Contents sections={sections} />
        <div className="entry-body">
          <h2 id="connection" style={{ marginTop: 0 }}>Connection to Cabot</h2>
          <p><strong>{connType.label}.</strong> {conn.basis}</p>
          {!fig.confirmed && fig.unconfirmedNote && <p className="note">Awaiting verification: {fig.unconfirmedNote}</p>}

          {evidence && <>
            <h2 id="evidence">Documentary evidence</h2>
            <ol style={{ paddingLeft: "1.3em" }}>
              {evidence.documented.map(function(c, i) {
                return (
                  <li key={i}>{c.text}
                    <span className="meta" style={{ display: "block", fontStyle: "italic" }}>
                      {c.source ? "Source: " + c.source : "Source: citation pending from the editor's archival notes."}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>}

          {!evidence && hasPassages && <>
            <h2 id="evidence">The comparison</h2>
            {comparison.cabot && <blockquote><p>{comparison.cabot.text}</p><p className="meta">Cabot, {comparison.cabot.source}</p></blockquote>}
            {comparison.other && <blockquote><p>{comparison.other.text}</p><p className="meta">{fullName(name)}, {comparison.other.source}</p></blockquote>}
          </>}

          <h2 id="interpretation">Interpretation</h2>
          {evidence
            ? <p>{evidence.interpretation}</p>
            : <p>{(comparison && comparison.interpretation) || fig.elc}</p>}
          {comparison && comparison.limit && <p><strong>A difference.</strong> {comparison.limit}</p>}
          {comparison && !hasPassages && <p className="note">This comparison is the editor's interpretation; the passages on which it rests are being prepared.</p>}
          {!evidence && !comparison && <p className="note">This account combines archival findings with the editor's interpretation; citations for individual claims are being added.</p>}
          <h3>{fig.kind === "tradition" ? "The tradition" : "Their position"}</h3>
          <p>{fig.desc}</p>

          {works.length > 0 && <>
            <h2 id="works">{fig.kind === "tradition" ? "Authors and texts" : "Works"}</h2>
            {works.map(function(w, i) { return <Item key={i} title={w[0]} text={w[1]} />; })}
          </>}

          {archives.length > 0 && <>
            <h2 id="sources">Sources</h2>
            {archives.map(function(a, i) { return <Item key={i} title={a[0]} text={a.length > 2 ? a[1] + ". " + a[2] : a[1]} />; })}
          </>}

          {(influences.length > 0 || later.length > 0 || mentions.length > 0) && <>
            <h2 id="related">Related</h2>
            {influences.length > 0 && <><h3>Influences on {fullName(name)}</h3>
              {influences.map(function(it, i) { return <Item key={i} title={it[0]} text={it[1]} figKey={DATA[it[0]] ? it[0] : null} />; })}</>}
            {later.length > 0 && <><h3>Later thought and reception</h3>
              {later.map(function(it, i) { return <Item key={i} title={it[0]} text={it[1]} figKey={DATA[it[0]] ? it[0] : null} />; })}</>}
            {mentions.length > 0 && <><h3>Mentioned in other entries</h3>
              <p className="note">Other entries on this site that refer to {fullName(name)}. These are cross-references, not historical citations.</p>
              {mentions.map(function(m, i) { return <Item key={i} text={m.note} figKey={m.from} />; })}</>}
          </>}

          <h2 id="cite">Cite this entry</h2>
          <p className="meta">Revised {revised}.</p>
          <p className="meta">Castleberry, Jacob B., ed. &ldquo;{fullName(name)}.&rdquo; <em>Ella Lyman Cabot: A Research Resource</em>. Revised {revised}. {url}</p>

          {(siblings.prev || siblings.next) && (
            <nav aria-label={"Other figures in " + RING_NAMES[fig.ring - 1]} style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "28px", paddingTop: "14px", borderTop: "1px solid " + BORD }}>
              <span>{siblings.prev && <><span style={{ display: "block", fontSize: "13px", color: MUTED }}>Previous in ring</span><a href={hrefFor({ name: "figure", figure: siblings.prev })}>{fullName(siblings.prev)}</a></>}</span>
              <span style={{ textAlign: "right" }}>{siblings.next && <><span style={{ display: "block", fontSize: "13px", color: MUTED }}>Next in ring</span><a href={hrefFor({ name: "figure", figure: siblings.next })}>{fullName(siblings.next)}</a></>}</span>
            </nav>
          )}
        </div>
      </div>
    </Page>
  );
}
