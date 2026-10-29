import Page from "./Page";
import { proseCss } from "./ReadingPages";
import { hrefFor } from "../router";
import { EDITOR } from "../data/writings";
import { QUOTATION, LONG_PASSAGE } from "../data/pages";

const css = `
  .home-head { margin: 4px 0 18px; }
  .home-head .dates { color: var(--accent); font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; margin: 0 0 6px; }
  .home-head h1 { margin-bottom: 4px; }
  .home-routes { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; margin: 6px 0 0; padding: 0; list-style: none; }
  .home-routes a { display: block; padding: 12px 14px; border: 1px solid var(--border); border-radius: 6px; text-decoration: none; color: var(--text); }
  .home-routes a:hover { border-color: var(--accent); background: var(--accent-faint); }
  .home-routes strong { display: block; color: var(--accent); font-size: 18px; }
  .home-routes span { font-size: 15px; color: var(--text-soft); line-height: 1.45; }
`;

export default function Landing(props) {
  return (
    <Page current="landing" {...props}>
      <style>{proseCss + css}</style>
      <div className="prose">
        <div className="home-head">
          <p className="dates">1866 - 1934</p>
          <h1>Ella Lyman Cabot</h1>
          <p className="small" style={{ margin: 0 }}>A research resource edited by <a href={EDITOR.site}>{EDITOR.name}</a></p>
        </div>

        <p>
          Ella Lyman Cabot was a Boston philosopher and ethics educator. She studied with George Herbert Palmer and Josiah
          Royce at Radcliffe and Harvard, served on the Massachusetts Board of Education for nearly thirty years, and
          published seven books on ethics and the moral education of children. Her writing examines love, individuality,
          and moral growth.
        </p>
        <ul className="next-links">
          <li><a href={hrefFor({ name: "life" })}>Her life</a></li>
          <li><a href={hrefFor({ name: "writings" })}>Her writings</a></li>
          <li><a href={hrefFor({ name: "everyday-ethics" })}>Start with <em>Everyday Ethics</em></a></li>
        </ul>

        <blockquote>
          <p>&ldquo;{QUOTATION.text}&rdquo;</p>
          <footer>{QUOTATION.source}</footer>
        </blockquote>
        {LONG_PASSAGE && (
          <blockquote>
            {LONG_PASSAGE.text.map(function(t, i) { return <p key={i}>{t}</p>; })}
            <footer>{LONG_PASSAGE.source}</footer>
          </blockquote>
        )}

        <h2>The edition</h2>
        <p>
          {EDITOR.name} is preparing a comprehensive critical edition of Cabot's surviving writings, and has reviewed and
          transcribed all of the Ella Lyman Cabot Papers at the Schlesinger Library. <a href={hrefFor({ name: "edition" })}>About the edition</a>
        </p>

        <h2>Explore the people around her</h2>
        <ul className="home-routes">
          <li><a href={hrefFor({ name: "figures" })}><strong>Figures A to Z</strong><span>Teachers, family, friends, and the thinkers her work is compared with.</span></a></li>
          <li><a href={hrefFor({ name: "web" })}><strong>Map</strong><span>The same figures arranged by how close their positions are to hers.</span></a></li>
          <li><a href={hrefFor({ name: "timeline" })}><strong>Timeline</strong><span>The figures by lifespan, with her lifetime marked.</span></a></li>
        </ul>

        <p className="small" style={{ marginTop: "26px" }}>
          This resource is being revised so that each documentary claim carries its own citation and each comparison sets
          out passages from both authors. Ring placements and comparisons are the editor's provisional judgments.
        </p>
      </div>
    </Page>
  );
}
