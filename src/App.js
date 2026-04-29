import { useEffect } from "react";
import Landing from "./components/Landing";
import PhilosophicalWeb from "./components/PhilosophicalWeb";
import DetailView from "./components/DetailView";
import { useRoute } from "./router";
import useTheme from "./hooks/useTheme";

export default function App() {
  const route = useRoute();
  const [theme, toggleTheme] = useTheme();

  useEffect(function() {
    const base = "Ella Lyman Cabot";
    if (route.name === "web") document.title = "The Philosophical Web · " + base;
    else if (route.name === "figure") document.title = route.figure + " · " + base;
    else document.title = base;
  }, [route]);

  if (route.name === "web") return <PhilosophicalWeb theme={theme} onToggleTheme={toggleTheme} />;
  if (route.name === "figure") return <DetailView name={route.figure} theme={theme} onToggleTheme={toggleTheme} />;
  return <Landing theme={theme} onToggleTheme={toggleTheme} />;
}
