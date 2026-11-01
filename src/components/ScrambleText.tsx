"use client";

// Adapted from "Scramble Text" by dqnamo on 21st.dev (21st.dev/@dqnamo/components/scramble-text).
import { useEffect, useState } from "react";

const ENCRYPTED_TEXT_CHARS = "-_~`!@#$%^&*()+=[]{}|;:,.<>?";
const MAX_REVEAL_STEPS = 48;

function getTextSegments(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}

function stableChar(segment: string, index: number) {
  let hash = index + 1;
  for (const character of segment) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 2147483647;
  return ENCRYPTED_TEXT_CHARS[hash % ENCRYPTED_TEXT_CHARS.length];
}

function scrambleSegments(segments: string[], revealed: number, random: boolean) {
  return segments
    .map((c, i) => {
      if (c.trim() === "" || i < revealed) return c;
      return random ? ENCRYPTED_TEXT_CHARS[Math.floor(Math.random() * ENCRYPTED_TEXT_CHARS.length)] : stableChar(c, i);
    })
    .join("");
}

export function ScrambleText({ children, className, intervalMs = 32 }: { children: string; className?: string; intervalMs?: number }) {
  const [displayText, setDisplayText] = useState(() => scrambleSegments(getTextSegments(children), 0, false));

  useEffect(() => {
    const segments = getTextSegments(children);
    if (segments.length === 0 || intervalMs <= 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayText(children);
      return;
    }
    let revealed = 0;
    const step = Math.max(1, Math.ceil(segments.length / MAX_REVEAL_STEPS));
    setDisplayText(scrambleSegments(segments, revealed, true));
    const timer = window.setInterval(() => {
      revealed = Math.min(segments.length, revealed + step);
      setDisplayText(scrambleSegments(segments, revealed, true));
      if (revealed >= segments.length) window.clearInterval(timer);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [children, intervalMs]);

  return (
    <span className={className}>
      <span aria-hidden="true">{displayText}</span>
      <span aria-atomic="true" aria-live="polite" className="sr-only">
        {children}
      </span>
    </span>
  );
}
