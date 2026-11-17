"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Staggered entrance for children of [data-reveal]. Class added by script, so content stays visible without JS.
export function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal] > *").forEach((el, _, all) => {
      const i = Array.prototype.indexOf.call(el.parentElement!.children, el);
      el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
      el.classList.add("reveal");
      io.observe(el);
      void all;
    });
    return () => io.disconnect();
  }, [path]);
  return null;
}
