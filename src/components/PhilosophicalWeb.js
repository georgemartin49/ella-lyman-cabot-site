import { useState, useMemo } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA, DKEYS } from "../data/figures";
import { RINGS_CFG, OUTER_CFG, CX, CY } from "../data/rings";
import {
  BG, SURF, BORD, GOLD, MUTED, TX, WARN,
  RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor, navigate } from "../router";

const pwStyles = `
  .pw-node { transition: transform 200ms ease, opacity 200ms ease; }
  .pw-node .pw-dot { transition: r 200ms ease, opacity 200ms ease, fill 200ms ease; }
  .pw-node .pw-ring { transition: r 200ms ease, stroke-opacity 200ms ease, stroke-width 200ms ease; }
  .pw-node text { transition: fill 200ms ease; }
  .pw-node-active:hover { transform: translateZ(0); }
  .pw-node-active:focus-visible { outline: none; }
  .pw-node-active:focus-visible .pw-dot {
    stroke: #FFF8E8; stroke-width: 1.5; stroke-opacity: 0.9;
  }
  .pw-edge { transition: stroke-opacity 200ms ease, stroke-width 200ms ease; }
  .pw-back, .pw-toggle {
    transition: background 200ms ease, border-color 200ms ease;
  }
  .pw-back:hover, .pw-back:focus-visible,
  .pw-toggle:hover, .pw-toggle:focus-visible {
    background: rgba(255,255,255,0.06);
    border-color: #3A4060;
    outline: none;
  }
  .pw-back:focus-visible, .pw-toggle:focus-visible,
  .pw-search:focus-visible { box-shadow: 0 0 0 2px rgba(212,168,64,0.5); }
  .pw-toggle[aria-pressed="true"] {
    background: rgba(212,168,64,0.12);
    border-color: ${GOLD};
    color: ${GOLD};
  }
  .pw-search {
    background: ${SURF};
    color: ${TX};
    border: 1px solid ${BORD};
    border-radius: 6px;
    padding: 8px 12px;
    font-family: Georgia, serif;
    font-size: 16px;
    outline: none;
    transition: border-color 200ms ease;
  }
  .pw-search:focus-visible { border-color: ${GOLD}; }
  .pw-skip { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
  .pw-skip:focus { left: 16px; top: 16px; width: auto; height: auto; padding: 8px 14px; background: ${GOLD}; color: ${BG}; border-radius: 6px; font-weight: bold; z-index: 100; }
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

// Build a flat list of all rendered nodes with their resolved positions and metadata.
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
      ringIdx: -1,
      color: OUTER_COLOR,
      key,
      hasData: Boolean(key && DATA[key]),
      isOuter: true,
    });
  });
  return out;
}

// Edges go from each figure to the figures listed in its `out` array
// (lineage flow toward ELC). Targets that aren't rendered nodes are skipped,
// except "ELC" which terminates at the center.
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

export default function PhilosophicalWeb() {
  const [tip, setTip] = useState(null);
  const [query, setQuery] = useState("");
  const [linesOn, setLinesOn] = useState(false);
  const isMobile = useIsMobile();
  const vb = "-220 -30 1400 1020";

  const nodes = useMemo(buildNodes, []);
  const edges = useMemo(function() { return buildEdges(nodes); }, [nodes]);

  const q = query.trim().toLowerCase();
  function isMatch(name) {
    if (!q) return true;
    return name.toLowerCase().includes(q);
  }
  const matchCount = q ? nodes.filter(function(n) { return n.hasData && isMatch(n.name); }).length : 0;

  function handleNodeKey(e, hasData, key) {
    if (!hasData) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate({ name: "figure", figure: key });
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!q) return;
    const matches = nodes.filter(function(n) { return n.hasData && isMatch(n.name); });
    if (matches.length === 1) navigate({ name: "figure", figure: matches[0].key });
  }

  function nodeOpacity(n) {
    if (!q) return 1;
    return isMatch(n.name) ? 1 : 0.18;
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "20px 14px" : "32px 20px", fontFamily: "Georgia, serif", color: TX }}>
      <style>{pwStyles}</style>

      <div style={{ width: "100%", maxWidth: "1100px", display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
        <a href={hrefFor({ name: "landing" })} className="pw-back" style={{
          background: "transparent",
          border: "1px solid " + BORD,
          color: TX,
          padding: "8px 14px",
          borderRadius: "6px",
          fontSize: "15px",
          textDecoration: "none",
          display: "inline-block"
        }}>← Home</a>
      </div>

      <h1 style={{ color: "#E8D5A0", fontSize: isMobile ? "30px" : "38px", fontWeight: "bold", margin: "0 0 6px", letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.15 }}>
        The Philosophical Web
      </h1>
      <p style={{ color: MUTED, fontSize: isMobile ? "16px" : "19px", margin: "0 0 6px", textAlign: "center", maxWidth: "720px", lineHeight: 1.4 }}>
        Ella Lyman Cabot · Interest, the Achieved Self, and the Conditions of Selfhood
      </p>
      <p style={{ color: "#6A7090", fontSize: "15px", fontStyle: "italic", margin: "0 0 14px", textAlign: "center" }}>
        Working document — still being updated · Tap any node to explore lineages
      </p>

      <form onSubmit={onSubmit} role="search" aria-label="Search figures" style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "10px",
        width: "100%",
        maxWidth: "640px"
      }}>
        <input
          type="search"
          className="pw-search"
          placeholder="Search figures…"
          aria-label="Search figures"
          value={query}
          onChange={function(e) { setQuery(e.target.value); }}
          style={{ flex: "1 1 220px", minWidth: 0 }}
        />
        <button
          type="button"
          className="pw-toggle"
          aria-pressed={linesOn}
          onClick={function() { setLinesOn(function(v) { return !v; }); }}
          style={{
            background: "transparent",
            border: "1px solid " + BORD,
            color: TX,
            padding: "8px 14px",
            borderRadius: "6px",
            fontSize: "15px",
            fontFamily: "Georgia, serif",
            cursor: "pointer"
          }}>
          {linesOn ? "Hide Lines" : "Show Lines"}
        </button>
      </form>

      <div role="status" aria-live="polite" style={{ minHeight: "28px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px", maxWidth: "640px", textAlign: "center", padding: "0 12px" }}>
        {q && (
          <span style={{ color: MUTED, fontSize: "14px" }}>
            {matchCount === 0 ? "No figures match" :
             matchCount === 1 ? "1 match — press Enter to open" :
             matchCount + " matches"}
          </span>
        )}
        {!q && tip && (
          <div style={{ background: SURF, border: "1px solid " + BORD, borderRadius: "6px", padding: "6px 16px", color: "#D2D8EA", fontSize: "16px" }}>
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
                stroke="#ffffff" strokeWidth="0.4" strokeOpacity="0.04" />
            );
          })}

          {RINGS_CFG.map(function(ring, ri) {
            return (
              <circle key={ring.label} cx={CX} cy={CY} r={ring.cr}
                fill="none" stroke={RING_COLORS[ri]} strokeWidth="0.8" strokeOpacity="0.20" />
            );
          })}

          <circle cx={CX} cy={CY} r={OUTER_CFG.cr}
            fill="none" stroke={OUTER_COLOR} strokeWidth="0.9" strokeOpacity="0.30"
            strokeDasharray="9 5" />

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
                    strokeOpacity={isActive ? 0.7 : 0.18} />
                );
              })}
            </g>
          )}

          <circle cx={CX} cy={CY} r="60" fill={GOLD} opacity="0.10" />
          <circle cx={CX} cy={CY} r="48" fill={GOLD} opacity="0.95" />
          <text x={CX} y={CY + 4} textAnchor="middle" fill="#FFF8E8" fontSize="26" fontWeight="bold" letterSpacing="2">ELC</text>
          <text x={CX} y={CY + 28} textAnchor="middle" fill="#FFF8E8" fontSize="13" opacity="0.85" letterSpacing="1">1866–1934</text>

          {nodes.map(function(n, i) {
            const isHov = tip === n.name;
            const opacity = nodeOpacity(n);
            const ringR = n.isOuter ? (isHov ? 12 : 10) : (isHov ? 14 : 11);
            const dotR = n.isOuter ? (isHov ? 7 : 5) : (isHov ? 9 : 6);
            const dotFill = n.isOuter ? (isHov ? OUTER_COLOR : "#7E6EAA") : n.color;
            const labelColor = n.isOuter
              ? (isHov ? OUTER_COLOR : "#A89FC8")
              : (isHov ? n.color : "#C2CADD");
            const fontSize = n.isOuter ? 16 : 18;
            return (
              <g key={i}
                className={"pw-node" + (n.hasData ? " pw-node-active" : "")}
                role={n.hasData ? "button" : undefined}
                tabIndex={n.hasData ? 0 : undefined}
                aria-label={n.hasData ? "View " + n.name : undefined}
                onMouseEnter={function() { setTip(n.name); }}
                onMouseLeave={function() { setTip(null); }}
                onFocus={function() { setTip(n.name); }}
                onBlur={function() { setTip(null); }}
                onClick={function() { if (n.hasData) navigate({ name: "figure", figure: n.key }); }}
                onKeyDown={function(e) { handleNodeKey(e, n.hasData, n.key); }}
                style={{ cursor: n.hasData ? "pointer" : "default", outline: "none", opacity }}>
                {n.hasData && (
                  <circle cx={n.x} cy={n.y} r={ringR}
                    fill="none" stroke={n.isOuter ? OUTER_COLOR : n.color}
                    strokeWidth={isHov ? 1.4 : 1.0}
                    strokeOpacity={isHov ? 0.8 : 0.5}
                    className="pw-ring" />
                )}
                <circle cx={n.x} cy={n.y}
                  r={dotR}
                  fill={dotFill}
                  opacity={isHov ? 1 : (n.isOuter ? 0.92 : 0.75)}
                  className="pw-dot" />
                <text
                  x={textX(n.x)} y={n.y + 6}
                  textAnchor={textAnchor(n.x)}
                  fill={labelColor}
                  fontSize={fontSize}
                  fontWeight={isHov && !n.isOuter ? "bold" : "normal"}>
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
              <span style={{ color: "#A0A8BE", fontSize: "15px" }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      <aside role="note" style={{ marginTop: "20px", maxWidth: "560px", width: "100%", display: "flex", alignItems: "flex-start", gap: "10px", background: "rgba(192,120,64,0.08)", border: "1px solid rgba(192,120,64,0.25)", borderRadius: "8px", padding: "12px 16px", boxSizing: "border-box" }}>
        <span aria-hidden="true" style={{ color: WARN, fontSize: "18px", flexShrink: 0, lineHeight: 1.2 }}>⚠</span>
        <p style={{ color: "#9E8E78", fontSize: "14px", lineHeight: 1.55, margin: 0 }}>
          <strong style={{ color: WARN }}>Still Being Updated.</strong> Entries marked ⚠ in detail view contain claims that are working hypotheses or inferences pending archival verification. All other entries draw from established scholarship and primary sources.
        </p>
      </aside>

    </div>
  );
}
