// Editorial primitives shared by every page.

// A serif heading whose first letter is a calligraphic swash capital. The letter exists once in the DOM, so the
// heading reads "Work, delegated" to screen readers and in copied text; only its styling differs.
export function SwashHeading({
  text,
  as: Tag = "h2",
  className = "",
  id,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
}) {
  return (
    <Tag className={`swash ${className}`} id={id}>
      <span className="swash__cap">{text.charAt(0)}</span>
      {text.slice(1)}
    </Tag>
  );
}

// The torn paper edge between a painting stage and the parchment lives in its own client component.
export { TornEdge } from "./TornEdge";

// The small outlined link the edition uses under every feature.
export function Pill({ href, children, external = false, variant = "ghost" }: { href: string; children: React.ReactNode; external?: boolean; variant?: "ghost" | "solid" | "outline" }) {
  return (
    <a className={`pill pill--${variant}`} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
