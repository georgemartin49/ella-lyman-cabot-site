import { TX_SOFT, MUTED, RULE } from "../theme";
import { hrefFor } from "../router";

// Hand-edit when posting a substantive update.
const LAST_UPDATED = "April 2026";

export default function Footer({ inset }) {
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
