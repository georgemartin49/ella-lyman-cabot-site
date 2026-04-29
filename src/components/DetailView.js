import { useEffect, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { DATA, CITED_BY } from "../data/figures";
import { RINGS_CFG, OUTER_CFG } from "../data/rings";
import {
  BG, SURF, BORD, ACCENT, ACCENT_FAINT,
  TX, TX_SOFT, MUTED, WARN, WARN_BG, WARN_BORDER,
  RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor, navigate } from "../router";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
import { recordView } from "../hooks/useRecentlyViewed";

// Find the prev/next figure (with data) in the same ring as `name`.
function findSiblings(name) {
  const allRings = RINGS_CFG.map(function(r) { return r.nodes; }).concat([OUTER_CFG.nodes]);
  for (let r = 0; r < allRings.length; r++) {
    const idx = allRings[r].indexOf(name);
    if (idx === -1) continue;
    const ring = allRings[r];
    function step(start, dir) {
      let i = start;
      for (let k = 0; k < ring.length; k++) {
        i = (i + dir + ring.length) % ring.length;
        if (DATA[ring[i]]) return ring[i];
      }
      return null;
    }
    return { prev: step(idx, -1), next: step(idx, 1) };
  }
  return { prev: null, next: null };
}

const COL = "720px";

export default function DetailView({ name, theme, onToggleTheme }) {
  const fig = DATA[name];
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);

  useEffect(function() {
    function onKey(e) { if (e.key === "Escape") navigate({ name: "web" }); }
    window.addEventListener("keydown", onKey);
    return function() { window.removeEventListener("keydown", onKey); };
  }, []);

  useEffect(function() { if (DATA[name]) recordView(name); }, [name]);

  function copyLink() {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(function() {
      setCopied(true);
      setTimeout(function() { setCopied(false); }, 1600);
    });
  }

  // Web Share API on supporting platforms (mobile Safari, Android Chrome,
  // recent desktop browsers). Falls back to copy-link silently elsewhere.
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  function shareLink() {
    if (!canShare) { copyLink(); return; }
    navigator.share({
      title: name + " · Ella Lyman Cabot",
      text: fig ? (fig.title + " — " + fig.dates) : name,
      url: window.location.href,
    }).catch(function() { /* user cancelled */ });
  }

  if (!fig) {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: TX, padding: "40px", textAlign: "center" }}>
        <p style={{ color: TX_SOFT, fontSize: "18px", marginBottom: "20px" }}>
          No entry found for <strong style={{ color: TX }}>{name}</strong>.
        </p>
        <a href={hrefFor({ name: "web" })} className="elc-btn">← Back to the Web</a>
      </div>
    );
  }

  const isOuter = fig.ring === 5;
  const ringColor = isOuter ? OUTER_COLOR : (RING_COLORS[fig.ring - 1] || RING_COLORS[0]);
  const ringLabel = isOuter ? "Ring V" : "Ring " + fig.ring;
  const siblings = findSiblings(name);
  const citedBy = CITED_BY[name] || [];

  const headerInline = isMobile
    ? { display: "flex", flexDirection: "column", alignItems: "stretch", gap: "12px" }
    : { display: "flex", alignItems: "center", gap: "16px" };

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", color: TX }}>
      <a href="#detail-main" className="elc-skip">Skip to content</a>

      <header style={{ background: SURF, borderBottom: "1px solid " + BORD, padding: isMobile ? "16px" : "16px 24px", ...headerInline }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
          <a
            href={hrefFor({ name: "web" })}
            aria-label="Back to philosophical web"
            className="elc-btn">
            ← Back
          </a>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button type="button" className="elc-btn" aria-live="polite" onClick={copyLink}>
              {copied ? "✓ Copied" : "Copy link"}
            </button>
            {canShare && (
              <button type="button" className="elc-btn" onClick={shareLink}>
                Share
              </button>
            )}
            {isMobile && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
          </div>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <nav aria-label="Breadcrumb" style={{ marginBottom: "4px", fontSize: "13px", color: MUTED, lineHeight: 1.4 }}>
            <a href={hrefFor({ name: "landing" })} style={{ color: MUTED, textDecoration: "none", borderBottom: "1px dotted currentColor" }}>Home</a>
            <span aria-hidden="true" style={{ margin: "0 6px" }}>›</span>
            <a href={hrefFor({ name: "web" })} style={{ color: MUTED, textDecoration: "none", borderBottom: "1px dotted currentColor" }}>Web</a>
            <span aria-hidden="true" style={{ margin: "0 6px" }}>›</span>
            <span style={{ color: ringColor }}>{ringLabel}</span>
          </nav>
          <h2 style={{
            color: ACCENT,
            fontSize: isMobile ? "28px" : "34px",
            fontWeight: 600,
            margin: 0,
            letterSpacing: "0.005em",
            lineHeight: 1.15
          }}>{name}</h2>
          <p style={{ color: TX_SOFT, fontSize: "15px", margin: "4px 0 0", lineHeight: 1.4, fontStyle: "italic" }}>
            {fig.dates} · <span style={{ color: ringColor }}>{fig.title}</span>
          </p>
        </div>
        {!isMobile && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
      </header>

      <main id="detail-main" style={{ padding: isMobile ? "20px 16px" : "32px 24px", maxWidth: COL, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "20px" }}>

        {!fig.confirmed && (
          <aside role="note" style={{
            background: WARN_BG,
            borderRadius: "6px",
            border: "1px solid " + WARN_BORDER,
            padding: "12px 16px",
            display: "flex",
            gap: "10px",
            alignItems: "flex-start"
          }}>
            <span aria-hidden="true" style={{ color: WARN, fontSize: "18px", flexShrink: 0, lineHeight: 1.2 }}>⚠</span>
            <div>
              <p style={{ color: WARN, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.16em", margin: "0 0 4px", fontWeight: 600 }}>Still Being Updated</p>
              <p style={{ color: TX_SOFT, fontSize: "15px", lineHeight: 1.55, margin: 0 }}>
                {fig.unconfirmedNote || "Some claims in this entry are working hypotheses or inferences pending further archival verification."}
              </p>
            </div>
          </aside>
        )}

        <section aria-label="Their position" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
          <h3 className="elc-eyebrow">Their Position</h3>
          <p style={{ color: TX, fontSize: "18px", lineHeight: 1.7, margin: 0 }}>{fig.desc}</p>
        </section>

        <section aria-label="Connection to ELC" style={{ background: ACCENT_FAINT, borderRadius: "6px", border: "1px solid var(--accent-border)", padding: "20px 22px" }}>
          <h3 className="elc-eyebrow">★ Connection to ELC</h3>
          <p style={{ color: TX, fontSize: "18px", lineHeight: 1.7, margin: 0 }}>{fig.elc}</p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
          <section aria-label="Influences on them" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
            <h3 className="elc-eyebrow">Influences On Them</h3>
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
            <h3 className="elc-eyebrow">Transmissions Toward ELC</h3>
            {fig.out.map(function(item, i) {
              const isELC = item[0] === "ELC";
              const targetKey = DATA[item[0]] ? item[0] : null;
              const inner = (
                <>
                  <span style={{ color: isELC ? ACCENT : ringColor, fontSize: "17px", fontWeight: 600 }}>
                    {isELC ? "★ ELC" : item[0]}
                    {targetKey && <span aria-hidden="true" style={{ color: MUTED, marginLeft: "6px", fontSize: "13px", fontWeight: 400 }}>→</span>}
                  </span>
                  <span style={{ color: MUTED, fontSize: "15px", display: "block", lineHeight: 1.5 }}>{item[1]}</span>
                </>
              );
              return (
                <div key={i} style={{ marginBottom: "8px" }}>
                  {targetKey
                    ? <a href={hrefFor({ name: "figure", figure: targetKey })} className="elc-figure-link">{inner}</a>
                    : <div style={{ padding: "4px 8px", margin: "-4px -8px 6px" }}>{inner}</div>}
                </div>
              );
            })}
          </section>
        </div>

        <section aria-label="Lineage flow" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
          <h3 className="elc-eyebrow">Lineage Flow</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {fig.inf.slice(0, 3).map(function(item, i) {
              return (
                <span key={i} style={{ background: BG, border: "1px solid " + BORD, borderRadius: "4px", padding: "6px 12px", color: TX, fontSize: "15px" }}>
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

        {fig.works && fig.works.length > 0 && (
          <section aria-label="Selected works" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
            <h3 className="elc-eyebrow">Selected Works</h3>
            {fig.works.map(function(item, i) {
              return (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <span style={{ color: TX, fontSize: "16px", fontWeight: 600 }}>{item[0]}</span>
                  <span style={{ color: MUTED, fontSize: "14px", display: "block", lineHeight: 1.5, fontStyle: "italic" }}>{item[1]}</span>
                </div>
              );
            })}
          </section>
        )}

        {fig.archives && fig.archives.length > 0 && (
          <section aria-label="Archives" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
            <h3 className="elc-eyebrow">Archives</h3>
            {fig.archives.map(function(item, i) {
              return (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <span style={{ color: TX, fontSize: "16px", fontWeight: 600, display: "block" }}>{item[0]}</span>
                  {item.length > 2 && (
                    <span style={{ color: TX_SOFT, fontSize: "14px", display: "block" }}>{item[1]}</span>
                  )}
                  <span style={{ color: MUTED, fontSize: "14px", display: "block", lineHeight: 1.5 }}>{item.length > 2 ? item[2] : item[1]}</span>
                </div>
              );
            })}
          </section>
        )}

        {citedBy.length > 0 && (
          <section aria-label="Cited by other entries" style={{ background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "20px 22px" }}>
            <h3 className="elc-eyebrow">Cited by</h3>
            <p style={{ color: MUTED, fontSize: "14px", margin: "0 0 14px", fontStyle: "italic" }}>
              Figures whose entry treats {name} as an influence or reference point.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {citedBy.map(function(item, i) {
                const fromFig = DATA[item.from];
                const fromColor = (fromFig.ring === 5 ? OUTER_COLOR : RING_COLORS[fromFig.ring - 1] || RING_COLORS[0]);
                return (
                  <a key={i} href={hrefFor({ name: "figure", figure: item.from })} className="elc-figure-link">
                    <span style={{ color: fromColor, fontSize: "17px", fontWeight: 600 }}>
                      {item.from}
                      <span aria-hidden="true" style={{ color: MUTED, marginLeft: "6px", fontSize: "13px", fontWeight: 400 }}>→</span>
                    </span>
                    <span style={{ color: MUTED, fontSize: "15px", display: "block", lineHeight: 1.5 }}>{item.note}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {(siblings.prev || siblings.next) && (
          <nav aria-label={"Other figures in " + ringLabel} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "stretch",
            gap: "12px",
            marginTop: "8px"
          }}>
            <div style={{ flex: 1, display: "flex" }}>
              {siblings.prev && (
                <a
                  href={hrefFor({ name: "figure", figure: siblings.prev })}
                  className="elc-figure-link"
                  style={{
                    flex: 1,
                    border: "1px solid " + BORD,
                    borderRadius: "6px",
                    padding: "12px 14px",
                    margin: 0
                  }}>
                  <span style={{ display: "block", color: MUTED, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "4px" }}>
                    ← Previous in {ringLabel}
                  </span>
                  <span style={{ display: "block", color: TX, fontSize: "17px", fontWeight: 600 }}>
                    {siblings.prev}
                  </span>
                </a>
              )}
            </div>
            <div style={{ flex: 1, display: "flex" }}>
              {siblings.next && (
                <a
                  href={hrefFor({ name: "figure", figure: siblings.next })}
                  className="elc-figure-link"
                  style={{
                    flex: 1,
                    border: "1px solid " + BORD,
                    borderRadius: "6px",
                    padding: "12px 14px",
                    margin: 0,
                    textAlign: "right"
                  }}>
                  <span style={{ display: "block", color: MUTED, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "4px" }}>
                    Next in {ringLabel} →
                  </span>
                  <span style={{ display: "block", color: TX, fontSize: "17px", fontWeight: 600 }}>
                    {siblings.next}
                  </span>
                </a>
              )}
            </div>
          </nav>
        )}

      </main>
      <Footer inset={COL} />
    </div>
  );
}
