"use client";

import { useEffect, useId, useState } from "react";
import { flushSync } from "react-dom";
import { sound } from "@/lib/sound";

// What the agent "answers" when a prompt is opened: a short plan, streamed. Illustrative, as the footer says.
function reply(prompt: string) {
  return [
    `› ${prompt}`,
    "",
    "Plan",
    "1. Read the request and the records it touches",
    "2. Call the connected tools (CRM, inbox, ERP)",
    "3. Draft the result and hold it for your approval",
    "",
    "✓ Done in 2.4 s · nothing is sent until you approve",
  ].join("\n");
}

type VT = { startViewTransition?: (cb: () => void) => unknown };

// A chat-composer card: brand avatar, round send button. Clicking it opens a dark stage that streams a reply.
export function PromptCard({ text, className = "", ghost = false }: { text: string; className?: string; ghost?: boolean }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState("");
  const name = { current: `p${useId().replace(/[^a-zA-Z0-9]/g, "")}` };

  const toggle = (next: boolean) => {
    const doc = document as unknown as VT;
    const run = () => flushSync(() => setOpen(next));
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(run);
    else run();
    if (next) sound.open();
    else sound.close();
  };

  useEffect(() => {
    if (!open) return;
    const full = reply(text);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(full);
      return;
    }
    let i = 0;
    setShown("");
    const t = window.setInterval(() => {
      i = Math.min(full.length, i + 2);
      setShown(full.slice(0, i));
      if (i >= full.length) window.clearInterval(t);
    }, 18);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && toggle(false);
    addEventListener("keydown", esc);
    return () => {
      window.clearInterval(t);
      removeEventListener("keydown", esc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, text]);

  if (ghost)
    return (
      <div className={`prompt prompt--ghost ${className}`} aria-hidden="true">
        <span className="prompt__text">{text}</span>
        <span className="prompt__bar">
          <img src="/brand/mark.png" alt="" width={16} height={16} />
          <span className="prompt__send">↑</span>
        </span>
      </div>
    );

  return (
    <>
      <button
        type="button"
        className={`prompt ${className}`}
        style={{ viewTransitionName: open ? "none" : name.current }}
        onClick={() => toggle(true)}
        aria-haspopup="dialog"
        data-sfx="none"
      >
        <span className="prompt__text">{text}</span>
        <span className="prompt__bar">
          <img src="/brand/mark.png" alt="" width={16} height={16} />
          <span className="prompt__send" aria-hidden="true">
            ↑
          </span>
        </span>
      </button>
      {open && (
        <div className="prompt-stage" role="dialog" aria-modal="true" aria-label={text} onClick={() => toggle(false)}>
          <div className="prompt-stage__panel" style={{ viewTransitionName: name.current }} onClick={(e) => e.stopPropagation()}>
            <pre className="prompt-stage__out">
              {shown}
              <span className="prompt-stage__caret" aria-hidden="true" />
            </pre>
            <button type="button" className="prompt-stage__close" onClick={() => toggle(false)} autoFocus>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
