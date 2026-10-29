import { TX_SOFT, MUTED, RULE } from "../theme";
import { hrefFor } from "../router";
import { EDITOR } from "../data/writings";

// Hand-edit when posting a substantive update.
const LAST_UPDATED = "October 2026";

const link = { color: TX_SOFT, textDecoration: "none", borderBottom: "1px dotted currentColor" };

export default function Footer({ inset }) {
  return (
    <footer style={{
      maxWidth: inset || "720px",
      width: "100%",
      margin: "48px auto 0",
      padding: "20px 16px 32px",
      borderTop: "1px solid " + RULE,
      color: TX_SOFT,
      fontSize: "14px",
      lineHeight: 1.55,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: "8px",
      boxSizing: "border-box",
      fontStyle: "italic"
    }}>
      <span>
        <a href={hrefFor({ name: "landing" })} style={link}>Ella Lyman Cabot</a>, a research resource edited
        by <a href={EDITOR.site} style={link}>{EDITOR.name}</a>. <a href={EDITOR.contact} style={link}>Contact</a>
        {" · "}<a href={EDITOR.edition} style={link}>The Cabot edition</a>
      </span>
      <span style={{ color: MUTED }}>Last updated {LAST_UPDATED}</span>
    </footer>
  );
}
