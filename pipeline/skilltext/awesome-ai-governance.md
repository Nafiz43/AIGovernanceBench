<!-- awesome-ai-governance | https://github.com/Myr-Aya/awesome-ai-governance | Myr-Aya/awesome-ai-governance -->
# Awesome AI Governance, Security & Safety [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> A curated list of the frameworks, standards, regulations, and tools enterprises use to govern, secure, and assure the safety of AI systems.

AI governance guidance is scattered across standards bodies, regulators, security communities, and technology vendors. This list gathers the most operationally relevant frameworks, standards, regulatory instruments, and tools for enterprise AI governance, risk, security, and compliance, each linked to its primary source.

Every entry is also mapped onto a four-layer GRC operating model (Organization, Governance, Risk, Compliance) and made searchable by practitioner role in the interactive [AI Governance, Security & Safety Framework Navigator](https://www.mind-xo.com/ai-governance-framework-navigator/), maintained by [MindXO](https://www.mind-xo.com). See the selection criteria below for how entries are chosen.

## Contents

- [Governance & Management Systems](#governance--management-systems)
- [Risk Management](#risk-management)
- [Security & Threat Intelligence](#security--threat-intelligence)
- [Safety & Frontier Model Governance](#safety--frontier-model-governance)
- [Ethics & Responsible AI](#ethics--responsible-ai)
- [Regulation & Compliance](#regulation--compliance)
- [Evaluation, Measurement & Testing](#evaluation-measurement--testing)
- [Selection Criteria](#selection-criteria)
- [Related Resources](#related-resources)

## Governance & Management Systems

Foundational frameworks that establish AI governance, management systems, and the operating model an enterprise runs AI within.

- [NIST AI 100-1: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) - The foundational US framework, built on four functions: Govern, Map, Measure, and Manage.
- [ISO/IEC 42001:2023: AI Management System](https://www.iso.org/standard/81230.html) - The first certifiable management-system standard for establishing AI governance, increasingly used as EU AI Act conformity evidence.
- [ISO/IEC 5338:2023: AI System Lifecycle Processes](https://www.iso.org/standard/81118.html) - Defines processes for managing the AI lifecycle from conception through development, operation, and retirement.
- [NIST AI RMF Playbook](https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook) - Interactive companion to the AI RMF with suggested actions and references for each function and subcategory.
- [NIST AI 100-5: A Plan for Global Engagement on AI Standards](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-5.pdf) - US strategy for AI standardization and coordination across ISO, IEC, IEEE, and other bodies.
- [ARMOR: AI Readiness Model for Operational Resilience](https://www.wwt.com/atc-capabilities/ai-readiness-model-for-operational-resilience/overview) - Vendor-agnostic readiness framework from WWT and NVIDIA spanning six domains, from GRC to model and infrastructure security.

## Risk Management

Risk taxonomies, methodologies, and monitoring frameworks for identifying, measuring, and treating AI risk.

- [SaferAI Frontier AI Risk Management Framework](https://www.safer-ai.org/research/a-frontier-ai-risk-management-framework) - Rigorous risk identification, analysis, evaluation, and treatment methodology built for frontier AI systems.
- [ISO/IEC 23894:2023: AI Risk Management](https://www.iso.org/standard/77304.html) - Guidance on AI-specific risk management processes, aligned with the ISO 31000 standard.
- [CRI Financial Services AI Risk Management Framework](https://cyberriskinstitute.org/artificial-intelligence-risk-management/) - Sector-specific framework from the Cyber Risk Institute with 230 control objectives, aligned to the NIST AI RMF.
- [NIST AI 800-4: Challenges to the Monitoring of Deployed AI Systems](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.800-4.pdf) - Six categories of monitoring challenges for AI systems in production, from functionality to societal effects.
- [IBM AI Risk Atlas](https://www.ibm.com/docs/en/watsonx/saas?topic=ai-risk-atlas) - Structured taxonomy of AI risks across input, inference, output, and non-technical categories.
- [MAS Project MindForge: Generative AI Risk Framework](https://www.mas.gov.sg/schemes-and-initiatives/project-mindforge) - MAS-led consortium framework defining seven generative-AI risk dimensions for financial services.

## Security & Threat Intelligence

Threat taxonomies, control frameworks, and secure-development guidance for protecting AI systems from adversarial attack and exploitation.

- [MITRE ATLAS](https://atlas.mitre.org/) - ATT&CK-style knowledge base of real-world adversarial tactics, techniques, and case studies for AI systems.
- [NIST AI 100-2: Adversarial Machine Learning Taxonomy and Terminology](https://csrc.nist.gov/pubs/ai/100/2/e2025/final) - The authoritative taxonomy of evasion, poisoning, privacy, and abuse attacks across predictive and generative AI.
- [OWASP AI Exchange](https://owaspai.org/) - Living, community-maintained catalog of AI security threats, vulnerabilities, and controls across ML, generative, and agentic systems.
- [ENISA Threat Landscape 2025](https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025) - Annual EU threat analysis of 4,875 incidents, identifying AI as a defining element of the current landscape.
- [ENISA Multilayer Framework for Good Cybersecurity Practices for AI](https://www.enisa.europa.eu/publications/multilayer-framework-for-good-cybersecurity-practices-for-ai) - Three-layer model covering cybersecurity foundations, AI-specific security, and sector-specific practices.
- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) - The most-referenced list of critical LLM vulnerabilities, from prompt injection to excessive agency and model theft.
- [Databricks AI Security Framework (DASF) v3.0](https://www.databricks.com/resources/whitepaper/databricks-ai-security-framework-dasf) - 97 risks and 73 controls across 13 AI system components, mapped to MITRE ATLAS, OWASP, NIST, and ISO.
- [Google Secure AI Framework (SAIF)](https://safety.google/cybersecurity-advancements/saif/) - Six core elements for securing AI systems across the lifecycle, aligned with NIST AI RMF and MITRE ATLAS.
- [Cisco Integrated AI Security & Safety Framework](https://blogs.cisco.com/ai/security-framework) - Treats AI security and AI safety as complementary dimensions of one unified risk framework.
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) - The top security risks for autonomous and agentic AI, covering planning, tool use, and multi-agent communication.
- [NVIDIA AI Safety Recipe](https://developer.nvidia.com/blog/safeguard-agentic-ai-systems-with-the-nvidia-safety-recipe/) - Enterprise recipe for building, deploying, and operating trustworthy agentic AI with policy enforcement and guardrails.
- [AIUC-1: AI Agent Standard](https://www.aiuc-1.com/) - The first certifiable AI agent standard, spanning data, security, safety, reliability, accountability, and transparency, with crosswalks to NIST, ISO, OWASP, and MITRE.
- [Autonomous Action Runtime Management (AARM)](https://aarm.dev/spec) - Cloud Security Alliance specification for securing autonomous agent actions at runtime, with eleven agentic threat classes.
- [CSA AI Controls Matrix](https://cloudsecurityalliance.org/artifacts/ai-controls-matrix) - Cloud Security Alliance control matrix (18 domains, 243 control objectives) for securing AI workloads, mapped to the Cloud Controls Matrix.
- [CSA AI Security Maturity Model (AISMM)](https://cloudsecurityalliance.org/artifacts/ai-security-maturity-model) - Structured roadmap for building and measuring an enterprise AI security program, feeding the STAR for AI certification pathway.
- [NIST IR 8596: Cybersecurity Framework Profile for AI](https://csrc.nist.gov/pubs/ir/8596/iprd) - Maps the NIST CSF 2.0 onto AI systems with a Secure, Defend, and Thwart structure (initial public draft).
- [NIST SP 800-53 Control Overlays for Securing AI Systems (COSAiS)](https://csrc.nist.gov/projects/cosais) - Ongoing project mapping the SP 800-53 control catalog to AI use cases with tailored control selections.
- [NIST SP 800-218A: SSDF Community Profile for AI Model Development](https://csrc.nist.gov/pubs/sp/800/218/a/final) - Applies the Secure Software Development Framework to generative-AI model development and supply-chain integrity.

## Safety & Frontier Model Governance

Frontier-lab self-governance, misuse prevention, and safety guidance for powerful general-purpose and agentic AI.

- [Anthropic Responsible Scaling Policy](https://www.anthropic.com/news/responsible-scaling-policy-v3) - Defines AI Safety Levels (ASL-1 to ASL-4) with escalating safeguards as frontier model capabilities increase.
- [OpenAI Preparedness Framework](https://openai.com/index/updating-our-preparedness-framework/) - Evaluates frontier model risk across cybersecurity, CBRN, persuasion, and model autonomy, with deployment thresholds.
- [Singapore Model AI Governance Framework for Agentic AI](https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf) - The first government-issued governance framework built specifically for agentic AI, from Singapore's IMDA.
- [NIST AI 600-1: Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) - Companion to the AI RMF identifying 13 generative-AI risks with over 400 suggested actions.
- [NIST AI 800-1: Managing Misuse Risk for Dual-Use Foundation Models](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.800-1.ipd.pdf) - Draft framework for addressing CBRN, cyber, and disinformation misuse risks of powerful foundation models.
- [NIST AI 100-4: Reducing Risks Posed by Synthetic Content](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-4.pdf) - Watermarking, authentication, and provenance techniques for deepfakes and other synthetic media.

## Ethics & Responsible AI

Principles, normative instruments, and enterprise responsible-AI frameworks that set the values AI governance operationalizes.

- [OECD AI Principles](https://oecd.ai/en/ai-principles) - Five foundational principles adopted by 46+ countries and embedded in the EU AI Act and national strategies.
- [UNESCO Recommendation on the Ethics of AI](https://www.unesco.org/en/artificial-intelligence/recommendation-ethics) - The broadest international AI ethics instrument, adopted by all 193 UNESCO member states.
- [IEEE 7000: Model Process for Addressing Ethical Concerns During System Design](https://standards.ieee.org/ieee/7000/6781/) - Standards process for embedding ethical value considerations into system design from concept onward.
- [ISO/IEC TR 24368:2022: Overview of Ethical and Societal Concerns](https://www.iso.org/standard/78507.html) - Technical report surveying AI bias, transparency, accountability, and human-oversight concerns.
- [Cisco Responsible AI Framework](https://www.cisco.com/c/dam/en_us/about/doing_business/trust-center/docs/cisco-responsible-artificial-intelligence-framework.pdf) - Enterprise responsible-AI framework built on six principles, operationalized through committee oversight and impact assessments.
- [Microsoft Responsible AI Standard v2](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/final/en-us/microsoft-brand/documents/Microsoft-Responsible-AI-Standard-General-Requirements.pdf?culture=en-us&country=us) - The internal governance standard Microsoft applies to its own AI products, published as an enterprise reference.

## Regulation & Compliance

Binding laws, regulatory codes, and certifiable compliance instruments that produce audit-ready evidence.

- [EU AI Act](https://artificialintelligenceact.eu/) - The world's first comprehensive, legally binding AI law, using a risk-based classification with phased enforcement through 2026.
- [GPAI Code of Practice](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai) - European Commission code letting general-purpose AI model providers demonstrate EU AI Act compliance.
- [ALTAI: Assessment List for Trustworthy AI](https://digital-strategy.ec.europa.eu/en/library/assessment-list-trustworthy-artificial-intelligence-altai-self-assessment) - European Commission self-assessment checklist covering the seven requirements for trustworthy AI.
- [ISO/IEC 27001:2022: Information Security Management](https://www.iso.org/standard/27001) - The certifiable ISMS standard that provides the baseline security controls AI-specific frameworks build upon.
- [Software Bill of Materials for AI: Minimum Elements](https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements) - CISA and G7 joint guidance defining what an AI-specific SBOM must contain for supply-chain transparency.

## Evaluation, Measurement & Testing

Benchmarks, evaluation methodologies, and test platforms that turn risk and safety claims into measurable evidence.

- [NIST Dioptra](https://pages.nist.gov/dioptra/) - Open-source platform for testing AI system resilience to adversarial attacks.
- [OWASP AI Testing Guide](https://owasp.org/www-project-ai-testing-guide/) - First open standard for trustworthiness testing across application, model, infrastructure, and data layers.
- [OWASP AI Vulnerability Scoring System (AIVSS)](https://aivss.owasp.org/) - Quantifiable scoring methodology for AI vulnerabilities, extending CVSS with an agentic-AI risk score (in development).
- [MLCommons AILuminate v1.0 Safety Benchmark](https://mlcommons.org/ailuminate/safety/) - Grades general-purpose chat AI across twelve hazard categories using 24,000+ test prompts per language.
- [NIST AI 700-1: GenAI Pilot Study on Text-to-Text Evaluation](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.700-1.pdf) - Pilot methodology for systematically evaluating text-to-text generative AI outputs.
- [NIST AI 800-2: Practices for Automated Benchmark Evaluations of Language Models](https://www.nist.gov/news-events/news/2026/01/towards-best-practices-automated-benchmark-evaluations) - Draft best practices for evaluating LLMs and AI agents through automated benchmarks.
- [ISO/IEC TR 24029-1:2021: Assessment of the Robustness of Neural Networks](https://www.iso.org/standard/77609.html) - Methods for assessing neural-network robustness against adversarial inputs and distributional shift.

## Selection Criteria

The list is deliberate, not exhaustive. Every candidate is tested against five filters:

1. Operational relevance. Every entry offers guidance, controls, requirements, or risk taxonomies an enterprise governance, risk, security, or compliance team can act on. Pure research is excluded unless it has reached practitioner-reference status.
2. Authority or adoption. Every entry comes from a standards body, a government or regulator, an established security or risk community, or a technology vendor whose framework has cross-industry reference status.
3. Functional coverage. Entries are chosen so that every layer of the GRC operating model, and every cross-cutting domain, is represented.
4. Geographic relevance. Global-first, with strong US, EU, GCC, Singapore, and Korea coverage. Region-specific overlays are added case by case.
5. Currency. Every entry is currently published, in active draft, or under active revision. Superseded versions and abandoned projects are dropped.

Deliberately excluded: general-purpose cybersecurity frameworks not adapted for AI, vendor product documentation, academic preprints without practitioner adoption, national AI strategies and vision documents, and most tooling (measurement platforms such as NIST Dioptra and OWASP AIVSS are the exception).

## Related Resources

- [AI Safety Organizations Atlas](https://www.mind-xo.com/ai-safety-organizations-atlas/) - Companion map of the institutions, labs, and bodies shaping AI safety and governance, from the same team.
- [MindXO Research](https://www.mind-xo.com/research/) - Applied research on AI governance, risk taxonomies, and system reliability that informs this list.

## Contributing

Contributions are welcome. Read the [contribution guidelines](contributing.md) first, then open a pull request. In short: one entry per line, linked to its primary source, with a concise one-sentence description, placed in the domain section it best fits.

---

To the extent possible under law, MindXO has waived all copyright and related or neighboring rights to this work under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
