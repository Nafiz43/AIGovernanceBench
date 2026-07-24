# AIGovernanceBench

A **static site** (vanilla JS, **no framework, no build step**) deployed via **GitHub Pages from `main`** → https://nafiz43.github.io/AIGovernanceBench/. A searchable directory of AI Agent Skills & governance files, plus a persona/task **skill recommender** and an instruction-level **network analyzer**.

## Golden rule — no fabrication

Every directory entry, recommendation, and instruction-graph node MUST be a **real, existing** Agent Skill or governance file with a **live GitHub repo**. **Verify with `gh api repos/OWNER/REPO` before adding.** Never invent skills, URLs, or "instructions". The app's purpose is telling people which real skills to *import into their agents* — made-up entries break that. If a repo has no machine-readable directives (a link-list or website, e.g. the EU AI Act page), skip it, don't invent content.

## Architecture

Classic `<script>` tags share **one global scope** — a duplicate top-level `function foo(){}` in two files clobbers across them. Watch for this.

| File | Role |
|------|------|
| `data.js` | `const SKILLS` — directory entries `{name, url, purpose, category, source, type:"skill"\|"governance"}` |
| `rec-data.js` | `const RECS` — `{p, d, t, s:[[entryName, importance, why],…]}`; every `entryName` must exist in `data.js` |
| `graph-data.js` | `const GRAPHS` — instruction dependency graphs keyed by `"Persona\|Task"` (`skills`, `nodes`, `edges`) |
| `app.js` | directory view (search / filter / paginate) |
| `app-rec.js` | recommender + tab switching; builds `DIR = Map(name→entry)`; renders cards; "Network Analyzer" button when a graph exists for the pair |
| `app-graph.js` | force-directed SVG overlay: nodes = instructions, edges typed `conflict\|overlap\|depends\|reinforces` |
| `index.html` | two views (`#view-recommend` landing, `#view-directory`); loads scripts in order: data → rec-data → graph-data → app → app-rec → app-graph |

## Network Analyzer — "npm audit for agent skills"

Detects how the instructions *inside* a bundle of recommended skills depend on, overlap with, or conflict with each other (skills have no dependency/conflict resolver; two loaded in one session can silently contradict). Conflicts are the hero. POC bundle: **Radiologist × AI-assisted report drafting**.

### Regenerating a graph (offline build — Pages has no backend)

```bash
python3 pipeline/build_graph.py                       # scrape + extract + heuristic edges
python3 pipeline/annotate_graph.py                    # local-LLM edge annotation (Ollama qwen3:14b, thinking ON)
```

- **Two-tier design:** cheap topic+polarity prefilter proposes candidate cross-skill pairs → LLM classifies only survivors (cost ~linear).
- **Local LLM, no API key:** Ollama `qwen3:14b`, **thinking ON** (thinking OFF collapses edges to "reinforces"). ~30–160s/pair.
- **Known bottleneck:** regex extraction only catches modal-verb lines (must/never/only) and drops sharp directives like "paste into a fresh Claude" → classifier never sees them (GIGO). Upgrading extraction (LLM pass) is the next lever, not tuning the classifier.
- Current live approach: **hand-verified nodes + local-LLM-annotated edges**.

## Deploy

Commit to `main` and push; GitHub Pages serves in ~1–2 min. Local preview: `python3 -m http.server 8000` (browsers block `file://` for the JS).

## Branding

Navy `#002754`, gold `#DAAA01`, blue `#1155CC`. Lora (serif headings) + Inter.
