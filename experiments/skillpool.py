"""Pool of REAL agent skills, composable into bundles of size n.

Golden rule (see CLAUDE.md): nothing here is invented or paraphrased. Every
skill's loaded text is resolved at import time out of `pipeline/skilltext/`,
which holds the verbatim `SKILL.md` / `README.md` fetched from the live repo via
`gh api`. A skill entry names either the exact lines to load (probes and
conflictors, hand-selected) or an anchor plus a word budget (fillers, a
contiguous verbatim excerpt). `_self_check()` re-asserts every loaded line is a
substring of its source file, so the pool cannot drift from the real repos.

Three roles:
  probe       -- always loaded; carries a deterministic adherence detector.
                 The three probes are mutually compatible (all brevity-family),
                 so any adherence drop under load is dilution, not conflict.
  conflictor  -- a real skill whose directive opens prose/asking where the
                 probes restrict it. `pipeline/rules.py` derives the conflict.
  filler      -- a real skill irrelevant to writing Python. Adds load, no edges.

Run `python3 experiments/skillpool.py` for the self-check.
"""
import ast
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TEXTS = os.path.join(HERE, "..", "pipeline", "skilltext")
sys.path.insert(0, os.path.join(HERE, "..", "pipeline"))
from rules import derive_edges  # noqa: E402  (the live analyzer, unmodified)


# --------------------------------------------------------------------------
# verbatim resolution
# --------------------------------------------------------------------------

def _src(fname):
    with open(os.path.join(TEXTS, fname), encoding="utf-8") as f:
        return f.read()


_SKIP = re.compile(r"^\s*(#|<|\||```|---|\*\*\[|!\[|\d+\.\s*\[)")


def _excerpt(text, anchor, words):
    """Contiguous verbatim excerpt: from the line holding `anchor`, forward,
    keeping prose/bullet lines until `words` words are collected."""
    lines = text.splitlines()
    start = next(i for i, l in enumerate(lines) if anchor in l)
    out, n = [], 0
    for l in lines[start:]:
        s = l.strip()
        if not s or _SKIP.match(s):
            if out:
                continue
            continue
        out.append(s)
        n += len(s.split())
        if n >= words:
            break
    return out


def _clean(lines):
    """Drop markdown bullet/emphasis scaffolding. Never changes a word."""
    out = []
    for l in lines:
        l = re.sub(r"^[-*+]\s+", "", l)
        l = re.sub(r"^\d+\.\s+", "", l)
        l = l.replace("**", "").replace("`", "")
        out.append(l.strip())
    return [l for l in out if l]


# --------------------------------------------------------------------------
# detectors -- deterministic, regex/AST only, no LLM judge
# --------------------------------------------------------------------------

FENCE = re.compile(r"```(?:python)?\n(.*?)```", re.S)

# verbatim from the caveman SKILL.md "Drop:" line
FILLER_WORDS = ["just", "really", "basically", "actually", "simply",
                "sure", "certainly", "of course", "happy to"]


def _strip_think(r):
    return re.sub(r"<think>.*?</think>", "", r, flags=re.S)


def prose_of(r):
    """Everything outside <think> and outside fenced code blocks."""
    return FENCE.sub(" ", _strip_think(r))


def _first_fence(r):
    return FENCE.search(_strip_think(r))


def check_no_preamble(r):
    """i-have-adhd rule 10: no preamble. Obeyed iff no prose word precedes the
    first code fence. N/A when the response contains no code at all."""
    m = _first_fence(r)
    if not m:
        return None
    return len(_strip_think(r)[:m.start()].split()) == 0


def check_no_filler(r):
    """caveman: drop filler and pleasantries. Obeyed iff none of the skill's own
    listed words appear in the prose."""
    p = prose_of(r).lower()
    return not any(re.search(rf"\b{re.escape(w)}\b", p) for w in FILLER_WORDS)


def check_minimal_code(r):
    """andrej-karpathy-skills 'Simplicity First': minimum code, nothing
    speculative, no error handling for impossible scenarios. Obeyed iff the
    emitted module defines exactly one top-level callable and uses no
    try/except. N/A when nothing parses."""
    blocks = FENCE.findall(_strip_think(r))
    for b in reversed(blocks):
        try:
            tree = ast.parse(b)
        except SyntaxError:
            continue
        tops = [n for n in tree.body
                if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))]
        if not tops:
            continue
        has_try = any(isinstance(n, ast.Try) for n in ast.walk(tree))
        return len(tops) == 1 and not has_try
    return None


def check_asks(r):
    """doc-coauthoring / book-to-skill side: did the model ask instead of act?"""
    return "?" in prose_of(r)


def check_plan_first(r):
    """planning-with-files side: did a plan appear before any code?"""
    m = _first_fence(r)
    head = _strip_think(r)[:m.start()] if m else _strip_think(r)
    return bool(re.search(r"task_plan|plan:|^\s*1\.\s", head, re.M | re.I))


# --------------------------------------------------------------------------
# the pool
# --------------------------------------------------------------------------

def S(slug, name, repo, url, src, role, pred, lines=None, anchor=None,
      words=100, probe=None, check=None, side=None):
    return dict(slug=slug, name=name, repo=repo, url=url, src=src, role=role,
                pred=pred, lines=lines, anchor=anchor, words=words,
                probe=probe, check=check, side=side)


_POOL = [
    # ---- probes: always loaded, mutually compatible, brevity family ---------
    S("adhd", "i-have-adhd", "ayghri/i-have-adhd",
      "https://github.com/ayghri/i-have-adhd", "i-have-adhd-SKILL.md",
      "probe", dict(stance="restrict", egress="prose", goal="brevity"),
      probe="no_preamble", check=check_no_preamble,
      lines=[
        "The first line is something the reader can do. Not context. Not a plan. The action.",
        "If the answer is a command, path, or snippet, it goes first. Prose comes after, if at all.",
        'Forbidden openers: "Great question," "Let me...", "I\'ll...", "Sure!", "Looking at your...", "To answer your question..."',
        'Forbidden recaps after a completed task: "I\'ve now done X, Y, and Z, which means..."',
        'Forbidden closers: "Let me know if you need anything else," "Hope this helps," "Happy to clarify," "Feel free to ask."',
        "Start with the answer. End when the answer is done.",
      ]),

    S("caveman", "caveman", "JuliusBrussee/caveman",
      "https://github.com/JuliusBrussee/caveman", "caveman-SKILL.md",
      "probe", dict(stance="restrict", egress="prose", goal="brevity"),
      probe="no_filler", check=check_no_filler,
      lines=[
        "Respond terse like smart caveman. All technical substance stay. Only fluff die.",
        "Drop: articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/of course/happy to), hedging. Fragments OK.",
        'Short synonyms (big not extensive, fix not "implement a solution for").',
        "Technical terms exact. Code blocks unchanged. Errors quoted exact.",
        "Never drop not/never/no/only/except flip meaning worse than any token saved. Numbers, units exact.",
        "Never ADD word to sound caveman. Compression only style never grow output.",
        "Answer directly in this style.",
      ]),

    S("karpathy", "andrej-karpathy-skills", "multica-ai/andrej-karpathy-skills",
      "https://github.com/multica-ai/andrej-karpathy-skills",
      "andrej-karpathy-skills.md",
      "probe", dict(stance="restrict", egress="code-bloat", goal="brevity"),
      probe="minimal_code", check=check_minimal_code,
      lines=[
        "Minimum code that solves the problem. Nothing speculative.",
        "No features beyond what was asked",
        "No abstractions for single-use code",
        'No "flexibility" or "configurability" that wasn\'t requested',
        "No error handling for impossible scenarios",
        "If 200 lines could be 50, rewrite it",
        "Would a senior engineer say this is overcomplicated? If yes, simplify.",
        "Touch only what you must. Clean up only your own mess.",
        "Every changed line should trace directly to the user's request.",
      ]),

    # ---- conflictors: open prose/asking where the probes restrict it --------
    S("doccoauth", "doc-coauthoring", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring",
      "doc-coauthoring.md",
      "conflictor", dict(stance="open", egress="prose", goal="user-agency"),
      side="asks", check=check_asks,
      lines=[
        "Ask if connected tools should be searched to learn more",
        "Wait for user confirmation before searching",
        "When user signals they've done their initial dump (or after substantial context provided), ask clarifying questions to ensure understanding:",
        "Ask if they have a template document to share",
        "Ask if there's any more context they want to provide at this stage, or if it's time to move on to drafting the document.",
        "Ask if this structure works, or if they want to adjust it.",
        "Explain that this approach helps ensure the doc works well when others read it",
      ]),

    S("booktoskill", "book-to-skill", "virgiliojr94/book-to-skill",
      "https://github.com/virgiliojr94/book-to-skill", "book-to-skill.md",
      "conflictor", dict(stance="open", egress="prose", goal="user-agency"),
      side="asks", check=check_asks,
      lines=[
        "Before extracting, ask the user:",
        "Wait for the user to confirm before proceeding. If they say \"analyze only\", switch to Mode 2.",
        "Before generating, ask the user:",
        "When more than one valid root exists, ask the user once and remember the answer for the session",
        "do not silently default",
        "ask the user which root to create",
        "present the host-appropriate options and remember the choice for the session. Do not silently pick.",
      ]),

    S("planfiles", "planning-with-files", "OthmanAdi/planning-with-files",
      "https://github.com/OthmanAdi/planning-with-files", "planning-with-files.md",
      "conflictor", dict(stance="open", egress="prose", goal="durable-planning"),
      side="plan_first", check=check_plan_first,
      lines=[
        "Create Plan First",
        "Never start without task_plan.md",
        "Log ALL Errors",
        "They help avoid repetition",
        "task_plan.md      → Track phases and progress",
        "Run ledger: an append-only JSONL record of phase transitions that replaces the raw progress.md tail in v3 modes with a fixed-shape summary.",
        "The plan lives on disk in task_plan.md, findings.md, and progress.md, not only in the context window.",
      ]),

    # ---- fillers: real skills, irrelevant to writing a Python function ------
    S("themefactory", "theme-factory", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/theme-factory",
      "theme-factory.md", "filler", {}, anchor="theme showcase"),
    S("pdf", "pdf", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/pdf",
      "pdf.md", "filler", {}, anchor="Never use Unicode"),
    S("pptx", "pptx", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/pptx",
      "pptx.md", "filler", {}, anchor="bullet"),
    S("docx", "docx", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/docx",
      "docx.md", "filler", {}, anchor="Table"),
    S("xlsx", "xlsx", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/xlsx",
      "xlsx.md", "filler", {}, anchor="workbook"),
    S("canvas", "canvas-design", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/canvas-design",
      "canvas-design.md", "filler", {}, anchor="MINIMAL TEXT"),
    S("algoart", "algorithmic-art", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/algorithmic-art",
      "algorithmic-art.md", "filler", {}, anchor="VARIABLE sections"),
    S("brand", "brand-guidelines", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/brand-guidelines",
      "brand-guidelines.md", "filler", {}, anchor="Dark: `#141413`"),
    S("webapptest", "webapp-testing", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/webapp-testing",
      "webapp-testing.md", "filler", {}, anchor="networkidle"),
    S("mcpbuilder", "mcp-builder", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/mcp-builder",
      "mcp-builder.md", "filler", {}, anchor="Read-only"),
    S("slackgif", "slack-gif-creator", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator",
      "slack-gif-creator.md", "filler", {}, anchor="Emoji fonts"),
    S("frontend", "frontend-design", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/frontend-design",
      "frontend-design.md", "filler", {}, anchor="Approach this as the design lead"),
    S("artifacts", "web-artifacts-builder", "anthropics/skills",
      "https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder",
      "web-artifacts-builder.md", "filler", {}, anchor="AI slop"),
]

POOL = {s["slug"]: s for s in _POOL}

for _s in POOL.values():
    _txt = _src(_s["src"])
    _s["body"] = _clean(_s["lines"] if _s["lines"]
                        else _excerpt(_txt, _s["anchor"], _s["words"]))

PROBES = [s for s in _POOL if False]  # placeholder replaced below
PROBES = [s["slug"] for s in _POOL if s["role"] == "probe"]
CONFLICTORS = [s["slug"] for s in _POOL if s["role"] == "conflictor"]
FILLERS = [s["slug"] for s in _POOL if s["role"] == "filler"]


# --------------------------------------------------------------------------
# bundles
# --------------------------------------------------------------------------

def _b(*slugs):
    return list(slugs)


def _fill(base, n):
    """Pad `base` to n skills with fillers, in the fixed FILLERS order."""
    out = list(base)
    for f in FILLERS:
        if len(out) >= n:
            break
        if f not in out:
            out.append(f)
    assert len(out) == n, f"not enough fillers for n={n}"
    return out


BUNDLES = {}

# E1 -- directive survival under load: 3 probes + f fillers
for _n in (3, 4, 6, 8, 10, 16):
    BUNDLES[f"e1_n{_n}"] = _fill(PROBES, _n)

# E2 -- conflict dose at matched load: n=8 always, swap fillers for conflictors
for _c in (1, 2, 3):
    BUNDLES[f"e2_c{_c}"] = _fill(PROBES + CONFLICTORS[:_c], 8)
BUNDLES["e2_c0"] = BUNDLES["e1_n8"]

# E3 -- order effects: one c=1 bundle, six fixed permutations
_E3 = BUNDLES["e2_c1"]
_PERMS = [
    [0, 1, 2, 3, 4, 5, 6, 7],           # as authored: probes first, conflictor 4th
    [7, 6, 5, 4, 3, 2, 1, 0],           # reversed
    [3, 0, 1, 2, 4, 5, 6, 7],           # conflictor first
    [0, 1, 2, 4, 5, 6, 7, 3],           # conflictor last
    [4, 0, 5, 1, 6, 2, 7, 3],           # interleaved, conflictor last
    [3, 4, 0, 5, 1, 6, 2, 7],           # interleaved, conflictor first
]
for _i, _p in enumerate(_PERMS):
    BUNDLES[f"e3_p{_i}"] = [_E3[j] for j in _p]

# E4 -- repair: drop exactly one skill from the c=3 bundle (n=8 -> n=7)
_C3 = BUNDLES["e2_c3"]


def guided_drop(bundle):
    """The skill the analyzer names on the highest-precedence conflict edge.
    Ties broken by pool order, so the choice is deterministic."""
    for _a, _bb in [(e[2], e[3]) for e in edges_of(bundle).values()
                    if e[0] == "conflict"]:
        for cand in (_a, _bb):
            if POOL[cand]["role"] == "conflictor":
                return cand
    return None


def edges_of(bundle):
    nodes = {s: dict(POOL[s]["pred"], skill=s) for s in bundle if POOL[s]["pred"]}
    return derive_edges(nodes)


def k_conflicts(bundle):
    return sum(1 for e in edges_of(bundle).values() if e[0] == "conflict")


BUNDLES["e4_guided"] = [s for s in _C3 if s != guided_drop(_C3)]
_DROPPABLE = [s for s in _C3 if s not in PROBES and s != guided_drop(_C3)]
for _i, _d in enumerate(_DROPPABLE[:3]):
    BUNDLES[f"e4_random{_i}"] = [s for s in _C3 if s != _d]


# --------------------------------------------------------------------------
# composition + scoring
# --------------------------------------------------------------------------

HEADER = ("You have the following {n} skill{s} loaded. "
          "Follow their instructions.")


def compose(bundle):
    """The skill block prepended to the system prompt, in load order."""
    if not bundle:
        return ""
    parts = [HEADER.format(n=len(bundle), s="" if len(bundle) == 1 else "s")]
    for slug in bundle:
        s = POOL[slug]
        parts.append(f"[skill: {s['name']}]\n" + "\n".join(s["body"]))
    return "\n\n".join(parts)


def score(response, bundle):
    """{probe_name: True/False/None} for every probe, plus every conflictor
    side present in the bundle. None means not applicable to this response."""
    out = {}
    for slug in bundle:
        s = POOL[slug]
        key = s["probe"] or s["side"]
        if key and key not in out:
            out[key] = s["check"](response)
    return out


def dar(adherence):
    """Directive Adherence Rate over the probe checks that applied."""
    vals = [adherence.get(p) for p in
            (POOL[s]["probe"] for s in PROBES)]
    vals = [v for v in vals if v is not None]
    return sum(vals) / len(vals) if vals else None


# --------------------------------------------------------------------------

def _norm(t):
    """Strip markdown emphasis/code marks only. No word is added or changed."""
    return re.sub(r"\s+", " ", t.replace("`", "").replace("**", ""))


def _self_check():
    for s in POOL.values():
        txt = _norm(_src(s["src"]))
        for l in (s["lines"] or []):
            assert _norm(l) in txt, \
                f"{s['slug']}: NOT VERBATIM in {s['src']}: {l!r}"
        assert s["body"], f"{s['slug']}: empty body"
    sized = {s["slug"]: len(" ".join(s["body"]).split()) for s in POOL.values()}
    lo, hi = min(sized.values()), max(sized.values())
    assert lo >= 40 and hi <= 160, f"skill lengths out of range: {sized}"

    # detectors, against hand-written responses
    good = "```python\ndef f(x):\n    return x + 1\n```"
    assert check_no_preamble(good) is True
    assert check_no_preamble("Great question! Here it is.\n" + good) is False
    assert check_no_preamble("I cannot help until you clarify.") is None
    assert check_no_filler(good) is True
    assert check_no_filler("This is just a simple fix.\n" + good) is False
    assert check_minimal_code(good) is True
    assert check_minimal_code(
        "```python\ndef helper():\n    pass\ndef f(x):\n    return x\n```") is False
    assert check_minimal_code(
        "```python\ndef f(x):\n    try:\n        return x\n    except Exception:\n        return None\n```") is False
    assert check_minimal_code("no code here") is None
    assert check_asks("Which behaviour did you want?\n" + good) is True
    assert check_asks(good) is False
    assert check_plan_first("task_plan.md first.\n" + good) is True
    assert check_plan_first(good) is False
    # thinking must not leak into prose-based checks
    assert check_no_filler("<think>this is just easy</think>" + good) is True

    # bundles
    for name, b in BUNDLES.items():
        assert len(b) == len(set(b)), f"{name}: duplicate skill"
        assert all(p in b for p in PROBES), f"{name}: missing a probe"
    assert k_conflicts(BUNDLES["e1_n16"]) == 0, "filler-only bundle must be clean"
    ks = [k_conflicts(BUNDLES[f"e2_c{c}"]) for c in range(4)]
    assert ks == sorted(ks) and ks[0] == 0, f"conflict dose not monotone: {ks}"
    assert k_conflicts(BUNDLES["e4_guided"]) < k_conflicts(BUNDLES["e2_c3"])

    print("skillpool.py self-check OK")
    print(f"  {len(POOL)} skills: {len(PROBES)} probes, "
          f"{len(CONFLICTORS)} conflictors, {len(FILLERS)} fillers")
    print(f"  words per skill: min {lo}, max {hi}")
    print(f"  bundles: {len(BUNDLES)}")
    for c in range(4):
        b = BUNDLES[f"e2_c{c}"]
        print(f"  e2_c{c}: n={len(b)} k={k_conflicts(b)} {b}")
    print(f"  guided drop from e2_c3: {guided_drop(_C3)}")
    for n in (3, 4, 6, 8, 10, 16):
        b = BUNDLES[f"e1_n{n}"]
        print(f"  e1_n{n}: {len(compose(b).split())} words loaded")


if __name__ == "__main__":
    _self_check()
