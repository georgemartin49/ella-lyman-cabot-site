import { CONNECTION_TYPES } from "../data/connections";
import { SURF, BORD, TX, TX_SOFT, MUTED } from "../theme";

// Explains the two independent things recorded about each figure, and what
// evidence each kind of relationship requires.
export default function ConnectionKey({ compact }) {
  const fs = compact ? "15px" : "16px";
  const cell = { padding: "6px 10px 6px 0", verticalAlign: "top", fontSize: fs, lineHeight: 1.5, borderTop: "1px solid " + BORD };
  return (
    <section aria-labelledby="how-to-read" style={{ background: SURF, border: "1px solid " + BORD, borderRadius: "6px", padding: "16px 20px" }}>
      <h2 id="how-to-read" className="elc-eyebrow">How to read the map</h2>
      <p style={{ color: TX, fontSize: fs, lineHeight: 1.6, margin: "0 0 10px" }}>
        Each figure carries two separate labels. The <strong>ring</strong> is the editor's judgment of how close that
        figure's account of selfhood is to Cabot's, from closest agreement (Ring I) to opposing positions (Ring IV), with
        parallel positions from other traditions in Ring V. A ring is an interpretation, not a historical claim: a figure
        Cabot never read can sit in Ring I. Whether she knew or read a figure is given by the <strong>relationship</strong>:
      </p>
      <table style={{ borderCollapse: "collapse", width: "100%", color: TX }}>
        <thead>
          <tr>
            <th scope="col" style={{ ...cell, borderTop: "none", textAlign: "left", color: MUTED, fontWeight: 600 }}>Relationship</th>
            <th scope="col" style={{ ...cell, borderTop: "none", textAlign: "left", color: MUTED, fontWeight: 600 }}>Evidence needed</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(CONNECTION_TYPES).map(function(k) {
            const t = CONNECTION_TYPES[k];
            return (
              <tr key={k}>
                <th scope="row" style={{ ...cell, textAlign: "left", fontWeight: 600, width: "42%" }}>{t.label}</th>
                <td style={{ ...cell, color: TX_SOFT }}>{t.evidence}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

// The editor's signed account of how the map was built. Replace the text below
// with the editor's own introduction when it is ready.
export function MapIntroduction() {
  return (
    <section aria-labelledby="map-intro" style={{ background: SURF, border: "1px dashed " + BORD, borderRadius: "6px", padding: "16px 20px" }}>
      <h2 id="map-intro" className="elc-eyebrow">How this map was made</h2>
      <p style={{ color: TX_SOFT, fontSize: "16px", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
        A signed introduction by Jacob B. Castleberry, explaining how the figures were chosen and placed and the evidence
        behind each relationship, will appear here. Until then, every ring placement and comparison on this site should be
        read as the editor's provisional judgment.
      </p>
    </section>
  );
}
