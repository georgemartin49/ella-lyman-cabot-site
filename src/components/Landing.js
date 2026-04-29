import useIsMobile from "../hooks/useIsMobile";
import {
  BG, SURF, BORD, RULE, ACCENT, ACCENT_SOFT,
  TX, TX_SOFT, MUTED, WARN, WARN_BG, WARN_BORDER,
  RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor } from "../router";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
import useRecentlyViewed from "../hooks/useRecentlyViewed";
import { DATA } from "../data/figures";

const sharedStyles = `
  .lp-link {
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease;
  }
  .lp-link:hover, .lp-link:focus-visible {
    background: var(--accent-faint);
    border-color: var(--accent);
    outline: none;
  }
  .lp-link:focus-visible { box-shadow: 0 0 0 2px var(--accent-faint-strong); }
`;

const COL = "720px";

export default function Landing({ theme, onToggleTheme }) {
  const isMobile = useIsMobile();
  const recent = useRecentlyViewed().filter(function(k) { return DATA[k]; });

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{sharedStyles}</style>
      <a href="#landing-main" className="elc-skip">Skip to content</a>

      <div style={{
        maxWidth: COL,
        margin: "0 auto",
        padding: isMobile ? "16px 16px 0" : "20px 24px 0",
        display: "flex",
        justifyContent: "flex-end"
      }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <main id="landing-main" style={{
        padding: isMobile ? "24px 16px 64px" : "40px 24px 96px",
        maxWidth: COL,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "32px"
      }}>

        <header style={{ textAlign: "center" }}>
          <p style={{
            color: ACCENT,
            fontSize: "13px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            margin: "0 0 14px",
            fontWeight: 600
          }}>
            1866 — 1934
          </p>
          <h1 style={{
            color: ACCENT,
            fontSize: isMobile ? "44px" : "60px",
            fontWeight: 600,
            margin: 0,
            letterSpacing: "0.005em",
            lineHeight: 1.05
          }}>
            Ella Lyman Cabot
          </h1>
          <p style={{
            color: TX_SOFT,
            fontStyle: "italic",
            fontSize: isMobile ? "18px" : "20px",
            margin: "16px 0 0",
            lineHeight: 1.4
          }}>
            Interest, the Achieved Self, and the Conditions of Selfhood
          </p>
        </header>

        <div aria-hidden="true" style={{
          textAlign: "center",
          color: ACCENT_SOFT,
          fontSize: "22px",
          letterSpacing: "0.4em",
          margin: "8px 0"
        }}>· · ·</div>

        <section aria-labelledby="about-site" style={{
          background: SURF,
          borderRadius: "6px",
          border: "1px solid " + BORD,
          padding: "22px 24px"
        }}>
          <h2 id="about-site" className="elc-eyebrow">About this site</h2>
          <p style={{ color: TX, fontSize: "19px", lineHeight: 1.7, margin: 0 }}>
            This is the working site for the recovery of Ella Lyman Cabot's philosophical project.
            At present it hosts <strong>The Philosophical Web</strong> — an interactive map of the
            thinkers who shaped her work and the figures across other traditions whose own accounts
            of selfhood converge with hers. Each node opens a page describing that figure's
            position, their connection to ELC, and the lineages flowing into and out of their
            thought. The site is a working document; further material — biography, primary texts,
            and commentary on her five conditions — will be added over time.
          </p>
        </section>

        <section aria-labelledby="bio" style={{
          background: SURF,
          borderRadius: "6px",
          border: "1px solid " + BORD,
          padding: "22px 24px"
        }}>
          <h2 id="bio" className="elc-eyebrow">Biography</h2>
          <p style={{ color: TX_SOFT, fontSize: "18px", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
            A full biographical essay is in preparation and will appear here.
          </p>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="recent" style={{
            background: SURF,
            borderRadius: "6px",
            border: "1px solid " + BORD,
            padding: "20px 22px"
          }}>
            <h2 id="recent" className="elc-eyebrow">Continue exploring</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {recent.map(function(key) {
                const f = DATA[key];
                const c = f.ring === 5 ? OUTER_COLOR : (RING_COLORS[f.ring - 1] || RING_COLORS[0]);
                return (
                  <a key={key}
                    className="lp-link"
                    href={hrefFor({ name: "figure", figure: key })}
                    style={{
                      display: "inline-block",
                      background: BG,
                      border: "1px solid " + BORD,
                      borderRadius: "4px",
                      padding: "6px 12px",
                      color: TX,
                      fontSize: "16px"
                    }}>
                    <span aria-hidden="true" style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: c, marginRight: "8px", verticalAlign: "middle" }} />
                    {key}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <nav aria-label="Site sections" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h2 className="elc-eyebrow">Explore</h2>

          <a
            className="lp-link"
            href={hrefFor({ name: "web" })}
            style={{
              display: "block",
              background: SURF,
              border: "1px solid " + BORD,
              borderRadius: "6px",
              padding: "22px 24px",
              color: TX
            }}>
            <span style={{
              display: "block",
              color: ACCENT,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "6px"
            }}>
              The Philosophical Web →
            </span>
            <span style={{ display: "block", color: TX_SOFT, fontSize: "17px", lineHeight: 1.55 }}>
              An interactive map of the figures connected to ELC, organised in concentric rings
              from closest allies to thinkers across other traditions who arrived at convergent
              positions.
            </span>
          </a>

          <a
            className="lp-link"
            href={hrefFor({ name: "timeline" })}
            style={{
              display: "block",
              background: SURF,
              border: "1px solid " + BORD,
              borderRadius: "6px",
              padding: "22px 24px",
              color: TX
            }}>
            <span style={{
              display: "block",
              color: ACCENT,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "6px"
            }}>
              A Timeline →
            </span>
            <span style={{ display: "block", color: TX_SOFT, fontSize: "17px", lineHeight: 1.55 }}>
              The same figures plotted by lifespan, with ELC's century marked. A complementary
              view: lineage by time rather than by ring.
            </span>
          </a>

          <div
            aria-disabled="true"
            style={{
              display: "block",
              background: "transparent",
              border: "1px dashed " + RULE,
              borderRadius: "6px",
              padding: "20px 22px",
              opacity: 0.78
            }}>
            <span style={{
              display: "block",
              color: TX_SOFT,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "4px"
            }}>
              The Five Conditions
            </span>
            <span style={{ display: "block", fontSize: "15px", lineHeight: 1.55, fontStyle: "italic", color: MUTED }}>
              Coming soon — an essay on ELC's account of what genuine selfhood requires.
            </span>
          </div>

          <div
            aria-disabled="true"
            style={{
              display: "block",
              background: "transparent",
              border: "1px dashed " + RULE,
              borderRadius: "6px",
              padding: "20px 22px",
              opacity: 0.78
            }}>
            <span style={{
              display: "block",
              color: TX_SOFT,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "4px"
            }}>
              Selected Writings &amp; Poems
            </span>
            <span style={{ display: "block", fontSize: "15px", lineHeight: 1.55, fontStyle: "italic", color: MUTED }}>
              Coming soon — primary texts from ELC's prose and poetry.
            </span>
          </div>
        </nav>

        <aside role="note" style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          background: WARN_BG,
          border: "1px solid " + WARN_BORDER,
          borderRadius: "6px",
          padding: "10px 14px"
        }}>
          <span aria-hidden="true" style={{ color: WARN, fontSize: "16px", flexShrink: 0, lineHeight: 1.4 }}>⚠</span>
          <p style={{ color: TX_SOFT, fontSize: "13.5px", lineHeight: 1.55, margin: 0 }}>
            <strong style={{ color: WARN }}>Still being updated.</strong> Some entries contain
            working hypotheses or inferences pending archival verification; these are flagged
            individually inside the Web.
          </p>
        </aside>

      </main>
      <Footer inset={COL} />
    </div>
  );
}
