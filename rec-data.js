// AI Skillset Recommendation data.
// SKILL_LIB: skill name -> [category, description] (defined once, referenced by RECS).
// RECS: persona-task pairs; s: [skill name, importance, proficiency, why].

const SKILL_LIB = {
  // Foundations
  "LLM Fundamentals": ["Foundations", "How large language models work — tokens, context windows, sampling, and failure modes like hallucination."],
  "Python": ["Foundations", "The default language for AI tooling, data work, and gluing model APIs and agents together."],
  "AI Literacy & Verification": ["Foundations", "Knowing when to trust AI output, how to verify it, and where human judgment must stay in the loop."],
  "Statistical Analysis": ["Foundations", "Hypothesis testing, uncertainty, and experimental statistics — the basis for judging any model or result."],
  "Machine Learning Basics": ["Foundations", "Supervised/unsupervised learning, train/test splits, overfitting, and core model families."],
  "SQL & AI-Assisted Analytics": ["Foundations", "Querying data directly and using LLMs to draft, explain, and optimize SQL."],

  // Prompting & Context
  "Prompt Engineering": ["Prompting & Context", "Writing instructions, examples, and constraints that get reliable, high-quality model output."],
  "Context Engineering": ["Prompting & Context", "Curating what enters the context window — instructions, retrieved documents, tools, and memory."],
  "Structured Output": ["Prompting & Context", "Getting reliable JSON or schema-conformant output from models for downstream automation."],

  // Agents & Orchestration
  "Agent Orchestration": ["Agents & Orchestration", "Designing agent loops: planning, tool use, memory, and error recovery across multi-step tasks."],
  "Tool Calling": ["Agents & Orchestration", "Exposing functions and APIs to models so they can act — search, compute, write, execute."],
  "Model Context Protocol (MCP)": ["Agents & Orchestration", "The open standard for connecting agents to data sources and tools in a reusable way."],
  "Multi-Agent Systems": ["Agents & Orchestration", "Coordinating multiple specialized agents — decomposition, hand-offs, verification, and synthesis."],
  "Agentic Coding": ["Agents & Orchestration", "Working with AI coding agents (e.g. Claude Code) — task scoping, review discipline, and repo guardrails like CLAUDE.md."],
  "Human-in-the-Loop Design": ["Agents & Orchestration", "Deciding where humans approve, correct, or override AI — and building those checkpoints into the workflow."],
  "Workflow Automation": ["Agents & Orchestration", "Chaining AI steps with triggers and integrations using tools like n8n, Zapier, or custom pipelines."],
  "Computer Use & Browser Automation": ["Agents & Orchestration", "Agents that operate GUIs and browsers for tasks with no API."],

  // RAG & Knowledge
  "RAG (Retrieval-Augmented Generation)": ["RAG & Knowledge", "Grounding model answers in your own documents — chunking, retrieval, and citation."],
  "Vector Databases": ["RAG & Knowledge", "Storing and querying embeddings at scale (pgvector, Pinecone, Chroma, etc.)."],
  "Embeddings & Semantic Search": ["RAG & Knowledge", "Representing text/images as vectors to find meaning-based matches beyond keywords."],
  "Knowledge Graphs": ["RAG & Knowledge", "Structuring entities and relationships so agents can reason over connected facts."],
  "Document Processing & OCR": ["RAG & Knowledge", "Parsing PDFs, scans, tables, and forms into structured, machine-readable data."],

  // ML Engineering
  "PyTorch": ["ML Engineering", "The dominant deep learning framework for building and training custom models."],
  "Fine-Tuning (LoRA/PEFT)": ["ML Engineering", "Adapting foundation models to a domain or task with parameter-efficient training."],
  "Model Deployment & Serving": ["ML Engineering", "Packaging models behind APIs with acceptable latency, cost, and reliability."],
  "MLOps & Model Monitoring": ["ML Engineering", "Versioning, CI/CD, drift detection, and observability for models in production."],
  "Model Evaluation": ["ML Engineering", "Choosing metrics, building test sets, and measuring real performance beyond accuracy."],
  "Time-Series Forecasting": ["ML Engineering", "Predicting demand, load, or trends with statistical and ML forecasting models."],
  "Anomaly Detection": ["ML Engineering", "Flagging unusual patterns in transactions, sensors, logs, or behavior."],
  "Reinforcement Learning": ["ML Engineering", "Training agents from reward signals — core to robotics and control."],
  "Synthetic Data Generation": ["ML Engineering", "Creating artificial training/test data to cover rare cases or protect privacy."],
  "Recommender Systems": ["ML Engineering", "Ranking and personalization models that match items to users."],

  // Data
  "Dataset Curation": ["Data", "Sourcing, filtering, deduplicating, and balancing data — where most model quality is won."],
  "Data Annotation & Labeling QA": ["Data", "Designing labeling guidelines, measuring inter-annotator agreement, and auditing quality."],
  "Data Visualization": ["Data", "Communicating results with clear, honest charts — increasingly AI-assisted."],
  "AI-Assisted Data Cleaning": ["Data", "Using LLMs to standardize, deduplicate, and repair messy tabular and text data."],

  // Multimodal
  "Computer Vision": ["Multimodal", "Image classification, detection, and segmentation — classical and deep approaches."],
  "Multimodal AI": ["Multimodal", "Vision-language models that reason jointly over images, documents, and text."],
  "Medical Imaging AI": ["Multimodal", "Applying vision models to radiology/pathology data — DICOM handling, augmentation, reader studies."],
  "Speech & Voice AI": ["Multimodal", "Transcription, diarization, and voice agents built on speech models."],
  "Image & Video Generation": ["Multimodal", "Producing and editing visual assets with generative models, with control and consistency."],

  // Evaluation & Safety
  "LLM Evaluation (Evals)": ["Evaluation & Safety", "Building eval sets and LLM-as-judge pipelines to measure and regress AI system quality."],
  "Guardrails": ["Evaluation & Safety", "Input/output filtering, policy enforcement, and constraining what an AI system may do."],
  "Red-Teaming & Adversarial Testing": ["Evaluation & Safety", "Probing AI systems for jailbreaks, unsafe output, and edge-case failures before users find them."],
  "Prompt Injection Defense": ["Evaluation & Safety", "Recognizing and mitigating injected instructions in retrieved or user-supplied content."],
  "Bias & Fairness Auditing": ["Evaluation & Safety", "Measuring disparate performance across groups and mitigating it — essential in hiring, lending, health."],
  "Explainability (XAI)": ["Evaluation & Safety", "Interpreting model decisions (saliency, SHAP, attention) for trust and regulatory needs."],
  "Hallucination Detection & Fact Verification": ["Evaluation & Safety", "Checking AI claims against sources; grounding and citation discipline."],

  // Governance
  "AI Governance & Compliance": ["Governance", "Operating within EU AI Act, NIST AI RMF, and sector rules — risk classification, documentation, audit trails."],
  "Privacy-Preserving AI": ["Governance", "Handling PII/PHI safely — de-identification, data minimization, and privacy-aware model use."],
  "Responsible AI Practice": ["Governance", "Transparency, consent, attribution, and appropriate-use judgment when deploying AI on people."],

  // Research & Science
  "Literature Search & Research Agents": ["Research & Science", "Using AI deep-research tools and APIs (Semantic Scholar, PubMed) to find and synthesize prior work."],
  "Systematic Review Automation": ["Research & Science", "AI-assisted screening, extraction, and PRISMA-compliant synthesis across large corpora."],
  "Hypothesis Generation": ["Research & Science", "Using LLMs and knowledge graphs to propose testable, novel research directions."],
  "Experiment Planning": ["Research & Science", "AI-assisted design of experiments — controls, power analysis, and protocol drafting."],
  "Scientific Data Analysis": ["Research & Science", "Reproducible analysis in Python/R notebooks, accelerated by AI code assistance."],
  "Scientific Writing with AI": ["Research & Science", "Drafting, editing, and formatting papers and grants with AI while preserving integrity and attribution."],

  // Life Sciences
  "Protein Structure Prediction": ["Life Sciences", "AlphaFold-class models for structure prediction and protein design."],
  "Molecular Property Prediction": ["Life Sciences", "ML models predicting ADMET, binding, and activity of candidate molecules."],
  "Generative Chemistry": ["Life Sciences", "Generative models proposing novel molecules under property and synthesizability constraints."],
  "Cheminformatics": ["Life Sciences", "RDKit-style molecular representation, fingerprints, and similarity search."],
  "Bioinformatics Pipelines": ["Life Sciences", "Sequence analysis workflows (NGS, single-cell) — increasingly built and debugged with AI agents."],
  "Clinical NLP": ["Life Sciences", "Extracting structured information from clinical notes, reports, and trial documents."],
  "Clinical Documentation AI": ["Life Sciences", "Ambient scribes and note-drafting tools — supervision, editing, and billing-safe use."],
  "Trial Matching & Recruitment AI": ["Life Sciences", "Matching patients to trial criteria from EHR data with AI extraction."],

  // Domain Applications
  "Legal NLP & Contract Analysis": ["Domain Applications", "AI review of contracts and legal documents — clause extraction, risk flags, redline drafting."],
  "E-Discovery AI": ["Domain Applications", "Technology-assisted review: prioritizing and classifying documents in litigation at scale."],
  "Financial NLP": ["Domain Applications", "Parsing filings, earnings calls, and news into structured signals and summaries."],
  "Quantitative Modeling with ML": ["Domain Applications", "ML for signals, risk, and pricing — with rigorous backtesting and leakage control."],
  "Fraud Detection ML": ["Domain Applications", "Supervised and anomaly-based models for transaction and identity fraud."],
  "Geospatial & Remote Sensing AI": ["Domain Applications", "Analyzing satellite/aerial imagery for land use, emissions, crops, and disaster response."],
  "Climate Modeling with ML": ["Domain Applications", "ML emulators and downscaling that accelerate physical climate models."],
  "Robotics Foundation Models": ["Domain Applications", "Vision-language-action models for manipulation and navigation."],
  "Simulation & Digital Twins": ["Domain Applications", "Virtual environments for training, testing, and optimizing physical systems."],
  "Predictive Maintenance": ["Domain Applications", "Forecasting equipment failure from sensor data before it happens."],
  "Visual Quality Inspection": ["Domain Applications", "Camera-based defect detection on production lines."],
  "AI Tutoring & Adaptive Learning": ["Domain Applications", "Systems that adjust instruction to each learner — pedagogy plus prompting."],
  "Assessment Generation": ["Domain Applications", "Generating and validating quiz/exam items aligned to learning objectives."],
  "Conversational AI Design": ["Domain Applications", "Designing chat/voice assistants — flows, tone, escalation, and failure handling."],
  "Sentiment & Intent Analysis": ["Domain Applications", "Classifying emotion, intent, and topics in feedback, tickets, and calls."],
  "AI Writing & Editing": ["Domain Applications", "Drafting and revising prose with AI while keeping voice, accuracy, and ownership."],
  "Content Generation & Brand Voice": ["Domain Applications", "Producing on-brand marketing content at scale with style guides and review loops."],
  "SEO & Content Optimization": ["Domain Applications", "Optimizing for search — including how AI answer engines cite and surface content."],
  "Personalization & Segmentation": ["Domain Applications", "Using ML and LLMs to tailor messaging and experiences per audience segment."],
  "Generative Design": ["Domain Applications", "AI-driven exploration of design spaces in engineering and creative work."],
  "Design-to-Code AI": ["Domain Applications", "Turning mockups and prompts into working UI code; supervising the result."],
  "UX Research with AI": ["Domain Applications", "AI-assisted synthesis of interviews, surveys, and usability data into insights."],
  "Threat Intelligence AI": ["Domain Applications", "LLM-assisted enrichment and correlation of indicators, actors, and campaigns."],
  "Security Copilots & SOC Automation": ["Domain Applications", "AI triage of alerts, log summarization, and playbook automation in the SOC."],
  "Deepfake & Synthetic Media Detection": ["Domain Applications", "Detecting AI-generated images, audio, and video; provenance standards like C2PA."],
  "Fact-Checking & Verification AI": ["Domain Applications", "Source-tracing claims and verifying content with AI assistance."],
  "Data Journalism": ["Domain Applications", "Finding and telling stories in datasets — scraping, analysis, and visualization with AI help."],
  "Talent Analytics": ["Domain Applications", "People data analysis for retention, skills gaps, and workforce planning."],
  "Sales Intelligence AI": ["Domain Applications", "AI research on accounts and contacts, signal detection, and outreach drafting."],
  "Supply Chain Optimization AI": ["Domain Applications", "Forecasting, routing, and inventory optimization with ML and agents."],
  "Grant & Proposal Writing with AI": ["Domain Applications", "Structuring, drafting, and compliance-checking proposals against funder requirements."],

  // --- Expansion: methods & emerging competencies ---
  "Causal Inference": ["Foundations", "Estimating cause-and-effect from data — the difference between correlation and a decision you can act on."],
  "A/B Testing & Experimentation": ["Data", "Designing and reading controlled experiments so AI-driven changes are proven, not assumed."],
  "Optimization & Operations Research": ["ML Engineering", "Linear/constraint optimization and scheduling — often paired with ML forecasts to make decisions."],
  "Process Mining": ["Domain Applications", "Reconstructing real process flows from event logs to find bottlenecks and automation targets."],
  "Sensor Fusion": ["Domain Applications", "Combining camera, lidar, radar, and IMU streams into one coherent perception of the world."],
  "Data Governance": ["Governance", "Lineage, access control, and quality contracts for the data feeding models and RAG systems."],
  "Model Cards & Documentation": ["Governance", "Standardized disclosure of a model's intended use, limits, and evaluation — increasingly required by regulation."],
  "AI Cost & Latency Optimization": ["ML Engineering", "Model routing, caching, batching, and prompt trimming to keep AI systems fast and affordable at scale."],
  "Accessibility AI": ["Domain Applications", "Using AI to meet WCAG — alt text, captions, and inclusive interfaces — and auditing AI output for exclusion."],
  "AI Test Generation": ["Agents & Orchestration", "Generating unit, integration, and property tests with AI, then reviewing them for real coverage."],
  "Materials Informatics": ["Life Sciences", "ML over materials data to predict properties and propose novel compounds and alloys."],
  "Genomics AI": ["Life Sciences", "Variant calling, interpretation, and functional prediction with deep learning on sequence data."],
  "Generative Biology": ["Life Sciences", "Sequence- and structure-design models that propose novel proteins, enzymes, and genetic constructs."],
  "Regulatory Intelligence AI": ["Domain Applications", "Tracking and mapping evolving regulations to obligations, and drafting submission documents."],
  "Patent Analysis AI": ["Domain Applications", "Prior-art search, claim analysis, and drafting support across patent corpora."],
  "Audit Analytics AI": ["Domain Applications", "Full-population testing, anomaly flagging, and evidence extraction for assurance work."],
  "Carbon Accounting AI": ["Domain Applications", "Extracting emissions data from documents and estimating footprints across scopes for ESG reporting."],
  "Skills Taxonomy & Ontology": ["Domain Applications", "Structuring roles, skills, and learning content so AI can match people to gaps and paths."],
  "Knowledge Management AI": ["Domain Applications", "Turning scattered organizational knowledge into a governed, searchable, AI-accessible corpus."]
};

// p: persona, d: domain, t: task/workflow, s: [skill, importance, proficiency, why]
const RECS = [
  // ---------- Healthcare ----------
  { p: "Radiologist", d: "Healthcare", t: "Building an AI model for DSA vs. non-DSA image classification", s: [
    ["Computer Vision", "High", "Advanced", "Classification architectures, transfer learning, and augmentation are the core of the task."],
    ["Medical Imaging AI", "High", "Advanced", "DICOM handling, class imbalance, and reader-study validation are imaging-specific requirements."],
    ["Dataset Curation", "High", "Intermediate", "Model quality is decided by how studies are selected, de-duplicated, and split by patient."],
    ["Data Annotation & Labeling QA", "High", "Intermediate", "Ground-truth labels need clear criteria and inter-reader agreement checks."],
    ["PyTorch", "Medium", "Intermediate", "The practical framework for training and iterating on the classifier."],
    ["Model Evaluation", "High", "Advanced", "AUROC, sensitivity/specificity trade-offs, and external validation determine clinical credibility."],
    ["Privacy-Preserving AI", "High", "Intermediate", "PHI in imaging metadata must be de-identified before any model work."],
    ["Explainability (XAI)", "Medium", "Beginner", "Saliency maps help verify the model attends to vasculature, not artifacts."]
  ]},
  { p: "Radiologist", d: "Healthcare", t: "AI-assisted report drafting and worklist triage", s: [
    ["Clinical Documentation AI", "High", "Intermediate", "Draft-report tools need supervised editing habits and error-pattern awareness."],
    ["Multimodal AI", "High", "Intermediate", "Vision-language models increasingly pre-draft findings from images."],
    ["Prompt Engineering", "Medium", "Intermediate", "Report templates and style constraints come from well-designed prompts."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "Radiologist sign-off points must be explicit; triage reordering needs override paths."],
    ["Hallucination Detection & Fact Verification", "High", "Intermediate", "Every AI-drafted finding must be verified against the image before signing."],
    ["AI Governance & Compliance", "Medium", "Beginner", "Triage AI is regulated medical-device territory; know what your tools are cleared for."]
  ]},
  { p: "Medical Resident", d: "Healthcare", t: "Learning procedural case log annotation", s: [
    ["Data Annotation & Labeling QA", "High", "Intermediate", "Consistent, guideline-driven labeling is the skill being learned."],
    ["Clinical NLP", "Medium", "Beginner", "Understanding how models extract procedures from notes improves annotation choices."],
    ["Prompt Engineering", "High", "Intermediate", "AI-assisted pre-labeling works only with precise extraction prompts."],
    ["AI Literacy & Verification", "High", "Intermediate", "Pre-labels must be treated as suggestions to verify, not answers."],
    ["Structured Output", "Medium", "Beginner", "Case logs are structured records; schema-constrained extraction keeps them clean."],
    ["Privacy-Preserving AI", "High", "Beginner", "Case data is PHI; know what may enter which AI tool."]
  ]},
  { p: "Medical Resident", d: "Healthcare", t: "AI-assisted literature review for journal club", s: [
    ["Literature Search & Research Agents", "High", "Intermediate", "Deep-research tools surface and summarize relevant trials quickly."],
    ["Hallucination Detection & Fact Verification", "High", "Intermediate", "Citations and effect sizes must be checked against the actual papers."],
    ["Prompt Engineering", "Medium", "Beginner", "Good appraisal questions (PICO framing) get better AI synthesis."],
    ["Statistical Analysis", "Medium", "Intermediate", "Judging a trial still requires reading its statistics yourself."],
    ["Scientific Writing with AI", "Low", "Beginner", "AI can structure the presentation; the critical appraisal stays yours."]
  ]},
  { p: "Physician (Primary Care)", d: "Healthcare", t: "Adopting ambient clinical documentation", s: [
    ["Clinical Documentation AI", "High", "Intermediate", "Ambient scribes change the visit workflow; editing and sign-off discipline is the core skill."],
    ["Speech & Voice AI", "Medium", "Beginner", "Knowing transcription failure modes (accents, cross-talk, negations) prevents chart errors."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "The physician remains the author; review checkpoints must be non-negotiable."],
    ["Privacy-Preserving AI", "High", "Intermediate", "Consent, recording policy, and BAA-covered tools are prerequisites."],
    ["AI Literacy & Verification", "High", "Intermediate", "Plausible-but-wrong summaries are the main risk; verify medications and negatives."]
  ]},
  { p: "Physician (Primary Care)", d: "Healthcare", t: "Using AI clinical decision support safely", s: [
    ["AI Literacy & Verification", "High", "Advanced", "Knowing when model suggestions are reliable vs. out-of-distribution is the central competency."],
    ["Clinical NLP", "Medium", "Beginner", "Understanding what the system extracted from the chart explains its suggestions."],
    ["Explainability (XAI)", "Medium", "Intermediate", "Demand and interpret the evidence behind a recommendation before acting."],
    ["Bias & Fairness Auditing", "Medium", "Beginner", "Decision-support tools can underperform for underrepresented patient groups."],
    ["AI Governance & Compliance", "Medium", "Beginner", "Know the tool's cleared indications and your liability boundaries."]
  ]},

  // ---------- Academia / Research ----------
  { p: "Academic Researcher", d: "Academia", t: "Conducting novel drug discovery research", s: [
    ["Literature Search & Research Agents", "High", "Advanced", "Mapping prior art across papers, patents, and databases is the first mile of discovery."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Grounding AI answers in your corpus of papers and internal data prevents fabricated leads."],
    ["Hypothesis Generation", "High", "Intermediate", "LLMs over knowledge graphs propose target-disease links worth testing."],
    ["Agent Orchestration", "Medium", "Intermediate", "Multi-step research agents chain search, extraction, and analysis autonomously."],
    ["Python", "High", "Intermediate", "The lingua franca for cheminformatics, data analysis, and model APIs."],
    ["Scientific Data Analysis", "High", "Advanced", "Assay and screening data still need rigorous, reproducible analysis."],
    ["Experiment Planning", "Medium", "Intermediate", "AI-assisted DOE narrows thousands of candidate conditions to a testable set."],
    ["Molecular Property Prediction", "Medium", "Intermediate", "ADMET and activity predictions triage which molecules deserve bench time."]
  ]},
  { p: "Academic Researcher", d: "Academia", t: "Writing a competitive grant proposal", s: [
    ["Grant & Proposal Writing with AI", "High", "Intermediate", "AI drafts aims, significance, and boilerplate against funder templates fast."],
    ["Literature Search & Research Agents", "High", "Intermediate", "The significance section depends on a complete, current view of the field."],
    ["Scientific Writing with AI", "High", "Intermediate", "Iterative AI editing tightens prose while you keep intellectual ownership."],
    ["Hallucination Detection & Fact Verification", "High", "Intermediate", "Every AI-suggested citation must exist and say what it claims."],
    ["Responsible AI Practice", "Medium", "Beginner", "Funders increasingly require disclosure of AI use in proposals."]
  ]},
  { p: "Academic Researcher", d: "Academia", t: "Running a systematic literature review", s: [
    ["Systematic Review Automation", "High", "Advanced", "AI screening and extraction cut months off PRISMA-style reviews."],
    ["Literature Search & Research Agents", "High", "Advanced", "Comprehensive, multi-database search strategy is the foundation of validity."],
    ["Embeddings & Semantic Search", "Medium", "Intermediate", "Semantic similarity catches relevant papers keyword queries miss."],
    ["Structured Output", "Medium", "Intermediate", "Extraction into consistent schemas makes synthesis and meta-analysis possible."],
    ["Data Annotation & Labeling QA", "Medium", "Intermediate", "Dual-screening with agreement stats still applies when one screener is an AI."],
    ["Statistical Analysis", "Medium", "Advanced", "Meta-analysis and heterogeneity assessment remain human-led."]
  ]},
  { p: "PhD Student", d: "Academia", t: "Managing and synthesizing thesis literature", s: [
    ["Literature Search & Research Agents", "High", "Intermediate", "Staying current across hundreds of papers is only feasible with AI triage."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "A personal RAG over your PDF library answers questions with citations you can check."],
    ["Vector Databases", "Medium", "Beginner", "The storage layer behind a searchable personal corpus."],
    ["Scientific Writing with AI", "Medium", "Intermediate", "AI editing accelerates chapters; committee-ready arguments stay yours."],
    ["Hallucination Detection & Fact Verification", "High", "Intermediate", "A fabricated citation in a thesis is catastrophic; verify everything."]
  ]},
  { p: "PhD Student", d: "Academia", t: "Building research prototypes with AI coding agents", s: [
    ["Agentic Coding", "High", "Intermediate", "Coding agents build experiment harnesses and baselines in hours, not weeks."],
    ["Python", "High", "Intermediate", "You must read and verify what the agent writes."],
    ["Prompt Engineering", "Medium", "Intermediate", "Precise task specs and constraints determine agent output quality."],
    ["LLM Evaluation (Evals)", "Medium", "Intermediate", "If the prototype is an AI system, an eval set is your experiment's instrument."],
    ["Scientific Data Analysis", "High", "Intermediate", "Results processing and plots must be reproducible end to end."]
  ]},
  { p: "Research Scientist (Wet Lab)", d: "Scientific Research", t: "Designing experiments and automating lab records", s: [
    ["Experiment Planning", "High", "Intermediate", "AI-assisted DOE and protocol drafting reduce wasted runs."],
    ["Document Processing & OCR", "Medium", "Beginner", "Digitizing notebooks and instrument printouts makes records searchable."],
    ["Structured Output", "Medium", "Intermediate", "Protocols and results captured as structured data feed later analysis."],
    ["Literature Search & Research Agents", "High", "Intermediate", "Methods sections and prior protocols are minable with research agents."],
    ["Workflow Automation", "Medium", "Beginner", "Instrument-to-notebook data flows can be automated without code."]
  ]},
  { p: "Research Scientist (Wet Lab)", d: "Scientific Research", t: "Building a reproducible data analysis pipeline", s: [
    ["Scientific Data Analysis", "High", "Advanced", "The core work: rigorous, versioned analysis of experimental data."],
    ["Python", "High", "Intermediate", "Notebooks plus scripts are the standard reproducibility substrate."],
    ["Agentic Coding", "Medium", "Intermediate", "AI agents write and refactor analysis code under your review."],
    ["Statistical Analysis", "High", "Advanced", "Power, multiple comparisons, and effect sizes are non-delegable."],
    ["Data Visualization", "Medium", "Intermediate", "Publication-quality figures, drafted faster with AI assistance."]
  ]},

  // ---------- Software Engineering ----------
  { p: "Software Engineer", d: "Software Engineering", t: "Developing an AI coding assistant", s: [
    ["LLM Fundamentals", "High", "Advanced", "Context limits, sampling, and failure modes drive every design decision."],
    ["Tool Calling", "High", "Advanced", "File edits, search, and execution are tools the model must call reliably."],
    ["Prompt Engineering", "High", "Advanced", "System prompts define the assistant's behavior, tone, and guardrails."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Repo-aware answers require code retrieval and context assembly."],
    ["Vector Databases", "Medium", "Intermediate", "Code embedding indexes power semantic code search."],
    ["Agent Orchestration", "High", "Advanced", "Multi-step edit-test-fix loops are agentic by nature."],
    ["LLM Evaluation (Evals)", "High", "Intermediate", "A regression eval suite (e.g. SWE-bench-style) is the only way to ship changes safely."],
    ["Model Context Protocol (MCP)", "Medium", "Intermediate", "MCP is the emerging standard for connecting assistants to dev tools."]
  ]},
  { p: "Software Engineer", d: "Software Engineering", t: "AI-assisted feature development and code review", s: [
    ["Agentic Coding", "High", "Advanced", "Delegating well-scoped tasks to coding agents is becoming the core productivity skill."],
    ["Prompt Engineering", "High", "Intermediate", "Task specs, constraints, and repo conventions in prompts shape agent output."],
    ["Context Engineering", "Medium", "Intermediate", "CLAUDE.md/AGENTS.md files and context curation govern agent behavior on the repo."],
    ["AI Literacy & Verification", "High", "Advanced", "Reviewing AI code for subtle bugs is now a first-class review skill."],
    ["LLM Evaluation (Evals)", "Low", "Beginner", "Even simple checks catch agent regressions in CI."]
  ]},
  { p: "DevOps / Platform Engineer", d: "Software Engineering", t: "Incident response copilots and AIOps", s: [
    ["Security Copilots & SOC Automation", "Medium", "Intermediate", "The same triage patterns apply to ops alerts and logs."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Runbook- and postmortem-grounded answers during incidents."],
    ["Anomaly Detection", "High", "Intermediate", "Detecting abnormal metrics/log patterns before pages fire."],
    ["Tool Calling", "Medium", "Intermediate", "Copilots that query dashboards and run diagnostics need safe tool access."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "Remediation actions need approval gates; auto-heal only what's reversible."],
    ["Workflow Automation", "Medium", "Intermediate", "Alert enrichment and ticket hygiene are automatable today."]
  ]},
  { p: "DevOps / Platform Engineer", d: "Software Engineering", t: "Infrastructure-as-code with AI agents", s: [
    ["Agentic Coding", "High", "Intermediate", "Agents draft Terraform/K8s manifests well; review discipline is essential."],
    ["Prompt Engineering", "Medium", "Intermediate", "Constraints (regions, naming, cost limits) belong in the prompt, not cleanup."],
    ["Guardrails", "High", "Intermediate", "Policy-as-code checks must gate anything an agent can apply."],
    ["AI Literacy & Verification", "High", "Advanced", "A hallucinated resource setting can take down production; verify plans line by line."]
  ]},

  // ---------- Data Science ----------
  { p: "Data Scientist", d: "Data Science", t: "Building an LLM-powered analytics assistant", s: [
    ["SQL & AI-Assisted Analytics", "High", "Advanced", "Text-to-SQL with schema grounding is the assistant's backbone."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Metric definitions and docs must ground answers to prevent invented numbers."],
    ["Structured Output", "High", "Intermediate", "Charts and query plans require schema-conformant model output."],
    ["LLM Evaluation (Evals)", "High", "Intermediate", "A question-answer eval set catches silent SQL errors."],
    ["Prompt Engineering", "Medium", "Intermediate", "Few-shot examples of your schema idioms lift accuracy sharply."],
    ["Human-in-the-Loop Design", "Medium", "Beginner", "Analysts must be able to inspect and correct generated queries."]
  ]},
  { p: "Data Scientist", d: "Data Science", t: "Classical ML model development, accelerated by AI", s: [
    ["Machine Learning Basics", "High", "Advanced", "Feature engineering, validation, and model selection remain the craft."],
    ["Agentic Coding", "High", "Intermediate", "Agents write boilerplate, tests, and experiment code under review."],
    ["Statistical Analysis", "High", "Advanced", "Leakage, drift, and significance judgments are not delegable."],
    ["Model Evaluation", "High", "Advanced", "Metric choice and error analysis decide whether the model ships."],
    ["AI-Assisted Data Cleaning", "Medium", "Intermediate", "LLMs standardize messy categoricals and free text quickly."],
    ["MLOps & Model Monitoring", "Medium", "Intermediate", "Models decay; monitoring is part of development, not an afterthought."]
  ]},
  { p: "ML Engineer", d: "Data Science", t: "Deploying and monitoring LLM applications in production", s: [
    ["Model Deployment & Serving", "High", "Advanced", "Latency, cost, caching, and fallback routing define production readiness."],
    ["MLOps & Model Monitoring", "High", "Advanced", "Token cost, drift, and quality dashboards catch silent degradation."],
    ["LLM Evaluation (Evals)", "High", "Advanced", "Eval gates in CI prevent prompt or model updates from regressing quality."],
    ["Guardrails", "High", "Intermediate", "Output filtering and policy enforcement protect users and the business."],
    ["Prompt Injection Defense", "High", "Intermediate", "Any app that ingests untrusted content needs injection mitigations."],
    ["Context Engineering", "Medium", "Intermediate", "Context assembly is a production system component with budgets and priorities."]
  ]},
  { p: "ML Engineer", d: "Data Science", t: "Fine-tuning a domain-specific model", s: [
    ["Fine-Tuning (LoRA/PEFT)", "High", "Advanced", "The core technique: adapting a foundation model efficiently."],
    ["Dataset Curation", "High", "Advanced", "Fine-tune quality is dominated by training-data quality and coverage."],
    ["PyTorch", "High", "Intermediate", "The practical substrate for training runs and debugging."],
    ["LLM Evaluation (Evals)", "High", "Advanced", "Held-out evals prove the fine-tune beats prompting the base model."],
    ["Synthetic Data Generation", "Medium", "Intermediate", "Model-generated examples fill coverage gaps cheaply — with QA."],
    ["Model Deployment & Serving", "Medium", "Intermediate", "Adapters change serving topology and cost."]
  ]},
  { p: "Data Analyst", d: "Data Science", t: "Natural-language BI and automated reporting", s: [
    ["SQL & AI-Assisted Analytics", "High", "Advanced", "AI drafts queries; you verify semantics against the warehouse."],
    ["Data Visualization", "High", "Intermediate", "Clear charts remain the deliverable; AI speeds the drafting."],
    ["Prompt Engineering", "Medium", "Intermediate", "Reusable report prompts with metric definitions keep outputs consistent."],
    ["AI-Assisted Data Cleaning", "Medium", "Intermediate", "Free-text fields and inconsistent categories yield to LLM normalization."],
    ["AI Literacy & Verification", "High", "Intermediate", "A plausible wrong number in a report is worse than no report."],
    ["Workflow Automation", "Medium", "Beginner", "Scheduled AI reporting pipelines remove repetitive manual runs."]
  ]},

  // ---------- Law ----------
  { p: "Corporate Lawyer", d: "Law", t: "Contract review and drafting with AI", s: [
    ["Legal NLP & Contract Analysis", "High", "Advanced", "Clause extraction, risk flagging, and redline drafting are the daily workflow."],
    ["Prompt Engineering", "High", "Intermediate", "Playbook-driven prompts encode your firm's negotiation positions."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Grounding drafts in precedent clauses and templates prevents invented terms."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "Fabricated citations have sanctioned real lawyers; verification is non-negotiable."],
    ["Privacy-Preserving AI", "High", "Intermediate", "Client confidentiality dictates which tools may see which documents."],
    ["Human-in-the-Loop Design", "Medium", "Intermediate", "AI proposes; the attorney of record disposes."]
  ]},
  { p: "Corporate Lawyer", d: "Law", t: "Legal research and memo drafting", s: [
    ["Literature Search & Research Agents", "High", "Intermediate", "AI research tools surface controlling authority across jurisdictions fast."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "Every case cite must be pulled and read; AI summaries are leads, not law."],
    ["AI Writing & Editing", "Medium", "Intermediate", "Memo structure and first drafts accelerate with AI; analysis stays yours."],
    ["Legal NLP & Contract Analysis", "Medium", "Intermediate", "Statutory and case-text extraction structures the research record."]
  ]},
  { p: "Paralegal", d: "Law", t: "E-discovery document review", s: [
    ["E-Discovery AI", "High", "Advanced", "Technology-assisted review prioritizes millions of documents defensibly."],
    ["Document Processing & OCR", "High", "Intermediate", "Scans, emails, and attachments must become searchable text first."],
    ["Embeddings & Semantic Search", "Medium", "Intermediate", "Concept search finds responsive documents keyword terms miss."],
    ["Data Annotation & Labeling QA", "High", "Intermediate", "Seed-set coding quality drives the whole predictive ranking."],
    ["AI Literacy & Verification", "High", "Intermediate", "Defensibility requires understanding what the model did and documenting it."]
  ]},
  { p: "Paralegal", d: "Law", t: "Case file summarization and citation checking", s: [
    ["Document Processing & OCR", "High", "Intermediate", "Filings and exhibits arrive as messy PDFs; structure comes first."],
    ["AI Writing & Editing", "Medium", "Intermediate", "Chronologies and summaries draft quickly under attorney review."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "Cite-checking is precisely the skill of catching AI (and human) errors."],
    ["Structured Output", "Medium", "Beginner", "Extraction into timelines and party tables keeps case files navigable."]
  ]},

  // ---------- Finance ----------
  { p: "Financial Analyst", d: "Finance", t: "Earnings analysis and report automation", s: [
    ["Financial NLP", "High", "Advanced", "Parsing filings, transcripts, and news into signals is the core workflow."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Q&A over filings must cite the actual 10-K language."],
    ["SQL & AI-Assisted Analytics", "Medium", "Intermediate", "Fundamentals databases still answer the quantitative half."],
    ["Structured Output", "Medium", "Intermediate", "Extracted metrics feed models only if they arrive schema-clean."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "A fabricated number in an investment memo is a career risk."],
    ["Data Visualization", "Medium", "Intermediate", "Charts carry the thesis; AI accelerates drafting them."]
  ]},
  { p: "Quantitative Researcher", d: "Finance", t: "ML-driven signal research and backtesting", s: [
    ["Quantitative Modeling with ML", "High", "Advanced", "Feature engineering and leakage control decide whether a signal is real."],
    ["Statistical Analysis", "High", "Advanced", "Multiple-testing discipline separates alpha from noise."],
    ["Python", "High", "Advanced", "The research stack is Python end to end."],
    ["Agentic Coding", "Medium", "Intermediate", "Agents accelerate backtest infrastructure; results verification stays manual."],
    ["Financial NLP", "Medium", "Intermediate", "Text-derived features (sentiment, events) are standard alternative data."],
    ["Time-Series Forecasting", "Medium", "Advanced", "Regime awareness and horizon effects are domain fundamentals."]
  ]},
  { p: "Compliance Officer", d: "Finance", t: "AML transaction monitoring and regulatory tracking", s: [
    ["Anomaly Detection", "High", "Intermediate", "Modern AML rests on anomaly and network models, not just rules."],
    ["Fraud Detection ML", "High", "Intermediate", "Understanding model outputs and false-positive economics drives triage."],
    ["Explainability (XAI)", "High", "Intermediate", "Regulators require explainable alerts; SAR narratives need model rationale."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Regulation-grounded Q&A keeps policies mapped to current rules."],
    ["AI Governance & Compliance", "High", "Advanced", "Model risk management (SR 11-7 style) is itself a compliance obligation."],
    ["Workflow Automation", "Medium", "Beginner", "Regulatory change feeds can auto-route to policy owners."]
  ]},

  // ---------- Education ----------
  { p: "K-12 Teacher", d: "Education", t: "Lesson planning and differentiated materials", s: [
    ["Prompt Engineering", "High", "Intermediate", "Grade level, standards, and reading level belong in every prompt."],
    ["AI Writing & Editing", "High", "Intermediate", "Worksheets, exemplars, and scaffolds draft in minutes."],
    ["AI Tutoring & Adaptive Learning", "Medium", "Beginner", "Knowing how tutoring systems adapt helps you assign them well."],
    ["AI Literacy & Verification", "High", "Intermediate", "Generated content needs accuracy and age-appropriateness review."],
    ["Responsible AI Practice", "High", "Beginner", "Student data and AI-use policies constrain which tools are allowed."]
  ]},
  { p: "K-12 Teacher", d: "Education", t: "AI-assisted grading and feedback", s: [
    ["Prompt Engineering", "High", "Intermediate", "Rubric-driven prompts produce consistent, criterion-referenced feedback."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "Grades stay teacher-owned; AI drafts feedback, never final marks."],
    ["Bias & Fairness Auditing", "Medium", "Beginner", "AI feedback can systematically favor certain writing styles; spot-check."],
    ["Assessment Generation", "Medium", "Intermediate", "Question variants and practice sets generate on demand."]
  ]},
  { p: "Instructional Designer", d: "Education", t: "Building adaptive courseware", s: [
    ["AI Tutoring & Adaptive Learning", "High", "Advanced", "Learner-model-driven sequencing is the product being built."],
    ["Conversational AI Design", "High", "Intermediate", "Tutor personas need flows, tone, and graceful failure handling."],
    ["Prompt Engineering", "High", "Advanced", "Pedagogical prompting (Socratic moves, hint ladders) is a distinct craft."],
    ["LLM Evaluation (Evals)", "Medium", "Intermediate", "Tutor quality needs eval sets of learner scenarios, not vibes."],
    ["Assessment Generation", "High", "Intermediate", "Item banks with validated difficulty power the adaptivity."],
    ["Human-in-the-Loop Design", "Medium", "Intermediate", "Instructor dashboards and overrides keep the human educator in control."]
  ]},

  // ---------- Marketing ----------
  { p: "Marketing Manager", d: "Marketing", t: "Running an AI-assisted campaign content pipeline", s: [
    ["Content Generation & Brand Voice", "High", "Advanced", "Style guides plus review loops keep scaled content on-brand."],
    ["Prompt Engineering", "High", "Intermediate", "Reusable prompt templates encode voice, audience, and format."],
    ["Workflow Automation", "High", "Intermediate", "Brief-to-draft-to-review pipelines run on automation platforms."],
    ["Image & Video Generation", "Medium", "Intermediate", "Creative variants generate quickly; brand consistency needs control."],
    ["Personalization & Segmentation", "Medium", "Intermediate", "Per-segment message variants are now cheap to produce and test."],
    ["Responsible AI Practice", "Medium", "Beginner", "Disclosure norms and IP provenance for generated assets matter."]
  ]},
  { p: "Content Strategist", d: "Marketing", t: "SEO content at scale with brand voice", s: [
    ["SEO & Content Optimization", "High", "Advanced", "AI answer engines change how content gets cited and surfaced."],
    ["Content Generation & Brand Voice", "High", "Advanced", "Differentiated voice is the moat when everyone can generate text."],
    ["AI Writing & Editing", "High", "Intermediate", "Human-edited AI drafts are the standard production model."],
    ["Embeddings & Semantic Search", "Medium", "Beginner", "Topical clustering and content gaps reveal themselves in embedding space."],
    ["Workflow Automation", "Medium", "Intermediate", "Brief generation and publishing steps chain without engineers."]
  ]},

  // ---------- Manufacturing ----------
  { p: "Manufacturing Engineer", d: "Manufacturing", t: "Deploying visual defect inspection", s: [
    ["Visual Quality Inspection", "High", "Advanced", "Camera placement, lighting, and defect taxonomies make or break accuracy."],
    ["Computer Vision", "High", "Intermediate", "Detection/segmentation fundamentals underpin the inspection models."],
    ["Dataset Curation", "High", "Intermediate", "Rare defects demand deliberate collection and augmentation."],
    ["Synthetic Data Generation", "Medium", "Intermediate", "Simulated defects cover cases the line hasn't produced yet."],
    ["Model Evaluation", "High", "Intermediate", "Escape rate vs. false-reject rate is a business decision, measured precisely."],
    ["MLOps & Model Monitoring", "Medium", "Intermediate", "Product and lighting changes silently degrade deployed models."]
  ]},
  { p: "Manufacturing Engineer", d: "Manufacturing", t: "Predictive maintenance program", s: [
    ["Predictive Maintenance", "High", "Advanced", "Failure-mode-aware modeling of sensor data is the core discipline."],
    ["Time-Series Forecasting", "High", "Intermediate", "Remaining-useful-life estimates are forecasting problems."],
    ["Anomaly Detection", "High", "Intermediate", "Unlabeled failures start as anomalies in vibration and temperature."],
    ["Data Visualization", "Medium", "Beginner", "Maintenance teams act on dashboards, not model files."],
    ["Statistical Analysis", "Medium", "Intermediate", "Distinguishing degradation from noise requires statistical care."]
  ]},
  { p: "Quality Engineer", d: "Manufacturing", t: "AI-assisted root-cause analysis and SOP intelligence", s: [
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Answers grounded in SOPs, specs, and past NCRs beat tribal memory."],
    ["Document Processing & OCR", "High", "Intermediate", "Decades of quality records live in scanned PDFs."],
    ["Statistical Analysis", "High", "Advanced", "SPC and DOE remain the analytical backbone of root cause."],
    ["Prompt Engineering", "Medium", "Intermediate", "Structured 5-why and fishbone prompts make AI a disciplined partner."],
    ["Knowledge Graphs", "Low", "Beginner", "Linking failures, parts, and suppliers pays off as the corpus grows."]
  ]},

  // ---------- Government ----------
  { p: "Policy Analyst", d: "Government", t: "Legislative analysis and briefing generation", s: [
    ["Document Processing & OCR", "High", "Intermediate", "Bills, amendments, and reports must become analyzable text."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Briefings must cite the actual statutory language."],
    ["AI Writing & Editing", "High", "Intermediate", "Brief structure and plain-language summaries draft rapidly."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "A wrong claim in a ministerial briefing has real consequences."],
    ["Literature Search & Research Agents", "Medium", "Intermediate", "Comparative policy evidence gathers faster with research agents."]
  ]},
  { p: "Policy Analyst", d: "Government", t: "Analyzing public comments at scale", s: [
    ["Sentiment & Intent Analysis", "High", "Intermediate", "Position and theme classification across thousands of submissions."],
    ["Embeddings & Semantic Search", "High", "Intermediate", "Clustering surfaces the distinct arguments, not just keywords."],
    ["Structured Output", "Medium", "Intermediate", "Comment coding into consistent categories enables defensible tallies."],
    ["Data Visualization", "Medium", "Beginner", "Stakeholder maps and theme charts communicate the analysis."],
    ["Bias & Fairness Auditing", "Medium", "Beginner", "Form-letter campaigns and bot comments must not drown out individuals."]
  ]},

  // ---------- Journalism ----------
  { p: "Investigative Journalist", d: "Journalism", t: "Analyzing large document leaks", s: [
    ["Document Processing & OCR", "High", "Advanced", "Leaks arrive as mixed scans, emails, and spreadsheets."],
    ["Embeddings & Semantic Search", "High", "Intermediate", "Semantic search finds the story threads keyword search misses."],
    ["Knowledge Graphs", "Medium", "Intermediate", "Entity-relationship mapping exposes networks of people and money."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Question the corpus with citations back to source documents."],
    ["Data Journalism", "High", "Intermediate", "Turning findings into verifiable, publishable analysis."],
    ["Privacy-Preserving AI", "High", "Intermediate", "Source protection dictates local/air-gapped tooling choices."]
  ]},
  { p: "Investigative Journalist", d: "Journalism", t: "Verifying synthetic media and AI-generated claims", s: [
    ["Deepfake & Synthetic Media Detection", "High", "Advanced", "Detection tools, provenance standards (C2PA), and forensic tells."],
    ["Fact-Checking & Verification AI", "High", "Advanced", "AI-assisted claim tracing at the speed misinformation spreads."],
    ["Multimodal AI", "Medium", "Intermediate", "Understanding how generators work reveals what artifacts to look for."],
    ["AI Literacy & Verification", "High", "Advanced", "Verification judgment is the professional core; tools only assist."]
  ]},

  // ---------- Design ----------
  { p: "UX Designer", d: "Design", t: "AI-assisted research synthesis and prototyping", s: [
    ["UX Research with AI", "High", "Intermediate", "Interview and survey synthesis compresses from weeks to days."],
    ["Design-to-Code AI", "High", "Intermediate", "Prompt-to-prototype tools make testable artifacts without engineers."],
    ["Prompt Engineering", "High", "Intermediate", "Design intent must be specified precisely to get usable output."],
    ["Conversational AI Design", "Medium", "Intermediate", "More products are conversations; designing them is a UX skill now."],
    ["AI Literacy & Verification", "Medium", "Intermediate", "AI-synthesized insights need tracing back to real participant data."]
  ]},
  { p: "Graphic Designer", d: "Design", t: "Generative image workflows with brand consistency", s: [
    ["Image & Video Generation", "High", "Advanced", "Control techniques (reference, style, inpainting) turn generators into tools."],
    ["Prompt Engineering", "High", "Intermediate", "Visual prompting is its own craft — composition, style, and negative prompts."],
    ["Content Generation & Brand Voice", "Medium", "Intermediate", "Brand systems must constrain generation, not fight it."],
    ["Responsible AI Practice", "Medium", "Beginner", "IP provenance and disclosure for generated assets are client requirements."],
    ["Workflow Automation", "Low", "Beginner", "Batch variant generation and asset resizing automate cleanly."]
  ]},

  // ---------- Cybersecurity ----------
  { p: "SOC Analyst", d: "Cybersecurity", t: "AI-driven alert triage and investigation", s: [
    ["Security Copilots & SOC Automation", "High", "Advanced", "Copilot-assisted triage and log summarization is the emerging daily workflow."],
    ["Prompt Engineering", "High", "Intermediate", "Investigation prompts must elicit evidence, not confident guesses."],
    ["Anomaly Detection", "Medium", "Intermediate", "Understanding the detectors behind alerts sharpens triage decisions."],
    ["Threat Intelligence AI", "Medium", "Intermediate", "LLM enrichment ties indicators to actors and campaigns fast."],
    ["Prompt Injection Defense", "High", "Intermediate", "Attackers plant instructions in logs and phishing content your AI reads."],
    ["Human-in-the-Loop Design", "Medium", "Intermediate", "Containment actions need approval gates, not autonomous response."]
  ]},
  { p: "Penetration Tester", d: "Cybersecurity", t: "Red-teaming AI systems (authorized engagements)", s: [
    ["Red-Teaming & Adversarial Testing", "High", "Advanced", "Systematic probing of LLM apps is now a standard engagement type."],
    ["Prompt Injection Defense", "High", "Advanced", "You must master the attack class to test and report it."],
    ["LLM Fundamentals", "High", "Intermediate", "Model behavior under adversarial input follows from how models work."],
    ["Agent Orchestration", "Medium", "Intermediate", "Agentic targets have tool-use attack surface beyond the chat box."],
    ["LLM Evaluation (Evals)", "Medium", "Intermediate", "Findings become regression tests the client can rerun."],
    ["Responsible AI Practice", "High", "Intermediate", "Scope, authorization, and disclosure discipline define professional work."]
  ]},

  // ---------- Biology / Chemistry / Drug Discovery ----------
  { p: "Molecular Biologist", d: "Biology", t: "Protein structure prediction and design", s: [
    ["Protein Structure Prediction", "High", "Advanced", "AlphaFold-class tools are now standard instruments; interpreting confidence metrics is key."],
    ["Python", "High", "Intermediate", "Running pipelines and parsing outputs requires working code literacy."],
    ["Bioinformatics Pipelines", "Medium", "Intermediate", "Structure work sits inside larger sequence-analysis workflows."],
    ["Literature Search & Research Agents", "Medium", "Intermediate", "Structural hypotheses need grounding in current literature."],
    ["Scientific Data Analysis", "High", "Intermediate", "Downstream validation data still needs rigorous analysis."]
  ]},
  { p: "Bioinformatician", d: "Biology", t: "Building NGS and single-cell analysis pipelines", s: [
    ["Bioinformatics Pipelines", "High", "Advanced", "Pipeline construction and validation is the job itself."],
    ["Agentic Coding", "High", "Intermediate", "AI agents scaffold Nextflow/Snakemake code and debug tool chains."],
    ["Python", "High", "Advanced", "Custom analysis beyond standard tools lives in Python/R."],
    ["Statistical Analysis", "High", "Advanced", "Differential expression and batch effects demand statistical rigor."],
    ["Machine Learning Basics", "Medium", "Intermediate", "Cell-type classification and integration methods are ML under the hood."],
    ["Data Visualization", "Medium", "Intermediate", "UMAPs and QC plots communicate the analysis."]
  ]},
  { p: "Medicinal Chemist", d: "Chemistry", t: "Generative molecule optimization", s: [
    ["Generative Chemistry", "High", "Advanced", "Generative models propose candidates; chemists steer with constraints."],
    ["Molecular Property Prediction", "High", "Advanced", "ADMET predictions decide which proposals merit synthesis."],
    ["Cheminformatics", "High", "Intermediate", "Representations and similarity search underpin every tool in the stack."],
    ["Python", "Medium", "Intermediate", "RDKit workflows and model APIs require working Python."],
    ["AI Literacy & Verification", "High", "Intermediate", "Synthesizability and novelty of AI proposals need expert judgment."]
  ]},
  { p: "Computational Chemist", d: "Chemistry", t: "High-throughput virtual screening with ML", s: [
    ["Molecular Property Prediction", "High", "Advanced", "ML scoring functions triage libraries of millions of compounds."],
    ["Cheminformatics", "High", "Advanced", "Fingerprints, docking prep, and filtering are the daily toolkit."],
    ["Python", "High", "Advanced", "Screening pipelines are custom Python at scale."],
    ["PyTorch", "Medium", "Intermediate", "Training custom property models on in-house assay data."],
    ["Statistical Analysis", "Medium", "Intermediate", "Enrichment metrics and validation splits guard against self-deception."]
  ]},
  { p: "Drug Discovery Scientist", d: "Drug Discovery", t: "Target identification with knowledge graphs", s: [
    ["Knowledge Graphs", "High", "Advanced", "Gene-disease-pathway graphs are the substrate for target hypotheses."],
    ["Hypothesis Generation", "High", "Intermediate", "LLM reasoning over graph evidence proposes ranked target candidates."],
    ["Literature Search & Research Agents", "High", "Advanced", "Evidence for and against each target lives across thousands of papers."],
    ["Bioinformatics Pipelines", "Medium", "Intermediate", "Omics evidence layers feed the graph."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Cited answers over internal and public corpora keep target rationale traceable."]
  ]},

  // ---------- Cybersecurity ----------
  { p: "Security Analyst", d: "Cybersecurity", t: "SOC alert triage with AI copilots", s: [
    ["Security Copilots & SOC Automation", "High", "Advanced", "AI triage, log summarization, and playbook automation are the modern SOC."],
    ["Threat Intelligence AI", "High", "Intermediate", "LLM enrichment correlates indicators, actors, and campaigns fast."],
    ["Prompt Injection Defense", "High", "Advanced", "Attackers plant injections in logs and tickets the copilot reads."],
    ["Anomaly Detection", "Medium", "Intermediate", "Behavioral models surface the alerts worth a human's time."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Runbook-grounded responses keep triage consistent."],
    ["AI Literacy & Verification", "High", "Advanced", "A confidently wrong triage call routes analysts away from real intrusions."]
  ]},
  { p: "AI Red Teamer", d: "Cybersecurity", t: "Testing LLM applications for vulnerabilities", s: [
    ["Red-Teaming & Adversarial Testing", "High", "Advanced", "Systematic jailbreak and abuse-case probing is the whole job."],
    ["Prompt Injection Defense", "High", "Advanced", "You attack it to prove the defenses hold; you must know both sides."],
    ["LLM Fundamentals", "High", "Advanced", "Exploits target sampling, context handling, and tool-use seams."],
    ["Guardrails", "High", "Intermediate", "Testing means knowing exactly what the guardrails claim to enforce."],
    ["LLM Evaluation (Evals)", "Medium", "Intermediate", "Attack success needs measurable, repeatable eval harnesses."],
    ["Tool Calling", "Medium", "Intermediate", "Agentic apps expand the attack surface through their tools."]
  ]},

  // ---------- Biology / Chemistry / Drug Discovery ----------
  { p: "Computational Biologist", d: "Biology", t: "AI-assisted protein design and analysis", s: [
    ["Protein Structure Prediction", "High", "Advanced", "AlphaFold-class models are now standard structural tools."],
    ["Bioinformatics Pipelines", "High", "Advanced", "Sequence and structure workflows are the daily substrate."],
    ["Python", "High", "Advanced", "Biopython, notebooks, and model APIs run on Python."],
    ["Agentic Coding", "Medium", "Intermediate", "Agents build and debug pipeline code under review."],
    ["Scientific Data Analysis", "High", "Advanced", "Statistical rigor on noisy biological data is essential."],
    ["Literature Search & Research Agents", "Medium", "Intermediate", "Prior structural and functional evidence gathers faster with agents."]
  ]},
  { p: "Medicinal Chemist", d: "Chemistry", t: "AI-guided molecule design and screening", s: [
    ["Generative Chemistry", "High", "Advanced", "Generative models propose novel, synthesizable candidates."],
    ["Molecular Property Prediction", "High", "Advanced", "ADMET and activity predictions triage the design space."],
    ["Cheminformatics", "High", "Advanced", "RDKit representations and similarity search underpin everything."],
    ["Python", "High", "Intermediate", "The cheminformatics and modeling stack is Python."],
    ["Model Evaluation", "Medium", "Intermediate", "Prospective validation guards against models that only fit history."],
    ["Experiment Planning", "Medium", "Intermediate", "AI-suggested syntheses still need feasible, prioritized bench plans."]
  ]},
  { p: "Drug Discovery Scientist", d: "Drug Discovery", t: "Target identification and hit-to-lead with AI", s: [
    ["Hypothesis Generation", "High", "Advanced", "Knowledge-graph reasoning proposes and ranks novel targets."],
    ["Knowledge Graphs", "High", "Intermediate", "Linking genes, diseases, and compounds structures the evidence."],
    ["Molecular Property Prediction", "High", "Advanced", "Property models decide which hits advance."],
    ["Literature Search & Research Agents", "High", "Advanced", "Target rationale must be built on comprehensive prior evidence."],
    ["Generative Chemistry", "Medium", "Intermediate", "Lead optimization increasingly uses generative proposals."],
    ["Agent Orchestration", "Medium", "Intermediate", "End-to-end discovery agents chain search, prediction, and design."]
  ]},

  // ---------- Robotics ----------
  { p: "Robotics Engineer", d: "Robotics", t: "Building perception and manipulation with foundation models", s: [
    ["Robotics Foundation Models", "High", "Advanced", "Vision-language-action models are reshaping manipulation and navigation."],
    ["Computer Vision", "High", "Advanced", "Perception remains the sensor-side foundation of any robot."],
    ["Reinforcement Learning", "High", "Advanced", "Policy learning and control are core to autonomous behavior."],
    ["Simulation & Digital Twins", "High", "Intermediate", "Sim-to-real training avoids costly and unsafe hardware iterations."],
    ["PyTorch", "High", "Advanced", "The training framework for perception and policy models."],
    ["Multimodal AI", "Medium", "Intermediate", "Language-conditioned robots need joint vision-language grounding."]
  ]},

  // ---------- Climate Science ----------
  { p: "Climate Scientist", d: "Climate Science", t: "ML emulation and downscaling of climate models", s: [
    ["Climate Modeling with ML", "High", "Advanced", "ML emulators accelerate ensembles physical models can't afford."],
    ["Geospatial & Remote Sensing AI", "High", "Advanced", "Satellite data is the primary observational input."],
    ["Time-Series Forecasting", "High", "Intermediate", "Temporal structure and extremes dominate climate signals."],
    ["Python", "High", "Advanced", "xarray, notebooks, and ML frameworks are the working stack."],
    ["Scientific Data Analysis", "High", "Advanced", "Uncertainty quantification is central to credible projections."],
    ["Explainability (XAI)", "Medium", "Intermediate", "Physical plausibility checks guard against spurious ML skill."]
  ]},

  // ---------- Operations ----------
  { p: "Operations Manager", d: "Operations", t: "Demand forecasting and process automation", s: [
    ["Time-Series Forecasting", "High", "Advanced", "Demand and capacity planning are forecasting problems."],
    ["Workflow Automation", "High", "Intermediate", "AI agents remove repetitive back-office steps end to end."],
    ["SQL & AI-Assisted Analytics", "High", "Intermediate", "Operational questions live in the data warehouse."],
    ["Anomaly Detection", "Medium", "Intermediate", "Process deviations surface before they cascade."],
    ["Data Visualization", "Medium", "Intermediate", "Ops decisions run on live dashboards."],
    ["AI Literacy & Verification", "Medium", "Intermediate", "Forecast overreliance without judgment causes real stockouts."]
  ]},
  { p: "Supply Chain Manager", d: "Operations", t: "AI-optimized inventory and logistics", s: [
    ["Supply Chain Optimization AI", "High", "Advanced", "Forecasting, routing, and inventory optimization are the core levers."],
    ["Time-Series Forecasting", "High", "Advanced", "Demand signals drive every downstream optimization."],
    ["Agent Orchestration", "Medium", "Intermediate", "Multi-step planning agents coordinate suppliers and constraints."],
    ["Anomaly Detection", "Medium", "Intermediate", "Disruption detection buys reaction time."],
    ["Data Visualization", "Medium", "Beginner", "Control-tower views are how the team acts on the models."]
  ]},

  // ---------- Customer Support ----------
  { p: "Customer Support Lead", d: "Customer Support", t: "Deploying an AI support agent", s: [
    ["Conversational AI Design", "High", "Advanced", "Flows, tone, and escalation design determine customer experience."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Advanced", "Answers must be grounded in current help docs, not model memory."],
    ["Guardrails", "High", "Intermediate", "Refund/policy boundaries and safe-response rules must be enforced."],
    ["LLM Evaluation (Evals)", "High", "Intermediate", "Resolution-rate and accuracy evals gate every prompt change."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "Clean handoff to humans is the difference between help and harm."],
    ["Sentiment & Intent Analysis", "Medium", "Intermediate", "Routing and prioritization depend on reading intent and frustration."]
  ]},

  // ---------- Sales ----------
  { p: "Sales Representative", d: "Sales", t: "AI-assisted prospecting and outreach", s: [
    ["Sales Intelligence AI", "High", "Advanced", "Account research and signal detection compress hours of prep."],
    ["Prompt Engineering", "High", "Intermediate", "Personalized-at-scale outreach lives or dies on prompt quality."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Grounding messages in real account facts avoids generic spam."],
    ["Workflow Automation", "Medium", "Intermediate", "Research-to-draft-to-CRM steps automate cleanly."],
    ["AI Literacy & Verification", "Medium", "Intermediate", "A hallucinated fact about a prospect kills credibility instantly."]
  ]},

  // ---------- Human Resources ----------
  { p: "HR Manager", d: "Human Resources", t: "AI-assisted hiring and workforce analytics", s: [
    ["Talent Analytics", "High", "Advanced", "Retention, skills-gap, and workforce-planning analysis is the core value."],
    ["Bias & Fairness Auditing", "High", "Advanced", "Hiring AI is high-risk under the EU AI Act; fairness auditing is mandatory."],
    ["AI Governance & Compliance", "High", "Advanced", "Automated employment decisions face NYC LL144 and similar audit rules."],
    ["Prompt Engineering", "Medium", "Intermediate", "JD drafting and screening summaries need careful, unbiased prompting."],
    ["Privacy-Preserving AI", "High", "Intermediate", "Candidate and employee data carry strict handling obligations."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "Hiring decisions must stay human; AI assists, never decides."]
  ]},

  // ==================== EXPANSION ====================

  // ---------- Product ----------
  { p: "Product Manager", d: "Product", t: "Designing AI-powered product workflows", s: [
    ["Prompt Engineering", "High", "Intermediate", "Prompt design is now a product spec; PMs shape it, not just engineers."],
    ["Workflow Automation", "High", "Intermediate", "The value is in orchestrating steps into a coherent user workflow."],
    ["Agent Orchestration", "High", "Intermediate", "Multi-step AI features are agents; PMs must reason about their loops and limits."],
    ["LLM Evaluation (Evals)", "High", "Intermediate", "Without evals you cannot tell if a change improved the product or regressed it."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "Deciding where users confirm vs. where AI acts is the core UX decision."],
    ["AI Literacy & Verification", "High", "Intermediate", "PMs set realistic expectations by knowing where models fail."]
  ]},
  { p: "Product Manager", d: "Product", t: "Scoping and shipping an LLM feature", s: [
    ["LLM Fundamentals", "High", "Intermediate", "Context limits, latency, and cost shape what's feasible to ship."],
    ["LLM Evaluation (Evals)", "High", "Advanced", "Launch gates and quality bars are defined by eval metrics, not demos."],
    ["AI Cost & Latency Optimization", "High", "Intermediate", "Unit economics of tokens decide whether a feature is viable."],
    ["Guardrails", "High", "Intermediate", "Scope, safety, and brand boundaries must be defined as product requirements."],
    ["Responsible AI Practice", "Medium", "Intermediate", "Disclosure, consent, and appropriate-use decisions are the PM's to own."],
    ["Prompt Engineering", "Medium", "Intermediate", "The PM often owns the system prompt as the feature's behavioral spec."]
  ]},
  { p: "AI Platform Engineer", d: "Product", t: "Building an internal LLM gateway", s: [
    ["Model Deployment & Serving", "High", "Advanced", "Routing, rate limits, and fallback across providers are the gateway's job."],
    ["AI Cost & Latency Optimization", "High", "Advanced", "Caching, routing, and budgets are the platform's core value proposition."],
    ["Guardrails", "High", "Advanced", "Centralized policy enforcement is why teams route through the gateway."],
    ["Prompt Injection Defense", "High", "Advanced", "The gateway is the natural place to enforce injection defenses org-wide."],
    ["Model Context Protocol (MCP)", "Medium", "Intermediate", "MCP standardizes how internal tools connect to every model."],
    ["MLOps & Model Monitoring", "High", "Advanced", "Usage, cost, and quality observability are platform responsibilities."]
  ]},

  // ---------- Healthcare (more personas) ----------
  { p: "Pharmacist", d: "Healthcare", t: "AI-assisted medication review and interaction checking", s: [
    ["Clinical NLP", "High", "Intermediate", "Extracting meds, doses, and problems from notes drives interaction checks."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Answers must cite current formulary and interaction references, not model memory."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "A wrong dose or interaction is a patient-safety event; verification is mandatory."],
    ["AI Literacy & Verification", "High", "Intermediate", "Knowing model limits keeps the pharmacist the final check."],
    ["Privacy-Preserving AI", "High", "Intermediate", "Medication data is PHI with strict handling rules."]
  ]},
  { p: "Public Health Epidemiologist", d: "Healthcare", t: "Outbreak surveillance and forecasting", s: [
    ["Time-Series Forecasting", "High", "Advanced", "Case-count projection and nowcasting are forecasting problems."],
    ["Geospatial & Remote Sensing AI", "High", "Intermediate", "Spatial spread and environmental drivers need geospatial modeling."],
    ["Anomaly Detection", "High", "Intermediate", "Early outbreak signals are anomalies in noisy surveillance streams."],
    ["Scientific Data Analysis", "High", "Advanced", "Reproducible, uncertainty-aware analysis underpins public trust."],
    ["Python", "High", "Intermediate", "The epidemiological modeling stack runs on Python and R."],
    ["Data Visualization", "Medium", "Intermediate", "Decision-makers act on clear dashboards, not model files."]
  ]},
  { p: "Clinical Trial Coordinator", d: "Healthcare", t: "Patient recruitment and eligibility matching", s: [
    ["Trial Matching & Recruitment AI", "High", "Advanced", "Matching patients to complex criteria from records is the core workflow."],
    ["Clinical NLP", "High", "Intermediate", "Eligibility signals hide in unstructured notes and reports."],
    ["Document Processing & OCR", "Medium", "Intermediate", "Referrals and outside records arrive as PDFs and scans."],
    ["Privacy-Preserving AI", "High", "Advanced", "Screening on PHI demands consent-aware, de-identified handling."],
    ["Structured Output", "Medium", "Intermediate", "Extracted eligibility must be schema-clean for defensible screening."]
  ]},
  { p: "Nurse Informaticist", d: "Healthcare", t: "Deploying clinical documentation and alerting tools", s: [
    ["Clinical Documentation AI", "High", "Advanced", "Fitting AI scribes and alerts into nursing workflow is the role's core."],
    ["Human-in-the-Loop Design", "High", "Advanced", "Alert fatigue and override paths are safety-critical design decisions."],
    ["AI Governance & Compliance", "High", "Intermediate", "Clinical tools are regulated; know what's cleared and documented."],
    ["Bias & Fairness Auditing", "Medium", "Intermediate", "Alerting can underperform for underrepresented patients; audit it."],
    ["AI Literacy & Verification", "High", "Intermediate", "Frontline staff need trustworthy guidance on when to trust the tool."]
  ]},
  { p: "Mental Health Therapist", d: "Healthcare", t: "Using AI for notes and between-session support tools", s: [
    ["Clinical Documentation AI", "High", "Intermediate", "AI drafts progress notes; the clinician edits and owns them."],
    ["Privacy-Preserving AI", "High", "Advanced", "Therapy content is exceptionally sensitive; tooling and consent must reflect that."],
    ["Responsible AI Practice", "High", "Advanced", "Boundaries on AI's role in care and crisis are ethical necessities."],
    ["Human-in-the-Loop Design", "High", "Intermediate", "Any patient-facing tool needs clear escalation to a human."],
    ["AI Literacy & Verification", "High", "Intermediate", "Understanding failure modes prevents over-reliance in a high-stakes setting."]
  ]},

  // ---------- Academia (more) ----------
  { p: "University Professor", d: "Academia", t: "Designing AI-integrated courses and assessment policy", s: [
    ["AI Literacy & Verification", "High", "Advanced", "You are teaching judgment about AI as much as content."],
    ["Responsible AI Practice", "High", "Intermediate", "Academic-integrity and disclosure policy is yours to set and model."],
    ["Assessment Generation", "Medium", "Intermediate", "AI-resistant and AI-embracing assessments both need deliberate design."],
    ["Prompt Engineering", "Medium", "Intermediate", "Modeling good prompting teaches students to use AI well."],
    ["AI Tutoring & Adaptive Learning", "Medium", "Beginner", "Knowing how tutors adapt helps you deploy them responsibly."]
  ]},
  { p: "Peer Reviewer", d: "Academia", t: "AI-assisted manuscript review", s: [
    ["AI Literacy & Verification", "High", "Advanced", "Reviewers must judge both the science and any AI used to produce it."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "Checking cited claims and detecting fabricated results is the review's core."],
    ["Responsible AI Practice", "High", "Intermediate", "Confidentiality rules limit pasting manuscripts into public AI tools."],
    ["Statistical Analysis", "High", "Advanced", "Rigor of methods and stats stays a human judgment."],
    ["Scientific Writing with AI", "Low", "Beginner", "AI can help phrase feedback; the assessment is yours."]
  ]},
  { p: "Research Software Engineer", d: "Academia", t: "Building reproducible research infrastructure", s: [
    ["Agentic Coding", "High", "Advanced", "Agents scaffold pipelines and tests; RSEs review and harden them."],
    ["Python", "High", "Advanced", "The research computing substrate across disciplines."],
    ["MLOps & Model Monitoring", "Medium", "Intermediate", "Reproducibility means versioned data, models, and environments."],
    ["Scientific Data Analysis", "High", "Advanced", "Correct, reproducible analysis is the deliverable researchers depend on."],
    ["LLM Evaluation (Evals)", "Medium", "Intermediate", "If the tool uses an LLM, evals are its reproducibility guarantee."]
  ]},

  // ---------- Scientific Research (more) ----------
  { p: "Materials Scientist", d: "Scientific Research", t: "AI-accelerated materials discovery", s: [
    ["Materials Informatics", "High", "Advanced", "Property prediction and inverse design are the field's AI core."],
    ["Generative Design", "High", "Intermediate", "Generative models propose candidate structures under constraints."],
    ["Simulation & Digital Twins", "High", "Intermediate", "DFT/MD simulation grounds and validates ML predictions."],
    ["Python", "High", "Intermediate", "pymatgen and ML frameworks are the working stack."],
    ["Scientific Data Analysis", "High", "Advanced", "Sparse, noisy experimental data demands careful analysis."],
    ["Experiment Planning", "Medium", "Intermediate", "Active learning chooses the next experiment worth running."]
  ]},
  { p: "Bioinformatician", d: "Biology", t: "Single-cell and omics analysis with AI", s: [
    ["Bioinformatics Pipelines", "High", "Advanced", "Building and debugging omics workflows is the daily work."],
    ["Agentic Coding", "High", "Intermediate", "Agents accelerate pipeline and analysis code under review."],
    ["Python", "High", "Advanced", "scanpy, Bioconductor bridges, and ML APIs run here."],
    ["Scientific Data Analysis", "High", "Advanced", "High-dimensional, batch-effect-prone data needs statistical care."],
    ["Statistical Analysis", "High", "Advanced", "Multiple testing and normalization are make-or-break."],
    ["Knowledge Graphs", "Low", "Beginner", "Linking genes, pathways, and phenotypes aids interpretation."]
  ]},

  // ---------- Software Engineering (more) ----------
  { p: "Frontend Engineer", d: "Software Engineering", t: "AI-assisted UI development", s: [
    ["Design-to-Code AI", "High", "Advanced", "Mockup- and prompt-to-code tools are reshaping frontend build speed."],
    ["Agentic Coding", "High", "Advanced", "Coding agents scaffold components; review discipline is essential."],
    ["Prompt Engineering", "Medium", "Intermediate", "Design intent and constraints must be specified precisely."],
    ["Accessibility AI", "High", "Intermediate", "AI-generated UI routinely misses WCAG; auditing it is now a core skill."],
    ["AI Literacy & Verification", "High", "Advanced", "Reviewing generated UI for subtle correctness and a11y bugs."]
  ]},
  { p: "QA / Test Engineer", d: "Software Engineering", t: "AI-driven test generation and coverage", s: [
    ["AI Test Generation", "High", "Advanced", "Generating and curating tests with AI is the central shift in QA."],
    ["Agentic Coding", "High", "Intermediate", "Agents write and maintain test suites under review."],
    ["LLM Evaluation (Evals)", "Medium", "Intermediate", "If the product uses AI, evals are a test category of their own."],
    ["Prompt Engineering", "Medium", "Intermediate", "Test-generation quality depends on precise, contextual prompts."],
    ["AI Literacy & Verification", "High", "Advanced", "Generated tests can assert the wrong thing; verifying them is the job."]
  ]},
  { p: "Application Security Engineer", d: "Software Engineering", t: "Securing AI features and reviewing code with AI", s: [
    ["Prompt Injection Defense", "High", "Advanced", "Any feature ingesting untrusted content is an injection target."],
    ["Red-Teaming & Adversarial Testing", "High", "Advanced", "Probing AI features for abuse is now part of AppSec."],
    ["Security Copilots & SOC Automation", "Medium", "Intermediate", "AI-assisted code and log review speeds triage."],
    ["Guardrails", "High", "Intermediate", "Knowing what output filtering enforces is prerequisite to testing it."],
    ["AI Literacy & Verification", "High", "Advanced", "AI-suggested fixes can introduce vulnerabilities; verify them."]
  ]},
  { p: "Technical Writer", d: "Software Engineering", t: "AI-assisted documentation at scale", s: [
    ["AI Writing & Editing", "High", "Advanced", "Human-edited AI drafts are the modern docs production model."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Grounding docs in the actual codebase and specs prevents invented behavior."],
    ["Prompt Engineering", "High", "Intermediate", "Style, audience, and structure live in reusable prompt templates."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "Docs that describe non-existent behavior erode all trust; verify against source."],
    ["Structured Output", "Medium", "Intermediate", "API references and tables need schema-consistent generation."]
  ]},

  // ---------- Data Science (more) ----------
  { p: "Data Engineer", d: "Data Science", t: "Building data pipelines for RAG and AI systems", s: [
    ["Vector Databases", "High", "Advanced", "Embedding stores and indexes are new first-class pipeline outputs."],
    ["Document Processing & OCR", "High", "Advanced", "Turning messy source documents into clean chunks is upstream of every RAG system."],
    ["Embeddings & Semantic Search", "High", "Intermediate", "Chunking and embedding strategy decide retrieval quality."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "You own the data quality the whole RAG system depends on."],
    ["Data Governance", "High", "Intermediate", "Lineage, access, and freshness contracts keep AI systems trustworthy."],
    ["Python", "High", "Advanced", "The pipeline and orchestration substrate."]
  ]},
  { p: "Analytics Engineer", d: "Data Science", t: "Semantic layer and natural-language analytics", s: [
    ["SQL & AI-Assisted Analytics", "High", "Advanced", "A governed semantic layer is what makes text-to-SQL trustworthy."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Metric and column definitions must ground every generated query."],
    ["Structured Output", "High", "Intermediate", "Query plans and metric specs need schema-conformant output."],
    ["LLM Evaluation (Evals)", "High", "Intermediate", "A question-answer eval set catches silent semantic errors."],
    ["Data Visualization", "Medium", "Intermediate", "The last-mile deliverable is still a clear chart."]
  ]},

  // ---------- Law (more) ----------
  { p: "Privacy & Compliance Counsel", d: "Law", t: "Standing up an AI governance program", s: [
    ["AI Governance & Compliance", "High", "Advanced", "EU AI Act and sectoral rules define the program's backbone."],
    ["Privacy-Preserving AI", "High", "Advanced", "Data-protection obligations shape what AI may touch."],
    ["Responsible AI Practice", "High", "Advanced", "Transparency, consent, and appropriate-use policy are the deliverables."],
    ["Bias & Fairness Auditing", "High", "Intermediate", "High-risk systems require documented fairness assessments."],
    ["Red-Teaming & Adversarial Testing", "Medium", "Beginner", "Understanding how systems are tested informs what to require."],
    ["Model Cards & Documentation", "Medium", "Intermediate", "Documentation and audit trails are compliance evidence."]
  ]},
  { p: "Patent Agent", d: "Law", t: "Prior-art search and patent drafting", s: [
    ["Patent Analysis AI", "High", "Advanced", "Prior-art search and claim analysis are the core AI-augmented tasks."],
    ["Literature Search & Research Agents", "High", "Intermediate", "Non-patent literature must be searched comprehensively."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Grounded drafting keeps claim language tied to real references."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "A fabricated reference or misread claim has legal consequences."],
    ["Document Processing & OCR", "Medium", "Intermediate", "Patents and references arrive as complex structured PDFs."]
  ]},

  // ---------- Finance (more) ----------
  { p: "Financial Advisor", d: "Finance", t: "AI-assisted client research and planning prep", s: [
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Grounding summaries in real product docs and holdings avoids invented facts."],
    ["Financial NLP", "Medium", "Intermediate", "Parsing statements, filings, and news structures the prep work."],
    ["AI Literacy & Verification", "High", "Advanced", "AI drafts research; the licensed advisor makes and owns every recommendation."],
    ["Privacy-Preserving AI", "High", "Advanced", "Client financial data demands strict tooling and consent."],
    ["Responsible AI Practice", "High", "Intermediate", "Suitability and disclosure obligations bound how AI may be used."]
  ]},
  { p: "Auditor", d: "Finance", t: "AI-assisted audit analytics", s: [
    ["Audit Analytics AI", "High", "Advanced", "Full-population testing and evidence extraction are the modern audit."],
    ["Anomaly Detection", "High", "Intermediate", "Outlier transactions and journal entries are prime risk signals."],
    ["Document Processing & OCR", "High", "Intermediate", "Contracts, invoices, and confirmations must become analyzable data."],
    ["Explainability (XAI)", "High", "Intermediate", "Findings must be defensible and traceable to evidence."],
    ["AI Governance & Compliance", "Medium", "Intermediate", "Auditing AI-driven controls is itself becoming audit scope."],
    ["Structured Output", "Medium", "Intermediate", "Extraction into consistent workpaper schemas keeps evidence organized."]
  ]},
  { p: "Actuary", d: "Finance", t: "ML-enhanced risk and pricing models", s: [
    ["Quantitative Modeling with ML", "High", "Advanced", "ML augments classical actuarial models for pricing and reserving."],
    ["Statistical Analysis", "High", "Advanced", "Actuarial rigor and validation remain non-delegable."],
    ["Explainability (XAI)", "High", "Advanced", "Regulators require interpretable, justifiable pricing decisions."],
    ["Bias & Fairness Auditing", "High", "Intermediate", "Pricing models face strict anti-discrimination scrutiny."],
    ["Time-Series Forecasting", "Medium", "Intermediate", "Claims and mortality trends are temporal forecasting problems."]
  ]},

  // ---------- Education (more) ----------
  { p: "EdTech Product Manager", d: "Education", t: "Building an AI tutoring product", s: [
    ["AI Tutoring & Adaptive Learning", "High", "Advanced", "Learner-model-driven adaptivity is the product itself."],
    ["LLM Evaluation (Evals)", "High", "Advanced", "Tutor quality needs eval sets of learner scenarios, not vibes."],
    ["Conversational AI Design", "High", "Intermediate", "Tutor persona, hint ladders, and failure handling define the experience."],
    ["Guardrails", "High", "Intermediate", "Age-appropriateness and safety boundaries are hard product requirements."],
    ["Bias & Fairness Auditing", "Medium", "Intermediate", "Tutoring must serve all learners equitably."],
    ["Human-in-the-Loop Design", "Medium", "Intermediate", "Teacher oversight and overrides keep the educator in control."]
  ]},
  { p: "Academic Advisor", d: "Education", t: "Student success and early-warning analytics", s: [
    ["Personalization & Segmentation", "High", "Intermediate", "Tailoring outreach to at-risk student segments is the core intervention."],
    ["Bias & Fairness Auditing", "High", "Advanced", "Early-warning models can entrench bias; auditing is essential and often required."],
    ["Privacy-Preserving AI", "High", "Advanced", "Student records (FERPA) demand strict handling."],
    ["Explainability (XAI)", "Medium", "Intermediate", "Advisors need to know why a student was flagged to act well."],
    ["Data Visualization", "Medium", "Beginner", "Advisors act on dashboards, not model scores."]
  ]},

  // ---------- Marketing (more) ----------
  { p: "Social Media Manager", d: "Marketing", t: "AI content and community management", s: [
    ["Content Generation & Brand Voice", "High", "Advanced", "On-brand content at platform cadence is only feasible with AI plus review."],
    ["Image & Video Generation", "High", "Intermediate", "Visual and short-video variants generate fast; consistency needs control."],
    ["Sentiment & Intent Analysis", "High", "Intermediate", "Reading community mood and surfacing issues guides response."],
    ["Workflow Automation", "Medium", "Intermediate", "Draft-schedule-monitor loops automate cleanly."],
    ["Responsible AI Practice", "Medium", "Beginner", "Disclosure and provenance for generated content matter publicly."]
  ]},
  { p: "Growth / Performance Marketer", d: "Marketing", t: "AI-driven experimentation and targeting", s: [
    ["A/B Testing & Experimentation", "High", "Advanced", "Rigorous experiments separate real lift from noise."],
    ["Causal Inference", "High", "Intermediate", "Attribution and incrementality require causal, not correlational, thinking."],
    ["Personalization & Segmentation", "High", "Intermediate", "Per-segment creative and targeting drive performance."],
    ["Recommender Systems", "Medium", "Intermediate", "Ranking and next-best-action power personalized funnels."],
    ["SQL & AI-Assisted Analytics", "Medium", "Intermediate", "Performance questions live in the warehouse."]
  ]},
  { p: "Market Research Analyst", d: "Marketing", t: "AI-assisted survey and voice-of-customer analysis", s: [
    ["Sentiment & Intent Analysis", "High", "Advanced", "Coding open-ended responses at scale is the core task."],
    ["Embeddings & Semantic Search", "High", "Intermediate", "Clustering reveals the real themes behind free text."],
    ["Structured Output", "Medium", "Intermediate", "Consistent coding schemas enable defensible tallies."],
    ["Statistical Analysis", "High", "Advanced", "Sampling and significance keep conclusions honest."],
    ["Data Visualization", "Medium", "Intermediate", "Findings land through clear charts and segment maps."]
  ]},

  // ---------- Manufacturing (more) ----------
  { p: "Process Engineer", d: "Manufacturing", t: "Simulation-based process optimization", s: [
    ["Simulation & Digital Twins", "High", "Advanced", "A validated digital twin is where optimization is explored safely."],
    ["Optimization & Operations Research", "High", "Advanced", "Setpoint and schedule optimization is the decision layer."],
    ["Time-Series Forecasting", "Medium", "Intermediate", "Throughput and yield trends inform the model."],
    ["Statistical Analysis", "High", "Advanced", "DOE and SPC remain the analytical backbone."],
    ["Predictive Maintenance", "Medium", "Intermediate", "Uptime constraints feed realistic process optimization."]
  ]},
  { p: "Industrial Designer", d: "Design", t: "Generative design for physical products", s: [
    ["Generative Design", "High", "Advanced", "AI-driven exploration of form and structure under constraints is the workflow."],
    ["Simulation & Digital Twins", "High", "Intermediate", "Structural and thermal simulation validates generated geometry."],
    ["Image & Video Generation", "Medium", "Intermediate", "Concept visualization and rendering accelerate ideation."],
    ["Prompt Engineering", "Medium", "Intermediate", "Design intent and constraints must be specified precisely."],
    ["Optimization & Operations Research", "Low", "Beginner", "Manufacturability and cost constraints frame the design space."]
  ]},

  // ---------- Government (more) ----------
  { p: "Urban Planner", d: "Government", t: "AI for land use and mobility planning", s: [
    ["Geospatial & Remote Sensing AI", "High", "Advanced", "Land use, imagery, and mobility data are inherently spatial."],
    ["Simulation & Digital Twins", "High", "Intermediate", "City-scale simulation tests scenarios before they're built."],
    ["Time-Series Forecasting", "Medium", "Intermediate", "Demand, traffic, and growth projections drive plans."],
    ["Data Visualization", "High", "Intermediate", "Public engagement depends on legible maps and scenarios."],
    ["Bias & Fairness Auditing", "Medium", "Intermediate", "Planning models can entrench inequity; assess distributional effects."]
  ]},
  { p: "Public Sector Data Officer", d: "Government", t: "Responsible AI adoption across agencies", s: [
    ["AI Governance & Compliance", "High", "Advanced", "Public-sector AI faces the strictest transparency and accountability rules."],
    ["Responsible AI Practice", "High", "Advanced", "Equity, contestability, and disclosure are baseline obligations."],
    ["Bias & Fairness Auditing", "High", "Advanced", "Automated public decisions require documented fairness review."],
    ["Privacy-Preserving AI", "High", "Advanced", "Citizen data carries strict statutory protections."],
    ["Red-Teaming & Adversarial Testing", "Medium", "Intermediate", "Public-facing systems must be probed before deployment."],
    ["Model Cards & Documentation", "Medium", "Intermediate", "Transparency documentation is often legally required."]
  ]},
  { p: "Emergency Management Analyst", d: "Government", t: "AI-assisted disaster response", s: [
    ["Geospatial & Remote Sensing AI", "High", "Advanced", "Satellite and aerial imagery drive damage assessment and routing."],
    ["Time-Series Forecasting", "High", "Intermediate", "Hazard progression and resource demand are forecast-driven."],
    ["Anomaly Detection", "Medium", "Intermediate", "Sensor and social signals surface emerging incidents."],
    ["Multimodal AI", "Medium", "Intermediate", "Fusing imagery, text reports, and maps speeds situational awareness."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Plans and protocols must ground AI guidance during response."]
  ]},

  // ---------- Journalism (more) ----------
  { p: "News Editor", d: "Journalism", t: "Setting newsroom AI workflows and standards", s: [
    ["AI Writing & Editing", "High", "Intermediate", "AI-assisted drafting and headlines need editorial guardrails."],
    ["Fact-Checking & Verification AI", "High", "Advanced", "Verification standards are the newsroom's credibility."],
    ["Responsible AI Practice", "High", "Advanced", "Disclosure, sourcing, and correction policy for AI use are the editor's to set."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "No AI claim publishes unverified."],
    ["Content Generation & Brand Voice", "Medium", "Intermediate", "House style must survive AI assistance."]
  ]},
  { p: "Data Journalist", d: "Journalism", t: "Data-driven investigative stories", s: [
    ["Data Journalism", "High", "Advanced", "Finding and telling stories in data is the discipline itself."],
    ["SQL & AI-Assisted Analytics", "High", "Intermediate", "Most datasets are queried; AI accelerates the analysis."],
    ["Data Visualization", "High", "Advanced", "The story lands through honest, clear graphics."],
    ["Document Processing & OCR", "Medium", "Intermediate", "Records and disclosures arrive as messy PDFs."],
    ["Embeddings & Semantic Search", "Medium", "Intermediate", "Semantic search finds threads across large corpora."],
    ["AI Literacy & Verification", "High", "Advanced", "Every AI-surfaced finding must be independently confirmed."]
  ]},

  // ---------- Design (more) ----------
  { p: "Product Designer", d: "Design", t: "Designing AI-native product experiences", s: [
    ["UX Research with AI", "High", "Intermediate", "AI-accelerated synthesis speeds the research-to-design loop."],
    ["Conversational AI Design", "High", "Advanced", "AI-native products are often conversations; designing them is core."],
    ["Design-to-Code AI", "High", "Intermediate", "Prompt-to-prototype makes testable artifacts without engineers."],
    ["Prompt Engineering", "High", "Intermediate", "Designing the model's behavior is now a design surface."],
    ["LLM Evaluation (Evals)", "Medium", "Beginner", "Designers should read eval results to iterate on AI UX."]
  ]},
  { p: "Motion / Video Creator", d: "Design", t: "Generative video and motion workflows", s: [
    ["Image & Video Generation", "High", "Advanced", "Generative video with control and consistency is the craft."],
    ["Prompt Engineering", "High", "Advanced", "Visual and temporal prompting is its own discipline."],
    ["Workflow Automation", "Medium", "Intermediate", "Batch rendering and variant pipelines automate cleanly."],
    ["Responsible AI Practice", "High", "Intermediate", "Provenance (C2PA), likeness, and IP are real client obligations."],
    ["Content Generation & Brand Voice", "Medium", "Intermediate", "Brand systems must constrain generation."]
  ]},

  // ---------- Cybersecurity (more) ----------
  { p: "AI Security Engineer", d: "Cybersecurity", t: "Securing LLM and agentic systems", s: [
    ["Prompt Injection Defense", "High", "Advanced", "Injection is the defining vulnerability class of LLM apps."],
    ["Red-Teaming & Adversarial Testing", "High", "Advanced", "You attack the system to prove its defenses hold."],
    ["Guardrails", "High", "Advanced", "Designing and enforcing output and action limits is the core control."],
    ["LLM Fundamentals", "High", "Advanced", "Exploits target sampling, context, and tool-use seams."],
    ["Model Deployment & Serving", "Medium", "Intermediate", "The serving layer is where many controls are enforced."],
    ["AI Governance & Compliance", "Medium", "Intermediate", "Security work feeds the org's AI risk documentation."]
  ]},
  { p: "GRC Analyst", d: "Cybersecurity", t: "Mapping AI systems to risk and compliance frameworks", s: [
    ["AI Governance & Compliance", "High", "Advanced", "Mapping systems to NIST AI RMF and the EU AI Act is the core task."],
    ["Model Cards & Documentation", "High", "Advanced", "Standardized documentation is the evidence GRC runs on."],
    ["Responsible AI Practice", "High", "Intermediate", "Policy translates principles into enforceable controls."],
    ["Bias & Fairness Auditing", "Medium", "Intermediate", "Fairness assessments are required artifacts for high-risk systems."],
    ["Red-Teaming & Adversarial Testing", "Medium", "Beginner", "Understanding testing informs what evidence to demand."]
  ]},
  { p: "Incident Responder", d: "Cybersecurity", t: "AI-assisted investigation and forensics", s: [
    ["Security Copilots & SOC Automation", "High", "Advanced", "AI summarization and triage compress investigation time."],
    ["Threat Intelligence AI", "High", "Intermediate", "Enriching indicators and attributing activity accelerates response."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Playbook- and log-grounded answers keep response consistent."],
    ["Anomaly Detection", "High", "Intermediate", "Deviations in logs and behavior localize the intrusion."],
    ["AI Literacy & Verification", "High", "Advanced", "A confidently wrong lead wastes the golden hour; verify."]
  ]},

  // ---------- Biology / Chemistry (more) ----------
  { p: "Genomics Researcher", d: "Biology", t: "Variant interpretation with AI", s: [
    ["Genomics AI", "High", "Advanced", "Deep-learning variant effect prediction is now standard."],
    ["Bioinformatics Pipelines", "High", "Advanced", "Calling and annotating variants is the upstream workflow."],
    ["Knowledge Graphs", "Medium", "Intermediate", "Gene-disease-variant links structure interpretation."],
    ["Python", "High", "Advanced", "The genomics analysis and ML stack."],
    ["Scientific Data Analysis", "High", "Advanced", "Statistical rigor on population data is essential."]
  ]},
  { p: "Synthetic Biologist", d: "Biology", t: "AI-guided protein and pathway design", s: [
    ["Generative Biology", "High", "Advanced", "Sequence- and structure-design models propose novel constructs."],
    ["Protein Structure Prediction", "High", "Advanced", "Structure prediction validates and guides designs."],
    ["Bioinformatics Pipelines", "High", "Intermediate", "Design-build-test data flows through these workflows."],
    ["Simulation & Digital Twins", "Medium", "Intermediate", "In silico screening narrows candidates before the bench."],
    ["Experiment Planning", "Medium", "Intermediate", "Active learning prioritizes which designs to build and test."]
  ]},
  { p: "Analytical Chemist", d: "Chemistry", t: "AI for spectral and signal interpretation", s: [
    ["Multimodal AI", "Medium", "Intermediate", "Spectra and instrument outputs suit ML pattern models."],
    ["Anomaly Detection", "High", "Intermediate", "Out-of-spec and contaminant signals are anomalies."],
    ["Model Evaluation", "High", "Intermediate", "Calibration and validation guard against overconfident models."],
    ["Python", "High", "Intermediate", "The signal-processing and ML substrate."],
    ["Scientific Data Analysis", "High", "Advanced", "Reproducible, uncertainty-aware analysis underpins results."]
  ]},
  { p: "Regulatory Affairs Specialist", d: "Drug Discovery", t: "AI-assisted regulatory submissions", s: [
    ["Regulatory Intelligence AI", "High", "Advanced", "Tracking rules and mapping them to obligations is the core work."],
    ["Document Processing & OCR", "High", "Intermediate", "Submissions assemble from vast, structured document sets."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Answers and drafts must cite the exact guidance and data."],
    ["Structured Output", "Medium", "Intermediate", "Submissions demand rigid, schema-conformant formatting."],
    ["Hallucination Detection & Fact Verification", "High", "Advanced", "A wrong citation in a submission has regulatory consequences."]
  ]},

  // ---------- Robotics (more) ----------
  { p: "Autonomous Vehicle Engineer", d: "Robotics", t: "Perception and planning for self-driving", s: [
    ["Computer Vision", "High", "Advanced", "Detection, segmentation, and tracking are perception's foundation."],
    ["Sensor Fusion", "High", "Advanced", "Fusing camera, lidar, and radar is core to reliable perception."],
    ["Reinforcement Learning", "High", "Advanced", "Planning and control policies are learned and optimized."],
    ["Simulation & Digital Twins", "High", "Advanced", "Sim testing covers the rare, dangerous scenarios roads can't."],
    ["PyTorch", "High", "Advanced", "The training framework for perception and planning models."],
    ["Anomaly Detection", "Medium", "Intermediate", "Detecting out-of-distribution scenes is safety-critical."]
  ]},

  // ---------- Climate (more) ----------
  { p: "Sustainability Analyst", d: "Climate Science", t: "Carbon accounting and ESG reporting with AI", s: [
    ["Carbon Accounting AI", "High", "Advanced", "Extracting and estimating emissions across scopes is the core workflow."],
    ["Document Processing & OCR", "High", "Intermediate", "Emissions data hides in invoices, bills, and supplier documents."],
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Reporting must ground claims in standards and source records."],
    ["Structured Output", "Medium", "Intermediate", "Disclosures require rigid, auditable schemas."],
    ["Data Visualization", "Medium", "Intermediate", "Stakeholders act on clear ESG dashboards."]
  ]},
  { p: "Energy Analyst", d: "Climate Science", t: "Grid load forecasting and optimization", s: [
    ["Time-Series Forecasting", "High", "Advanced", "Load and generation forecasting is the analytical core."],
    ["Optimization & Operations Research", "High", "Advanced", "Dispatch and storage decisions are optimization problems."],
    ["Anomaly Detection", "Medium", "Intermediate", "Grid faults and unusual demand surface as anomalies."],
    ["Geospatial & Remote Sensing AI", "Medium", "Intermediate", "Renewable resource and weather data are spatial."],
    ["Python", "High", "Intermediate", "The forecasting and optimization stack."]
  ]},

  // ---------- Operations (more) ----------
  { p: "Business Analyst", d: "Operations", t: "AI-assisted process discovery and automation", s: [
    ["Process Mining", "High", "Advanced", "Reconstructing real workflows from logs reveals automation targets."],
    ["Workflow Automation", "High", "Intermediate", "Turning discovered inefficiencies into automated flows is the payoff."],
    ["SQL & AI-Assisted Analytics", "High", "Intermediate", "Operational data is queried to quantify opportunities."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Grounding answers in SOPs and process docs keeps them accurate."],
    ["Data Visualization", "Medium", "Intermediate", "Process maps and dashboards drive stakeholder buy-in."]
  ]},
  { p: "Project Manager", d: "Operations", t: "AI-assisted planning, status, and reporting", s: [
    ["Workflow Automation", "High", "Intermediate", "Status collection, reminders, and reporting automate well."],
    ["AI Writing & Editing", "High", "Intermediate", "Status reports and stakeholder updates draft in minutes."],
    ["RAG (Retrieval-Augmented Generation)", "Medium", "Intermediate", "Grounding updates in the actual project record avoids drift."],
    ["Structured Output", "Medium", "Beginner", "Consistent status schemas make roll-ups possible."],
    ["AI Literacy & Verification", "Medium", "Intermediate", "AI summaries of risk and status must be sanity-checked."]
  ]},

  // ---------- Customer Support (more) ----------
  { p: "CX Analyst", d: "Customer Support", t: "Voice-of-customer analytics", s: [
    ["Sentiment & Intent Analysis", "High", "Advanced", "Classifying emotion, intent, and topics across channels is the core."],
    ["Embeddings & Semantic Search", "High", "Intermediate", "Clustering surfaces emerging issues before they trend."],
    ["Structured Output", "Medium", "Intermediate", "Consistent tagging enables trend tracking and roll-ups."],
    ["Data Visualization", "High", "Intermediate", "Insight lands through clear driver and trend charts."],
    ["Anomaly Detection", "Medium", "Intermediate", "Spikes in complaint themes flag operational problems early."]
  ]},

  // ---------- Sales (more) ----------
  { p: "Sales Engineer", d: "Sales", t: "AI-assisted demos and technical qualification", s: [
    ["RAG (Retrieval-Augmented Generation)", "High", "Intermediate", "Grounded answers about the product and integrations build trust in demos."],
    ["Prompt Engineering", "High", "Intermediate", "Tailoring technical narratives to each prospect scales with good prompting."],
    ["Conversational AI Design", "Medium", "Intermediate", "Building demo assistants and POCs is increasingly the SE's job."],
    ["Sales Intelligence AI", "Medium", "Intermediate", "Account and stack research sharpens technical qualification."],
    ["AI Literacy & Verification", "High", "Intermediate", "A hallucinated capability claim in a demo destroys credibility."]
  ]},
  { p: "RevOps Analyst", d: "Sales", t: "Pipeline forecasting and lead scoring", s: [
    ["Time-Series Forecasting", "High", "Advanced", "Pipeline and revenue forecasting is the analytical core."],
    ["Recommender Systems", "High", "Intermediate", "Lead and account scoring is a ranking problem."],
    ["SQL & AI-Assisted Analytics", "High", "Intermediate", "CRM and warehouse data drive every RevOps question."],
    ["Causal Inference", "Medium", "Intermediate", "Attribution requires causal, not correlational, reasoning."],
    ["Data Visualization", "Medium", "Intermediate", "Leadership acts on clear pipeline dashboards."]
  ]},

  // ---------- Human Resources (more) ----------
  { p: "Recruiter", d: "Human Resources", t: "AI-assisted sourcing and screening", s: [
    ["Talent Analytics", "High", "Intermediate", "Matching and funnel analytics guide sourcing decisions."],
    ["Bias & Fairness Auditing", "High", "Advanced", "Screening AI is high-risk and legally required to be audited for bias."],
    ["AI Governance & Compliance", "High", "Advanced", "NYC LL144 and the EU AI Act govern automated hiring tools."],
    ["Embeddings & Semantic Search", "Medium", "Intermediate", "Skill-based candidate matching beats keyword filters."],
    ["Prompt Engineering", "Medium", "Intermediate", "Job descriptions and outreach need careful, unbiased prompting."],
    ["Privacy-Preserving AI", "High", "Intermediate", "Candidate data carries strict handling obligations."]
  ]},
  { p: "L&D Specialist", d: "Human Resources", t: "AI upskilling programs and skills mapping", s: [
    ["Skills Taxonomy & Ontology", "High", "Advanced", "A structured skills model is what makes gap analysis and pathing possible."],
    ["AI Tutoring & Adaptive Learning", "High", "Intermediate", "Adaptive learning personalizes upskilling at scale."],
    ["Personalization & Segmentation", "Medium", "Intermediate", "Learning paths tailored to role and level drive completion."],
    ["Assessment Generation", "Medium", "Intermediate", "Validated assessments measure real skill gain."],
    ["Knowledge Management AI", "Medium", "Intermediate", "Turning internal expertise into learning content is a core lever."]
  ]},
];

// Expose for app-rec.js
if (typeof window !== "undefined") { window.SKILL_LIB = SKILL_LIB; window.RECS = RECS; }
