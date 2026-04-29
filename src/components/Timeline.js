import { useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA, DKEYS } from "../data/figures";
import {
  BG, SURF, BORD, ACCENT, TX, TX_SOFT, MUTED, GOLD,
  RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor, navigate } from "../router";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";

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

  // View mode: "chrono" sorts every figure by birth year on a single axis;
  // "ring" groups figures into Ring I–V sections. Both kept; chrono is default.
  const [viewMode, setViewMode] = useState("chrono");
  // 5 rings; each can be toggled on/off. Default all on.
  const [enabledRings, setEnabledRings] = useState([true, true, true, true, true]);

  // Build full set of entries with parsed ranges.
  const allEntries = [];
  DKEYS.forEach(function(key) {
    const fig = DATA[key];
    const ranges = parseRanges(fig.dates);
    if (!ranges) return;
    ranges.forEach(function(r, idx) {
      allEntries.push({
        key,
        ringIdx: fig.ring - 1, // 0-4
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

  const omitted = DKEYS.filter(function(key) {
    return parseRanges(DATA[key].dates) === null;
  });

  // Year axis spans whole unfiltered range (so the axis stays steady when
  // toggling rings — only the rows change).
  const minYear = Math.min.apply(null, allEntries.map(function(e) { return e.start; }).concat([ELC.start]));
  const maxYear = Math.max.apply(null, allEntries.map(function(e) { return e.end; }).concat([ELC.end]));
  const span = maxYear - minYear;

  const W = 1000;
  const PAD_L = isMobile ? 96 : 200;
  const PAD_R = 16;
  const ROW_H = 30;
  const SECTION_GAP = 24;
  const TOP = 60;
  const BOTTOM = 16;
  const innerW = W - PAD_L - PAD_R;
  function xFor(year) { return PAD_L + ((year - minYear) / span) * innerW; }

  // Compute total height: sum row heights + section gaps + headers.
  let totalRows = 0;
  sections.forEach(function(s) { totalRows += s.rows.length; });
  const headerH = viewMode === "ring" ? 24 : 0;
  const sectionsH = sections.length * (headerH + SECTION_GAP) + totalRows * ROW_H;
  const H = TOP + sectionsH + BOTTOM;

  // Tick marks: 50y everywhere when span > 600y; 25y on phone when span ≤ 600.
  const tickStep = span > 800 ? 100 : (isMobile && span <= 400 ? 25 : 50);
  const firstTick = Math.ceil(minYear / tickStep) * tickStep;
  const ticks = [];
  for (let y = firstTick; y <= maxYear; y += tickStep) ticks.push(y);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX, display: "flex", flexDirection: "column" }}>
      <a href="#timeline-main" className="elc-skip">Skip to content</a>

      <div style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: isMobile ? "16px 14px 0" : "28px 20px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        boxSizing: "border-box"
      }}>
        <a href={hrefFor({ name: "landing" })} className="elc-btn">← Home</a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <main id="timeline-main" style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: isMobile ? "20px 14px 32px" : "32px 20px 48px",
        boxSizing: "border-box"
      }}>
        <h1 style={{
          color: ACCENT,
          fontSize: isMobile ? "34px" : "44px",
          fontWeight: 600,
          margin: "0 0 8px",
          letterSpacing: "0.005em",
          textAlign: "center",
          lineHeight: 1.1
        }}>
          A Timeline
        </h1>
        <p style={{ color: TX_SOFT, fontSize: isMobile ? "16px" : "18px", margin: "0 auto 6px", textAlign: "center", maxWidth: "640px", lineHeight: 1.45, fontStyle: "italic" }}>
          Each figure plotted by lifespan. ELC marked. Tap any bar to open that entry.
        </p>
        <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", margin: "0 0 20px", textAlign: "center" }}>
          A complementary view to the Philosophical Web — lineage by century rather than by ring.
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          justifyContent: "center",
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
          justifyContent: "center",
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
          background: SURF,
          border: "1px solid " + BORD,
          borderRadius: "6px",
          padding: "12px",
          overflowX: "auto"
        }}>
          <svg
            viewBox={"0 0 " + W + " " + H}
            style={{ width: "100%", height: "auto", minWidth: isMobile ? "640px" : "auto", display: "block" }}
            role="img"
            aria-label="Timeline of figures by lifespan, with ELC's lifespan highlighted">

            {ticks.map(function(year) {
              const x = xFor(year);
              const label = year < 0 ? Math.abs(year) + " BC" : String(year);
              return (
                <g key={year}>
                  <line x1={x} x2={x} y1={TOP - 8} y2={H - BOTTOM + 4}
                    stroke="var(--rule)" strokeWidth="1" strokeOpacity="0.5" />
                  <text x={x} y={TOP - 14} textAnchor="middle" fill="var(--text-muted)" fontSize="13"
                    fontFamily="'EB Garamond', Georgia, serif">{label}</text>
                </g>
              );
            })}

            <rect
              x={xFor(ELC.start)} y={TOP - 4}
              width={Math.max(2, xFor(ELC.end) - xFor(ELC.start))}
              height={H - TOP - BOTTOM + 4}
              fill={GOLD} fillOpacity="0.13" />
            <line
              x1={xFor(ELC.start)} x2={xFor(ELC.start)}
              y1={TOP - 4} y2={H - BOTTOM}
              stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="3 3" />
            <line
              x1={xFor(ELC.end)} x2={xFor(ELC.end)}
              y1={TOP - 4} y2={H - BOTTOM}
              stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="3 3" />
            <text
              x={(xFor(ELC.start) + xFor(ELC.end)) / 2}
              y={TOP - 28}
              textAnchor="middle"
              fill={ACCENT}
              fontFamily="'Cormorant Garamond', Georgia, serif"
              fontWeight="600"
              fontSize="14"
              letterSpacing="2">
              ELC · {ELC.start}–{ELC.end}
            </text>

            {(function() {
              const rendered = [];
              let cursor = TOP;
              sections.forEach(function(section, si) {
                if (viewMode === "ring" && section.label) {
                  rendered.push(
                    <g key={"head-" + si}>
                      <text x={PAD_L - 8} y={cursor + 16} textAnchor="end"
                        fill={section.color}
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
                  // Compose label: "Name — Title" if it'll fit; else just name.
                  const fullLabel = e.key + e.suffix + (e.title ? "  ·  " + e.title : "");
                  rendered.push(
                    <g key={"row-" + si + "-" + i}
                      role="button"
                      tabIndex={0}
                      aria-label={"View " + e.key + ", " + e.dates + (e.title ? ", " + e.title : "")}
                      onClick={function() { navigate({ name: "figure", figure: e.key }); }}
                      onKeyDown={function(ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); navigate({ name: "figure", figure: e.key }); } }}
                      style={{ cursor: "pointer" }}>
                      <rect x={0} y={y} width={W} height={ROW_H} fill="transparent" />
                      <text x={PAD_L - 8} y={labelY} textAnchor="end"
                        fill="var(--text)"
                        fontFamily="'EB Garamond', Georgia, serif"
                        fontSize={isMobile ? "13" : "14"}>
                        {isMobile ? (e.key + e.suffix) : fullLabel}
                      </text>
                      <rect x={xs} y={y + 6} width={w} height={ROW_H - 12}
                        rx="3"
                        fill={e.color}
                        opacity="0.85" />
                      {/* Year endpoints inside the bar when it's wide enough */}
                      {w > 60 && (
                        <text x={xs + 6} y={labelY} fill="var(--bg)" fontSize="11" fontFamily="'EB Garamond', Georgia, serif" opacity="0.85">
                          {e.start < 0 ? Math.abs(e.start) + " BC" : e.start}
                        </text>
                      )}
                    </g>
                  );
                  cursor += ROW_H;
                });
                cursor += SECTION_GAP;
              });
              return rendered;
            })()}
          </svg>
        </div>

        <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", textAlign: "center", marginTop: "18px" }}>
          {omitted.length > 0
            ? omitted.length + " figure" + (omitted.length === 1 ? "" : "s") + " (Ubuntu and similar non-pinpointable entries) omitted from this view."
            : "All figures shown."}
        </p>
      </main>

      <Footer inset="1100px" />
    </div>
  );
}
