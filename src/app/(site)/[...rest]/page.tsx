import { notFound } from "next/navigation";

// Unmatched public URLs render (site)/not-found.tsx inside the site chrome.
export default function CatchAll() { notFound(); }
