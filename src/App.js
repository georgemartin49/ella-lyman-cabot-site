import { useEffect } from "react";
import Landing from "./components/Landing";
import PhilosophicalWeb from "./components/PhilosophicalWeb";
import DetailView from "./components/DetailView";
import Timeline from "./components/Timeline";
import FigureIndex from "./components/FigureIndex";
import { fullName } from "./data/connections";
import { ALIASES } from "./data/figures";
import { useRoute } from "./router";
import useTheme from "./hooks/useTheme";

export default function App() {
  const route = useRoute();
  const [theme, toggleTheme] = useTheme();

  useEffect(function() {
    const base = "Ella Lyman Cabot";
    if (route.name === "web") document.title = "The Philosophical Web · " + base;
    else if (route.name === "timeline") document.title = "Timeline · " + base;
    else if (route.name === "figures") document.title = "Figures A to Z · " + base;
    else if (route.name === "figure") document.title = fullName(ALIASES[route.figure] || route.figure) + " · " + base;
    else document.title = base;
  }, [route]);

  if (route.name === "web") return <PhilosophicalWeb theme={theme} onToggleTheme={toggleTheme} initialQuery={route.query} />;
  if (route.name === "figures") return <FigureIndex theme={theme} onToggleTheme={toggleTheme} initialQuery={route.query} />;
  if (route.name === "timeline") return <Timeline theme={theme} onToggleTheme={toggleTheme} />;
  if (route.name === "figure") return <DetailView name={route.figure} theme={theme} onToggleTheme={toggleTheme} />;
  return <Landing theme={theme} onToggleTheme={toggleTheme} />;
}
