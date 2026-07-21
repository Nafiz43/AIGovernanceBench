const SKILLS = [
  {
    "name": "algorithmic-art",
    "url": "https://github.com/anthropics/skills/tree/main/skills/algorithmic-art",
    "purpose": "Generative / algorithmic art with p5.js \u2014 seeded randomness, flow fields, particle systems.",
    "category": "Creative",
    "source": "Anthropic (official)"
  },
  {
    "name": "brand-guidelines",
    "url": "https://github.com/anthropics/skills/tree/main/skills/brand-guidelines",
    "purpose": "Applies Anthropic's brand colors and typography to any artifact that needs on-brand styling.",
    "category": "Design",
    "source": "Anthropic (official)"
  },
  {
    "name": "canvas-design",
    "url": "https://github.com/anthropics/skills/tree/main/skills/canvas-design",
    "purpose": "Creates posters and static visual art (.png/.pdf) from an original design philosophy.",
    "category": "Design",
    "source": "Anthropic (official)"
  },
  {
    "name": "claude-api",
    "url": "https://github.com/anthropics/skills/tree/main/skills/claude-api",
    "purpose": "Reference skill for the Claude API/SDK \u2014 model IDs, pricing, tool use, MCP, caching, streaming.",
    "category": "Development",
    "source": "Anthropic (official)"
  },
  {
    "name": "doc-coauthoring",
    "url": "https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring",
    "purpose": "Structured workflow for co-authoring docs, specs and proposals with a human in the loop.",
    "category": "Documentation",
    "source": "Anthropic (official)"
  },
  {
    "name": "docx",
    "url": "https://github.com/anthropics/skills/tree/main/skills/docx",
    "purpose": "Create, read, edit and manipulate Word (.docx/.dotx) documents, templates, and tracked changes.",
    "category": "Documents",
    "source": "Anthropic (official)"
  },
  {
    "name": "frontend-design",
    "url": "https://github.com/anthropics/skills/tree/main/skills/frontend-design",
    "purpose": "Guidance for distinctive, intentional UI design \u2014 typography, aesthetic direction, non-templated UI.",
    "category": "Design",
    "source": "Anthropic (official)"
  },
  {
    "name": "internal-comms",
    "url": "https://github.com/anthropics/skills/tree/main/skills/internal-comms",
    "purpose": "Writes internal communications \u2014 status reports, leadership updates, incident reports, FAQs.",
    "category": "Documentation",
    "source": "Anthropic (official)"
  },
  {
    "name": "mcp-builder",
    "url": "https://github.com/anthropics/skills/tree/main/skills/mcp-builder",
    "purpose": "Guide for building high-quality MCP servers in Python (FastMCP) or TypeScript to expose external APIs.",
    "category": "Development",
    "source": "Anthropic (official)"
  },
  {
    "name": "pdf",
    "url": "https://github.com/anthropics/skills/tree/main/skills/pdf",
    "purpose": "Read, extract, merge, split, watermark, fill, encrypt, and OCR PDF files.",
    "category": "Documents",
    "source": "Anthropic (official)"
  },
  {
    "name": "pptx",
    "url": "https://github.com/anthropics/skills/tree/main/skills/pptx",
    "purpose": "Create, edit, and analyze PowerPoint (.pptx/.potx) presentations, templates, and layouts.",
    "category": "Documents",
    "source": "Anthropic (official)"
  },
  {
    "name": "skill-creator",
    "url": "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
    "purpose": "Meta-skill: create new skills, iterate on existing ones, and benchmark skill performance.",
    "category": "Meta",
    "source": "Anthropic (official)"
  },
  {
    "name": "slack-gif-creator",
    "url": "https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator",
    "purpose": "Creates animated GIFs optimized for Slack with size/format validation tools.",
    "category": "Creative",
    "source": "Anthropic (official)"
  },
  {
    "name": "theme-factory",
    "url": "https://github.com/anthropics/skills/tree/main/skills/theme-factory",
    "purpose": "Applies one of 10 preset visual themes (colors/fonts) to slides, docs, and HTML artifacts.",
    "category": "Design",
    "source": "Anthropic (official)"
  },
  {
    "name": "web-artifacts-builder",
    "url": "https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder",
    "purpose": "Builds elaborate multi-component HTML artifacts using React, Tailwind, and shadcn/ui.",
    "category": "Development",
    "source": "Anthropic (official)"
  },
  {
    "name": "webapp-testing",
    "url": "https://github.com/anthropics/skills/tree/main/skills/webapp-testing",
    "purpose": "Tests local web apps with Playwright \u2014 screenshots, browser logs, UI verification.",
    "category": "Development",
    "source": "Anthropic (official)"
  },
  {
    "name": "xlsx",
    "url": "https://github.com/anthropics/skills/tree/main/skills/xlsx",
    "purpose": "Create, edit, and analyze Excel spreadsheets (.xlsx/.xlsm/.csv) \u2014 formulas, charts, data cleanup.",
    "category": "Documents",
    "source": "Anthropic (official)"
  },
  {
    "name": "ECC",
    "url": "https://github.com/affaan-m/ECC",
    "purpose": "Agent-harness performance optimization system \u2014 skills, instincts, memory and security for Claude Code, Codex, Cursor.",
    "category": "Development",
    "source": "affaan-m"
  },
  {
    "name": "andrej-karpathy-skills",
    "url": "https://github.com/multica-ai/andrej-karpathy-skills",
    "purpose": "A single CLAUDE.md distilling Andrej Karpathy's coding-agent observations into behavior rules.",
    "category": "Development",
    "source": "multica-ai"
  },
  {
    "name": "graphify",
    "url": "https://github.com/Graphify-Labs/graphify",
    "purpose": "Turns any codebase, docs, SQL schemas, configs and PDFs into a queryable knowledge graph.",
    "category": "Development",
    "source": "Graphify-Labs"
  },
  {
    "name": "caveman",
    "url": "https://github.com/JuliusBrussee/caveman",
    "purpose": "Cuts ~65% of output tokens by making Claude Code communicate in short, blunt sentences.",
    "category": "Development",
    "source": "JuliusBrussee"
  },
  {
    "name": "awesome-claude-code",
    "url": "https://github.com/hesreallyhim/awesome-claude-code",
    "purpose": "Hand-picked, actively maintained list of Claude Code skills, agents, statuslines, and tooling.",
    "category": "Meta",
    "source": "hesreallyhim"
  },
  {
    "name": "marketingskills",
    "url": "https://github.com/coreyhaines31/marketingskills",
    "purpose": "Marketing skills for AI agents \u2014 CRO, copywriting, SEO, analytics, growth engineering.",
    "category": "Marketing",
    "source": "coreyhaines31"
  },
  {
    "name": "academic-research-skills",
    "url": "https://github.com/Imbad0202/academic-research-skills",
    "purpose": "End-to-end academic research pipeline: research \u2192 write \u2192 review \u2192 revise \u2192 finalize.",
    "category": "Research",
    "source": "Imbad0202"
  },
  {
    "name": "scientific-agent-skills",
    "url": "https://github.com/K-Dense-AI/scientific-agent-skills",
    "purpose": "Turns any AI agent into an AI Scientist \u2014 the largest agent-skills library for science.",
    "category": "Research",
    "source": "K-Dense-AI"
  },
  {
    "name": "humanizer",
    "url": "https://github.com/blader/humanizer",
    "purpose": "Removes tell-tale signs of AI-generated writing from text output.",
    "category": "Writing",
    "source": "blader"
  },
  {
    "name": "awesome-agent-skills",
    "url": "https://github.com/VoltAgent/awesome-agent-skills",
    "purpose": "Curated collection of 1000+ agent skills compatible with Claude Code, Codex, Gemini CLI, Cursor.",
    "category": "Meta",
    "source": "VoltAgent"
  },
  {
    "name": "Anthropic-Cybersecurity-Skills",
    "url": "https://github.com/mukul975/Anthropic-Cybersecurity-Skills",
    "purpose": "817 structured cybersecurity skills mapped to MITRE ATT&CK, NIST CSF 2.0 and other frameworks.",
    "category": "Security",
    "source": "mukul975"
  },
  {
    "name": "planning-with-files",
    "url": "https://github.com/OthmanAdi/planning-with-files",
    "purpose": "Persistent, crash-proof file-based planning for long-running agentic coding tasks.",
    "category": "Development",
    "source": "OthmanAdi"
  },
  {
    "name": "Claude-Code-Game-Studios",
    "url": "https://github.com/Donchitos/Claude-Code-Game-Studios",
    "purpose": "Turns Claude Code into a full game-dev studio \u2014 49 agents, 72 workflow skills, coordination layer.",
    "category": "Creative",
    "source": "Donchitos"
  },
  {
    "name": "claude-skills",
    "url": "https://github.com/alirezarezvani/claude-skills",
    "purpose": "345 Claude Code skills, agents, commands and plugins for full-stack development.",
    "category": "Development",
    "source": "alirezarezvani"
  },
  {
    "name": "huashu-design",
    "url": "https://github.com/alchaincyf/huashu-design",
    "purpose": "HTML-native high-fidelity prototyping/design skill for Claude Code.",
    "category": "Design",
    "source": "alchaincyf"
  },
  {
    "name": "notebooklm-py",
    "url": "https://github.com/teng-lin/notebooklm-py",
    "purpose": "Unofficial Python API + agentic skill giving Claude programmatic access to Google NotebookLM.",
    "category": "Research",
    "source": "teng-lin"
  },
  {
    "name": "khazix-skills",
    "url": "https://github.com/KKKKhazix/khazix-skills",
    "purpose": "Skill collection covering doc/memory closeout, analysis, and writing workflows.",
    "category": "Meta",
    "source": "KKKKhazix"
  },
  {
    "name": "Skill_Seekers",
    "url": "https://github.com/yusufkaraaslan/Skill_Seekers",
    "purpose": "Converts documentation sites, GitHub repos and PDFs into ready-to-use Claude skills automatically.",
    "category": "Meta",
    "source": "yusufkaraaslan"
  },
  {
    "name": "hallmark",
    "url": "https://github.com/Nutlope/hallmark",
    "purpose": "Anti-AI-slop design skill for Claude Code, Cursor, and Codex \u2014 pushes toward distinctive UI.",
    "category": "Design",
    "source": "Nutlope"
  },
  {
    "name": "awesome-claude-skills",
    "url": "https://github.com/travisvn/awesome-claude-skills",
    "purpose": "Curated list of Claude Skills, resources and tools for customizing Claude AI workflows.",
    "category": "Meta",
    "source": "travisvn"
  },
  {
    "name": "Auto-claude-code-research-in-sleep",
    "url": "https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep",
    "purpose": "Lightweight markdown-only skills for autonomous ML research run overnight (ARIS).",
    "category": "Research",
    "source": "wanshuiyin"
  },
  {
    "name": "Humanizer-zh",
    "url": "https://github.com/op7418/Humanizer-zh",
    "purpose": "Chinese-localized version of the Humanizer skill for de-AI-ifying text.",
    "category": "Writing",
    "source": "op7418"
  },
  {
    "name": "claude-seo",
    "url": "https://github.com/AgriciDaniel/claude-seo",
    "purpose": "Universal SEO skill \u2014 25 sub-skills and 18 sub-agents covering technical SEO and E-E-A-T.",
    "category": "Marketing",
    "source": "AgriciDaniel"
  },
  {
    "name": "AI-Research-SKILLs",
    "url": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
    "purpose": "Open-source library of AI research and engineering skills, portable to any agent.",
    "category": "Research",
    "source": "Orchestra-Research"
  },
  {
    "name": "claude-skills",
    "url": "https://github.com/Jeffallan/claude-skills",
    "purpose": "66 specialized skills that turn Claude Code into an expert full-stack pair programmer.",
    "category": "Development",
    "source": "Jeffallan"
  },
  {
    "name": "prompt-master",
    "url": "https://github.com/nidhinjs/prompt-master",
    "purpose": "Writes accurate, optimized prompts for any AI tool while minimizing token spend.",
    "category": "Meta",
    "source": "nidhinjs"
  },
  {
    "name": "claude-code-infrastructure-showcase",
    "url": "https://github.com/diet103/claude-code-infrastructure-showcase",
    "purpose": "Reference infrastructure for skill auto-activation, hooks, and multi-agent orchestration.",
    "category": "Development",
    "source": "diet103"
  },
  {
    "name": "claude-code-tips",
    "url": "https://github.com/ykdojo/claude-code-tips",
    "purpose": "40+ practical tips for getting more out of Claude Code, including a custom statusline.",
    "category": "Meta",
    "source": "ykdojo"
  },
  {
    "name": "geo-seo-claude",
    "url": "https://github.com/zubair-trabzada/geo-seo-claude",
    "purpose": "GEO-first SEO skill \u2014 optimizes content for AI-search citability, not just classic SEO.",
    "category": "Marketing",
    "source": "zubair-trabzada"
  },
  {
    "name": "book-to-skill",
    "url": "https://github.com/virgiliojr94/book-to-skill",
    "purpose": "Converts any technical book PDF into a structured, referenceable Claude Code skill.",
    "category": "Meta",
    "source": "virgiliojr94"
  },
  {
    "name": "awesome-claude-skills",
    "url": "https://github.com/ComposioHQ/awesome-claude-skills",
    "purpose": "Curated list of Claude Skills, resources and tools for customizing Claude AI workflows.",
    "category": "Meta",
    "source": "ComposioHQ"
  },
  {
    "name": "pm-claude-skills",
    "url": "https://github.com/mohitagw15856/pm-claude-skills",
    "purpose": "515 professional Agent Skills for PRDs, launches, compliance and CVs \u2014 in Anthropic's plugin directory.",
    "category": "Productivity",
    "source": "mohitagw15856"
  },
  {
    "name": "awesome-claude-code-and-skills",
    "url": "https://github.com/GetBindu/awesome-claude-code-and-skills",
    "purpose": "Collection of Claude Skills spanning coding, writing, and workflow automation.",
    "category": "Meta",
    "source": "GetBindu"
  }
];
