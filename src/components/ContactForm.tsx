"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

type Fields = {
  name: string;
  email: string;
  company: string;
  phone: string;
  budget: string;
  timeline: string;
  message: string;
  consent: boolean;
};
type Errors = Partial<Record<keyof Fields, string>>;

const BUDGETS = ["Not sure yet", "Under ₹5 lakh", "₹5–15 lakh", "₹15–50 lakh", "Over ₹50 lakh"];
const TIMELINES = ["Exploring for now", "Within 3 months", "As soon as possible"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Tell us your name.";
  if (!EMAIL.test(f.email.trim())) e.email = "Enter an email we can reply to, like you@company.com.";
  if (f.phone.trim() && !/^[+()\d\s-]{7,}$/.test(f.phone.trim())) e.phone = "Use digits, spaces and an optional + only.";
  if (f.message.trim().length < 20) e.message = "A sentence or two about the work helps us reply usefully (20 characters or more).";
  if (!f.consent) e.consent = "Please confirm so we can reply to you.";
  return e;
}

// The enquiry form. There is no server behind it: a valid submission opens the visitor's email app with the
// message composed and addressed to us, and the page says so plainly, with a copy button and WhatsApp as fallbacks.
// Fields validate when you leave them; on submit, errors are summarised and focus moves to the summary.
export function ContactForm({ email, whatsapp, services }: { email: string; whatsapp: string; services: string[] }) {
  const uid = useId();
  const [f, setF] = useState<Fields>({ name: "", email: "", company: "", phone: "", budget: BUDGETS[0], timeline: TIMELINES[0], message: "", consent: false });
  const [interest, setInterest] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [copied, setCopied] = useState(false);
  const summary = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    const next = { ...f, [k]: v };
    setF(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k: keyof Fields) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(f));
  };
  const err = (k: keyof Fields) => (touched[k] ? errors[k] : undefined);
  const id = (k: string) => `${uid}-${k}`;

  const subject = `Project enquiry from ${f.name.trim() || "the website"}${f.company.trim() ? `, ${f.company.trim()}` : ""}`;
  const head = [`Name: ${f.name.trim()}`, `Email: ${f.email.trim()}`];
  if (f.company.trim()) head.push(`Company: ${f.company.trim()}`);
  if (f.phone.trim()) head.push(`Phone: ${f.phone.trim()}`);
  head.push(`Interested in: ${interest.length ? interest.join(", ") : "Not sure yet"}`, `Budget: ${f.budget}`, `Timeline: ${f.timeline}`);
  const body = `${head.join("\n")}\n\n${f.message.trim()}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = validate(f);
    setErrors(all);
    setTouched({ name: true, email: true, phone: true, message: true, consent: true });
    if (Object.keys(all).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setState("sending");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.setTimeout(() => setState("done"), 600);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${email}\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  if (state === "done")
    return (
      <div className="cform cform--done" role="status">
        <p className="cform__kicker">Almost there</p>
        <h3 className="cform__done-h">Your message is ready in your email app.</h3>
        <p>
          Press send there and it reaches us at <a href={`mailto:${email}`}>{email}</a>. A person reads every enquiry and replies within one working
          day.
        </p>
        <p>If your email app didn’t open:</p>
        <div className="cform__alts">
          <button type="button" className="cbtn cbtn--ghost" onClick={copy}>
            {copied ? "Copied" : "Copy the message"}
          </button>
          <a className="cbtn cbtn--ghost" href={`${whatsapp.split("?")[0]}?text=${encodeURIComponent(body)}`} target="_blank" rel="noopener noreferrer">
            Send it on WhatsApp
          </a>
          <button type="button" className="cbtn cbtn--link" onClick={() => setState("idle")}>
            Edit the message
          </button>
        </div>
      </div>
    );

  const list = Object.entries(errors).filter(([k]) => touched[k as keyof Fields]);

  return (
    <form className="cform" onSubmit={submit} noValidate aria-describedby={`${id("note")}`}>
      {list.length > 0 && (
        <div className="cform__summary" ref={summary} tabIndex={-1} role="alert">
          <p>Please check {list.length === 1 ? "one thing" : `${list.length} things`}:</p>
          <ul>
            {list.map(([k, m]) => (
              <li key={k}>
                <a href={`#${id(k)}`}>{m}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="cform__row">
        <div className={`field${err("name") ? " is-bad" : ""}`}>
          <label htmlFor={id("name")}>
            Your name <span aria-hidden="true">*</span>
          </label>
          <input id={id("name")} name="name" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} aria-invalid={!!err("name")} aria-describedby={err("name") ? id("name-e") : undefined} required />
          {err("name") && (
            <p className="field__err" id={id("name-e")}>
              {err("name")}
            </p>
          )}
        </div>
        <div className={`field${err("email") ? " is-bad" : ""}`}>
          <label htmlFor={id("email")}>
            Work email <span aria-hidden="true">*</span>
          </label>
          <input id={id("email")} name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} value={f.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} aria-invalid={!!err("email")} aria-describedby={err("email") ? id("email-e") : undefined} required />
          {err("email") && (
            <p className="field__err" id={id("email-e")}>
              {err("email")}
            </p>
          )}
        </div>
      </div>

      <div className="cform__row">
        <div className="field">
          <label htmlFor={id("company")}>
            Company <span className="field__opt">optional</span>
          </label>
          <input id={id("company")} name="company" autoComplete="organization" value={f.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className={`field${err("phone") ? " is-bad" : ""}`}>
          <label htmlFor={id("phone")}>
            Phone <span className="field__opt">optional</span>
          </label>
          <input id={id("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} onBlur={() => blur("phone")} aria-invalid={!!err("phone")} aria-describedby={err("phone") ? id("phone-e") : undefined} />
          {err("phone") && (
            <p className="field__err" id={id("phone-e")}>
              {err("phone")}
            </p>
          )}
        </div>
      </div>

      <fieldset className="field field--chips">
        <legend>
          What can we help with? <span className="field__opt">choose any</span>
        </legend>
        <div className="chips">
          {services.map((s) => {
            const on = interest.includes(s);
            return (
              <button key={s} type="button" className={`chipbtn${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => setInterest((l) => (on ? l.filter((x) => x !== s) : [...l, s]))}>
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="cform__row">
        <div className="field">
          <label htmlFor={id("budget")}>Indicative budget</label>
          <select id={id("budget")} name="budget" value={f.budget} onChange={(e) => set("budget", e.target.value)}>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id("timeline")}>Timeline</label>
          <select id={id("timeline")} name="timeline" value={f.timeline} onChange={(e) => set("timeline", e.target.value)}>
            {TIMELINES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`field${err("message") ? " is-bad" : ""}`}>
        <label htmlFor={id("message")}>
          Tell us about the work <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={6}
          value={f.message}
          onChange={(e) => set("message", e.target.value)}
          onBlur={() => blur("message")}
          aria-invalid={!!err("message")}
          aria-describedby={`${id("message-h")}${err("message") ? ` ${id("message-e")}` : ""}`}
          required
        />
        <p className="field__help" id={id("message-h")}>
          Which process, which systems it touches, and what a good outcome looks like. No sensitive data, please.
        </p>
        {err("message") && (
          <p className="field__err" id={id("message-e")}>
            {err("message")}
          </p>
        )}
      </div>

      <div className={`field field--check${err("consent") ? " is-bad" : ""}`}>
        <input id={id("consent")} type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} onBlur={() => blur("consent")} aria-invalid={!!err("consent")} aria-describedby={err("consent") ? id("consent-e") : undefined} />
        <label htmlFor={id("consent")}>
          I agree to WebGrow360 using these details to reply to my enquiry, as described in the <Link href="/privacy">privacy policy</Link>.
        </label>
        {err("consent") && (
          <p className="field__err" id={id("consent-e")}>
            {err("consent")}
          </p>
        )}
      </div>

      <div className="cform__foot">
        <button type="submit" className="cbtn" disabled={state === "sending"}>
          {state === "sending" ? "Opening your email…" : "Send enquiry"}
          <span aria-hidden="true">→</span>
        </button>
        <p className="cform__note" id={id("note")}>
          This opens your email app with the message ready to send. Nothing is stored on this website.
        </p>
      </div>
    </form>
  );
}
