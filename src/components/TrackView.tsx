"use client";
import { useEffect } from "react";
import { track, type EventName } from "@/lib/analytics";

/** Fires one analytics event when a server page mounts. */
export function TrackView({ event, params = {} }: { event: EventName; params?: Record<string, string> }) {
  const key = JSON.stringify(params);
  useEffect(() => { track(event, JSON.parse(key)); }, [event, key]);
  return null;
}
