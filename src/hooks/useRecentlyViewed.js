import { useState, useEffect } from "react";

const STORAGE_KEY = "elc-recent";
const MAX = 5;

function read() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(function(s) { return typeof s === "string"; }) : [];
  } catch (e) { return []; }
}

function write(list) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch (e) { /* ignore */ }
}

// Records a view (most recent first, deduped, capped).
export function recordView(figureKey) {
  if (!figureKey || typeof window === "undefined") return;
  const cur = read().filter(function(k) { return k !== figureKey; });
  cur.unshift(figureKey);
  write(cur.slice(0, MAX));
}

// Returns the recent list, updates on storage events.
export default function useRecentlyViewed() {
  const [list, setList] = useState(read);
  useEffect(function() {
    function onStorage(e) { if (e.key === STORAGE_KEY) setList(read()); }
    window.addEventListener("storage", onStorage);
    return function() { window.removeEventListener("storage", onStorage); };
  }, []);
  return list;
}
