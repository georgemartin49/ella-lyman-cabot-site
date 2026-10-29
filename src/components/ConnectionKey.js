import { CONNECTION_TYPES } from "../data/connections";
import { SURF, BORD, TX, TX_SOFT } from "../theme";

// Explains the two independent things the site records about each figure.
export default function ConnectionKey({ compact }) {
  return (
    <section aria-labelledby="how-to-read" style={{ background: SURF, border: "1px solid " + BORD, borderRadius: "6px", padding: "16px 20px" }}>
      <h2 id="how-to-read" className="elc-eyebrow">How to read the map</h2>
      <p style={{ color: TX, fontSize: compact ? "15px" : "16px", lineHeight: 1.6, margin: "0 0 10px" }}>
        Each figure carries two separate labels. The <strong>ring</strong> is the editor's judgment of how close that figure's account of selfhood is to Cabot's, from closest agreement (Ring I) to opposing positions (Ring IV), with parallel positions from other traditions in Ring V. The ring says nothing about whether Cabot knew or read the figure. That is given by the <strong>connection type</strong>:
      </p>
      <dl style={{ margin: 0, display: "grid", gap: "6px" }}>
        {Object.keys(CONNECTION_TYPES).map(function(k) {
          return (
            <div key={k}>
              <dt style={{ display: "inline", color: TX, fontWeight: 600, fontSize: compact ? "15px" : "16px" }}>{CONNECTION_TYPES[k].label}. </dt>
              <dd style={{ display: "inline", margin: 0, color: TX_SOFT, fontSize: compact ? "15px" : "16px" }}>{CONNECTION_TYPES[k].desc}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
