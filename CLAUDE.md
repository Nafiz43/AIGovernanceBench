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

**Live approach = deterministic rule engine (no LLM).** Nodes are hand-curated real
directives; edges are derived from small per-node predicates.

```bash
python3 pipeline/rules.py         # derive edges + score vs the 13-edge gold set
python3 pipeline/test_rules.py    # assert 13/13 recall, 0 spurious
python3 pipeline/gen_graph.py     # rewrite graph-data.js edges from the engine
```

- **How it works:** each node carries `(stance/egress, overlap-class, produces/consumes, goal)`. Four rules → edges: conflict = one node *opens* an egress object another *restricts* (linked objects bridge draft⊇PHI); overlap = same class, different skill; depends = consumer needs producer's artifact; reinforces = shared goal. Precedence conflict>overlap>depends>reinforces.
- **Perf:** reproduces all 13 hand-curated edges, 0 spurious, ~0.04 ms (vs qwen3:14b ~43 min, which collapsed 16/19 edges to "reinforces"). Explainable — every edge emits its "because".
- **Human input is O(n) predicates/node**, not O(n²) edges. Edit predicates in `pipeline/rules.py`, never the edges array directly.
- **Soft spot:** `reinforces` leans on a hand-assigned `goal` tag — the place a small NLI/BERT model could later auto-suggest tags. Structural rules (conflict/overlap/depends) are the strong part.

### Legacy LLM pipeline (superseded, kept for reference)

```bash
python3 pipeline/build_graph.py       # scrape + extract + heuristic edges
python3 pipeline/annotate_graph.py    # local-LLM edge annotation (Ollama qwen3:14b, thinking ON)
```

Two-tier: topic+polarity prefilter → LLM classifies survivors. Bottleneck was **extraction** (regex only caught modal-verb lines, dropped sharp directives like "paste into a fresh Claude"). The rule engine replaced it as the live path.

## Deploy

Commit to `main` and push; GitHub Pages serves in ~1–2 min. Local preview: `python3 -m http.server 8000` (browsers block `file://` for the JS).

## Branding

Navy `#002754`, gold `#DAAA01`, blue `#1155CC`. Lora (serif headings) + Inter.
