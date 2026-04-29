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
  const dash = "[–-]"; // en-dash or hyphen

  // "372–289 BC"
  let m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*(\\d+)\\s*BC$"));
  if (m) return [{ start: -parseInt(m[1], 10), end: -parseInt(m[2], 10) }];

  // "50–135 / 121–180 AD" (or without AD)
  m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*(\\d+)\\s*/\\s*(\\d+)\\s*" + dash + "\\s*(\\d+)(?:\\s*AD)?$"));
  if (m) return [
    { start: +m[1], end: +m[2] },
    { start: +m[3], end: +m[4] }
  ];

  // "1952–" (still living)
  m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*$"));
  if (m) return [{ start: +m[1], end: new Date().getFullYear() }];

  // "1803–1882"
  m = s.match(new RegExp("^(\\d+)\\s*" + dash + "\\s*(\\d+)$"));
  if (m) return [{ start: +m[1], end: +m[2] }];

  return null;
}

function ringColorFor(fig) {
  if (fig.ring === 5) return OUTER_COLOR;
  return RING_COLORS[fig.ring - 1] || RING_COLORS[0];
}

// ELC's own dates.
const ELC = { start: 1866, end: 1934 };

export default function Timeline({ theme, onToggleTheme }) {
  const isMobile = useIsMobile();

  // Build entries with parsed ranges, ELC included as a synthetic centerpiece.
  const entries = [];
  DKEYS.forEach(function(key) {
    const fig = DATA[key];
    const ranges = parseRanges(fig.dates);
    if (!ranges) return;
    ranges.forEach(function(r, idx) {
      entries.push({
        key,
        ring: fig.ring,
        title: fig.title,
        dates: fig.dates,
        start: r.start,
        end: r.end,
        suffix: ranges.length > 1 ? " (" + (idx + 1) + ")" : "",
        color: ringColorFor(fig),
      });
    });
  });
  entries.sort(function(a, b) { return a.start - b.start; });

  const omitted = DKEYS.filter(function(key) {
    return parseRanges(DATA[key].dates) === null;
  });

  const minYear = Math.min.apply(null, entries.map(function(e) { return e.start; }).concat([ELC.start]));
  const maxYear = Math.max.apply(null, entries.map(function(e) { return e.end; }).concat([ELC.end]));
  const span = maxYear - minYear;

  // SVG geometry.
  const W = 1000;
  const PAD_L = isMobile ? 90 : 130;
  const PAD_R = 16;
  const ROW_H = 22;
  const TOP = 60;
  const BOTTOM = 16;
  const innerW = W - PAD_L - PAD_R;
  const H = TOP + entries.length * ROW_H + BOTTOM;
  function xFor(year) { return PAD_L + ((year - minYear) / span) * innerW; }

  // Tick marks at sensible years: every 200 years from rounded down minYear to maxYear.
  const tickStep = span > 1500 ? 200 : 100;
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
        <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", margin: "0 0 24px", textAlign: "center" }}>
          A complementary view to the Philosophical Web — lineage by century rather than by ring.
        </p>

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

            {entries.map(function(e, i) {
              const y = TOP + i * ROW_H;
              const xs = xFor(e.start);
              const xe = xFor(e.end);
              const w = Math.max(3, xe - xs);
              return (
                <g key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={"View " + e.key + ", " + e.dates}
                  onClick={function() { navigate({ name: "figure", figure: e.key }); }}
                  onKeyDown={function(ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); navigate({ name: "figure", figure: e.key }); } }}
                  style={{ cursor: "pointer" }}>
                  <text
                    x={PAD_L - 8} y={y + 12}
                    textAnchor="end"
                    fill="var(--text)"
                    fontFamily="'EB Garamond', Georgia, serif"
                    fontSize="13">
                    {e.key + e.suffix}
                  </text>
                  <rect
                    x={xs} y={y + 4}
                    width={w} height={ROW_H - 8}
                    rx="2"
                    fill={e.color}
                    opacity="0.78" />
                </g>
              );
            })}
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
