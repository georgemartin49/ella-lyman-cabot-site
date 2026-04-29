import { useEffect } from "react";
import Landing from "./components/Landing";
import PhilosophicalWeb from "./components/PhilosophicalWeb";
import DetailView from "./components/DetailView";
import { useRoute } from "./router";

export default function App() {
  const route = useRoute();

  // Update document title per route.
  useEffect(function() {
    const base = "Ella Lyman Cabot";
    if (route.name === "web") document.title = "The Philosophical Web · " + base;
    else if (route.name === "figure") document.title = route.figure + " · " + base;
    else document.title = base;
  }, [route]);

  if (route.name === "web") return <PhilosophicalWeb />;
  if (route.name === "figure") return <DetailView name={route.figure} />;
  return <Landing />;
}
