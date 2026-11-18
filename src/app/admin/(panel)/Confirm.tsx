"use client";

/** Submit button that asks before an irreversible action. */
export function Confirm({ children, message, className = "adm-btn adm-btn-danger" }: { children: React.ReactNode; message: string; className?: string }) {
  return <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}
