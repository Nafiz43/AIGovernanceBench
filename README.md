# AIGovernanceBench

A searchable, filterable directory tracking the files that govern AI coding agents — instruction files (CLAUDE.md, AGENTS.md, Cursor/Windsurf rules), guardrail frameworks, compliance standards, and Anthropic Agent Skills. A Skill is a governance file too: a scoped instruction set that governs how an agent should approach one specific task.

**Live site:** https://nafiz43.github.io/AIGovernanceBench/

Started 2026-07-20 as an early public tracker for the emerging AI-governance ecosystem, ahead of any dominant registry existing yet.

## What's here

- 50 real, currently-published Agent Skills and skill collections, each with a direct GitHub link and a one-line purpose/use-case description
- 17 governance files/frameworks — instruction-file standards (AGENTS.md, CLAUDE.md, Cursor Rules, Windsurf Rules, Copilot instructions), guardrail toolkits (NeMo Guardrails, Guardrails AI, Llama Guard, Rebuff), and standards/lists (OWASP LLM Top 10, MITRE ATT&CK, NIST AI RMF, EU AI Act, and more)
- Client-side search, category filter, and a Skills/Governance type toggle
- Pagination (10 per page)

## Stack

Plain HTML/CSS/JS. No build step, no framework — `data.js` holds the full list, `app.js` renders/searches/filters/paginates it.

## Contributing

Missing something? Open a PR adding an entry to `gen_data.py` (the `community` or `governance` list) with `name`, `url`, `purpose`, `category`, `source`, `type`.
