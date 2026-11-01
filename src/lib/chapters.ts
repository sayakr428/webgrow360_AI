// The edition's chapters. Every service chapter has four beats: a painted stage, a torn edge, a parchment
// study and a ledger. Paintings are public domain (credited in the footer).
export type Art = { src: string; alt: string; pos: string; credit: string; href: string; ar?: number }; // ar: width / height

export type Chapter = {
  id: string;
  roman: string;
  label: string;
  word: string;
  subtitle: string;
  art: Art;
  // a scroll-scrubbed film that starts on the painting and changes it (encoded all-keyframe by scripts/encode-sequence.ps1)
  sequence?: { src: string; poster: string };
  slug: string;
  headline: string;
  mood: "candle" | "sky" | "dusk" | "oxblood" | "tapestry" | "chiaroscuro";
  prop: "bubble" | "doves" | "streams" | "book" | "laptop" | "chart";
  ghosts: string[];
  chips: string[];
};

export const ART = {
  creation: {
    src: "/art/creation.webp",
    ar: 2.206,
    alt: "Michelangelo's Creation of Adam: two hands reaching towards each other across the Sistine Chapel ceiling",
    pos: "50% 45%",
    credit: "Michelangelo, The Creation of Adam, c. 1511",
    href: "https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg",
  },
  astronomer: {
    src: "/art/astronomer.webp",
    ar: 0.88,
    alt: "Vermeer's Astronomer reaching for a celestial globe at his desk by the window",
    pos: "55% 40%",
    credit: "Johannes Vermeer, The Astronomer, c. 1668",
    href: "https://commons.wikimedia.org/wiki/File:Johannes_Vermeer_-_The_Astronomer_-_1668.jpg",
  },
  windmill: {
    src: "/art/windmill.webp",
    ar: 1.212,
    alt: "Ruisdael's Windmill at Wijk bij Duurstede: a great windmill beneath a towering sky of clouds",
    pos: "50% 35%",
    credit: "Jacob van Ruisdael, The Windmill at Wijk bij Duurstede, c. 1670",
    href: "https://commons.wikimedia.org/wiki/File:De_molen_bij_Wijk_bij_Duurstede_Rijksmuseum_SK-C-211.jpeg",
  },
  babel: {
    src: "/art/babel.webp",
    ar: 1.367,
    alt: "Bruegel's Tower of Babel: thousands of workers building a vast spiral tower above a harbour",
    pos: "50% 45%",
    credit: "Pieter Bruegel the Elder, The Tower of Babel, 1563",
    href: "https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg",
  },
  geographer: {
    src: "/art/geographer.webp",
    ar: 0.892,
    alt: "Vermeer's Geographer pausing over a map with dividers in hand",
    pos: "45% 40%",
    credit: "Johannes Vermeer, The Geographer, 1669",
    href: "https://commons.wikimedia.org/wiki/File:Johannes_Vermeer_-_The_Geographer_-_Google_Art_Project.jpg",
  },
  jerome: {
    src: "/art/jerome.webp",
    ar: 0.788,
    alt: "Antonello da Messina's Saint Jerome reading in his study, surrounded by shelves of books",
    pos: "60% 55%",
    credit: "Antonello da Messina, Saint Jerome in his Study, c. 1474",
    href: "https://commons.wikimedia.org/wiki/File:Antonello_da_Messina_-_St_Jerome_in_his_study_-_National_Gallery_London.jpg",
  },
  ambassadors: {
    src: "/art/ambassadors.webp",
    ar: 1.014,
    alt: "Holbein's Ambassadors standing beside a table of globes, instruments and books",
    pos: "50% 38%",
    credit: "Hans Holbein the Younger, The Ambassadors, 1533",
    href: "https://commons.wikimedia.org/wiki/File:Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg",
  },
  anatomy: {
    src: "/art/anatomy.webp",
    ar: 1.327,
    alt: "Rembrandt's Anatomy Lesson of Dr Tulp: surgeons leaning in to study the workings of an arm",
    pos: "50% 40%",
    credit: "Rembrandt, The Anatomy Lesson of Dr Nicolaes Tulp, 1632",
    href: "https://commons.wikimedia.org/wiki/File:Rembrandt_-_The_Anatomy_Lesson_of_Dr_Nicolaes_Tulp.jpg",
  },
  athens: {
    src: "/art/athens.webp",
    ar: 1.289,
    alt: "Raphael's School of Athens: philosophers in debate beneath great arches",
    pos: "50% 55%",
    credit: "Raphael, The School of Athens, 1511",
    href: "https://commons.wikimedia.org/wiki/File:%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
  },
  lady: {
    src: "/art/lady-writing.webp",
    ar: 0.877,
    alt: "Vermeer's A Lady Writing: a woman in a yellow jacket looks up from the letter she is writing at a table",
    pos: "64% 46%",
    credit: "Johannes Vermeer, A Lady Writing, c. 1665",
    href: "https://commons.wikimedia.org/wiki/File:Johannes_Vermeer_-_A_Lady_Writing_-_Google_Art_Project.jpg",
  },
} satisfies Record<string, Art>;

// Original images made for the site (not public domain paintings, so kept out of the footer's credit list):
// the About cover, the studio objects floating in each chapter's cloud, and two photographs per chapter's wells.
export const COUNCIL = {
  src: "/art/council.webp",
  ar: 1.792,
  alt: "An oil painting of scholars, engineers and merchants around a long table of drawings and instruments beneath a stone arch",
  pos: "50% 55%",
};

export type PropKind = "bell" | "robot" | "coin" | "stamp" | "chip" | "cable" | "pen" | "letter" | "phone" | "keycap" | "lens" | "compass";
export const CHAPTER_PROPS: Record<string, [PropKind, PropKind]> = {
  agents: ["bell", "robot"],
  automation: ["stamp", "coin"],
  data: ["chip", "cable"],
  language: ["pen", "letter"],
  apps: ["phone", "keycap"],
  insight: ["lens", "compass"],
};

export const WELL_PHOTOS: Record<string, [string, string]> = {
  agents: ["An operations executive with a headset answering customers at a laptop", "A hand holding a phone with a chat conversation open"],
  automation: ["Stacks of supplier invoices being sorted into trays beside a calculator", "A finance manager reviewing approvals on a laptop"],
  data: ["An aisle of server racks lit by blue status lights", "A data analyst working across two monitors of charts"],
  language: ["A lawyer reading a highlighted contract", "Paper documents feeding through an office scanner"],
  apps: ["A developer writing code at night by a desk lamp", "A sales representative showing a tablet to a client"],
  insight: ["Colleagues pointing at a process map of sticky notes on a glass wall", "A consultant interviewing a warehouse supervisor between shelves"],
};
export const wellSrc = (id: string, i: number) => `/wells/${id}-${i + 1}.webp`;

export const CHAPTERS: Chapter[] = [
  {
    id: "agents",
    roman: "I",
    label: "Agents",
    word: "Agents",
    subtitle: "Digital colleagues that read, reason and act inside your tools.",
    art: ART.astronomer,
    slug: "custom-ai-agents",
    headline: "Work, delegated",
    mood: "candle",
    prop: "bubble",
    ghosts: ["Draft the renewal email for Northwind", "Which accounts went quiet this month?", "Log this call in HubSpot", "Book a follow-up for Thursday"],
    chips: ["Resolved", "3 tools used", "Awaiting approval"],
  },
  {
    id: "automation",
    roman: "II",
    label: "Automation",
    word: "Automation",
    subtitle: "The busywork, quietly built out of your week.",
    art: ART.windmill,
    slug: "ai-workflow-automation",
    headline: "Approvals, on autopilot",
    mood: "sky",
    prop: "doves",
    ghosts: ["Match invoice 2207 to its PO", "Escalate anything over ₹5,00,000", "Remind Legal about the NDA", "Archive approved claims"],
    chips: ["Auto-approved", "Needs you", "Posted"],
  },
  {
    id: "data",
    roman: "III",
    label: "Data",
    word: "Data",
    subtitle: "Every system feeding one current source of truth.",
    art: ART.babel,
    sequence: { src: "/media/data-eras.mp4", poster: "/media/data-eras.jpg" },
    slug: "data-pipeline-automation",
    headline: "Pipelines, observed",
    mood: "dusk",
    prop: "streams",
    ghosts: ["Backfill March orders", "Why did billing_events pause?", "Add Zoho to the warehouse", "Freshness check every 5 min"],
    chips: ["14 healthy", "Schema changed", "+12,904 rows"],
  },
  {
    id: "language",
    roman: "IV",
    label: "Language",
    word: "Language",
    subtitle: "Your company's knowledge, finally answering back.",
    art: ART.jerome,
    slug: "llm-integration",
    headline: "Answers, with sources",
    mood: "oxblood",
    prop: "book",
    ghosts: ["Summarise the 2025 handbook changes", "Which clause covers late delivery?", "Translate this policy into Bengali", "Find contracts expiring in Q1"],
    chips: ["2 sources", "Cited", "Model: any"],
  },
  {
    id: "apps",
    roman: "V",
    label: "Apps",
    word: "Apps",
    subtitle: "AI products taken from first sketch to production.",
    art: ART.ambassadors,
    slug: "ai-app-development",
    headline: "Products, shipped",
    mood: "tapestry",
    prop: "laptop",
    ghosts: ["Stream the answer while the agent works", "Add a voice mode for field reps", "Cap model spend at ₹40,000 a month", "Ship to 40 reps on Monday"],
    chips: ["412 ms", "Live", "100% your code"],
  },
  {
    id: "insight",
    roman: "VI",
    label: "Insight",
    word: "Insight",
    subtitle: "We open up your operations before we automate them.",
    art: ART.anatomy,
    slug: "process-intelligence",
    headline: "Waste, measured",
    mood: "chiaroscuro",
    prop: "chart",
    ghosts: ["Time-study the onboarding team", "Rank processes by return", "Model the cost of manual reporting", "Which step causes rework?"],
    chips: ["92 score", "23 processes", "ROI modelled"],
  },
];

// Chapters whose stage dissolves into the next painting instead of tearing.
export const SHATTER_AFTER = new Set(["data", "apps"]);

// Original paintings for a shatter's two sides, where it shouldn't simply reuse the chapter paintings. After Data the
// glass breaks from the 2026 skyline the Data film ends on into a present-day remake of the Jerome study; the Language
// stage underneath still shows Antonello's original.
export const SHATTER_ART: Record<string, { from?: Art; to?: Art }> = {
  data: {
    from: {
      src: "/art/data-2026.webp",
      alt: "A painted city of 2026: glass towers rising behind an old stone citadel above a harbour of container ships",
      pos: "50% 50%",
      credit: "",
      href: "",
    },
    to: {
      src: "/art/jerome-modern.webp",
      alt: "An oil painting of a present-day reader at a laptop in a lamp-lit study alcove beneath stone arches",
      pos: "60% 55%",
      credit: "",
      href: "",
    },
  },
  // after Apps the glass breaks into a present-day clinical trial; the Insight stage keeps Rembrandt's Anatomy Lesson
  apps: {
    to: {
      src: "/art/anatomy-modern.webp",
      alt: "An oil painting of doctors and researchers at monitors around a volunteer in a hospital bed beside a scanner and robotic arm",
      pos: "50% 45%",
      credit: "",
      href: "",
    },
  },
};

export const TOC = [
  ...CHAPTERS.map((c) => ({ id: c.id, roman: c.roman, label: c.label })),
  { id: "industries", roman: "VII", label: "Industries" },
  { id: "method", roman: "VIII", label: "Method" },
  { id: "about", roman: "IX", label: "About" },
  { id: "contact", roman: "X", label: "Contact" },
];

export const SKILLS = [
  { t: "/invoice-intake", s: 3 },
  { t: "/lead-scoring", s: 2 },
  { t: "/kyc-check", s: 1 },
  { t: "/whatsapp-followup", s: 3 },
  { t: "/crm-sync", s: 1 },
  { t: "/meta-ads-report", s: 2 },
  { t: "/returns-triage", s: 1 },
  { t: "/contract-review", s: 2 },
  { t: "/support-deflection", s: 3 },
  { t: "/po-matching", s: 1 },
  { t: "/hr-onboarding", s: 1 },
  { t: "/sales-forecast", s: 2 },
  { t: "/document-qa", s: 1 },
  { t: "/shipment-alerts", s: 2 },
  { t: "/email-triage", s: 1 },
  { t: "/site-visit-booking", s: 1 },
];

// The hero's layered fresco (scripts/split-creation.py): three aligned layers on the full 3524 x 1599 canvas,
// and the two index fingertips measured on the source image, as fractions of width and height.
export const CREATION = {
  w: 3524,
  h: 1599,
  layers: { bg: "/art/creation/bg", god: "/art/creation/god", adam: "/art/creation/adam" },
  touch: { adam: { x: 0.377, y: 0.46 }, god: { x: 0.38, y: 0.452 } },
  // scripts/split-eras.py: both figures re-dressed through four eras, each layer aligned to the same canvas.
  // `at` is the hero's pin progress where that era has fully arrived; the fingertips touch at 0.45.
  eras: [
    { label: "Origins", at: 0 },
    { label: "The wild", at: 0.13 },
    { label: "1500s", at: 0.25 },
    { label: "2020s", at: 0.37 },
  ],
  poster: "/art/creation-cover.webp",
};
export const eraSrc = (fig: "adam" | "god", i: number, big = false) => `${CREATION.layers[fig]}-${i}${big ? "" : "-1600w"}.webp`;
export const TOUCH_MID = { x: (CREATION.touch.adam.x + CREATION.touch.god.x) / 2, y: (CREATION.touch.adam.y + CREATION.touch.god.y) / 2 };
