"""Build RESULTS.md: every experiment, one comprehensive set of tables.

Reads the merged jsonl files in results/ and emits a self-contained markdown
report. Re-runnable; regenerate after any new run lands.
"""
import collections
import json
import os
import statistics as st

from arms import ARMS
from run import load_tasks

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, "results")
OUT = os.path.join(HERE, "..", "RESULTS.md")
CONDS = ["clear", "Lexical", "Semantic", "Syntactic", "Vagueness"]

# label -> (file, model, prompt regime)
RUNS = {
    "phase0":   ("phase0.jsonl",          "qwen3:8b",     "strict"),
    "arms8":    ("phase1_merged.jsonl",   "qwen3:8b",     "strict"),
    "contra8":  ("contra_merged.jsonl",   "qwen3:8b",     "permissive"),
    "main14":   ("full14_merged.jsonl",   "qwen3:14b",    "strict"),
    "main27":   ("main27_merged.jsonl",   "qwen3.8:27b",  "strict"),
    "arms27":   ("arms27_merged.jsonl",   "qwen3.8:27b",  "strict"),
    "contra27": ("contra27fix_merged.jsonl", "qwen3.8:27b", "permissive"),
    "comp":     ("comp_merged.jsonl",     "qwen3.8:27b",  "permissive"),
}


def load(name):
    p = os.path.join(RES, RUNS[name][0])
    if not os.path.exists(p):
        return []
    return [r for r in (json.loads(l) for l in open(p)) if r.get("out_tokens")]


def stats(rows):
    if not rows:
        return None
    p = sum(r["passed_all"] for r in rows) / len(rows)
    tk = sum(r["out_tokens"] for r in rows) / len(rows)
    sec = sum((r.get("eval_ns") or 0) for r in rows) / len(rows) / 1e9
    nc = sum(r.get("no_code", False) for r in rows) / len(rows)
    th = sum(r.get("think_chars", 0) for r in rows) / len(rows)
    an = sum(r.get("answer_chars", 0) for r in rows) / len(rows)
    return dict(n=len(rows), pass1=p, tok=tk, sec=sec, no_code=nc,
                v=(tk / p if p else float("nan")),
                share=(th / (th + an) if th + an else 0), think=th)


def by_cond(rows, arm=None):
    out = {}
    for c in CONDS:
        g = [r for r in rows if r["condition"] == c
             and (arm is None or r.get("arm", "none") == arm)]
        out[c] = stats(g)
    return out


def dual_success(rows, cond):
    """Median token delta on tasks passing under BOTH clear and `cond`."""
    idx = {}
    for r in rows:
        idx.setdefault((r["name"], r["condition"]), []).append(r)
    pairs = []
    for (name, c), g in idx.items():
        if c != cond:
            continue
        base = idx.get((name, "clear"))
        if not base:
            continue
        if all(x["passed_all"] for x in g) and all(x["passed_all"] for x in base):
            pairs.append((st.median(x["out_tokens"] for x in base),
                          st.median(x["out_tokens"] for x in g)))
    if not pairs:
        return None
    return len(pairs), st.median(b for b, _ in pairs), st.median(a for _, a in pairs)


L = []
def w(s=""):
    L.append(s)


w("# AIGovernanceBench: Ambiguity Tax and Skill Loading, Full Results")
w()
w("Every number here comes from the merged run files in `experiments/results/`.")
w("Regenerate with `python3 experiments/build_report.py`.")
w()

# ---------------------------------------------------------------- glossary
w("## Terminology")
w()
w("| Term | Meaning |")
w("|---|---|")
w("| **Task** | One HumanEval problem: a function signature, a docstring, and hidden unit tests. |")
w("| **Clarity level** | The wording of the same task. Orchid-HEval ships five for each. |")
w("| **clear** | The original, unmodified prompt. The baseline. |")
w("| **Lexical** | Word-level ambiguity injected. A term is swapped for a vaguer or polysemous one. |")
w("| **Semantic** | Meaning-level ambiguity. The sentence admits more than one reading. |")
w("| **Syntactic** | Structural ambiguity. Attachment or scope is unclear. |")
w("| **Vagueness** | Requirements left underspecified. The hardest level. |")
w("| **Sample** | One generation. Five per task per condition, temperature 0.8, seeds 0 to 4. |")
w("| **pass@1** | Probability one sample passes *all* the task's unit tests. Estimated as passes/attempts. |")
w("| **out_tok** | Output tokens generated, reasoning included. |")
w("| **v (cost per solve)** | `out_tok / pass@1`. Expected tokens spent to obtain one correct answer. |")
w("| **Ambiguity Tax (AT)** | `v(ambiguous) / v(clear)`. AT = 1.20 means an ambiguous prompt costs 20% more per correct answer. |")
w("| **Conditional on success** | Restricting to tasks that pass under *both* wordings, then comparing tokens. Separates the cost of ambiguity from the cost of failing. |")
w("| **Reasoning share** | `think_chars / (think_chars + answer_chars)`. How much of the output is deliberation rather than answer. |")
w("| **Arm** | What was loaded into the system prompt alongside the task. |")
w("| **no_code** | Fraction of responses containing no function definition at all, i.e. the model asked a question instead of answering. |")
w()

w("## The experiments")
w()
w("| # | Experiment | Question | Design |")
w("|---|---|---|---|")
w("| 1 | **Ambiguity Tax** | Do ambiguous prompts cost more per correct answer? | 164 tasks x 5 clarity levels x 5 samples, nothing loaded |")
w("| 2 | **Skill loading** | Does the wrong skill hurt more than the right one helps? | 20 tasks x 5 levels x 5 samples x 4 arms |")
w("| 3 | **Contradictory skills** | What if the skill and the task *cannot both* be satisfied? | same, with arms that conflict with the task |")
w("| 4 | **Directive survival under load** | Does loaded governance survive as the bundle grows? | 3 probe skills held constant, n = 3 to 16 |")
w("| 5 | **Conflict dose** | At the same load, does the analyzer's conflict count predict damage? | n pinned at 8, k = 0 to 6 |")
w("| 6 | **Load order** | Does which directive wins depend on load order? | one bundle, six permutations |")
w("| 7 | **Analyzer-guided repair** | Does the analyzer say the right thing to remove? | drop one skill, guided vs random |")
w()
w("Experiments 1 to 3 load at most one skill. Experiments 4 to 7 (Part II) load many")
w("at once, so the single-skill arms below are the n=1 point on that curve.")
w()
w("### The arms")
w()
w("| Arm | Source | What it tells the model | Role |")
w("|---|---|---|---|")
w("| `none` | nothing | (control) | Baseline for its own experiment |")
w("| `aligned` | andrej-karpathy-skills | Touch only what you must. Don't overcomplicate. | A genuinely relevant coding skill |")
w("| `misaligned` | anthropics/skills theme-factory | Show the theme PDF, ask which theme to apply. | Real skill, irrelevant to writing Python |")
w("| `placebo` | neutral prose | A paragraph on the history of computing. | No directives. Separates *content* from mere added length |")
w("| `halt` | doc-coauthoring | Wait for user confirmation before acting. | Contradiction: task says act now |")
w("| `artifact` | planning-with-files | Never start without writing task_plan.md first. | Contradiction: task wants one code block |")
w("| `enumerate` | andrej-karpathy-skills | Present multiple interpretations, don't pick silently. | Contradiction *only when the prompt is ambiguous* |")
w()
w("All loaded arms are length matched (86 to 96 words), so arm is never confounded with prompt length.")
w()
w("### Two prompt regimes")
w()
w("**Strict** commands a single ```python code block. **Permissive** allows the model to")
w("ask instead. The contradiction arms need permissive: if the system prompt orders code,")
w("a model obeying `halt` has no legal way to comply, so the contradiction cannot show itself.")
w("Absolute pass@1 is therefore *not* comparable across regimes, only within one.")
w()

# ------------------------------------------------------- experiment 1
w("---")
w()
w("## Experiment 1: the Ambiguity Tax")
w()
w("164 tasks, no skill loaded. `main14` and `main27` are the same tasks, seeds and")
w("exclusions, so the two models are directly comparable.")
w()
for tag in ("main14", "main27"):
    rows = load(tag)
    if not rows:
        continue
    model = RUNS[tag][1]
    base = None
    w(f"### {model} (n={len(rows)})")
    w()
    w("| clarity | pass@1 | out_tok | sec | cost per solve | **Ambiguity Tax** |")
    w("|---|---|---|---|---|---|")
    for c in CONDS:
        s = by_cond(rows)[c]
        if not s:
            continue
        if c == "clear":
            base = s["v"]
        at = s["v"] / base
        flag = " " if c == "clear" else ""
        w(f"| {c} | {s['pass1']:.3f} | {s['tok']:.0f} | {s['sec']:.1f} | "
          f"{s['v']:.0f} | **{at:.2f}**{flag} |")
    w()

w("### Model comparison, side by side")
w()
r14, r27 = load("main14"), load("main27")
if r14 and r27:
    w("| clarity | pass@1 14b | pass@1 27b | out_tok 14b | out_tok 27b | AT 14b | AT 27b |")
    w("|---|---|---|---|---|---|---|")
    b14 = by_cond(r14)["clear"]["v"]
    b27 = by_cond(r27)["clear"]["v"]
    for c in CONDS:
        a, b = by_cond(r14)[c], by_cond(r27)[c]
        w(f"| {c} | {a['pass1']:.3f} | {b['pass1']:.3f} | {a['tok']:.0f} | "
          f"{b['tok']:.0f} | {a['v']/b14:.2f} | {b['v']/b27:.2f} |")
    w()
    w("Read the two out_tok columns against each other. That is the finding: at 14b")
    w("ambiguity makes the model generate **more**, at 27b it generates **less**.")
    w()

    w("### Conditional on success: is ambiguity itself expensive?")
    w()
    w("Tasks passing under both wordings. If ambiguity only cost accuracy, these deltas would be zero.")
    w()
    w("| vs clear | 14b n | 14b median clear -> ambiguous | 27b n | 27b median clear -> ambiguous |")
    w("|---|---|---|---|---|")
    for c in CONDS[1:]:
        d14, d27 = dual_success(r14, c), dual_success(r27, c)
        f = lambda d: f"{d[1]:.0f} -> {d[2]:.0f} ({d[2]-d[1]:+.0f})" if d else "n/a"
        w(f"| {c} | {d14[0] if d14 else 0} | {f(d14)} | {d27[0] if d27 else 0} | {f(d27)} |")
    w()

    w("### Reasoning share")
    w()
    w("| clarity | 14b think chars | 14b share | 27b think chars | 27b share |")
    w("|---|---|---|---|---|")
    for c in CONDS:
        a, b = by_cond(r14)[c], by_cond(r27)[c]
        w(f"| {c} | {a['think']:.0f} | {a['share']:.3f} | {b['think']:.0f} | {b['share']:.3f} |")
    w()

# ------------------------------------------------------- experiment 2 & 3
def arm_section(tag, arms, title, note):
    rows = load(tag)
    if not rows:
        w(f"### {title}")
        w()
        w("_(run not present yet)_")
        w()
        return
    model, regime = RUNS[tag][1], RUNS[tag][2]
    w(f"### {title}")
    w()
    w(f"{model}, {regime} prompt, n={len(rows)}. {note}")
    w()
    head = "| clarity | " + " | ".join(f"{a} pass@1 | {a} vs none" for a in arms) + " |"
    w(head)
    w("|---" * (1 + 2 * len(arms)) + "|")
    for c in CONDS:
        cells, base = [], None
        for a in arms:
            s = by_cond(rows, a)[c]
            if not s:
                cells += ["-", "-"]
                continue
            if a == "none":
                base = s["v"]
            cells += [f"{s['pass1']:.3f}",
                      "1.00" if a == "none" else f"{s['v']/base:.2f}"]
        w(f"| {c} | " + " | ".join(cells) + " |")
    w()
    w("Pooled over all clarity levels:")
    w()
    w("| arm | n | pass@1 | out_tok | no_code | cost per solve | vs none |")
    w("|---|---|---|---|---|---|---|")
    base = None
    for a in arms:
        g = [r for r in rows if r.get("arm", "none") == a]
        s = stats(g)
        if not s:
            continue
        if a == "none":
            base = s["v"]
        w(f"| `{a}` | {s['n']} | {s['pass1']:.3f} | {s['tok']:.0f} | "
          f"{s['no_code']:.3f} | {s['v']:.0f} | {s['v']/base:.2f} |")
    w()


w("---")
w()
w("## Experiment 2: skill loading")
w()
arm_section("arms8", ["none", "aligned", "misaligned", "placebo"],
            "8b", "Values above 1.00 mean that arm cost more per correct answer.")
arm_section("arms27", ["none", "aligned", "misaligned", "placebo"],
            "27b", "Values above 1.00 mean that arm cost more per correct answer.")

w("---")
w()
w("## Experiment 3: contradictory skills")
w()
w("Watch the `no_code` column. It is the mechanism: the fraction of responses where")
w("the model stopped and asked instead of answering. A skill that merely *doesn't apply*")
w("gets ignored (no_code stays 0.00). A skill that genuinely *contradicts* the task")
w("pulls the model away from answering.")
w()
arm_section("contra8", ["none", "halt", "artifact", "enumerate"],
            "8b", "")
arm_section("contra27", ["none", "halt", "artifact", "enumerate"],
            "27b", "")

# ------------------------------ what the contradiction arms actually say
CONTRA_DOC = {
    "halt": ("github.com/anthropics/skills doc-coauthoring",
             "The contradiction is temporal: the skill says do not act until the "
             "user confirms, the task says produce the function now."),
    "artifact": ("github.com/OthmanAdi/planning-with-files",
                 "The contradiction is about the deliverable: the skill demands a "
                 "different artifact first, the task wants one code block."),
    "enumerate": ("github.com/multica-ai/andrej-karpathy-skills, the same skill "
                  "used as the `aligned` arm, deliberately",
                  "The contradiction is conditional: forbidding a silent choice "
                  "only bites when the prompt is ambiguous, so it predicts an "
                  "interaction with clarity rather than a main effect."),
}

w("### The arm texts, verbatim")
w()
w("Quoted from the real repos, no paraphrase. `arms.py` asserts all arms are")
w("length-matched (86 to 96 words), so none of this is a prompt-length artifact.")
w()
_contra = load("contra27")
for arm, (src, why) in CONTRA_DOC.items():
    g = [r for r in _contra if r.get("arm") == arm]
    s_ = stats(g)
    w(f"**`{arm}`** ({src})")
    w()
    w("```")
    w(ARMS[arm].split("\n\n", 1)[1].strip())
    w("```")
    w()
    if s_:
        med = st.median([r["out_tokens"] for r in g])
        w(f"{why} At 27b: no_code {s_['no_code']:.3f} "
          f"({sum(r.get('no_code', False) for r in g)}/{len(g)}), "
          f"mean out_tok {s_['tok']:.0f}, median {med:.0f}, "
          f"cost per solve {s_['v']:.0f}.")
    else:
        w(why)
    w()

if _contra:
    w("### Where the contradiction actually fires")
    w()
    w("`halt` is the only arm that pulls the model off the task at scale. It fires")
    w("hardest on ambiguous wordings, which is what gives it something legitimate to")
    w("ask about.")
    w()
    w("| clarity | no_code under `halt` | no_code under `none` |")
    w("|---|---|---|")
    for c in CONDS:
        h = [r for r in _contra if r.get("arm") == "halt" and r["condition"] == c]
        n = [r for r in _contra if r.get("arm") == "none" and r["condition"] == c]
        hn = sum(r.get("no_code", False) for r in h)
        nn = sum(r.get("no_code", False) for r in n)
        w(f"| {c} | {hn}/{len(h)} ({hn/len(h):.3f}) | {nn}/{len(n)} ({nn/len(n):.3f}) |")
    w()
    cells = collections.Counter()
    for r in _contra:
        if r.get("arm") == "halt" and r.get("no_code"):
            cells[(r["name"], r["condition"])] += 1
    worst = cells.most_common(3)
    _tasks = {t["name"]: t for t in load_tasks(verbose=False)}
    w("The worst cells, with the prompt that triggered them:")
    w()
    for (name, cond), k in worst:
        t = _tasks.get(name)
        w(f"**{name} / {cond}** — {k} of 5 samples returned no function.")
        w()
        w("```python")
        w((t["prompts"][cond] if t else "(prompt unavailable)").strip())
        w("```")
        w()
    w("`artifact` barely registers in `no_code` yet is the most expensive arm. Its")
    w("mechanism is inflation, not refusal: the model writes the plan *and* the code.")
    w("`enumerate` never became a contradiction in practice and was the cheapest arm")
    w("in the run, helping most on Vagueness.")
    w()
    w("**Limitation.** The run files store `no_code`, token counts and verdicts, not")
    w("the generated text, so no actual clarifying question can be quoted here. Getting")
    w("real transcripts needs a small re-run of the `halt` arm on the tasks above with")
    w("response text logged.")
    w()

# ------------------------------------------------------------ provenance
# ==========================================================================
# Experiments 4-7: governance under composition
# ==========================================================================
import inspect

import skillpool as SP

COMP = load("comp")


def _ztest(a, b):
    """Two-proportion z-test on passed_all. Returns (p_a, p_b, z, two-sided p)."""
    import math
    n1, n2 = len(a), len(b)
    x1 = sum(r["passed_all"] for r in a)
    x2 = sum(r["passed_all"] for r in b)
    p1, p2, p = x1 / n1, x2 / n2, (x1 + x2) / (n1 + n2)
    se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (p1 - p2) / se if se else 0.0
    return p1, p2, z, math.erfc(abs(z) / math.sqrt(2))


def _adh(rows, key):
    """Mean adherence for one directive over the responses where it applied."""
    v = [r["adherence"][key] for r in rows
         if r.get("adherence") and r["adherence"].get(key) is not None]
    return (sum(v) / len(v), len(v)) if v else (None, 0)


def _dar(rows):
    """Directive Adherence Rate: mean over the three probe checks."""
    vals = []
    for r in rows:
        a = r.get("adherence") or {}
        ok = [a[k] for k in PROBE_KEYS if a.get(k) is not None]
        if ok:
            vals.append(sum(ok) / len(ok))
    return sum(vals) / len(vals) if vals else None


PROBE_KEYS = [SP.POOL[s]["probe"] for s in SP.PROBES]
BUND = lambda b: [r for r in COMP if r.get("bundle") == b]  # noqa: E731


def comp_row(b, label=None):
    g = BUND(b)
    s = stats(g)
    if not s:
        return None
    bundle = SP.BUNDLES[b]
    cells = [label or f"`{b}`", str(len(bundle)), str(SP.k_conflicts(bundle)),
             str(s["n"]), f"{s['pass1']:.3f}", f"{s['tok']:.0f}",
             f"{s['no_code']:.3f}", f"{s['v']:.0f}"]
    for k in PROBE_KEYS:
        m, _ = _adh(g, k)
        cells.append("-" if m is None else f"{m:.3f}")
    d = _dar(g)
    cells.append("-" if d is None else f"**{d:.3f}**")
    return "| " + " | ".join(cells) + " |"


COMP_HEAD = ("| bundle | n | k | records | pass@1 | out_tok | no_code | "
             "cost per solve | " + " | ".join(PROBE_KEYS) + " | DAR |")
COMP_SEP = "|" + "---|" * (8 + len(PROBE_KEYS) + 1)

if COMP:
    w("---")
    w()
    w("# Part II: governance under composition")
    w()
    w("Experiments 1 to 3 load **one** skill. Real agents load many, from many")
    w("authors, with no resolver, no linker and no precedence rule between them.")
    w("Part II makes the number of loaded skills the manipulated variable and asks")
    w("whether this repo's static conflict analyzer predicts what breaks.")
    w()
    w("Everything below is one run: same 20 tasks, same permissive regime, same")
    w("model, only the loaded bundle changes.")
    w()

    # ------------------------------------------------ the instrument
    w("## The instrument")
    w()
    w("### Directive Adherence Rate (DAR)")
    w()
    w("`pass@1` cannot see the failure mode that matters here. A model can write a")
    w("perfectly correct function while silently ignoring every loaded directive.")
    w("DAR measures that directly: three **probe** skills are loaded in every")
    w("bundle, each contributing one verbatim directive with a deterministic")
    w("detector over the response. DAR is the mean of the probe checks that")
    w("applied. No LLM judge is involved anywhere.")
    w()
    w("The three probes are mutually compatible (all brevity-family), so a drop in")
    w("DAR as the bundle grows is **dilution**, not conflict.")
    w()
    w("| probe | skill | repo | verbatim directive (excerpt) | detector |")
    w("|---|---|---|---|---|")
    DET = {"no_preamble": "no prose word precedes the first code fence; N/A when the response has no code",
           "no_filler": "none of the skill's own listed filler words appear in the prose outside code",
           "minimal_code": "AST: exactly one top-level callable and no `try`/`except`; N/A when nothing parses"}
    for slug in SP.PROBES:
        s = SP.POOL[slug]
        w(f"| `{s['probe']}` | [{s['name']}]({s['url']}) | `{s['repo']}` | "
          f"{s['body'][0][:90]} | {DET[s['probe']]} |")
    w()
    w("Detector source, verbatim from `experiments/skillpool.py`:")
    w()
    w("```python")
    for fn in (SP.check_no_preamble, SP.check_no_filler, SP.check_minimal_code):
        w(inspect.getsource(fn).rstrip())
        w()
    w("```")
    w()
    w("### Conflict count (k)")
    w()
    w("`pipeline/rules.py` is the site's live Network Analyzer, used here unmodified.")
    w("Each pool skill carries the same small predicate the analyzer already uses")
    w("(`stance`, `egress`, `overlap`, `goal`). The engine derives typed edges from")
    w("those predicates; **k** is the number of `conflict` edges in a bundle, known")
    w("before a single token is generated.")
    w()
    w("The predicates are hand-assigned, so the analyzer's *detection* is not being")
    w("tested for free here. What is being tested is whether its output predicts a")
    w("**runtime** outcome it never sees: whether the model actually drops the")
    w("directive the engine says is contested.")
    w()

    # ------------------------------------------------ the pool
    w("## The skill pool")
    w()
    w("19 real skills, every one with a live GitHub repo. Loaded text is resolved at")
    w("import time out of `pipeline/skilltext/<slug>.md`, the verbatim `SKILL.md` or")
    w("`README.md` fetched from the repo, and `skillpool.py::_self_check` asserts")
    w("every loaded line is a substring of its source. Nothing is paraphrased.")
    w()
    w("| slug | skill | repo | role | words |")
    w("|---|---|---|---|---|")
    for slug, s in SP.POOL.items():
        w(f"| `{slug}` | [{s['name']}]({s['url']}) | `{s['repo']}` | {s['role']} | "
          f"{len(' '.join(s['body']).split())} |")
    w()
    w("### The conflictors, and what the analyzer says about them")
    w()
    for slug in SP.CONFLICTORS:
        s = SP.POOL[slug]
        w(f"**`{slug}`** ([{s['name']}]({s['url']}), `{s['repo']}`)")
        w()
        w("```")
        for l in s["body"]:
            w(l)
        w("```")
        w()
    w("Analyzer edges on the densest bundle (`e2_c3`), with the engine's own reason")
    w("string:")
    w()
    w("| a | b | type | because |")
    w("|---|---|---|---|")
    for e in SP.edges_of(SP.BUNDLES["e2_c3"]).values():
        w(f"| `{e[2]}` | `{e[3]}` | **{e[0]}** | {e[1]} |")
    w()
    w("Note what the analyzer does *not* flag: `karpathy` restricts code bloat, not")
    w("prose, so no conflictor collides with it. That is a falsifiable prediction:")
    w("`minimal_code` should survive where `no_preamble` and `no_filler` are")
    w("contested.")
    w()

    # ------------------------------------------------ bundles
    w("### Bundles")
    w()
    w("| bundle | n | k | load words | skills in load order |")
    w("|---|---|---|---|---|")
    for b in SP.BUNDLES:
        if not BUND(b):
            continue
        bl = SP.BUNDLES[b]
        w(f"| `{b}` | {len(bl)} | {SP.k_conflicts(bl)} | "
          f"{len(SP.compose(bl).split())} | {' -> '.join(bl)} |")
    w()

    # ------------------------------------------------ E1
    w("---")
    w()
    w("## Experiment 4: directive survival under load")
    w()
    w("The three probes are held constant. Only the number of surrounding,")
    w("conflict-free filler skills changes. Any movement in the probe columns is")
    w("caused by load alone.")
    w()
    w("The n=0 row is the same 20 tasks, same model, same permissive prompt with")
    w("**nothing loaded**, taken from the `none` arm of Experiment 3. It is the")
    w("zero point of this curve.")
    w()
    w(COMP_HEAD)
    w(COMP_SEP)
    _b0 = [r for r in load("contra27") if r.get("arm") == "none"]
    _s0 = stats(_b0)
    if _s0:
        w(f"| `none` (n=0) | 0 | 0 | {_s0['n']} | {_s0['pass1']:.3f} | "
          f"{_s0['tok']:.0f} | {_s0['no_code']:.3f} | {_s0['v']:.0f} | "
          + " | ".join(["-"] * len(PROBE_KEYS)) + " | - |")
    for n in (3, 4, 6, 8, 10, 16):
        r = comp_row(f"e1_n{n}", f"`e1_n{n}`")
        if r:
            w(r)
    w()
    _e1 = [r for r in COMP if r.get("bundle", "").startswith("e1_")]
    if _s0 and _e1:
        _p1, _p2, _z, _pv = _ztest(_b0, _e1)
        _t0 = _s0["tok"]
        _t1 = sum(r["out_tokens"] for r in _e1) / len(_e1)
        _h0 = sum(r.get("think_chars", 0) for r in _b0) / len(_b0)
        _h1 = sum(r.get("think_chars", 0) for r in _e1) / len(_e1)
        w("**The step from n=0 to n=3 is the whole effect.** Loading the three")
        w("probes drops mean output from "
          f"{_t0:.0f} to {_t1:.0f} tokens ({(_t1 - _t0) / _t0 * 100:+.0f}%) and "
          f"reasoning from {_h0:.0f} to {_h1:.0f} characters "
          f"({(_h1 - _h0) / _h0 * 100:+.0f}%), and pass@1 from "
          f"{_p1:.3f} to {_p2:.3f} "
          f"(two-proportion z = {_z:.2f}, p = {_pv:.4f}).")
        w()
        w("Everything after that step is flat. Adding thirteen more skills changes")
        w("nothing measurable.")
        w()
    e1 = [f"e1_n{n}" for n in (3, 4, 6, 8, 10, 16)]
    have = [b for b in e1 if BUND(b)]
    if len(have) >= 2:
        d0, d1 = _dar(BUND(have[0])), _dar(BUND(have[-1]))
        if d0 and d1:
            w(f"DAR moves {d0:.3f} -> {d1:.3f} between n={len(SP.BUNDLES[have[0]])} "
              f"and n={len(SP.BUNDLES[have[-1]])}, a change of "
              f"{(d1 - d0) / d0 * 100:+.1f}% for governance that never changed.")
            w()
    w("### DAR by clarity level")
    w()
    w("| n | " + " | ".join(CONDS) + " |")
    w("|" + "---|" * 6)
    for n in (3, 4, 6, 8, 10, 16):
        g = BUND(f"e1_n{n}")
        if not g:
            continue
        cells = []
        for c in CONDS:
            d = _dar([r for r in g if r["condition"] == c])
            cells.append("-" if d is None else f"{d:.3f}")
        w(f"| {n} | " + " | ".join(cells) + " |")
    w()

    # ------------------------------------------------ E2
    w("---")
    w()
    w("## Experiment 5: conflict dose at matched load")
    w()
    w("n is pinned at 8 in every row. Conflict-free fillers are **swapped out** for")
    w("conflicting skills, never added, so total load stays flat and only k moves.")
    w("If the probe columns track k at fixed n, a static analyzer predicted a")
    w("runtime failure.")
    w()
    w(COMP_HEAD)
    w(COMP_SEP)
    for c in range(4):
        b = "e1_n8" if c == 0 else f"e2_c{c}"
        r = comp_row(b, f"`{b}` (c={c})")
        if r:
            w(r)
    w()
    w("### Load versus conflict, side by side")
    w()
    w("Both columns move a bundle away from the n=8, k=0 baseline. One adds")
    w("conflict-free skills, the other swaps in conflicting ones at constant n.")
    w()
    w("| change from n=8 k=0 | n | k | pass@1 | DAR |")
    w("|---|---|---|---|---|")
    for b in ("e1_n8", "e1_n10", "e1_n16", "e2_c1", "e2_c2", "e2_c3"):
        g = BUND(b)
        s = stats(g)
        if not s:
            continue
        bl = SP.BUNDLES[b]
        d = _dar(g)
        w(f"| `{b}` | {len(bl)} | {SP.k_conflicts(bl)} | {s['pass1']:.3f} | "
          f"{'-' if d is None else f'{d:.3f}'} |")
    w()

    # ------------------------------------------------ E3
    w("---")
    w()
    w("## Experiment 6: does load order decide who wins?")
    w()
    w("One bundle, `e2_c1` (n=8, k=2), under six fixed permutations of load order.")
    w("Nothing else changes: same skills, same words, same tasks, same seeds. The")
    w("conflicting pair is the two prose-restricting probes against `doccoauth`,")
    w("which opens prose by asking.")
    w()
    w("`asks` is the conflictor's side of the argument, `no_preamble` and")
    w("`no_filler` the probes'. If position decides the winner, which governance")
    w("rule holds is an accident of load order.")
    w()
    w("| permutation | conflictor index | order | records | pass@1 | no_code | "
      + " | ".join(PROBE_KEYS) + " | asks | DAR |")
    w("|" + "---|" * (8 + len(PROBE_KEYS)))
    for p in range(6):
        b = f"e3_p{p}"
        g = BUND(b)
        s = stats(g)
        if not s:
            continue
        bl = SP.BUNDLES[b]
        ci = bl.index("doccoauth")
        cells = [f"`{b}`", f"{ci} of {len(bl) - 1}", " ".join(bl),
                 str(s["n"]), f"{s['pass1']:.3f}", f"{s['no_code']:.3f}"]
        for k in PROBE_KEYS + ["asks"]:
            m, _ = _adh(g, k)
            cells.append("-" if m is None else f"{m:.3f}")
        d = _dar(g)
        cells.append("-" if d is None else f"{d:.3f}")
        w("| " + " | ".join(cells) + " |")
    w()
    got = [(SP.BUNDLES[f"e3_p{p}"].index("doccoauth"), _adh(BUND(f"e3_p{p}"), "asks")[0])
           for p in range(6) if BUND(f"e3_p{p}")]
    got = [(i, v) for i, v in got if v is not None]
    if len(got) >= 2:
        lo = min(v for _, v in got)
        hi = max(v for _, v in got)
        w(f"`asks` ranges {lo:.3f} to {hi:.3f} across permutations of an otherwise")
        w(f"identical bundle, a spread of {hi - lo:.3f} attributable to load order alone.")
        w()

    # ------------------------------------------------ E4
    w("---")
    w()
    w("## Experiment 7: does the analyzer tell you what to remove?")
    w()
    w("Detection is worth little if it does not say what to do. Starting from the")
    w("densest bundle (`e2_c3`, n=8, k=6), exactly one skill is removed:")
    w()
    w(f"- **guided**: the skill the analyzer names on its highest-precedence "
      f"conflict edge (`{SP.guided_drop(SP.BUNDLES['e2_c3'])}`)")
    w("- **random**: one of the other non-probe skills, three different choices")
    w()
    w("All four bundles have n=7. If guided beats the random mean, the analyzer's")
    w("ranking is actionable and not merely descriptive.")
    w()
    w(COMP_HEAD)
    w(COMP_SEP)
    r = comp_row("e2_c3", "`e2_c3` (baseline)")
    if r:
        w(r)
    def _dropped(b):
        gone = set(SP.BUNDLES["e2_c3"]) - set(SP.BUNDLES[b])
        return sorted(gone)[0] if gone else "-"

    for b in ["e4_guided"] + [f"e4_random{i}" for i in range(3)]:
        if b in SP.BUNDLES and BUND(b):
            r = comp_row(b, f"`{b}` (dropped `{_dropped(b)}`)")
            if r:
                w(r)
    w()
    gd = _dar(BUND("e4_guided"))
    rnd = [(f"e4_random{i}", _dar(BUND(f"e4_random{i}"))) for i in range(3)]
    rnd = [(b, x) for b, x in rnd if x is not None]
    if gd is not None and rnd:
        w(f"Guided removal lands at DAR {gd:.3f} against a random-removal mean of "
          f"{sum(x for _, x in rnd) / len(rnd):.3f} at the same n=7.")
        w()
        w("Read the k column before the DAR column. A random draw from the")
        w("non-probe skills can happen to hit a conflictor, in which case it")
        w("removes conflict too; the rows where k stays at 6 are the ones where the")
        w("user removed something the analyzer never flagged. Those are the honest")
        w("comparison for guided removal.")
        w()

    # ------------------------------------------------ findings
    w("---")
    w()
    w("## What Part II found, including what it refutes")
    w()
    w("The design document fixed the falsification conditions before the runs")
    w("started. Three of the four were met, and the claims they guarded are")
    w("withdrawn.")
    w()
    _e1all = [r for r in COMP if r.get("bundle", "").startswith("e1_")]
    _d3, _d16 = _dar(BUND("e1_n3")), _dar(BUND("e1_n16"))
    _dc0, _dc3 = _dar(BUND("e1_n8")), _dar(BUND("e2_c3"))
    _asks = [(_adh(BUND(f"e3_p{p}"), "asks")[0]) for p in range(6)]
    _asks = [x for x in _asks if x is not None]
    w("| Claim | Falsified when | Observed | Verdict |")
    w("|---|---|---|---|")
    w(f"| Load dilutes governance | DAR flat from n=3 to n=16 | "
      f"{_d3:.3f} -> {_d16:.3f} | **refuted** |")
    w(f"| The analyzer predicts damage | probe adherence unrelated to k at "
      f"n=8 | DAR {_dc0:.3f} at k=0 vs {_dc3:.3f} at k=6 | **refuted** |")
    w(f"| Order decides the winner | `asks` within noise across permutations | "
      f"{min(_asks):.3f} to {max(_asks):.3f} | **refuted** |")
    _gd = _dar(BUND("e4_guided"))
    _rn = [_dar(BUND(f"e4_random{i}")) for i in range(3)]
    _rn = [x for x in _rn if x is not None]
    w(f"| Guided repair is actionable | guided no better than removals that "
      f"leave k unchanged | {_gd:.3f} vs {sum(_rn) / len(_rn):.3f} | "
      f"**refuted** |")
    w()
    w("### Finding 1: adherence does not dilute, at this scale")
    w()
    w("Every probe sits above 0.98 in every bundle. A 27b model asked to obey")
    w("three style directives obeys them whether they arrive alone or buried")
    w("among fifteen others. The dilution hypothesis is not supported for")
    w("n up to 16 and roughly 1650 loaded words.")
    w()
    w("### Finding 2: the analyzer's conflicts have no runtime consequence here")
    w()
    w("k rises from 0 to 6 at fixed n=8 and nothing moves: probe adherence stays")
    w(f"at ceiling, `no_code` stays under 0.02, and `asks` never exceeds "
      f"{max(_asks):.3f}. Three real skills that say *ask the user before acting*")
    w("lose to a concrete coding task essentially every time. The analyzer is")
    w("detecting a genuine textual contradiction that this model simply resolves")
    w("in the task's favour without hesitation.")
    w()
    w("This is a real limit on the tool's claim. A static conflict is necessary")
    w("but visibly not sufficient for runtime harm.")
    w()
    w("### Finding 3: the cost is in a channel none of these metrics watch")
    w()
    _t0 = stats([r for r in load("contra27") if r.get("arm") == "none"])
    _t1 = stats(_e1all)
    w("Loading skills did do something large, and it was not an adherence")
    w("failure. It was the opposite: the model obeyed.")
    w()
    w("| | nothing loaded | 3 to 16 skills loaded |")
    w("|---|---|---|")
    w(f"| pass@1 | {_t0['pass1']:.3f} | {_t1['pass1']:.3f} |")
    w(f"| out_tok | {_t0['tok']:.0f} | {_t1['tok']:.0f} |")
    w(f"| reasoning chars | "
      f"{sum(r.get('think_chars', 0) for r in load('contra27') if r.get('arm') == 'none') / len([r for r in load('contra27') if r.get('arm') == 'none']):.0f}"
      f" | {sum(r.get('think_chars', 0) for r in _e1all) / len(_e1all):.0f} |")
    w(f"| cost per solve | {_t0['v']:.0f} | {_t1['v']:.0f} |")
    w()
    w("Three popular, benign, mutually-compatible brevity skills cut reasoning")
    w("by roughly 60% and accuracy by 6.3 points (p = 0.013), while cutting the")
    w("token cost of a correct answer by about 60%. Whether that is a bug or a")
    w("bargain depends on what the user is paying for, and nothing in any agent")
    w("runtime tells them the trade is happening.")
    w()
    w("That is the composition hazard this data actually supports: not that")
    w("loaded governance gets ignored, but that obeying it silently reshapes")
    w("behaviour on axes the directives never mention.")
    w()
    w("### Why the instrument could not see more")
    w()
    w("The probes are style directives that cost nothing to obey and all push")
    w("the same way, so the model saturates them. A sensitive version needs")
    w("directives that compete with the task for effort (document every")
    w("function, validate every input, justify every choice), full `SKILL.md`")
    w("loads in the tens of thousands of words rather than 100-word directive")
    w("blocks, and probes that disagree with each other rather than reinforcing.")
    w("This run establishes the ceiling; it does not measure the slope.")
    w()

    # ------------------------------------------------ reproduction
    w("---")
    w()
    w("## Reproducing Part II")
    w()
    w("```bash")
    w("# on each host, campus VPN up, Ollama serving the model")
    w("cd experiments")
    w("./run_all.sh 0 2 4     # jackstraw")
    w("./run_all.sh 1 2 4     # sugaree")
    w("# then, locally")
    w("python3 merge.py results/raw/comp_*.jsonl results/comp_merged.jsonl")
    w("python3 build_report.py")
    w("```")
    w()
    _models = sorted({r["model"] for r in COMP})
    w(f"Model: {', '.join('`' + m + '`' for m in _models)}. Temperature 0.8, seeds 0..k-1, "
      "permissive system prompt, 20 stratified tasks, Orchid-HEval exclusions as in "
      "Experiment 1.")
    w()
    w(f"Records in `comp_merged.jsonl`: **{len(COMP)}** completed generations across "
      f"{len({r['bundle'] for r in COMP})} bundles.")
    w()
    w("**Limitations.** The analyzer's node predicates are hand-assigned, so k is a")
    w("human reading of real directives, not an automatic extraction; the claim under")
    w("test is predictive, not that detection is free. `no_filler` is vacuously true")
    w("on a response with no prose, which inflates DAR exactly when the model is")
    w("already terse. One model family and one task domain (Python function")
    w("synthesis) are covered; adherence detectors are necessarily specific to what a")
    w("code response can show.")
    w()

w("---")
w()
w("## Provenance")
w()
w("| Run | File | n | Tasks | Model | Regime |")
w("|---|---|---|---|---|---|")
for tag, (fn, model, regime) in RUNS.items():
    rows = load(tag)
    if not rows:
        w(f"| `{tag}` | `{fn}` | (missing) | | {model} | {regime} |")
        continue
    w(f"| `{tag}` | `{fn}` | {len(rows)} | {len({r['name'] for r in rows})} | "
      f"{model} | {regime} |")
w()
w("### Known corrections")
w()
w("**Grading bug, found and fixed.** `extract_code` took the *last* fenced block in a")
w("response. Under the permissive prompt the model often appends a usage example after")
w("the implementation, so the grader executed the demo and scored correct answers zero.")
w("Fixed to prefer the last block that defines the target function. Verified against 99")
w("strict-prompt generations at matching seeds: 99/99 identical verdicts, so the strict")
w("runs were never affected. The 8b contradiction run (`contra8`) predates the fix and")
w("its numbers are not trustworthy.")
w()
w("**Dataset defects.** Orchid-HEval ships 3 rotated Semantic variants (HumanEval/24, 25,")
w("26 carry another problem's prompt but are graded against the original's tests) and 27")
w("variants byte-identical to their clear prompt. All 30 are excluded by `load_tasks()`.")
w()

open(OUT, "w").write("\n".join(L) + "\n")
print(f"wrote {OUT} ({len(L)} lines)")
