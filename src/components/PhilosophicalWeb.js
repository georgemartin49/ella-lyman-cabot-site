import { useState, useMemo, useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA, DKEYS } from "../data/figures";
import { RINGS_CFG, OUTER_CFG, CX, CY } from "../data/rings";
import {
  BG, SURF, BORD, ACCENT,
  TX, TX_SOFT, MUTED, WARN, WARN_BG, WARN_BORDER, GOLD, GOLD_TEXT,
  RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor, navigate, replaceQuery } from "../router";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";

const pwStyles = `
  .pw-node { transition: transform 200ms ease, opacity 200ms ease; }
  .pw-node .pw-dot { transition: r 200ms ease, opacity 200ms ease, fill 200ms ease; }
  .pw-node .pw-ring { transition: r 200ms ease, stroke-opacity 200ms ease, stroke-width 200ms ease; }
  .pw-node text { transition: fill 200ms ease; }
  .pw-node-active:hover { transform: translateZ(0); }
  .pw-node-active:focus-visible { outline: none; }
  .pw-node-active:focus-visible .pw-dot {
    stroke: var(--accent); stroke-width: 1.5; stroke-opacity: 0.9;
  }
  .pw-edge { transition: stroke-opacity 200ms ease, stroke-width 200ms ease; }

  .pw-search {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 9px 12px;
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px;
    outline: none;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .pw-search:focus-visible { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-faint-strong); }

  @media (prefers-reduced-motion: reduce) {
    .pw-node, .pw-node .pw-dot, .pw-node .pw-ring, .pw-node text, .pw-edge { transition: none !important; }
  }
`;

function nodePos(radius, idx, total) {
  const angle = (360 / total) * idx * Math.PI / 180;
  return { x: CX + radius * Math.sin(angle), y: CY - radius * Math.cos(angle) };
}

function textAnchor(x) {
  const d = x - CX;
  if (Math.abs(d) < 30) return "middle";
  return d > 0 ? "start" : "end";
}

function textX(x) {
  const d = x - CX;
  if (Math.abs(d) < 30) return x;
  return x + (d > 0 ? 22 : -22);
}

function findKey(shortName) {
  const clean = shortName.replace("(L)","").replace("(E)","").trim();
  return DKEYS.find(function(k) {
    return clean === k || clean === k.split(" ")[0] || k === clean;
  });
}

function buildNodes() {
  const out = [];
  RINGS_CFG.forEach(function(ring, ri) {
    ring.nodes.forEach(function(name, ni) {
      const p = nodePos(ring.rad, ni, ring.nodes.length);
      const key = findKey(name);
      out.push({
        name, x: p.x, y: p.y,
        ringIdx: ri,
        color: RING_COLORS[ri],
        key,
        hasData: Boolean(key && DATA[key]),
        isOuter: false,
      });
    });
  });
  OUTER_CFG.nodes.forEach(function(name, ni) {
    const p = nodePos(OUTER_CFG.rad, ni, OUTER_CFG.nodes.length);
    const key = findKey(name);
    out.push({
      name, x: p.x, y: p.y,
      ringIdx: 4,
      color: OUTER_COLOR,
      key,
      hasData: Boolean(key && DATA[key]),
      isOuter: true,
    });
  });
  return out;
}

// Compute the next node to focus when an arrow key is pressed.
// Left/Right cycle within the same ring (data-only). Up/Down jump to the
// nearest-by-angle data node in the inner / outer ring, with Ring IV (3) → Outer (4).
function nextFocusNode(nodes, current, direction) {
  if (!current) return null;
  if (direction === "left" || direction === "right") {
    const ring = nodes.filter(function(n) { return n.ringIdx === current.ringIdx && n.hasData; });
    const idx = ring.indexOf(current);
    if (idx === -1) return null;
    const step = direction === "right" ? 1 : -1;
    return ring[(idx + step + ring.length) % ring.length];
  }
  let targetIdx;
  if (direction === "up") {
    if (current.ringIdx === 0) return null;
    targetIdx = current.ringIdx - 1;
  } else {
    if (current.ringIdx === 4) return null;
    targetIdx = current.ringIdx + 1;
  }
  const candidates = nodes.filter(function(n) { return n.ringIdx === targetIdx && n.hasData; });
  if (candidates.length === 0) return null;
  const curAngle = Math.atan2(current.x - CX, -(current.y - CY));
  let best = candidates[0];
  let bestDist = Infinity;
  candidates.forEach(function(c) {
    const a = Math.atan2(c.x - CX, -(c.y - CY));
    let d = Math.abs(a - curAngle);
    if (d > Math.PI) d = 2 * Math.PI - d;
    if (d < bestDist) { bestDist = d; best = c; }
  });
  return best;
}

function buildEdges(nodes) {
  const byTarget = new Map();
  nodes.forEach(function(n) { if (n.key) byTarget.set(n.key, n); });

  const edges = [];
  nodes.forEach(function(src) {
    if (!src.hasData) return;
    const fig = DATA[src.key];
    if (!fig || !fig.out) return;
    fig.out.forEach(function(item) {
      const targetName = item[0];
      if (targetName === "ELC") {
        edges.push({ from: src, to: { x: CX, y: CY, name: "ELC", isCenter: true }, color: src.color });
        return;
      }
      const target = byTarget.get(targetName);
      if (target) edges.push({ from: src, to: target, color: src.color });
    });
  });
  return edges;
}

export default function PhilosophicalWeb({ theme, onToggleTheme, initialQuery }) {
  const [tip, setTip] = useState(null);
  const [query, setQuery] = useState(function() { return (initialQuery && initialQuery.q) || ""; });
  const [linesOn, setLinesOn] = useState(function() { return Boolean(initialQuery && initialQuery.lines === "1"); });

  useEffect(function() {
    replaceQuery("web", { q: query.trim(), lines: linesOn ? "1" : "" });
  }, [query, linesOn]);
  const isMobile = useIsMobile();
  const vb = "-220 -30 1400 1020";

  const nodes = useMemo(buildNodes, []);
  const edges = useMemo(function() { return buildEdges(nodes); }, [nodes]);

  const q = query.trim().toLowerCase();
  function isMatch(node) {
    if (!q) return true;
    if (node.name.toLowerCase().includes(q)) return true;
    const fig = node.key && DATA[node.key];
    if (!fig) return false;
    if (fig.desc && fig.desc.toLowerCase().includes(q)) return true;
    if (fig.elc && fig.elc.toLowerCase().includes(q)) return true;
    if (fig.title && fig.title.toLowerCase().includes(q)) return true;
    return false;
  }
  const matchCount = q ? nodes.filter(function(n) { return n.hasData && isMatch(n); }).length : 0;

  function handleNodeKey(e, node) {
    if (!node.hasData) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate({ name: "figure", figure: node.key });
      return;
    }
    const dirMap = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    if (dirMap[e.key]) {
      e.preventDefault();
      const next = nextFocusNode(nodes, node, dirMap[e.key]);
      if (next && next.key) {
        const el = document.getElementById("pw-node-" + next.key);
        if (el && typeof el.focus === "function") el.focus();
      }
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!q) return;
    const matches = nodes.filter(function(n) { return n.hasData && isMatch(n); });
    if (matches.length === 1) navigate({ name: "figure", figure: matches[0].key });
  }

  // When lines are on AND a node is focused/hovered, dim all nodes that
  // aren't the focused one or named in its `out` list ("focus highlight").
  const focusedKey = (function() {
    if (!linesOn || !tip) return null;
    const n = nodes.find(function(x) { return x.name === tip; });
    return n && n.hasData ? n.key : null;
  })();
  const inFocusSet = (function() {
    if (!focusedKey) return null;
    const set = new Set([focusedKey]);
    const fig = DATA[focusedKey];
    if (fig && fig.out) {
      fig.out.forEach(function(item) {
        if (DATA[item[0]]) set.add(item[0]);
      });
    }
    return set;
  })();

  function nodeOpacity(n) {
    if (q) return isMatch(n) ? 1 : 0.18;
    if (inFocusSet && n.key && !inFocusSet.has(n.key)) return 0.22;
    return 1;
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "20px 14px" : "32px 20px", color: TX }}>
      <style>{pwStyles}</style>

      <div style={{ width: "100%", maxWidth: "1100px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <a href={hrefFor({ name: "landing" })} className="elc-btn">← Home</a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <h1 style={{
        color: ACCENT,
        fontSize: isMobile ? "34px" : "44px",
        fontWeight: 600,
        margin: "0 0 8px",
        letterSpacing: "0.005em",
        textAlign: "center",
        lineHeight: 1.1
      }}>
        The Philosophical Web
      </h1>
      <p style={{ color: TX_SOFT, fontSize: isMobile ? "17px" : "19px", margin: "0 0 6px", textAlign: "center", maxWidth: "720px", lineHeight: 1.45, fontStyle: "italic" }}>
        Ella Lyman Cabot · Interest, the Achieved Self, and the Conditions of Selfhood
      </p>
      <p style={{ color: MUTED, fontSize: "14px", fontStyle: "italic", margin: "0 0 18px", textAlign: "center" }}>
        Working document — still being updated · Tap any node to explore lineages
      </p>

      <form onSubmit={onSubmit} role="search" aria-label="Search figures" style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "10px",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "center",
        marginBottom: "10px",
        width: "100%",
        maxWidth: "640px"
      }}>
        <input
          type="search"
          className="pw-search"
          placeholder="Search names or text…"
          aria-label="Search figures"
          value={query}
          onChange={function(e) { setQuery(e.target.value); }}
          style={isMobile ? { width: "100%" } : { flex: "1 1 220px", minWidth: 0 }}
        />
        <button
          type="button"
          className="elc-btn"
          aria-pressed={linesOn}
          style={isMobile ? { justifyContent: "center" } : undefined}
          onClick={function() { setLinesOn(function(v) { return !v; }); }}>
          {linesOn ? "Hide Lines" : "Show Lines"}
        </button>
        <button
          type="button"
          className="elc-btn"
          aria-label="Open a random figure"
          style={isMobile ? { justifyContent: "center" } : undefined}
          onClick={function() {
            const idx = Math.floor(Math.random() * DKEYS.length);
            navigate({ name: "figure", figure: DKEYS[idx] });
          }}>
          Random
        </button>
      </form>

      <div role="status" aria-live="polite" style={{ minHeight: "28px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px", maxWidth: "640px", textAlign: "center", padding: "0 12px" }}>
        {q && (
          <span style={{ color: MUTED, fontSize: "14px", fontStyle: "italic" }}>
            {matchCount === 0 ? "No figures match" :
             matchCount === 1 ? "1 match — press Enter to open" :
             matchCount + " matches"}
          </span>
        )}
        {!q && tip && (
          <div style={{ background: SURF, border: "1px solid " + BORD, borderRadius: "4px", padding: "6px 16px", color: TX, fontSize: "16px" }}>
            {tip}
          </div>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: "1100px" }}>
        <svg viewBox={vb} style={{ width: "100%", height: "auto", overflow: "visible" }} role="img" aria-label="Philosophical web of figures connected to Ella Lyman Cabot. Click or focus a node to explore.">
          <rect x="-220" y="-30" width="1400" height="1020" fill={BG} />

          {[0,30,60,90,120,150,180,210,240,270,300,330].map(function(deg) {
            const rad = deg * Math.PI / 180;
            return (
              <line key={deg}
                x1={CX} y1={CY}
                x2={CX + 490 * Math.sin(rad)}
                y2={CY - 490 * Math.cos(rad)}
                stroke="var(--rule)" strokeWidth="0.4" strokeOpacity="0.35" />
            );
          })}

          {RINGS_CFG.map(function(ring, ri) {
            return (
              <g key={ring.label}>
                <circle cx={CX} cy={CY} r={ring.cr}
                  fill="none" stroke={RING_COLORS[ri]} strokeWidth="2.2" strokeOpacity="0.55" />
                <text
                  x={CX} y={CY - ring.cr - 8}
                  textAnchor="middle"
                  fill={RING_COLORS[ri]}
                  fontFamily="'Cormorant Garamond', Georgia, serif"
                  fontSize="18"
                  fontWeight="600"
                  opacity="0.85"
                  letterSpacing="2">
                  {["I","II","III","IV"][ri]}
                </text>
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={OUTER_CFG.cr}
            fill="none" stroke={OUTER_COLOR} strokeWidth="2.4" strokeOpacity="0.65"
            strokeDasharray="10 6" />
          <text
            x={CX} y={CY - OUTER_CFG.cr - 8}
            textAnchor="middle"
            fill={OUTER_COLOR}
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize="18"
            fontWeight="600"
            opacity="0.85"
            letterSpacing="2">
            V
          </text>

          {linesOn && (
            <g aria-hidden="true">
              {edges.map(function(e, i) {
                const isActive = tip && e.from.name === tip;
                return (
                  <line key={i}
                    className="pw-edge"
                    x1={e.from.x} y1={e.from.y}
                    x2={e.to.x} y2={e.to.y}
                    stroke={e.color}
                    strokeWidth={isActive ? 1.6 : 0.7}
                    strokeOpacity={isActive ? 0.7 : 0.22} />
                );
              })}
            </g>
          )}

          <circle cx={CX} cy={CY} r="60" fill={GOLD} opacity="0.14" />
          <circle cx={CX} cy={CY} r="48" fill={GOLD} opacity="0.95" />
          <text x={CX} y={CY + 4} textAnchor="middle" fill={GOLD_TEXT} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="28" fontWeight="600" letterSpacing="2">ELC</text>
          <text x={CX} y={CY + 28} textAnchor="middle" fill={GOLD_TEXT} fontSize="13" opacity="0.85" letterSpacing="1">1866–1934</text>

          {nodes.map(function(n, i) {
            const isHov = tip === n.name;
            const opacity = nodeOpacity(n);
            const ringR = n.isOuter ? (isHov ? 12 : 10) : (isHov ? 14 : 11);
            const dotR = n.isOuter ? (isHov ? 7 : 5) : (isHov ? 9 : 6);
            const dotFill = n.isOuter ? OUTER_COLOR : n.color;
            const labelColor = n.isOuter
              ? (isHov ? OUTER_COLOR : TX_SOFT)
              : (isHov ? n.color : TX);
            const fontSize = n.isOuter ? 16 : 18;
            return (
              <g key={i}
                id={n.hasData ? "pw-node-" + n.key : undefined}
                className={"pw-node" + (n.hasData ? " pw-node-active" : "")}
                role={n.hasData ? "button" : undefined}
                tabIndex={n.hasData ? 0 : undefined}
                aria-label={n.hasData ? "View " + n.name : undefined}
                onMouseEnter={function() { setTip(n.name); }}
                onMouseLeave={function() { setTip(null); }}
                onFocus={function() { setTip(n.name); }}
                onBlur={function() { setTip(null); }}
                onClick={function() { if (n.hasData) navigate({ name: "figure", figure: n.key }); }}
                onKeyDown={function(e) { handleNodeKey(e, n); }}
                style={{ cursor: n.hasData ? "pointer" : "default", outline: "none", opacity }}>
                {n.hasData && (
                  <circle cx={n.x} cy={n.y} r={ringR}
                    fill="none" stroke={n.isOuter ? OUTER_COLOR : n.color}
                    strokeWidth={isHov ? 1.4 : 1.0}
                    strokeOpacity={isHov ? 0.85 : 0.55}
                    className="pw-ring" />
                )}
                <circle cx={n.x} cy={n.y}
                  r={dotR}
                  fill={dotFill}
                  opacity={isHov ? 1 : (n.isOuter ? 0.92 : 0.85)}
                  className="pw-dot" />
                <text
                  x={textX(n.x)} y={n.y + 6}
                  textAnchor={textAnchor(n.x)}
                  fill={labelColor}
                  fontFamily="'EB Garamond', Georgia, serif"
                  fontSize={fontSize}
                  fontWeight={isHov && !n.isOuter ? "600" : "400"}>
                  {n.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px 24px", maxWidth: "560px", width: "100%", marginTop: "20px" }}>
        {[
          { color: RING_COLORS[0], label: "Ring I — Closest Allies" },
          { color: RING_COLORS[1], label: "Ring II — Substantial Agreement" },
          { color: RING_COLORS[2], label: "Ring III — Partial Agreement" },
          { color: RING_COLORS[3], label: "Ring IV — Objectors" },
          { color: OUTER_COLOR,    label: "Outer — Same Outcome, Different Vocab" },
          { color: GOLD,           label: "ELC — Starting Point" },
        ].map(function(item, i) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ color: TX_SOFT, fontSize: "15px" }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      <aside role="note" style={{ marginTop: "20px", maxWidth: "560px", width: "100%", display: "flex", alignItems: "flex-start", gap: "10px", background: WARN_BG, border: "1px solid " + WARN_BORDER, borderRadius: "6px", padding: "12px 16px", boxSizing: "border-box" }}>
        <span aria-hidden="true" style={{ color: WARN, fontSize: "18px", flexShrink: 0, lineHeight: 1.2 }}>⚠</span>
        <p style={{ color: TX_SOFT, fontSize: "14px", lineHeight: 1.55, margin: 0 }}>
          <strong style={{ color: WARN }}>Still Being Updated.</strong> Entries marked ⚠ in detail view contain claims that are working hypotheses or inferences pending archival verification. All other entries draw from established scholarship and primary sources.
        </p>
      </aside>

      <Footer inset="1100px" />
    </div>
  );
}
