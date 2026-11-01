// Leadership, as on webgrow360.online/about.
export const TEAM = [
  {
    id: "ceo",
    role: "C.E.O",
    subtitle: "Sales & Growth",
    name: "Mr. Sushanta Bhattacharya",
    title: "Chief Executive Officer",
    photo: "/team/sushanta-bhattacharya.webp",
    bio: "Over 25 years of high-stakes sales and customer-focused leadership — now steering how WebGrow360 grows brands and the businesses behind them.",
    responsibilities: [
      "Sets growth strategy and the commercial direction of every engagement",
      "Leads client partnerships with a customer-first, sales-led approach",
      "Aligns creative, media and technology teams around one measurable result",
      "Makes sure no strategy gets lost between the first brief and the final conversion",
    ],
    chips: ["Sales leadership", "Growth strategy", "Client partnerships", "Customer experience"],
    quote: "Attention is only worth something when it turns into a customer.",
    linkedin: null as string | null,
  },
  {
    id: "cto",
    role: "C.T.O",
    subtitle: "AI/ML Architecture",
    name: "Er. Sayak Roy",
    title: "Chief Technology Officer",
    photo: "/team/sayak-roy.webp",
    bio: "Builds Agentic AI and ML systems, including machine learning work on the FIFA World Cup 2026 road safety network and network automation for the 2024 Asian Games.",
    responsibilities: [
      "Architects the AI/ML systems behind the WebGrow360 growth stack",
      "Marketing automation that captures, scores and nurtures every lead over WhatsApp and email",
      "CRM pipelines on HubSpot, Zoho and custom builds",
      "MCP-connected AI agents that read and act on live Meta Ads and CRM data",
    ],
    chips: ["Agentic AI", "Machine learning", "MCP agents", "HubSpot", "Zoho", "Meta Ads API", "WhatsApp automation"],
    quote: "Automation should give every lead a faster, more human answer — not a slower, more robotic one.",
    linkedin: "https://www.linkedin.com/in/sayak--roy/" as string | null,
  },
];

export const STORY = {
  founded: "2019",
  intro:
    "Founded in 2019 in the heart of Agartala, Tripura, WebGrow360 began with a simple mission: to bridge the digital divide for businesses in Northeast India.",
  paragraphs: [
    "We saw countless talented entrepreneurs with amazing products and services struggling to reach their audience online. What started as a small initiative to help local businesses has grown into a group serving clients across India, now headquartered in Kolkata.",
    "Our deep understanding of Indian business culture, combined with cutting-edge technology, has helped over 100 businesses achieve remarkable online growth. WebGrow360 AI is the group's engineering arm: the agents, automation and data systems that already power our own growth stack, now built for yours.",
  ],
  timeline: [
    { when: "2019", what: "Founded in Agartala" },
    { when: "Roots", what: "Serving local Northeast businesses" },
    { when: "Reach", what: "Expanding nationwide, 15+ states" },
    { when: "Today", what: "100+ businesses grown, and an AI practice" },
  ],
  mission:
    "To empower Indian businesses with world-class digital and AI solutions, helping them compete and succeed in the global marketplace.",
  values: [
    { name: "Results-driven", body: "Every system we build is designed to deliver measurable return for your business." },
    { name: "Client-centric", body: "Your success is our success. We work as an extension of your team." },
    { name: "Excellence", body: "We hold the highest engineering standards in everything we ship." },
    { name: "Local commitment", body: "Rooted in Northeast India, building for businesses across the country." },
  ],
  numbers: [
    { value: 2019, suffix: "", label: "Founded in Agartala" },
    { value: 100, suffix: "+", label: "Projects completed" },
    { value: 15, suffix: "+", label: "States served" },
    { value: 98, suffix: "%", label: "Client satisfaction" },
  ],
};
