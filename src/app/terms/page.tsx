import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern use of the WebGrow360 AI website and our AI services: proposals, fees, refunds, ownership of what we build, AI-specific terms, liability and governing law.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "2 November 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "These terms",
    body: [
      `These terms govern your use of this website and, together with any proposal, statement of work or agreement we sign with you, the services we provide. By using the website or engaging us, you agree to them. If you engage us on behalf of a business, you confirm you are authorised to bind it.`,
      `If a signed proposal, statement of work or master services agreement says something different from these terms, the signed document prevails for that engagement.`,
    ],
  },
  {
    id: "who",
    title: "Who we are",
    body: [
      `WebGrow360 AI is a service of WebGrow360 Online, with its office at ${SITE.address}, India. You can reach us at ${SITE.email} or ${SITE.phone}.`,
    ],
  },
  {
    id: "website",
    title: "Using this website",
    list: [
      "Use the website only for lawful purposes and in a way that does not infringe anyone's rights.",
      "Do not attempt to gain unauthorised access to the website, its servers or any connected system, or interfere with its operation, for example with malicious code, denial-of-service attacks or automated scraping that places an unreasonable load on it.",
      "Do not copy, reproduce or republish the website's design, text, illustrations or code for commercial purposes without our written permission.",
    ],
    after: "We may suspend or restrict access to the website at any time, for maintenance or to protect it.",
  },
  {
    id: "information",
    title: "Information on this site",
    body: [
      "The website describes our services in general terms and is not professional, legal, financial or technical advice for your particular situation. Interface previews, dashboards and figures shown on the site use sample data to illustrate how our systems work; they are not results from a specific client unless stated. Timelines such as a working proof in 2–4 weeks are typical, not guaranteed, and depend on scope, access to systems and data, and how quickly decisions are made.",
    ],
  },
  {
    id: "engagements",
    title: "Proposals and engagements",
    body: [
      "Every engagement starts with a written proposal or statement of work describing the scope, deliverables, acceptance criteria, timeline and fees. Work outside that scope is a change request and is quoted separately before we start it. Proposals are valid for 30 days unless they say otherwise.",
    ],
  },
  {
    id: "fees",
    title: "Fees, invoices and taxes",
    list: [
      "Fees are quoted in Indian rupees unless the proposal states another currency, and are exclusive of GST and other applicable taxes, which are added to invoices at the prevailing rate.",
      "Unless the proposal says otherwise, invoices are payable within 15 days of the invoice date.",
      "Third-party costs you approve, such as cloud hosting, AI model usage and software subscriptions, are billed at cost or paid by you directly to the provider.",
      "If an invoice is overdue by more than 15 days, we may pause work after giving written notice, and charge interest at 1.5% per month or the maximum permitted by law, whichever is lower.",
    ],
  },
  {
    id: "refunds",
    title: "Cancellations and refunds",
    list: [
      "You may cancel an engagement at any time by written notice. You pay for work done and third-party costs committed up to the date of cancellation.",
      "Advance payments for work that has not started are refunded within 30 days of cancellation, less any non-refundable third-party costs we committed on your behalf.",
      "Fees for a discovery, audit or proof of concept are not refundable once the agreed deliverable has been delivered.",
      "Refunds are made to the original payment method or by bank transfer to the account that paid us.",
    ],
  },
  {
    id: "yours",
    title: "Your responsibilities",
    list: [
      "Give us accurate information, timely access to the systems, data and people the work needs, and decisions and feedback within the agreed times.",
      "Make sure you have the right to share any data, documents and content you give us, including any consent or notice required under the Digital Personal Data Protection Act, 2023 for personal data.",
      "Keep the credentials and access we hand over secure once a system is in your hands.",
      "Review the outputs of AI systems in your operations as described in the section on AI systems below.",
    ],
  },
  {
    id: "ownership",
    title: "Ownership of what we build",
    list: [
      "Once you have paid in full for an engagement, you own the custom deliverables we create for you in it: source code, prompts, configurations, evaluation sets and documentation. We hand over all of it.",
      "We keep ownership of our pre-existing tools, libraries, templates and general know-how. Where any of them are built into your deliverables, you receive a perpetual, royalty-free, non-exclusive licence to use, modify and maintain them as part of those deliverables.",
      "Open-source components remain under their own licences, which we list in the handover documentation.",
      "Your data, documents and content remain yours throughout. We use them only to perform the engagement.",
      "Unless you tell us otherwise in writing, we may name you as a client. We will not publish details of your project or data without your written approval.",
    ],
  },
  {
    id: "ai",
    title: "AI systems and their outputs",
    list: [
      "AI models produce probabilistic outputs. Even well-designed systems can be wrong, incomplete or out of date, and can behave differently as models and data change.",
      "We design systems with confidence thresholds, human review steps and logging where the consequences warrant it. You remain responsible for decisions made using AI outputs, and for having a qualified person review outputs before relying on them for legal, financial, medical, employment, safety or other significant decisions.",
      "We do not guarantee a particular accuracy rate, saving or business result unless one is written into the acceptance criteria of a signed statement of work.",
      "AI systems we build use third-party model providers and platforms, whose own terms, usage policies, pricing and availability apply and can change. Where a provider offers it, we configure your systems so that your data is not used to train its models, but we cannot control the provider's practices.",
      "You must not use systems we build to break the law, to deceive people about whether they are dealing with an AI, or for purposes prohibited by the model provider's usage policies.",
    ],
  },
  {
    id: "confidential",
    title: "Confidentiality",
    body: [
      "Each of us will keep the other's confidential information confidential, use it only for the engagement, and share it only with people who need it and are bound by similar obligations. This does not apply to information that is public, already known, independently developed or required to be disclosed by law. We are happy to sign a mutual non-disclosure agreement before a discovery call.",
    ],
  },
  {
    id: "data",
    title: "Personal data",
    body: [
      "Our privacy policy explains how we handle personal data about you. When we process personal data on your behalf in an engagement, we act as your data processor under the data protection terms of our agreement, follow your documented instructions, apply appropriate security safeguards, and tell you without undue delay about any personal data breach affecting that data.",
    ],
  },
  {
    id: "warranty",
    title: "Warranties",
    body: [
      "We will perform our services with reasonable skill and care, in line with good industry practice. If a deliverable does not meet its agreed acceptance criteria and you tell us within 30 days of delivery, we will fix it at no extra charge. Apart from that, and to the extent the law allows, the website and services are provided without any other warranty, express or implied, including fitness for a particular purpose or that they will be uninterrupted or error-free.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    list: [
      "Our total liability arising from an engagement is limited to the fees you paid us for that engagement in the 12 months before the event giving rise to the claim.",
      "Neither of us is liable for indirect or consequential loss, or for loss of profit, revenue, goodwill or anticipated savings.",
      "We are not liable for loss caused by your data or content, by third-party services, models or platforms, by changes you make to a system after handover, or by decisions made without the human review the system was designed to have.",
      "Nothing in these terms limits liability for fraud, wilful misconduct, gross negligence, or anything else that cannot be limited under Indian law.",
    ],
  },
  {
    id: "indemnity",
    title: "Indemnities",
    body: [
      "You will compensate us for claims by third parties arising from data or content you supplied, or from your use of a system in breach of these terms or the law. We will compensate you for claims by third parties that our custom deliverables, as delivered, infringe their intellectual property rights, excluding anything you supplied, open-source components and third-party services.",
    ],
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: [
      "Either of us may end an engagement by written notice if the other materially breaches these terms or the engagement documents and does not fix the breach within 15 days of being told about it, or becomes insolvent. On termination, you pay for work done to that date, we hand over the work completed and paid for, and each of us returns or deletes the other's confidential information, except copies the law requires us to keep.",
    ],
  },
  {
    id: "force",
    title: "Events beyond our control",
    body: [
      "Neither of us is responsible for delay or failure caused by events beyond reasonable control, such as natural disasters, epidemics, war, government action, power or network failures, or outages of third-party platforms and AI model providers. The affected party will tell the other promptly and resume as soon as possible.",
    ],
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: [
      "These terms are governed by the laws of India. If a dispute arises, we will first try in good faith to resolve it through discussion between senior people on both sides within 30 days. If that fails, the dispute will be referred to arbitration by a sole arbitrator under the Arbitration and Conciliation Act, 1996, with the seat and venue in Kolkata and proceedings in English. Subject to that, the courts at Kolkata, West Bengal have exclusive jurisdiction.",
    ],
  },
  {
    id: "general",
    title: "General",
    list: [
      "These terms are an electronic record under the Information Technology Act, 2000, and do not require a physical or digital signature.",
      "If any part of these terms is found unenforceable, the rest remains in force.",
      "A failure or delay in enforcing a right is not a waiver of it.",
      "Neither of us may transfer an engagement to someone else without the other's written consent, except to a successor of the whole business.",
      "We may update these terms; the version in force when you sign an engagement applies to that engagement. The date at the top shows the latest version.",
    ],
  },
  {
    id: "grievance",
    title: "Contact and grievances",
    body: [
      `Questions or complaints about these terms or our services can be sent to ${SITE.email} with the subject "Grievance", or by post to Grievance Officer, WebGrow360 Online, ${SITE.address}, India. We acknowledge them within 48 hours and aim to resolve them within 30 days.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      current="/terms"
      title="Terms of service"
      lede="The short version: you own what we build once it is paid for, AI outputs need a human in the loop where it matters, and anything signed between us takes precedence over this page."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}
