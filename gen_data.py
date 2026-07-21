import json

ANTHROPIC_BASE = "https://github.com/anthropics/skills/tree/main/skills"

official = [
    ("algorithmic-art", "Generative / algorithmic art with p5.js — seeded randomness, flow fields, particle systems.", "Creative"),
    ("brand-guidelines", "Applies Anthropic's brand colors and typography to any artifact that needs on-brand styling.", "Design"),
    ("canvas-design", "Creates posters and static visual art (.png/.pdf) from an original design philosophy.", "Design"),
    ("claude-api", "Reference skill for the Claude API/SDK — model IDs, pricing, tool use, MCP, caching, streaming.", "Development"),
    ("doc-coauthoring", "Structured workflow for co-authoring docs, specs and proposals with a human in the loop.", "Documentation"),
    ("docx", "Create, read, edit and manipulate Word (.docx/.dotx) documents, templates, and tracked changes.", "Documents"),
    ("frontend-design", "Guidance for distinctive, intentional UI design — typography, aesthetic direction, non-templated UI.", "Design"),
    ("internal-comms", "Writes internal communications — status reports, leadership updates, incident reports, FAQs.", "Documentation"),
    ("mcp-builder", "Guide for building high-quality MCP servers in Python (FastMCP) or TypeScript to expose external APIs.", "Development"),
    ("pdf", "Read, extract, merge, split, watermark, fill, encrypt, and OCR PDF files.", "Documents"),
    ("pptx", "Create, edit, and analyze PowerPoint (.pptx/.potx) presentations, templates, and layouts.", "Documents"),
    ("skill-creator", "Meta-skill: create new skills, iterate on existing ones, and benchmark skill performance.", "Meta"),
    ("slack-gif-creator", "Creates animated GIFs optimized for Slack with size/format validation tools.", "Creative"),
    ("theme-factory", "Applies one of 10 preset visual themes (colors/fonts) to slides, docs, and HTML artifacts.", "Design"),
    ("web-artifacts-builder", "Builds elaborate multi-component HTML artifacts using React, Tailwind, and shadcn/ui.", "Development"),
    ("webapp-testing", "Tests local web apps with Playwright — screenshots, browser logs, UI verification.", "Development"),
    ("xlsx", "Create, edit, and analyze Excel spreadsheets (.xlsx/.xlsm/.csv) — formulas, charts, data cleanup.", "Documents"),
]

skills = []
for name, purpose, cat in official:
    skills.append({
        "name": name,
        "url": f"{ANTHROPIC_BASE}/{name}",
        "purpose": purpose,
        "category": cat,
        "source": "Anthropic (official)",
        "type": "skill",
    })

community = [
    ("affaan-m/ECC", "Agent-harness performance optimization system — skills, instincts, memory and security for Claude Code, Codex, Cursor.", "Meta", "Development"),
    ("multica-ai/andrej-karpathy-skills", "A single CLAUDE.md distilling Andrej Karpathy's coding-agent observations into behavior rules.", "Meta", "Development"),
    ("Graphify-Labs/graphify", "Turns any codebase, docs, SQL schemas, configs and PDFs into a queryable knowledge graph.", "Development", "Development"),
    ("JuliusBrussee/caveman", "Cuts ~65% of output tokens by making Claude Code communicate in short, blunt sentences.", "Meta", "Development"),
    ("hesreallyhim/awesome-claude-code", "Hand-picked, actively maintained list of Claude Code skills, agents, statuslines, and tooling.", "Curated list", "Meta"),
    ("coreyhaines31/marketingskills", "Marketing skills for AI agents — CRO, copywriting, SEO, analytics, growth engineering.", "Marketing", "Marketing"),
    ("Imbad0202/academic-research-skills", "End-to-end academic research pipeline: research → write → review → revise → finalize.", "Research", "Research"),
    ("K-Dense-AI/scientific-agent-skills", "Turns any AI agent into an AI Scientist — the largest agent-skills library for science.", "Research", "Research"),
    ("blader/humanizer", "Removes tell-tale signs of AI-generated writing from text output.", "Writing", "Writing"),
    ("VoltAgent/awesome-agent-skills", "Curated collection of 1000+ agent skills compatible with Claude Code, Codex, Gemini CLI, Cursor.", "Curated list", "Meta"),
    ("mukul975/Anthropic-Cybersecurity-Skills", "817 structured cybersecurity skills mapped to MITRE ATT&CK, NIST CSF 2.0 and other frameworks.", "Security", "Security"),
    ("OthmanAdi/planning-with-files", "Persistent, crash-proof file-based planning for long-running agentic coding tasks.", "Productivity", "Development"),
    ("Donchitos/Claude-Code-Game-Studios", "Turns Claude Code into a full game-dev studio — 49 agents, 72 workflow skills, coordination layer.", "Game dev", "Creative"),
    ("alirezarezvani/claude-skills", "345 Claude Code skills, agents, commands and plugins for full-stack development.", "Curated list", "Development"),
    ("alchaincyf/huashu-design", "HTML-native high-fidelity prototyping/design skill for Claude Code.", "Design", "Design"),
    ("teng-lin/notebooklm-py", "Unofficial Python API + agentic skill giving Claude programmatic access to Google NotebookLM.", "Research", "Research"),
    ("KKKKhazix/khazix-skills", "Skill collection covering doc/memory closeout, analysis, and writing workflows.", "Productivity", "Meta"),
    ("yusufkaraaslan/Skill_Seekers", "Converts documentation sites, GitHub repos and PDFs into ready-to-use Claude skills automatically.", "Meta", "Meta"),
    ("Nutlope/hallmark", "Anti-AI-slop design skill for Claude Code, Cursor, and Codex — pushes toward distinctive UI.", "Design", "Design"),
    ("travisvn/awesome-claude-skills", "Curated list of Claude Skills, resources and tools for customizing Claude AI workflows.", "Curated list", "Meta"),
    ("wanshuiyin/Auto-claude-code-research-in-sleep", "Lightweight markdown-only skills for autonomous ML research run overnight (ARIS).", "Research", "Research"),
    ("op7418/Humanizer-zh", "Chinese-localized version of the Humanizer skill for de-AI-ifying text.", "Writing", "Writing"),
    ("AgriciDaniel/claude-seo", "Universal SEO skill — 25 sub-skills and 18 sub-agents covering technical SEO and E-E-A-T.", "Marketing", "Marketing"),
    ("Orchestra-Research/AI-Research-SKILLs", "Open-source library of AI research and engineering skills, portable to any agent.", "Research", "Research"),
    ("Jeffallan/claude-skills", "66 specialized skills that turn Claude Code into an expert full-stack pair programmer.", "Development", "Development"),
    ("nidhinjs/prompt-master", "Writes accurate, optimized prompts for any AI tool while minimizing token spend.", "Productivity", "Meta"),
    ("diet103/claude-code-infrastructure-showcase", "Reference infrastructure for skill auto-activation, hooks, and multi-agent orchestration.", "Meta", "Development"),
    ("ykdojo/claude-code-tips", "40+ practical tips for getting more out of Claude Code, including a custom statusline.", "Productivity", "Meta"),
    ("zubair-trabzada/geo-seo-claude", "GEO-first SEO skill — optimizes content for AI-search citability, not just classic SEO.", "Marketing", "Marketing"),
    ("virgiliojr94/book-to-skill", "Converts any technical book PDF into a structured, referenceable Claude Code skill.", "Meta", "Meta"),
    ("ComposioHQ/awesome-claude-skills", "Curated list of Claude Skills, resources and tools for customizing Claude AI workflows.", "Curated list", "Meta"),
    ("mohitagw15856/pm-claude-skills", "515 professional Agent Skills for PRDs, launches, compliance and CVs — in Anthropic's plugin directory.", "Product", "Productivity"),
    ("GetBindu/awesome-claude-code-and-skills", "Collection of Claude Skills spanning coding, writing, and workflow automation.", "Curated list", "Meta"),
]

for repo, purpose, cat, group in community:
    skills.append({
        "name": repo.split("/")[-1],
        "url": f"https://github.com/{repo}",
        "purpose": purpose,
        "category": group,
        "source": repo.split("/")[0],
        "type": "skill",
    })

# Governance files: the broader class of artifact that a Skill belongs to —
# anything that scopes, directs, constrains, or audits what an AI agent may do.
governance = [
    ("AGENTS.md", "https://github.com/agentsmd/agents.md", "Open, cross-tool standard for a project instructions file — scopes what a coding agent may build, run, and touch. Read by 30+ agents.", "Instruction Files", "Agentic AI Foundation"),
    ("CLAUDE.md", "https://docs.claude.com/en/docs/claude-code/memory", "Per-project memory file Claude Code loads automatically to govern its behavior, conventions, and boundaries in a given repo.", "Instruction Files", "Anthropic"),
    ("copilot-instructions.md", "https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot", "Repo-scoped instructions file GitHub Copilot reads automatically to constrain suggestions to house conventions.", "Instruction Files", "GitHub"),
    ("Cursor Rules", "https://docs.cursor.com/context/rules", ".cursor/rules directory of scoped rule files governing what Cursor's agent can edit and how.", "Instruction Files", "Cursor"),
    ("Windsurf Rules", "https://docs.windsurf.com/windsurf/cascade/memories", ".windsurfrules / .windsurf/rules governing Cascade's behavior on a per-project basis.", "Instruction Files", "Windsurf"),
    ("NeMo Guardrails", "https://github.com/NVIDIA-NeMo/Guardrails", "Open-source toolkit for adding programmable input/output/dialog guardrails to LLM apps and agents.", "Guardrails", "NVIDIA"),
    ("Guardrails AI", "https://github.com/guardrails-ai/guardrails", "RAIL-spec framework that validates and corrects LLM outputs against structured rules before they reach a user.", "Guardrails", "Guardrails AI"),
    ("Llama Guard / PurpleLlama", "https://github.com/meta-llama/PurpleLlama", "Meta's safety classifier and toolkit for scoring prompts and agent outputs against a harm taxonomy.", "Guardrails", "Meta"),
    ("Rebuff", "https://github.com/protectai/rebuff", "Prompt-injection detector that governs what untrusted input is allowed to influence an agent's behavior.", "Guardrails", "Protect AI"),
    ("OWASP Top 10 for LLM Apps", "https://github.com/OWASP/www-project-top-10-for-large-language-model-applications", "Community risk-ranked list of top LLM/agent vulnerabilities, widely used as a baseline governance checklist.", "Standards", "OWASP"),
    ("MITRE ATT&CK Navigator", "https://github.com/mitre-attack/attack-navigator", "Threat-matrix browser used to map and govern AI/agent attack surfaces against known adversary techniques.", "Standards", "MITRE"),
    ("Responsible AI Toolbox", "https://github.com/microsoft/responsible-ai-toolbox", "Model/data assessment UI and libraries for auditing an AI system's fairness, safety, and reliability before it ships.", "Standards", "Microsoft"),
    ("awesome-ai-agent-governance", "https://github.com/systempromptio/awesome-ai-agent-governance", "Curated list of tools and standards for governing AI agents in production — policy enforcement, audit trails, EU AI Act, MCP/Claude Code security.", "Curated list", "systempromptio"),
    ("awesome-ai-governance", "https://github.com/Myr-Aya/awesome-ai-governance", "Curated frameworks, standards, regulations and tools for enterprise AI governance, risk, security and compliance.", "Curated list", "Myr-Aya"),
    ("ai-governance-framework-tools", "https://github.com/BinaryVerseAI/ai-governance-framework-tools", "Practical templates and guides for implementing the NIST AI RMF and ISO 42001 AI management systems.", "Standards", "BinaryVerseAI"),
    ("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework", "US government framework for identifying, measuring, and governing AI risk across an organization's AI lifecycle.", "Standards", "NIST"),
    ("EU AI Act", "https://artificialintelligenceact.eu/", "Binding EU regulation classifying and governing AI systems by risk tier, with obligations for agentic/general-purpose AI.", "Standards", "European Union"),
]

for name, url, purpose, cat, source in governance:
    skills.append({
        "name": name,
        "url": url,
        "purpose": purpose,
        "category": cat,
        "source": source,
        "type": "governance",
    })

with open("/private/tmp/claude-501/-Users-nafiz43/f7b880f4-6bd5-4b77-8f3e-11dfab4340fa/scratchpad/skillbench-site/data.js", "w") as f:
    f.write("const SKILLS = " + json.dumps(skills, indent=2) + ";\n")

print("wrote", len(skills), "entries:", sum(1 for s in skills if s['type']=='skill'), "skills,", sum(1 for s in skills if s['type']=='governance'), "governance files")
