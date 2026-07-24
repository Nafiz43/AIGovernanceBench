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
python3 pipeline/extract_nodes.py --all --quiet   # extract REAL directive nodes per skill -> pipeline/nodes/*.json
python3 pipeline/curated.py       # write LIVE graph-data.js = the hand-verified bundles only
python3 pipeline/gen_all.py       # write OFF-PROD graph-data.generated.js (all 142, drafts) — gitignored
python3 pipeline/checks.py        # write skill-health.js (badge data for the directory + badges.html)
```

**LIVE = hand-verified only.** `graph-data.js` (committed, loaded by the site) contains just the **10 hand-authored bundles** from `pipeline/curated.py` — nodes pulled verbatim from the cache by index, edges hand-authored after reading the real directives, all `verified:true`. The Network Analyzer button appears only on those 10 rec cards.

**Off-prod drafts.** `pipeline/gen_all.py` auto-generates all 142 (keyword-tagged predicates → rule engine) into `graph-data.generated.js`, which is **gitignored and NOT loaded by the site** — it preserves the work without shipping loose auto-edges. Auto-tagging can't type conflicts trustworthily (an early pass fabricated 118 false conflicts), so conflicts ship only on verified bundles. `gen_all.py` preserves ONLY `verified:true` bundles and regenerates the rest — never let it re-preserve its own prior output.

## Skill health badges

`pipeline/checks.py` runs 6 objective, offline checks (live-repo, SKILL.md, actionable, licensed, maintained, secret-free) over the skills shown in the verified bundles → `skill-health.js` (`SKILL_HEALTH` map, committed). Composite tier Gold/Silver/Bronze/Unrated. `app.js` renders a tier badge + chips under each directory card name; `badges.html` (linked in the nav) is the public rubric explaining every badge. "npm-audit for a bundle" (the analyzer) + "Scorecard/lint for one skill" (the badges) are the two pillars.

**Node extraction (`extract_nodes.py`):** resolves any skill by name from `data.js` → fetches its repo `SKILL.md`/`README.md` via `gh api` → extracts **verbatim** directive lines (modal-verb + imperative-mood, minus setup/env noise) → caches `pipeline/nodes/<slug>.json`. `--bundle "P|T"` does one pair; `--all` does every distinct recommended skill. **Nodes are per-SKILL, not per-pair** — a bundle = union of its skills' cached nodes, so full coverage = extract each skill once (O(skills), not O(pairs)).

**Coverage status:** LIVE = **10 hand-verified bundles** (6 conflicts total, incl. the Radiologist PHI leak, a Physician ambient-notes PHI leak, and a dual-use offensive-vs-guardrail conflict for AppSec). The other 132 pairs exist only as off-prod drafts. Node cache = 54/63 skills (~282 nodes; 9 skipped — websites/link-lists/libraries with no agent directives). **Extraction ceiling:** regex grabs some section headings/thin lines and the cache mixes real directives with setup noise — hand-verification means *selecting* the genuine directives (`curated.py` picks cache nodes by index). Clean `SKILL.md` extracts best.

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
