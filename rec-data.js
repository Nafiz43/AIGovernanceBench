// AI Skill Recommender data.
// EVERY recommendation references a REAL entry in the All Skill List (data.js)
// by its exact name — an Agent Skill or governance file that has a live GitHub
// repo you can import into your AI agent. No invented/abstract competencies.
// Purpose: tell people which real AI skills & governance files to add to their
// agent for a given role and task — not what a human should go learn.
//
// s: [ directoryEntryName, importance("High"|"Medium"|"Low"), whyForThisPersonaTask ]
// The card pulls type / category / purpose / GitHub URL from data.js by name.

const RECS = [
  // ---------- Healthcare ----------
  { p: "Radiologist", d: "Healthcare", t: "Building an AI model for DSA vs. non-DSA image classification", s: [
    ["EU AI Act", "High", "Medical imaging AI is high-risk under the Act — import its risk-tier obligations from day one."],
    ["Responsible AI Toolbox", "High", "Audit the classifier's fairness and reliability before it ever touches patients."],
    ["NIST AI Risk Management Framework", "Medium", "A lifecycle framework to govern the model's risk end to end."],
    ["scientific-agent-skills", "Medium", "Science-focused agent skills for the data analysis and experiment work."],
    ["academic-research-skills", "Low", "Validate and write up the model against the literature."]
  ]},
  { p: "Radiologist", d: "Healthcare", t: "AI-assisted report drafting and worklist triage", s: [
    ["NeMo Guardrails", "High", "Constrain a report-drafting agent so it can't emit unverified findings."],
    ["Guardrails AI", "High", "Validate drafted reports against structured rules before the radiologist signs."],
    ["EU AI Act", "High", "Triage and drafting on patients fall squarely under high-risk obligations."],
    ["doc-coauthoring", "Medium", "Human-in-the-loop drafting workflow so the radiologist stays the author."],
    ["CLAUDE.md", "Low", "Scope exactly what the drafting agent may and may not do in your setup."]
  ]},
  { p: "Medical Resident", d: "Healthcare", t: "Learning procedural case log annotation", s: [
    ["prompt-master", "High", "Precise extraction prompts are what make AI-assisted labeling reliable."],
    ["CLAUDE.md", "High", "Scope the annotation agent — what it may label and the format it must use."],
    ["pdf", "Medium", "Pull procedures out of scanned records and reports into structured text."],
    ["Responsible AI Toolbox", "Low", "Spot-check pre-labels for systematic error before trusting them."]
  ]},
  { p: "Medical Resident", d: "Healthcare", t: "AI-assisted literature review for journal club", s: [
    ["academic-research-skills", "High", "End-to-end research pipeline: find, appraise, synthesize, write."],
    ["scientific-agent-skills", "High", "Science agent skills for reading and comparing trials rigorously."],
    ["notebooklm-py", "Medium", "Programmatic NotebookLM access to summarize sources with citations you can check."],
    ["humanizer", "Low", "Clean AI phrasing out of your written summary."]
  ]},
  { p: "Physician (Primary Care)", d: "Healthcare", t: "Adopting ambient clinical documentation", s: [
    ["NeMo Guardrails", "High", "Stop an ambient scribe from inventing clinical content or negations."],
    ["EU AI Act", "High", "Clinical documentation AI carries high-risk obligations and consent duties."],
    ["doc-coauthoring", "Medium", "Supervised note-drafting keeps the physician the author of record."],
    ["CLAUDE.md", "Medium", "Bound what the documentation agent is allowed to do."],
    ["Responsible AI Toolbox", "Low", "Check for systematic summarization error across patient groups."]
  ]},
  { p: "Physician (Primary Care)", d: "Healthcare", t: "Using AI clinical decision support safely", s: [
    ["EU AI Act", "High", "Decision support is high-risk — know the obligations before relying on it."],
    ["Responsible AI Toolbox", "High", "Audit the tool's fairness and reliability across your patient population."],
    ["NIST AI Risk Management Framework", "Medium", "Frame and govern the risk of acting on model output."],
    ["awesome-ai-governance", "Low", "Broader governance references for safe clinical adoption."]
  ]},

  // ---------- Academia ----------
  { p: "Academic Researcher", d: "Academia", t: "Conducting novel drug discovery research", s: [
    ["scientific-agent-skills", "High", "The largest science agent-skills library — turns your agent into a research collaborator."],
    ["academic-research-skills", "High", "Runs the full research → write → review → revise loop."],
    ["AI-Research-SKILLs", "Medium", "Portable research/engineering skills for the analysis work."],
    ["graphify", "Medium", "Turn papers, data, and configs into a queryable knowledge graph for target reasoning."],
    ["notebooklm-py", "Low", "Programmatic NotebookLM for grounded literature synthesis."]
  ]},
  { p: "Academic Researcher", d: "Academia", t: "Writing a competitive grant proposal", s: [
    ["academic-research-skills", "High", "Structures the proposal and grounds significance in the literature."],
    ["doc-coauthoring", "High", "Human-in-the-loop drafting of aims and narrative you keep ownership of."],
    ["humanizer", "Medium", "Remove tell-tale AI phrasing from the prose."],
    ["pdf", "Low", "Pull requirements and prior work out of funder PDFs."]
  ]},
  { p: "Academic Researcher", d: "Academia", t: "Running a systematic literature review", s: [
    ["academic-research-skills", "High", "Purpose-built screen → extract → synthesize research pipeline."],
    ["scientific-agent-skills", "High", "Science agent skills for consistent extraction across many papers."],
    ["notebooklm-py", "Medium", "Summarize and cross-question the corpus with citations."],
    ["graphify", "Low", "Map entities and relationships across the reviewed corpus."]
  ]},
  { p: "PhD Student", d: "Academia", t: "Managing and synthesizing thesis literature", s: [
    ["academic-research-skills", "High", "End-to-end pipeline for staying on top of hundreds of papers."],
    ["notebooklm-py", "High", "Ask your PDF library questions and get citations you can verify."],
    ["graphify", "Medium", "Build a searchable knowledge graph of your reading."],
    ["doc-coauthoring", "Low", "Draft chapters with a human-in-the-loop workflow."]
  ]},
  { p: "PhD Student", d: "Academia", t: "Building research prototypes with AI coding agents", s: [
    ["CLAUDE.md", "High", "Govern the coding agent's behavior and conventions on your repo."],
    ["planning-with-files", "High", "Crash-proof file-based planning for long research coding runs."],
    ["awesome-claude-code", "Medium", "Curated skills and tooling to build prototypes faster."],
    ["scientific-agent-skills", "Medium", "Science-specific skills for baselines and experiment harnesses."],
    ["claude-api", "Low", "Reference for wiring the model into your prototype."]
  ]},
  { p: "Research Scientist (Wet Lab)", d: "Scientific Research", t: "Designing experiments and automating lab records", s: [
    ["scientific-agent-skills", "High", "Science agent skills for protocol design and analysis."],
    ["pdf", "High", "Digitize instrument printouts and notebooks into searchable records."],
    ["academic-research-skills", "Medium", "Mine methods and prior protocols from the literature."],
    ["xlsx", "Low", "Structure and clean tabular results for later analysis."]
  ]},
  { p: "Research Scientist (Wet Lab)", d: "Scientific Research", t: "Building a reproducible data analysis pipeline", s: [
    ["scientific-agent-skills", "High", "Science-focused skills for reproducible, versioned analysis."],
    ["planning-with-files", "High", "Persistent planning keeps long analysis runs reproducible."],
    ["CLAUDE.md", "Medium", "Govern the coding agent's behavior on the analysis repo."],
    ["AI-Research-SKILLs", "Low", "Portable engineering skills for the pipeline code."]
  ]},

  // ---------- Software Engineering ----------
  { p: "Software Engineer", d: "Software Engineering", t: "Developing an AI coding assistant", s: [
    ["claude-api", "High", "The reference for tool use, MCP, caching, and streaming your assistant needs."],
    ["mcp-builder", "High", "Build the MCP servers that give the assistant its tools."],
    ["prompt-master", "High", "Author the system prompts that define its behavior."],
    ["claude-code-infrastructure-showcase", "Medium", "Reference infra for auto-activation, hooks, and multi-agent orchestration."],
    ["webapp-testing", "Medium", "Verify the assistant's UI with Playwright."],
    ["OWASP Top 10 for LLM Apps", "Low", "Baseline security checklist for what you're shipping."]
  ]},
  { p: "Software Engineer", d: "Software Engineering", t: "AI-assisted feature development and code review", s: [
    ["CLAUDE.md", "High", "Govern the coding agent's behavior and conventions on your repo."],
    ["AGENTS.md", "High", "Cross-tool instruction standard so any agent respects your boundaries."],
    ["claude-code-tips", "Medium", "40+ practical tips to get more out of the coding agent."],
    ["planning-with-files", "Medium", "Crash-proof planning for larger multi-step changes."],
    ["awesome-claude-code", "Low", "Curated skills, agents, and tooling to pull from."]
  ]},
  { p: "DevOps / Platform Engineer", d: "Software Engineering", t: "Incident response copilots and AIOps", s: [
    ["mcp-builder", "High", "Expose dashboards and diagnostics to the copilot via MCP."],
    ["Anthropic-Cybersecurity-Skills", "Medium", "817 structured skills for security-relevant triage and log analysis."],
    ["Rebuff", "Medium", "Guard the copilot against injections planted in logs and tickets."],
    ["planning-with-files", "Medium", "Durable planning for long-running remediation runs."],
    ["CLAUDE.md", "Low", "Bound what the copilot may execute automatically."]
  ]},
  { p: "DevOps / Platform Engineer", d: "Software Engineering", t: "Infrastructure-as-code with AI agents", s: [
    ["CLAUDE.md", "High", "Govern what the agent may edit and apply on infra repos."],
    ["AGENTS.md", "High", "Cross-tool boundaries so any agent honors your guardrails."],
    ["planning-with-files", "Medium", "Crash-proof planning for multi-step infra changes."],
    ["claude-code-infrastructure-showcase", "Medium", "Reference patterns for hooks and safe automation."],
    ["awesome-ai-agent-governance", "Low", "Policy-enforcement and audit-trail references for production agents."]
  ]},

  // ---------- Data Science ----------
  { p: "Data Scientist", d: "Data Science", t: "Building an LLM-powered analytics assistant", s: [
    ["claude-api", "High", "Reference for tool use and structured output the assistant relies on."],
    ["mcp-builder", "High", "Expose your warehouse and metrics to the assistant via MCP."],
    ["Guardrails AI", "Medium", "Validate generated queries/answers against rules before they ship."],
    ["xlsx", "Medium", "Let the assistant produce clean spreadsheets and charts."],
    ["graphify", "Low", "Turn schemas and docs into a queryable graph for grounding."]
  ]},
  { p: "Data Scientist", d: "Data Science", t: "Classical ML model development, accelerated by AI", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for feature work and validation."],
    ["CLAUDE.md", "High", "Govern the coding agent on your modeling repo."],
    ["Responsible AI Toolbox", "Medium", "Assess model fairness and reliability before deployment."],
    ["planning-with-files", "Low", "Durable planning for longer experiment runs."]
  ]},
  { p: "ML Engineer", d: "Data Science", t: "Deploying and monitoring LLM applications in production", s: [
    ["NeMo Guardrails", "High", "Programmable input/output guardrails for the production app."],
    ["Guardrails AI", "High", "Validate and correct outputs against structured rules before users see them."],
    ["Rebuff", "High", "Detect prompt injection in anything the app ingests."],
    ["OWASP Top 10 for LLM Apps", "Medium", "Baseline vulnerability checklist for the deployment."],
    ["claude-api", "Medium", "Reference for caching, streaming, and cost controls."]
  ]},
  { p: "ML Engineer", d: "Data Science", t: "Fine-tuning a domain-specific model", s: [
    ["scientific-agent-skills", "High", "ML-focused agent skills for the training and eval loop."],
    ["Responsible AI Toolbox", "High", "Assess the fine-tune's fairness and reliability against the base."],
    ["planning-with-files", "Medium", "Durable planning across long training runs."],
    ["claude-api", "Low", "Reference for serving and comparing against a prompted base model."]
  ]},
  { p: "Data Analyst", d: "Data Science", t: "Natural-language BI and automated reporting", s: [
    ["xlsx", "High", "Generate and clean spreadsheets, formulas, and charts directly."],
    ["marketingskills", "Medium", "Includes analytics skills for reporting workflows."],
    ["prompt-master", "Medium", "Reusable report prompts that keep outputs consistent."],
    ["Guardrails AI", "Low", "Validate generated numbers/queries before circulating them."]
  ]},

  // ---------- Law ----------
  { p: "Corporate Lawyer", d: "Law", t: "Contract review and drafting with AI", s: [
    ["pdf", "High", "Extract and OCR clauses from contract PDFs into workable text."],
    ["Rebuff", "High", "Guard a document-ingesting agent against injected instructions in files."],
    ["doc-coauthoring", "Medium", "Human-in-the-loop redlining keeps the attorney in control."],
    ["EU AI Act", "Medium", "Know the obligations if the tool influences legal decisions."],
    ["awesome-ai-governance", "Low", "Governance references for deploying AI on confidential matters."]
  ]},
  { p: "Corporate Lawyer", d: "Law", t: "Legal research and memo drafting", s: [
    ["academic-research-skills", "High", "A research pipeline adaptable to authority-gathering and synthesis."],
    ["doc-coauthoring", "High", "Draft memos with a human-in-the-loop workflow."],
    ["pdf", "Medium", "Pull text out of filings, cases, and exhibits."],
    ["humanizer", "Low", "Polish AI phrasing in the memo."]
  ]},
  { p: "Paralegal", d: "Law", t: "E-discovery document review", s: [
    ["pdf", "High", "OCR and extract text from the document set before review."],
    ["graphify", "High", "Turn the corpus into a queryable graph of people, entities, and events."],
    ["Rebuff", "Medium", "Protect a review agent from injected instructions in documents."],
    ["Skill_Seekers", "Low", "Convert doc sets and repos into ready-to-use review skills."]
  ]},
  { p: "Paralegal", d: "Law", t: "Case file summarization and citation checking", s: [
    ["pdf", "High", "Extract structured text from filings and exhibits."],
    ["doc-coauthoring", "Medium", "Draft chronologies and summaries under attorney review."],
    ["graphify", "Medium", "Link parties, dates, and documents into a navigable graph."],
    ["humanizer", "Low", "Clean AI phrasing from drafted summaries."]
  ]},

  // ---------- Finance ----------
  { p: "Financial Analyst", d: "Finance", t: "Earnings analysis and report automation", s: [
    ["pdf", "High", "Extract figures and language from filings and transcripts."],
    ["xlsx", "High", "Build and clean the models and charts behind the analysis."],
    ["Guardrails AI", "Medium", "Validate extracted numbers before they enter a memo."],
    ["marketingskills", "Low", "Analytics sub-skills useful for reporting."]
  ]},
  { p: "Quantitative Researcher", d: "Finance", t: "ML-driven signal research and backtesting", s: [
    ["scientific-agent-skills", "High", "ML/science agent skills for research code and validation."],
    ["CLAUDE.md", "High", "Govern the coding agent on the research repo — leakage discipline matters."],
    ["planning-with-files", "Medium", "Durable planning across long backtest builds."],
    ["Responsible AI Toolbox", "Low", "Reliability assessment to guard against overfit signals."]
  ]},
  { p: "Compliance Officer", d: "Finance", t: "AML transaction monitoring and regulatory tracking", s: [
    ["awesome-ai-governance", "High", "Frameworks, regulations, and tools for enterprise AI governance."],
    ["NIST AI Risk Management Framework", "High", "Model-risk governance aligned to supervisory expectations."],
    ["Responsible AI Toolbox", "Medium", "Explainability and fairness auditing for alert models."],
    ["ai-governance-framework-tools", "Medium", "Templates for implementing NIST AI RMF and ISO 42001."],
    ["pdf", "Low", "Extract obligations from regulatory documents."]
  ]},

  // ---------- Education ----------
  { p: "K-12 Teacher", d: "Education", t: "Lesson planning and differentiated materials", s: [
    ["docx", "High", "Generate worksheets, exemplars, and scaffolds as Word documents."],
    ["pptx", "High", "Build differentiated slide decks quickly."],
    ["prompt-master", "Medium", "Reusable prompts that fix grade level and standards."],
    ["Responsible AI Toolbox", "Low", "Sanity-check materials for bias and appropriateness."]
  ]},
  { p: "K-12 Teacher", d: "Education", t: "AI-assisted grading and feedback", s: [
    ["prompt-master", "High", "Rubric-driven prompts for consistent, criterion-referenced feedback."],
    ["NeMo Guardrails", "Medium", "Keep a feedback agent within safe, on-task boundaries."],
    ["Responsible AI Toolbox", "Medium", "Check feedback for systematic bias across writing styles."],
    ["docx", "Low", "Return feedback in editable documents."]
  ]},
  { p: "Instructional Designer", d: "Education", t: "Building adaptive courseware", s: [
    ["NeMo Guardrails", "High", "Keep a tutor agent safe, on-task, and age-appropriate."],
    ["prompt-master", "High", "Pedagogical prompting — Socratic moves and hint ladders."],
    ["web-artifacts-builder", "Medium", "Build interactive courseware artifacts in React/Tailwind."],
    ["Guardrails AI", "Medium", "Validate tutor output against structured rules."],
    ["pptx", "Low", "Produce lesson decks at scale."]
  ]},

  // ---------- Marketing ----------
  { p: "Marketing Manager", d: "Marketing", t: "Running an AI-assisted campaign content pipeline", s: [
    ["marketingskills", "High", "CRO, copywriting, SEO, analytics, and growth skills for agents."],
    ["brand-guidelines", "High", "Keep every generated asset on-brand automatically."],
    ["humanizer", "Medium", "Strip tell-tale AI phrasing from campaign copy."],
    ["canvas-design", "Medium", "Generate on-brand visual assets."],
    ["claude-seo", "Low", "Optimize the content for search."]
  ]},
  { p: "Content Strategist", d: "Marketing", t: "SEO content at scale with brand voice", s: [
    ["claude-seo", "High", "25 sub-skills covering technical SEO and E-E-A-T."],
    ["geo-seo-claude", "High", "Optimize for AI-search citability, not just classic SEO."],
    ["marketingskills", "Medium", "Copywriting and growth skills for the content engine."],
    ["humanizer", "Medium", "Keep AI drafts reading as human, on-voice prose."],
    ["brand-guidelines", "Low", "Hold voice and styling consistent across output."]
  ]},

  // ---------- Manufacturing ----------
  { p: "Manufacturing Engineer", d: "Manufacturing", t: "Deploying visual defect inspection", s: [
    ["Responsible AI Toolbox", "High", "Assess the inspection model's reliability before it gates a line."],
    ["scientific-agent-skills", "High", "Agent skills for the data and evaluation work."],
    ["NIST AI Risk Management Framework", "Medium", "Govern the model's operational risk."],
    ["planning-with-files", "Low", "Durable planning for the build-out."]
  ]},
  { p: "Manufacturing Engineer", d: "Manufacturing", t: "Predictive maintenance program", s: [
    ["scientific-agent-skills", "High", "ML/science agent skills for sensor-data modeling."],
    ["xlsx", "Medium", "Structure and analyze maintenance and sensor records."],
    ["Responsible AI Toolbox", "Medium", "Reliability assessment for the failure models."],
    ["planning-with-files", "Low", "Durable planning across the program build."]
  ]},
  { p: "Quality Engineer", d: "Manufacturing", t: "AI-assisted root-cause analysis and SOP intelligence", s: [
    ["graphify", "High", "Turn SOPs, specs, and NCRs into a queryable knowledge graph."],
    ["pdf", "High", "Digitize decades of quality records into searchable text."],
    ["prompt-master", "Medium", "Structured 5-why / fishbone prompts for disciplined analysis."],
    ["Skill_Seekers", "Low", "Convert SOP docs into ready-to-use agent skills."]
  ]},

  // ---------- Government ----------
  { p: "Policy Analyst", d: "Government", t: "Legislative analysis and briefing generation", s: [
    ["pdf", "High", "Extract text from bills, amendments, and reports."],
    ["internal-comms", "High", "Draft briefings and plain-language summaries."],
    ["academic-research-skills", "Medium", "Gather comparative policy evidence systematically."],
    ["graphify", "Low", "Map relationships across statutes and documents."]
  ]},
  { p: "Policy Analyst", d: "Government", t: "Analyzing public comments at scale", s: [
    ["graphify", "High", "Cluster and map themes across thousands of submissions."],
    ["xlsx", "Medium", "Tally and structure coded comments defensibly."],
    ["prompt-master", "Medium", "Consistent classification prompts for comment coding."],
    ["Rebuff", "Low", "Guard against injected content in submitted text."]
  ]},

  // ---------- Journalism ----------
  { p: "Investigative Journalist", d: "Journalism", t: "Analyzing large document leaks", s: [
    ["graphify", "High", "Turn a messy leak into a queryable graph of people, money, and events."],
    ["pdf", "High", "OCR and extract text from mixed scans and documents."],
    ["Rebuff", "Medium", "Protect the analysis agent from injected instructions in documents."],
    ["Skill_Seekers", "Low", "Convert document sets into ready-to-query skills."]
  ]},
  { p: "Investigative Journalist", d: "Journalism", t: "Verifying synthetic media and AI-generated claims", s: [
    ["Anthropic-Cybersecurity-Skills", "Medium", "Structured skills useful for forensic and provenance work."],
    ["academic-research-skills", "Medium", "A research pipeline for source-tracing and verification."],
    ["humanizer", "Low", "Recognize the tell-tale signs of AI-generated text."],
    ["awesome-ai-governance", "Low", "References on provenance and responsible AI standards."]
  ]},

  // ---------- Design ----------
  { p: "UX Designer", d: "Design", t: "AI-assisted research synthesis and prototyping", s: [
    ["frontend-design", "High", "Guidance for distinctive, intentional UI — not templated output."],
    ["web-artifacts-builder", "High", "Turn ideas into testable React/Tailwind prototypes."],
    ["huashu-design", "Medium", "HTML-native high-fidelity prototyping."],
    ["academic-research-skills", "Low", "Synthesize interviews and research into insights."]
  ]},
  { p: "Graphic Designer", d: "Design", t: "Generative image workflows with brand consistency", s: [
    ["canvas-design", "High", "Create posters and static visual art from a design philosophy."],
    ["brand-guidelines", "High", "Constrain generation to your brand colors and type."],
    ["algorithmic-art", "Medium", "Generative art with p5.js for distinctive visuals."],
    ["hallmark", "Medium", "Anti-AI-slop skill that pushes toward distinctive design."],
    ["theme-factory", "Low", "Apply consistent visual themes across artifacts."]
  ]},

  // ---------- Cybersecurity ----------
  { p: "SOC Analyst", d: "Cybersecurity", t: "AI-driven alert triage and investigation", s: [
    ["Anthropic-Cybersecurity-Skills", "High", "817 skills mapped to MITRE ATT&CK and NIST CSF for triage."],
    ["MITRE ATT&CK Navigator", "High", "Map and govern the attack surface against known techniques."],
    ["Rebuff", "High", "Guard the copilot against injections planted in logs and tickets."],
    ["mcp-builder", "Medium", "Expose SIEM and diagnostics to the copilot via MCP."],
    ["OWASP Top 10 for LLM Apps", "Low", "Baseline for securing the copilot itself."]
  ]},
  { p: "Penetration Tester", d: "Cybersecurity", t: "Red-teaming AI systems (authorized engagements)", s: [
    ["OWASP Top 10 for LLM Apps", "High", "The baseline vulnerability checklist to test against."],
    ["Anthropic-Cybersecurity-Skills", "High", "Structured offensive/defensive skills mapped to frameworks."],
    ["Rebuff", "High", "Understand and probe prompt-injection defenses."],
    ["Llama Guard / PurpleLlama", "Medium", "Score prompts and outputs against a harm taxonomy while testing."],
    ["MITRE ATT&CK Navigator", "Low", "Structure findings against adversary techniques."]
  ]},

  // ---------- Biology / Chemistry / Drug Discovery ----------
  { p: "Molecular Biologist", d: "Biology", t: "Protein structure prediction and design", s: [
    ["scientific-agent-skills", "High", "The largest science agent-skills library for structural work."],
    ["AI-Research-SKILLs", "Medium", "Portable research/engineering skills for the analysis."],
    ["planning-with-files", "Medium", "Durable planning across long design-analysis runs."],
    ["academic-research-skills", "Low", "Ground designs in prior structural evidence."]
  ]},
  { p: "Bioinformatician", d: "Biology", t: "Building NGS and single-cell analysis pipelines", s: [
    ["scientific-agent-skills", "High", "Science agent skills for omics pipeline work."],
    ["CLAUDE.md", "High", "Govern the coding agent on the pipeline repo."],
    ["planning-with-files", "Medium", "Crash-proof planning for long pipeline builds."],
    ["graphify", "Low", "Link genes, pathways, and phenotypes for interpretation."]
  ]},
  { p: "Medicinal Chemist", d: "Chemistry", t: "Generative molecule optimization", s: [
    ["scientific-agent-skills", "High", "Chemistry/science agent skills for design and screening."],
    ["AI-Research-SKILLs", "Medium", "Portable skills for the modeling code."],
    ["academic-research-skills", "Medium", "Ground candidates in prior activity/ADMET evidence."],
    ["planning-with-files", "Low", "Durable planning across design-test cycles."]
  ]},
  { p: "Computational Chemist", d: "Chemistry", t: "High-throughput virtual screening with ML", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for screening workflows."],
    ["CLAUDE.md", "High", "Govern the coding agent on the screening repo."],
    ["planning-with-files", "Medium", "Durable planning for large screening runs."],
    ["Responsible AI Toolbox", "Low", "Reliability checks so models don't just fit history."]
  ]},
  { p: "Drug Discovery Scientist", d: "Drug Discovery", t: "Target identification with knowledge graphs", s: [
    ["graphify", "High", "Turn omics, papers, and configs into a queryable target-reasoning graph."],
    ["scientific-agent-skills", "High", "Science agent skills for hypothesis and evidence work."],
    ["academic-research-skills", "Medium", "Comprehensive prior-evidence gathering for each target."],
    ["notebooklm-py", "Low", "Grounded synthesis over the target literature."]
  ]},
  { p: "Security Analyst", d: "Cybersecurity", t: "SOC alert triage with AI copilots", s: [
    ["Anthropic-Cybersecurity-Skills", "High", "817 structured skills mapped to ATT&CK and NIST CSF."],
    ["MITRE ATT&CK Navigator", "High", "Map alerts to adversary techniques."],
    ["Rebuff", "High", "Guard the copilot against injections in logs and tickets."],
    ["mcp-builder", "Medium", "Wire dashboards and diagnostics into the copilot."],
    ["OWASP Top 10 for LLM Apps", "Low", "Secure the copilot itself."]
  ]},
  { p: "AI Red Teamer", d: "Cybersecurity", t: "Testing LLM applications for vulnerabilities", s: [
    ["OWASP Top 10 for LLM Apps", "High", "The canonical LLM vulnerability checklist to test against."],
    ["Rebuff", "High", "Probe and validate prompt-injection defenses."],
    ["Llama Guard / PurpleLlama", "High", "Score prompts/outputs against a harm taxonomy."],
    ["Anthropic-Cybersecurity-Skills", "Medium", "Structured skills for systematic testing."],
    ["NeMo Guardrails", "Low", "Know exactly what guardrails claim to enforce."]
  ]},
  { p: "Computational Biologist", d: "Biology", t: "AI-assisted protein design and analysis", s: [
    ["scientific-agent-skills", "High", "The largest science agent-skills library for structural work."],
    ["CLAUDE.md", "High", "Govern the coding agent on the analysis repo."],
    ["planning-with-files", "Medium", "Durable planning across long runs."],
    ["academic-research-skills", "Low", "Ground designs in prior structural/functional evidence."]
  ]},
  { p: "Medicinal Chemist", d: "Chemistry", t: "AI-guided molecule design and screening", s: [
    ["scientific-agent-skills", "High", "Chemistry/science agent skills for design and screening."],
    ["AI-Research-SKILLs", "Medium", "Portable skills for the modeling code."],
    ["planning-with-files", "Medium", "Durable planning across design-test cycles."],
    ["academic-research-skills", "Low", "Ground candidates in prior evidence."]
  ]},
  { p: "Drug Discovery Scientist", d: "Drug Discovery", t: "Target identification and hit-to-lead with AI", s: [
    ["graphify", "High", "Queryable graph linking genes, disease, and compounds."],
    ["scientific-agent-skills", "High", "Science agent skills for the discovery workflow."],
    ["academic-research-skills", "Medium", "Comprehensive prior-evidence gathering."],
    ["notebooklm-py", "Low", "Grounded synthesis over internal and public corpora."]
  ]},

  // ---------- Robotics / Climate ----------
  { p: "Robotics Engineer", d: "Robotics", t: "Building perception and manipulation with foundation models", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for perception and policy work."],
    ["CLAUDE.md", "High", "Govern the coding agent across the robotics stack."],
    ["planning-with-files", "Medium", "Durable planning for long training/eval runs."],
    ["AI-Research-SKILLs", "Low", "Portable research skills for the modeling code."]
  ]},
  { p: "Climate Scientist", d: "Climate Science", t: "ML emulation and downscaling of climate models", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for emulation and analysis."],
    ["CLAUDE.md", "High", "Govern the coding agent on the modeling repo."],
    ["planning-with-files", "Medium", "Durable planning for long analysis runs."],
    ["academic-research-skills", "Low", "Ground methods and validation in the literature."]
  ]},

  // ---------- Operations ----------
  { p: "Operations Manager", d: "Operations", t: "Demand forecasting and process automation", s: [
    ["xlsx", "High", "Build forecasts and clean operational data directly."],
    ["mcp-builder", "Medium", "Wire the agent into your operational systems."],
    ["planning-with-files", "Medium", "Durable planning for automation build-outs."],
    ["internal-comms", "Low", "Auto-draft status and operational updates."]
  ]},
  { p: "Supply Chain Manager", d: "Operations", t: "AI-optimized inventory and logistics", s: [
    ["xlsx", "High", "Model inventory and logistics data with formulas and charts."],
    ["scientific-agent-skills", "Medium", "ML/OR agent skills for forecasting and optimization."],
    ["mcp-builder", "Medium", "Connect the agent to planning and ERP systems."],
    ["planning-with-files", "Low", "Durable planning for multi-step optimization."]
  ]},

  // ---------- Customer Support ----------
  { p: "Customer Support Lead", d: "Customer Support", t: "Deploying an AI support agent", s: [
    ["NeMo Guardrails", "High", "Programmable dialog guardrails and safe-response rules."],
    ["Guardrails AI", "High", "Validate answers against policy before they reach a customer."],
    ["Rebuff", "High", "Detect prompt injection in customer-supplied content."],
    ["mcp-builder", "Medium", "Ground the agent in help docs and account tools via MCP."],
    ["OWASP Top 10 for LLM Apps", "Low", "Secure the deployment against common risks."]
  ]},

  // ---------- Sales ----------
  { p: "Sales Representative", d: "Sales", t: "AI-assisted prospecting and outreach", s: [
    ["marketingskills", "High", "Copywriting and growth skills for outreach at scale."],
    ["prompt-master", "High", "Personalized-at-scale outreach lives on prompt quality."],
    ["humanizer", "Medium", "Keep outreach reading human, not templated."],
    ["mcp-builder", "Low", "Wire account and CRM data into the agent."]
  ]},

  // ---------- Human Resources ----------
  { p: "HR Manager", d: "Human Resources", t: "AI-assisted hiring and workforce analytics", s: [
    ["EU AI Act", "High", "Hiring AI is high-risk under the Act — import its obligations."],
    ["Responsible AI Toolbox", "High", "Audit screening tools for bias, as law increasingly requires."],
    ["awesome-ai-governance", "Medium", "Frameworks for governing automated employment decisions."],
    ["pm-claude-skills", "Low", "Includes compliance and CV-related professional skills."]
  ]},

  // ---------- Product ----------
  { p: "Product Manager", d: "Product", t: "Designing AI-powered product workflows", s: [
    ["pm-claude-skills", "High", "515 PM Agent Skills for PRDs, launches, and compliance."],
    ["prompt-master", "High", "The prompt is now a product spec — author it well."],
    ["CLAUDE.md", "Medium", "Govern how the product's agent behaves."],
    ["awesome-ai-agent-governance", "Medium", "Policy-enforcement and audit references for agentic products."],
    ["mcp-builder", "Low", "Understand how tools connect into the workflow."]
  ]},
  { p: "Product Manager", d: "Product", t: "Scoping and shipping an LLM feature", s: [
    ["pm-claude-skills", "High", "PRD, launch, and compliance skills for shipping the feature."],
    ["Guardrails AI", "High", "Define output/scope guardrails as product requirements."],
    ["EU AI Act", "Medium", "Know the obligations the feature triggers before launch."],
    ["claude-api", "Low", "Reference for the cost, latency, and capability trade-offs."]
  ]},
  { p: "AI Platform Engineer", d: "Product", t: "Building an internal LLM gateway", s: [
    ["NeMo Guardrails", "High", "Centralize programmable guardrails at the gateway."],
    ["Rebuff", "High", "Enforce injection defenses org-wide at the gateway."],
    ["mcp-builder", "High", "Standardize how internal tools connect to every model."],
    ["claude-api", "Medium", "Reference for routing, caching, and streaming."],
    ["awesome-ai-agent-governance", "Low", "Audit-trail and policy references for the platform."]
  ]},

  // ---------- Healthcare (expanded personas) ----------
  { p: "Pharmacist", d: "Healthcare", t: "AI-assisted medication review and interaction checking", s: [
    ["NeMo Guardrails", "High", "Keep an interaction-checking agent from asserting unverified guidance."],
    ["EU AI Act", "High", "Medication-safety AI carries high-risk obligations."],
    ["Responsible AI Toolbox", "Medium", "Assess reliability before it informs dispensing."],
    ["pdf", "Low", "Pull medication data from records and references."]
  ]},
  { p: "Public Health Epidemiologist", d: "Healthcare", t: "Outbreak surveillance and forecasting", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for surveillance and forecasting."],
    ["CLAUDE.md", "High", "Govern the coding agent on the modeling repo."],
    ["xlsx", "Medium", "Structure and analyze surveillance data."],
    ["academic-research-skills", "Low", "Ground methods in the epidemiological literature."]
  ]},
  { p: "Clinical Trial Coordinator", d: "Healthcare", t: "Patient recruitment and eligibility matching", s: [
    ["pdf", "High", "Extract eligibility signals from referrals and outside records."],
    ["EU AI Act", "High", "Screening on patient data is high-risk and consent-bound."],
    ["Rebuff", "Medium", "Guard a record-ingesting agent against injected content."],
    ["xlsx", "Low", "Track and structure screening results."]
  ]},
  { p: "Nurse Informaticist", d: "Healthcare", t: "Deploying clinical documentation and alerting tools", s: [
    ["NeMo Guardrails", "High", "Bound alerting and documentation agents safely into workflow."],
    ["EU AI Act", "High", "Clinical tools carry high-risk obligations."],
    ["Responsible AI Toolbox", "Medium", "Audit alerting for bias across patient groups."],
    ["CLAUDE.md", "Low", "Scope what the documentation agent may do."]
  ]},
  { p: "Mental Health Therapist", d: "Healthcare", t: "Using AI for notes and between-session support tools", s: [
    ["NeMo Guardrails", "High", "Essential safety and escalation guardrails for any patient-facing tool."],
    ["EU AI Act", "High", "Mental-health AI is high-risk and highly sensitive."],
    ["doc-coauthoring", "Medium", "Supervised note-drafting keeps the clinician the author."],
    ["Responsible AI Toolbox", "Low", "Check reliability before relying on summaries."]
  ]},

  // ---------- Academia (expanded) ----------
  { p: "University Professor", d: "Academia", t: "Designing AI-integrated courses and assessment policy", s: [
    ["awesome-ai-governance", "High", "References for setting academic AI-use and integrity policy."],
    ["academic-research-skills", "Medium", "Model good research/AI practice for students."],
    ["docx", "Medium", "Generate syllabi, assessments, and materials."],
    ["Responsible AI Toolbox", "Low", "Frame responsible-use expectations concretely."]
  ]},
  { p: "Peer Reviewer", d: "Academia", t: "AI-assisted manuscript review", s: [
    ["academic-research-skills", "High", "A structured pipeline for rigorous appraisal."],
    ["pdf", "Medium", "Extract and check claims and figures from the manuscript."],
    ["awesome-ai-governance", "Low", "Confidentiality/disclosure norms for AI use in review."],
    ["humanizer", "Low", "Phrase feedback cleanly; the judgment stays yours."]
  ]},
  { p: "Research Software Engineer", d: "Academia", t: "Building reproducible research infrastructure", s: [
    ["CLAUDE.md", "High", "Govern coding agents across research repos."],
    ["planning-with-files", "High", "Crash-proof planning for long infra builds."],
    ["scientific-agent-skills", "Medium", "Science-specific skills for pipelines and baselines."],
    ["claude-code-infrastructure-showcase", "Low", "Reference patterns for hooks and orchestration."]
  ]},

  // ---------- Scientific Research (expanded) ----------
  { p: "Materials Scientist", d: "Scientific Research", t: "AI-accelerated materials discovery", s: [
    ["scientific-agent-skills", "High", "The largest science agent-skills library for discovery work."],
    ["AI-Research-SKILLs", "Medium", "Portable skills for property-prediction code."],
    ["planning-with-files", "Medium", "Durable planning across long discovery loops."],
    ["academic-research-skills", "Low", "Ground candidates in prior materials literature."]
  ]},
  { p: "Bioinformatician", d: "Biology", t: "Single-cell and omics analysis with AI", s: [
    ["scientific-agent-skills", "High", "Science agent skills for omics workflows."],
    ["CLAUDE.md", "High", "Govern the coding agent on the analysis repo."],
    ["planning-with-files", "Medium", "Crash-proof planning for long pipeline runs."],
    ["graphify", "Low", "Link genes, pathways, and phenotypes for interpretation."]
  ]},

  // ---------- Software Engineering (expanded) ----------
  { p: "Frontend Engineer", d: "Software Engineering", t: "AI-assisted UI development", s: [
    ["frontend-design", "High", "Guidance for distinctive, intentional UI — not templated output."],
    ["web-artifacts-builder", "High", "Build multi-component React/Tailwind/shadcn artifacts."],
    ["webapp-testing", "Medium", "Verify the UI with Playwright screenshots and logs."],
    ["hallmark", "Medium", "Anti-AI-slop skill that pushes toward distinctive UI."],
    ["CLAUDE.md", "Low", "Govern the coding agent's conventions on the repo."]
  ]},
  { p: "QA / Test Engineer", d: "Software Engineering", t: "AI-driven test generation and coverage", s: [
    ["webapp-testing", "High", "Playwright-based testing — screenshots, logs, UI verification."],
    ["CLAUDE.md", "High", "Govern the agent that writes and maintains tests."],
    ["planning-with-files", "Medium", "Durable planning for large test build-outs."],
    ["awesome-claude-code", "Low", "Curated testing and QA skills to pull from."]
  ]},
  { p: "Application Security Engineer", d: "Software Engineering", t: "Securing AI features and reviewing code with AI", s: [
    ["OWASP Top 10 for LLM Apps", "High", "The baseline LLM/agent vulnerability checklist."],
    ["Rebuff", "High", "Detect prompt injection in anything a feature ingests."],
    ["Anthropic-Cybersecurity-Skills", "High", "817 structured security skills for code and system review."],
    ["Llama Guard / PurpleLlama", "Medium", "Score prompts and outputs against a harm taxonomy."],
    ["NeMo Guardrails", "Low", "Know what output guardrails claim to enforce."]
  ]},
  { p: "Technical Writer", d: "Software Engineering", t: "AI-assisted documentation at scale", s: [
    ["doc-coauthoring", "High", "Structured human-in-the-loop doc workflow."],
    ["graphify", "High", "Turn the codebase and specs into a queryable source for grounded docs."],
    ["humanizer", "Medium", "Keep AI drafts reading as clean human prose."],
    ["docx", "Low", "Produce and edit polished document deliverables."]
  ]},

  // ---------- Data Science (expanded) ----------
  { p: "Data Engineer", d: "Data Science", t: "Building data pipelines for RAG and AI systems", s: [
    ["mcp-builder", "High", "Expose data sources to agents through MCP servers."],
    ["graphify", "High", "Turn schemas, docs, and configs into a queryable graph."],
    ["pdf", "Medium", "Parse source documents into clean chunks upstream of RAG."],
    ["CLAUDE.md", "Medium", "Govern the coding agent on pipeline repos."],
    ["planning-with-files", "Low", "Durable planning for long pipeline builds."]
  ]},
  { p: "Analytics Engineer", d: "Data Science", t: "Semantic layer and natural-language analytics", s: [
    ["mcp-builder", "High", "Expose the semantic layer to the analytics agent."],
    ["xlsx", "High", "Generate and validate spreadsheet outputs and charts."],
    ["Guardrails AI", "Medium", "Validate generated queries against rules before they run."],
    ["graphify", "Low", "Model metric and column relationships for grounding."]
  ]},

  // ---------- Law (expanded) ----------
  { p: "Privacy & Compliance Counsel", d: "Law", t: "Standing up an AI governance program", s: [
    ["EU AI Act", "High", "The binding regulation your program must satisfy."],
    ["NIST AI Risk Management Framework", "High", "The risk backbone for the whole program."],
    ["awesome-ai-governance", "High", "Curated frameworks, standards, and tools for enterprise governance."],
    ["ai-governance-framework-tools", "Medium", "Templates for implementing NIST AI RMF and ISO 42001."],
    ["Responsible AI Toolbox", "Low", "Concrete fairness/reliability assessment tooling to require."]
  ]},
  { p: "Patent Agent", d: "Law", t: "Prior-art search and patent drafting", s: [
    ["academic-research-skills", "High", "A research pipeline for comprehensive prior-art search."],
    ["pdf", "High", "Extract claims and references from patent PDFs."],
    ["graphify", "Medium", "Map relationships across references and claims."],
    ["doc-coauthoring", "Low", "Draft applications with a human-in-the-loop workflow."]
  ]},

  // ---------- Finance (expanded) ----------
  { p: "Financial Advisor", d: "Finance", t: "AI-assisted client research and planning prep", s: [
    ["pdf", "High", "Extract data from statements, filings, and product docs."],
    ["Guardrails AI", "High", "Validate outputs before they inform any client-facing work."],
    ["awesome-ai-governance", "Medium", "Suitability, disclosure, and governance references."],
    ["xlsx", "Low", "Model and organize the planning inputs."]
  ]},
  { p: "Auditor", d: "Finance", t: "AI-assisted audit analytics", s: [
    ["xlsx", "High", "Full-population testing and evidence analysis in spreadsheets."],
    ["pdf", "High", "Extract evidence from contracts, invoices, and confirmations."],
    ["Responsible AI Toolbox", "Medium", "Explainable, defensible model-driven findings."],
    ["awesome-ai-governance", "Low", "References for auditing AI-driven controls."]
  ]},
  { p: "Actuary", d: "Finance", t: "ML-enhanced risk and pricing models", s: [
    ["scientific-agent-skills", "High", "ML/science agent skills for pricing and reserving models."],
    ["Responsible AI Toolbox", "High", "Explainability and fairness auditing for pricing models."],
    ["EU AI Act", "Medium", "Insurance pricing can be high-risk — know the obligations."],
    ["CLAUDE.md", "Low", "Govern the coding agent on the modeling repo."]
  ]},

  // ---------- Education (expanded) ----------
  { p: "EdTech Product Manager", d: "Education", t: "Building an AI tutoring product", s: [
    ["NeMo Guardrails", "High", "Age-appropriateness and safety guardrails as product requirements."],
    ["pm-claude-skills", "High", "PRD, launch, and compliance skills for shipping the product."],
    ["Guardrails AI", "Medium", "Validate tutor output against structured rules."],
    ["Responsible AI Toolbox", "Medium", "Assess fairness across learners before launch."],
    ["web-artifacts-builder", "Low", "Build interactive tutoring artifacts."]
  ]},
  { p: "Academic Advisor", d: "Education", t: "Student success and early-warning analytics", s: [
    ["Responsible AI Toolbox", "High", "Early-warning models can entrench bias — audit them."],
    ["EU AI Act", "Medium", "Profiling students can trigger high-risk obligations."],
    ["xlsx", "Medium", "Structure and analyze the student-success data."],
    ["awesome-ai-governance", "Low", "Governance references for fair, private student analytics."]
  ]},

  // ---------- Marketing (expanded) ----------
  { p: "Social Media Manager", d: "Marketing", t: "AI content and community management", s: [
    ["marketingskills", "High", "Copywriting, growth, and analytics skills for social."],
    ["slack-gif-creator", "Medium", "Produce optimized animated GIFs for posts and comms."],
    ["canvas-design", "Medium", "Generate on-brand visual assets."],
    ["humanizer", "Medium", "Keep posts reading human, not templated."],
    ["brand-guidelines", "Low", "Hold voice and styling consistent."]
  ]},
  { p: "Growth / Performance Marketer", d: "Marketing", t: "AI-driven experimentation and targeting", s: [
    ["marketingskills", "High", "CRO, growth engineering, and analytics skills."],
    ["claude-seo", "Medium", "Technical SEO and E-E-A-T for organic performance."],
    ["geo-seo-claude", "Medium", "Optimize for AI-search citability."],
    ["xlsx", "Low", "Analyze experiment results."]
  ]},
  { p: "Market Research Analyst", d: "Marketing", t: "AI-assisted survey and voice-of-customer analysis", s: [
    ["graphify", "High", "Cluster and map themes across open-ended responses."],
    ["xlsx", "High", "Code, tally, and analyze survey data."],
    ["marketingskills", "Medium", "Analytics sub-skills for VoC work."],
    ["prompt-master", "Low", "Consistent classification prompts for response coding."]
  ]},

  // ---------- Manufacturing / Design (expanded) ----------
  { p: "Process Engineer", d: "Manufacturing", t: "Simulation-based process optimization", s: [
    ["scientific-agent-skills", "High", "Science/OR agent skills for optimization and analysis."],
    ["xlsx", "Medium", "Model process data, DOE, and SPC."],
    ["planning-with-files", "Medium", "Durable planning for optimization build-outs."],
    ["Responsible AI Toolbox", "Low", "Reliability checks on the process models."]
  ]},
  { p: "Industrial Designer", d: "Design", t: "Generative design for physical products", s: [
    ["canvas-design", "High", "Generate concept visuals and renders."],
    ["algorithmic-art", "Medium", "Generative form exploration with p5.js."],
    ["frontend-design", "Medium", "Design-craft guidance for distinctive results."],
    ["theme-factory", "Low", "Apply consistent visual themes across concepts."]
  ]},

  // ---------- Government (expanded) ----------
  { p: "Urban Planner", d: "Government", t: "AI for land use and mobility planning", s: [
    ["graphify", "High", "Model relationships across land use, zoning, and mobility data."],
    ["xlsx", "Medium", "Analyze demand, traffic, and growth projections."],
    ["Responsible AI Toolbox", "Medium", "Assess distributional/equity effects of planning models."],
    ["academic-research-skills", "Low", "Gather comparative planning evidence."]
  ]},
  { p: "Public Sector Data Officer", d: "Government", t: "Responsible AI adoption across agencies", s: [
    ["EU AI Act", "High", "Public-sector AI faces the strictest obligations."],
    ["NIST AI Risk Management Framework", "High", "The risk framework to standardize across agencies."],
    ["Responsible AI Toolbox", "High", "Concrete fairness/reliability auditing to mandate."],
    ["awesome-ai-governance", "Medium", "Curated frameworks and regulations for the program."],
    ["ai-governance-framework-tools", "Low", "Implementation templates for NIST AI RMF and ISO 42001."]
  ]},
  { p: "Emergency Management Analyst", d: "Government", t: "AI-assisted disaster response", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for hazard forecasting and analysis."],
    ["graphify", "Medium", "Fuse reports, maps, and records into a queryable picture."],
    ["mcp-builder", "Medium", "Connect the agent to live data and mapping systems."],
    ["planning-with-files", "Low", "Durable planning during extended response operations."]
  ]},

  // ---------- Journalism (expanded) ----------
  { p: "News Editor", d: "Journalism", t: "Setting newsroom AI workflows and standards", s: [
    ["awesome-ai-governance", "High", "References for newsroom AI-use, sourcing, and disclosure policy."],
    ["humanizer", "Medium", "Keep AI-assisted copy on-voice and human."],
    ["internal-comms", "Medium", "Draft standards and editorial communications."],
    ["Responsible AI Toolbox", "Low", "Frame responsible-use expectations concretely."]
  ]},
  { p: "Data Journalist", d: "Journalism", t: "Data-driven investigative stories", s: [
    ["xlsx", "High", "Clean, analyze, and chart the datasets behind the story."],
    ["graphify", "High", "Map entities and relationships across records."],
    ["pdf", "Medium", "Extract data from disclosures and filings."],
    ["academic-research-skills", "Low", "Verify and source findings rigorously."]
  ]},

  // ---------- Design (expanded) ----------
  { p: "Product Designer", d: "Design", t: "Designing AI-native product experiences", s: [
    ["frontend-design", "High", "Guidance for distinctive, intentional product UI."],
    ["web-artifacts-builder", "High", "Turn ideas into testable prototypes fast."],
    ["huashu-design", "Medium", "HTML-native high-fidelity prototyping."],
    ["hallmark", "Medium", "Push toward distinctive, non-slop design."],
    ["NeMo Guardrails", "Low", "Shape safe behavior for conversational surfaces."]
  ]},
  { p: "Motion / Video Creator", d: "Design", t: "Generative video and motion workflows", s: [
    ["algorithmic-art", "High", "Generative visuals and motion with p5.js."],
    ["canvas-design", "High", "Produce visual assets and frames."],
    ["slack-gif-creator", "Medium", "Create optimized animated GIFs."],
    ["brand-guidelines", "Low", "Keep generated motion assets on-brand."]
  ]},

  // ---------- Cybersecurity (expanded) ----------
  { p: "AI Security Engineer", d: "Cybersecurity", t: "Securing LLM and agentic systems", s: [
    ["Rebuff", "High", "Prompt-injection detection is the defining control for LLM apps."],
    ["OWASP Top 10 for LLM Apps", "High", "The baseline vulnerability checklist to defend against."],
    ["Llama Guard / PurpleLlama", "High", "Score prompts and outputs against a harm taxonomy."],
    ["NeMo Guardrails", "Medium", "Programmable input/output/dialog guardrails."],
    ["Anthropic-Cybersecurity-Skills", "Low", "Structured skills for the broader security work."]
  ]},
  { p: "GRC Analyst", d: "Cybersecurity", t: "Mapping AI systems to risk and compliance frameworks", s: [
    ["NIST AI Risk Management Framework", "High", "The framework you map systems onto."],
    ["EU AI Act", "High", "The binding regulation to classify systems against."],
    ["awesome-ai-agent-governance", "High", "Policy-enforcement, audit-trail, and EU AI Act references."],
    ["ai-governance-framework-tools", "Medium", "Templates for NIST AI RMF and ISO 42001."],
    ["Responsible AI Toolbox", "Low", "Concrete assessment evidence for high-risk systems."]
  ]},
  { p: "Incident Responder", d: "Cybersecurity", t: "AI-assisted investigation and forensics", s: [
    ["Anthropic-Cybersecurity-Skills", "High", "817 structured skills for investigation and forensics."],
    ["MITRE ATT&CK Navigator", "High", "Localize the intrusion against adversary techniques."],
    ["Rebuff", "Medium", "Guard the copilot against injections in logs."],
    ["graphify", "Medium", "Map indicators, hosts, and events into a queryable graph."],
    ["mcp-builder", "Low", "Wire forensic data sources into the agent."]
  ]},

  // ---------- Biology / Chemistry / Drug Discovery (expanded) ----------
  { p: "Genomics Researcher", d: "Biology", t: "Variant interpretation with AI", s: [
    ["scientific-agent-skills", "High", "Science agent skills for variant and sequence analysis."],
    ["graphify", "Medium", "Link genes, variants, and disease for interpretation."],
    ["CLAUDE.md", "Medium", "Govern the coding agent on the analysis repo."],
    ["academic-research-skills", "Low", "Ground interpretation in the literature."]
  ]},
  { p: "Synthetic Biologist", d: "Biology", t: "AI-guided protein and pathway design", s: [
    ["scientific-agent-skills", "High", "The largest science agent-skills library for design work."],
    ["planning-with-files", "Medium", "Durable planning across design-build-test cycles."],
    ["CLAUDE.md", "Medium", "Govern coding agents on the design pipeline."],
    ["academic-research-skills", "Low", "Ground designs in prior evidence."]
  ]},
  { p: "Analytical Chemist", d: "Chemistry", t: "AI for spectral and signal interpretation", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for spectral pattern models."],
    ["CLAUDE.md", "Medium", "Govern the coding agent on the analysis repo."],
    ["xlsx", "Medium", "Structure and analyze instrument outputs."],
    ["Responsible AI Toolbox", "Low", "Calibration and reliability checks on the models."]
  ]},
  { p: "Regulatory Affairs Specialist", d: "Drug Discovery", t: "AI-assisted regulatory submissions", s: [
    ["pdf", "High", "Assemble and extract from vast submission document sets."],
    ["doc-coauthoring", "High", "Draft submissions with a human-in-the-loop workflow."],
    ["EU AI Act", "Medium", "Understand AI-related obligations in submissions."],
    ["awesome-ai-governance", "Low", "Governance references relevant to regulated AI."]
  ]},

  // ---------- Robotics / Climate (expanded) ----------
  { p: "Autonomous Vehicle Engineer", d: "Robotics", t: "Perception and planning for self-driving", s: [
    ["scientific-agent-skills", "High", "Science/ML agent skills for perception and planning."],
    ["CLAUDE.md", "High", "Govern coding agents across the AV stack."],
    ["planning-with-files", "Medium", "Durable planning for long training/eval runs."],
    ["Responsible AI Toolbox", "Low", "Reliability assessment for safety-critical models."]
  ]},
  { p: "Sustainability Analyst", d: "Climate Science", t: "Carbon accounting and ESG reporting with AI", s: [
    ["pdf", "High", "Extract emissions data from invoices, bills, and supplier docs."],
    ["xlsx", "High", "Build emissions inventories and ESG calculations."],
    ["awesome-ai-governance", "Medium", "Governance references for defensible ESG/AI reporting."],
    ["doc-coauthoring", "Low", "Draft disclosures grounded in source records."]
  ]},
  { p: "Energy Analyst", d: "Climate Science", t: "Grid load forecasting and optimization", s: [
    ["scientific-agent-skills", "High", "Science/ML/OR agent skills for forecasting and dispatch."],
    ["xlsx", "Medium", "Analyze load and generation data."],
    ["CLAUDE.md", "Medium", "Govern the coding agent on the modeling repo."],
    ["planning-with-files", "Low", "Durable planning for optimization build-outs."]
  ]},

  // ---------- Operations (expanded) ----------
  { p: "Business Analyst", d: "Operations", t: "AI-assisted process discovery and automation", s: [
    ["graphify", "High", "Reconstruct and query real process flows from logs and docs."],
    ["xlsx", "High", "Quantify opportunities from operational data."],
    ["mcp-builder", "Medium", "Wire the agent into operational systems for automation."],
    ["internal-comms", "Low", "Draft findings and process documentation."]
  ]},
  { p: "Project Manager", d: "Operations", t: "AI-assisted planning, status, and reporting", s: [
    ["pm-claude-skills", "High", "Professional PM Agent Skills for PRDs, launches, and reporting."],
    ["internal-comms", "High", "Draft status reports and stakeholder updates."],
    ["planning-with-files", "Medium", "Durable planning for multi-step projects."],
    ["docx", "Low", "Produce polished planning and status documents."]
  ]},

  // ---------- Customer Support / Sales / HR (expanded) ----------
  { p: "CX Analyst", d: "Customer Support", t: "Voice-of-customer analytics", s: [
    ["graphify", "High", "Cluster and map issue themes across channels."],
    ["xlsx", "High", "Tag, tally, and chart feedback data."],
    ["marketingskills", "Medium", "Analytics sub-skills for VoC work."],
    ["prompt-master", "Low", "Consistent classification prompts for tagging."]
  ]},
  { p: "Sales Engineer", d: "Sales", t: "AI-assisted demos and technical qualification", s: [
    ["mcp-builder", "High", "Build demo assistants and POCs that call real tools."],
    ["prompt-master", "High", "Tailor technical narratives to each prospect."],
    ["web-artifacts-builder", "Medium", "Spin up interactive demo artifacts fast."],
    ["Guardrails AI", "Low", "Keep demo assistants from overclaiming."]
  ]},
  { p: "RevOps Analyst", d: "Sales", t: "Pipeline forecasting and lead scoring", s: [
    ["xlsx", "High", "Build forecasts and scoring analyses in spreadsheets."],
    ["mcp-builder", "Medium", "Wire CRM and warehouse data into the agent."],
    ["marketingskills", "Medium", "Analytics and growth-engineering sub-skills."],
    ["scientific-agent-skills", "Low", "ML agent skills for scoring models."]
  ]},
  { p: "Recruiter", d: "Human Resources", t: "AI-assisted sourcing and screening", s: [
    ["EU AI Act", "High", "Screening AI is high-risk — import its obligations."],
    ["Responsible AI Toolbox", "High", "Audit screening tools for bias, as law increasingly requires."],
    ["awesome-ai-governance", "Medium", "Frameworks for governing automated hiring decisions."],
    ["prompt-master", "Low", "Careful, unbiased prompts for JD and outreach drafting."]
  ]},
  { p: "L&D Specialist", d: "Human Resources", t: "AI upskilling programs and skills mapping", s: [
    ["pm-claude-skills", "High", "Professional Agent Skills spanning L&D-relevant workflows."],
    ["awesome-agent-skills", "Medium", "1000+ agent skills to curate an upskilling catalog from."],
    ["skill-creator", "Medium", "Build custom internal skills for your programs."],
    ["book-to-skill", "Low", "Convert internal knowledge books into referenceable skills."]
  ]},

  // ---------- Healthcare (clinical specialties) ----------
  { p: "Surgeon", d: "Healthcare", t: "AI-assisted surgical planning and intraoperative guidance", s: [
    ["EU AI Act", "High", "Surgical guidance AI is high-risk — import its obligations."],
    ["NeMo Guardrails", "High", "Keep guidance tools strictly within safe, supervised bounds."],
    ["Responsible AI Toolbox", "Medium", "Assess reliability before anything informs the OR."],
    ["scientific-agent-skills", "Low", "Science agent skills for the planning-data work."]
  ]},
  { p: "Pathologist", d: "Healthcare", t: "Building a digital pathology whole-slide classifier", s: [
    ["EU AI Act", "High", "Diagnostic pathology AI is high-risk under the Act."],
    ["Responsible AI Toolbox", "High", "Audit the classifier's fairness and reliability before use."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for the imaging pipeline."],
    ["NIST AI Risk Management Framework", "Low", "Govern the model's lifecycle risk."]
  ]},
  { p: "Cardiologist", d: "Healthcare", t: "AI interpretation of ECG and echocardiography", s: [
    ["EU AI Act", "High", "Diagnostic interpretation AI is high-risk."],
    ["Responsible AI Toolbox", "High", "Validate reliability and fairness before clinical use."],
    ["scientific-agent-skills", "Medium", "Science/ML skills for the signal/imaging models."],
    ["NeMo Guardrails", "Low", "Bound any patient-facing interpretation tool."]
  ]},
  { p: "Oncologist", d: "Healthcare", t: "AI decision support for treatment planning", s: [
    ["EU AI Act", "High", "Treatment decision support is high-risk."],
    ["NeMo Guardrails", "High", "Keep a planning agent from asserting unverified recommendations."],
    ["Responsible AI Toolbox", "Medium", "Assess fairness across patient populations."],
    ["scientific-agent-skills", "Low", "Science agent skills for genomic and outcome analysis."]
  ]},
  { p: "Emergency Physician", d: "Healthcare", t: "AI triage and sepsis early-warning", s: [
    ["EU AI Act", "High", "Triage and early-warning AI is high-risk."],
    ["Responsible AI Toolbox", "High", "Audit the model for bias and reliability across groups."],
    ["NeMo Guardrails", "Medium", "Bound alerting behavior and escalation."],
    ["NIST AI Risk Management Framework", "Low", "Govern the operational risk of acting on alerts."]
  ]},
  { p: "Dermatologist", d: "Healthcare", t: "Skin lesion classification", s: [
    ["Responsible AI Toolbox", "High", "Skin-tone bias is well-documented — audit fairness explicitly."],
    ["EU AI Act", "High", "Diagnostic classification AI is high-risk."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for the imaging model."],
    ["NIST AI Risk Management Framework", "Low", "Govern the model's lifecycle risk."]
  ]},
  { p: "Ophthalmologist", d: "Healthcare", t: "Diabetic retinopathy screening", s: [
    ["EU AI Act", "High", "Autonomous screening is high-risk and tightly regulated."],
    ["Responsible AI Toolbox", "High", "Validate screening sensitivity and fairness across cameras/populations."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for the fundus-image model."],
    ["NIST AI Risk Management Framework", "Low", "Govern the screening program's risk."]
  ]},
  { p: "Intensivist", d: "Healthcare", t: "Predictive deterioration modeling in the ICU", s: [
    ["EU AI Act", "High", "ICU risk prediction is high-risk."],
    ["Responsible AI Toolbox", "High", "Audit reliability and fairness before it drives alerts."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for the vitals modeling."],
    ["NeMo Guardrails", "Low", "Bound bedside alerting behavior."]
  ]},
  { p: "Neurologist", d: "Healthcare", t: "AI for stroke imaging and EEG interpretation", s: [
    ["EU AI Act", "High", "Time-critical diagnostic AI is high-risk."],
    ["Responsible AI Toolbox", "High", "Validate reliability before acting on automated reads."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for imaging and signal models."],
    ["NIST AI Risk Management Framework", "Low", "Govern the model's lifecycle risk."]
  ]},
  { p: "Nurse Practitioner", d: "Healthcare", t: "Using AI clinical decision support in primary care", s: [
    ["EU AI Act", "High", "Decision support is high-risk — know the obligations."],
    ["Responsible AI Toolbox", "High", "Audit fairness across your patient population."],
    ["doc-coauthoring", "Medium", "Supervised drafting keeps the clinician the author."],
    ["awesome-ai-governance", "Low", "Broader governance references for safe adoption."]
  ]},
  { p: "Genetic Counselor", d: "Healthcare", t: "AI-assisted variant interpretation and patient communication", s: [
    ["EU AI Act", "High", "Genetic interpretation AI is high-risk and highly sensitive."],
    ["academic-research-skills", "High", "Ground interpretations in ClinVar, guidelines, and literature."],
    ["doc-coauthoring", "Medium", "Draft patient-facing explanations under review."],
    ["Responsible AI Toolbox", "Low", "Check reliability before relying on predictions."]
  ]},
  { p: "Medical Coder", d: "Healthcare", t: "AI-assisted medical coding and billing", s: [
    ["pdf", "High", "Extract codes and context from scanned clinical documentation."],
    ["Guardrails AI", "High", "Validate emitted codes against structured rules before billing."],
    ["EU AI Act", "Medium", "Automated coding decisions can carry compliance obligations."],
    ["Rebuff", "Low", "Guard the coding agent against injected content in records."]
  ]},
  { p: "Biostatistician", d: "Healthcare", t: "AI-assisted clinical trial analysis", s: [
    ["scientific-agent-skills", "High", "Science/stats agent skills for rigorous trial analysis."],
    ["CLAUDE.md", "High", "Govern the coding agent — analysis must be reproducible and audited."],
    ["planning-with-files", "Medium", "Durable, reproducible planning across the analysis."],
    ["academic-research-skills", "Low", "Ground methods and reporting in the literature."]
  ]},
  { p: "Clinical Data Manager", d: "Healthcare", t: "Trial data cleaning and query automation", s: [
    ["xlsx", "High", "Standardize, reconcile, and clean trial data."],
    ["pdf", "Medium", "Digitize source documents and forms."],
    ["EU AI Act", "Medium", "Trial-data AI carries obligations and strict handling rules."],
    ["Rebuff", "Low", "Guard data-ingesting agents against injected content."]
  ]},
  { p: "Pharmacovigilance Specialist", d: "Healthcare", t: "Adverse event detection and safety reporting", s: [
    ["pdf", "High", "Extract adverse-event signals from reports and literature."],
    ["Guardrails AI", "High", "Validate coded cases against structured rules before reporting."],
    ["EU AI Act", "Medium", "Safety-reporting AI carries regulatory obligations."],
    ["academic-research-skills", "Low", "Mine literature for emerging safety signals."]
  ]},
  { p: "Health Data Scientist", d: "Healthcare", t: "Building EHR-based clinical prediction models", s: [
    ["EU AI Act", "High", "Clinical prediction models are high-risk."],
    ["Responsible AI Toolbox", "High", "Audit fairness and reliability across patient subgroups."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for the modeling work."],
    ["CLAUDE.md", "Low", "Govern the coding agent on the modeling repo."]
  ]},
  { p: "Physical Therapist", d: "Healthcare", t: "AI movement analysis for rehabilitation", s: [
    ["EU AI Act", "Medium", "Patient-facing assessment tools may carry obligations."],
    ["NeMo Guardrails", "Medium", "Bound any home-exercise agent with clear escalation."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for movement analysis."],
    ["Responsible AI Toolbox", "Low", "Check reliability of automated measures."]
  ]},
  { p: "Medical Writer", d: "Healthcare", t: "AI-assisted regulatory and scientific medical writing", s: [
    ["doc-coauthoring", "High", "Structured human-in-the-loop drafting of regulated documents."],
    ["academic-research-skills", "High", "Ground documents in study data and references."],
    ["pdf", "Medium", "Extract from source studies and guidance."],
    ["humanizer", "Low", "Keep prose clean without altering meaning."]
  ]},
  { p: "Hospital Operations Manager", d: "Healthcare", t: "AI patient-flow and staffing optimization", s: [
    ["xlsx", "High", "Model census, demand, and staffing."],
    ["scientific-agent-skills", "Medium", "Science/OR agent skills for forecasting and optimization."],
    ["mcp-builder", "Medium", "Wire the agent into EHR/operational systems."],
    ["planning-with-files", "Low", "Durable planning for optimization build-outs."]
  ]},
  { p: "Health Payer Analyst", d: "Healthcare", t: "AI-assisted prior-authorization and claims review", s: [
    ["pdf", "High", "Extract medical-necessity signals from records and claims."],
    ["EU AI Act", "High", "Automated coverage decisions are high-risk."],
    ["Responsible AI Toolbox", "High", "Audit coverage models for bias — legal scrutiny is strict."],
    ["Guardrails AI", "Low", "Validate decisions against structured, auditable rules."]
  ]},
  { p: "Sonographer", d: "Healthcare", t: "AI-guided ultrasound image acquisition", s: [
    ["EU AI Act", "High", "Real-time acquisition guidance is high-risk medical AI."],
    ["Responsible AI Toolbox", "Medium", "Validate reliability before it guides scanning."],
    ["scientific-agent-skills", "Medium", "Science/ML agent skills for the imaging model."],
    ["NeMo Guardrails", "Low", "Bound guidance so the operator stays in control."]
  ]},

  // ---------- Further expansion ----------
  { p: "Insurance Underwriter", d: "Finance", t: "AI-assisted underwriting", s: [
    ["EU AI Act", "High", "Automated underwriting is a high-risk use under the Act."],
    ["Responsible AI Toolbox", "High", "Audit models for bias — anti-discrimination law is strict."],
    ["pdf", "Medium", "Extract data from applications and records."],
    ["awesome-ai-governance", "Low", "Governance references for regulated underwriting AI."]
  ]},
  { p: "Architect", d: "Design", t: "Generative architectural design", s: [
    ["canvas-design", "High", "Generate concept visuals and renders."],
    ["algorithmic-art", "Medium", "Generative form exploration with p5.js."],
    ["web-artifacts-builder", "Medium", "Build interactive design artifacts."],
    ["frontend-design", "Low", "Design-craft guidance for distinctive results."]
  ]},
  { p: "Localization Specialist", d: "Localization", t: "AI-assisted translation and localization", s: [
    ["humanizer", "High", "Post-edit machine output to natural, human quality."],
    ["Humanizer-zh", "High", "Chinese-localized de-AI-ifying for CJK workflows."],
    ["doc-coauthoring", "Medium", "Human-in-the-loop review of translated content."],
    ["prompt-master", "Low", "Encode tone, register, and locale in reusable prompts."]
  ]},
  { p: "Game Developer", d: "Gaming", t: "AI for game content and interactive NPCs", s: [
    ["Claude-Code-Game-Studios", "High", "A full game-dev studio — 49 agents and 72 workflow skills."],
    ["algorithmic-art", "Medium", "Generative art and procedural visuals."],
    ["NeMo Guardrails", "Medium", "Keep generative NPC dialogue safe and on-rails."],
    ["web-artifacts-builder", "Low", "Prototype interactive game UI quickly."]
  ]}
];

// Expose for app-rec.js (which reads directory metadata from data.js by name).
if (typeof window !== "undefined") { window.RECS = RECS; }
