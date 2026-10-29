import { useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA, DKEYS } from "../data/figures";
import {
  SURF, BORD, ACCENT, TX_SOFT, MUTED, GOLD, RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor } from "../router";
import { fullName } from "../data/connections";
import Page from "./Page";

// Parse a `dates` string into one-or-more {start,end} ranges.
// Returns null when the string isn't pinpointable on a year axis.
function parseRanges(dateStr) {
  if (!dateStr) return null;
  const s = dateStr.trim();
  const dash = "[–-]";

  let m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*(\\d+)\\s*BC$"));
  if (m) return [{ start: -parseInt(m[1], 10), end: -parseInt(m[2], 10) }];

  m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*(\\d+)\\s*/\\s*(\\d+)\\s*" + dash + "\\s*(\\d+)(?:\\s*AD)?$"));
  if (m) return [
    { start: +m[1], end: +m[2] },
    { start: +m[3], end: +m[4] }
  ];

  m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*$"));
  if (m) return [{ start: +m[1], end: new Date().getFullYear() }];

  m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*(\\d+)$"));
  if (m) return [{ start: +m[1], end: +m[2] }];

  return null;
}

function ringColorFor(fig) {
  if (fig.ring === 5) return OUTER_COLOR;
  return RING_COLORS[fig.ring - 1] || RING_COLORS[0];
}

function ringDisplayLabel(idx) {
  return ["Ring I", "Ring II", "Ring III", "Ring IV", "Ring V"][idx];
}

const ELC = { start: 1866, end: 1934 };

export default function Timeline({ theme, onToggleTheme }) {
  const isMobile = useIsMobile();
  const [activeRow, setActiveRow] = useState(null);

  // View mode: "chrono" sorts every figure by birth year on a single axis;
  // "ring" groups figures into Ring I–V sections. Both kept; chrono is default.
  const [viewMode, setViewMode] = useState("chrono");
  // 5 rings; each can be toggled on/off. Default all on.
  const [enabledRings, setEnabledRings] = useState([true, true, true, true, true]);
  // Region filter: "all" or one of the META region values.
  const [regionF, setRegionF] = useState("all");
  // Zoom preset for the year axis.
  const ZOOM_PRESETS = [
    { id:"all",       label:"All",        from:1700, to:null },
    { id:"pre1850",   label:"Pre-1850",   from:1700, to:1850 },
    { id:"1800-1900", label:"1800-1900",  from:1800, to:1900 },
    { id:"1850-1950", label:"1850-1950",  from:1850, to:1950 },
    { id:"1900-2000", label:"1900-2000",  from:1900, to:2000 },
    { id:"post1950",  label:"Post-1950",  from:1950, to:null },
  ];
  const [zoomId, setZoomId] = useState("all");
  const zoomPreset = ZOOM_PRESETS.find(function(p) { return p.id === zoomId; }) || ZOOM_PRESETS[0];

  // Build full set of entries with parsed ranges, applying region + zoom filters.
  const allEntries = [];
  DKEYS.forEach(function(key) {
    const fig = DATA[key];
    const ranges = parseRanges(fig.dates);
    if (!ranges) return;
    if (regionF !== "all" && fig.region !== regionF) return;
    ranges.forEach(function(r, idx) {
      // Skip pre-1700 figures so the modern era reads clearly.
      if (r.end < 1700) return;
      // Apply zoom: only include ranges that overlap the visible window.
      if (r.end < zoomPreset.from) return;
      if (zoomPreset.to !== null && r.start > zoomPreset.to) return;
      allEntries.push({
        key,
        ringIdx: fig.ring - 1,
        title: fig.title,
        dates: fig.dates,
        start: r.start,
        end: r.end,
        suffix: ranges.length > 1 ? " (" + (idx + 1) + ")" : "",
        color: ringColorFor(fig),
      });
    });
  });

  // Apply ring filter.
  const filtered = allEntries.filter(function(e) { return enabledRings[e.ringIdx]; });
  const sorted = filtered.slice().sort(function(a, b) { return a.start - b.start; });

  // Sections: in "ring" mode, group by ring; in "chrono", one section.
  const sections = viewMode === "ring"
    ? [0, 1, 2, 3, 4]
        .filter(function(ri) { return enabledRings[ri]; })
        .map(function(ri) {
          return {
            label: ringDisplayLabel(ri),
            color: ri === 4 ? OUTER_COLOR : RING_COLORS[ri],
            rows: filtered.filter(function(e) { return e.ringIdx === ri; })
                          .sort(function(a, b) { return a.start - b.start; }),
          };
        })
        .filter(function(s) { return s.rows.length > 0; })
    : [{ label: null, color: null, rows: sorted }];

  const omittedUnparseable = DKEYS.filter(function(key) {
    return parseRanges(DATA[key].dates) === null;
  });
  const omittedAncient = DKEYS.filter(function(key) {
    const r = parseRanges(DATA[key].dates);
    if (!r) return false;
    return r.every(function(range) { return range.end < 1700; });
  });

  // Axis spans the active zoom window (defaulting to 1700 → present). When
  // zoomed, the bounds are exactly the preset's from/to so the chart fills
  // the available width.
  const minYear = zoomPreset.from;
  const maxYear = zoomPreset.to !== null
    ? zoomPreset.to
    : Math.max.apply(null, allEntries.map(function(e) { return e.end; }).concat([ELC.end]));
  const span = Math.max(1, maxYear - minYear);

  const W = 1000;
  const PAD_L = isMobile ? 150 : 200;
  const PAD_R = 16;
  const ROW_H = 30;
  const SECTION_GAP = 24;
  const TOP = 8;
  const AXIS_H = 44;
  const BOTTOM = 16;
  const innerW = W - PAD_L - PAD_R;
  function xFor(year) { return PAD_L + ((year - minYear) / span) * innerW; }

  // Compute total height: sum row heights + section gaps + headers.
  let totalRows = 0;
  sections.forEach(function(s) { totalRows += s.rows.length; });
  const headerH = viewMode === "ring" ? 24 : 0;
  const sectionsH = sections.length * (headerH + SECTION_GAP) + totalRows * ROW_H;
  const H = TOP + sectionsH + BOTTOM;

  // Tick marks: pick a step appropriate to the zoom span so we get
  // ~5–10 ticks visible (10y for short zooms, up to 50y for the full view).
  const tickStep = span <= 60 ? 10 : span <= 120 ? 20 : span <= 250 ? 25 : 50;
  const firstTick = Math.ceil(minYear / tickStep) * tickStep;
  const ticks = [];
  for (let y = firstTick; y <= maxYear; y += tickStep) ticks.push(y);

  return (
    <Page current="timeline" theme={theme} onToggleTheme={onToggleTheme} width="1100px">
      <style>{".tl-row:focus { outline: none; } .tl-row:focus-visible .tl-hit, .tl-row:hover .tl-hit { fill: var(--accent-faint); stroke: var(--accent); stroke-width: 2; }"}</style>
        <h1 style={{
          color: ACCENT,
          fontSize: isMobile ? "34px" : "44px",
          fontWeight: 600,
          margin: "0 0 8px",
          letterSpacing: "0.005em",
          lineHeight: 1.1
        }}>
          Timeline
        </h1>
        <p style={{ color: TX_SOFT, fontSize: isMobile ? "16px" : "18px", margin: "0 0 6px", maxWidth: "46em", lineHeight: 1.45, fontStyle: "italic" }}>
          Figures plotted by lifespan from 1700 onward, with Cabot's lifetime shaded. Select a row to open that entry.
        </p>
        <p style={{ color: MUTED, fontSize: "15px", margin: "0 0 20px" }}>
          The bars show lifespans only; they do not show who influenced whom. A full list of figures is on the <a href={hrefFor({ name: "figures" })}>A to Z page</a>.
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: "16px"
        }}>
          <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "4px" }}>View</span>
          <button type="button" className="elc-btn" aria-pressed={viewMode === "chrono"} onClick={function() { setViewMode("chrono"); }}>Chronological</button>
          <button type="button" className="elc-btn" aria-pressed={viewMode === "ring"} onClick={function() { setViewMode("ring"); }}>By Ring</button>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: "16px"
        }}>
          <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "4px" }}>Rings</span>
          {[0, 1, 2, 3, 4].map(function(ri) {
            const enabled = enabledRings[ri];
            const c = ri === 4 ? OUTER_COLOR : RING_COLORS[ri];
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
                    if (!next.some(Boolean)) return prev; // never zero
                    return next;
                  });
                }}>
                <span aria-hidden="true" style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: enabled ? c : "transparent", border: "1.5px solid " + c, marginRight: "6px", verticalAlign: "middle", boxSizing: "border-box" }} />
                {ringDisplayLabel(ri)}
              </button>
            );
          })}
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: "16px"
        }}>
          <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "4px" }}>Region</span>
          {[
            ["all","All"],
            ["American-NE","Am · NE"],
            ["American-Other","Am · Other"],
            ["British","British"],
            ["French","French"],
            ["German","German"],
            ["Greek","Greek"],
            ["Other","Other"],
          ].map(function(opt) {
            const pressed = regionF === opt[0];
            return (
              <button key={opt[0]}
                type="button"
                className="elc-btn"
                aria-pressed={pressed}
                style={{ fontSize: "14px", padding: "5px 10px", opacity: pressed ? 1 : 0.7 }}
                onClick={function() { setRegionF(opt[0]); }}>
                {opt[1]}
              </button>
            );
          })}
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: "16px"
        }}>
          <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "4px" }}>Zoom</span>
          {ZOOM_PRESETS.map(function(p) {
            const pressed = zoomId === p.id;
            return (
              <button key={p.id}
                type="button"
                className="elc-btn"
                aria-pressed={pressed}
                style={{ fontSize: "14px", padding: "5px 10px", opacity: pressed ? 1 : 0.7 }}
                onClick={function() { setZoomId(p.id); }}>
                {p.label}
              </button>
            );
          })}
        </div>

        <div tabIndex={0} role="region" aria-label="Timeline chart; scrolls within its frame" style={{
          background: SURF,
          border: "1px solid " + BORD,
          borderRadius: "6px",
          overflow: "auto",
          maxHeight: "78vh"
        }}>
          <div style={{ minWidth: isMobile ? "640px" : "auto" }}>
          <div aria-hidden="true" style={{ position: "sticky", top: 0, zIndex: 2, background: SURF, borderBottom: "1px solid " + BORD }}>
            <svg viewBox={"0 0 " + W + " " + AXIS_H} style={{ width: "100%", height: "auto", display: "block" }}>
              {ticks.map(function(year) {
                const label = year < 0 ? Math.abs(year) + " BC" : String(year);
                return <text key={year} x={xFor(year)} y={AXIS_H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize="13" fontFamily="'EB Garamond', Georgia, serif">{label}</text>;
              })}
              <text x={(xFor(ELC.start) + xFor(ELC.end)) / 2} y={16} textAnchor="middle" fill={ACCENT}
                fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" fontSize="14" letterSpacing="2">
                Cabot · {ELC.start}-{ELC.end}
              </text>
            </svg>
          </div>
          <svg
            viewBox={"0 0 " + W + " " + H}
            style={{ width: "100%", height: "auto", display: "block" }}
            role="group"
            aria-label="Timeline of figures by lifespan, with Cabot's lifetime highlighted. Each row is a link to that figure's entry.">

            {ticks.map(function(year) {
              const x = xFor(year);
              return <line key={year} x1={x} x2={x} y1={0} y2={H - BOTTOM + 4} stroke="var(--rule)" strokeWidth="1" strokeOpacity="0.5" />;
            })}

            <rect
              x={xFor(ELC.start)} y={0}
              width={Math.max(2, xFor(ELC.end) - xFor(ELC.start))}
              height={H - BOTTOM}
              fill={GOLD} fillOpacity="0.13" />
            <line
              x1={xFor(ELC.start)} x2={xFor(ELC.start)}
              y1={0} y2={H - BOTTOM}
              stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="3 3" />
            <line
              x1={xFor(ELC.end)} x2={xFor(ELC.end)}
              y1={0} y2={H - BOTTOM}
              stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="3 3" />

            {(function() {
              const rendered = [];
              let cursor = TOP;
              sections.forEach(function(section, si) {
                if (viewMode === "ring" && section.label) {
                  rendered.push(
                    <g key={"head-" + si}>
                      <text x={PAD_L - 8} y={cursor + 16} textAnchor="end"
                        fill="var(--text)"
                        fontFamily="'Cormorant Garamond', Georgia, serif"
                        fontSize="16" fontWeight="600" letterSpacing="2">
                        {section.label}
                      </text>
                      <line x1={PAD_L} x2={W - PAD_R} y1={cursor + 22} y2={cursor + 22}
                        stroke={section.color} strokeWidth="0.8" strokeOpacity="0.45" />
                    </g>
                  );
                  cursor += headerH;
                }
                section.rows.forEach(function(e, i) {
                  const y = cursor;
                  const xs = xFor(e.start);
                  const xe = xFor(e.end);
                  const w = Math.max(4, xe - xs);
                  const labelY = y + ROW_H / 2 + 4;
                  // The label is the short name only, so it always fits the margin;
                  // the full name, dates, and title are in the link's accessible name and tooltip.
                  const description = fullName(e.key) + e.suffix + ", " + e.dates.replace(/[\u2013\u2014]/g, "-") + (e.title ? ", " + e.title : "");
                  const rowId = si + "-" + i;
                  const active = activeRow === rowId;
                  rendered.push(
                    <a key={"row-" + rowId}
                      href={hrefFor({ name: "figure", figure: e.key })}
                      aria-label={description}
                      className="tl-row"
                      onFocus={function() { setActiveRow(rowId); }} onBlur={function() { setActiveRow(null); }}
                      onMouseEnter={function() { setActiveRow(rowId); }} onMouseLeave={function() { setActiveRow(null); }}
                      style={{ cursor: "pointer" }}>
                      <title>{description}</title>
                      {i % 2 === 1 && <rect x={0} y={y} width={W} height={ROW_H} fill="var(--text)" fillOpacity="0.045" />}
                      <rect x={0} y={y} width={W} height={ROW_H} fill="transparent" className="tl-hit" />
                      <text x={PAD_L - 8} y={labelY} textAnchor="end"
                        fill="var(--text)"
                        fontFamily="'EB Garamond', Georgia, serif"
                        fontSize={isMobile ? "13" : "14"}>
                        {e.key + e.suffix}
                      </text>
                      <rect x={xs} y={y + 6} width={w} height={ROW_H - 12}
                        rx="3"
                        fill={e.color}
                        opacity="0.85" />
                      {active && (
                        <text x={xe + 8 > W - 90 ? xs - 8 : xe + 8} y={labelY} textAnchor={xe + 8 > W - 90 ? "end" : "start"}
                          fill="var(--text)" fontSize="13" fontFamily="'EB Garamond', Georgia, serif">
                          {e.dates.replace(/[\u2013\u2014]/g, "-")}
                        </text>
                      )}
                    </a>
                  );
                  cursor += ROW_H;
                });
                cursor += SECTION_GAP;
              });
              return rendered;
            })()}
          </svg>
          </div>
        </div>

        <div style={{ marginTop: "18px" }}>
          {omittedAncient.length > 0 && (
            <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", margin: "0 0 6px" }}>
              Figures before 1700 appear on the Map only: {omittedAncient.join(", ")}.
            </p>
          )}
          {omittedUnparseable.length > 0 && (
            <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", margin: 0 }}>
              Entries without a single lifespan are omitted: {omittedUnparseable.join(", ")}.
            </p>
          )}
        </div>
    </Page>
  );
}
