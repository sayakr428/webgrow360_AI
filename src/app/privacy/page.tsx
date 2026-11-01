import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How WebGrow360 AI collects, uses, stores and protects personal data, and the rights you have under India's Digital Personal Data Protection Act, 2023.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2 November 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: [
      `This website is operated by WebGrow360 Online ("WebGrow360", "we", "us"), the business behind WebGrow360 AI, with its office at ${SITE.address}, India. We are the data fiduciary for personal data collected through this website, our contact form and our sales conversations.`,
      `For anything in this policy, contact us at ${SITE.email} or ${SITE.phone}.`,
    ],
  },
  {
    id: "collect",
    title: "What we collect",
    list: [
      "Contact details you give us: your name, work email, phone number, company and role, when you use our contact form, email us, message us on WhatsApp, call us or book a discovery call.",
      "What you tell us about your project: the service you are interested in, an indicative budget and timeline, and the workflows, systems and goals you share so we can scope the work.",
      "Technical data: your browser, device, approximate location derived from your IP address, pages visited and the referring site, recorded in our hosting provider's standard server logs.",
      "Preferences stored on your device: whether you switched sound or art mode on. This stays in your browser's local storage and is never sent to us.",
    ],
    after: "We do not ask for, and ask you not to send us, sensitive personal data such as financial account details, health information or government identity numbers through the website.",
  },
  {
    id: "form",
    title: "Our contact form",
    body: [
      "The contact form does not store your message on our servers. When you submit it, it prepares an email in your own email app, addressed to us; nothing is sent until you press send there. From that point we hold your message in our business email account and use it only to reply to your enquiry.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    list: [
      "To reply to your enquiry, schedule calls and prepare proposals.",
      "To deliver and support the services you engage us for.",
      "To keep the website secure, diagnose faults and understand which pages are useful.",
      "To meet legal, tax and accounting obligations.",
    ],
    after: "We do not sell your personal data, we do not use it for advertising, and we do not use it to train AI models.",
  },
  {
    id: "basis",
    title: "Our legal basis",
    body: [
      "We process personal data on the basis of your consent, which you give by contacting us, and for the legitimate uses permitted under section 7 of the Digital Personal Data Protection Act, 2023, such as responding to a request you made or complying with the law. You can withdraw consent at any time by writing to us, as easily as you gave it; this does not affect processing that already took place, but we may then be unable to continue a conversation or engagement.",
    ],
  },
  {
    id: "client-data",
    title: "Data we handle for clients",
    body: [
      "When we build AI systems for a client, we may process data belonging to that client and their customers. In those engagements the client is the data fiduciary and we act as its data processor: we act only on the client's documented instructions under a written agreement, process only what the work requires, keep it in the client's own cloud or approved infrastructure wherever possible, and configure AI model providers so that the data is not used to train their models.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    list: [
      "Service providers who help us run the business, such as email, hosting, calendar and messaging providers, who process data on our behalf under confidentiality and data protection obligations.",
      "Other businesses in the WebGrow360 group, only where you have asked for a service they provide.",
      "Professional advisers such as accountants and lawyers, where needed.",
      "Courts, regulators and law enforcement authorities, where the law requires it.",
    ],
  },
  {
    id: "transfers",
    title: "Transfers outside India",
    body: [
      "Some of our service providers store or process data outside India. We transfer personal data abroad only to countries not restricted by the Government of India under section 16 of the Digital Personal Data Protection Act, 2023, and only to providers bound by appropriate safeguards.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: [
      "We keep enquiry and contact data for as long as we are in conversation with you and for up to 24 months afterwards, unless you ask us to delete it sooner. Contract, invoice and tax records are kept for the period the law requires, currently up to eight years. When data is no longer needed, we delete it or make it anonymous.",
    ],
  },
  {
    id: "security",
    title: "How we protect it",
    body: [
      "We use encryption in transit, access controls limited to the people who need the data, multi-factor authentication on our business accounts, and reputable infrastructure providers. No system is perfectly secure.",
    ],
  },
  {
    id: "breach",
    title: "If something goes wrong",
    body: [
      "If a personal data breach affects you, we will inform you and the Data Protection Board of India without undue delay, in the form and within the time the law requires, describing what happened, the likely consequences and what we are doing about it.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    list: [
      "Access a summary of the personal data we hold about you, how we use it, and who we have shared it with.",
      "Correct, complete or update it.",
      "Erase it, where we no longer need it for the purpose you gave it for and the law does not require us to keep it.",
      "Withdraw consent at any time.",
      "Nominate another person to exercise your rights in case of death or incapacity.",
      "Raise a grievance with us, and, if it is not resolved, complain to the Data Protection Board of India.",
    ],
    after: `To exercise any of these, email ${SITE.email}. We may ask you to confirm your identity first, and we respond within 30 days.`,
  },
  {
    id: "duties",
    title: "Your duties",
    body: [
      "The Digital Personal Data Protection Act, 2023 also asks data principals to give authentic information, not to impersonate anyone, not to suppress material information, and not to file false or frivolous complaints. If you share someone else's personal data with us, please make sure you are allowed to.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: [
      "This website does not use advertising, analytics or tracking cookies, and it does not include third-party trackers. It stores two preferences in your browser (sound and art mode), which you can clear at any time from your browser settings. If we ever add analytics, we will update this policy and ask for consent where the law requires it.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      "Our services are for businesses. We do not knowingly collect personal data from anyone under 18, and we do not track or target children. If you believe a child has sent us personal data, tell us and we will delete it.",
    ],
  },
  {
    id: "links",
    title: "Other websites",
    body: [
      "This website links to other sites, including other WebGrow360 businesses, WhatsApp, LinkedIn, Google Maps and Wikimedia Commons. Their own privacy policies apply when you visit them.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      `We may update this policy as our services or the law change. The date at the top shows the latest version; for significant changes we will also notify people we are in contact with. This version was last updated on ${UPDATED}.`,
    ],
  },
  {
    id: "grievance",
    title: "Grievance officer",
    body: [
      `For questions or complaints about how we handle personal data, write to our Grievance Officer at ${SITE.email} with the subject "Grievance", or by post to Grievance Officer, WebGrow360 Online, ${SITE.address}, India. We acknowledge grievances within 48 hours and aim to resolve them within 30 days.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="Privacy policy"
      lede="Plainly: we collect only what we need to talk to you and do the work, we never sell it, and we never use it to train AI models."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}
