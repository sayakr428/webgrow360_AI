"use client";

import { useEffect, useRef, useState } from "react";

// A muted looping video that only plays while on screen. Reduced motion shows the poster frame.
export function BgVideo({ src, poster, className = "", label }: { src: string; poster?: string; className?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.removeAttribute("autoplay");
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  if (failed && poster) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={poster} alt={label ?? ""} />;
  }

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onError={() => setFailed(true)}
    />
  );
}
