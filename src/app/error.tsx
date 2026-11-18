"use client";
import Link from "next/link";

// 500 boundary. Never renders the error message or stack; the digest is a safe reference for support.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container nf">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="h1">This page didn&apos;t load.</h1>
      <p className="lead">It&apos;s on our side, not yours. Try again, or come back in a moment.</p>
      <div className="cluster">
        <button className="btn btn-primary" onClick={reset}>Try again</button>
        <Link className="btn btn-secondary" href="/">Back to BDSG</Link>
      </div>
      {error.digest && <p className="small muted">Reference: {error.digest}</p>}
    </div>
  );
}
