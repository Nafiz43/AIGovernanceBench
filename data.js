const SKILLS = [
  {
    "name": "algorithmic-art",
    "url": "https://github.com/anthropics/skills/tree/main/skills/algorithmic-art",
    "purpose": "Generative / algorithmic art with p5.js \u2014 seeded randomness, flow fields, particle systems.",
    "category": "Creative",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "brand-guidelines",
    "url": "https://github.com/anthropics/skills/tree/main/skills/brand-guidelines",
    "purpose": "Applies Anthropic's brand colors and typography to any artifact that needs on-brand styling.",
    "category": "Design",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "canvas-design",
    "url": "https://github.com/anthropics/skills/tree/main/skills/canvas-design",
    "purpose": "Creates posters and static visual art (.png/.pdf) from an original design philosophy.",
    "category": "Design",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "claude-api",
    "url": "https://github.com/anthropics/skills/tree/main/skills/claude-api",
    "purpose": "Reference skill for the Claude API/SDK \u2014 model IDs, pricing, tool use, MCP, caching, streaming.",
    "category": "Development",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "doc-coauthoring",
    "url": "https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring",
    "purpose": "Structured workflow for co-authoring docs, specs and proposals with a human in the loop.",
    "category": "Documentation",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "docx",
    "url": "https://github.com/anthropics/skills/tree/main/skills/docx",
    "purpose": "Create, read, edit and manipulate Word (.docx/.dotx) documents, templates, and tracked changes.",
    "category": "Documents",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "frontend-design",
    "url": "https://github.com/anthropics/skills/tree/main/skills/frontend-design",
    "purpose": "Guidance for distinctive, intentional UI design \u2014 typography, aesthetic direction, non-templated UI.",
    "category": "Design",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "internal-comms",
    "url": "https://github.com/anthropics/skills/tree/main/skills/internal-comms",
    "purpose": "Writes internal communications \u2014 status reports, leadership updates, incident reports, FAQs.",
    "category": "Documentation",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "mcp-builder",
    "url": "https://github.com/anthropics/skills/tree/main/skills/mcp-builder",
    "purpose": "Guide for building high-quality MCP servers in Python (FastMCP) or TypeScript to expose external APIs.",
    "category": "Development",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "pdf",
    "url": "https://github.com/anthropics/skills/tree/main/skills/pdf",
    "purpose": "Read, extract, merge, split, watermark, fill, encrypt, and OCR PDF files.",
    "category": "Documents",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "pptx",
    "url": "https://github.com/anthropics/skills/tree/main/skills/pptx",
    "purpose": "Create, edit, and analyze PowerPoint (.pptx/.potx) presentations, templates, and layouts.",
    "category": "Documents",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "skill-creator",
    "url": "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
    "purpose": "Meta-skill: create new skills, iterate on existing ones, and benchmark skill performance.",
    "category": "Meta",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "slack-gif-creator",
    "url": "https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator",
    "purpose": "Creates animated GIFs optimized for Slack with size/format validation tools.",
    "category": "Creative",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "theme-factory",
    "url": "https://github.com/anthropics/skills/tree/main/skills/theme-factory",
    "purpose": "Applies one of 10 preset visual themes (colors/fonts) to slides, docs, and HTML artifacts.",
    "category": "Design",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "web-artifacts-builder",
    "url": "https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder",
    "purpose": "Builds elaborate multi-component HTML artifacts using React, Tailwind, and shadcn/ui.",
    "category": "Development",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "webapp-testing",
    "url": "https://github.com/anthropics/skills/tree/main/skills/webapp-testing",
    "purpose": "Tests local web apps with Playwright \u2014 screenshots, browser logs, UI verification.",
    "category": "Development",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "xlsx",
    "url": "https://github.com/anthropics/skills/tree/main/skills/xlsx",
    "purpose": "Create, edit, and analyze Excel spreadsheets (.xlsx/.xlsm/.csv) \u2014 formulas, charts, data cleanup.",
    "category": "Documents",
    "source": "Anthropic (official)",
    "type": "skill"
  },
  {
    "name": "ECC",
    "url": "https://github.com/affaan-m/ECC",
    "purpose": "Agent-harness performance optimization system \u2014 skills, instincts, memory and security for Claude Code, Codex, Cursor.",
    "category": "Development",
    "source": "affaan-m",
    "type": "skill"
  },
  {
    "name": "andrej-karpathy-skills",
    "url": "https://github.com/multica-ai/andrej-karpathy-skills",
    "purpose": "A single CLAUDE.md distilling Andrej Karpathy's coding-agent observations into behavior rules.",
    "category": "Development",
    "source": "multica-ai",
    "type": "skill"
  },
  {
    "name": "graphify",
    "url": "https://github.com/Graphify-Labs/graphify",
    "purpose": "Turns any codebase, docs, SQL schemas, configs and PDFs into a queryable knowledge graph.",
    "category": "Development",
    "source": "Graphify-Labs",
    "type": "skill"
  },
  {
    "name": "caveman",
    "url": "https://github.com/JuliusBrussee/caveman",
    "purpose": "Cuts ~65% of output tokens by making Claude Code communicate in short, blunt sentences.",
    "category": "Development",
    "source": "JuliusBrussee",
    "type": "skill"
  },
  {
    "name": "awesome-claude-code",
    "url": "https://github.com/hesreallyhim/awesome-claude-code",
    "purpose": "Hand-picked, actively maintained list of Claude Code skills, agents, statuslines, and tooling.",
    "category": "Meta",
    "source": "hesreallyhim",
    "type": "skill"
  },
  {
    "name": "marketingskills",
    "url": "https://github.com/coreyhaines31/marketingskills",
    "purpose": "Marketing skills for AI agents \u2014 CRO, copywriting, SEO, analytics, growth engineering.",
    "category": "Marketing",
    "source": "coreyhaines31",
    "type": "skill"
  },
  {
    "name": "academic-research-skills",
    "url": "https://github.com/Imbad0202/academic-research-skills",
    "purpose": "End-to-end academic research pipeline: research \u2192 write \u2192 review \u2192 revise \u2192 finalize.",
    "category": "Research",
    "source": "Imbad0202",
    "type": "skill"
  },
  {
    "name": "scientific-agent-skills",
    "url": "https://github.com/K-Dense-AI/scientific-agent-skills",
    "purpose": "Turns any AI agent into an AI Scientist \u2014 the largest agent-skills library for science.",
    "category": "Research",
    "source": "K-Dense-AI",
    "type": "skill"
  },
  {
    "name": "humanizer",
    "url": "https://github.com/blader/humanizer",
    "purpose": "Removes tell-tale signs of AI-generated writing from text output.",
    "category": "Writing",
    "source": "blader",
    "type": "skill"
  },
  {
    "name": "awesome-agent-skills",
    "url": "https://github.com/VoltAgent/awesome-agent-skills",
    "purpose": "Curated collection of 1000+ agent skills compatible with Claude Code, Codex, Gemini CLI, Cursor.",
    "category": "Meta",
    "source": "VoltAgent",
    "type": "skill"
  },
  {
    "name": "Anthropic-Cybersecurity-Skills",
    "url": "https://github.com/mukul975/Anthropic-Cybersecurity-Skills",
    "purpose": "817 structured cybersecurity skills mapped to MITRE ATT&CK, NIST CSF 2.0 and other frameworks.",
    "category": "Security",
    "source": "mukul975",
    "type": "skill"
  },
  {
    "name": "planning-with-files",
    "url": "https://github.com/OthmanAdi/planning-with-files",
    "purpose": "Persistent, crash-proof file-based planning for long-running agentic coding tasks.",
    "category": "Development",
    "source": "OthmanAdi",
    "type": "skill"
  },
  {
    "name": "Claude-Code-Game-Studios",
    "url": "https://github.com/Donchitos/Claude-Code-Game-Studios",
    "purpose": "Turns Claude Code into a full game-dev studio \u2014 49 agents, 72 workflow skills, coordination layer.",
    "category": "Creative",
    "source": "Donchitos",
    "type": "skill"
  },
  {
    "name": "claude-skills",
    "url": "https://github.com/alirezarezvani/claude-skills",
    "purpose": "345 Claude Code skills, agents, commands and plugins for full-stack development.",
    "category": "Development",
    "source": "alirezarezvani",
    "type": "skill"
  },
  {
    "name": "huashu-design",
    "url": "https://github.com/alchaincyf/huashu-design",
    "purpose": "HTML-native high-fidelity prototyping/design skill for Claude Code.",
    "category": "Design",
    "source": "alchaincyf",
    "type": "skill"
  },
  {
    "name": "notebooklm-py",
    "url": "https://github.com/teng-lin/notebooklm-py",
    "purpose": "Unofficial Python API + agentic skill giving Claude programmatic access to Google NotebookLM.",
    "category": "Research",
    "source": "teng-lin",
    "type": "skill"
  },
  {
    "name": "khazix-skills",
    "url": "https://github.com/KKKKhazix/khazix-skills",
    "purpose": "Skill collection covering doc/memory closeout, analysis, and writing workflows.",
    "category": "Meta",
    "source": "KKKKhazix",
    "type": "skill"
  },
  {
    "name": "Skill_Seekers",
    "url": "https://github.com/yusufkaraaslan/Skill_Seekers",
    "purpose": "Converts documentation sites, GitHub repos and PDFs into ready-to-use Claude skills automatically.",
    "category": "Meta",
    "source": "yusufkaraaslan",
    "type": "skill"
  },
  {
    "name": "hallmark",
    "url": "https://github.com/Nutlope/hallmark",
    "purpose": "Anti-AI-slop design skill for Claude Code, Cursor, and Codex \u2014 pushes toward distinctive UI.",
    "category": "Design",
    "source": "Nutlope",
    "type": "skill"
  },
  {
    "name": "awesome-claude-skills",
    "url": "https://github.com/travisvn/awesome-claude-skills",
    "purpose": "Curated list of Claude Skills, resources and tools for customizing Claude AI workflows.",
    "category": "Meta",
    "source": "travisvn",
    "type": "skill"
  },
  {
    "name": "Auto-claude-code-research-in-sleep",
    "url": "https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep",
    "purpose": "Lightweight markdown-only skills for autonomous ML research run overnight (ARIS).",
    "category": "Research",
    "source": "wanshuiyin",
    "type": "skill"
  },
  {
    "name": "Humanizer-zh",
    "url": "https://github.com/op7418/Humanizer-zh",
    "purpose": "Chinese-localized version of the Humanizer skill for de-AI-ifying text.",
    "category": "Writing",
    "source": "op7418",
    "type": "skill"
  },
  {
    "name": "claude-seo",
    "url": "https://github.com/AgriciDaniel/claude-seo",
    "purpose": "Universal SEO skill \u2014 25 sub-skills and 18 sub-agents covering technical SEO and E-E-A-T.",
    "category": "Marketing",
    "source": "AgriciDaniel",
    "type": "skill"
  },
  {
    "name": "AI-Research-SKILLs",
    "url": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
    "purpose": "Open-source library of AI research and engineering skills, portable to any agent.",
    "category": "Research",
    "source": "Orchestra-Research",
    "type": "skill"
  },
  {
    "name": "claude-skills",
    "url": "https://github.com/Jeffallan/claude-skills",
    "purpose": "66 specialized skills that turn Claude Code into an expert full-stack pair programmer.",
    "category": "Development",
    "source": "Jeffallan",
    "type": "skill"
  },
  {
    "name": "prompt-master",
    "url": "https://github.com/nidhinjs/prompt-master",
    "purpose": "Writes accurate, optimized prompts for any AI tool while minimizing token spend.",
    "category": "Meta",
    "source": "nidhinjs",
    "type": "skill"
  },
  {
    "name": "claude-code-infrastructure-showcase",
    "url": "https://github.com/diet103/claude-code-infrastructure-showcase",
    "purpose": "Reference infrastructure for skill auto-activation, hooks, and multi-agent orchestration.",
    "category": "Development",
    "source": "diet103",
    "type": "skill"
  },
  {
    "name": "claude-code-tips",
    "url": "https://github.com/ykdojo/claude-code-tips",
    "purpose": "40+ practical tips for getting more out of Claude Code, including a custom statusline.",
    "category": "Meta",
    "source": "ykdojo",
    "type": "skill"
  },
  {
    "name": "geo-seo-claude",
    "url": "https://github.com/zubair-trabzada/geo-seo-claude",
    "purpose": "GEO-first SEO skill \u2014 optimizes content for AI-search citability, not just classic SEO.",
    "category": "Marketing",
    "source": "zubair-trabzada",
    "type": "skill"
  },
  {
    "name": "book-to-skill",
    "url": "https://github.com/virgiliojr94/book-to-skill",
    "purpose": "Converts any technical book PDF into a structured, referenceable Claude Code skill.",
    "category": "Meta",
    "source": "virgiliojr94",
    "type": "skill"
  },
  {
    "name": "awesome-claude-skills",
    "url": "https://github.com/ComposioHQ/awesome-claude-skills",
    "purpose": "Curated list of Claude Skills, resources and tools for customizing Claude AI workflows.",
    "category": "Meta",
    "source": "ComposioHQ",
    "type": "skill"
  },
  {
    "name": "pm-claude-skills",
    "url": "https://github.com/mohitagw15856/pm-claude-skills",
    "purpose": "515 professional Agent Skills for PRDs, launches, compliance and CVs \u2014 in Anthropic's plugin directory.",
    "category": "Productivity",
    "source": "mohitagw15856",
    "type": "skill"
  },
  {
    "name": "awesome-claude-code-and-skills",
    "url": "https://github.com/GetBindu/awesome-claude-code-and-skills",
    "purpose": "Collection of Claude Skills spanning coding, writing, and workflow automation.",
    "category": "Meta",
    "source": "GetBindu",
    "type": "skill"
  },
  {
    "name": "AGENTS.md",
    "url": "https://github.com/agentsmd/agents.md",
    "purpose": "Open, cross-tool standard for a project instructions file \u2014 scopes what a coding agent may build, run, and touch. Read by 30+ agents.",
    "category": "Instruction Files",
    "source": "Agentic AI Foundation",
    "type": "governance"
  },
  {
    "name": "CLAUDE.md",
    "url": "https://docs.claude.com/en/docs/claude-code/memory",
    "purpose": "Per-project memory file Claude Code loads automatically to govern its behavior, conventions, and boundaries in a given repo.",
    "category": "Instruction Files",
    "source": "Anthropic",
    "type": "governance"
  },
  {
    "name": "copilot-instructions.md",
    "url": "https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot",
    "purpose": "Repo-scoped instructions file GitHub Copilot reads automatically to constrain suggestions to house conventions.",
    "category": "Instruction Files",
    "source": "GitHub",
    "type": "governance"
  },
  {
    "name": "Cursor Rules",
    "url": "https://docs.cursor.com/context/rules",
    "purpose": ".cursor/rules directory of scoped rule files governing what Cursor's agent can edit and how.",
    "category": "Instruction Files",
    "source": "Cursor",
    "type": "governance"
  },
  {
    "name": "Windsurf Rules",
    "url": "https://docs.windsurf.com/windsurf/cascade/memories",
    "purpose": ".windsurfrules / .windsurf/rules governing Cascade's behavior on a per-project basis.",
    "category": "Instruction Files",
    "source": "Windsurf",
    "type": "governance"
  },
  {
    "name": "NeMo Guardrails",
    "url": "https://github.com/NVIDIA-NeMo/Guardrails",
    "purpose": "Open-source toolkit for adding programmable input/output/dialog guardrails to LLM apps and agents.",
    "category": "Guardrails",
    "source": "NVIDIA",
    "type": "governance"
  },
  {
    "name": "Guardrails AI",
    "url": "https://github.com/guardrails-ai/guardrails",
    "purpose": "RAIL-spec framework that validates and corrects LLM outputs against structured rules before they reach a user.",
    "category": "Guardrails",
    "source": "Guardrails AI",
    "type": "governance"
  },
  {
    "name": "Llama Guard / PurpleLlama",
    "url": "https://github.com/meta-llama/PurpleLlama",
    "purpose": "Meta's safety classifier and toolkit for scoring prompts and agent outputs against a harm taxonomy.",
    "category": "Guardrails",
    "source": "Meta",
    "type": "governance"
  },
  {
    "name": "Rebuff",
    "url": "https://github.com/protectai/rebuff",
    "purpose": "Prompt-injection detector that governs what untrusted input is allowed to influence an agent's behavior.",
    "category": "Guardrails",
    "source": "Protect AI",
    "type": "governance"
  },
  {
    "name": "OWASP Top 10 for LLM Apps",
    "url": "https://github.com/OWASP/www-project-top-10-for-large-language-model-applications",
    "purpose": "Community risk-ranked list of top LLM/agent vulnerabilities, widely used as a baseline governance checklist.",
    "category": "Standards",
    "source": "OWASP",
    "type": "governance"
  },
  {
    "name": "MITRE ATT&CK Navigator",
    "url": "https://github.com/mitre-attack/attack-navigator",
    "purpose": "Threat-matrix browser used to map and govern AI/agent attack surfaces against known adversary techniques.",
    "category": "Standards",
    "source": "MITRE",
    "type": "governance"
  },
  {
    "name": "Responsible AI Toolbox",
    "url": "https://github.com/microsoft/responsible-ai-toolbox",
    "purpose": "Model/data assessment UI and libraries for auditing an AI system's fairness, safety, and reliability before it ships.",
    "category": "Standards",
    "source": "Microsoft",
    "type": "governance"
  },
  {
    "name": "awesome-ai-agent-governance",
    "url": "https://github.com/systempromptio/awesome-ai-agent-governance",
    "purpose": "Curated list of tools and standards for governing AI agents in production \u2014 policy enforcement, audit trails, EU AI Act, MCP/Claude Code security.",
    "category": "Curated list",
    "source": "systempromptio",
    "type": "governance"
  },
  {
    "name": "awesome-ai-governance",
    "url": "https://github.com/Myr-Aya/awesome-ai-governance",
    "purpose": "Curated frameworks, standards, regulations and tools for enterprise AI governance, risk, security and compliance.",
    "category": "Curated list",
    "source": "Myr-Aya",
    "type": "governance"
  },
  {
    "name": "ai-governance-framework-tools",
    "url": "https://github.com/BinaryVerseAI/ai-governance-framework-tools",
    "purpose": "Practical templates and guides for implementing the NIST AI RMF and ISO 42001 AI management systems.",
    "category": "Standards",
    "source": "BinaryVerseAI",
    "type": "governance"
  },
  {
    "name": "NIST AI Risk Management Framework",
    "url": "https://www.nist.gov/itl/ai-risk-management-framework",
    "purpose": "US government framework for identifying, measuring, and governing AI risk across an organization's AI lifecycle.",
    "category": "Standards",
    "source": "NIST",
    "type": "governance"
  },
  {
    "name": "EU AI Act",
    "url": "https://artificialintelligenceact.eu/",
    "purpose": "Binding EU regulation classifying and governing AI systems by risk tier, with obligations for agentic/general-purpose AI.",
    "category": "Standards",
    "source": "European Union",
    "type": "governance"
  }
];
