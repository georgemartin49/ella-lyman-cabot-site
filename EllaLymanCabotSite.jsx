/* eslint-disable no-unused-vars */
// ============================================================================
// EllaLymanCabotSite.jsx
//
// Single-file bundle of the Ella Lyman Cabot site
// (https://ellalymancabot.org · https://github.com/georgemartin49/ella-lyman-cabot-site).
//
// Drop this into a CRA/Vite/Next React 18+ project as the App component.
// Body CSS and Google Fonts are injected at mount via useEffect — no
// supporting index.css or index.html changes required.
//
// Routes (hash-based, no router lib):
//   #/                         → Landing
//   #/web[?q=&lines=&rings=]   → Philosophical Web
//   #/timeline                 → Timeline
//   #/figure/<key>             → Detail page
//
// Stack: React 18+ / 19. No external deps.
/* eslint-disable no-unused-vars */
// ============================================================================

import { useState, useEffect, useMemo, useCallback } from "react";

const LAYOUT_COL = "720px";

const ELC_CSS = `
/* Light theme — Warm Paper (default) */
:root {
  --bg: #F5ECCF;
  --bg-deep: #ECDFB6;
  --surface: #FAF3D8;
  --border: #C9B58D;
  --rule: #B59E78;
  --text: #3B2E22;
  --text-soft: #6B5A47;
  --text-muted: #6E5E48;
  --accent: #8B0E1A;
  --accent-soft: #B23A3A;
  --accent-border: rgba(139, 14, 26, 0.32);
  --accent-faint: rgba(139, 14, 26, 0.08);
  --accent-faint-strong: rgba(139, 14, 26, 0.14);
  --warn: #8B5A18;
  --warn-bg: rgba(139, 90, 24, 0.10);
  --warn-border: rgba(139, 90, 24, 0.32);
  --gold: #B8893A;
  --gold-text: #2A1F0F;
}

/* Dark theme — Library */
[data-theme="dark"] {
  --bg: #2A211B;
  --bg-deep: #1F1814;
  --surface: #34281F;
  --border: #4A3A2C;
  --rule: #5A4A3A;
  --text: #EDE3D2;
  --text-soft: #C9BFAE;
  --text-muted: #9E907E;
  --accent: #C9A24A;
  --accent-soft: #8B6F2C;
  --accent-border: rgba(201, 162, 74, 0.45);
  --accent-faint: rgba(201, 162, 74, 0.10);
  --accent-faint-strong: rgba(201, 162, 74, 0.18);
  --warn: #C07840;
  --warn-bg: rgba(192, 120, 64, 0.10);
  --warn-border: rgba(192, 120, 64, 0.35);
  --gold: #D4A840;
  --gold-text: #FFF8E8;
}

html, body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
  font-size: 18px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 250ms ease, color 250ms ease;
}

h1, h2, h3, h4 {
  font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

/* Skip-to-content link, used in every page. Hidden until focused. */
.elc-skip { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
.elc-skip:focus {
  left: 16px; top: 16px;
  width: auto; height: auto;
  padding: 8px 14px;
  background: var(--accent);
  color: var(--bg);
  border-radius: 4px;
  font-weight: bold;
  z-index: 100;
}

/* Reusable chrome button — works for back/home links and toggle buttons.
   Defined here so :hover / [aria-pressed] selectors can win against any
   inline style overrides that might leak in. */
.elc-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 15px;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1.2;
  transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
}
.elc-btn:hover, .elc-btn:focus-visible {
  border-color: var(--accent);
  color: var(--accent);
  outline: none;
}
.elc-btn:focus-visible { box-shadow: 0 0 0 2px var(--accent-faint-strong); }
.elc-btn[aria-pressed="true"] {
  background: var(--accent-faint);
  border-color: var(--accent);
  color: var(--accent);
}

/* Section eyebrow heading: small uppercase label above blocks. */
.elc-eyebrow {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 14px;
  font-weight: 600;
}

/* Cards in detail view that link to another figure. */
.elc-figure-link {
  display: block;
  color: inherit;
  text-decoration: none;
  margin: -4px -8px 6px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 180ms ease;
}
.elc-figure-link:hover, .elc-figure-link:focus-visible {
  background: var(--accent-faint);
  outline: none;
}
.elc-figure-link:focus-visible { box-shadow: 0 0 0 2px var(--accent-faint-strong); }

/* Print styles — clean monograph excerpts of detail pages.
   Forces a paper-like palette regardless of theme; hides chrome. */
@media print {
  :root, [data-theme="dark"] {
    --bg: #ffffff;
    --surface: #ffffff;
    --border: #999999;
    --rule: #cccccc;
    --text: #000000;
    --text-soft: #333333;
    --text-muted: #666666;
    --accent: #5a0a13;
    --accent-soft: #5a0a13;
    --accent-border: #c0a0a0;
    --accent-faint: transparent;
    --accent-faint-strong: transparent;
  }
  html, body { background: #fff !important; color: #000 !important; font-size: 11pt; }
  .elc-btn, .elc-skip, [role="search"], nav[aria-label^="Other figures"],
  header > [class*="elc-btn"], footer { display: none !important; }
  /* Detail page header chrome */
  header { background: transparent !important; border: none !important; padding: 0 !important; }
  /* Sections become sequential, with tighter margins and no card backgrounds. */
  main section {
    background: transparent !important;
    border: none !important;
    border-top: 1px solid #999 !important;
    border-radius: 0 !important;
    padding: 12pt 0 !important;
    page-break-inside: avoid;
  }
  main { padding: 0 !important; max-width: none !important; }
  a { color: inherit !important; text-decoration: none !important; }
  h1, h2, h3 { page-break-after: avoid; }
  /* Hide the SVG visualization on print — it's pixel-bound. */
  svg { display: none !important; }
}
`;

// ---------- theme tokens (CSS variables) ----------
// Color tokens are CSS variables defined in src/index.css under :root and
// [data-theme="dark"]. Components reference them via these constants so a
// theme swap (light/dark) only updates the variable values.

const BG = "var(--bg)";
const BG_DEEP = "var(--bg-deep)";
const SURF = "var(--surface)";
const BORD = "var(--border)";
const RULE = "var(--rule)";
const TX = "var(--text)";
const TX_SOFT = "var(--text-soft)";
const MUTED = "var(--text-muted)";
const ACCENT = "var(--accent)";
const ACCENT_SOFT = "var(--accent-soft)";
const ACCENT_BORDER = "var(--accent-border)";
const ACCENT_FAINT = "var(--accent-faint)";
const ACCENT_FAINT_STRONG = "var(--accent-faint-strong)";
const WARN = "var(--warn)";
const WARN_BG = "var(--warn-bg)";
const WARN_BORDER = "var(--warn-border)";
const GOLD = "var(--gold)";
const GOLD_TEXT = "var(--gold-text)";
const INF = "var(--text-soft)";

// Ring colors are deliberately palette-independent — they encode ring
// identity, not chrome, and they read well over both backgrounds.
const RING_COLORS = ["#7C9EC9", "#5CB89E", "#8A8FAA", "#B87070"];
const OUTER_COLOR = "#9E8EC8";

// ---------- ring layout ----------
// Ring layout: which figures live on which ring, and their geometry.

const RINGS_CFG = [
  { rad:108, cr:102, label:"Ring I — Closest Allies",
    nodes:["Emerson","James","Weil","P-Pattison","Royce","Palmer"] },
  { rad:196, cr:188, label:"Ring II — Substantial Agreement",
    nodes:["Murdoch","T.H. Green","Du Bois","Caird","Bosanquet","Hocking","J.E. Cabot","E.G. Balch","H. Bosanquet","M. Sinclair","Scudder","Pratt","Parker","Hoernlé","Thompson","Haldane","Korsgaard","Follett","Bergson","Alain","Buchler","Calkins","Bowne","Ritchie","Aristotle","Langer"] },
  { rad:284, cr:276, label:"Ring III — Partial Agreement",
    nodes:["Hegel","Sartre","Dewey","Kant","Peirce","Bradley","C.I. Lewis","T.S. Eliot","De Laguna"] },
  { rad:368, cr:360, label:"Ring IV — Objectors",
    nodes:["Hume/Parfit","Moore/Russell","Perry","Metzinger","Foucault(E)","Schiller"] },
];

const OUTER_CFG = {
  rad:452, cr:444, label:"Same Outcome — Different Vocab",
  nodes:["Mencius","Epictetus/M.A.","Ubuntu","Buber","Maine de Biran","Freire","Bakhtin","Addams","F. Kelley"]
};

const SZ = 960;
const CX = 480;
const CY = 480;


// ---------- figure data + CITED_BY ----------
// Figures in the philosophical web around Ella Lyman Cabot.
//
// confirmed: true  = claims verified from primary sources or established scholarship
// confirmed: false = some claims inferred, pending archival verification, or working hypotheses
// unconfirmedNote: specific claim(s) that need verification

const DATA = {
  // ── RING I ────────────────────────────────────────────────────────────────
  Emerson: {
    ring:1, dates:"1803–1882", title:"The Exhibitive Origin", confirmed:true,
    desc:"Self-Reliance is the ontological claim that the self must be achieved against the pressure of conformity and the merely received. The Over-Soul is what interest participates in when most fully itself — not a metaphysical entity but what interest discovers when followed honestly to its limit. Emerson exhibits what ELC systematised: his mode is exhibitive throughout, which is exactly why ELC's poems are necessary alongside her prose. Representative Men exhibits what fully achieved selfhood looks like from inside different modes of human excellence. Experience (1844) is his most philosophically rigorous essay — the closest to radical empiricism before James.",
    elc:"James Elliot Cabot — Emerson's literary executor and biographer — was ELC's father-in-law. She absorbed Emerson through direct family transmission and through Palmer, who had internalised Emerson's practical register into Harvard's curriculum. Two independent channels converged on ELC simultaneously. ELC's practical ethics are the systematic philosophical specification of what Emersonian self-reliance actually requires to be real rather than merely asserted.",
    inf:[["Carlyle","German idealism in English; self-creation against conformity"],["Coleridge","Kantian aesthetics; organic form; Reason vs Understanding"],["Plotinus","Neo-Platonic self-transcendence; primary source of Over-Soul"],["Montaigne","Self-examination as philosophical act; essayistic mode"],["Swedenborg","Correspondence of inner and outer; Representative Men subject"]],
    out:[["James","Absorbed self-reliance into radical empiricism"],["Palmer","Systematised as practical ethics at Harvard"],["ELC","Via J.E. Cabot (father-in-law) and Palmer directly"],["Thoreau","Applied self-reliance to lived practice at Walden"],["Whitman","Democratic self-reliance; leaves of grass as exhibitive mode"]],
    works:[["Nature (1836)","James Munroe — foundational statement of self-constitution through engagement with world"],["Essays: First Series (1841)","James Munroe — Self-Reliance, The Over-Soul, Circles, Compensation"],["Essays: Second Series (1844)","James Munroe — Experience; most philosophically rigorous essay"],["Representative Men (1850)","Phillips Sampson — exhibition of achieved selfhood across modes"],["The Conduct of Life (1860)","Ticknor and Fields — Fate; conditions as enabling not constraining"]],
    archives:[["Houghton Library, Harvard University","Ralph Waldo Emerson Papers — primary archive. Also James Elliot Cabot Papers for ELC transmission chain."]]
  },
  James: {
    ring:1, dates:"1842–1910", title:"The Phenomenological Predecessor", confirmed:true,
    desc:"Not the pragmatist James but the radical empiricist. Pure experience is the datum prior to both subject and object; conjunctive relations are genuinely real; the stream of consciousness is already temporal, already directed, already interested before theory begins. His specious present — the minimal temporal unit containing retention of just-past and anticipation of about-to-come — is the phenomenological description of interest's forward-backward structure. ELC's fifth condition names his conjunctive relations directly. Talks to Teachers (1899) is James in ELC's exact mode: practical philosophy for educators specifying what genuine education requires.",
    elc:"ELC attended James's courses at Harvard and Radcliffe. His account of the stream as already-directed, already-interested experience gave her the phenomenological starting point. The conjunctive capacity — her fifth condition — is her systematic deployment of what he called pure experience and conjunctive relations. James reviewed ELC's Every-Day Ethics (1906) favourably and their correspondence continued through his death in 1910.",
    inf:[["Renouvier","Freed James from determinism; indeterminism as liveable"],["Peirce","Pragmatist method; logic of inquiry; fallibilism"],["Emerson","Formative; trust of individual experience; Over-Soul parallel"],["Fechner","Continuity of consciousness; mind throughout nature"],["Bain","Associationist psychology; habit chapter in Principles"]],
    out:[["ELC","Fifth condition names his conjunctive relations directly"],["Hocking","Shared-objects solution; negative pragmatism"],["Calkins","Self-psychology at Harvard and Radcliffe under James"],["Murdoch","Temperament observation (unacknowledged influence)"],["Dewey","Instrumentalist development of pragmatism (divergent)"]],
    works:[["The Principles of Psychology, 2 vols. (1890)","Henry Holt — stream of consciousness; habit; the self"],["Talks to Teachers on Psychology (1899)","Henry Holt — James in ELC's exact mode; practical philosophy of education"],["The Varieties of Religious Experience (1902)","Longmans Green — psychology of religion; individual experience as datum"],["Pragmatism (1907)","Longmans Green — pragmatist theory of truth; diverges from radical empiricism"],["A Pluralistic Universe (1909)","Longmans Green — Lectures III and VIII most relevant"],["Essays in Radical Empiricism (1912, posthumous)","Longmans Green — Does Consciousness Exist? and A World of Pure Experience are primary"]],
    archives:[["Houghton Library, Harvard University","William James Papers (MS Am 1092) — extensive correspondence. James-ELC correspondence documented through Every-Day Ethics review 1906."]]
  },
  Weil: {
    ring:1, dates:"1909–1943", title:"The Attention Philosopher", confirmed:true,
    desc:"Weil's attention is ELC's conjunctive capacity at its most developed: not concentration but the suspension of self that makes space for what is genuinely other. Her Need for Roots (1943) specifies structural conditions for genuine human development — obligations and needs — that map directly onto ELC's five conditions from a Platonic direction. Her Iliad essay ('The Poem of Force', 1940) is exhibitive philosophy: it shows what the destruction of the conditions looks like from inside a life that cannot meet them. Both the analytical and exhibitive modes are present in Weil, for exactly the reasons ELC's work requires both.",
    elc:"Independent convergence across entirely different philosophical genealogies. Both developed accounts of the capacity for genuine openness — ELC as conjunctive capacity, Weil as attention — arriving at structurally parallel positions without mutual awareness. Weil's Iliad essay and ELC's poems are exhibitive philosophy about the same discovery from different starting points and different historical moments.",
    inf:[["Alain","Primary teacher at Henri IV; attention concept; Bergson student"],["Plato","The Good as transcendent; cave allegory; attention toward truth"],["Bergson","Filtered through Alain; duration; genuine effort of will"],["Marx","Early formation; conditions of labour; factory work experience"],["Kant","Moral law; duty without self-interest"]],
    out:[["Murdoch","Borrowed attention concept directly; centrepiece of Sovereignty of Good"],["Noddings","Engrossment = Weilean attention in feminist care ethics"],["ELC","Independent parallel — neither knew the other's work"],["Contemporary philosophy of attention","Weil as primary source"]]
  },
  "P-Pattison": {
    ring:1, dates:"1856–1931", title:"The Irreducibility Argument", confirmed:true,
    desc:"His Hegelianism and Personality (1887) is the clearest statement in the British idealist tradition that the Absolute cannot dissolve the individual self without destroying what makes it a self at all. Each self is a unique existence, perfectly impervious to other selves — impervious in a fashion of which the impenetrability of matter is a faint analogue. He identified the problem — what genuine selfhood resists — that ELC's conditions answered positively. His insistence that philosophy must eventually give way to religion and poetry to go further is the exhibitive judgment point stated from inside the tradition itself.",
    elc:"P-Pattison's critique of Bosanquet and Caird cleared the philosophical space for ELC's positive account. He showed why the Absolute was the wrong answer; she showed what the achieved individual self actually requires. The logical sequence: Hegelianism and Personality (1887) establishes the negative case → the question of positive conditions becomes pressing → ELC's five conditions answer it.",
    inf:[["T.H. Green","Direct formation in self-realisation ethics at Edinburgh and Oxford"],["Lotze","Individuality and the irreducible reality of consciousness"],["Hamilton","Scottish philosophy of consciousness as irreducible"],["Hegel","Critical engagement throughout; primary target of main argument"],["Caird","Opposed his Absolutism; sharpened the individuality question"]],
    out:[["ELC","His negative argument cleared the logical space for her positive one"],["Bowne","American personalist parallel — same negative argument independently"],["Bosanquet","Main opponent; sharpened the individuality question through debate"],["Rashdall","Idealist tradition; value theory"]]
  },
  Royce: {
    ring:1, dates:"1855–1916", title:"The Loyalty Philosopher", confirmed:true,
    desc:"The Philosophy of Loyalty (1908) specifies structurally parallel conditions to ELC's from a different starting point: the self is constituted through commitment to a cause genuinely one's own. The casual self — before loyalty — is a collection of impulses without coherent unity. The loyal self has appropriated one of its causes as its own and achieved genuine selfhood. His later interpretation theory in The Problem of Christianity — the self constituted through the ongoing process of making signs make sense in community — is his most rigorous account of the conditions for self-constitution.",
    elc:"40-year correspondence documented in the Royce Papers at Harvard. Her 1890 notebook entry 'The art of living is becoming other people' predates The Philosophy of Loyalty by eighteen years. Royce's 1899 metaphysics seminar notebooks identify her as its most intellectually significant participant. She influenced him; he gave her systematic philosophical vocabulary she then developed beyond his framework.",
    inf:[["Peirce","Logic, community of inquiry, fallibilism; lifelong dialogue"],["Lotze","Systematic idealism; world as will and representation"],["Hegel","Dialectical development; Absolute as goal of Spirit"],["James","Lifelong dialogue partner and primary critic; anti-Absolute pressure"],["Schopenhauer","Will as primary; world as struggle"]],
    out:[["ELC","Mutual influence — she shaped his loyalty account directly"],["C.I. Lewis","Modal logic; conceptual pragmatism at Harvard"],["T.S. Eliot","Harvard PhD under Royce; Absolute idealism into modernism"],["Du Bois","Beloved Community; community of memory and hope"],["Hocking","The Meaning of God in Human Experience (1912)"]],
    works:[["The Religious Aspect of Philosophy (1885)","Houghton Mifflin — argument from error for Absolute"],["The Spirit of Modern Philosophy (1892)","Houghton Mifflin — dedicated to Mary Gray Ward Dorr; lectures to a circle"],["The World and the Individual, 2 vols. (1900-01)","Macmillan — Gifford Lectures; systematic idealism"],["The Philosophy of Loyalty (1908)","Macmillan — closest to ELC's practical ethics; conditions from loyalty"],["William James and Other Essays (1911)","Macmillan — free Archive.org; relations with James and pragmatism"],["The Problem of Christianity, 2 vols. (1913)","Macmillan — interpretation theory; community of memory; Beloved Community"]],
    archives:[["Houghton Library, Harvard University","Royce Papers — documented 40-year correspondence with ELC. Royce's 1899 metaphysics seminar notebooks. Primary target for ELC-Royce relationship."]]
  },
  Palmer: {
    ring:1, dates:"1842–1933", title:"The Pedagogical Transmitter", confirmed:true,
    desc:"Palmer is the direct institutional transmission between Green's idealism and ELC. His Autobiography of a Philosopher (1930) exhibits the self as constituted through engagement with what is genuinely other — his philosophical development is a series of encounters with texts and people that changed what he was, not merely what he knew. The formation is constitutive. The Field of Ethics (1901) argues that genuine moral development requires the active appropriation of values — morality is not a code to be followed but a self to be achieved. The Teacher (1908, with Alice Freeman Palmer) articulates what genuine education requires: not transmission of content but enabling a process of self-constitution in the student.",
    elc:"Direct mentor-student relationship spanning decades. He introduced ELC to Green's ethics framework and to the systematic vocabulary for specifying conditions for genuine selfhood. He could transmit the framework but not originate its phenomenological starting point — interest as found. She gave him the starting point he lacked. The relationship was reciprocal in the way Palmer's best relationships always were: each made the other more themselves.",
    inf:[["T.H. Green","Directly absorbed; self-realisation as constitutively social"],["Emerson","Internalised as practical philosophical register; the American background"],["Hegel","Studied systematically; developmental structure of selfhood"],["Homer","Odyssey translation as philosophical act; teleological structure"],["Kant","Moral autonomy; self-legislation without heteronomy"]],
    out:[["ELC","Direct mentor — gave her Green's vocabulary and framework"],["Hocking","Harvard philosophical tradition continuation; direct student"],["Calkins","Wellesley/Harvard institutional network; direct student"],["Alice Freeman Palmer","Co-author; philosophy of education deployed"],["Santayana","Harvard philosophy; divergent direction"]],
    works:[["The Field of Ethics (1901)","Houghton Mifflin — systematic ethics; self-achievement through appropriation"],["The Nature of Goodness (1903)","Houghton Mifflin — value theory"],["The Teacher: Essays and Addresses on Education (1908)","Houghton Mifflin — with Alice Freeman Palmer; enabling self-constitution"],["The Life of Alice Freeman Palmer (1908)","Houghton Mifflin — exhibitive philosophy of self-achievement"],["The Autobiography of a Philosopher (1930)","Houghton Mifflin — primary exhibitive source; self constituted through engagement"],["Odyssey of Homer (translation, 1884)","Houghton Mifflin — teleological structure as exhibitive ethics"]],
    archives:[["Houghton Library, Harvard University","George Herbert Palmer Papers — correspondence with ELC documented."]]
  },

  // ── RING II ───────────────────────────────────────────────────────────────
  Caird: {
    ring:2, dates:"1835–1908", title:"The Scottish Transmitter", confirmed:false,
    unconfirmedNote:"ELC citation of Caird in unpublished manuscripts is noted in archival research but the specific manuscript location requires verification at Schlesinger A-139.",
    desc:"Edward Caird transmitted Green's ethics through two independent channels simultaneously — Palmer and ELC philosophically in America; Tawney, Beveridge, and Temple practically in Britain. His Evolution of Religion (1893) and Evolution of Theology in the Greek Philosophers (1904) developed an idealist account of progressive self-realisation through history. His mandate to Balliol students — 'go and discover why poverty exists and how to cure it' — generated the welfare state chain independently of his philosophical transmission to America.",
    elc:"ELC cites Caird directly in unpublished manuscripts [unconfirmed — archival verification pending]. His Balliol instruction generated Tawney, Beveridge, and Temple who implemented ELC's five conditions as the British welfare state. The same philosophical inheritance — Green's self-realisation ethics — produced two simultaneous independent deployments: ELC's philosophical systematisation and the welfare state's institutional implementation.",
    inf:[["T.H. Green","Direct colleague at Balliol; transmitted Green's full program after Green's death"],["Hegel","Primary philosophical study; evolutionary idealism"],["Kant","Critical philosophy as necessary starting point"],["Carlyle","Prophetic social criticism; the cash nexus argument"]],
    out:[["Palmer","Transmitted Green's ethics to Harvard curriculum"],["ELC","Cited directly in unpublished manuscripts [unconfirmed]"],["Beveridge","Five Giants ← Caird's mandate to understand poverty structurally"],["Tawney/Temple","Ethical socialism and welfare state theology"]],
    works:[["A Critical Account of the Philosophy of Kant (1877)","James MacLehose — systematic Kant scholarship"],["Hegel (1883)","William Blackwood — accessible introduction; shaped British Hegel reception"],["The Social Philosophy and Religion of Comte (1885)","James MacLehose"],["The Evolution of Religion, 2 vols. (1893)","James MacLehose — Gifford Lectures; progressive self-realisation in religion"],["The Evolution of Theology in the Greek Philosophers, 2 vols. (1904)","James MacLehose — Gifford Lectures"]],
    archives:[["Balliol College Archives, Oxford","Edward Caird Papers — correspondence with T.H. Green particularly important. Also Glasgow University Archives for Glasgow period."],["Glasgow University Archives","Papers from Caird's Glasgow period 1866-93 before becoming Balliol Master."]]
  },
  Bosanquet: {
    ring:2, dates:"1848–1923", title:"The Closest Structural Parallel", confirmed:true,
    desc:"The Value and Destiny of the Individual (1913) is the closest parallel to ELC's conditions project anywhere in British idealism. Both specify structural conditions for genuine individual development. His divergence is precise and philosophically important: he gets the conditions nearly right but the direction of constitution backwards — the individual must transcend into the social whole to achieve genuine selfhood, whereas ELC says the social whole enables the individual to become more fully and distinctly itself. The Philosophical Theory of the State (1899) deploys the same framework into political philosophy.",
    elc:"Bosanquet's Value and Destiny asks exactly ELC's question — what conditions does genuine individual development require? — and arrives at a structurally similar answer from within Absolute Idealism. His precise divergence is why P-Pattison had to write Hegelianism and Personality, which cleared philosophical space for ELC's positive account. He posed the question she answered better.",
    inf:[["T.H. Green","Direct formation; ethics of self-realisation through social life"],["Hegel","Primary metaphysical framework; Absolute as goal"],["Bradley","Parallel development in British idealism; logic of internal relations"],["Helen Bosanquet","Social work application at Charity Organisation Society"]],
    out:[["P-Pattison","His main target in Hegelianism and Personality (1887)"],["Muirhead","British idealist continuation into 20th century"],["Murdoch","In her formative reading list alongside Green and Bradley"],["ELC","His question; her better answer"]],
    works:[["Logic, or the Morphology of Knowledge, 2 vols. (1888)","Clarendon Press"],["The Philosophical Theory of the State (1899)","Macmillan — idealist political philosophy; conditions account applied to state"],["The Principle of Individuality and Value (1912)","Macmillan — Gifford Lectures; closest to ELC's project"],["The Value and Destiny of the Individual (1913)","Macmillan — Gifford Lectures; closest parallel to ELC's conditions; free Archive.org"]],
    archives:[["Newcastle University Special Collections","Bernard and Helen Bosanquet Papers — both archives together. Finding aid online."]]
  },
  Murdoch: {
    ring:2, dates:"1919–1999", title:"The Platonic Parallel", confirmed:true,
    desc:"Read the same library as ELC — Green, Bradley, Bosanquet — fifty years later in England, neither knowing the other existed. Her concept of attention (drawn directly from Weil) is her account of what the moral capacity fundamentally is: a just and loving gaze directed upon individual reality. Her M/D case — the mother who revises her perception of her daughter-in-law — shows moral change happening through the discipline of attention; ELC's framework handles this through the conjunctive capacity condition. Murdoch has transcendent normativity without diachronic ownership; ELC has diachronic ownership without transcendent normativity. Each supplies what the other lacks.",
    elc:"Independent parallel convergence from identical sources. Both read Green, Bradley, and Bosanquet as primary philosophical formation. Both borrowed attention from Weil. Both developed exhibitive modes (novels/poems) alongside analytical writing for the same philosophical reasons. The Cabot-Murdoch comparison paper — showing that ELC's account supplies the diachronic ownership dimension Murdoch's Platonism cannot provide — is the central argument for ELC's contemporary philosophical relevance.",
    inf:[["Green/Bradley/Bosanquet","Same formative reading list as ELC, 50 years later in Oxford"],["Weil","Borrowed attention concept directly; centrepiece of her ethics"],["Plato","The Good as independent transcendent standard; Platonic realism"],["Sartre","Critical engagement throughout; rejected his radical freedom"],["Kant","Target of critique; she defends moral perception against duty"]],
    out:[["Contemporary moral realism","Independent moral facts as perceptible by disciplined attention"],["Nussbaum","Love's Knowledge; narrative and moral knowledge"],["ELC","Independent parallel — mutual philosophical illumination"]],
    works:[["Sartre: Romantic Rationalist (1953)","Bowes and Bowes — first book; critique of Sartre's radical freedom"],["The Sovereignty of Good (1970)","Routledge — primary philosophical text; attention; the Good; unselfing"],["The Fire and the Sun: Why Plato Banished the Artists (1977)","Clarendon Press"],["Metaphysics as a Guide to Morals (1992)","Chatto and Windus — comprehensive philosophical statement"],["Under the Net (1954)","Chatto and Windus — first novel; exhibitive philosophy"],["The Sea, The Sea (1978)","Chatto and Windus — Booker Prize; exhibitive philosophy of conjunctive capacity failure"]],
    archives:[["Kingston University London, Murdoch Archive","Iris Murdoch Papers — primary archive for manuscripts, correspondence, notebooks."],["Bodleian Library, Oxford","Additional Murdoch materials."]]
  },
  "Du Bois": {
    ring:2, dates:"1868–1963", title:"The Obstruction Theorist", confirmed:true,
    desc:"Double consciousness is the conditions account from inside their systematic obstruction. The veil does not deny that Black Americans have interest — it blocks the conditions through which interest can achieve genuine selfhood: purposive activity denied through economic exclusion; social engagement denied through segregation; conjunctive capacity distorted by the psychological burden of constant self-doubling; temporal coherence disrupted by violence and displacement; the constitutive choice constrained by systemic denial of educational and civic opportunity. The Souls of Black Folk (1903) is philosophy in the exhibitive mode about what ELC specified analytically.",
    elc:"Both in Boston in the same decade, both formed by James and Royce at Harvard. Du Bois received his Harvard PhD in 1895; ELC began auditing Harvard courses in 1897. Both developing accounts of genuine self-constitution under conditions of structural difficulty. Neither knew the other's philosophical work — the convergence confirms that both were tracking the same structural reality from different positions within it.",
    inf:[["James","Direct student at Harvard; radical empiricism; stream of consciousness"],["Royce","Direct student; community of memory and hope; Beloved Community"],["Hegel","Studied in Berlin 1892-94; Geist as historical force; world-historical individuals"],["Crummell","African American philosophical predecessors; civilisationism"],["Wells","Investigative journalism; structural analysis of race violence"]],
    out:[["Alain Locke","New Negro philosophy; cultural self-achievement"],["King","Beloved Community via Royce-Du Bois chain; Montgomery to Memphis"],["Black feminist philosophy","Conditions under structural obstruction; intersectionality"],["ELC","Independent parallel — mutual philosophical illumination"]],
    works:[["The Suppression of the African Slave-Trade (1896)","Harvard Historical Studies — Harvard dissertation"],["The Philadelphia Negro (1899)","University of Pennsylvania — structural conditions and race"],["The Souls of Black Folk (1903)","A.C. McClurg — double consciousness; exhibitive philosophy; primary text"],["Darkwater (1920)","Harcourt Brace — double consciousness extended"],["Dusk of Dawn (1940)","Harcourt Brace — autobiographical philosophy; self-constitution under obstruction"],["Black Reconstruction in America (1935)","Harcourt Brace — structural conditions and historical self-determination"]],
    archives:[["University of Massachusetts Amherst, Special Collections","W.E.B. Du Bois Papers — primary archive. One of the most used collections in American intellectual history."]]
  },
  "T.H. Green": {
    ring:2, dates:"1836–1882", title:"The Idealist Foundation", confirmed:true,
    desc:"Green's Prolegomena to Ethics (1883) is the foundational statement that genuine moral agency requires structural social and developmental conditions. His Lectures on the Principles of Political Obligation extends the same argument into political philosophy: genuine freedom is not absence of constraint but the positive achievement of the conditions for genuine self-development. His critique of naturalist ethics — that no account of natural processes can generate genuine normative claims — is structurally the same as ELC's response to the deflation objection.",
    elc:"The entire transmission chain to ELC runs through Green: Green to Caird to Palmer to ELC philosophically; Green to Caird to Tawney, Beveridge, and Temple practically. ELC's five conditions are the systematic specification of what Green's ethics of self-realisation requires — stated without his metaphysical overclaim of the eternal self-consciousness that undermines his account.",
    inf:[["Hegel","Dialectical development of self-consciousness; concrete freedom"],["Kant","Autonomy; practical reason; freedom as self-legislation"],["Aristotle","Eudaimonia; conditions for genuine flourishing; politics as ethical"],["Carlyle","Social criticism; the industrial cash nexus; duties of the strong"],["Mill","Critical engagement; limits of utilitarian liberty"]]  ,
    out:[["Caird","Glasgow to Balliol; transmitted Green's full program to both continents"],["Palmer","Green's ethics at Harvard; American reception"],["P-Pattison","Critique and positive extension of idealist tradition"],["Bosanquet/Bradley","British idealist second generation; diverse developments"],["Ritchie","Natural rights as conditions for genuine agency; political philosophy"]],
    works:[["Prolegomena to Ethics (1883, posthumous)","Clarendon Press — foundational statement; structural conditions for genuine moral agency"],["Lectures on the Principles of Political Obligation (1895, posthumous)","Longmans Green — genuine freedom as positive achievement; free Archive.org"],["Works of Thomas Hill Green, 3 vols. (1885-88, ed. Nettleship)","Longmans Green — complete works; free Archive.org"]],
    archives:[["Balliol College Archives, Oxford","T.H. Green Papers — limited but extant. Correspondence with Caird particularly relevant."]]
  },
  Calkins: {
    ring:2, dates:"1863–1930", title:"The Self-Psychologist", confirmed:true,
    desc:"Calkins's self-psychology is the most rigorous account of the irreducible self in the American idealist tradition. Her central claim: psychology must study the self as the fundamental unit — not sensations, neural processes, or behavioral dispositions, but the self as a whole that has experiences, stands in genuine relation to objects, and genuinely engages other selves. Her Persistent Problems of Philosophy (1907) systematically argues for self-psychology against every reductionist alternative. She was denied the Harvard PhD she had earned on grounds of sex, despite completing all requirements and receiving endorsement from both James and Royce.",
    elc:"Both at Harvard/Radcliffe in the same decade, both formed by James and Royce, both publishing systematic practical ethics in the same period, both subsequently erased from the canonical record. The parallel erasure of Calkins and ELC is the strongest institutional evidence that the erasure was structural rather than a verdict on philosophical quality. ELC's five conditions and Calkins's self-psychology are complementary projects: Calkins specifies the irreducible self as the unit of psychological inquiry; ELC specifies the conditions under which that self achieves genuine selfhood.",
    inf:[["James","Direct supervisor at Harvard; stream of consciousness"],["Royce","Formation in idealism; community and self"],["Münsterberg","Experimental psychology at Harvard; methodology"],["Plato","Idealist background; knowledge as recollection"],["Lotze","Micro/macro consciousness; individuality"]],
    out:[["ELC","Parallel project — irreducible self requires ELC's conditions"],["Self-psychology tradition","Continuation at Wellesley"],["Mary Whiton Calkins Award","APA recognition; recovery project ongoing"]],
    works:[["An Introduction to Psychology (1901)","Macmillan — self as primary unit of psychology"],["The Persistent Problems of Philosophy (1907)","Macmillan — self-psychology against every reductionist alternative"],["The Good Man and the Good (1918)","Macmillan — ethics; closest to ELC's practical ethics domain"],["The Self in Scientific Psychology (1915, article)","American Journal of Psychology — self-psychology as scientific program"],["Review of May Sinclair's A Defence of Idealism (1919)","Harvard Theological Review — documents connection to British idealist network"]],
    archives:[["American Philosophical Society, Philadelphia","Mary Whiton Calkins Papers — primary archive. Correspondence with James, Royce."],["Wellesley College Archives","Calkins professional papers and course materials."]]
  },
  Follett: {
    ring:2, dates:"1868–1933", title:"The Creative Experience Philosopher", confirmed:true,
    desc:"Follett arrived at structurally parallel positions to ELC's through the analysis of groups, conflict, and creative experience rather than through the phenomenological starting point. Her concept of power-with as distinguished from power-over is the social engagement condition applied to organizational theory. Her analysis of conflict as constructive rather than destructive when handled through integration is her most original contribution: conflict is the occasion for genuine self-constitution through genuine engagement with what is other.",
    elc:"ELC's documented close friend and intellectual companion in the Boston progressive network. Both were doing structurally parallel philosophical work in the same city in the same period apparently without full awareness of the philosophical parallel. Follett's Creative Experience (1924) and ELC's teaching practice are the closest contemporary parallel deployments of the same philosophical position into social life.",
    inf:[["T.H. Green","Formation in idealist ethics at Cambridge and Newnham"],["Hegel","Developmental structure; conflict as generative"],["Dewey","Transactional experience; democracy and education"],["James","Pluralism; individual experience as real"]],
    out:[["ELC","Close friend; parallel practical deployment"],["Management theory","Power-with rediscovered in 1990s organisational theory"],["Community organising","Integration not domination as civic practice"]],
    works:[["The Speaker of the House of Representatives (1896)","Longmans Green — early political science work"],["The New State (1918)","Longmans Green — group organisation and democracy"],["Creative Experience (1924)","Longmans Green — her most philosophically developed work; power-with"],["Dynamic Administration (1941, posthumous)","Harper — management essays; power-with in organisational theory"]],
    archives:[["London School of Economics, British Library of Political and Economic Science","Mary Parker Follett Papers — primary archive."],["Radcliffe Institute, Harvard (Schlesinger Library)","May contain ELC-Follett correspondence. Check correspondence folders."]]
  },
  Korsgaard: {
    ring:2, dates:"1952–", title:"The Self-Constitution Analyst", confirmed:true,
    desc:"Korsgaard's Self-Constitution (2009) is the closest contemporary analytic parallel to ELC's achievement claim. Her central claim: the self is not given antecedently to action but is constituted through action. When you act, you express a principle and constitute yourself as a certain kind of agent. Bad action is self-destructive not merely morally but literally — it undermines the unity of the self. Her divergence from ELC is precise and philosophically important: her conditions are synchronic (what coherent self-constitution looks like at a moment) rather than diachronic (what genuine self-achievement requires across a life). ELC's five conditions specify the temporal developmental pathway Korsgaard's account presupposes but cannot supply.",
    elc:"Independent convergence within contemporary analytic ethics. Korsgaard arrives at the achievement claim from within Kantian ethics; ELC arrived at it from within Boston idealism seventy years earlier. Showing that ELC's account is prior to and more adequate than Korsgaard's — it provides the temporal and pre-reflective dimensions Korsgaard's account requires but cannot supply — is one of the strongest available arguments for ELC's contemporary philosophical relevance.",
    inf:[["Kant","Self-legislation; autonomy; the categorical imperative"],["Rawls","Political philosophy; overlapping consensus; direct supervisor"],["Parfit","Personal identity; what matters; psychological continuity"],["Christine Korsgaard","Self-Constitution as culminating statement"]],
    out:[["Contemporary Kantian ethics","Self-constitution as standard framework"],["Practical identity literature","Wide influence on agency theory"],["ELC","Independent parallel — ELC provides what Korsgaard lacks"]]
  },
  Bergson: {
    ring:2, dates:"1859–1941", title:"The Duration Philosopher", confirmed:true,
    desc:"Duration — genuine temporal experience as irreducible to a series of discrete moments — is the closest Continental account to the forward-backward structure of interest. His critique of the spatialization of time: when we represent time as a line with discrete points, we have already falsified what experience is. Genuine temporal experience is flowing, interpenetrating, always carrying the past into the present and anticipating the future. Creative Evolution (1907) argues that genuine development is not the unfolding of a predetermined plan but the genuinely creative emergence of the new — what interest reaches toward: not a fixed end but a genuine creation.",
    elc:"Independent convergence. Both Bergson and ELC were specifying the temporal structure of experience — interest's forward-backward reach — from different national philosophical traditions and with different philosophical methods. Bergson gave the phenomenological description of duration; ELC gave it the normative structure specifying what duration requires to become genuine selfhood rather than mere temporal succession.",
    inf:[["Spencer","Critical engagement; evolution without mechanism"],["Ravaisson","Of Habit (1838); spiritual transformation through practice"],["Maine de Biran","Felt effort of will as foundational; French phenomenology"],["Plotinus","Duration as participation in eternity"],["Kant","Time as form of intuition; he wanted to radicalise this"]],
    out:[["Alain","Absorbed into a practical philosophy of attention"],["Weil","Filtered through Alain; attention and duration"],["Maritain","Bergson as formation; then Catholic alternative"],["Merleau-Ponty","Embodied time; phenomenology of perception"],["ELC","Independent parallel — both specified temporal structure of experience"]]
  },
  Alain: {
    ring:2, dates:"1868–1951", title:"The Practical Attention Philosopher", confirmed:true,
    desc:"Alain is the pen name of Émile-Auguste Chartier, who taught philosophy at the Lycée Henri IV in Paris from 1909 to 1933 and wrote over five thousand propos — two-page philosophical essays written rapidly without revision, published in newspapers, philosophy practiced rather than merely theorized. His primary philosophical concern was the distinction between perception and sensation: sensation is what the body passively receives; perception is what the mind actively does, imposing form on sensation through the effort of attention. Genuine attention is active, willed, effortful — not passive reception but the exercise of the will to hold itself open to what is there rather than to what it wants or fears to find. This distinction is the direct philosophical source of Weil's attention concept. He was formed by Bergson but resisted Bergson's irrationalism; he was a Kantian but read Kant as a philosopher of liberation rather than duty — the will refusing to be determined by instinct, habit, and institutional pressure. The propos form is itself philosophically significant: it is philosophy in the exhibitive mode, philosophy that shows what genuine attention looks like in practice rather than merely stating what it is. He was doing what ELC was doing with her poems — specifying philosophical positions through a medium that exhibited them — from within French republican culture and through a completely different philosophical genealogy.",
    elc:"Alain is the pivotal figure in the French transmission chain that independently arrived at ELC's fifth condition. The chain runs: Maine de Biran identified the felt effort of will as the foundational philosophical datum → Bergson specified duration as the genuine temporal structure of experience → Alain transmitted both into a practical philosophy of active attention as the fundamental form of human freedom → Weil developed attention into the conjunctive capacity at its most extreme development. ELC arrived at the same condition through Green, Palmer, and James from an entirely different national philosophical tradition. The two chains — French spiritualist and Boston idealist — converged on the same philosophical discovery without mutual awareness. Alain is the figure who made that convergence possible by transmitting the French chain to Weil in its most practically deployable form.",
    inf:[["Maine de Biran","Felt effort of will as foundational; the French philosophical starting point he transmitted"],["Bergson","Duration and genuine temporal experience; absorbed and then partially resisted"],["Kant","Read as philosopher of liberation; autonomous will against determination"],["Jules Lagneau","His own teacher; attention and the existence of God; direct transmission"],["Descartes","Cartesian method; but pushed beyond the cogito toward the will"]],
    out:[["Weil","Direct student 1925–28; gave her the attention concept she developed into her central philosophy"],["Raymond Aron","Direct student; political philosophy and the limits of ideology"],["André Maurois","Direct student; literature as practical philosophy"],["ELC","Independent parallel: his propos as exhibitive mode = her poems as exhibitive mode"]]
  },
  Buchler: {
    ring:2, dates:"1914–1991", title:"The Exhibitive Judgment Philosopher", confirmed:true,
    desc:"Buchler's triadic theory of judgment — assertive, active, exhibitive — provides the philosophical framework within which ELC's poetry and prose can be understood as two modes of the same philosophical project. Assertive judgment states what is the case. Exhibitive judgment exhibits what cannot be fully stated — what can only be shown from inside its own occurrence. Some features of experience are apprehensible in exhibitive judgment in ways that assertive judgment cannot capture. His theory of the self as ordinally constituted through its relational engagements across multiple intersecting orders is structurally parallel to ELC's account of selfhood.",
    elc:"Buchler provides the philosophical justification for treating ELC's poems as philosophical texts rather than merely literary productions — the argument the scholarly edition requires. His exhibitive judgment concept is available from within the American pragmatist-naturalist tradition rather than requiring special pleading from within idealism. Used alongside Langer's presentational symbolism, the case for ELC's dual mode is made from two independent philosophical directions.",
    inf:[["Peirce","Semiotics; categories; firstness, secondness, thirdness"],["Dewey","Naturalism; experience as transaction"],["Santayana","Realms of being; animal faith"],["Columbia tradition","Woodbridge, Edman; American naturalism"]],
    out:[["Ordinal naturalism","Continuation at Graduate Center CUNY"],["ELC","Exhibitive judgment = philosophical legitimacy of her poems"],["Scholarly edition argument","Primary theoretical resource for justifying dual mode"]]
  },
  Bowne: {
    ring:2, dates:"1847–1910", title:"The American Personalist", confirmed:true,
    desc:"Bowne's Personalism insists on the irreducibility of the person and the necessity of genuine self-development. His core claim: genuine personhood is not given but must be developed through education, engagement, and the active exercise of freedom. The conditions for genuine personhood are real and specifiable. His critique of Absolute Idealism — that it sacrifices the genuine individuality of persons to an impersonal Absolute — is the Pringle-Pattison objection from within the American tradition at Boston University. The Bowne-Brightman-King chain is the most consequential practical deployment of the conditions account in American history.",
    elc:"Both in Boston simultaneously, both developing accounts of what genuine personhood requires, both insisting on irreducibility of the person against both materialism and absolute idealism. Bowne's institutional base was Boston University; ELC's was Radcliffe and King's Chapel. Their work was parallel rather than directly connected — independent deployments of structurally similar positions within the same city in the same period.",
    inf:[["Lotze","Systematic idealism; personhood as the key to reality"],["Kant","Autonomy; the person as end in itself"],["Hamilton","Scottish consciousness philosophy"],["T.H. Green","Self-realisation ethics; indirectly through reading"]],
    out:[["Brightman","Boston Personalism continuation; finite God theory"],["King","Personalist dignity grounds civil rights theology"],["ELC","Parallel project in same city — independent convergence"],["Methodist theology","Personalism as theological framework"]]
  },
  Ritchie: {
    ring:2, dates:"1853–1903", title:"The Conditions Applied to Politics", confirmed:true,
    desc:"Ritchie's Natural Rights (1895) is the conditions account applied to political philosophy: rights are achievements acquired through developing social membership, not natural possessions of pre-given individuals. The individual who has rights has them because they have developed the capacities for genuine social engagement that rights protect and enable. Rights are conditions for further development, not protections for what is already there. Darwin and Hegel (1893) reconciles evolutionary biology with idealist ethics — both show developmental processes requiring structural conditions.",
    elc:"Ritchie shows how ELC's conditions account extends into political philosophy — the argument from genuine selfhood to genuine social conditions generates a specific account of what justice requires. His critique of laissez-faire — it protects pre-given individual freedom but not the conditions for genuine freedom — is the political parallel to ELC's practical ethics. Both derive from the same Green-idealist source and arrive at complementary conclusions.",
    inf:[["T.H. Green","Primary formation; positive liberty; conditions for genuine freedom"],["Darwin","Evolutionary development as structural; natural selection"],["Hegel","Historical development; institutions as actualised spirit"],["Spencer","Critical engagement; laissez-faire fails the conditions test"]],
    out:[["L.T. Hobhouse","New liberalism; positive freedom; welfare liberalism"],["Green-idealist political tradition","Continuation into welfare state argument"],["ELC","Complementary deployment of same conditions account"]]
  },
  Aristotle: {
    ring:2, dates:"384–322 BC", title:"The Phronesis Precedent", confirmed:true,
    desc:"Aristotle belongs in Ring II not for virtue ethics generally but specifically for two parallel convergences. First: phronesis — practical wisdom — is strikingly close to ELC's conjunctive capacity. Phronesis is not the application of a rule but the capacity to perceive the morally relevant features of a particular situation, to hold oneself genuinely open to what is there rather than imposing a predetermined framework. It is acquired through experience and the cultivation of genuine perceptiveness — achieved, not innate. Second: oikeiosis — the natural development of moral concern from immediate self-care outward through family, community, and eventually all humanity — is ELC's social engagement condition as a developmental trajectory.",
    elc:"Aristotle provides the classical philosophical precedent for ELC's fifth condition (phronesis as conjunctive capacity) and for her social engagement condition as a developmental trajectory (oikeiosis). Locating these parallels in Aristotle strengthens the claim that the conditions pick out something real rather than reflecting one tradition's culturally specific assumptions.",
    inf:[["Plato","Critical formation; Forms vs particulars; phronesis against pure theory"],["Socrates","Dialectical method; self-knowledge as moral foundation"],["Pre-Socratics","Natural philosophy; hylomorphism as alternative to atomism"],["Theophrastus","Direct student; character studies; botanical analogy"]],
    out:[["Aquinas","Aristotelian hylomorphism + Christian theology"],["Scholastic tradition","Phronesis as prudentia; moral theology"],["MacIntyre","After Virtue; practices and virtues; Aristotelian revival"],["ELC","Phronesis = conjunctive capacity; oikeiosis = social engagement arc"]]
  },
  Langer: {
    ring:2, dates:"1895–1985", title:"The Presentational Symbol Philosopher", confirmed:false,
    unconfirmedNote:"Langer's presence in Cambridge overlapping with ELC is documented but direct connection or mutual awareness is unconfirmed. The parallel is philosophical, not biographical.",
    desc:"Philosophy in a New Key (1942) distinguishes discursive symbols — which state meaning propositionally and can be paraphrased — from presentational symbols, which exhibit meaning that cannot be fully discursively stated. A poem does not assert that human emotional life has a certain structure — it presents that structure in a way that can be recognized and felt but not paraphrased without loss. Her account of feeling — not emotion in the psychological sense but the felt quality of lived experience — as the content of presentational symbols provides the philosophical account of what ELC's poems exhibit that her prose conditions can only point toward.",
    elc:"Langer was at Cambridge and Harvard in the 1920s–30s, overlapping with ELC's final decade [connection unconfirmed — parallel is philosophical not biographical]. Alongside Buchler, she provides the philosophical vocabulary for defending the legitimacy of ELC's exhibitive mode in the scholarly edition argument. Her account comes from within philosophy of art rather than from formal logic, which is the more relevant register for a scholarly edition of poems.",
    inf:[["Cassirer","Philosophy of symbolic forms; human as symbol-making animal"],["Whitehead","Process philosophy; organic form"],["Frege","Logic of sense and reference; distinction from Cassirer"],["Wittgenstein","Tractatus as negative background; what cannot be said"]],
    out:[["Philosophy of art","Feeling and Form as standard reference"],["Music aesthetics","Sonata form as tonal motion"],["ELC","Presentational symbol = philosophical legitimacy of her poems [parallel]"]]
  },
  Hocking: {
    ring:2, dates:"1873–1966", title:"The Negative Pragmatist", confirmed:true,
    desc:"Hocking is the most important forgotten figure in the Boston idealist network. He entered Harvard 1899, studying under Royce simultaneously with ELC. He was the first American to study with Husserl at Göttingen (1902–03) — the personal bridge between American idealism and European phenomenology, also attending Dilthey, Natorp, Windelband, and Rickert. His central argument in The Meaning of God in Human Experience (1912): you know other minds through shared objects — when two people perceive the same tree, something genuinely public is there. His negative pragmatism sharpens James: 'that which does not work is not true' is a better criterion than 'that which works is true,' because failure is cleaner evidence than success. The Self, Its Body and Freedom (1928) argues for genuine freedom through the 'threshold of consent' against behaviourism. His error: accepting the Cartesian premise that generates the other-minds problem and then requiring God to solve it. He had the pieces for the better answer — the shared-objects insight anticipates Wittgenstein — but did not trust it.",
    elc:"Hocking and ELC were in Royce's seminars simultaneously from 1899. Both trained by James and Royce. Both published practical ethics and philosophy of religion books for educated general audiences. Hocking's 6,000-item correspondence at Houghton Library (MS Am 2375) includes materials from the Royce-ELC network; RCC's (Richard C. Cabot's) correspondence with Hocking is documented. Agnes Hocking co-founded the Shady Hill School with ELC's social network. Hocking is the figure who best shows what ELC's position looks like from inside the same tradition when the God-guarantee is still in place — his divergence from ELC's position makes her own advance visible.",
    inf:[["Royce","Direct supervisor; community of interpretation; the shared-objects insight"],["James","Radical empiricism; stream of consciousness; negative pragmatism sharpens James"],["Husserl","First American Husserl student; Göttingen 1902-03; phenomenological method"],["Dilthey/Natorp/Rickert","German idealist formation at Göttingen simultaneously with Husserl"],["Whitehead","Co-taught seminars at Harvard; Hocking instrumental in recruiting Whitehead 1924"]],
    out:[["ELC","Parallel project — negative pragmatism lacks her normative grounding from interest"],["Robinson","Royce and Hocking: American Idealists (1968) — first joint treatment"],["Agnes Hocking","Shady Hill School, Cambridge — practical philosophy of education deployed"],["Contemporary phenomenology","Bridge between American idealism and European phenomenology"]],
    works:[["The Meaning of God in Human Experience (1912)","Yale University Press — core argument"],["Human Nature and Its Remaking (1918)","Yale — self-constitution and social conditions"],["The Self, Its Body and Freedom (1928)","Yale — response to behaviourism; freedom of will"],["Types of Philosophy (1929)","Scribner — comprehensive philosophy textbook"],["Living Religions and a World Faith (1940)","Macmillan — comparative religious philosophy"],["The Meaning of Immortality in Human Experience (1957)","Harper — late philosophical theology"]],
    archives:[["Houghton Library, Harvard University","MS Am 2375 — 6000-item correspondence including James, Royce, Husserl, Whitehead, C.I. Lewis, Jung, Pearl S. Buck, Dewey. Primary target for ELC-Hocking connection."],["West Wind Estate, Madison NH","Books and papers; portion acquired by UMass Lowell after Kaag catalogued them. Peirce's personal copy of first publication reportedly there."]]
  },
  "J.E. Cabot": {
    ring:2, dates:"1821–1903", title:"The Emerson Transmitter", confirmed:true,
    desc:"James Elliot Cabot is the direct biographical bridge between Emerson and ELC — ELC's father-in-law. He was Emerson's literary executor and the author of A Memoir of Ralph Waldo Emerson (1887), the standard biography for a generation. He was also one of the founding members of the Cambridge Metaphysical Club's second phase (1876–79), the idealist phase, and was part of the Hegel Club (1880–81). His biography of Emerson shaped how the tradition read Emerson as a systematic philosopher of consciousness development rather than merely a literary figure. His specific interpretation — Emerson as a philosopher of purposive self-development, not merely an essayist — is the interpretive framework ELC received. The biographical connection is not incidental: Cabot brought both Emerson's texts and his own systematic philosophical reading of them directly into ELC's household.",
    elc:"Cabot was ELC's father-in-law — she married his son Richard C. Cabot in 1894. She absorbed Emerson through two channels simultaneously: direct family transmission through Cabot's presence and his biography, and through Palmer's curriculum at Harvard, which drew on the same Cabot-inflected reading of Emerson. Cabot's Memoir was the authoritative interpretation of Emerson available to ELC's generation. His participation in the Cambridge Metaphysical Club's idealist phase places him inside the tradition's founding moment. ELC's practical ethics are in part the systematisation of what Cabot's biography identified as Emerson's philosophical project.",
    inf:[["Emerson","Close friendship; literary executor; author of standard biography (1887)"],["Cambridge Metaphysical Club (Phase 2)","Founding participant in idealist phase 1876-79"],["Hegel Club","Participant 1880-81; Boston idealist formation"],["Kant","Philosophical formation in German idealism"]],
    out:[["ELC","Father-in-law; transmitted Emerson's systematic philosophical reading into her household"],["Richard C. Cabot","Son; ELC's husband; philosophical household"],["Boston idealist tradition","Emerson filtered through Cabot's systematic reading"]],
    works:[["A Memoir of Ralph Waldo Emerson, 2 vols. (1887)","Houghton Mifflin — standard Emerson biography for a generation; shapes ELC's received Emerson"],["Kant's First Critique (translation, contributed)","Cambridge Metaphysical Club work"]],
    archives:[["Houghton Library, Harvard University","Cabot Papers — correspondence, manuscripts related to Emerson biography. Also contains materials related to Cambridge Metaphysical Club."],["Schlesinger Library, A-139","ELC Papers contain correspondence with Cabot family; RCC correspondence with family."]]
  },
  "E.G. Balch": {
    ring:2, dates:"1867–1961", title:"The Nobel Parallel", confirmed:true,
    desc:"Emily Greene Balch is the most important underdiscussed figure in ELC's direct social network. Wellesley professor of economics and sociology 1896–1918, fired for her pacifism during WWI — the same institutional suppression that ELC navigated carefully. Founder with Jane Addams of the Women's International League for Peace and Freedom (WILPF) in 1919. Nobel Peace Prize 1946. She was directly part of the Denison House settlement house network in Boston — the American parallel to Toynbee Hall — through which Green-Caird practical ethics were being deployed simultaneously with ELC's philosophical systematisation. Her Our Slavic Fellow Citizens (1910) is a systematic study of immigration and social conditions using the same framework of structural conditions for genuine human development that ELC was specifying philosophically.",
    elc:"Balch and ELC were in the same Boston progressive network simultaneously — both connected to Denison House, both associated with Wellesley, both working in the practical ethics register. Balch represents the settlement house arm of the same tradition: where ELC was specifying the conditions for genuine selfhood philosophically, Balch was documenting what the denial of those conditions looked like in actual immigrant lives. Her Nobel represents the practical deployment of the tradition receiving its highest external validation — at exactly the same moment the philosophical tradition was invisible.",
    inf:[["T.H. Green","Self-realisation ethics transmitted through the Boston progressive network"],["Addams","Co-founder of WILPF; settlement house movement; Hull House model"],["Wellesley tradition","Economics and sociology of social conditions; Scudder connection"],["Quaker tradition","Later conversion; pacifism; conditions for genuine community"]],
    out:[["WILPF","Women's International League for Peace and Freedom — structural conditions for peace"],["ELC","Direct network overlap — parallel practical deployment in same city"],["Scudder","Wellesley colleague; co-founder of College Settlements Association"]],
    works:[["Our Slavic Fellow Citizens (1910)","Charities Publication Committee — structural conditions and immigration"],["Approaches to the Great Settlement (1918)","B.W. Huebsch — conditions for genuine international peace"],["Occupied Haiti (1927)","Writer — conditions analysis applied to US occupation"]],
    archives:[["Sophia Smith Collection, Smith College","Emily Greene Balch Papers — primary archive. Same collection as Vida Scudder papers."],["Swarthmore College Peace Collection","WILPF records and Balch correspondence"]]
  },
  "H. Bosanquet": {
    ring:2, dates:"1860–1925", title:"The British Practical Parallel", confirmed:true,
    desc:"Helen Bosanquet is the practical arm of Bernard Bosanquet's philosophical framework, developed through years of direct casework with the poor in Shoreditch. Newnham College Cambridge, First Class in the Moral Sciences Tripos 1889, then denied any academic position. She joined the Charity Organisation Society, eventually becoming its theorist. Member of the Royal Commission on the Poor Laws 1905–09, major influence on the Majority Report. The Bosanquet-Webb debate is the defining early twentieth-century British argument over social welfare: she defended individual character development through charitable casework; Beatrice Webb argued for structural state provision. This is the same opposition ELC's five conditions attempt to dissolve — structural conditions are what make genuine character development possible, not the alternative to it.",
    elc:"Helen Bosanquet and ELC represent the British and American instances of the same project: women doing practical philosophy in the Green-Caird tradition simultaneously, both systematically erased, both appearing only as adjuncts to male figures. Both were applying the tradition's mandate — go and discover why poverty exists — to actual social conditions. The comparison between them is a genuine scholarly contribution: what Helen Bosanquet was doing in Britain's social welfare debates, ELC was doing in America's practical ethics classrooms. Both drew from the same philosophical source; both arrived at structurally parallel accounts of the conditions for genuine human development; both are now invisible.",
    inf:[["T.H. Green","Self-realisation ethics; conditions for genuine freedom; direct formation"],["Bosanquet","Philosophical framework; Value and Destiny of the Individual (1913)"],["Charity Organisation Society","Direct casework with the poor in Shoreditch; empirical foundation"],["Beatrice Webb","Primary opponent; structural provision vs character development debate"]],
    out:[["ELC","British parallel — practical ethics in same tradition simultaneously erased"],["Poor Law reform","Majority Report 1909; direct policy influence"],["Social work theory","The Family (1906) as foundational text"]],
    works:[["Rich and Poor (1896)","Macmillan — conditions analysis applied to social welfare; free Archive.org"],["The Standard of Life (1898)","Macmillan — conditions for genuine human development"],["The Family (1906)","Macmillan — the family as the primary social condition for selfhood"],["Social Work in London 1869-1912 (1914)","John Murray — history and theory of the COS"]],
    archives:[["Newcastle University Special Collections","Both Bernard and Helen Bosanquet papers are here. Finding aid available online. Primary archive for the Bosanquet-Webb debate materials."]]
  },
  "M. Sinclair": {
    ring:2, dates:"1863–1946", title:"The Idealist Novelist", confirmed:true,
    desc:"May Sinclair is the British parallel to ELC as a philosopher working in non-standard registers. Best known as a modernist novelist — she introduced the term 'stream of consciousness' to English literary criticism — she published two systematic philosophical books: A Defence of Idealism (1917, Macmillan) and The New Idealism (1922, Macmillan), both engaging Bradley and the British idealist tradition seriously. A Defence of Idealism was reviewed by Mary Whiton Calkins in the Harvard Theological Review in 1919, placing her in documented contact with the American network. She was doing for British literary-philosophical culture what ELC was doing for American practical ethics: working the idealist tradition into a different register, simultaneously, without recognition as a philosopher.",
    elc:"The Calkins review of A Defence of Idealism (1919) is the documented connection between Sinclair and the American idealist network that included ELC. Both were applying idealist philosophy to different registers — Sinclair to literary modernism, ELC to practical pedagogy — and both were erased as philosophers from the record that retained them as minor cultural figures. Both drew from Bradley and the British idealist tradition. Sinclair's use of stream of consciousness as a critical term — introducing it into English literary criticism from James's psychological concept — is the same conceptual inheritance as ELC's fifth condition: James's conjunctive relations becoming a formal literary device on one side of the Atlantic while becoming a pedagogical condition on the other.",
    inf:[["Bradley","Primary philosophical influence; Appearance and Reality; internal relations"],["James","Stream of consciousness as critical term; psychological novel"],["British idealist tradition","Green-Bradley formation through reading"],["Meredith","Literary formation; psychological realism"]],
    out:[["Calkins","Reviewed A Defence of Idealism in Harvard Theological Review 1919 — documented connection"],["ELC","British parallel — philosopher in non-standard register, simultaneously erased"],["Literary modernism","Stream of consciousness as critical terminology"]],
    works:[["A Defence of Idealism (1917)","Macmillan — systematic philosophical defence of British idealism"],["The New Idealism (1922)","Macmillan — extended idealist philosophy against realism"],["Mary Olivier: A Life (1919)","Cassell — novel using stream of consciousness; philosophical in register"],["The Life and Death of Harriett Frean (1922)","Collins — exhibitive philosophy of selfhood failure"]],
    archives:[["Kislak Center for Special Collections, University of Pennsylvania","Primary collection — correspondence, manuscripts, diaries. Catalogued for sixty years. Primary target."],["The Keep, University of Sussex","Additional manuscript material. Catalogued 2024. New access."]]
  },
  Scudder: {
    ring:2, dates:"1861–1954", title:"The Wellesley Colleague", confirmed:true,
    desc:"Vida Dutton Scudder was ELC's direct Wellesley colleague — both on the faculty simultaneously. Christian socialist, settlement house worker, co-founder of the College Settlements Association with Jane Addams, and author of substantial works on the relationship between literature, social conditions, and spiritual development. Her Socialism and Character (1912) is the most direct statement of her position: genuine character development — what the Green-Caird tradition specified as the goal of genuine selfhood — requires the structural conditions that socialism is designed to provide. This is structurally identical to ELC's five conditions stated from a Christian socialist rather than a practical ethics perspective. Her autobiography On Journey (1937) is exhibitive philosophy: self-constitution through engagement with literature, faith, and social action, documented from inside.",
    elc:"ELC and Scudder were colleagues at Wellesley simultaneously. Both were women doing practical philosophy in the Green-Caird tradition. Both were applying the tradition's social mandate through different vehicles — ELC through teaching ethics, Scudder through settlement house work and Christian socialism. The comparison between their approaches shows the tradition generating two distinct practical deployments from the same institutional base, with neither aware they were doing structurally parallel philosophical work.",
    inf:[["T.H. Green","Self-realisation ethics; conditions for genuine freedom"],["Addams","Settlement house co-founder; College Settlements Association"],["Anglo-Catholic tradition","Christian socialism; incarnational theology"],["William Morris","Arts and Crafts socialism; beauty as condition for genuine life"]],
    out:[["ELC","Wellesley colleague — parallel practical deployment from same institutional base"],["E.G. Balch","Wellesley connection; co-founder College Settlements Association"],["Christian socialist tradition","Socialism and Character as foundational statement"]],
    works:[["The Life of the Spirit in the Modern English Poets (1895)","Houghton Mifflin"],["Social Ideals in English Letters (1898)","Houghton Mifflin"],["Socialism and Character (1912)","Houghton Mifflin — conditions for genuine character require structural socialism"],["On Journey (autobiography, 1937)","Dutton — exhibitive philosophy of self-constitution"]],
    archives:[["Sophia Smith Collection, Smith College","Vida Dutton Scudder Papers — primary archive. Same collection as Emily Greene Balch. Direct access to Wellesley network correspondence."]]
  },
  Pratt: {
    ring:2, dates:"1875–1944", title:"The Parallel Pragmatism Critic", confirmed:true,
    desc:"James Bisset Pratt was at Harvard 1899–1905 under both William James and Josiah Royce — exactly when ELC was auditing Harvard courses. His What is Pragmatism? (1909) makes the distinction between radical empiricist James and pragmatist James in 1909, decades before Misak identified it as the key analytical move. He accepted James's religious psychology while firmly rejecting his pragmatist theory of truth — which is precisely the move ELC's position requires. His Religious Consciousness (1920) is the second major work in the psychology-of-religion movement after James's Varieties. Both he and ELC were students of James and Royce simultaneously, both criticized pragmatism's subjectivism while working within James's psychology-of-religion tradition, both published practical ethics and religion books for educated general audiences, and both are now invisible.",
    elc:"Pratt and ELC were in the same Harvard seminar rooms in the same years — both students of James and Royce simultaneously 1899–1905. Both criticized the pragmatist theory of truth while accepting radical empiricist psychology. Both published practical philosophy for educated audiences. His Hocking correspondence at Williams — documenting his connection to Hocking, who is documented in ELC's Schlesinger papers — makes Williams College Special Collections a priority archival target for the ELC recovery project.",
    inf:[["James","Direct student at Harvard; accepted his religious psychology; rejected his pragmatism"],["Royce","Direct student at Harvard; community and self-constitution"],["Pfleiderer","Year in Berlin under German philosopher of religion"],["Mark Hopkins tradition","Williams College intellectual formation"]],
    out:[["Psychology of religion","Religious Consciousness (1920) as second standard work after James"],["ELC","Parallel project in same years — pragmatism critique from inside the tradition"],["Hocking","Documented correspondence at Williams — connects to ELC network"]],
    works:[["What is Pragmatism? (1909)","Macmillan — the James radical empiricist / pragmatist distinction made in 1909"],["The Religious Consciousness (1920)","Macmillan — standard work in psychology of religion after James Varieties"],["Matter and Spirit (1922)","Macmillan — philosophy of mind and freedom"],["Personal Idealism and Mysticism (1925)","Scribner — idealist conditions for genuine religious experience"]],
    archives:[["Williams College Special Collections","James Bisset Pratt Papers — includes documented correspondence with Hocking. Priority target: Hocking letters connect directly to ELC network."]]
  },
  "Hoernlé": {
    ring:2, dates:"1880–1943", title:"The South African Arm of Caird", confirmed:true,
    desc:"Reinhold Friedrich Alfred Hoernlé studied under J.A. Smith, Edward Caird, and Bosanquet, then pursued his career at the University of the Witwatersrand. The Routledge Encyclopedia of Philosophy calls him 'perhaps the best known of South African philosophers' and places him squarely in the generation of students shaped by the early British idealists. His own term was 'synoptic idealism' — the consideration of problems from every possible angle — a direct extension of Bosanquet's empirical idealism. He applied the tradition's practical mandate to questions of racial justice in South Africa: a major progressive force cited with respect in Alan Paton's Cry the Beloved Country. His Studies in Contemporary Metaphysics (1920) and Idealism as a Philosophy (1927) are the most accessible statements. He represents the South African arm of the Caird tradition, where the same philosophical inheritance that produced the British welfare state produced instead a liberal anti-apartheid politics that was ultimately insufficient.",
    elc:"Hoernlé and ELC are parallel deployments of the Caird tradition across different continents and different social problems — ELC in Boston applying the conditions to practical ethics and teaching, Hoernlé in South Africa applying them to racial justice. Both trained from the same source (Caird, Bosanquet), both applied the tradition's practical mandate, both are now largely invisible. He reviewed H.J. Paton's Kant's Metaphysic of Experience in Mind (1937) and co-authored a paper with DeWitt Parker in the Philosophical Review (1934) — documenting his active engagement with the same scholarly networks that connect to ELC's tradition.",
    inf:[["Caird","Direct formation; Caird's social mandate applied to South African conditions"],["Bosanquet","Empirical idealism as framework; synoptic idealism as extension"],["J.A. Smith","Oxford formation alongside Bosanquet influence"],["Alan Paton","Cited in Cry the Beloved Country — major progressive force in South Africa"]],
    out:[["South African liberal tradition","Anti-apartheid politics from within idealist framework"],["ELC","Parallel deployment of Caird tradition to different social problem"],["DeWitt Parker","Co-authored paper in Philosophical Review 1934 — scholarly network connection"]],
    works:[["Studies in Contemporary Metaphysics (1920)","Harcourt Brace — response to realist-idealist debate"],["Idealism as a Philosophy (1927)","Hodder and Stoughton — most accessible statement of synoptic idealism"],["White Politics and the Colour Bar in South Africa (1939)","South Africa Institute of Race Relations"]],
    archives:[["University of the Witwatersrand Library","Alfred Hoernlé Papers — primary South African archive."],["York University Libraries","Duplicate finding aid — contact York for remote access before travel to Wits."]]
  },
  Thompson: {
    ring:2, dates:"1848–1924", title:"The Early Transmitter at Radcliffe", confirmed:true,
    desc:"Anna Boynton Thompson is the earliest and least-known figure in ELC's immediate network. She was at Radcliffe doing graduate work with Royce specifically from 1899 to 1902 — exactly overlapping with ELC's Harvard period — and published The Unity of Fichte's Doctrine of Knowledge (1895) in a series edited by Royce, demonstrating full scholarly standing in the tradition. Her most important practical contribution: she identified Mary Parker Follett as an exceptional student and sent her to Newnham College Cambridge around 1890, where Follett absorbed the Green-Caird tradition directly. Thompson is therefore the institutional bridge between the Harvard idealist network and Follett — and therefore between the Boston network and the British practical philosophy tradition that shaped Follett's Creative Experience.",
    elc:"Thompson was at Radcliffe in Royce's seminars simultaneously with ELC. Her role as Follett's early mentor means she is the connecting figure between two of ELC's closest contemporaries in the Boston progressive network — Follett and ELC were close friends, and Thompson was Follett's initial intellectual sponsor. The Thompson-Follett connection is the hidden institutional link that explains why Follett's philosophy of power-with and ELC's conditions account are structurally parallel: both received the Green-Caird tradition through the same Harvard-Radcliffe channel.",
    inf:[["Royce","Direct supervisor at Radcliffe; community and self-constitution"],["Fichte","Published doctoral work on Fichte in Royce's series"],["Harvard idealist tradition","Green-Palmer-Royce formation"]],
    out:[["Follett","Identified as exceptional and sent to Newnham Cambridge c.1890 — pivotal institutional intervention"],["ELC","Simultaneous Radcliffe presence 1899-1902"]],
    works:[["The Unity of Fichte's Doctrine of Knowledge (1895)","Published in Royce's series — documented scholarly standing"]],
    archives:[["Schlesinger Library, Harvard","May appear in ELC correspondence. No separate Thompson archive confirmed."]]
  },
  Haldane: {
    ring:2, dates:"1856–1928", title:"The Tradition into Policy", confirmed:true,
    desc:"Richard Burdon Haldane is the figure who took the Green-Caird idealist tradition and deployed it as national policy — the British equivalent of what Beveridge would do for welfare two decades later. Educated at Edinburgh and Göttingen, he absorbed Caird's idealism and then built a political career around deploying it: Secretary of State for War 1905–12, implementing the Haldane Reforms that created the British Expeditionary Force; Lord Chancellor 1912–15; Lord Chancellor again 1924. His The Pathway to Reality (1903–04, Gifford Lectures) and The Reign of Relativity (1921) are his philosophical statements. His Philosophy of Humanism (1922) is the most direct account of his idealist framework. He was pushed out as Lord Chancellor in 1915 when accused of pro-German sympathies — a casualty of the same political dynamics that were simultaneously displacing German idealism from British philosophy. He had studied Hegel in Germany, found in German Wissenschaft the philosophical depth that English empiricism lacked, and was then destroyed by the association when WWI made all things German suspect.",
    elc:"Haldane represents the political deployment of the same Caird tradition that produced ELC's philosophical systematisation: same source, different register. Where ELC took Green's mandate into the classroom and practical ethics, Haldane took it into Parliament and national policy. His fall in 1915 — destroyed by his German philosophical connections — is the political parallel to the philosophical displacement of the tradition that the Moore-Russell-Perry analytic revolution was simultaneously effecting in academic philosophy. Both erosions happened simultaneously and independently. Haldane also shows why the tradition's historical invisibility is not merely academic: its practitioners were removed from positions of influence by the same wartime politics that made German philosophy unacceptable.",
    inf:[["Caird","Primary philosophical formation; Edinburgh and Göttingen"],["Hegel","Direct study in Germany; German Wissenschaft as philosophical depth"],["Lotze","German idealist formation in Göttingen"],["Caird circle","Tawney, Temple, Beveridge as parallel Balliol formation"]],
    out:[["British military reform","Haldane Reforms 1905-12; BEF; Territorial Army"],["Imperial College London","Co-founder; practical deployment of educational conditions"],["ELC","Parallel deployment of Caird tradition — policy vs philosophy"]],
    works:[["The Pathway to Reality, 2 vols. (1903-04)","John Murray — Gifford Lectures; idealist philosophy of science"],["The Reign of Relativity (1921)","John Murray — idealism and Einstein; popular philosophy of science"],["The Philosophy of Humanism (1922)","John Murray — most direct statement of his idealist framework"],["Richard Burdon Haldane: An Autobiography (1929)","Hodder and Stoughton — posthumous"]],
    archives:[["National Library of Scotland, Edinburgh","Haldane Papers — primary archive for correspondence and political papers."],["Houghton Library, Harvard","May appear in Hocking correspondence given Haldane's philosophical-political network."]]
  },

  // ── RING III ──────────────────────────────────────────────────────────────
  Hegel: {
    ring:3, dates:"1770–1831", title:"The Developmental Structure", confirmed:true,
    desc:"Hegel's phenomenology of spirit is the most ambitious attempt to show how genuine selfhood is constituted through a developmental process. The self that has achieved Absolute Knowing has passed through every stage of the dialectic, appropriating each and finding it insufficient until the final integration. The conditions for genuine self-development are specified by the dialectic. The divergence is fundamental: Hegel's subject is cosmic Spirit, not individual interest. The individual self is a moment in Spirit's self-development, not an achievement in its own right. He gets the developmental structure right and the subject wrong.",
    elc:"Hegel is the background formation for the entire tradition that produced ELC. Green, Caird, Bradley, Bosanquet, and Palmer all studied Hegel systematically. ELC received Hegel mediated through this tradition rather than directly. His developmental structure is the inherited framework; his dissolution of the individual into Spirit is the error the Boston tradition was correcting.",
    inf:[["Kant","Critical philosophy as starting point; he wanted to complete it"],["Fichte","I positing not-I; dialectical method"],["Schelling","Nature philosophy; identity philosophy"],["Ancient Greeks","Especially Plato, Aristotle, Heraclitus"]],
    out:[["T.H. Green","British reception; self-realisation ethics"],["Marx","Inverted dialectic; material base"],["Kierkegaard","Existentialist reaction; the individual against the system"],["Caird","Evolutionary idealism; Scottish reception"]]
  },
  Dewey: {
    ring:3, dates:"1859–1952", title:"The Instrumentalist", confirmed:true,
    desc:"Dewey's account of experience as ongoing transaction between organism and environment, growth as the expansion of the capacity for further growth, and education as the reconstruction of experience — all structurally similar to the conditions account. His critique of spectator theory of knowledge and his insistence on experience as primary are correct and important. The divergence: instrumentalism reduces the conditions for genuine development to conditions for effective functioning. Why genuine growth is better than mere adaptation cannot be grounded within his naturalism without importing a normative claim his framework cannot supply.",
    elc:"Dewey and ELC were contemporaries working in the same American philosophical tradition with overlapping influences (James, Peirce, the idealist tradition they both reacted against). Dewey's instrumentalism is the reduction that ELC's starting point in interest as found was designed to avoid: effectiveness is not the criterion, genuineness is. Their divergence makes the position clearer by contrast.",
    inf:[["Hegel","Early formation in Hegelian idealism; then rejected"],["James","Pragmatism; radical empiricism; experience as primary"],["Peirce","Inquiry and belief; logical method"],["Darwin","Evolutionary biology; organism-environment transaction"]],
    out:[["Instrumentalism","Dominant American philosophy of education"],["Chicago school","Social philosophy; Hull House connection"],["Rorty","Neo-pragmatism; no mirrors of nature"],["ELC","Her starting point avoids his instrumentalist reduction"]]
  },
  Kant: {
    ring:3, dates:"1724–1804", title:"The Floor", confirmed:true,
    desc:"Kant establishes the floor on which ELC's position builds. The transcendental unity of apperception — the formal I-think that must be able to accompany all my representations — is the minimum formal condition for the possibility of experience. The Paralogisms chapter specifically warns against moving from this formal condition to a substantive soul. ELC's starting point does not make that move. Kant establishes the floor; her conditions describe what can be built on it. The relationship is complement rather than opposition.",
    elc:"Kant is the unavoidable background for the entire British idealist tradition that shaped ELC through Green, Palmer, and Caird. The transcendental analytic gives the vocabulary for specifying necessary conditions; ELC applies this vocabulary to the conditions for genuine self-achievement rather than to the conditions for the possibility of experience.",
    inf:[["Hume","Critical response; Copernican revolution in philosophy"],["Rousseau","Moral autonomy; general will"],["Wolff","Rationalist background; German philosophy"],["Newton","Scientific knowledge as the paradigm to account for"]],
    out:[["Fichte","Absolute I; self-positing subject"],["T.H. Green","Self-realisation ethics; Kantian autonomy socialised"],["Korsgaard","Self-constitution; contemporary Kantian ethics"],["Virtually all modern philosophy","The unavoidable background"]]
  },
  Peirce: {
    ring:3, dates:"1839–1914", title:"The Logic of Inquiry", confirmed:true,
    desc:"Peirce's account of inquiry starting from the irritation of doubt and the settlement of belief is structurally close to the starting point. The semiotic self — constituted through sign-relations, through the ongoing process of making signs make sense in community — is his most developed account of self-constitution, and it is close. His fallibilism — inquiry is always provisional, always reaching toward a truth it cannot fully possess — is the formal structure of interest following itself honestly. The divergence: his starting point is logic rather than phenomenology, which produces a more formal and less normatively grounded account.",
    elc:"ELC inherits the Peircean insight through Royce and James. Her fifth condition — the conjunctive capacity — is the Peircean account of genuine inquiry applied to practical ethics: what genuine purposive engagement requires is what genuine inquiry requires, specified for the domain of the lived life rather than for the domain of theoretical knowledge.",
    inf:[["Kant","Categories; logic of judgment"],["Duns Scotus","Realism about universals; haecceity"],["Boole","Algebra of logic"],["Agassiz","Natural history; classification"]],
    out:[["James","Pragmatism; though James transformed it"],["Royce","Community of interpretation; sign-relations"],["Dewey","Inquiry and reconstruction; instrumentalist divergence"],["Misak","Neo-pragmatism; revival of Peircean inquiry model"]]
  },
  Sartre: {
    ring:3, dates:"1905–1980", title:"The Radical Freedom Philosopher", confirmed:true,
    desc:"Sartre agrees that existence precedes essence — the self is not given but made — and that bad faith is the evasion of the constitutive choice. Both claims are correct and directly relevant to ELC's position. The divergence: radical freedom without conditions is not freedom but arbitrariness. Sartre describes the structure of bad faith accurately but fails to specify what genuine self-achievement requires. He also makes the pour-soi constitutively lacking — the self is always not-yet-itself, always projecting toward a completion it can never reach. This is too strong: genuine self-achievement is possible. ELC's conditions can be met.",
    elc:"Sartre's bad faith is the most precise contemporary philosophical account of what ELC calls the failure of the constitutive choice — living as if the self were fixed and given rather than achieved through active appropriation. His account of bad faith strengthens ELC's achievement claim by showing what the failure looks like from inside. His radical freedom is the over-correction her conditions account corrects.",
    inf:[["Husserl","Phenomenological method; intentionality"],["Heidegger","Being-in-the-world; dasein; authenticity"],["Hegel","Dialectic; consciousness and self-consciousness"],["Descartes","Cogito; consciousness as self-transparent"]],
    out:[["De Beauvoir","Corrected his radical freedom toward social constitution"],["Camus","Absurdism; alternative to Sartrean commitment"],["Merleau-Ponty","Embodied subject; phenomenology of perception"],["French existentialism","Dominant cultural philosophy post-WWII"]]
  },
  Bradley: {
    ring:3, dates:"1846–1924", title:"The Absolute Idealist", confirmed:true,
    desc:"Bradley's critique of atomic individualism — an isolated self is a contradiction in terms, genuine selfhood requires genuine social engagement — is structurally relevant and correct. His Appearance and Reality argues that finite selves are appearances of the Absolute rather than genuine realities in their own right. This is the Pringle-Pattison target: Bradley dissolves the individual self more completely than Hegel's Spirit. The critique of atomic individualism is right; the dissolution of the individual into the Absolute is the error.",
    elc:"Bradley is the most important negative background figure for ELC's tradition. Green, Bosanquet, and P-Pattison were all in direct dialogue with his absolute idealism. ELC's conditions are partly specified against his dissolution of the individual — the conditions describe what the achieved self requires, showing that individuality is not appearance but genuine achievement.",
    inf:[["Hegel","Absolute idealism; logic of internal relations"],["Green","British idealist formation; then diverged toward Absolute"],["Lotze","Idealist logic; value and reality"],["Spencer","Critical engagement; associationism as inadequate"]],
    out:[["Bosanquet","Parallel absolute idealism; Value and Destiny"],["Appearance/Reality tradition","Logic of internal relations"],["Russell/Moore","Primary targets of their revolt against idealism"],["Murdoch","In her formative reading; problem-mystery distinction"]]
  },
  "C.I. Lewis": {
    ring:3, dates:"1883–1964", title:"The Logic Heir", confirmed:true,
    desc:"Clarence Irving Lewis was Royce's direct student — undergraduate Harvard 1902–06, PhD 1910 under Royce, served as Royce's teaching assistant in logic. When Peirce died, Royce arranged for the manuscripts to come to Harvard; when Lewis returned in 1920 and catalogued them, the pragmatic a priori concept fell into place. He coined 'qualia.' He founded modern modal logic (systems S1–S5). His students included Quine, Goodman, Chisholm, Firth, and Sellars — the transmission path runs Peirce → Royce → Lewis → Quine → nearly all 20th-century analytic epistemology. He belongs in Ring III because his starting point is logic and the structure of possible experience rather than experience as found: the pragmatic a priori is what the mind brings to experience as a precondition for knowledge, which is a transcendental rather than phenomenological starting point.",
    elc:"Lewis and ELC were in the same Harvard network — he as a student, she as an auditor — in overlapping years. His transmission of Peirce's semiotics through Royce to analytic philosophy is the logical arm of the same tradition that ELC was deploying as practical ethics. His divergence from ELC is the same as Peirce's: starting point is logic rather than phenomenology, producing a more formal and less normatively grounded account. His dismissal of the Royce-Palmer tradition as pre-scientific is the academic version of Perry's institutional displacement.",
    inf:[["Royce","Direct supervisor; teaching assistant; Peirce manuscripts stewardship"],["Peirce","Catalogued manuscripts; pragmatic a priori from Peirce's categories"],["Whitehead/Russell","Principia Mathematica as formation in mathematical logic"],["Kant","Pragmatic a priori as Kantian structure given empirical content"]],
    out:[["Quine","Most famous student; Word and Object; analytic epistemology"],["Goodman","Nominalism; languages of art; Langer parallel"],["Modal logic","Systems S1-S5; deontic and epistemic logic foundations"],["ELC","Logical arm of same tradition — her starting point is prior to his"]],
    works:[["A Survey of Symbolic Logic (1918)","University of California Press — first major work"],["Mind and the World-Order (1929)","Scribner — pragmatic a priori; central philosophical statement"],["An Analysis of Knowledge and Valuation (1946)","Open Court — value theory and epistemology"],["The Ground and Nature of the Right (1955)","Columbia — ethics; closest to ELC's domain"]],
    archives:[["Stanford University Libraries, Special Collections","C.I. Lewis Papers — correspondence with Quine, Goodman, and Harvard network figures."]]
  },
  "T.S. Eliot": {
    ring:3, dates:"1888–1965", title:"The Literary Downstream", confirmed:true,
    desc:"T.S. Eliot is in Ring III because his relationship to the Boston idealist tradition is one of formation and divergence rather than substantial agreement. He attended Royce's 1913–14 seminar in his final year of graduate courses, writing his dissertation on F.H. Bradley. He took Russell's concurrent Advanced Logic course. He had attended Bergson's Paris lectures 1910–11. His dissertation Knowledge and Experience in the Philosophy of F.H. Bradley was completed but never submitted; it was eventually published in 1964. His poetry — The Waste Land especially — exhibits what the failure of the conditions for genuine selfhood looks like in modernist cultural life: the fragmentation, purposeless drift, and conjunctive incapacity that Bradley's dissolution of the individual self produces when lived from inside. He later edited and introduced Simone Weil's The Need for Roots (1952) for English readers, suggesting his awareness of the tradition's practical ethics late in his career.",
    elc:"Eliot was in the same Cambridge intellectual world as ELC's network — in Royce's seminar the same year ELC was active in Boston. His dissertation on Bradley and his Bergson formation make him the literary-philosophical figure who received the same tradition and deployed it into poetry rather than practical ethics. His later role introducing Weil's Need for Roots — the most direct parallel to ELC's practical conditions analysis in the French tradition — to English readers is a quiet late-life acknowledgment of what the tradition required. The exhibitive mode of his poetry is the literary parallel to ELC's poems: both are exhibits of what the conditions feel like when they are failing.",
    inf:[["Royce","1913-14 seminar; two papers presented; Bradley dissertation context"],["Bradley","Dissertation subject; Appearance and Reality as philosophical formation"],["Bergson","Paris lectures 1910-11; duration and temporal experience in the poetry"],["Russell","Advanced Logic 1914; notes survive at Houghton alongside Costello's"]],
    out:[["Modernist poetry","The Waste Land as exhibitive philosophy of conditions failure"],["Weil","Edited and introduced The Need for Roots (1952) for English readers"],["Literary criticism","Four Quartets as exhibitive philosophy of temporal selfhood"]],
    works:[["The Waste Land (1922)","Boni and Liveright — exhibitive philosophy of conditions failure"],["Four Quartets (1943)","Harcourt Brace — exhibitive philosophy of time and self-achievement"],["Knowledge and Experience in the Philosophy of F.H. Bradley (1964)","Farrar Straus — completed 1916, published posthumously; dissertation on Bradley"],["Introduction to The Need for Roots by Simone Weil (1952)","Routledge — late acknowledgment of practical ethics tradition"]],
    archives:[["Houghton Library, Harvard","Notes on Royce's 1913-14 seminar; notes on Russell's 1914 Advanced Logic course alongside Costello's. The December 9, 1913 seminar paper manuscript found in John Hayward Bequest at King's College Cambridge."],["King's College Cambridge, Hayward Bequest","December 9, 1913 Royce seminar paper — thought lost until found here."]]
  },

  // ── RING IV ───────────────────────────────────────────────────────────────
  "Hume/Parfit": {
    ring:4, dates:"1711–1776 / 1942–2017", title:"The Bundle Objectors", confirmed:true,
    desc:"Hume was right that no pre-given substantial self is found inward. He was wrong that what is found is a neutral bundle of disconnected impressions. What is found is interest — already directed, already temporal, already the raw material of selfhood. Parfit's neo-Humean objection is more technically dangerous: personal identity over time is not what matters — psychological continuity is. The response: interest is the continuity that matters, and it is forward-backward rather than merely backward. Numerical identity is the wrong criterion.",
    elc:"Hume's bundle misdescribes what interest actually is when found inward. Parfit's eliminativism about personal identity applies the wrong concept — numerical identity — to the question ELC was answering: not what makes you the same person over time, but what makes you a genuine self rather than merely a locus of interest. The achievement is real even if strict numerical identity is not.",
    inf:[["Newton","Mechanist worldview; impressions as atoms"],["Locke","Personal identity as psychological continuity"],["Hutcheson","Moral sentimentalism; against moral rationalism"],["Mandeville","Self-interest and social order"]],
    out:[["Parfit","Reasons and Persons; what matters in survival"],["Eliminativist tradition","Metzinger; no self model"],["Hume revival","Contemporary empiricist ethics; anti-rationalism"],["ELC","Her starting point corrects his misdescription of what is found"]]
  },
  "Moore/Russell": {
    ring:4, dates:"1873–1958 / 1872–1970", title:"The Analytic Revolt", confirmed:true,
    desc:"Moore and Russell attacked the British idealist tradition specifically — the doctrine of internal relations, the Absolute — and their attacks are largely correct. They do not touch the conditions account, which depends on neither. Moore's Open Question Argument is relevant but not decisive: the conditions are not identified with goodness but specified as what interest requires to become genuine selfhood. The live objection is the normative gap: what makes genuine self-achievement good rather than merely different from its absence?",
    elc:"Moore and Russell's revolt against idealism created the philosophical environment in which ELC's work was ignored — not because they refuted it but because they shifted philosophical attention entirely away from the domain in which it operated. The conditions account was not targeted by the analytic revolt; it was simply rendered invisible by a change in philosophical fashion and methodology.",
    inf:[["Frege","Mathematical logic; sense and reference; anti-psychologism"],["Meinong","Objects of thought; intentionality"],["Bradley","Primary target of their revolt"],["Peano","Mathematical notation; Principia project"]],
    out:[["Analytic philosophy","Dominant tradition in Britain and America"],["Logical positivism","Vienna Circle; verification principle"],["Ordinary language philosophy","Wittgenstein II; Austin; Ryle"],["ELC","Made invisible by the methodological shift they instituted"]]
  },
  Metzinger: {
    ring:4, dates:"1958–", title:"The Phenomenal Self Model", confirmed:true,
    desc:"Metzinger's Being No One argues that the phenomenal self model — the brain's self-representation — is all there is. There is no substantial self behind the model. This does not defeat the starting point but challenges the normative dimension: if the self is only a model, genuine self-achievement is model-sophistication rather than a real achievement of a real self. The response: the achievement claim does not require a substantial self behind the model — it requires that some modes of modeling are genuinely better than others. Metzinger's own meditative practice instantiates the conditions he claims are conditions for mere modeling. The practice is the argument against the theory.",
    elc:"The model account explains the phenomenology of selfhood without positing a metaphysical subject — which ELC does not require. The challenge is to the normative dimension: the conditions must be more than conditions for a more sophisticated model. The response: interest provides its own normative dimension, and the conditions are what interest discovers it requires to become genuinely itself — not what a theorist imposes on a model.",
    inf:[["Husserl","Phenomenology; intentionality; Metzinger trained in phenomenological tradition"],["Nagel","What is it like to be; phenomenal consciousness"],["Churchland","Eliminative materialism; folk psychology"],["Cognitive science","Computational models of mind"]],
    out:[["Open Individuality project","Continuation of no-self toward collective identity"],["Consciousness science","Neural correlates; binding problem"],["ELC","His practice refutes his theory; the conditions hold even on the model account"]]
  },
  "Foucault(E)": {
    ring:4, dates:"1926–1984", title:"The Genealogical Objection", confirmed:true,
    desc:"The genealogical objection from Discipline and Punish (1975): the achieved self is not genuinely achieved but manufactured by disciplinary power. The conditions for self-achievement look like the conditions for the production of docile subjects. This is the most politically dangerous objection because it recontextualises rather than contests the conditions directly. The response requires distinguishing between conditions that serve genuine self-achievement and conditions that serve disciplinary subjection. This distinction is real and specifiable: interest can be cultivated or manipulated, and the difference between genuine education and disciplinary production is exactly the difference ELC's account describes.",
    elc:"Foucault's early genealogical work is the objection that ELC's conditions are merely the conditions for producing properly disciplined subjects — bourgeois, Protestant, industrious — rather than for genuine self-achievement. The late Foucault's turn to ancient practices of self-formation (Technologies of the Self, 1982) is his own acknowledgment that the distinction between genuine self-cultivation and disciplinary subjection is real. His final work is effectively a partial answer to his own objection.",
    inf:[["Nietzsche","Genealogy of morals; will to power; perspectivism"],["Heidegger","Dasein; being-in-the-world; formal indication"],["Bachelard","Epistemological breaks; discontinuity in science"],["Canguilhem","Normal and pathological; medical norms"]],
    out:[["Foucault (Late)","Technologies of the Self; care of the self; self-formation"],["Queer theory","Butler; performativity; gender as achieved"],["Critical pedagogy","Freire connection; power and education"],["ELC","His objection requires the distinction her account makes explicit"]]
  },

  // ── OUTER RING ────────────────────────────────────────────────────────────
  Mencius: {
    ring:5, dates:"372–289 BC", title:"The Four Sprouts", confirmed:true,
    desc:"Mencius is the philosopher in the Confucian tradition who comes closest to the full position, arriving there twenty-three centuries before ELC with no possible influence in either direction. His central claim: the heart-mind (xin) has four native moral sprouts (si duan) — the beginning of benevolence, righteousness, ritual propriety, and wisdom. These sprouts are genuinely there but are beginnings, not completions. They must be cultivated through sustained engagement with community, through moral practice, through active development of the capacities they initiate. The junzi — the exemplary person — is not born but made through this cultivation.",
    elc:"The sprouts are interest before the conditions have been met: genuinely directed, genuinely reaching toward something, but not yet achieved selfhood. The cultivation of the sprouts through the conditions is ELC's account of how interest becomes genuine selfhood — through purposive activity, social engagement, attention, temporal coherence, and the constitutive choice. His argument against Gaozi — human nature is not like water that flows wherever the channel is cut — is the anti-Humean argument from within Chinese philosophy: what is found inward is not neutral.",
    inf:[["Confucius","Ren as benevolence; ritual propriety; the Master's teaching"],["Zisi","Grandson of Confucius; transmission of doctrine"],["King Hui of Liang","Practical context; political ethics"],["Heaven (Tian)","Mandate of Heaven; moral cosmology"]],
    out:[["Neo-Confucianism","Song Dynasty; xin-xue (heart-mind learning)"],["Wang Yangming","Unity of knowledge and action; moral intuition"],["Contemporary Confucian revival","Van Norden; moral sprout theory"],["ELC","Independent convergence — 23 centuries apart"]]
  },
  "Epictetus/M.A.": {
    ring:5, dates:"50–135 / 121–180 AD", title:"The Stoic Achievement", confirmed:true,
    desc:"Two Stoic convergences. First: prohairesis — the faculty of choice and assent, the one thing genuinely our own — is the core of Epictetan practice. The discipline of assent (not assenting to impressions before examining them) is ELC's conjunctive capacity; the discipline of desire (desiring only what is genuinely in one's power) is the constitutive choice applied to desire; the discipline of action (acting in accordance with social nature) is the social engagement condition. Second: oikeiosis — the natural development of moral concern from self-care outward to all humanity — is ELC's social engagement condition as developmental trajectory. Marcus Aurelius's Meditations is Stoic philosophy in the exhibitive mode: not a treatise but daily exhibitive practice of the conditions from inside their difficulty.",
    elc:"The Stoic tradition holds the normative force of the conditions for four centuries without requiring either metaphysical overclaim or naturalist reduction. This is the strongest historical evidence that the Western philosophical tradition's three stopping points were not philosophical necessities but failures of nerve in the face of a false binary. ELC took the path the Stoics had been taking for centuries.",
    inf:[["Zeno of Citium","Stoic school founded; logic, physics, ethics"],["Chrysippus","Systematised Stoicism; logic of conditionals"],["Socrates","Model of philosophical practice; death as philosophy"],["Plato","Platonism in dialogue; then diverged toward naturalism"]],
    out:[["Roman Stoicism","Cicero; Seneca; practical philosophy"],["Neo-Stoicism (16th c.)","Lipsius; Stoicism revived for political life"],["Modern Stoicism","Contemporary revival; CBT parallel"],["ELC","Independent convergence — normative force without overclaim"]]
  },
  Ubuntu: {
    ring:5, dates:"Traditional / 20th c. articulation", title:"I Am Because We Are", confirmed:false,
    unconfirmedNote:"Ubuntu as a named philosophical tradition with systematic academic articulation is primarily a 20th-century development; its deep pre-colonial roots are attested but the precise historical genealogy is a matter of ongoing scholarly debate.",
    desc:"Ubuntu — umuntu ngumuntu ngabantu (a person is a person through other persons) — is the philosophical account of personhood dominant in sub-Saharan African philosophical traditions. Its central claim: genuine personhood is not given but constituted through one's relationships to the community. You become a person through genuine participation in the life of the community — through ubuntu, through the active exercise and cultivation of your relational capacities. This is ELC's social engagement condition elevated to the foundational account of what personhood is.",
    elc:"Independent convergence from sub-Saharan African philosophy. Ubuntu and ELC's conditions agree that genuine selfhood is achieved through genuine engagement with what is other, not given before that engagement begins. The direction of constitution differs — for ubuntu, social constitution is foundational; for ELC, individual interest is the starting point and social engagement is the condition for its genuine development. But the structural convergence on the achievement claim is the evidential point.",
    inf:[["Bantu philosophical traditions","Deep roots in community-based personhood"],["Tutu articulation","No Future Without Forgiveness (1999)"],["Ramose","African Philosophy Through Ubuntu (1999)"],["Metz","Analytical engagement with ubuntu ethics"]],
    out:[["Truth and Reconciliation","Ubuntu as political philosophy in practice"],["African Philosophy","Growing academic literature"],["ELC","Independent convergence — social engagement as constitutive"]]
  },
  Buber: {
    ring:5, dates:"1878–1965", title:"The I-Thou Philosopher", confirmed:true,
    desc:"Buber's I and Thou (1923) arrived at the social engagement condition as the foundational account of selfhood from within Jewish existentialist and dialogical philosophy. His central claim: the I that appears in genuine I-Thou relation is not the same I as in I-It relation — the I is genuinely constituted by the quality of its relations. There is no I that exists before relation and then enters into it; the I is what emerges in the relation. All real living is meeting. The conditions for genuine I-Thou encounter are ELC's social engagement and conjunctive capacity conditions stated as conditions for genuine encounter.",
    elc:"Buber arrived at the social engagement condition as the foundational account of selfhood from within Jewish existentialist and dialogical philosophy with no connection to the Boston tradition. The convergence strengthens the claim that both are tracking something real about what genuine selfhood requires. Between Man and Man (1947) is particularly relevant for its pedagogical essays: genuine teaching requires I-Thou encounter, not I-It transmission — Palmer's philosophy stated from within dialogical philosophy.",
    inf:[["Hasidic tradition","Jewish mysticism; divine sparks; joy in service"],["Nietzsche","Revaluation of values; genuine commitment against conformity"],["Kant","Moral autonomy; person as end"],["Kierkegaard","Existential commitment; the individual before God"]],
    out:[["Dialogical philosophy","Rosenzweig; Levinas; Bakhtin"],["Jewish philosophy","20th century Jewish existentialism"],["Education theory","Genuine encounter vs. transmission"],["ELC","Independent convergence — social engagement as constitutive of self"]]
  },
  "Maine de Biran": {
    ring:5, dates:"1766–1824", title:"The French Phenomenological Predecessor", confirmed:true,
    desc:"Maine de Biran is the earliest Continental philosopher to identify as the foundational philosophical experience not Descartes' cogito but the felt effort of will against resistance — the immediate inner experience of active striving before intellectual abstraction. His claim: philosophy begins not from the clear and distinct idea but from the primitive fact of the will encountering the resistance of what is not-self. This felt effort is primary; the self is not deduced from it but is present in it as the actor. This is interest as found — in French philosophical vocabulary from a generation before Green or Emerson, with no possible connection to either.",
    elc:"Maine de Biran, James, and ELC converge on the same phenomenological datum from three different national philosophical traditions and different centuries: the forward-reaching, resistant-encountering orientation of experience that is there before theory begins. Maine de Biran names it the effort of will; James names it pure experience; ELC names it interest. All three are describing the same thing.",
    inf:[["Condillac","Sensationalism; experience as primary"],["Descartes","Critical engagement; moves beyond the cogito"],["Locke","Empiricism; ideas from experience"],["Cabanis","Physiological basis of consciousness"]],
    out:[["Ravaisson","Of Habit (1838); most important student"],["Bergson","Called Maine de Biran the greatest French philosopher"],["Alain","Felt effort of will transmitted into the propos as practical philosophy"],["French spiritualism","Lachelier, Boutroux, Blondel"],["ELC","Independent convergence — felt effort of will = interest as found"]]
  },
  Freire: {
    ring:5, dates:"1921–1997", title:"The Conscientization Philosopher", confirmed:true,
    desc:"Freire's Pedagogy of the Oppressed (1968) arrived at ELC's account of teaching as enabling self-constitution from within Latin American liberation pedagogy, with no historical connection to the Boston tradition. Banking education — treating the student as a passive receptacle for deposited information — destroys the conditions by treating the student as an object rather than a subject. Genuine education is dialogical: teacher and student both learn through genuine engagement with the world as a shared problem. The conditions for genuine conscientization map directly onto ELC's five conditions.",
    elc:"Palmer articulated teaching as enabling self-constitution at Harvard; ELC deployed it in the classroom; Freire arrived at the same account from within the experience of teaching Brazilian peasants to read. The convergence across these three — different centuries, different continents, different social contexts — from within the same structural problem (what genuine education requires) is the practical deployment argument at its most powerful.",
    inf:[["Marx","Praxis; theory and practice unified; historical materialism"],["Hegel","Dialectic; consciousness and oppression"],["Jaspers","Existentialist philosophy; authentic existence"],["Mounier","Personalism; the person against the mass"]],
    out:[["Critical pedagogy","McLaren, Giroux; education as political practice"],["Liberation theology","Gutierrez; base communities; preferential option for the poor"],["Community organising","Alinsky tradition; power analysis"],["ELC","Independent convergence — teaching as enabling self-constitution"]]
  },
  Bakhtin: {
    ring:5, dates:"1895–1975", title:"The Dialogical Self Philosopher", confirmed:true,
    desc:"Bakhtin's account of the dialogical self — constituted through genuine engagement with the genuinely other perspective rather than through internal monologue — is the social engagement condition as the foundational account of selfhood stated from within literary theory. His analysis of the polyphonic novel in Dostoevsky: genuine characters are centers of value in their own right, genuinely other, genuinely capable of surprising the author. The polyphonic novel exhibits genuine selfhood in encounter in a way that monological narrative cannot. This is the exhibitive philosophy argument from within literary theory: the novel form can exhibit what philosophical treatise cannot state.",
    elc:"Bakhtin and Buchler independently arrived at the claim that certain dimensions of human experience require the exhibitive mode — one from within Russian literary theory, one from within American naturalism. Their convergence strengthens the case that the dual mode is a philosophical necessity rather than a stylistic preference. ELC did both: her prose conditions and her poems are exactly the dual mode both Bakhtin and Buchler were theorising from within their respective traditions.",
    inf:[["Dostoevsky","Primary case study; polyphonic novel as discovery"],["Kant","Ethical dimension; the other as end"],["Cassirer","Symbolic forms; philosophy of culture"],["Russian formalism","Critical engagement; language beyond form"]],
    out:[["Dialogism","Academic field; Bakhtin Circle reception"],["Narrative ethics","Novel as moral laboratory"],["Literary theory","Heteroglossia; carnival; chronotope"],["ELC","Independent convergence — exhibitive mode as philosophical necessity"]]
  },
  Addams: {
    ring:5, dates:"1860–1935", title:"The Settlement House Convergence", confirmed:true,
    desc:"Jane Addams visited Toynbee Hall in 1888 and opened Hull-House in Chicago in 1889 with Ellen Gates Starr. She won the Nobel Peace Prize in 1931. The chain runs: Green → Toynbee Hall → Addams → Hull-House → Nobel 1931. Hull-House trained Julia Lathrop (first head of the US Children's Bureau), Florence Kelley (National Consumers League, child labor laws), Grace Abbott, and Alice Hamilton. Addams's own account of what Hull-House was doing — in Democracy and Social Ethics (1902) and Twenty Years at Hull-House (1910) — is a practical specification of the conditions for genuine self-development that Green's mandate required: purposive activity enabled through meaningful work, social engagement through genuine community, attention cultivated through education, temporal coherence maintained through stable community life, and the constitutive choice made real through political agency. She is in the outer ring because her starting point is practice and observation rather than philosophical theory, and she arrived at the conditions through the lived experience of poverty rather than through philosophical inquiry.",
    elc:"Addams and ELC are parallel American deployments of the Green-Caird tradition's practical mandate. The transmission chain to Addams runs through Toynbee Hall; the transmission chain to ELC runs through Palmer. Both were contemporaries in the same progressive Boston network — ELC through King's Chapel and the settlement house connections, Addams through Hull-House and the Chicago network. Emily Greene Balch and Vida Scudder — both in ELC's direct network — were co-founders of the College Settlements Association with Addams. The practical deployment argument depends on Addams: she is the American instance of what ELC was specifying philosophically.",
    inf:[["Toynbee Hall","Visited 1888; model for Hull-House; Green-Caird mandate directly"],["Canon Barnett","Toynbee Hall founder; conditions for genuine community development"],["Tolstoy","Visited 1895; peasant simplicity and genuine labour"],["E.G. Balch","College Settlements Association; Wellesley network connection to ELC"]],
    out:[["Hull-House","Practical deployment of conditions for genuine selfhood in urban poverty"],["Nobel Peace Prize 1931","External validation of practical deployment"],["US Children's Bureau","Julia Lathrop; structural conditions for children"],["ELC","Independent convergence — same conditions, practical vs philosophical register"]],
    works:[["Democracy and Social Ethics (1902)","Macmillan — conditions for genuine democratic self-development"],["Newer Ideals of Peace (1907)","Chautauqua Press"],["Twenty Years at Hull-House (1910)","Macmillan — exhibitive philosophy of the conditions in practice"],["A New Conscience and an Ancient Evil (1912)","Macmillan"],["Peace and Bread in Time of War (1922)","Macmillan — conditions for genuine peace"]],
    archives:[["Swarthmore College Peace Collection","Jane Addams Papers — extensive; letters, diaries, speeches."],["University of Illinois at Chicago, Richard J. Daley Library","Hull-House Records — institutional archive of the practical deployment."]]
  }
};

const DKEYS = Object.keys(DATA);

// Per-figure metadata used by the web's people filters.
//   gender: "m" | "f" | "other"   (for composites where all members share a gender, use that gender; "other" for non-personal entries like Ubuntu)
//   wellKnown: true | false       (rough proxy: would a typical philosophy undergrad recognise the name?)
// Merged into DATA below so existing code that reads `fig.gender` / `fig.wellKnown` works without per-entry edits.
const META = {
  Emerson:        { gender:"m", wellKnown:true  },
  James:          { gender:"m", wellKnown:true  },
  Weil:           { gender:"f", wellKnown:true  },
  "P-Pattison":   { gender:"m", wellKnown:false },
  Royce:          { gender:"m", wellKnown:false },
  Palmer:         { gender:"m", wellKnown:false },
  Caird:          { gender:"m", wellKnown:false },
  Bosanquet:      { gender:"m", wellKnown:false },
  Murdoch:        { gender:"f", wellKnown:true  },
  "Du Bois":      { gender:"m", wellKnown:true  },
  "T.H. Green":   { gender:"m", wellKnown:true  },
  Calkins:        { gender:"f", wellKnown:false },
  Follett:        { gender:"f", wellKnown:false },
  Korsgaard:      { gender:"f", wellKnown:false },
  Bergson:        { gender:"m", wellKnown:true  },
  Alain:          { gender:"m", wellKnown:false },
  Buchler:        { gender:"m", wellKnown:false },
  Bowne:          { gender:"m", wellKnown:false },
  Ritchie:        { gender:"m", wellKnown:false },
  Aristotle:      { gender:"m", wellKnown:true  },
  Langer:         { gender:"f", wellKnown:false },
  Hegel:          { gender:"m", wellKnown:true  },
  Sartre:         { gender:"m", wellKnown:true  },
  Dewey:          { gender:"m", wellKnown:true  },
  Kant:           { gender:"m", wellKnown:true  },
  Peirce:         { gender:"m", wellKnown:true  },
  Bradley:        { gender:"m", wellKnown:true  },
  "Hume/Parfit":  { gender:"m", wellKnown:true  },
  "Moore/Russell":{ gender:"m", wellKnown:true  },
  Metzinger:      { gender:"m", wellKnown:false },
  "Foucault(E)":  { gender:"m", wellKnown:true  },
  Mencius:        { gender:"m", wellKnown:true  },
  "Epictetus/M.A.":{ gender:"m", wellKnown:true  },
  Ubuntu:         { gender:"other", wellKnown:false },
  Buber:          { gender:"m", wellKnown:true  },
  "Maine de Biran":{ gender:"m", wellKnown:false },
  Freire:         { gender:"m", wellKnown:true  },
  Bakhtin:        { gender:"m", wellKnown:true  },
};
DKEYS.forEach(function(k) {
  const m = META[k] || { gender:"other", wellKnown:false };
  DATA[k].gender = m.gender;
  DATA[k].wellKnown = m.wellKnown;
  DATA[k].hasArchive = Boolean(DATA[k].archives && DATA[k].archives.length > 0);
});

// CITED_BY[figureKey] = [{ from, note }, ...] — built once by inverting `out` lists.
const CITED_BY = (function() {
  const map = {};
  DKEYS.forEach(function(from) {
    const fig = DATA[from];
    if (!fig || !fig.out) return;
    fig.out.forEach(function(item) {
      const target = item[0];
      if (!DATA[target]) return;
      if (!map[target]) map[target] = [];
      map[target].push({ from: from, note: item[1] });
    });
  });
  return map;
})();


// ---------- hash router ----------

// Minimal hash-based router.
// Routes:
//   #/                       → { name: "landing" }
//   #/web                    → { name: "web", query: {...} }
//   #/timeline               → { name: "timeline" }
//   #/figure/<key>           → { name: "figure", figure: <decoded key> }
//
// `?key=value&key2=value2` query strings are supported on any route and
// surfaced as the `query` field.

function parseQuery(str) {
  const out = {};
  if (!str) return out;
  str.split("&").forEach(function(pair) {
    if (!pair) return;
    const eq = pair.indexOf("=");
    const k = eq === -1 ? pair : pair.slice(0, eq);
    const v = eq === -1 ? "" : pair.slice(eq + 1);
    try { out[decodeURIComponent(k)] = decodeURIComponent(v); }
    catch (e) { out[k] = v; }
  });
  return out;
}

function parseRoute(hash) {
  const raw = (hash || "").replace(/^#/, "");
  const qIdx = raw.indexOf("?");
  const path = qIdx === -1 ? raw : raw.slice(0, qIdx);
  const query = qIdx === -1 ? {} : parseQuery(raw.slice(qIdx + 1));

  if (path === "" || path === "/") return { name: "landing", query };
  if (path === "/web") return { name: "web", query };
  if (path === "/timeline") return { name: "timeline", query };
  const m = path.match(/^\/figure\/(.+)$/);
  if (m) {
    try { return { name: "figure", figure: decodeURIComponent(m[1]), query }; }
    catch (e) { return { name: "landing", query }; }
  }
  return { name: "landing", query };
}

function useRoute() {
  const [route, setRoute] = useState(function() {
    return parseRoute(typeof window !== "undefined" ? window.location.hash : "");
  });
  useEffect(function() {
    function onChange() { setRoute(parseRoute(window.location.hash)); }
    window.addEventListener("hashchange", onChange);
    return function() { window.removeEventListener("hashchange", onChange); };
  }, []);
  return route;
}

function hrefFor(route) {
  if (route.name === "landing") return "#/";
  if (route.name === "web") return "#/web";
  if (route.name === "timeline") return "#/timeline";
  if (route.name === "figure") return "#/figure/" + encodeURIComponent(route.figure);
  return "#/";
}

function navigate(route) {
  window.location.hash = hrefFor(route).slice(1);
  if (typeof window !== "undefined") window.scrollTo(0, 0);
}

// Update the URL's query string without navigating away or scrolling.
// Used by the web view to keep its URL in sync with search/lines state.
function replaceQuery(routeName, params) {
  if (typeof window === "undefined") return;
  const base = hrefFor({ name: routeName });
  const pairs = Object.keys(params)
    .filter(function(k) { return params[k] !== undefined && params[k] !== null && params[k] !== ""; })
    .map(function(k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); });
  const newHash = base + (pairs.length ? "?" + pairs.join("&") : "");
  if (window.location.hash !== newHash) {
    window.history.replaceState(null, "", newHash);
  }
}

// ---------- hook: isMobile ----------

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 700);
  useEffect(function() {
    function onResize() { setIsMobile(window.innerWidth < 700); }
    window.addEventListener("resize", onResize);
    return function() { window.removeEventListener("resize", onResize); };
  }, []);
  return isMobile;
}

// ---------- hook: theme ----------

const THEME_STORAGE_KEY = "elc-theme";

function readInitial() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) { /* localStorage may be unavailable */ }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

function useTheme() {
  const [theme, setTheme] = useState(readInitial);

  useEffect(function() { applyTheme(theme); }, [theme]);

  const toggle = useCallback(function() {
    setTheme(function(t) {
      const next = t === "dark" ? "light" : "dark";
      try { window.localStorage.setItem(THEME_STORAGE_KEY, next); }
      catch (e) { /* ignore */ }
      return next;
    });
  }, []);

  return [theme, toggle];
}

// ---------- hook: recently viewed ----------

const RECENT_STORAGE_KEY = "elc-recent";
const RECENT_MAX = 5;

function readRecent() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(function(s) { return typeof s === "string"; }) : [];
  } catch (e) { return []; }
}

function writeRecent(list) {
  try { window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list)); }
  catch (e) { /* ignore */ }
}

// Records a view (most recent first, deduped, capped).
function recordView(figureKey) {
  if (!figureKey || typeof window === "undefined") return;
  const cur = readRecent().filter(function(k) { return k !== figureKey; });
  cur.unshift(figureKey);
  writeRecent(cur.slice(0, RECENT_MAX));
}

// Returns the recent list, updates on storage events.
function useRecentlyViewed() {
  const [list, setList] = useState(readRecent);
  useEffect(function() {
    function onStorage(e) { if (e.key === RECENT_STORAGE_KEY) setList(readRecent()); }
    window.addEventListener("storage", onStorage);
    return function() { window.removeEventListener("storage", onStorage); };
  }, []);
  return list;
}

// ---------- component: ThemeToggle ----------
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  const next = isDark ? "light" : "dark";
  return (
    <button
      type="button"
      className="elc-btn"
      aria-label={"Switch to " + next + " mode"}
      title={"Switch to " + next + " mode"}
      onClick={onToggle}>
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

// ---------- component: Footer ----------

// Hand-edit when posting a substantive update.
const LAST_UPDATED = "April 2026";

function Footer({ inset }) {
  return (
    <footer style={{
      maxWidth: inset || "720px",
      width: "100%",
      margin: "48px auto 0",
      padding: "20px 16px 32px",
      borderTop: "1px solid " + RULE,
      color: TX_SOFT,
      fontSize: "13px",
      lineHeight: 1.55,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: "8px",
      boxSizing: "border-box",
      fontStyle: "italic"
    }}>
      <span>
        <a href={hrefFor({ name: "landing" })} style={{ color: TX_SOFT, textDecoration: "none", borderBottom: "1px dotted currentColor" }}>
          Ella Lyman Cabot
        </a>
        {" "}— a working site for the recovery of her philosophical project.
      </span>
      <span style={{ color: MUTED }}>Last updated: {LAST_UPDATED}</span>
    </footer>
  );
}

// ---------- component: Landing ----------

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


function Landing({ theme, onToggleTheme }) {
  const isMobile = useIsMobile();
  const recent = useRecentlyViewed().filter(function(k) { return DATA[k]; });

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{sharedStyles}</style>
      <a href="#landing-main" className="elc-skip">Skip to content</a>

      <div style={{
        maxWidth: LAYOUT_COL,
        margin: "0 auto",
        padding: isMobile ? "16px 16px 0" : "20px 24px 0",
        display: "flex",
        justifyContent: "flex-end"
      }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <main id="landing-main" style={{
        padding: isMobile ? "24px 16px 64px" : "40px 24px 96px",
        maxWidth: LAYOUT_COL,
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
      <Footer inset={LAYOUT_COL} />
    </div>
  );
}

// ---------- component: DetailView ----------

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


function DetailView({ name, theme, onToggleTheme }) {
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

      <main id="detail-main" style={{ padding: isMobile ? "20px 16px" : "32px 24px", maxWidth: LAYOUT_COL, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "20px" }}>

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
      <Footer inset={LAYOUT_COL} />
    </div>
  );
}

// ---------- component: Timeline ----------

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

function Timeline({ theme, onToggleTheme }) {
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
      // Skip pre-1700 figures so the modern era reads clearly.
      // (Mencius, Aristotle, Epictetus/Marcus Aurelius are listed below the chart.)
      if (r.end < 1700) return;
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

  const omittedUnparseable = DKEYS.filter(function(key) {
    return parseRanges(DATA[key].dates) === null;
  });
  const omittedAncient = DKEYS.filter(function(key) {
    const r = parseRanges(DATA[key].dates);
    if (!r) return false;
    return r.every(function(range) { return range.end < 1700; });
  });

  // Axis spans 1700 → most recent figure (or ELC's end). The lower bound is
  // pinned at 1700 so toggling rings doesn't reflow the year scale.
  const minYear = 1700;
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

  // Tick marks: 25y on phone, 50y on desktop across the modern range.
  const tickStep = isMobile ? 25 : 50;
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
          Modern figures plotted by lifespan, 1700 onward. ELC marked. Tap any bar to open that entry.
        </p>
        <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", margin: "0 0 20px", textAlign: "center" }}>
          A complementary view to the Philosophical Web — lineage by decade rather than by ring.
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

        <div style={{ marginTop: "18px", textAlign: "center" }}>
          {omittedAncient.length > 0 && (
            <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", margin: "0 0 6px" }}>
              Pre-1700 figures shown only in the Web: {omittedAncient.join(", ")}.
            </p>
          )}
          {omittedUnparseable.length > 0 && (
            <p style={{ color: MUTED, fontSize: "13px", fontStyle: "italic", margin: 0 }}>
              Non-pinpointable entries omitted: {omittedUnparseable.join(", ")}.
            </p>
          )}
        </div>
      </main>

      <Footer inset="1100px" />
    </div>
  );
}

// ---------- component: PhilosophicalWeb ----------

const pwStyles = `
  .pw-node { transition: transform 200ms ease, opacity 200ms ease; }
  .pw-node .pw-dot { transition: r 200ms ease, opacity 200ms ease, fill 200ms ease; }
  .pw-node .pw-ring { transition: r 200ms ease, stroke-opacity 200ms ease, stroke-width 200ms ease; }
  .pw-node text { transition: fill 200ms ease; }
  .pw-node-active:hover { transform: translateZ(0); }
  .pw-node-active:focus-visible { outline: none; }
  .pw-node-active:focus-visible .pw-dot {
    stroke: var(--accent); stroke-width: 1.5; stroke-opacity: 0.9;
  }
  .pw-edge { transition: stroke-opacity 200ms ease, stroke-width 200ms ease; }

  .pw-search {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 9px 12px;
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px;
    outline: none;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .pw-search:focus-visible { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-faint-strong); }

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
      ringIdx: 4,
      color: OUTER_COLOR,
      key,
      hasData: Boolean(key && DATA[key]),
      isOuter: true,
    });
  });
  return out;
}

// Compute the next node to focus when an arrow key is pressed.
// Left/Right cycle within the same ring (data-only). Up/Down jump to the
// nearest-by-angle data node in the inner / outer ring, with Ring IV (3) → Outer (4).
function nextFocusNode(nodes, current, direction) {
  if (!current) return null;
  if (direction === "left" || direction === "right") {
    const ring = nodes.filter(function(n) { return n.ringIdx === current.ringIdx && n.hasData; });
    const idx = ring.indexOf(current);
    if (idx === -1) return null;
    const step = direction === "right" ? 1 : -1;
    return ring[(idx + step + ring.length) % ring.length];
  }
  let targetIdx;
  if (direction === "up") {
    if (current.ringIdx === 0) return null;
    targetIdx = current.ringIdx - 1;
  } else {
    if (current.ringIdx === 4) return null;
    targetIdx = current.ringIdx + 1;
  }
  const candidates = nodes.filter(function(n) { return n.ringIdx === targetIdx && n.hasData; });
  if (candidates.length === 0) return null;
  const curAngle = Math.atan2(current.x - CX, -(current.y - CY));
  let best = candidates[0];
  let bestDist = Infinity;
  candidates.forEach(function(c) {
    const a = Math.atan2(c.x - CX, -(c.y - CY));
    let d = Math.abs(a - curAngle);
    if (d > Math.PI) d = 2 * Math.PI - d;
    if (d < bestDist) { bestDist = d; best = c; }
  });
  return best;
}

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
        edges.push({ from: src, to: { x: CX, y: CY, name: "ELC", isCenter: true }, color: src.color, fromRingIdx: src.ringIdx });
        return;
      }
      const target = byTarget.get(targetName);
      if (target) edges.push({ from: src, to: target, color: src.color, fromRingIdx: src.ringIdx });
    });
  });
  return edges;
}

// Quadratic Bezier from (x1,y1) to (x2,y2), bowed sideways away from the
// diagram center so spokes don't cross through ELC.
function arcPath(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const chord = Math.hypot(dx, dy);
  if (chord < 1) return "M " + x1 + " " + y1 + " L " + x2 + " " + y2;
  let px = -dy / chord;
  let py = dx / chord;
  // Pick the perpendicular pointing away from the center.
  const towardCx = CX - mx;
  const towardCy = CY - my;
  if (px * towardCx + py * towardCy > 0) { px = -px; py = -py; }
  const offset = chord * 0.18;
  const cx = mx + px * offset;
  const cy = my + py * offset;
  return "M " + x1 + " " + y1 + " Q " + cx + " " + cy + " " + x2 + " " + y2;
}

// Lines mode: "off" hides edges; "all" shows every edge (current default
// behaviour); "focus" shows only the currently hovered/focused node's
// outgoing lineage. Backward-compatible: the legacy `?lines=1` URL
// param maps to "all".
function parseLinesMode(raw) {
  if (raw === "all" || raw === "focus") return raw;
  if (raw === "1") return "all";
  return "off";
}

// "12345" or "1,3,5" → array of which 1-based rings are enabled.
// Default: all five enabled.
function parseEnabledRings(raw) {
  const all = [true, true, true, true, true];
  if (!raw) return all;
  const out = [false, false, false, false, false];
  String(raw).replace(/[^1-5]/g, "").split("").forEach(function(d) {
    out[parseInt(d, 10) - 1] = true;
  });
  return out.some(Boolean) ? out : all;
}

function serializeRings(enabled) {
  const allOn = enabled.every(Boolean);
  if (allOn) return "";
  return enabled.map(function(b, i) { return b ? (i + 1) : ""; }).join("");
}

// People filters: "all" means no filter on that dimension.
//   gender: "all" | "m" | "f"
//   known:  "all" | "yes" | "no"
//   arch:   "all" | "yes" | "no"
const VALID_GENDER = { all:1, m:1, f:1 };
const VALID_TRI    = { all:1, yes:1, no:1 };
function parseGender(v) { return VALID_GENDER[v] ? v : "all"; }
function parseTri(v)    { return VALID_TRI[v]    ? v : "all"; }

function PhilosophicalWeb({ theme, onToggleTheme, initialQuery }) {
  const [tip, setTip] = useState(null);
  const [query, setQuery] = useState(function() { return (initialQuery && initialQuery.q) || ""; });
  const [linesMode, setLinesMode] = useState(function() { return parseLinesMode(initialQuery && initialQuery.lines); });
  const [enabledRings, setEnabledRings] = useState(function() { return parseEnabledRings(initialQuery && initialQuery.rings); });
  const [genderF, setGenderF] = useState(function() { return parseGender(initialQuery && initialQuery.g); });
  const [knownF, setKnownF] = useState(function() { return parseTri(initialQuery && initialQuery.k); });
  const [archF, setArchF] = useState(function() { return parseTri(initialQuery && initialQuery.a); });

  useEffect(function() {
    replaceQuery("web", {
      q: query.trim(),
      lines: linesMode === "off" ? "" : linesMode,
      rings: linesMode === "off" ? "" : serializeRings(enabledRings),
      g: genderF === "all" ? "" : genderF,
      k: knownF === "all" ? "" : knownF,
      a: archF === "all" ? "" : archF,
    });
  }, [query, linesMode, enabledRings, genderF, knownF, archF]);
  const isMobile = useIsMobile();
  const vb = "-220 -30 1400 1020";

  const nodes = useMemo(buildNodes, []);
  const edges = useMemo(function() { return buildEdges(nodes); }, [nodes]);

  const q = query.trim().toLowerCase();
  function isMatch(node) {
    if (!q) return true;
    if (node.name.toLowerCase().includes(q)) return true;
    const fig = node.key && DATA[node.key];
    if (!fig) return false;
    if (fig.desc && fig.desc.toLowerCase().includes(q)) return true;
    if (fig.elc && fig.elc.toLowerCase().includes(q)) return true;
    if (fig.title && fig.title.toLowerCase().includes(q)) return true;
    return false;
  }
  const matchCount = q ? nodes.filter(function(n) { return n.hasData && isMatch(n); }).length : 0;

  function handleNodeKey(e, node) {
    if (!node.hasData) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate({ name: "figure", figure: node.key });
      return;
    }
    const dirMap = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    if (dirMap[e.key]) {
      e.preventDefault();
      const next = nextFocusNode(nodes, node, dirMap[e.key]);
      if (next && next.key) {
        const el = document.getElementById("pw-node-" + next.key);
        if (el && typeof el.focus === "function") el.focus();
      }
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!q) return;
    const matches = nodes.filter(function(n) { return n.hasData && isMatch(n); });
    if (matches.length === 1) navigate({ name: "figure", figure: matches[0].key });
  }

  // When lines are on AND a node is focused/hovered, dim all nodes that
  // aren't the focused one or named in its `out` list ("focus highlight").
  const focusedKey = (function() {
    if (linesMode === "off" || !tip) return null;
    const n = nodes.find(function(x) { return x.name === tip; });
    return n && n.hasData ? n.key : null;
  })();
  const inFocusSet = (function() {
    if (!focusedKey) return null;
    const set = new Set([focusedKey]);
    const fig = DATA[focusedKey];
    if (fig && fig.out) {
      fig.out.forEach(function(item) {
        if (DATA[item[0]]) set.add(item[0]);
      });
    }
    return set;
  })();

  function passesPeopleFilters(n) {
    if (!n.hasData) return genderF === "all" && knownF === "all" && archF === "all";
    const fig = DATA[n.key];
    if (genderF !== "all" && fig.gender !== genderF) return false;
    if (knownF === "yes" && !fig.wellKnown) return false;
    if (knownF === "no"  &&  fig.wellKnown) return false;
    if (archF === "yes" && !fig.hasArchive) return false;
    if (archF === "no"  &&  fig.hasArchive) return false;
    return true;
  }
  const peopleFiltersActive = genderF !== "all" || knownF !== "all" || archF !== "all";
  const visibleCount = peopleFiltersActive
    ? nodes.filter(function(n) { return n.hasData && passesPeopleFilters(n); }).length
    : nodes.filter(function(n) { return n.hasData; }).length;
  const totalDataCount = nodes.filter(function(n) { return n.hasData; }).length;

  function nodeOpacity(n) {
    if (q) return isMatch(n) ? 1 : 0.18;
    if (peopleFiltersActive && !passesPeopleFilters(n)) return 0.18;
    if (inFocusSet && n.key && !inFocusSet.has(n.key)) return 0.22;
    return 1;
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "20px 14px" : "32px 20px", color: TX }}>
      <style>{pwStyles}</style>

      <div style={{ width: "100%", maxWidth: "1100px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <a href={hrefFor({ name: "landing" })} className="elc-btn">← Home</a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <h1 style={{
        color: ACCENT,
        fontSize: isMobile ? "34px" : "44px",
        fontWeight: 600,
        margin: "0 0 8px",
        letterSpacing: "0.005em",
        textAlign: "center",
        lineHeight: 1.1
      }}>
        The Philosophical Web
      </h1>
      <p style={{ color: TX_SOFT, fontSize: isMobile ? "17px" : "19px", margin: "0 0 6px", textAlign: "center", maxWidth: "720px", lineHeight: 1.45, fontStyle: "italic" }}>
        Ella Lyman Cabot · Interest, the Achieved Self, and the Conditions of Selfhood
      </p>
      <p style={{ color: MUTED, fontSize: "14px", fontStyle: "italic", margin: "0 0 18px", textAlign: "center" }}>
        Working document — still being updated · Tap any node to explore lineages
      </p>

      <form onSubmit={onSubmit} role="search" aria-label="Search figures" style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "10px",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "center",
        marginBottom: "10px",
        width: "100%",
        maxWidth: "640px"
      }}>
        <input
          type="search"
          className="pw-search"
          placeholder="Search names or text…"
          aria-label="Search figures"
          value={query}
          onChange={function(e) { setQuery(e.target.value); }}
          style={isMobile ? { width: "100%" } : { flex: "1 1 220px", minWidth: 0 }}
        />
        <button
          type="button"
          className="elc-btn"
          aria-pressed={linesMode !== "off"}
          aria-label={"Lines: " + linesMode + ". Click to cycle to next mode."}
          style={isMobile ? { justifyContent: "center" } : undefined}
          onClick={function() {
            setLinesMode(function(m) {
              if (m === "off") return "all";
              if (m === "all") return "focus";
              return "off";
            });
          }}>
          Lines: {linesMode === "off" ? "Off" : linesMode === "all" ? "All" : "Focus"}
        </button>
        <button
          type="button"
          className="elc-btn"
          aria-label="Open a random figure"
          style={isMobile ? { justifyContent: "center" } : undefined}
          onClick={function() {
            const idx = Math.floor(Math.random() * DKEYS.length);
            navigate({ name: "figure", figure: DKEYS[idx] });
          }}>
          Random
        </button>
      </form>

      {linesMode !== "off" && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "10px",
          maxWidth: "720px",
          padding: "0 12px"
        }}>
          <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "4px" }}>Rings</span>
          {[0, 1, 2, 3, 4].map(function(ri) {
            const enabled = enabledRings[ri];
            const c = ri === 4 ? OUTER_COLOR : RING_COLORS[ri];
            const labels = ["Ring I", "Ring II", "Ring III", "Ring IV", "Ring V"];
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
                    if (!next.some(Boolean)) return prev;
                    return next;
                  });
                }}>
                <span aria-hidden="true" style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: enabled ? c : "transparent", border: "1.5px solid " + c, marginRight: "6px", verticalAlign: "middle", boxSizing: "border-box" }} />
                {labels[ri]}
              </button>
            );
          })}
        </div>
      )}

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 18px",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "10px",
        maxWidth: "780px",
        padding: "0 12px"
      }}>
        {[
          { label: "Gender",    value: genderF, set: setGenderF, opts: [["all","All"],["m","Men"],["f","Women"]] },
          { label: "Known",     value: knownF,  set: setKnownF,  opts: [["all","All"],["yes","Well-known"],["no","Less-known"]] },
          { label: "Archive",   value: archF,   set: setArchF,   opts: [["all","All"],["yes","With"],["no","Without"]] },
        ].map(function(group, gi) {
          return (
            <div key={gi} role="group" aria-label={group.label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
              <span style={{ color: MUTED, fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", marginRight: "2px" }}>{group.label}</span>
              {group.opts.map(function(opt) {
                const pressed = group.value === opt[0];
                return (
                  <button key={opt[0]}
                    type="button"
                    className="elc-btn"
                    aria-pressed={pressed}
                    style={{ fontSize: "13px", padding: "4px 9px", opacity: pressed ? 1 : 0.7 }}
                    onClick={function() { group.set(opt[0]); }}>
                    {opt[1]}
                  </button>
                );
              })}
            </div>
          );
        })}
        {peopleFiltersActive && (
          <button type="button" className="elc-btn"
            style={{ fontSize: "13px", padding: "4px 9px" }}
            onClick={function() { setGenderF("all"); setKnownF("all"); setArchF("all"); }}>
            Reset
          </button>
        )}
      </div>

      {peopleFiltersActive && (
        <div role="status" aria-live="polite" style={{ marginBottom: "6px", textAlign: "center" }}>
          <span style={{ color: MUTED, fontSize: "13px", fontStyle: "italic" }}>
            {visibleCount} of {totalDataCount} figures match
          </span>
        </div>
      )}

      <div role="status" aria-live="polite" style={{ minHeight: "28px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px", maxWidth: "640px", textAlign: "center", padding: "0 12px" }}>
        {q && (
          <span style={{ color: MUTED, fontSize: "14px", fontStyle: "italic" }}>
            {matchCount === 0 ? "No figures match" :
             matchCount === 1 ? "1 match — press Enter to open" :
             matchCount + " matches"}
          </span>
        )}
        {!q && tip && (
          <div style={{ background: SURF, border: "1px solid " + BORD, borderRadius: "4px", padding: "6px 16px", color: TX, fontSize: "16px" }}>
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
                stroke="var(--rule)" strokeWidth="0.4" strokeOpacity="0.35" />
            );
          })}

          {RINGS_CFG.map(function(ring, ri) {
            return (
              <g key={ring.label}>
                <circle cx={CX} cy={CY} r={ring.cr}
                  fill="none" stroke={RING_COLORS[ri]} strokeWidth="2.2" strokeOpacity="0.55" />
                <text
                  x={CX} y={CY - ring.cr - 8}
                  textAnchor="middle"
                  fill={RING_COLORS[ri]}
                  fontFamily="'Cormorant Garamond', Georgia, serif"
                  fontSize="18"
                  fontWeight="600"
                  opacity="0.85"
                  letterSpacing="2">
                  {["I","II","III","IV"][ri]}
                </text>
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={OUTER_CFG.cr}
            fill="none" stroke={OUTER_COLOR} strokeWidth="2.4" strokeOpacity="0.65"
            strokeDasharray="10 6" />
          <text
            x={CX} y={CY - OUTER_CFG.cr - 8}
            textAnchor="middle"
            fill={OUTER_COLOR}
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize="18"
            fontWeight="600"
            opacity="0.85"
            letterSpacing="2">
            V
          </text>

          {linesMode !== "off" && (
            <g aria-hidden="true">
              {edges.map(function(e, i) {
                if (!enabledRings[e.fromRingIdx]) return null;
                const isFocused = tip && e.from.name === tip;
                if (linesMode === "focus" && !isFocused) return null;
                return (
                  <path key={i}
                    className="pw-edge"
                    d={arcPath(e.from.x, e.from.y, e.to.x, e.to.y)}
                    fill="none"
                    stroke={e.color}
                    strokeWidth={isFocused ? 3.0 : 2.0}
                    strokeOpacity={isFocused ? 0.95 : 0.78}
                    strokeLinecap="round" />
                );
              })}
            </g>
          )}

          <circle cx={CX} cy={CY} r="60" fill={GOLD} opacity="0.14" />
          <circle cx={CX} cy={CY} r="48" fill={GOLD} opacity="0.95" />
          <text x={CX} y={CY + 4} textAnchor="middle" fill={GOLD_TEXT} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="28" fontWeight="600" letterSpacing="2">ELC</text>
          <text x={CX} y={CY + 28} textAnchor="middle" fill={GOLD_TEXT} fontSize="13" opacity="0.85" letterSpacing="1">1866–1934</text>

          {nodes.map(function(n, i) {
            const isHov = tip === n.name;
            const opacity = nodeOpacity(n);
            const ringR = n.isOuter ? (isHov ? 12 : 10) : (isHov ? 14 : 11);
            const dotR = n.isOuter ? (isHov ? 7 : 5) : (isHov ? 9 : 6);
            const dotFill = n.isOuter ? OUTER_COLOR : n.color;
            const labelColor = n.isOuter
              ? (isHov ? OUTER_COLOR : TX_SOFT)
              : (isHov ? n.color : TX);
            const fontSize = n.isOuter ? 16 : 18;

            const visuals = (
              <>
                {n.hasData && (
                  <circle cx={n.x} cy={n.y} r={ringR}
                    fill="none" stroke={n.isOuter ? OUTER_COLOR : n.color}
                    strokeWidth={isHov ? 1.4 : 1.0}
                    strokeOpacity={isHov ? 0.85 : 0.55}
                    className="pw-ring" />
                )}
                <circle cx={n.x} cy={n.y}
                  r={dotR}
                  fill={dotFill}
                  opacity={isHov ? 1 : (n.isOuter ? 0.92 : 0.85)}
                  className="pw-dot" />
                <text
                  x={textX(n.x)} y={n.y + 6}
                  textAnchor={textAnchor(n.x)}
                  fill={labelColor}
                  fontFamily="'EB Garamond', Georgia, serif"
                  fontSize={fontSize}
                  fontWeight={isHov && !n.isOuter ? "600" : "400"}>
                  {n.name}
                </text>
              </>
            );

            // Decorative-only nodes (no data): plain <g>, no interactivity.
            if (!n.hasData) {
              return (
                <g key={i} className="pw-node" style={{ opacity }}>
                  {visuals}
                </g>
              );
            }

            // Real nodes use SVG <a> with href so iOS treats taps as link
            // activation (no first-tap-shows-hover, second-tap-clicks).
            const href = hrefFor({ name: "figure", figure: n.key });
            return (
              <a key={i}
                id={"pw-node-" + n.key}
                href={href}
                className="pw-node pw-node-active"
                role="button"
                aria-label={"View " + n.name}
                onMouseEnter={function() { setTip(n.name); }}
                onMouseLeave={function() { setTip(null); }}
                onFocus={function() { setTip(n.name); }}
                onBlur={function() { setTip(null); }}
                onClick={function(e) {
                  e.preventDefault();
                  navigate({ name: "figure", figure: n.key });
                }}
                onKeyDown={function(e) { handleNodeKey(e, n); }}
                style={{ cursor: "pointer", outline: "none", opacity }}>
                {visuals}
              </a>
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
          { color: OUTER_COLOR,    label: "Ring V — Same Outcome, Different Vocab" },
          { color: GOLD,           label: "ELC — Starting Point" },
        ].map(function(item, i) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ color: TX_SOFT, fontSize: "15px" }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      <aside role="note" style={{ marginTop: "20px", maxWidth: "560px", width: "100%", display: "flex", alignItems: "flex-start", gap: "10px", background: WARN_BG, border: "1px solid " + WARN_BORDER, borderRadius: "6px", padding: "12px 16px", boxSizing: "border-box" }}>
        <span aria-hidden="true" style={{ color: WARN, fontSize: "18px", flexShrink: 0, lineHeight: 1.2 }}>⚠</span>
        <p style={{ color: TX_SOFT, fontSize: "14px", lineHeight: 1.55, margin: 0 }}>
          <strong style={{ color: WARN }}>Still Being Updated.</strong> Entries marked ⚠ in detail view contain claims that are working hypotheses or inferences pending archival verification. All other entries draw from established scholarship and primary sources.
        </p>
      </aside>

      <Footer inset="1100px" />
    </div>
  );
}

// ---------- App + style/font injection ----------

// One-time injection of Google Fonts <link> + body CSS <style>. Idempotent
// across Strict Mode double-mounts.
function useInjectChrome() {
  useEffect(function() {
    if (typeof document === "undefined") return;
    if (!document.getElementById("elc-fonts")) {
      const pre1 = document.createElement("link");
      pre1.rel = "preconnect"; pre1.href = "https://fonts.googleapis.com";
      document.head.appendChild(pre1);
      const pre2 = document.createElement("link");
      pre2.rel = "preconnect"; pre2.href = "https://fonts.gstatic.com"; pre2.crossOrigin = "";
      document.head.appendChild(pre2);
      const link = document.createElement("link");
      link.id = "elc-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap";
      document.head.appendChild(link);
    }
    if (!document.getElementById("elc-css")) {
      const style = document.createElement("style");
      style.id = "elc-css";
      style.textContent = ELC_CSS;
      document.head.appendChild(style);
    }
  }, []);
}

export default function App() {
  useInjectChrome();
  const route = useRoute();
  const [theme, toggleTheme] = useTheme();

  useEffect(function() {
    const base = "Ella Lyman Cabot";
    if (route.name === "web") document.title = "The Philosophical Web · " + base;
    else if (route.name === "timeline") document.title = "Timeline · " + base;
    else if (route.name === "figure") document.title = route.figure + " · " + base;
    else document.title = base;
  }, [route]);

  if (route.name === "web") return <PhilosophicalWeb theme={theme} onToggleTheme={toggleTheme} initialQuery={route.query} />;
  if (route.name === "timeline") return <Timeline theme={theme} onToggleTheme={toggleTheme} />;
  if (route.name === "figure") return <DetailView name={route.figure} theme={theme} onToggleTheme={toggleTheme} />;
  return <Landing theme={theme} onToggleTheme={toggleTheme} />;
}
