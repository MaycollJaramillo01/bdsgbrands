import type { Product } from "@/lib/products";

// Drawn tube for formulas without a photograph yet (brand manual, 02-empaque-tubos).
export function Tube({ p }: { p: Product }) {
  const step = Number(p.n) * 25;
  return (
    <div className="tube" role="img" aria-label={`${p.name} tube, 6 oz`}>
      <div className="tube-body">
        <img src="/brand/bdsg-apilado-plum.svg" alt="" />
        <b>{p.name}</b>
        <span className="lbl">{p.n} / 04 · {p.role}</span>
        <span className="act">{p.actives.slice(0, 3).join("\n")}</span>
        <span className="net">Net Wt. 6 oz / 177 ml</span>
        <i className="band"><i style={{ width: `${step}%` }} /></i>
      </div>
    </div>
  );
}
