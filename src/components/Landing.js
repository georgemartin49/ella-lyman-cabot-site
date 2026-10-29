import useIsMobile from "../hooks/useIsMobile";
import {
  BG, SURF, BORD, ACCENT, ACCENT_SOFT,
  TX, TX_SOFT, MUTED, WARN, WARN_BG, WARN_BORDER,
  RING_COLORS, OUTER_COLOR
} from "../theme";
import { hrefFor } from "../router";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
import useRecentlyViewed from "../hooks/useRecentlyViewed";
import { DATA } from "../data/figures";
import { fullName } from "../data/connections";
import { EDITOR, BOOKS, ARCHIVES } from "../data/writings";

const sharedStyles = `
  .lp-link {
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease;
  }
  .lp-link:hover, .lp-link:focus-visible {
    background: var(--accent-faint);
    border-color: var(--accent);
  }
  .lp-link:focus-visible { box-shadow: 0 0 0 2px var(--accent); }
  .lp-prose p { color: var(--text); font-size: 19px; line-height: 1.7; margin: 0 0 14px; }
  .lp-prose p:last-child { margin-bottom: 0; }
  .lp-cite { font-size: 18px; line-height: 1.6; margin: 0 0 12px; padding-left: 1.4em; text-indent: -1.4em; }
  .lp-cite .lp-src { display: block; text-indent: 0; font-size: 15px; color: var(--text-soft); }
`;

const COL = "720px";
const panel = { background: SURF, borderRadius: "6px", border: "1px solid " + BORD, padding: "22px 24px" };

function Cite({ item }) {
  return (
    <p className="lp-cite">
      <em>{item.title}</em>. {item.cite}
      {item.link && <span className="lp-src"><a href={item.link[1]} target="_blank" rel="noopener noreferrer">{item.link[0]}</a></span>}
    </p>
  );
}

function ToolLink({ route, title, children }) {
  return (
    <a className="lp-link" href={hrefFor({ name: route })}
      style={{ display: "block", background: SURF, border: "1px solid " + BORD, borderRadius: "6px", padding: "18px 22px", color: TX }}>
      <span style={{ display: "block", color: ACCENT, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "23px", fontWeight: 600, marginBottom: "4px" }}>{title}</span>
      <span style={{ display: "block", color: TX_SOFT, fontSize: "17px", lineHeight: 1.55 }}>{children}</span>
    </a>
  );
}

export default function Landing({ theme, onToggleTheme }) {
  const isMobile = useIsMobile();
  const recent = useRecentlyViewed().filter(function(k) { return DATA[k]; });

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{sharedStyles}</style>
      <a href="#landing-main" className="elc-skip">Skip to content</a>

      <div style={{ maxWidth: COL, margin: "0 auto", padding: isMobile ? "16px 16px 0" : "20px 24px 0", display: "flex", justifyContent: "flex-end" }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <main id="landing-main" tabIndex={-1} style={{
        padding: isMobile ? "24px 16px 64px" : "40px 24px 96px",
        maxWidth: COL, margin: "0 auto", width: "100%", boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: "28px"
      }}>

        <header style={{ textAlign: "center" }}>
          <p style={{ color: ACCENT, fontSize: "13px", letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>
            1866 - 1934
          </p>
          <h1 style={{ color: ACCENT, fontSize: isMobile ? "44px" : "60px", fontWeight: 600, margin: 0, letterSpacing: "0.005em", lineHeight: 1.05 }}>
            Ella Lyman Cabot
          </h1>
          <p style={{ color: TX_SOFT, fontStyle: "italic", fontSize: isMobile ? "18px" : "20px", margin: "16px 0 0", lineHeight: 1.4 }}>
            Philosopher and ethics educator
          </p>
          <p style={{ color: TX_SOFT, fontSize: "16px", margin: "14px 0 0" }}>
            A research resource edited by <a href={EDITOR.site}>{EDITOR.name}</a>
          </p>
        </header>

        <div aria-hidden="true" style={{ textAlign: "center", color: ACCENT_SOFT, fontSize: "22px", letterSpacing: "0.4em", margin: "0" }}>· · ·</div>

        <section aria-labelledby="bio" style={panel} className="lp-prose">
          <h2 id="bio" className="elc-eyebrow">Her life</h2>
          <p>
            Ella Lyman Cabot was born in Boston in 1866, the fourth of seven children of Arthur Theodore Lyman and Ella Lowell Lyman.
            She studied philosophy as a special student at Radcliffe from 1889 to 1891, beginning with George Herbert Palmer's
            course in ethics, and took graduate courses at Harvard from 1897 to 1903, where she studied with Josiah Royce. She was
            not able to receive a degree for this work.
          </p>
          <p>
            In 1894 she married Richard Clarke Cabot, the physician and later Harvard professor of social ethics; their
            correspondence is a lifelong philosophical exchange. From 1897 she taught ethics and applied psychology in Boston
            schools and at Pine Manor, and directed the Sunday school at King's Chapel. She served on the governing boards of
            Radcliffe College from 1902 and on the Massachusetts Board of Education from 1905 until her death. Between 1906 and
            1929 she published seven books on ethics and the moral education of children, along with many articles and pamphlets.
            She died in Boston on September 20, 1934.
          </p>
          <p style={{ fontSize: "15px", color: TX_SOFT }}>
            Sources: the biographical note in the <a href={ARCHIVES[0].link[1]} target="_blank" rel="noopener noreferrer">finding aid for her papers</a> at
            the Schlesinger Library, and the Cabot papers described below.
          </p>
        </section>

        <section aria-labelledby="ideas" style={panel} className="lp-prose">
          <h2 id="ideas" className="elc-eyebrow">Her philosophical interests</h2>
          <p>
            Cabot's writings examine love, individuality, moral growth, and education within the intellectual setting of American
            idealism and pragmatism. She studied first with Palmer and then for five years with Royce, who wrote out for her a
            scheme of study on the concept of growth. That scheme framed the book on growth she worked on and left unfinished.
          </p>
          <p>
            Her published books bring this philosophy to teaching. <em>Everyday Ethics</em> (1906), her principal philosophical
            text, draws on Palmer and Royce; <em>Ethics for Children</em> (1910) and <em>Seven Ages of Childhood</em> (1921)
            address the moral education of children; <em>Temptations to Rightdoing</em> (1929), her last book, distinguishes loyalty,
            allegiance, and prejudice. Her unpublished manuscripts, letters, notebooks, and poems carry the same questions further, and are the
            subject of the edition described below.
          </p>
          <p style={{ fontSize: "16px", color: TX_SOFT }}>
            The editor's account of what Cabot takes selfhood to require, the conditions of selfhood referred to in some entries
            of the Web, is being prepared for publication and will be added here with its textual references.
          </p>
        </section>

        <section aria-labelledby="read" style={panel}>
          <h2 id="read" className="elc-eyebrow">Read her writings</h2>
          {BOOKS.map(function(b) { return <Cite key={b.title} item={b} />; })}
          <h3 className="elc-eyebrow" style={{ marginTop: "18px" }}>Archival collections</h3>
          {ARCHIVES.map(function(a) { return <Cite key={a.title} item={a} />; })}
        </section>

        <section aria-labelledby="edition" style={panel} className="lp-prose">
          <h2 id="edition" className="elc-eyebrow">This resource and the edition</h2>
          <p>
            {EDITOR.name} is developing a comprehensive critical edition of Cabot's surviving writings: her published books,
            philosophical manuscripts, correspondence, poetry, and notebooks. This site is a companion research resource. Its
            entries record the people around her and the thinkers her work can be compared with, together with the archival
            evidence for each connection, as the work toward the edition proceeds.
          </p>
          <p>
            <a href={EDITOR.edition}>About the Cabot edition</a>
            <span aria-hidden="true" style={{ margin: "0 10px", color: MUTED }}>·</span>
            <a href={EDITOR.contact}>Contact the editor</a>
          </p>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="recent" style={{ ...panel, padding: "20px 22px" }}>
            <h2 id="recent" className="elc-eyebrow">Continue exploring</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {recent.map(function(key) {
                const f = DATA[key];
                const c = f.ring === 5 ? OUTER_COLOR : (RING_COLORS[f.ring - 1] || RING_COLORS[0]);
                return (
                  <a key={key} className="lp-link" href={hrefFor({ name: "figure", figure: key })}
                    style={{ display: "inline-block", background: BG, border: "1px solid " + BORD, borderRadius: "4px", padding: "6px 12px", color: TX, fontSize: "16px" }}>
                    <span aria-hidden="true" style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: c, marginRight: "8px", verticalAlign: "middle" }} />
                    {fullName(key)}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <nav aria-labelledby="explore" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 id="explore" className="elc-eyebrow">Research tools</h2>
          <ToolLink route="web" title="The Philosophical Web">
            A map of the figures around Cabot. Each figure's ring shows how close the editor judges their position to hers; a
            separate label shows whether she knew or read them.
          </ToolLink>
          <ToolLink route="figures" title="Figures A to Z">
            Every figure in alphabetical order, with full names, searchable, and linked to their entries.
          </ToolLink>
          <ToolLink route="timeline" title="Timeline">
            The same figures by lifespan, with Cabot's lifetime marked.
          </ToolLink>
        </nav>

        <aside role="note" style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: WARN_BG, border: "1px solid " + WARN_BORDER, borderRadius: "6px", padding: "10px 14px" }}>
          <span aria-hidden="true" style={{ color: WARN, fontSize: "16px", flexShrink: 0, lineHeight: 1.4 }}>⚠</span>
          <p style={{ color: TX_SOFT, fontSize: "14px", lineHeight: 1.55, margin: 0 }}>
            <strong style={{ color: WARN }}>A work in progress.</strong> Entries are being revised so that each documentary claim
            carries its own citation. Entries with claims still awaiting archival verification are flagged individually.
          </p>
        </aside>

      </main>
      <Footer inset={COL} />
    </div>
  );
}
