// Illustrative interface fragments: what the systems we build look like while they work.
// Figures are sample data and add up within each fragment.

export function WorkflowFragment() {
  const rows = [
    { item: "Contract renewal", state: "Approved" },
    { item: "Expense, $1,240", state: "Needs you", on: true },
    { item: "PO 4471", state: "Approved" },
  ];
  return (
    <div className="ui" data-ui>
      <p className="ui__title">Approvals · 3 of 41</p>
      <ul className="ui__list">
        {rows.map((r) => (
          <li key={r.item} className={`ui__row ui__row--2${r.on ? " is-on" : ""}`}>
            <span>{r.item}</span>
            <span className={r.on ? "ui__flag" : "ui__soft"}>{r.state}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgentFragment() {
  const steps = [
    ["Plan", "Find why Halden's invoice failed"],
    ["search_crm", "Halden Ltd · account 20931"],
    ["get_invoices", "INV-8812 · card expired"],
    ["draft_reply", "Update link sent for approval"],
  ];
  return (
    <div className="ui" data-ui>
      <p className="ui__title">Agent trace · ticket 5520</p>
      <ol className="ui__trace">
        {steps.map(([tool, out], i) => (
          <li key={tool} className={i === 3 ? "is-on" : ""}>
            <strong>{tool}</strong>
            <span className="ui__soft">{out}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PipelineFragment() {
  const rows = [
    { name: "orders", fresh: "42 s ago" },
    { name: "crm_contacts", fresh: "3 min ago" },
    { name: "billing_events", fresh: "Schema changed", on: true },
  ];
  return (
    <div className="ui" data-ui>
      <p className="ui__title">Pipelines · 14 healthy, 1 paused</p>
      <ul className="ui__list">
        {rows.map((r) => (
          <li key={r.name} className={`ui__row ui__row--2${r.on ? " is-on" : ""}`}>
            <span>{r.name}</span>
            <span className={r.on ? "ui__flag" : "ui__soft"}>{r.fresh}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RagFragment() {
  return (
    <div className="ui" data-ui>
      <p className="ui__title">Ask the handbook</p>
      <p className="ui__q">Can contractors expense travel?</p>
      <p className="ui__a">
        Yes, if it is in the signed statement of work and booked through the travel portal
        <sup className="ui__cite">1</sup>. Claims over $500 need a manager&apos;s approval<sup className="ui__cite">2</sup>.
      </p>
      <p className="ui__soft ui__small">1 · Contractor policy §4.2 &nbsp; 2 · Expenses policy §1.7</p>
    </div>
  );
}

export function AppFragment() {
  return (
    <div className="ui" data-ui>
      <p className="ui__title">Deal desk assistant</p>
      <p className="ui__q">Summarise the Northwind renewal risk.</p>
      <p className="ui__a">
        Usage is down 18% since March and two champions have left. Renewal is in 41 days
        <span className="ui__caret" aria-hidden="true" />
      </p>
      <p className="ui__soft ui__small">Streaming · first token in 412 ms</p>
    </div>
  );
}

export function ProcessFragment() {
  const rows = [
    { name: "Invoice intake", score: 92 },
    { name: "Order exceptions", score: 81 },
    { name: "Customer onboarding", score: 64 },
    { name: "Monthly reporting", score: 47 },
  ];
  return (
    <div className="ui" data-ui>
      <p className="ui__title">Automation potential · 4 of 23 processes</p>
      <ul className="ui__bars">
        {rows.map((r) => (
          <li key={r.name}>
            <span>{r.name}</span>
            <span className="ui__bar" style={{ "--v": r.score / 100 } as React.CSSProperties} />
            <span className="ui__num">{r.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const SERVICE_FRAGMENTS: Record<string, () => React.JSX.Element> = {
  "ai-workflow-automation": WorkflowFragment,
  "custom-ai-agents": AgentFragment,
  "data-pipeline-automation": PipelineFragment,
  "llm-integration": RagFragment,
  "ai-app-development": AppFragment,
  "process-intelligence": ProcessFragment,
};

export const INDUSTRY_FRAGMENTS = [
  {
    title: "KYC review · Ardent Capital",
    rows: [
      ["Passport", "Verified"],
      ["Proof of address", "Verified"],
      ["Source of funds", "Needs analyst"],
    ],
  },
  {
    title: "Referral intake · 9:14",
    rows: [
      ["Patient record", "Matched"],
      ["Procedure code", "Suggested: 29881"],
      ["Clinician sign-off", "Waiting"],
    ],
  },
  {
    title: "Return 18822 · wool coat",
    rows: [
      ["Order age", "12 days"],
      ["Policy", "Eligible"],
      ["Refund", "$189.00 issued"],
    ],
  },
  {
    title: "Shipment ZX-4410",
    rows: [
      ["Carrier status", "Held at customs"],
      ["Missing", "Commercial invoice"],
      ["Action", "Document re-sent"],
    ],
  },
  {
    title: "Ticket 7731 · SSO setup",
    rows: [
      ["Intent", "Configuration"],
      ["Answer", "From docs §SAML"],
      ["Outcome", "Resolved, no hand-off"],
    ],
  },
];
