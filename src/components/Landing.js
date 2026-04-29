import useIsMobile from "../hooks/useIsMobile";
import { BG, SURF, BORD, GOLD, MUTED, TX, WARN } from "../theme";
import { hrefFor } from "../router";

const sharedStyles = `
  .lp-link {
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
  }
  .lp-link:hover, .lp-link:focus-visible {
    background: rgba(212,168,64,0.10);
    border-color: ${GOLD};
    outline: none;
  }
  .lp-link:focus-visible {
    box-shadow: 0 0 0 2px rgba(212,168,64,0.5);
  }
  .lp-skip { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
  .lp-skip:focus { left: 16px; top: 16px; width: auto; height: auto; padding: 8px 14px; background: ${GOLD}; color: ${BG}; border-radius: 6px; font-weight: bold; z-index: 100; }
`;

function SectionHeading({ children }) {
  return (
    <h2 style={{
      color: MUTED,
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      margin: "0 0 12px",
      fontWeight: "bold"
    }}>{children}</h2>
  );
}

export default function Landing() {
  const isMobile = useIsMobile();

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "Georgia, serif", color: TX }}>
      <style>{sharedStyles}</style>
      <a href="#landing-main" className="lp-skip">Skip to content</a>

      <main id="landing-main" style={{
        padding: isMobile ? "32px 16px" : "56px 24px",
        maxWidth: "780px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "28px"
      }}>

        <header style={{ textAlign: "center" }}>
          <p style={{ color: GOLD, fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 10px", fontWeight: "bold" }}>
            1866 — 1934
          </p>
          <h1 style={{
            color: "#E8D5A0",
            fontSize: isMobile ? "36px" : "48px",
            fontWeight: "bold",
            margin: 0,
            letterSpacing: "0.02em",
            lineHeight: 1.15
          }}>
            Ella Lyman Cabot
          </h1>
          <p style={{ color: MUTED, fontSize: isMobile ? "16px" : "18px", margin: "10px 0 0", fontStyle: "italic" }}>
            Interest, the Achieved Self, and the Conditions of Selfhood
          </p>
        </header>

        <section aria-labelledby="about-site" style={{ background: SURF, borderRadius: "10px", border: "1px solid " + BORD, padding: "20px 22px" }}>
          <h2 id="about-site" style={{ color: MUTED, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px", fontWeight: "bold" }}>
            About this site
          </h2>
          <p style={{ color: TX, fontSize: "18px", lineHeight: 1.7, margin: 0 }}>
            This is the working site for the recovery of Ella Lyman Cabot's philosophical project.
            At present it hosts <strong>The Philosophical Web</strong> — an interactive map of the
            thinkers who shaped her work and the figures across other traditions whose own accounts
            of selfhood converge with hers. Each node opens a page describing that figure's
            position, their connection to ELC, and the lineages flowing into and out of their
            thought. The site is a working document; further material — biography, primary texts,
            and commentary on her five conditions — will be added over time.
          </p>
        </section>

        <section aria-labelledby="bio" style={{ background: SURF, borderRadius: "10px", border: "1px solid " + BORD, padding: "20px 22px" }}>
          <SectionHeading>Biography</SectionHeading>
          <p style={{ color: MUTED, fontSize: "17px", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
            A full biographical essay is in preparation and will appear here.
          </p>
        </section>

        <nav aria-label="Site sections" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <SectionHeading>Explore</SectionHeading>

          <a
            className="lp-link"
            href={hrefFor({ name: "web" })}
            style={{
              display: "block",
              background: SURF,
              border: "1px solid " + BORD,
              borderRadius: "10px",
              padding: "20px 22px",
              color: TX
            }}>
            <span style={{ display: "block", color: GOLD, fontSize: "20px", fontWeight: "bold", marginBottom: "6px" }}>
              The Philosophical Web →
            </span>
            <span style={{ display: "block", color: MUTED, fontSize: "16px", lineHeight: 1.55 }}>
              An interactive map of the figures connected to ELC, organised in concentric rings
              from closest allies to thinkers across other traditions who arrived at convergent
              positions.
            </span>
          </a>

          <div
            aria-disabled="true"
            style={{
              display: "block",
              background: "rgba(15,17,32,0.5)",
              border: "1px dashed " + BORD,
              borderRadius: "10px",
              padding: "20px 22px",
              color: MUTED,
              opacity: 0.75
            }}>
            <span style={{ display: "block", color: "#A0A8BE", fontSize: "18px", fontWeight: "bold", marginBottom: "6px" }}>
              The Five Conditions
            </span>
            <span style={{ display: "block", fontSize: "15px", lineHeight: 1.55, fontStyle: "italic" }}>
              Coming soon — an essay on ELC's account of what genuine selfhood requires.
            </span>
          </div>

          <div
            aria-disabled="true"
            style={{
              display: "block",
              background: "rgba(15,17,32,0.5)",
              border: "1px dashed " + BORD,
              borderRadius: "10px",
              padding: "20px 22px",
              color: MUTED,
              opacity: 0.75
            }}>
            <span style={{ display: "block", color: "#A0A8BE", fontSize: "18px", fontWeight: "bold", marginBottom: "6px" }}>
              Selected Writings &amp; Poems
            </span>
            <span style={{ display: "block", fontSize: "15px", lineHeight: 1.55, fontStyle: "italic" }}>
              Coming soon — primary texts from ELC's prose and poetry.
            </span>
          </div>
        </nav>

        <aside role="note" style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          background: "rgba(192,120,64,0.08)",
          border: "1px solid rgba(192,120,64,0.25)",
          borderRadius: "8px",
          padding: "12px 16px"
        }}>
          <span aria-hidden="true" style={{ color: WARN, fontSize: "18px", flexShrink: 0, lineHeight: 1.2 }}>⚠</span>
          <p style={{ color: "#9E8E78", fontSize: "14px", lineHeight: 1.55, margin: 0 }}>
            <strong style={{ color: WARN }}>Still being updated.</strong> Some entries contain
            working hypotheses or inferences pending archival verification; these are flagged
            individually inside the Web.
          </p>
        </aside>

      </main>
    </div>
  );
}
