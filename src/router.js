import { useState, useEffect } from "react";

// Minimal hash-based router. Routes:
//   #/             → { name: "landing" }
//   #/web          → { name: "web" }
//   #/figure/<key> → { name: "figure", figure: <decoded key> }

function parseRoute(hash) {
  const path = (hash || "").replace(/^#/, "");
  if (path === "" || path === "/") return { name: "landing" };
  if (path === "/web") return { name: "web" };
  const m = path.match(/^\/figure\/(.+)$/);
  if (m) {
    try { return { name: "figure", figure: decodeURIComponent(m[1]) }; }
    catch (e) { return { name: "landing" }; }
  }
  return { name: "landing" };
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
  if (route.name === "figure") return "#/figure/" + encodeURIComponent(route.figure);
  return "#/";
}

export function navigate(route) {
  window.location.hash = hrefFor(route).slice(1);
  // Reset scroll on navigation so detail pages start at the top.
  if (typeof window !== "undefined") window.scrollTo(0, 0);
}
