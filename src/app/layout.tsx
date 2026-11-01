import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Instrument_Sans, Pinyon_Script, Azeret_Mono } from "next/font/google";
import "./globals.css";
import { Experience } from "@/components/Experience";
import { Nav } from "@/components/Nav";
import { Rail } from "@/components/Rail";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

// The same faces as the WebGrow360 real-estate site, plus a script used only for swash capitals.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
const mono = Azeret_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.product}: AI Agents, Automation & LLM Integration`,
    template: `%s | ${SITE.product}`,
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.product,
    locale: "en_IN",
    title: `${SITE.product}: The Intelligence Edition`,
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#e8e5dd",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable} ${script.variable} ${mono.variable}`} data-art="on" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');if(location.pathname==='/'&&!location.hash&&scrollY<41&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('is-intro')",
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Experience>
          <Nav />
          <Rail />
          <svg className="grain art-only" aria-hidden="true">
            <filter id="grain-f">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-f)" />
          </svg>
          <div className="page">
            {children}
            <Footer />
          </div>
        </Experience>
      </body>
    </html>
  );
}
