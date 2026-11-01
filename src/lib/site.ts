// Company details, shared with webgrow360.online and realestate.webgrow360.online.
export const SITE = {
  name: "WebGrow360",
  product: "WebGrow360 AI",
  url: "https://ai.webgrow360.online",
  email: "Connect@team.webgrow360.online",
  phone: "+91 89743 32863",
  phoneHref: "tel:+918974332863",
  whatsapp: "https://wa.me/918974332863?text=Hi%20WebGrow360%2C%20I%27d%20like%20to%20talk%20about%20AI%20automation%20for%20my%20business.",
  address: "25B Camac Street, Kolkata 700016",
  mapHref: "https://www.google.com/maps/search/?api=1&query=25B+Camac+Street+Kolkata+700016",
  booking: "mailto:Connect@team.webgrow360.online?subject=AI%20discovery%20call",
  description:
    "WebGrow360 AI builds AI agents, workflow automation, LLM integrations, data pipelines and AI apps for growing businesses — a working proof on your own data in 2–4 weeks, and 100% of the code handed to you.",
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sayak--roy/" },
    { label: "WhatsApp", href: "https://wa.me/918974332863" },
  ],
  // The WebGrow360 group of businesses, as listed on the sister sites.
  network: [
    { label: "WebGrow360 .Media", href: "https://webgrow360.online/", state: "Visit" },
    { label: "WebGrow360 .Realestates", href: "https://realestate.webgrow360.online/", state: "Visit" },
    { label: "WebGrow360 .AI", href: "/", state: "You're here" },
    { label: "WebGrow360 .Finance", href: null, state: "Soon" },
  ],
  markets: ["Kolkata HQ", "Siliguri", "Bhubaneswar", "Guwahati", "Patna", "Ranchi"],
};

// Brand videos. hero.mp4 and the showcase clips are generated for this site; the industry clips are shared with
// the media site.
export const VIDEOS = {
  hero: { src: "/media/hero.mp4", poster: "/media/hero.jpg" },
  showcase: [
    { src: "/media/datacenter.mp4", poster: "/media/datacenter.jpg", label: "Data pipelines that never sleep" },
    { src: "/media/robotics.mp4", poster: "/media/robotics.jpg", label: "Automation with precision" },
    { src: "/media/interface.mp4", poster: "/media/interface.jpg", label: "Agents you can see thinking" },
  ],
};
