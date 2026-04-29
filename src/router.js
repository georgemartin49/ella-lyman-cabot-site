import { useState, useEffect } from "react";

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

export function useRoute() {
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

export function hrefFor(route) {
  if (route.name === "landing") return "#/";
  if (route.name === "web") return "#/web";
  if (route.name === "timeline") return "#/timeline";
  if (route.name === "figure") return "#/figure/" + encodeURIComponent(route.figure);
  return "#/";
}

export function navigate(route) {
  window.location.hash = hrefFor(route).slice(1);
  if (typeof window !== "undefined") window.scrollTo(0, 0);
}

// Update the URL's query string without navigating away or scrolling.
// Used by the web view to keep its URL in sync with search/lines state.
export function replaceQuery(routeName, params) {
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
