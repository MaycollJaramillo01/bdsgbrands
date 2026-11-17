"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Staggered entrance for each section's parts. Added by script, so content stays visible without JS.
export function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = document.querySelectorAll<HTMLElement>(
      ".hero-text > *, .read-head > *, .formula > *, .base > *, .base table tr, .plan > *, .faq > *, .faq-cols p, .closer > *, .closer > div > *, .pdp-text > *",
    );
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => {
      const i = Array.from(el.parentElement?.children ?? []).indexOf(el);
      el.style.transitionDelay = `${Math.min(i, 6) * 75}ms`;
      el.classList.add("rise");
      io.observe(el);
    });
    return () => io.disconnect();
  }, [path]);
  return null;
}
