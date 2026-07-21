# SkillBench

A searchable, filterable directory of AI coding agent "skills" (Anthropic Agent Skills and compatible community skills) — one place to find what exists, who built it, and what it's for.

**Live site:** https://nafiz43.github.io/SkillBench/

Started 2026-07-20 as an early public tracker for the emerging AI-skills ecosystem, ahead of any dominant registry existing yet.

## What's here

- 50+ real, currently-published skills and skill collections, each with a direct GitHub link and a one-line purpose/use-case description
- Official Anthropic skills (from [anthropics/skills](https://github.com/anthropics/skills)) plus notable community skill repos across development, design, SEO, security, research, and more
- Client-side search and category filtering
- Pagination (10 per page)

## Stack

Plain HTML/CSS/JS. No build step, no framework — `data.js` holds the skill list, `app.js` renders/searches/paginates it.

## Contributing

Missing a skill? Open a PR adding an entry to the `community` list in `gen_data.py` (or directly to `data.js`) with `name`, `url`, `purpose`, `category`, `source`.
