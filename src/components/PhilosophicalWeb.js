import { useState, useMemo, useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA, DKEYS } from "../data/figures";
import { RINGS_CFG, OUTER_CFG, RING_NAMES, CX, CY } from "../data/rings";
import { CONNECTION_TYPES, HISTORICAL, connectionOf, fullName } from "../data/connections";
import FigureList from "./FigureList";
import ConnectionKey, { MapIntroduction, MAP_INTRODUCTION } from "./ConnectionKey";
import Page from "./Page";
import { searchFigures } from "../data/search";
import {
  BG, ACCENT, TX, TX_SOFT, MUTED, GOLD, GOLD_TEXT, RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor, navigate, replaceQuery } from "../router";

const pwStyles = `
  .pw-node { transition: transform 200ms ease, opacity 200ms ease; }
  .pw-node .pw-dot { transition: r 200ms ease, opacity 200ms ease, fill 200ms ease; }
  .pw-node .pw-ring { transition: r 200ms ease, stroke-opacity 200ms ease, stroke-width 200ms ease; }
  .pw-node text { transition: fill 200ms ease; }
  .pw-node-active:hover { transform: translateZ(0); }
  .pw-node-active:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
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
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .pw-search:focus-visible { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-faint-strong); }

  @media (prefers-reduced-motion: reduce) {
    .pw-node, .pw-node .pw-dot, .pw-node .pw-ring, .pw-node text, .pw-edge { transition: none !important; }
  }
`;

function nodePos(radius, idx, total) {
  // Offset by half a step so no node sits at 12 o'clock, where the ring numeral is.
  const angle = (360 / total) * (idx + 0.5) * Math.PI / 180;
  return { x: CX + radius * Math.sin(angle), y: CY - radius * Math.cos(angle) };
}

// Where a node's label goes. On the crowded ring (Ring II, 28 figures) names
// run outward along the radius, like spokes, so neighbours never overlap.
// Elsewhere they sit beside the dot, or below it at the bottom of the circle.
function labelPlacement(x, y, total) {
  const dx = x - CX;
  const dy = y - CY;
  if (total > 12) {
    const r = Math.hypot(dx, dy) || 1;
    const lx = CX + dx * (r + 14) / r;
    const ly = CY + dy * (r + 14) / r;
    const deg = Math.atan2(dy, dx) * 180 / Math.PI;
    const right = dx >= 0;
    return { x: lx, y: ly + 5, anchor: right ? "start" : "end", rotate: (right ? deg : deg + 180) + " " + lx + " " + ly, small: true };
  }
  if (Math.abs(dx) < 8) return dy > 0 ? { x: x, y: y + 28, anchor: "middle" } : { x: x, y: y - 16, anchor: "middle" };
  return { x: x + (dx > 0 ? 18 : -18), y: y + 6, anchor: dx > 0 ? "start" : "end" };
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
        name, x: p.x, y: p.y, label: labelPlacement(p.x, p.y, ring.nodes.length),
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
      name, x: p.x, y: p.y, label: labelPlacement(p.x, p.y, OUTER_CFG.nodes.length),
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
        if (!HISTORICAL[connectionOf(src.key).type]) return;
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
//   arch:   "all" | "yes" | "no"
const VALID_GENDER = { all:1, m:1, f:1 };
const VALID_TRI    = { all:1, yes:1, no:1 };
function parseGender(v) { return VALID_GENDER[v] ? v : "all"; }
function parseTri(v)    { return VALID_TRI[v]    ? v : "all"; }

export default function PhilosophicalWeb({ theme, onToggleTheme, initialQuery }) {
  const [tip, setTip] = useState(null);
  const [query, setQuery] = useState(function() { return (initialQuery && initialQuery.q) || ""; });
  const [linesMode, setLinesMode] = useState(function() { return parseLinesMode(initialQuery && initialQuery.lines); });
  const [enabledRings] = useState(function() { return parseEnabledRings(initialQuery && initialQuery.rings); });
  const [genderF, setGenderF] = useState(function() { return parseGender(initialQuery && initialQuery.g); });
  const [archF, setArchF] = useState(function() { return parseTri(initialQuery && initialQuery.a); });
  const [regionF, setRegionF] = useState(function() { return (initialQuery && initialQuery.r) || "all"; });
  const [relF, setRelF] = useState(function() { return (initialQuery && CONNECTION_TYPES[initialQuery.rel]) ? initialQuery.rel : "all"; });
  // Map and List show the same figures; narrow screens open in List.
  const [view, setView] = useState(function() {
    if (initialQuery && (initialQuery.view === "map" || initialQuery.view === "list")) return initialQuery.view;
    return typeof window !== "undefined" && window.innerWidth < 640 ? "list" : "map";
  });

  useEffect(function() {
    replaceQuery("web", {
      q: query.trim(),
      lines: linesMode === "off" ? "" : linesMode,
      rings: linesMode === "off" ? "" : serializeRings(enabledRings),
      g: genderF === "all" ? "" : genderF,
      a: archF === "all" ? "" : archF,
      r: regionF === "all" ? "" : regionF,
      rel: relF === "all" ? "" : relF,
      view: view,
    });
  }, [query, linesMode, enabledRings, genderF, archF, regionF, relF, view]);
  const isMobile = useIsMobile();
  const vb = "-220 -30 1400 1020";

  const nodes = useMemo(buildNodes, []);
  const edges = useMemo(function() { return buildEdges(nodes); }, [nodes]);

  const q = query.trim().toLowerCase();
  const matchSet = useMemo(function() { return new Set(searchFigures(query).map(function(r) { return r.key; })); }, [query]);
  function isMatch(node) {
    if (!q) return true;
    return Boolean(node.key && matchSet.has(node.key));
  }

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
    const ranked = searchFigures(query).filter(function(r) { return keyPasses(r.key); });
    if (ranked.length && ranked[0].rank === 3) navigate({ name: "figure", figure: ranked[0].key });
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
    if (!n.hasData) return genderF === "all" && archF === "all" && regionF === "all" && relF === "all";
    const fig = DATA[n.key];
    if (relF !== "all" && connectionOf(n.key).type !== relF) return false;
    if (genderF !== "all" && fig.gender !== genderF) return false;
    if (archF === "yes" && !fig.hasArchive) return false;
    if (archF === "no"  &&  fig.hasArchive) return false;
    if (regionF !== "all" && fig.region !== regionF) return false;
    return true;
  }
  const peopleFiltersActive = genderF !== "all" || archF !== "all" || regionF !== "all" || relF !== "all";
  const keyPasses = function(key) { const n = nodes.find(function(x) { return x.key === key; }); return n ? passesPeopleFilters(n) : true; };

  function nodeOpacity(n) {
    if (q && !isMatch(n)) return 0.18;
    if (peopleFiltersActive && !passesPeopleFilters(n)) return 0.18;
    if (inFocusSet && n.key && !inFocusSet.has(n.key)) return 0.22;
    return 1;
  }

  const shownCount = (q ? searchFigures(query).map(function(r) { return r.key; }) : DKEYS).filter(keyPasses).length;

  const group = function(label, value, set, opts) {
    return (
      <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <span style={{ color: MUTED, fontSize: "14px", minWidth: "7em" }}>{label}</span>
        {opts.map(function(opt) {
          return <button key={opt[0]} type="button" className="elc-btn" aria-pressed={value === opt[0]} style={{ fontSize: "14px", padding: "5px 10px" }} onClick={function() { set(opt[0]); }}>{opt[1]}</button>;
        })}
      </div>
    );
  };

  return (
    <Page current="web" theme={theme} onToggleTheme={onToggleTheme} width="1100px">
      <style>{pwStyles}</style>
      <h1 style={{ color: ACCENT, fontSize: isMobile ? "34px" : "40px", fontWeight: 600, margin: "0 0 6px", lineHeight: 1.1 }}>Map</h1>
      <p style={{ color: TX_SOFT, fontSize: "17px", margin: "0 0 16px", maxWidth: "46em" }}>
        The figures around Ella Lyman Cabot. Each sits in a ring showing how close the editor judges their position to hers;
        its relationship to Cabot is a separate label, explained below.
      </p>

      <form onSubmit={onSubmit} role="search" aria-label="Search and filter figures" style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", alignItems: "flex-end", marginBottom: "8px" }}>
        <div style={{ flex: "1 1 260px" }}>
          <label htmlFor="pw-q" style={{ display: "block", color: MUTED, fontSize: "14px", marginBottom: "4px" }}>Search names and entry text</label>
          <input id="pw-q" type="search" className="pw-search" value={query} onChange={function(e) { setQuery(e.target.value); }} style={{ width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label htmlFor="pw-rel" style={{ display: "block", color: MUTED, fontSize: "14px", marginBottom: "4px" }}>Relationship to Cabot</label>
          <select id="pw-rel" className="pw-search" value={relF} onChange={function(e) { setRelF(e.target.value); }}>
            <option value="all">All relationships</option>
            {Object.keys(CONNECTION_TYPES).map(function(k) { return <option key={k} value={k}>{CONNECTION_TYPES[k].label}</option>; })}
          </select>
        </div>
        <div role="group" aria-label="View" style={{ display: "flex", gap: "6px" }}>
          <button type="button" className="elc-btn" aria-pressed={view === "map"} onClick={function() { setView("map"); }}>Map</button>
          <button type="button" className="elc-btn" aria-pressed={view === "list"} onClick={function() { setView("list"); }}>List</button>
        </div>
      </form>

      <details style={{ marginBottom: "10px" }}>
        <summary style={{ cursor: "pointer", color: TX, fontSize: "15px", padding: "6px 0" }}>More filters{peopleFiltersActive && (genderF !== "all" || archF !== "all" || regionF !== "all") ? " (active)" : ""}</summary>
        <div style={{ padding: "8px 0 4px" }}>
          {group("Gender", genderF, setGenderF, [["all","All"],["m","Men"],["f","Women"]])}
          {group("Region", regionF, setRegionF, [["all","All"],["American-NE","New England"],["American-Other","Elsewhere in the US"],["British","British"],["French","French"],["German","German"],["Greek","Greek"],["Other","Other"]])}
          {group("Archival references listed in the entry", archF, setArchF, [["all","All"],["yes","Listed"],["no","None listed"]])}
          {view === "map" && group("Connection lines", linesMode, setLinesMode, [["off","Off"],["all","All"],["focus","Focused figure only"]])}
          <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
            <button type="button" className="elc-btn" style={{ fontSize: "14px", padding: "4px 10px" }} onClick={function() { navigate({ name: "figure", figure: DKEYS[Math.floor(Math.random() * DKEYS.length)] }); }}>Open a random entry</button>
            {peopleFiltersActive && <button type="button" className="elc-btn" style={{ fontSize: "14px", padding: "4px 10px", marginLeft: "8px" }} onClick={function() { setGenderF("all"); setArchF("all"); setRegionF("all"); setRelF("all"); }}>Clear filters</button>}
          </p>
        </div>
      </details>

      <p role="status" aria-live="polite" style={{ color: TX_SOFT, fontSize: "15px", margin: "0 0 12px" }}>
        {shownCount === 0 ? "No figures match." : shownCount + (shownCount === 1 ? " figure" : " figures") + (q || peopleFiltersActive ? " match." : ".")}
        {q && view === "map" && shownCount > 0 && <> Matches are highlighted; <button type="button" className="elc-btn" style={{ fontSize: "14px", padding: "2px 8px" }} onClick={function() { setView("list"); }}>show them as a list</button></>}
        {!q && view === "map" && tip && <> {(function() { const n = nodes.find(function(x) { return x.name === tip; }); return n && n.key ? fullName(n.key) : tip; })()}</>}
      </p>

      {view === "list" ? (
        <section aria-labelledby="pw-list">
          <h2 id="pw-list" className="elc-eyebrow">{q ? "Results, best matches first" : "All figures, alphabetical"}</h2>
          <FigureList query={query} headingId="pw-list" filter={keyPasses} />
        </section>
      ) : (
        <>
      <div style={{ width: "100%", maxWidth: "1100px" }}>
        <svg viewBox={vb} style={{ width: "100%", height: "auto", overflow: "visible" }} role="group" aria-label="Map of figures around Ella Lyman Cabot, arranged in five rings. Each figure is a link to its entry.">
          <rect x="-220" y="-30" width="1400" height="1020" fill={BG} />

          <g aria-hidden="true">
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
                  x={CX} y={CY - ring.cr + 22}
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
            x={CX} y={CY - OUTER_CFG.cr + 22}
            textAnchor="middle"
            fill={OUTER_COLOR}
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize="18"
            fontWeight="600"
            opacity="0.85"
            letterSpacing="2">
            V
          </text>
          </g>

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

          <g aria-hidden="true">
          <circle cx={CX} cy={CY} r="60" fill={GOLD} opacity="0.14" />
          <circle cx={CX} cy={CY} r="48" fill={GOLD} opacity="0.95" />
          <text x={CX} y={CY + 4} textAnchor="middle" fill={GOLD_TEXT} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="24" fontWeight="600" letterSpacing="1">Cabot</text>
          <text x={CX} y={CY + 28} textAnchor="middle" fill={GOLD_TEXT} fontSize="13" opacity="0.85" letterSpacing="1">1866-1934</text>
          </g>

          {nodes.map(function(n, i) {
            const isHov = tip === n.name;
            const opacity = nodeOpacity(n);
            const ringR = n.isOuter ? (isHov ? 12 : 10) : (isHov ? 14 : 11);
            const dotR = n.isOuter ? (isHov ? 7 : 5) : (isHov ? 9 : 6);
            const dotFill = n.isOuter ? OUTER_COLOR : n.color;
            // Ring colours are too pale for text; a hovered label turns the accent colour instead.
            const labelColor = isHov ? ACCENT : (n.isOuter ? TX_SOFT : TX);
            const fontSize = n.isOuter ? 16 : (n.label.small ? 15 : 18);

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
                  x={n.label.x} y={n.label.y}
                  textAnchor={n.label.anchor}
                  transform={n.label.rotate ? "rotate(" + n.label.rotate + ")" : undefined}
                  className={n.label.small ? "pw-label pw-label-radial" : "pw-label"}
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
                <g key={i} className="pw-node" style={{ opacity }} aria-hidden="true">
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
                aria-label={fullName(n.key) + ", " + RING_NAMES[n.ringIdx] + ", " + CONNECTION_TYPES[connectionOf(n.key).type].label}
                onMouseEnter={function() { setTip(n.name); }}
                onMouseLeave={function() { setTip(null); }}
                onFocus={function() { setTip(n.name); }}
                onBlur={function() { setTip(null); }}
                onClick={function(e) {
                  e.preventDefault();
                  navigate({ name: "figure", figure: n.key });
                }}
                onKeyDown={function(e) { handleNodeKey(e, n); }}
                style={{ cursor: "pointer", opacity }}>
                {visuals}
              </a>
            );
          })}
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px 24px", maxWidth: "560px", width: "100%", marginTop: "20px" }}>
        {[
          { color: RING_COLORS[0], label: RING_NAMES[0] },
          { color: RING_COLORS[1], label: RING_NAMES[1] },
          { color: RING_COLORS[2], label: RING_NAMES[2] },
          { color: RING_COLORS[3], label: RING_NAMES[3] },
          { color: OUTER_COLOR,    label: RING_NAMES[4] },
          { color: GOLD,           label: "Ella Lyman Cabot, at the center" },
        ].map(function(item, i) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ color: TX_SOFT, fontSize: "15px" }}>{item.label}</span>
            </div>
          );
        })}
      </div>
        </>
      )}

      <div style={{ marginTop: "28px", maxWidth: "720px" }}>
        <ConnectionKey compact />
      </div>
      {MAP_INTRODUCTION && <div style={{ marginTop: "16px", maxWidth: "720px" }}><MapIntroduction /></div>}
    </Page>
  );
}
