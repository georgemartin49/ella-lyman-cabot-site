import { TX, BORD, ACCENT } from "../theme";

const styles = `
  .elc-theme-toggle {
    background: transparent;
    border: 1px solid ${BORD};
    color: ${TX};
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px;
    cursor: pointer;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 200ms, border-color 200ms;
  }
  .elc-theme-toggle:hover, .elc-theme-toggle:focus-visible {
    border-color: ${ACCENT};
    color: ${ACCENT};
    outline: none;
  }
  .elc-theme-toggle:focus-visible { box-shadow: 0 0 0 2px var(--accent-faint-strong); }
  .elc-theme-toggle .elc-toggle-icon { font-size: 15px; }
`;

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  const next = isDark ? "light" : "dark";
  return (
    <>
      <style>{styles}</style>
      <button
        type="button"
        className="elc-theme-toggle"
        aria-label={"Switch to " + next + " mode"}
        title={"Switch to " + next + " mode"}
        onClick={onToggle}>
        <span className="elc-toggle-icon" aria-hidden="true">{isDark ? "☀" : "☾"}</span>
        <span>{isDark ? "Light" : "Dark"}</span>
      </button>
    </>
  );
}
