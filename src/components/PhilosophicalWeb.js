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
        edges.push({ from: src, to: { x: CX, y: CY, name: "ELC", isCenter: true }, color: src.color, fromRingIdx: src.ringIdx });
        return;
      }
      const target = byTarget.get(targetName);
      if (target) edges.push({ from: src, to: target, color: src.color, fromRingIdx: src.ringIdx });
    });
  });
  return edges;
}

// Quadratic Bezier from (x1,y1) to (x2,y2), bowed sideways away from the
// diagram center so spokes don't cross through ELC.
function arcPath(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const chord = Math.hypot(dx, dy);
  if (chord < 1) return "M " + x1 + " " + y1 + " L " + x2 + " " + y2;
  let px = -dy / chord;
  let py = dx / chord;
  // Pick the perpendicular pointing away from the center.
  const towardCx = CX - mx;
  const towardCy = CY - my;
  if (px * towardCx + py * towardCy > 0) { px = -px; py = -py; }
  const offset = chord * 0.18;
  const cx = mx + px * offset;
  const cy = my + py * offset;
  return "M " + x1 + " " + y1 + " Q " + cx + " " + cy + " " + x2 + " " + y2;
}

// Lines mode: "off" hides edges; "all" shows every edge (current default
// behaviour); "focus" shows only the currently hovered/focused node's
// outgoing lineage. Backward-compatible: the legacy `?lines=1` URL
// param maps to "all".
function parseLinesMode(raw) {
  if (raw === "all" || raw === "focus") return raw;
  if (raw === "1") return "all";
  return "off";
}

// "12345" or "1,3,5" → array of which 1-based rings are enabled.
// Default: all five enabled.
function parseEnabledRings(raw) {
  const all = [true, true, true, true, true];
  if (!raw) return all;
  const out = [false, false, false, false, false];
  String(raw).replace(/[^1-5]/g, "").split("").forEach(function(d) {
    out[parseInt(d, 10) - 1] = true;
  });
  return out.some(Boolean) ? out : all;
}

function serializeRings(enabled) {
  const allOn = enabled.every(Boolean);
  if (allOn) return "";
  return enabled.map(function(b, i) { return b ? (i + 1) : ""; }).join("");
}

// People filters: "all" means no filter on that dimension.
//   gender: "all" | "m" | "f"
//   known:  "all" | "yes" | "no"
//   arch:   "all" | "yes" | "no"
const VALID_GENDER = { all:1, m:1, f:1 };
const VALID_TRI    = { all:1, yes:1, no:1 };
function parseGender(v) { return VALID_GENDER[v] ? v : "all"; }
function parseTri(v)    { return VALID_TRI[v]    ? v : "all"; }

export default function PhilosophicalWeb({ theme, onToggleTheme, initialQuery }) {
  const [tip, setTip] = useState(null);
  const [query, setQuery] = useState(function() { return (initialQuery && initialQuery.q) || ""; });
  const [linesMode, setLinesMode] = useState(function() { return parseLinesMode(initialQuery && initialQuery.lines); });
  const [enabledRings, setEnabledRings] = useState(function() { return parseEnabledRings(initialQuery && initialQuery.rings); });
  const [genderF, setGenderF] = useState(function() { return parseGender(initialQuery && initialQuery.g); });
  const [knownF, setKnownF] = useState(function() { return parseTri(initialQuery && initialQuery.k); });
  const [archF, setArchF] = useState(function() { return parseTri(initialQuery && initialQuery.a); });
  const [regionF, setRegionF] = useState(function() { return (initialQuery && initialQuery.r) || "all"; });

  useEffect(function() {
    replaceQuery("web", {
      q: query.trim(),
      lines: linesMode === "off" ? "" : linesMode,
      rings: linesMode === "off" ? "" : serializeRings(enabledRings),
      g: genderF === "all" ? "" : genderF,
      k: knownF === "all" ? "" : knownF,
      a: archF === "all" ? "" : archF,
      r: regionF === "all" ? "" : regionF,
    });
  }, [query, linesMode, enabledRings, genderF, knownF, archF, regionF]);
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
    if (linesMode === "off" || !tip) return null;
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

  function passesPeopleFilters(n) {
    if (!n.hasData) return genderF === "all" && knownF === "all" && archF === "all" && regionF === "all";
    const fig = DATA[n.key];
    if (genderF !== "all" && fig.gender !== genderF) return false;
    if (knownF === "yes" && !fig.wellKnown) return false;
    if (knownF === "no"  &&  fig.wellKnown) return false;
    if (archF === "yes" && !fig.hasArchive) return false;
    if (archF === "no"  &&  fig.hasArchive) return false;
    if (regionF !== "all" && fig.region !== regionF) return false;
    return true;
  }
  const peopleFiltersActive = genderF !== "all" || knownF !== "all" || archF !== "all" || regionF !== "all";
  const visibleCount = peopleFiltersActive
    ? nodes.filter(function(n) { return n.hasData && passesPeopleFilters(n); }).length
    : nodes.filter(function(n) { return n.hasData; }).length;
  const totalDataCount = nodes.filter(function(n) { return n.hasData; }).length;

  function nodeOpacity(n) {
    if (q) return isMatch(n) ? 1 : 0.18;
    if (peopleFiltersActive && !passesPeopleFilters(n)) return 0.18;
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
          aria-pressed={linesMode !== "off"}
          aria-label={"Lines: " + linesMode + ". Click to cycle to next mode."}
          style={isMobile ? { justifyContent: "center" } : undefined}
          onClick={function() {
            setLinesMode(function(m) {
              if (m === "off") return "all";
              if (m === "all") return "focus";
              return "off";
            });
          }}>
          Lines: {linesMode === "off" ? "Off" : linesMode === "all" ? "All" : "Focus"}
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

      {linesMode !== "off" && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "10px",
          maxWidth: "720px",
          padding: "0 12px"
        }}>
          <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "4px" }}>Rings</span>
          {[0, 1, 2, 3, 4].map(function(ri) {
            const enabled = enabledRings[ri];
            const c = ri === 4 ? OUTER_COLOR : RING_COLORS[ri];
            const labels = ["Ring I", "Ring II", "Ring III", "Ring IV", "Ring V"];
            return (
              <button key={ri}
                type="button"
                className="elc-btn"
                aria-pressed={enabled}
                style={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  opacity: enabled ? 1 : 0.55,
                  textDecoration: enabled ? "none" : "line-through"
                }}
                onClick={function() {
                  setEnabledRings(function(prev) {
                    const next = prev.slice();
                    next[ri] = !next[ri];
                    if (!next.some(Boolean)) return prev;
                    return next;
                  });
                }}>
                <span aria-hidden="true" style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: enabled ? c : "transparent", border: "1.5px solid " + c, marginRight: "6px", verticalAlign: "middle", boxSizing: "border-box" }} />
                {labels[ri]}
              </button>
            );
          })}
        </div>
      )}

      <section aria-label="Filter people" style={{
        width: "100%",
        maxWidth: "780px",
        marginBottom: "12px",
        padding: isMobile ? "10px 12px" : "10px 16px",
        background: SURF,
        border: "1px solid " + BORD,
        borderRadius: "6px",
        boxSizing: "border-box"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "8px"
        }}>
          <span style={{ color: ACCENT, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Filter people</span>
          {peopleFiltersActive && (
            <button type="button" className="elc-btn"
              style={{ fontSize: "13px", padding: "5px 10px" }}
              onClick={function() { setGenderF("all"); setKnownF("all"); setArchF("all"); setRegionF("all"); }}>
              Reset
            </button>
          )}
        </div>
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: isMobile ? "nowrap" : "wrap",
          gap: isMobile ? "10px" : "10px 20px",
          alignItems: isMobile ? "stretch" : "center"
        }}>
          {[
            { label: "Gender",  value: genderF, set: setGenderF, opts: [["all","All"],["m","Men"],["f","Women"]] },
            { label: "Known",   value: knownF,  set: setKnownF,  opts: [["all","All"],["yes","Well-known"],["no","Less-known"]] },
            { label: "Archive", value: archF,   set: setArchF,   opts: [["all","All"],["yes","With"],["no","Without"]] },
            { label: "Region",  value: regionF, set: setRegionF, opts: [["all","All"],["American-NE","Am · NE"],["American-Other","Am · Other"],["British","British"],["French","French"],["German","German"],["Greek","Greek"],["Other","Other"]] },
          ].map(function(group, gi) {
            return (
              <div key={gi} role="group" aria-label={group.label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", minWidth: isMobile ? "64px" : "auto" }}>{group.label}</span>
                {group.opts.map(function(opt) {
                  const pressed = group.value === opt[0];
                  return (
                    <button key={opt[0]}
                      type="button"
                      className="elc-btn"
                      aria-pressed={pressed}
                      style={{ fontSize: "14px", padding: "7px 12px", opacity: pressed ? 1 : 0.7 }}
                      onClick={function() { group.set(opt[0]); }}>
                      {opt[1]}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {peopleFiltersActive && (
        <div role="status" aria-live="polite" style={{ marginBottom: "6px", textAlign: "center" }}>
          <span style={{ color: MUTED, fontSize: "13px", fontStyle: "italic" }}>
            {visibleCount} of {totalDataCount} figures match
          </span>
        </div>
      )}

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

          {linesMode !== "off" && (
            <g aria-hidden="true">
              {edges.map(function(e, i) {
                if (!enabledRings[e.fromRingIdx]) return null;
                const isFocused = tip && e.from.name === tip;
                if (linesMode === "focus" && !isFocused) return null;
                return (
                  <path key={i}
                    className="pw-edge"
                    d={arcPath(e.from.x, e.from.y, e.to.x, e.to.y)}
                    fill="none"
                    stroke={e.color}
                    strokeWidth={isFocused ? 3.0 : 2.0}
                    strokeOpacity={isFocused ? 0.95 : 0.78}
                    strokeLinecap="round" />
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

            const visuals = (
              <>
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
              </>
            );

            // Decorative-only nodes (no data): plain <g>, no interactivity.
            if (!n.hasData) {
              return (
                <g key={i} className="pw-node" style={{ opacity }}>
                  {visuals}
                </g>
              );
            }

            // Real nodes use SVG <a> with href so iOS treats taps as link
            // activation (no first-tap-shows-hover, second-tap-clicks).
            const href = hrefFor({ name: "figure", figure: n.key });
            return (
              <a key={i}
                id={"pw-node-" + n.key}
                href={href}
                className="pw-node pw-node-active"
                role="button"
                aria-label={"View " + n.name}
                onMouseEnter={function() { setTip(n.name); }}
                onMouseLeave={function() { setTip(null); }}
                onFocus={function() { setTip(n.name); }}
                onBlur={function() { setTip(null); }}
                onClick={function(e) {
                  e.preventDefault();
                  navigate({ name: "figure", figure: n.key });
                }}
                onKeyDown={function(e) { handleNodeKey(e, n); }}
                style={{ cursor: "pointer", outline: "none", opacity }}>
                {visuals}
              </a>
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
          { color: OUTER_COLOR,    label: "Ring V — Same Outcome, Different Vocab" },
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
