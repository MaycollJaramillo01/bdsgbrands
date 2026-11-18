// Minimal 20px line icons for the admin nav (decorative: always paired with a visible label).
const P: Record<string, string> = {
  home: "M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z",
  orders: "M4 5h12l-1 11H5zM7 5a3 3 0 0 1 6 0",
  products: "M10.5 3H16a1 1 0 0 1 1 1v5.5L9.5 17 3 10.5zM13.5 6.5h.01",
  customers: "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 17a6 6 0 0 1 12 0",
  discounts: "M5 15 15 5M6.5 6.5h.01M13.5 13.5h.01M10 2.5l2 1.5 2.5-.2.8 2.4 2.2 1.3-.8 2.5.8 2.5-2.2 1.3-.8 2.4-2.5-.2-2 1.5-2-1.5-2.5.2-.8-2.4L3.3 12l.8-2.5-.8-2.5 2.2-1.3.8-2.4 2.5.2z",
  waitlist: "M4 5h12M4 10h12M4 15h7",
  messages: "M3 5h14v9H8l-4 3v-3H3z",
  policies: "M6 3h6l4 4v10H6zM12 3v4h4M8 11h6M8 14h6",
  settings: "M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4",
  search: "M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM17 17l-3.5-3.5",
  store: "M3 8l1.5-4h11L17 8M3 8h14v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM8 17v-4h4v4",
  external: "M11 3h6v6M17 3l-8 8M14 12v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4",
};
export function Icon({ name }: { name: keyof typeof P | string }) {
  return (
    <svg className="adm-ico" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={P[name] ?? ""} />
    </svg>
  );
}
