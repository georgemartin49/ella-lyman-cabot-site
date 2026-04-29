import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "elc-theme";

function readInitial() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
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

export default function useTheme() {
  const [theme, setTheme] = useState(readInitial);

  useEffect(function() { applyTheme(theme); }, [theme]);

  const toggle = useCallback(function() {
    setTheme(function(t) {
      const next = t === "dark" ? "light" : "dark";
      try { window.localStorage.setItem(STORAGE_KEY, next); }
      catch (e) { /* ignore */ }
      return next;
    });
  }, []);

  return [theme, toggle];
}
