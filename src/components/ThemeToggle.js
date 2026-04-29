export default function ThemeToggle({ theme, onToggle }) {
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
