import { useEffect, useRef } from "react";
import Landing from "./components/Landing";
import PhilosophicalWeb from "./components/PhilosophicalWeb";
import DetailView from "./components/DetailView";
import Timeline from "./components/Timeline";
import FigureIndex from "./components/FigureIndex";
import { Life, Writings, Edition, EverydayEthics } from "./components/ReadingPages";
import { fullName } from "./data/connections";
import { ALIASES } from "./data/figures";
import { useRoute } from "./router";
import useTheme from "./hooks/useTheme";

const TITLES = { life: "Her life", writings: "Writings", edition: "The edition", "everyday-ethics": "Everyday Ethics" };
const READING = { life: Life, writings: Writings, edition: Edition, "everyday-ethics": EverydayEthics };

export default function App() {
  const route = useRoute();
  const [theme, toggleTheme] = useTheme();
  const first = useRef(true);
  const pageKey = route.name + "/" + (route.figure || "");

  // After moving to another page, start at the top and put focus on its content.
  useEffect(function() {
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
    const main = document.getElementById("main");
    if (main) main.focus({ preventScroll: true });
  }, [pageKey]);

  useEffect(function() {
    const base = "Ella Lyman Cabot";
    if (route.name === "web") document.title = "Map · " + base;
    else if (route.name === "timeline") document.title = "Timeline · " + base;
    else if (route.name === "figures") document.title = "Figures A to Z · " + base;
    else if (TITLES[route.name]) document.title = TITLES[route.name] + " · " + base;
    else if (route.name === "figure") document.title = fullName(ALIASES[route.figure] || route.figure) + " · " + base;
    else document.title = base;
  }, [route]);

  if (route.name === "web") return <PhilosophicalWeb theme={theme} onToggleTheme={toggleTheme} initialQuery={route.query} />;
  if (READING[route.name]) { const R = READING[route.name]; return <R theme={theme} onToggleTheme={toggleTheme} />; }
  if (route.name === "figures") return <FigureIndex theme={theme} onToggleTheme={toggleTheme} initialQuery={route.query} />;
  if (route.name === "timeline") return <Timeline theme={theme} onToggleTheme={toggleTheme} />;
  if (route.name === "figure") return <DetailView name={route.figure} theme={theme} onToggleTheme={toggleTheme} />;
  return <Landing theme={theme} onToggleTheme={toggleTheme} />;
}
