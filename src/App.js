import { useState, useEffect } from "react";
import PhilosophicalWeb from "./PhilosophicalWeb";

// ── RESOURCES DATA -- edit to update ───────────────────────────────
const PRIMARY = [
  { author: "Ella Lyman Cabot", title: "Everyday Ethics", year: "1906", type: "Book", note: "Primary philosophical text; synthesizes Palmer and Royce into a pragmatist-feminist ethics of moral growth." },
  { author: "Ella Lyman Cabot", title: "Temptations to Rightdoing", year: "1929", type: "Book", note: "Final major work; develops the loyalty/allegiance/prejudice distinction." },
  { author: "Ella Lyman Cabot", title: "Seven Suggestions to Parents", year: "", type: "Book", note: "" },
  { author: "Ella Lyman Cabot", title: "A Course in Citizenship", year: "1914", type: "Book", note: "" },
  { author: "Richard Clarke Cabot", title: "What Men Live By", year: "1914", type: "Book", note: "" },
  { author: "Richard Clarke Cabot", title: "The Meaning of Right and Wrong", year: "1933", type: "Book", note: "RCC's final philosophical work; engages the agreements debate with Perry and Hocking." },
  { author: "Richard Clarke Cabot", title: "Adventures on the Borderland of Ethics", year: "1926", type: "Book", note: "" },
  { author: "Ada Peirce McCormick", title: "Research materials on Richard Clarke Cabot", year: "", type: "Archival, Harvard University Archives (HUG 4255.80)", note: "25 containers. APM was a primary witness to ELC and RCC over several decades." },
];
const SECONDARY = [
  { author: "Jacob B. Castleberry (ed.)", title: "Ella Lyman Cabot (Edited Volume)", year: "Forthcoming", type: "Edited volume", venue: "Philosophy for Children Forebears, Routledge" },
  { author: "Jacob B. Castleberry", title: "Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot", year: "Forthcoming", type: "Journal article", venue: "The Pluralist" },
  { author: "Jacob B. Castleberry", title: "Ella Lyman Cabot: Teaching for Royce's Beloved Community", year: "Forthcoming 2027", type: "Journal article", venue: "Philosophy of Education" },
  { author: "Jacob B. Castleberry", title: "Reasonable Communities: P4C and Peace Education", year: "2023", type: "Book chapter", venue: "Cultivating Reasonableness in Education: Community of Philosophical Inquiry, Springer" },
  { author: "Jacob B. Castleberry and Kevin M. Clark", title: "Expanding the Facilitator's Toolbox: Vygotskian Mediation in Philosophy for Children", year: "2020", type: "Journal article", venue: "Analytic Teaching and Philosophical Praxis" },
  { author: "Samantha Matherne", title: "Ella Lyman Cabot's Everyday Ethics", year: "2023", type: "Book chapter", venue: "Oxford Handbook of American and British Women Philosophers in the Nineteenth Century, Oxford University Press" },
  { author: "Diana Heney", title: "Cabot on Virtue", year: "2023", type: "Journal article", venue: "History of Philosophy Quarterly" },
  { author: "John Kaag", title: "Idealism, Pragmatism, and Feminism: The Philosophy of Ella Lyman Cabot", year: "2011", type: "Book", venue: "Lexington Books" },
];

// ── TOKENS ── derived from ELC's actual book bindings ─────────────
// Everyday Ethics (1906): deep wine/burgundy cloth
// Ethics for Children (1910) + Temptations to Rightdoing (1929): dusty slate blue
// All bindings: aged gilt gold lettering on warm cream pages
const C = {
  cream:    "#f5efe4",  // warm page-cream background
  creamDark:"#ede4d4",  // slightly darker cream for callouts
  wine:     "#5c1515",  // Everyday Ethics binding — headings, nav (11.66:1 on cream, AAA)
  wineDeep: "#4a1010",  // deeper wine for nav (13.37:1 on cream, AAA)
  wineHover:"#6b1a1a",  // hover state
  ink:      "#1a1209",  // near-black with warm undertone — body text (16.18:1, AAA)
  inkSub:   "#3a2a1a",  // warm dark secondary
  muted:    "#3d2a18",  // warm brown muted text (6.80:1 on cream, AAA)
  mutedLight:"#4f3c28", // lighter muted (4.55:1 on cream, AA)
  gold:     "#c9a84c",  // aged gilt — DECORATIVE ONLY, never text (fails contrast as text)
  slate:    "#3a5a7a",  // dusty slate blue from Ethics for Children (6.28:1, AAA)
  slateDeep:"#2a4a6a",  // deeper slate for links (8.03:1, AAA)
  border:   "#d4c9b8",  // warm taupe border
  borderDark:"#c4b9a8", // darker warm border
  navCream: "#f0e8d8",  // cream text on wine nav (10.26:1, AAA)
  navGold:  "#e8c97a",  // gilt gold on wine nav (7.31:1, AAA)
  newsSlate:"#3a5a7a",  // slate for news strip accent
  newsBg:   "#edf1f5",  // very light slate tint for news strip
};
const SERIF   = "'Spectral', Georgia, 'Times New Roman', serif";
const LABEL   = "'Cormorant SC', Georgia, serif";
const DISPLAY = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
// SANS removed — this design uses serif and small-caps throughout for period coherence
const SANS = LABEL; // alias for backward compat with existing JSX references

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Cormorant+SC:wght@400;500;600&family=Spectral:ital,wght@0,400;0,500;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

#site-root {
  background: #f5efe4 !important;
  color: #1a1209 !important;
  color-scheme: light !important;
  min-height: 100vh;
  font-family: ${SERIF};
  font-size: 20px;
  line-height: 1.65;
  -webkit-text-size-adjust: 100%;
}

/* ── Skip nav ── */
.skip-link { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
.skip-link:focus {
  position: fixed; top: 0; left: 0; width: auto; height: auto;
  padding: 0.5rem 1.2rem; background: #4a1010 !important; color: #f0e8d8 !important;
  z-index: 9999; font-family: ${LABEL}; font-size: 0.88rem; letter-spacing: 0.06em;
  text-decoration: none; outline: none;
}

/* ── Nav ── */
.nav-wrap {
  background: #5c1515 !important;
  border-bottom: 2px solid #c9a84c;
  position: sticky; top: 0; z-index: 200;
}
.nav-inner { max-width: 860px; margin: 0 auto; padding: 0 1.4rem; height: 58px; display: flex; align-items: center; justify-content: space-between; }
.nav-logo {
  font-family: ${DISPLAY};
  font-size: 1rem; font-weight: 400; font-style: italic;
  color: #f0e8d8 !important; background: none; border: none; cursor: pointer;
  letter-spacing: 0.02em;
}
.nav-logo:hover { color: #e8c97a !important; }
.nav-links { display: flex; list-style: none; }
.nav-btn {
  font-family: ${LABEL};
  font-size: 0.86rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(240,232,216,0.7) !important; background: none; border: none;
  border-bottom: 2px solid transparent; cursor: pointer;
  padding: 0 12px; height: 58px; display: flex; align-items: center;
  transition: color 0.18s, border-color 0.18s; white-space: nowrap;
}
.nav-btn:hover { color: #f0e8d8 !important; }
.nav-btn.active { color: #f0e8d8 !important; border-bottom-color: #c9a84c; }
.nav-btn:focus-visible { outline: 2px solid #e8c97a; outline-offset: -2px; }

/* ── Hamburger ── */
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
.hamburger span { display: block; width: 24px; height: 1.5px; background: #f0e8d8; border-radius: 1px; transition: transform 0.22s, opacity 0.22s; }
.mob-nav { display: none; background: #4a1010 !important; }
.mob-nav.open { display: block; }
.mob-btn {
  display: block; width: 100%;
  font-family: ${LABEL}; font-size: 0.92rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(240,232,216,0.75) !important; background: none; border: none;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0.85rem 1.4rem; text-align: left; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mob-btn:hover, .mob-btn.active { background: rgba(255,255,255,0.08) !important; color: #f0e8d8 !important; }

/* ── Layout ── */
.page { max-width: 860px; margin: 0 auto; padding: 3.5rem 1.5rem 5.5rem; background: #f5efe4 !important; }
.page-fullbleed { max-width: 100%; margin: 0; padding: 0; background: transparent; }
.sec { animation: enter 0.5s ease both; }
@keyframes enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* ── Typography ── */
h1 {
  font-family: ${DISPLAY}; font-weight: 300; font-style: italic;
  font-size: clamp(2.4rem, 5.5vw, 3.6rem); line-height: 1.05;
  color: #5c1515 !important; letter-spacing: -0.01em;
}
h2 {
  font-family: ${DISPLAY}; font-weight: 600;
  font-size: clamp(1.45rem, 3vw, 2rem); line-height: 1.2;
  color: #5c1515 !important; margin-bottom: 0.05em;
}
h3 {
  font-family: ${LABEL}; font-weight: 700; font-size: 0.88rem;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: #3d2a18 !important; margin-bottom: 0.6rem;
}
p { font-family: ${SERIF}; font-size: 1rem; line-height: 1.8; color: #1a1209 !important; }
p + p { margin-top: 1rem; }
em { font-style: italic; }
strong { font-weight: 600; color: #1a1209 !important; }
a { color: #2a4a6a !important; text-underline-offset: 3px; }
a:hover { color: #5c1515 !important; }

/* Gold rule — decorative, like gilt on book spine */
.rule {
  width: 56px; height: 1px; background: #c9a84c;
  margin: 1.5rem 0 2rem;
}

.lead {
  font-family: ${LABEL}; font-size: 0.96rem; letter-spacing: 0.08em;
  color: #3d2a18 !important; margin: 0.4rem 0 1.6rem; line-height: 1.6;
}
.sub-label {
  font-family: ${LABEL}; font-size: 0.86rem; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: #3d2a18 !important; border-bottom: 1px solid #d4c9b8;
  padding-bottom: 0.45rem; margin-bottom: 1.2rem;
}

/* ── Callouts ── */
.callout {
  background: #ede4d4 !important; border-left: 3px solid #c9a84c;
  padding: 1.3rem 1.6rem; margin-top: 1.8rem;
}
.callout p { color: #1a1209 !important; font-size: 0.94rem; }
.callout h3 { color: #3d2a18 !important; }
.callout-dark {
  background: #4a1010 !important; padding: 1.6rem 1.8rem;
  margin-top: 1.8rem; border-top: 2px solid #c9a84c;
}
.callout-dark p { color: #f0e8d8 !important; font-size: 0.94rem; line-height: 1.75; }
.callout-dark h3 { color: #e8c97a !important; }

/* ── News strip ── */
.news-strip {
  background: #f5e8c4 !important; border-left: 3px solid #c9a84c;
  padding: 1.1rem 1.5rem; margin-bottom: 2.5rem;
}
.news-strip h3 { color: #4a1010 !important; margin-bottom: 0.6rem; }
.news-item { display: flex; gap: 0.8rem; align-items: baseline; padding: 0.3rem 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
.news-item:last-child { border-bottom: none; }
.news-date { font-family: ${LABEL}; font-size: 0.96rem; letter-spacing: 0.1em; color: #7a5c0f !important; min-width: 56px; flex-shrink: 0; }
.news-text { font-family: ${SERIF}; font-size: 0.9rem; color: #1a1209 !important; line-height: 1.75; }

/* ── Specialization chips ── */
.spec-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.7rem; }
.spec-chip {
  font-family: ${LABEL}; font-size: 0.96rem; letter-spacing: 0.08em;
  color: #4a1010 !important; background: #f0e4d4 !important;
  border: 1px solid #d4c9b8; padding: 4px 11px; line-height: 1.4;
}
.comp-chip {
  font-family: ${LABEL}; font-size: 0.96rem; letter-spacing: 0.08em;
  color: #3d2a18 !important; background: #f5efe4 !important;
  border: 1px solid #d4c9b8; padding: 4px 11px; line-height: 1.4;
}

/* ── Projects ── */
.project-list { margin-top: 1.5rem; border-top: 1px solid #d4c9b8; }
.project-item { display: flex; gap: 1rem; padding: 1.1rem 0; border-bottom: 1px solid #d4c9b8; }
.project-num { font-family: ${LABEL}; font-size: 0.96rem; letter-spacing: 0.1em; color: #c9a84c !important; min-width: 1.6rem; padding-top: 4px; }
.project-title { font-family: ${DISPLAY}; font-size: 1.04rem; font-weight: 500; color: #5c1515 !important; margin-bottom: 0.3rem; }
.project-desc { font-family: ${SERIF}; font-size: 0.94rem; line-height: 1.75; color: #3a2a1a !important; }

/* ── Publications ── */
.pub-item { padding: 1rem 0; border-bottom: 1px solid #ddd0bc; }
.pub-title { font-family: ${DISPLAY}; font-size: 1rem; font-weight: 500; color: #5c1515 !important; margin-bottom: 0.18rem; }
.pub-meta { font-family: ${LABEL}; font-size: 0.88rem; letter-spacing: 0.08em; color: #3d2a18 !important; }
.pub-note { font-family: ${SERIF}; font-size: 0.92rem; font-style: italic; color: #3a5a7a !important; margin-top: 0.14rem; }

/* ── CV ── */
.cv-sec { margin-bottom: 2rem; }
.cv-item { display: flex; gap: 0.8rem; align-items: flex-start; margin-bottom: 0.65rem; }
.cv-dot { width: 5px; height: 5px; background: #c9a84c; margin-top: 10px; flex-shrink: 0; transform: rotate(45deg); }
.cv-title { font-family: ${DISPLAY}; font-size: 1rem; font-weight: 500; color: #5c1515 !important; }
.cv-sub { font-family: ${LABEL}; font-size: 0.88rem; letter-spacing: 0.08em; color: #3d2a18 !important; margin-top: 2px; }
.cv-box { display: inline-block; border: 1px solid #d4c9b8; border-top: 2px solid #c9a84c; padding: 1.1rem 1.4rem; margin-top: 1.8rem; background: #ede4d4 !important; }
.cv-link { font-family: ${LABEL}; font-size: 0.88rem; letter-spacing: 0.1em; color: #5c1515 !important; text-decoration: underline; text-underline-offset: 3px; }
.cv-link:hover { color: #3a5a7a !important; }

/* ── Teaching ── */
.inst-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.4rem; margin-top: 0.8rem; }
.inst-item { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.55rem 0; border-bottom: 1px solid #ddd0bc; }
.inst-name { font-family: ${DISPLAY}; font-size: 0.96rem; color: #5c1515 !important; }
.inst-sub { font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.08em; color: #3d2a18 !important; margin-top: 2px; }
.teach-philosophy { font-family: ${SERIF}; font-size: 0.97rem; line-height: 1.8; color: #1a1209 !important; }
.teach-philosophy + .teach-philosophy { margin-top: 1rem; }

/* ── Contact ── */
.contact-row { display: flex; gap: 1rem; align-items: flex-start; padding: 0.85rem 0; border-bottom: 1px solid #ddd0bc; }
.contact-label { font-family: ${LABEL}; font-size: 0.96rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3d2a18 !important; min-width: 88px; padding-top: 3px; }
.contact-val { font-family: ${SERIF}; font-size: 0.96rem; color: #1a1209 !important; }
.contact-link { font-family: ${SERIF}; font-size: 0.96rem; color: #2a4a6a !important; text-underline-offset: 3px; }
.contact-link:hover { color: #5c1515 !important; }

/* ── Resources tabs ── */
.tab-row { display: flex; border-bottom: 1px solid #d4c9b8; margin-bottom: 1.3rem; }
.tab {
  font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.12em;
  text-transform: uppercase; padding: 0.55rem 1rem;
  background: none !important; border: none; border-bottom: 2px solid transparent;
  margin-bottom: -1px; cursor: pointer; color: #4f3c28 !important;
  transition: color 0.18s, border-color 0.18s;
}
.tab:hover { color: #5c1515 !important; }
.tab.active { color: #5c1515 !important; border-bottom-color: #5c1515; }
.res-item { padding: 0.8rem 0 0.8rem 1rem; border-left: 2px solid #d4c9b8; margin-bottom: 0.8rem; transition: border-color 0.22s; }
.res-item:hover { border-left-color: #c9a84c; }
.res-title { font-family: ${DISPLAY}; font-size: 1rem; font-weight: 500; color: #5c1515 !important; }
.res-year { font-family: ${SERIF}; font-size: 0.88rem; color: #3d2a18 !important; }
.res-meta { font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.08em; color: #3d2a18 !important; margin-top: 0.14rem; }
.res-note { font-family: ${SERIF}; font-size: 0.94rem; font-style: italic; color: #3a2a1a !important; margin-top: 0.2rem; }
.res-hint { font-family: ${SERIF}; font-size: 0.96rem; font-style: italic; color: #3d2a18 !important; margin-bottom: 1.1rem; }

/* ── Email ── */
.email-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.9rem; }
.email-input {
  font-family: ${SERIF}; font-size: 0.94rem; padding: 10px 13px;
  border: 1px solid rgba(201,168,76,0.5); background: #3a0e0e !important;
  color: #f0e8d8 !important; outline: none; width: 235px; max-width: 100%;
  transition: border-color 0.2s;
}
.email-input::placeholder { color: rgba(240,232,216,0.5) !important; }
.email-input:focus { border-color: #c9a84c; }
.email-btn {
  font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.12em; text-transform: uppercase;
  padding: 10px 18px; background: #c9a84c !important; color: #2a1000 !important;
  border: none; cursor: pointer; transition: background 0.18s;
}
.email-btn:hover { background: #dbbe62 !important; }
.email-confirm { font-family: ${DISPLAY}; font-size: 1rem; font-style: italic; color: #e8c97a !important; margin-top: 0.8rem; }

/* ── Back to top ── */
.back-top {
  position: fixed; bottom: 2rem; right: 1.5rem;
  width: 36px; height: 36px; background: #5c1515 !important;
  color: #f0e8d8 !important; border: 1px solid #c9a84c; cursor: pointer;
  font-family: ${SERIF}; font-size: 1rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.25s, background 0.18s; z-index: 150;
}
.back-top.visible { opacity: 1; pointer-events: auto; }
.back-top:hover { background: #4a1010 !important; }

/* ── Footer ── */
.footer { background: #4a1010 !important; border-top: 2px solid #c9a84c; padding: 1.4rem 1.5rem; }
.footer-inner { max-width: 860px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.4rem; }
.footer p { font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.06em; color: rgba(240,232,216,0.65) !important; }
.footer a { color: rgba(240,232,216,0.65) !important; }
.footer a:hover { color: #f0e8d8 !important; }

/* ── Print ── */
@media print {
  .nav-wrap, .footer, .hamburger, .mob-nav, .news-strip, .email-row, .email-btn, .back-top, .skip-link, .spec-grid { display: none !important; }
  #site-root { font-size: 11pt !important; background: white !important; color: black !important; }
  .page { max-width: 100% !important; padding: 0 !important; }
  h1, h2 { color: black !important; }
  h3, .sub-label { color: #333 !important; }
  p, .pub-meta, .cv-sub, .inst-sub, .project-desc { color: black !important; }
  .pub-title, .cv-title, .project-title, .inst-name, .res-title { color: black !important; }
  .callout { background: #f5f5f5 !important; border-left: 2pt solid #999; }
  .callout-dark { background: #f0f0f0 !important; border-top: 1pt solid #999; }
  .callout-dark p, .callout-dark h3 { color: black !important; }
  a { color: black !important; }
  .cv-dot { background: #999; }
  .project-item, .pub-item, .cv-item { page-break-inside: avoid; }
}

/* ── Responsive ── */
@media (max-width: 640px) {
  #site-root { font-size: 18px; }
  .nav-links { display: none !important; }
  .hamburger { display: flex !important; }
  .page { padding: 2rem 1.1rem 4rem; }
  .inst-grid { grid-template-columns: 1fr; }
  .footer-inner { flex-direction: column; align-items: flex-start; }
  .contact-row { flex-direction: column; gap: 0.25rem; }
  .contact-label { min-width: unset; }
  .back-top { bottom: 1.2rem; right: 1rem; }
}
`;

// ── PRIMITIVES ────────────────────────────────────────────────────
const Rule = () => <div className="rule" />;
const Label = ({ t }) => <h3>{t}</h3>;
const Dot = () => <div className="cv-dot" />;

// ── HOME ──────────────────────────────────────────────────────────
const NEWS = [
  { date: "2026", text: "Harris-Jones Prize, Society for the Advancement of American Philosophy, for \"Pluralism in Practice.\"" },
  { date: "2026", text: "\"Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot\" accepted at The Pluralist." },
  { date: "2026", text: "\"Ella Lyman Cabot: Teaching for Royce's Beloved Community\" accepted at Philosophy of Education (forthcoming 2027)." },
];

function Home() {
  return (
    <div className="sec">
      <Label t="Moral Philosopher" />
      <h1>Jacob B. Castleberry</h1>
      <p className="lead">MA Philosophy, Western Michigan University &nbsp;·&nbsp; BA, Indiana University Kokomo</p>
      <Rule />

      <div className="news-strip">
        <h3>Recent</h3>
        {NEWS.map((n, i) => (
          <div key={i} className="news-item">
            <span className="news-date">{n.date}</span>
            <span className="news-text">{n.text}</span>
          </div>
        ))}
      </div>

      <p>I am a philosopher working at the intersection of American pragmatism, feminist philosophy, history of ethics, and philosophy of education. My research centers on the recovery and philosophical reconstruction of the Boston ethics tradition, a neglected network of late nineteenth- and early twentieth-century American moral philosophy centered at Harvard and rooted in Boston Unitarian intellectual culture.</p>
      <p>The animating project of my scholarship is the recovery of <em>Ella Lyman Cabot</em> (1866–1934): ethics educator, Massachusetts Board of Education member for nearly three decades, author of eleven ethics books, and student of George Herbert Palmer and Josiah Royce at Harvard. I hold literary rights to her unpublished material through the Ella Lyman Cabot Trust and have fully digitized her papers at the Schlesinger Library, Radcliffe Institute.</p>
      <p>I am a moral philosopher working as an independent scholar. I am the recipient of the 2026 Harris-Jones Prize from the Society for the Advancement of American Philosophy.</p>

      <div style={{ marginTop: "2rem" }}>
        <div className="sub-label">Areas of Specialization</div>
        <div className="spec-grid">
          {["Pragmatist metaphysics and history of American philosophy","Metaethics","Moral responsibility","Philosophy of education"].map((s,i) => <span key={i} className="spec-chip">{s}</span>)}
        </div>
        <div style={{ marginTop: "0.65rem" }}>
          <div style={{ fontFamily: SANS, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555555", marginBottom: "0.4rem" }}>Areas of Competence</div>
          <div className="spec-grid">
            {["Epistemology","Philosophy of mind","Feminist philosophy","Ethics","Philosophy of science"].map((s,i) => <span key={i} className="comp-chip">{s}</span>)}
          </div>
        </div>
      </div>

      <div className="callout-dark" style={{ marginTop: "2rem" }}>
        <h3>The Boston Ethics Tradition Recovery Program</h3>
        <p style={{ marginTop: "0.5rem" }}>A long-range scholarly initiative recovering the philosophically serious alternative tradition in American ethics: George Herbert Palmer, Josiah Royce, Ella Lyman Cabot, and Richard Clarke Cabot, as a network of teachers and students whose work on selfhood, moral growth, and purposive agency has been unjustly neglected. All proceeds from this program are directed to the Ella Lyman Cabot Trust.</p>
      </div>
    </div>
  );
}

// ── RESEARCH ──────────────────────────────────────────────────────
const PROJECTS = [
  {
    t: "Ella Lyman Cabot (Edited Volume, Routledge)",
    d: "An edited volume in the Routledge Philosophy for Children Forebears series, which I edit. Five parts, ten primary texts, five commentary chapters, editorial introduction, and afterword. Each part pairs primary ELC texts with an original commentary chapter. Draft at 209 pages; restructuring in progress. Target manuscript: 2027–2028.",
  },
  {
    t: "Essential Writings: Oxford New Histories of Philosophy",
    d: "A critical edition of ELC's published and select unpublished texts with scholarly introduction, editorial footnotes, and cross-references to the unpublished archive. Proposed for the Oxford New Histories of Philosophy series (ed. Christia Mercer and Melvin Rogers, Oxford University Press), the series that has published comparable editions of Frances Power Cobbe, Maria W. Stewart, and Mary Ann Shadd Cary. Inquiry in progress.",
  },
  {
    t: "Cambridge Element: Women in the History of Philosophy",
    d: "A Cambridge Elements volume of approximately 20,000–30,000 words presenting my scholarly analysis of ELC's philosophy: her minimal metaphysics, purposivist moral psychology, and feminist pragmatist ethics, drawing on archival material unavailable to prior scholarship. Cambridge University Press, Women in the History of Philosophy series. Inquiry active.",
  },
  {
    t: "The Marriage of Ella Cabot (Biography)",
    d: "A full-length scholarly biography drawing on Ada Peirce McCormick's drafts, ELC's diaries and journals, and the full archival record at the Schlesinger Library and Harvard University Archives. Full scholarly annotation, archival citation, endnotes, bibliography, and editorial apparatus. Target: Harvard University Press or Oxford University Press (primary aspirational); Cambridge University Press.",
  },
  {
    t: "ELC Unpublished Philosophy (Critical Edition)",
    d: "A critical edition of ELC's unpublished philosophical manuscripts with critical introduction, headnotes, and editorial annotation cross-referencing her published works. Key texts include \"Idea and Purpose,\" \"Individuality,\" \"The Search for the Eternal,\" \"The Place of Pleasure\" (Royce seminar thesis), \"The Place of Death,\" and her response to \"The World and the Individual.\" Target: Oxford New Histories of Philosophy or Harvard University Press.",
  },
  {
    t: "Collected Poems, 1875–1934 (Critical Edition)",
    d: "A critical edition of 300+ poems with scholarly introduction, editorial annotation, and source identification. The only prior publication of this material is a private family pamphlet (52 Poems, 1935). Target: Harvard University Press, Oxford University Press, or Cambridge University Press. NEH Scholarly Editions eligible.",
  },
  {
    t: "ELC–RCC Letters Edition",
    d: "A critical edition of the ELC–RCC correspondence, beginning with the 415,000+ characters of 1892–93 courtship letters already transcribed. Corrects biographical errors in prior secondary literature. Critical introduction, headnotes, and full editorial annotation. Target: Oxford New Histories of Philosophy or Harvard University Press.",
  },
];

function Research() {
  return (
    <div className="sec">
      <Label t="Research" />
      <h2>Research Interests</h2>
      <Rule />
      <p>My philosophical work spans pragmatist ethics and metaethics, feminist philosophy of the late nineteenth and early twentieth century, philosophy of moral education, philosophy of action, and moral responsibility. I work at the boundary between historical recovery and systematic philosophy, using archival research to reconstruct positions and arguments that were historically significant but have been marginalized by the discipline's received canon.</p>
      <p>The systematic project is a unified account of purposive selfhood as the ground of normativity, moral responsibility, and moral growth. The central claim is that neither deflationary expressivism nor heavyweight metaphysical realism can account for genuine moral error, diachronic responsibility, and the possibility of becoming a better person. What is needed is a minimal metaphysics of the purposive self: a framework in which the self is a purposive achievement, and in which that achievement is what makes normativity, responsibility, and moral growth possible. Ella Lyman Cabot's pragmatic idealism supplies that framework, tested against problems across metaethics, moral responsibility theory, and philosophy of education.</p>
      <p>This project is developed in a book in progress, <em>The Purposive Self: Agency, Normativity, and Moral Growth</em>, targeted at Fordham University Press, Oxford University Press, and Cambridge University Press.</p>

      <div style={{ marginTop: "2.6rem" }}>
        <Label t="ELC Recovery Project" />
        <h2>The Ella Lyman Cabot Recovery Project</h2>
        <Rule />
        <p>I am the only scholar conducting sustained archival recovery work on Ella Lyman Cabot. I hold literary rights to her unpublished material through the Ella Lyman Cabot Trust, have fully digitized the Schlesinger Library ELC Papers (8.17 linear feet), and have conducted extensive research in the Harvard University Archives (Papers of Richard Clarke Cabot, HUG 4255, 221 containers).</p>
        <p>The recovery project comprises seven planned publications spanning an edited volume, critical editions, a biography, a Cambridge Element, and an Oxford series volume.</p>
      </div>

      <div className="project-list">
        {PROJECTS.map((p, i) => (
          <div key={i} className="project-item">
            <div className="project-num">{i + 1}</div>
            <div>
              <div className="project-title">{p.t}</div>
              <div className="project-desc">{p.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2.6rem" }}>
        <div className="sub-label">Critical Reprint Program</div>
        <p style={{ fontFamily: SERIF, fontSize: "0.97rem", lineHeight: "1.75", color: "#111111", marginBottom: "1.2rem" }}>The Boston Ethics Tradition Recovery Program includes a series of critical reissues of the core published texts in the tradition. Each volume receives a new scholarly introduction, regularized pagination, and editorial footnotes cross-referencing related works, unpublished manuscripts, and archival sources — providing the scholarly apparatus needed to support sustained future research on these figures. All texts are in the public domain. Target: Harvard University Press, Oxford University Press, or Cambridge University Press.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
          {[
            { author: "Ella Lyman Cabot", works: ["Everyday Ethics (1906)", "Temptations to Rightdoing (1929)"] },
            { author: "Richard Clarke Cabot", works: ["What Men Live By (1914)", "The Meaning of Right and Wrong (1933)", "Adventures on the Borderland of Ethics (1926)"] },
            { author: "George Herbert Palmer", works: ["The Field of Ethics (1901)", "The Nature of Goodness (1903)"] },
            { author: "Josiah Royce", works: ["The Philosophy of Loyalty (1908)"] },
          ].map((group, i) => (
            <div key={i} style={{ padding: "0.7rem 0", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: "0.97rem", fontWeight: 500, color: "#5c1515", marginBottom: "0.3rem" }}>{group.author}</div>
              {group.works.map((w, j) => (
                <div key={j} style={{ fontFamily: SANS, fontSize: "0.82rem", color: "#555555", lineHeight: "1.6" }}>{w}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "2.6rem" }}>
        <div className="sub-label">Papers in Progress</div>
        <p style={{ fontFamily: SERIF, fontSize: "0.95rem", color: "#555555", marginBottom: "1rem", lineHeight: "1.7" }}>Selected papers from the active research program. Primary target venues listed.</p>

        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontFamily: SANS, fontSize: "0.73rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.accent, marginBottom: "0.6rem" }}>James–Cabot–Murdoch Series</div>
          {[
            { t: "Cabot's Account of Experience", v: "William James Studies" },
            { t: "Cabot's Account of Community", v: "Journal of Speculative Philosophy" },
            { t: "James, Cabot, and Murdoch on Suffering", v: "Ethics / Journal of Moral Philosophy" },
          ].map((p, i) => (
            <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: "0.97rem", fontWeight: 500, color: "#5c1515" }}>{p.t}</div>
              <div style={{ fontFamily: SANS, fontSize: "0.8rem", color: "#555555", marginTop: "0.1rem" }}>Target: <em>{p.v}</em></div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontFamily: SANS, fontSize: "0.73rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.accent, marginBottom: "0.6rem" }}>ELC Recovery Papers</div>
          {[
            { t: "Ethical Life and the Structure of Selfhood: Reconstructing Cabot's Minimal Metaphysics", v: "Journal of Speculative Philosophy" },
            { t: "Minimal Metaphysics and Pragmatist-Feminism", v: "Metaphilosophy" },
            { t: "Being the Moral Teacher: Cabot's Ideal Theory of Self and Egoist Virtue", v: "Journal of Moral Education" },
            { t: "Cabot’s Virtue Theory: A Response to Heney (2023)", v: "History of Philosophy Quarterly" },
            { t: "Emerson, Cabot, and the Pragmatist-Feminist Tradition", v: "Emerson Society Papers" },
            { t: "ELC as Spiritual Director: Practice, Theology, and the Limits of the Label", v: "History of philosophy and American religion journals" },
            { t: "Ada Peirce McCormick as Philosophical Witness", v: "American philosophy and history of philosophy journals" },
          ].map((p, i) => (
            <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: "0.97rem", fontWeight: 500, color: "#5c1515" }}>{p.t}</div>
              <div style={{ fontFamily: SANS, fontSize: "0.8rem", color: "#555555", marginTop: "0.1rem" }}>Target: <em>{p.v}</em></div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontFamily: SANS, fontSize: "0.73rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.accent, marginBottom: "0.6rem" }}>Systematic Papers</div>
          {[
            { t: "Purposive Pluralism: A Third Option Between Global Expressivism and Bifurcationism", v: "BJHP / Journal of the History of Philosophy / Philosophical Studies" },
            { t: "Purposive Selfhood and the Metaphysics of Habit", v: "Transactions of the Charles S. Peirce Society; MSA 2027 abstract submitted" },
            { t: "Probabilistic Compatibilism", v: "Philosophical Psychology" },
          ].map((p, i) => (
            <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: "0.97rem", fontWeight: 500, color: "#5c1515" }}>{p.t}</div>
              <div style={{ fontFamily: SANS, fontSize: "0.8rem", color: "#555555", marginTop: "0.1rem" }}>Target: <em>{p.v}</em></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "2.6rem" }}>
        <div className="sub-label">Long-Range Research</div>
        <p style={{ fontFamily: SERIF, fontSize: "0.97rem", lineHeight: "1.75", color: "#111111" }}>Beyond the recovery program, I am developing several long-range projects in systematic philosophy and the history of philosophy. These include a book on collective purposive agency as a sequel to <em>The Purposive Self</em>, and an exploratory argument identifying Thomas Reid, Kierkegaard, and Ella Lyman Cabot as a unified tradition in the philosophy of purposive selfhood running from Scottish common sense philosophy through German existentialism into American pragmatism. I am also developing the Purposive Pluralism project as a contribution to the metaethics literature on expressivism and bifurcationism, and an Oxford Pragmatism Review essay connecting the recovery work to current debates in the history of British analytic philosophy.</p>
      </div>

      <div className="callout">
        <h3 style={{ marginBottom: "0.6rem" }}>Archival Holdings</h3>
        <p><strong>Schlesinger Library, Radcliffe Institute, Harvard University.</strong> Ella Lyman Cabot Papers (Collection A-139). 8.17 linear feet. Full archive digitized. Permission to publish all materials secured from the Ella Lyman Cabot Trust.</p>
        <p style={{ marginTop: "0.65rem" }}><strong>Harvard University Archives, Pusey Library.</strong> Papers of Richard Clarke Cabot (HUG 4255). 221 containers. Includes Ada Peirce McCormick's research materials (HUG 4255.80, 25 containers).</p>
      </div>
    </div>
  );
}

// ── PUBLICATIONS ──────────────────────────────────────────────────
const FORTHCOMING = [
  { t: "Ella Lyman Cabot (Edited Volume)", v: "Philosophy for Children Forebears", p: "Routledge", e: "Series Eds. Maughn Rollins Gregory and Megan Jane Laverty", n: "Jacob B. Castleberry, volume editor. 209 pages drafted; restructuring in progress. Target manuscript: 2027–2028." },
  { t: "Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot", v: "The Pluralist", n: "Accepted. Winner of the 2026 Harris-Jones Prize, SAAP." },
  { t: "Ella Lyman Cabot: Teaching for Royce's Beloved Community", v: "Philosophy of Education", n: "Forthcoming 2027." },
];
const PUBLISHED = [
  { t: "Reasonable Communities: P4C and Peace Education", v: "Cultivating Reasonableness in Education: Community of Philosophical Inquiry", p: "Springer", y: "2023" },
  { t: "Expanding the Facilitator's Toolbox: Vygotskian Mediation in Philosophy for Children", v: "Analytic Teaching and Philosophical Praxis", y: "2020", n: "Co-authored with Kevin M. Clark." },
];
const UNDER_REVIEW = [
  { t: "Rationality as Probabilistic Coherence: Credal Expressivism, Planning Attitudes, and the Guidance of Action", v: "Philosophical Studies" },
  { t: "Trauma and Diachronic Reasons-Responsive Moral Responsibility", v: "Philosophy of Medicine" },
  { t: "Trauma, Coherence, and Reasons-Responsive Moral Responsibility", v: "In revision" },
];
const TALKS = [
  { t: "Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot", v: "SAAP", y: "2026" },
  { t: "Ella Lyman Cabot: Teaching for Royce's Beloved Community", v: "PES", y: "2026" },
  { t: "Expanding the Pragmatist-Feminism Canon: Ella Lyman Cabot, Metaphysics, and Feminist Challenges", v: "Boston University Graduate Conference", y: "2026" },
  { t: "Trauma and Moral Responsibility: Constitutivism, Expressivism, and Idealism", v: "SSPP", y: "2026" },
  { t: "Ella Lyman Cabot: Teaching for the Beloved Community", v: "NEPES", y: "2025" },
  { t: "Being the Moral Teacher: Ella Lyman Cabot's Ideal Theory of Self and Egoist Virtue", v: "NAAPE / SOPHE", y: "2025" },
  { t: "Ella Lyman Cabot: Pioneering Ethics Education for Women's Selfhood", v: "ISEB", y: "2025" },
  { t: "Reasonable Communities: P4C and Peace Education", v: "NAAPE", y: "2023" },
];

function Publications() {
  return (
    <div className="sec">
      <Label t="Scholarship" />
      <h2>Publications &amp; Talks</h2>
      <Rule />

      <div style={{ marginBottom: "2.2rem" }}>
        <div className="sub-label">Book in Progress</div>
        <div className="pub-item">
          <div className="pub-title"><em>The Purposive Self: Agency, Normativity, and Moral Growth</em></div>
          <div className="pub-meta">A systematic account of purposive selfhood as the ground of normativity and moral growth, developed through Ella Lyman Cabot's pragmatic idealism and tested against problems in metaethics, moral responsibility, and philosophy of education.</div>
          <div className="pub-note">Target: Fordham University Press (primary); Oxford University Press; Cambridge University Press.</div>
        </div>
      </div>

      <div style={{ marginBottom: "2.2rem" }}>
        <div className="sub-label">Forthcoming</div>
        {FORTHCOMING.map((p, i) => (
          <div key={i} className="pub-item">
            <div className="pub-title">{p.t}</div>
            <div className="pub-meta"><em>{p.v}</em>{p.p ? `. ${p.p}.` : ""}{p.e ? ` ${p.e}.` : ""}</div>
            {p.n && <div className="pub-note">{p.n}</div>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "2.2rem" }}>
        <div className="sub-label">Published</div>
        {PUBLISHED.map((p, i) => (
          <div key={i} className="pub-item">
            <div className="pub-title">{p.t}</div>
            <div className="pub-meta"><em>{p.v}</em>{p.p ? `. ${p.p}.` : ""} {p.y}.</div>
            {p.n && <div className="pub-note">{p.n}</div>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "2.2rem" }}>
        <div className="sub-label">Under Review</div>
        {UNDER_REVIEW.map((p, i) => (
          <div key={i} className="pub-item">
            <div className="pub-title">{p.t}</div>
            <div className="pub-meta"><em>{p.v}</em></div>
          </div>
        ))}
      </div>


      <div style={{ marginBottom: "2.2rem" }}>
        <div className="sub-label">Conference Presentations</div>
        {TALKS.map((p, i) => (
          <div key={i} className="pub-item">
            <div className="pub-title">{p.t}</div>
            <div className="pub-meta">{p.v} &middot; {p.y}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="sub-label">Awards &amp; Prizes</div>
        <div className="pub-item">
          <div className="pub-title">Harris-Jones Prize <span style={{ color: C.accent }}>2026</span></div>
          <div className="pub-meta">Society for the Advancement of American Philosophy (SAAP). Recognizes work in the Philosophy of the Black Experience. Awarded for "Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot."</div>
        </div>
        <div className="pub-item">
          <div className="pub-title">Outstanding Paper Prize, Finalist <span style={{ color: C.accent }}>2025</span></div>
          <div className="pub-meta">North American Association for Philosophy and Education (NAAPE). For "Being the Moral Teacher: Ella Lyman Cabot's Ideal Theory of Self and Egoist Virtue."</div>
        </div>
        <div className="pub-item">
          <div className="pub-title">RWES Research Award, Application Submitted <span style={{ color: C.accent }}>2026</span></div>
          <div className="pub-meta">Ralph Waldo Emerson Society. For "Emerson, Cabot, and the Pragmatist-Feminist Tradition."</div>
        </div>
      </div>
    </div>
  );
}

// ── TEACHING ──────────────────────────────────────────────────────
const INST = [
  { name: "University of Indianapolis", detail: "Intro to Ethics · Intro to Philosophy · Business Ethics" },
  { name: "Ivy Tech Community College", detail: "Intro to Ethics (18 sections) · Intro to Philosophy" },
  { name: "Park University", detail: "Ancient & Medieval Phil. · Philosophy of Religion · Ethics" },
  { name: "Southern New Hampshire University", detail: "Ethics in Global Society" },
  { name: "Indiana University Kokomo", detail: "Critical Thinking · Elementary Logic" },
  { name: "Colorado Technical University", detail: "Intro to Ethics" },
  { name: "Western Michigan University", detail: "Intro to Philosophy · Ethics in Engineering · Values & Video Games" },
];

function Teaching() {
  return (
    <div className="sec">
      <Label t="Pedagogy" />
      <h2>Teaching</h2>
      <Rule />

      <div style={{ marginBottom: "2rem" }}>
        <div className="sub-label">Teaching Philosophy</div>
        <p className="teach-philosophy">My teaching begins with a claim I take from my research: the self is not given but achieved, and that achievement depends on genuine resistance from the world. Students do not become better thinkers by receiving correct views. They become better thinkers by having their views seriously tested. The classroom is where that testing happens.</p>
        <p className="teach-philosophy">My methods draw on Ella Lyman Cabot's pedagogy and the pragmatist tradition of Royce, James, and Dewey. Cabot argued that moral education begins in ordinary experience and grows through interpretation and loyal cooperation, not through the transmission of doctrine. In practice this means the classroom functions as a community of inquiry: a space where students reason together, test their views against genuine resistance, and treat disagreement as philosophically productive.</p>
        <p className="teach-philosophy">In Introduction to Ethics, this becomes a semester-long project. Students begin by generating their own lists of goods, bads, and cases before any theory is introduced. Collaborative reasoning builds toward a working moral framework the class constructs together. When Mill, Kant, and Aristotle enter the conversation, the question is never just what they say but whether their accounts survive contact with what the class has built. This is what Cabot and Royce meant by the Beloved Community: not agreement, but a group that has learned to think and act together while remaining genuinely different from one another.</p>
        <p className="teach-philosophy">The signature assignment in Introduction to Philosophy is the Reading Argument Objection and Reply (RAOR): students reconstruct the central argument of a primary text, raise a serious objection, and develop a reply in the author's defense. The course ends with students returning to their first RAOR with the skills they have developed over the semester. The difference between the two submissions is usually the clearest evidence I have that something real happened.</p>
      </div>

      <div style={{ marginBottom: "1.8rem" }}>
        <div className="sub-label">Institutions (60 courses at 7 institutions)</div>
        <div className="inst-grid">
          {INST.map((inst, i) => (
            <div key={i} className="inst-item">
              <Dot />
              <div>
                <div className="inst-name">{inst.name}</div>
                <div className="inst-sub">{inst.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div className="sub-label">Adult Basic Education</div>
        <div className="pub-item" style={{ borderBottom: "none" }}>
          <div className="pub-title">Miami Correctional Facility <span style={{ color: C.accent, fontFamily: SANS, fontSize: "0.8rem", fontWeight: 400 }}>2022–2024</span></div>
          <div className="pub-meta">Adult Basic Education Instructor · Ivy Tech Community College</div>
        </div>
      </div>

      <div className="callout">
        <p>Teaching materials, syllabi, and a full teaching statement are available upon request. I am interested in developing courses on the history of American ethics, pragmatism, feminist philosophy, and philosophy of education.</p>
      </div>
    </div>
  );
}

// ── CV ────────────────────────────────────────────────────────────
const CV_DATA = [
  { h: "Education", items: [
    { t: "MA in Philosophy", s: "Western Michigan University, 2021 · Concentrations: Epistemology & Philosophy of Science; Ethical Theory & Value Theory" },
    { t: "BA in Humanities; Minor in Philosophy", s: "Indiana University Kokomo, 2019 · 45 philosophy credit hours" },
  ]},
  { h: "Current Positions", items: [
    { t: "Independent Scholar", s: "Boston Ethics Tradition Recovery Program" },
    { t: "Adjunct Instructor of Philosophy", s: "Seven institutions · 60 courses as instructor of record" },
  ]},
  { h: "Archival & Editorial", items: [
    { t: "Literary Rights Holder", s: "Ella Lyman Cabot Trust, literary rights to unpublished material of Ella Lyman Cabot (1866–1934)" },
    { t: "Principal Investigator", s: "Boston Ethics Tradition Recovery Program" },
  ]},
  { h: "Awards & Prizes", items: [
    { t: "Harris-Jones Prize", s: "Society for the Advancement of American Philosophy, 2026" },
    { t: "Outstanding Paper Prize, Finalist", s: "North American Association for Philosophy and Education, 2025" },
  ]},
  { h: "Selected Publications", items: [
    { t: "Reasonable Communities: P4C and Peace Education", s: "Cultivating Reasonableness in Education, Springer, 2023" },
    { t: "Expanding the Facilitator's Toolbox", s: "Analytic Teaching and Philosophical Praxis, 2020 (with Kevin M. Clark)" },
  ]},
  { h: "Affiliations", items: [
    { t: "Society for the Advancement of American Philosophy (SAAP)" },
    { t: "Philosophy and Education Society (PES)" },
    { t: "North American Association for Philosophy and Education (NAAPE)" },
    { t: "Northeastern Philosophy and Education Society (NEPES)" },
    { t: "Society of Philosophy and History of Education (SOPHE)" },
    { t: "International Society of Educational Biography (ISEB)" },
  ]},
];

function CV() {
  return (
    <div className="sec">
      <Label t="Curriculum Vitae" />
      <h2>Academic CV</h2>
      <Rule />
      {CV_DATA.map((sec, i) => (
        <div key={i} className="cv-sec">
          <div className="sub-label">{sec.h}</div>
          {sec.items.map((item, j) => (
            <div key={j} className="cv-item">
              <Dot />
              <div>
                <div className="cv-title">{item.t}</div>
                {item.s && <div className="cv-sub">{item.s}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div className="cv-box">
        <div style={{ fontFamily: SANS, fontSize: "0.85rem", color: C.textMuted, marginBottom: "0.4rem" }}>Full curriculum vitae available upon request.</div>
        <a href="mailto:castleberryj@uindy.edu" className="cv-link">Request CV →</a>
      </div>
    </div>
  );
}

// ── RESOURCES ────────────────────────────────────────────────────

function Resources() {
  const [tab, setTab] = useState("primary");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const resources = tab === "primary" ? PRIMARY : SECONDARY;

  return (
    <div className="sec">
      <Label t="Resources" />
      <h2>Cabot Resource Library</h2>
      <Rule />
      <p>A living bibliography of primary and secondary sources for the Boston ethics tradition. Maintained as part of the Boston Ethics Tradition Recovery Program and updated as new scholarship appears.</p>

      <div style={{ marginTop: "2rem" }}>
        <div className="tab-row" role="tablist">
          {["primary","secondary"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} role="tab" aria-selected={tab === t}>
              {t === "primary" ? "Primary Sources" : "Secondary Scholarship"}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: SANS, fontSize: "0.81rem", color: C.textMuted, fontStyle: "italic", marginBottom: "1.1rem" }}>
          {tab === "primary" ? "Works authored by Ella Lyman Cabot, Richard Clarke Cabot, or Ada Peirce McCormick." : "Scholarly works about ELC, RCC, or APM by other authors."}
        </p>
        {resources.map((r, i) => (
          <div key={i} className="res-item">
            <div className="res-title">{r.title}{r.year ? <span className="res-year"> ({r.year})</span> : ""}</div>
            <div className="res-meta">{r.author}{r.venue ? ` · ${r.venue}` : ""}{r.type ? ` · ${r.type}` : ""}</div>
            {r.note && <div className="res-note">{r.note}</div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2.8rem" }}>
        <div className="sub-label">Boston Ethics Network</div>
        <div className="callout-dark">
          <h3>Scholars &amp; Collaborators</h3>
          <p style={{ marginTop: "0.5rem" }}>I am building a network of scholars working on the Boston ethics tradition and related questions in American pragmatism, feminist philosophy, and philosophy of education. If you work on any figure in this tradition, I welcome contact.</p>
          {joined
            ? <p className="email-confirm">Thank you. I'll be in touch.</p>
            : <div className="email-row">
                <input className="email-input" type="email" placeholder="your@email.edu" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email address" />
                <button className="email-btn" onClick={() => email && setJoined(true)}>Connect</button>
              </div>}
        </div>
      </div>
    </div>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────
function Contact() {
  return (
    <div className="sec">
      <Label t="Contact" />
      <h2>Get in Touch</h2>
      <Rule />
      <p>I welcome correspondence about the ELC recovery project, the Boston ethics tradition, potential collaborations, philosophy of education, and moral responsibility. I am particularly glad to hear from scholars interested in the Boston ethics network, potential co-editors, and press editors working on history of philosophy or American philosophy series.</p>

      <div style={{ marginTop: "1.7rem" }}>
        {[
          { l: "Email", v: "castleberryj@uindy.edu", href: "mailto:castleberryj@uindy.edu" },
          { l: "PhilPapers", v: "View profile", href: "https://philpapers.org" },
          { l: "Status", v: "Independent Scholar", href: "" },
        ].map((item, i) => (
          <div key={i} className="contact-row">
            <div className="contact-label">{item.l}</div>
            {item.href
              ? <a href={item.href} className="contact-link">{item.v}</a>
              : <span className="contact-val">{item.v}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {[
          { heading: "For press and series editors", body: "I am actively developing pitches for the Cambridge Elements Women in the History of Philosophy series and the Oxford New Histories of Philosophy series. Inquiries are welcome." },
          { heading: "For scholars in related fields", body: "I am seeking contributors for the Resource Library and collaborators on the Boston Ethics Tradition Recovery Program. The Trust grants access to unpublished ELC material." },
        ].map((box, i) => (
          <div key={i} style={{ background: C.bgAlt, padding: "1.1rem 1.3rem", borderRadius: "4px", borderTop: `3px solid ${C.accentBar}` }}>
            <div style={{ fontFamily: SANS, fontSize: "0.77rem", fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{box.heading}</div>
            <p style={{ fontSize: "0.88rem", lineHeight: "1.65", color: C.text }}>{box.body}</p>
          </div>
        ))}
      </div>

      <div className="callout" style={{ marginTop: "1.8rem" }}>
        <p>For CV, syllabi, writing samples, or paper drafts, email directly. Response time is typically within one week.</p>
      </div>
    </div>
  );
}

// ── SEO & JSON-LD ─────────────────────────────────────────────────
const META = {
  Home:         ["Jacob B. Castleberry | Philosopher", "Jacob B. Castleberry is a moral philosopher specializing in American pragmatism, feminist philosophy, and recovery of the Boston ethics tradition, including Ella Lyman Cabot (1866–1934)."],
  Research:     ["Research | Jacob B. Castleberry", "Six planned recovery publications on Ella Lyman Cabot plus a systematic book project on purposive selfhood, normativity, and moral growth."],
  Publications: ["Publications & Talks | Jacob B. Castleberry", "Publications and conference presentations by Jacob B. Castleberry on Ella Lyman Cabot, pragmatist ethics, and philosophy of education."],
  Teaching:     ["Teaching | Jacob B. Castleberry", "Jacob B. Castleberry has taught 60 courses at seven institutions. Teaching philosophy draws on Cabot, Royce, and the Philosophy for Children tradition."],
  CV:           ["CV | Jacob B. Castleberry", "Curriculum vitae for Jacob B. Castleberry, philosopher and principal investigator of the Boston Ethics Tradition Recovery Program."],
  Resources:    ["Cabot Resource Library | Jacob B. Castleberry", "Primary and secondary sources for the Boston ethics tradition: Ella Lyman Cabot, Richard Clarke Cabot, Ada Peirce McCormick, and related scholars."],
  Contact:      ["Contact | Jacob B. Castleberry", "Contact Jacob B. Castleberry about the ELC recovery project, the Boston Ethics Tradition Recovery Program, or scholarly collaboration."],
};

function useSEO(s) {
  useEffect(() => {
    const [title, desc] = META[s] || META.Home;
    document.title = title;
    const sm = (sel, attr, key, val) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = val;
    };
    sm('meta[name="description"]', "name", "description", desc);
    sm('meta[property="og:title"]', "property", "og:title", title);
    sm('meta[property="og:description"]', "property", "og:description", desc);

    // JSON-LD structured data (home only)
    const existing = document.getElementById("jld-person");
    if (existing) existing.remove();
    if (s === "Home") {
      const script = document.createElement("script");
      script.id = "jld-person";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Jacob B. Castleberry",
        "jobTitle": "Moral Philosopher",
        "affiliation": { "@type": "Organization", "name": "Boston Ethics Tradition Recovery Program" },
        "email": "castleberryj@uindy.edu",
        "alumniOf": [
          { "@type": "CollegeOrUniversity", "name": "Western Michigan University" },
          { "@type": "CollegeOrUniversity", "name": "Indiana University Kokomo" }
        ],
        "knowsAbout": ["American pragmatism","Ella Lyman Cabot","Boston ethics tradition","philosophy of education","metaethics","moral responsibility","feminist philosophy"],
        "award": "Harris-Jones Prize, Society for the Advancement of American Philosophy, 2026"
      });
      document.head.appendChild(script);
    }
  }, [s]);
}

// ── BACK TO TOP ───────────────────────────────────────────────────
function useScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return show;
}

// ── APP ───────────────────────────────────────────────────────────
const SECTIONS = ["Home","Research","Publications","Teaching","CV","Resources","Web","Contact"];
const VIEWS = {
  Home:<Home/>, Research:<Research/>, Publications:<Publications/>,
  Teaching:<Teaching/>, CV:<CV/>, Resources:<Resources/>, Web:<PhilosophicalWeb/>, Contact:<Contact/>
};

export default function App() {
  const [active, setActive] = useState("Home");
  const [open, setOpen] = useState(false);
  const showTop = useScrollTop();
  useSEO(active);

  function go(s) { setActive(s); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return (
    <div id="site-root">
      <style>{css}</style>

      <a href="#main" className="skip-link">Skip to content</a>

      <nav className="nav-wrap" aria-label="Main navigation">
        <div className="nav-inner">
          <button className="nav-logo" onClick={() => go("Home")}>Jacob B. Castleberry</button>
          <ul className="nav-links">
            {SECTIONS.filter(s => s !== "Home").map(s => (
              <li key={s}><button className={`nav-btn ${active === s ? "active" : ""}`} onClick={() => go(s)}>{s}</button></li>
            ))}
          </ul>
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu" aria-expanded={open}>
            <span style={{ transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ opacity: open ? 0 : 1 }} />
            <span style={{ transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>
        <div className={`mob-nav ${open ? "open" : ""}`} role="navigation" aria-label="Mobile navigation">
          {SECTIONS.map(s => <button key={s} className={`mob-btn ${active === s ? "active" : ""}`} onClick={() => go(s)}>{s}</button>)}
        </div>
      </nav>

      <main id="main" className={active === "Web" ? "page-fullbleed" : "page"} key={active}>
        {VIEWS[active]}
      </main>

      <button
        className={`back-top ${showTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >↑</button>

      <footer className="footer">
        <div className="footer-inner">
          <p>&copy; {new Date().getFullYear()} Jacob B. Castleberry &nbsp;·&nbsp; Literary rights to ELC's unpublished material held by the Ella Lyman Cabot Trust</p>
          <p>Website built with <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">Claude</a></p>
        </div>
      </footer>
    </div>
  );
}
