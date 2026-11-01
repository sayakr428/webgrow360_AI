export type Service = {
  slug: string;
  name: string;
  fact: string;
  summary: string;
  intro: string;
  features: { name: string; body: string }[];
  deliverables: string[];
  useCases: string[];
  faqs: { q: string; a: string }[];
  related: string[];
  seoTitle: string;
  seoDescription: string;
};

export const SERVICES: Service[] = [
  {
    slug: "ai-workflow-automation",
    name: "AI Workflow Automation",
    fact: "Documents, approvals and hand-offs that run themselves.",
    summary:
      "End-to-end process automation that reads documents, routes approvals and moves work between your systems without anyone copying and pasting.",
    intro:
      "Most operations work is the same twenty steps done by hand a thousand times a month. We replace those steps with automations that read, decide and act inside the tools your team already uses, and send only the real exceptions to a person.",
    features: [
      {
        name: "Document processing",
        body: "Invoices, contracts, claims, forms and emails are read, classified and turned into clean structured data, with a confidence score on every field.",
      },
      {
        name: "Approval routing",
        body: "Rules and models decide who needs to see what. Routine items are approved automatically; exceptions reach the right owner with the context attached.",
      },
      {
        name: "Orchestration",
        body: "One flow across your ERP, CRM, inbox and spreadsheets, with retries, audit logs and a human-in-the-loop step wherever you want one.",
      },
    ],
    deliverables: [
      "Process map of the workflow as it runs today",
      "Automations in production on your infrastructure",
      "Exception queue and audit log your team can work from",
      "Runbooks and handover training",
    ],
    useCases: [
      "Accounts payable: invoice intake, PO matching and posting",
      "Customer onboarding and KYC document checks",
      "Claims intake and triage",
      "Order exceptions and returns handling",
    ],
    faqs: [
      {
        q: "Do we need to replace our current tools?",
        a: "No. We automate around the systems you already run, through their APIs where they exist and through careful browser or file automation where they don't.",
      },
      {
        q: "What happens when the automation is unsure?",
        a: "Every step carries a confidence threshold. Anything below it goes to a person with the document, the extracted data and the reason it was flagged.",
      },
    ],
    related: ["process-intelligence", "custom-ai-agents", "data-pipeline-automation"],
    seoTitle: "AI Workflow Automation Services",
    seoDescription:
      "AI workflow automation for documents, approvals and cross-system hand-offs. Built on your stack, with human review where it matters and full code ownership.",
  },
  {
    slug: "custom-ai-agents",
    name: "Custom AI Agents",
    fact: "Agents that reason in steps, use your tools and remember.",
    summary:
      "Autonomous agents tuned to your domain that plan multi-step work, call your tools and APIs, and keep the context of every case they handle.",
    intro:
      "An agent is worth building when a task needs judgement across several steps: look something up, compare it, decide, act, explain. We design agents around one real job in your business, give them exactly the tools they need, and measure them against how your best people do that job.",
    features: [
      {
        name: "Domain-tuned",
        body: "Prompts, retrieval and evaluation sets built from your own documents, policies and past cases, so the agent speaks your language and follows your rules.",
      },
      {
        name: "Tool use",
        body: "Typed, permissioned tool calls into your CRM, ticketing, databases and internal APIs, with every call logged and reversible actions gated.",
      },
      {
        name: "Memory",
        body: "Short-term working memory for each task and long-term memory for each customer or case, stored where you control it.",
      },
    ],
    deliverables: [
      "Agent design: job, tools, guardrails and success criteria",
      "Evaluation suite built from your real cases",
      "Production agent with monitoring and traces",
      "Playbook for extending it with new tools",
    ],
    useCases: [
      "Support agents that resolve tickets end to end",
      "Research agents that compile account or supplier briefs",
      "Operations agents that chase, reconcile and update records",
      "Internal copilots over your policies and procedures",
    ],
    faqs: [
      {
        q: "How do you stop an agent doing something it shouldn't?",
        a: "Agents only get the tools they need, with scoped permissions. Actions that change money, customers or data can require approval, and every step is traced.",
      },
      {
        q: "Which models do you use?",
        a: "Whichever fits the job and your constraints. The architecture is model-agnostic, so you can switch providers or run open models without a rebuild.",
      },
    ],
    related: ["llm-integration", "ai-workflow-automation", "ai-app-development"],
    seoTitle: "Custom AI Agent Development",
    seoDescription:
      "Custom AI agents tuned to your domain: multi-step reasoning, secure tool use and memory, evaluated on your real cases and deployed with full tracing.",
  },
  {
    slug: "data-pipeline-automation",
    name: "Data Pipeline Automation",
    fact: "Real-time ingestion and ETL with observability built in.",
    summary:
      "Pipelines that ingest, transform and deliver data across your stack in real time, with no manual runs and full visibility when something changes upstream.",
    intro:
      "AI is only as good as the data it can reach. We build the pipelines that get your data out of the systems it lives in, clean and shape it, and deliver it on time to your warehouse, your dashboards and your models, with alerts before anyone notices a gap.",
    features: [
      {
        name: "Ingestion",
        body: "Connectors for databases, SaaS APIs, files and event streams, batch or real time, with schema changes detected instead of silently breaking.",
      },
      {
        name: "ETL / ELT",
        body: "Tested, version-controlled transformations that turn raw records into models your analysts and AI systems can trust.",
      },
      {
        name: "Observability",
        body: "Freshness, volume and quality checks on every table, with lineage so you can see what a failure touches.",
      },
    ],
    deliverables: [
      "Source-to-destination data map",
      "Pipelines deployed on your cloud with orchestration",
      "Data quality tests and alerting",
      "Lineage and documentation for every model",
    ],
    useCases: [
      "Unifying CRM, billing and product data into one warehouse",
      "Feeding clean, current data to RAG and agents",
      "Real-time operational dashboards",
      "Replacing fragile spreadsheet and cron-job reporting",
    ],
    faqs: [
      {
        q: "Which warehouses and tools do you work with?",
        a: "The common cloud warehouses and lakehouses, plus standard orchestration and transformation tools. We fit the stack you have or recommend one when you have none.",
      },
      {
        q: "Can you take over pipelines we already have?",
        a: "Yes. We audit what exists, keep what works, and rebuild the parts that fail or nobody understands.",
      },
    ],
    related: ["llm-integration", "ai-workflow-automation", "process-intelligence"],
    seoTitle: "Data Pipeline Automation Services",
    seoDescription:
      "Automated data pipelines: real-time ingestion, tested ETL/ELT and observability across your stack, so your analytics and AI run on current, trusted data.",
  },
  {
    slug: "llm-integration",
    name: "LLM Integration",
    fact: "RAG, search and prompt systems inside your existing stack.",
    summary:
      "Language models embedded into the products and tools you already run: retrieval over your knowledge, semantic search, structured output and model switching.",
    intro:
      "You don't need a new platform to use language models well. We add them where they earn their place, grounded in your own content, returning structured data your code can use, and built so you can change models as the market moves.",
    features: [
      {
        name: "RAG",
        body: "Retrieval-augmented generation over your documents, tickets and data, with citations back to the source and permissions respected.",
      },
      {
        name: "Semantic search",
        body: "Search that understands what people mean, across products, knowledge bases and records, tuned and evaluated on real queries.",
      },
      {
        name: "Prompt systems",
        body: "Versioned prompts, structured outputs, evaluation sets and model routing, treated as code rather than copied between chat windows.",
      },
    ],
    deliverables: [
      "Integration architecture with model-switching built in",
      "Retrieval index and evaluation set",
      "Production endpoints with cost and latency monitoring",
      "Prompt and evaluation repository",
    ],
    useCases: [
      "Answering customer questions from your documentation",
      "Search across contracts, tickets or product catalogues",
      "Extracting structured data from unstructured text",
      "Drafting replies, summaries and reports inside your tools",
    ],
    faqs: [
      {
        q: "Will our data be used to train someone else's model?",
        a: "We configure providers and contracts so your data isn't used for training, and can deploy on private or self-hosted models when required.",
      },
      {
        q: "How do you know the answers are right?",
        a: "Every integration ships with an evaluation set from real questions, scored before launch and re-run on each change.",
      },
    ],
    related: ["custom-ai-agents", "ai-app-development", "data-pipeline-automation"],
    seoTitle: "LLM Integration Services: RAG, Search & Prompt Systems",
    seoDescription:
      "Model-agnostic LLM integration: RAG with citations, semantic search, structured output and versioned prompt systems inside the stack you already run.",
  },
  {
    slug: "ai-app-development",
    name: "AI App Development",
    fact: "Full-stack AI products, from idea to production in 6–12 weeks.",
    summary:
      "Full-stack AI product engineering: agentic back ends, real-time interfaces and production MLOps, delivered as code you own outright.",
    intro:
      "When AI is the product, not a feature, the hard parts are latency, reliability, cost and an interface people trust. We design and build the whole thing, from model layer to the screen, and hand over a product your own team can run.",
    features: [
      {
        name: "Full-stack",
        body: "Back end, front end, data and infrastructure built by one team, so nothing is lost between the model and the interface.",
      },
      {
        name: "Agentic",
        body: "Back ends that plan, call tools and stream progress, with queues, retries and cost controls designed in from day one.",
      },
      {
        name: "Real-time UI",
        body: "Streaming responses, live status and interfaces designed for what AI does well, and honest about what it doesn't.",
      },
    ],
    deliverables: [
      "Product scope and technical architecture",
      "Working POC on real data in 2–4 weeks",
      "Production application with MLOps and monitoring",
      "100% of the source code and infrastructure handed over",
    ],
    useCases: [
      "Customer-facing AI assistants and copilots",
      "Internal tools that turn hours of analysis into minutes",
      "Vertical AI SaaS products",
      "AI features added to an existing product",
    ],
    faqs: [
      {
        q: "How long does a build take?",
        a: "Typically 6–12 weeks from kickoff to production, with a working proof on real data in the first 2–4 weeks.",
      },
      {
        q: "Who owns the code?",
        a: "You do, completely. The repositories, infrastructure and documentation are yours from the first commit.",
      },
    ],
    related: ["llm-integration", "custom-ai-agents", "data-pipeline-automation"],
    seoTitle: "AI App Development Company",
    seoDescription:
      "Full-stack AI app development: agentic back ends, real-time interfaces and production MLOps. Working POC in 2–4 weeks, production in 6–12, 100% code ownership.",
  },
  {
    slug: "process-intelligence",
    name: "Process Intelligence",
    fact: "Every process scored and costed before a line of code.",
    summary:
      "We map how work really flows, score each process for automation potential, and hand you a build-ready roadmap with the return on each step.",
    intro:
      "The most expensive AI project is the one aimed at the wrong process. Process Intelligence starts by watching how work actually moves through your teams and systems, then ranks every candidate by effort, risk and return so you build the right thing first.",
    features: [
      {
        name: "Discovery",
        body: "Interviews, system logs and time studies combined into an honest map of how each workflow runs today, including the workarounds.",
      },
      {
        name: "ROI modelling",
        body: "Hours, error rates and costs per process turned into a return estimate for automating it, with the assumptions written down.",
      },
      {
        name: "Roadmap",
        body: "A sequenced, build-ready plan: what to automate first, what it needs, what it should return and how to measure it.",
      },
    ],
    deliverables: [
      "Process map and automation-potential score per workflow",
      "ROI model with stated assumptions",
      "Prioritised, build-ready roadmap",
      "Technical scope for the first build",
    ],
    useCases: [
      "Deciding where AI should start in a business",
      "Building the business case for an AI budget",
      "Finding the hidden manual work behind a growing team",
      "Re-planning after an AI pilot that stalled",
    ],
    faqs: [
      {
        q: "Do we have to build with you afterwards?",
        a: "No. The roadmap and scope are yours to take to any team. Most clients do continue with us, because the build starts from work already done.",
      },
      {
        q: "How long does it take?",
        a: "Usually two to four weeks, depending on how many teams and systems are in scope.",
      },
    ],
    related: ["ai-workflow-automation", "custom-ai-agents", "data-pipeline-automation"],
    seoTitle: "AI Process Intelligence & Automation Roadmaps",
    seoDescription:
      "Process Intelligence: map your workflows, score each for automation potential and get a build-ready AI roadmap with ROI modelled before any code is written.",
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);

export const INDUSTRIES = [
  {
    name: "Financial services",
    video: "/media/fintech-markets.mp4",
    fact: "KYC packs checked against policy in minutes, with every decision explained for the audit trail.",
    tone: 0,
  },
  {
    name: "Healthcare",
    video: "/media/health-monitor.mp4",
    fact: "Referral and prior-authorisation forms read, coded and routed, with a clinician approving every outcome.",
    tone: 1,
  },
  {
    name: "E-commerce & retail",
    video: "/media/ecommerce-browsing.mp4",
    fact: "Return requests triaged against order history and policy, so only the edge cases reach a person.",
    tone: 2,
  },
  {
    name: "Logistics",
    video: "/media/ecommerce-packing.mp4",
    fact: "Shipment exceptions caught from carrier feeds and resolved before the customer has to ask.",
    tone: 0,
  },
  {
    name: "SaaS & technology",
    video: "/media/tech-coding.mp4",
    fact: "Support tickets answered from your docs and product data, with the hard ones handed over in context.",
    tone: 1,
  },
];

export const STEPS = [
  {
    name: "Map",
    body: "We map your workflows, systems, data and goals.",
    out: "Process map and technical scope",
  },
  {
    name: "Prove",
    body: "A working proof on your real data in 2–4 weeks.",
    out: "Live POC and signed-off acceptance criteria",
  },
  {
    name: "Build",
    body: "Weekly sprints, each ending in a demo you can use.",
    out: "Weekly releases and an integration test suite",
  },
  {
    name: "Hand over",
    body: "Production deployment, monitoring, docs and training.",
    out: "Your system, your code, your runbooks",
  },
];

export const PATHS = [
  {
    title: "Automate the operations you already run",
    body: "Start by measuring where the hours go, then automate the highest-return workflows with agents and orchestration.",
    services: ["process-intelligence", "ai-workflow-automation", "custom-ai-agents"],
  },
  {
    title: "Build a new AI product",
    body: "Take an idea to a production app, with the model layer, the interface and the infrastructure built as one.",
    services: ["ai-app-development", "llm-integration", "custom-ai-agents"],
  },
  {
    title: "Scale your data for AI",
    body: "Get current, trusted data flowing to your warehouse, your dashboards and the models that depend on it.",
    services: ["data-pipeline-automation", "llm-integration", "ai-workflow-automation"],
  },
];

export const INCLUDED = [
  { name: "Full code ownership", body: "Repositories, infrastructure and docs are yours from the first commit." },
  { name: "Working proof in 2–4 weeks", body: "Built on your real data, judged against criteria you sign." },
  { name: "Documented architecture", body: "Every system explained well enough for your team to run it." },
  { name: "Support after launch", body: "Optional maintenance and improvement once you're live." },
];

export const FAQS = [
  {
    q: "Where should we start if we're new to AI?",
    a: "With Process Intelligence. Two to four weeks of mapping tells you which workflows are worth automating, what they'll return and what the first build needs.",
  },
  {
    q: "How quickly will we see something working?",
    a: "A working proof of concept on your real data in 2–4 weeks. Full products typically reach production in 6–12 weeks.",
  },
  {
    q: "Who owns what you build?",
    a: "You do. All source code, infrastructure and documentation are handed over, with no licence fees or lock-in to us.",
  },
  {
    q: "Which AI models do you use?",
    a: "Whichever fits each job on accuracy, cost, latency and privacy. Everything is built model-agnostic, so you can switch providers later without a rebuild.",
  },
  {
    q: "How do you keep our data secure?",
    a: "Systems run in your cloud or on approved infrastructure, with scoped access, encryption, audit logs and providers configured not to train on your data.",
  },
  {
    q: "Will it work with our existing systems?",
    a: "Yes. We integrate with the ERP, CRM, databases and tools you already run, through APIs where they exist and careful automation where they don't.",
  },
  {
    q: "How is a project priced?",
    a: "Scoped per engagement after the first call, which includes a free architecture review. You'll know the cost of the proof before you commit to anything.",
  },
  {
    q: "What happens after launch?",
    a: "Your team gets runbooks and training to run it themselves. If you'd rather not, we offer ongoing maintenance and improvement.",
  },
];
