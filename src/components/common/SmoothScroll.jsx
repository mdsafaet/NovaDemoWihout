import { useEffect } from "react";
import Lenis from "lenis";
import { addTicker } from "@/lib/ticker";
import { lenisRef } from "@/lib/lenis";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -30 }, // handles every in-page #link, incl. the mobile menu
      autoRaf: false, // driven from the shared ticker so WebGL stays in sync
    });
    lenisRef.current = lenis;
    const removeTick = addTicker((t) => lenis.raf(t));

    // Radix dialogs lock body scroll; pause Lenis while one is open.
    const sync = () => {
      if (document.body.hasAttribute("data-scroll-locked")) lenis.stop();
      else lenis.start();
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked", "style"] });

    return () => {
      mo.disconnect();
      removeTick();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
  return null;
}
