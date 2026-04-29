import { useState, useEffect } from "react";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 700);
  useEffect(function() {
    function onResize() { setIsMobile(window.innerWidth < 700); }
    window.addEventListener("resize", onResize);
    return function() { window.removeEventListener("resize", onResize); };
  }, []);
  return isMobile;
}
