import { useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA } from "../data/figures";
import {
  BG, SURF, BORD, ACCENT, ACCENT_FAINT,
  TX, TX_SOFT, MUTED, WARN, WARN_BG, WARN_BORDER,
  RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor, navigate } from "../router";
import ThemeToggle from "./ThemeToggle";

const detailStyles = `
  .pw-back { transition: background 200ms ease, border-color 200ms ease, color 200ms ease; }
  .pw-back:hover, .pw-back:focus-visible {
    border-color: var(--accent);
    color: var(--accent);
    outline: none;
  }
  .pw-back:focus-visible { box-shadow: 0 0 0 2px var(--accent-faint-strong); }
  .pw-skip { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
  .pw-skip:focus { left: 16px; top: 16px; width: auto; height: auto; padding: 8px 14px; background: var(--accent); color: var(--bg); border-radius: 4px; font-weight: bold; z-index: 100; }
  .pw-figure-link { color: inherit; text-decoration: none; transition: opacity 200ms ease; }
  .pw-figure-link:hover, .pw-figure-link:focus-visible { opacity: 0.78; outline: none; text-decoration: underline; }
`;

const headingFont = "'Cormorant Garamond', Georgia, serif";
const bodyFont = "'EB Garamond', Georgia, serif";

export default function DetailView({ name, theme, onToggleTheme }) {
  const fig = DATA[name];
  const isMobile = useIsMobile();

  useEffect(function() {
    function onKey(e) { if (e.key === "Escape") navigate({ name: "web" }); }
    window.addEventListener("keydown", onKey);
    return function() { window.removeEventListener("keydown", onKey); };
  }, []);

  if (!fig) {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: TX, padding: "40px", textAlign: "center" }}>
        <style>{detailStyles}</style>
        <p style={{ color: TX_SOFT, fontSize: "18px", marginBottom: "20px" }}>
          No entry found for <strong style={{ color: TX }}>{name}</strong>.
        </p>
        <a href={hrefFor({ name: "web" })} className="pw-back" style={{
          display: "inline-block",
          background: "transparent",
          border: "1px solid " + BORD,
          color: TX,
          padding: "10px 18px",
          borderRadius: "4px",
          fontSize: "16px",
          textDecoration: "none",
          fontFamily: bodyFont
        }}>← Back to the Web</a>
      </div>
    );
  }

  const isOuter = fig.ring === 5;
  const ringColor = isOuter ? OUTER_COLOR : (RING_COLORS[fig.ring - 1] || RING_COLORS[0]);
  const ringLabel = isOuter ? "Outer" : "Ring " + fig.ring;

  const headerInline = isMobile
    ? { display: "flex", flexDirection: "column", alignItems: "stretch", gap: "12px" }
    : { display: "flex", alignItems: "center", gap: "16px" };

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", color: TX }}>
      <style>{detailStyles}</style>
      <a href="#detail-main" className="pw-skip">Skip to content</a>

      <header style={{ background: SURF, borderBottom: "1px solid " + BORD, padding: isMobile ? "16px" : "16px 24px", ...headerInline }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <a
            href={hrefFor({ name: "web" })}
            aria-label="Back to philosophical web"
            className="pw-back"
            style={{
              background: "transparent",
              border: "1px solid " + BORD,
              color: TX,
              padding: "9px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontFamily: bodyFont,
              lineHeight: 1.2,
              flexShrink: 0,
              textDecoration: "none",
              display: "inline-block"
            }}>
            ← Back
          </a>
          {isMobile && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{
            color: ACCENT,
            fontFamily: headingFont,
            fontSize: isMobile ? "28px" : "34px",
            fontWeight: 600,
            margin: 0,
            letterSpacing: "0.005em",
            lineHeight: 1.15
          }}>{name}</h2>
          <p style={{ color: TX_SOFT, fontSize: "15px", margin: "4px 0 0", lineHeight: 1.4, fontStyle: "italic" }}>
            {ringLabel} · {fig.dates} · <span style={{ color: ringColor }}>{fig.title}</span>
          </p>
        </div>
        {!isMobile && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
      </header>

      <main id="detail-main" style={{ padding: isMobile ? "20px 16px" : "32px 24px", maxWidth: "780px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "20px" }}>

        {!fig.confirmed && (
          <aside role="note" style={{
            background: WARN_BG,
            borderRadius: "6px",
            border: "1px solid " + WARN_BORDER,
            padding: "14px 18px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start"
          }}>
            <span aria-hidden="true" style={{ color: WARN, fontSize: "22px", flexShrink: 0, lineHeight: 1 }}>⚠</span>
            <div>
              <p style={{ color: WARN, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.16em", margin: "0 0 4px", fontWeight: 600 }}>Still Being Updated</p>
              <p style={{ color: TX_SOFT, fontSize: "16px", lineHeight: 1.55, margin: 0 }}>
                {fig.unconfirmedNote || "Some claims in this entry are working hypotheses or inferences pending further archival verification."}
              </p>
            </div>
          </aside>
        )}

        <section aria-label="Their position" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
          <h3 style={{ color: ACCENT, fontFamily: headingFont, fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px", fontWeight: 600 }}>Their Position</h3>
          <p style={{ color: TX, fontSize: "18px", lineHeight: 1.7, margin: 0 }}>{fig.desc}</p>
        </section>

        <section aria-label="Connection to ELC" style={{ background: ACCENT_FAINT, borderRadius: "6px", border: "1px solid var(--accent-soft)", padding: "20px 22px" }}>
          <h3 style={{ color: ACCENT, fontFamily: headingFont, fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px", fontWeight: 600 }}>★ Connection to ELC</h3>
          <p style={{ color: TX, fontSize: "18px", lineHeight: 1.7, margin: 0 }}>{fig.elc}</p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
          <section aria-label="Influences on them" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
            <h3 style={{ color: ACCENT, fontFamily: headingFont, fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>Influences On Them</h3>
            {fig.inf.map(function(item, i) {
              return (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <span style={{ color: TX, fontSize: "17px", fontWeight: 600 }}>{item[0]}</span>
                  <span style={{ color: MUTED, fontSize: "15px", display: "block", lineHeight: 1.5 }}>{item[1]}</span>
                </div>
              );
            })}
          </section>
          <section aria-label="Transmissions toward ELC" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
            <h3 style={{ color: ACCENT, fontFamily: headingFont, fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>Transmissions Toward ELC</h3>
            {fig.out.map(function(item, i) {
              const isELC = item[0] === "ELC";
              const targetKey = DATA[item[0]] ? item[0] : null;
              const labelEl = (
                <span style={{ color: isELC ? ACCENT : ringColor, fontSize: "17px", fontWeight: 600 }}>
                  {isELC ? "★ ELC" : item[0]}
                </span>
              );
              return (
                <div key={i} style={{ marginBottom: "12px" }}>
                  {targetKey
                    ? <a href={hrefFor({ name: "figure", figure: targetKey })} className="pw-figure-link">{labelEl}</a>
                    : labelEl}
                  <span style={{ color: MUTED, fontSize: "15px", display: "block", lineHeight: 1.5 }}>{item[1]}</span>
                </div>
              );
            })}
          </section>
        </div>

        <section aria-label="Lineage flow" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
          <h3 style={{ color: ACCENT, fontFamily: headingFont, fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>Lineage Flow</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {fig.inf.slice(0, 3).map(function(item, i) {
              return (
                <span key={i} style={{ background: BG, border: "1px solid " + BORD, borderRadius: "4px", padding: "6px 12px", color: TX_SOFT, fontSize: "15px" }}>
                  {item[0]}
                </span>
              );
            })}
            <span aria-hidden="true" style={{ color: MUTED, fontSize: "20px" }}>→</span>
            <span style={{ background: ringColor + "22", border: "1px solid " + ringColor, borderRadius: "4px", padding: "6px 14px", color: ringColor, fontSize: "16px", fontWeight: 600 }}>
              {name}
            </span>
            <span aria-hidden="true" style={{ color: MUTED, fontSize: "20px" }}>→</span>
            {fig.out.slice(-2).map(function(item, i) {
              const isELC = item[0] === "ELC";
              return (
                <span key={i} style={{ background: isELC ? ACCENT_FAINT : BG, border: "1px solid " + (isELC ? ACCENT : BORD), borderRadius: "4px", padding: "6px 12px", color: isELC ? ACCENT : TX, fontSize: "15px", fontWeight: isELC ? 600 : 400 }}>
                  {item[0]}
                </span>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
