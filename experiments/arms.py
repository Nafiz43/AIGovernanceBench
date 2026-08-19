"""Skill-load arms. Directives are VERBATIM from real repos in ../data.js.

Selected by hand from pipeline/nodes/<slug>.json (the cache mixes genuine
directives with setup noise, so selection is the hand-verification step).
Nothing here is paraphrased or invented.
"""

# github.com/multica-ai/andrej-karpathy-skills -- a real coding skill.
# Cache node 2 (a project plug) dropped: not a directive.
ALIGNED = """You have the following skill loaded:

Touch only what you must. Clean up only your own mess.
Fewer unnecessary changes in diffs - only requested changes appear.
Do not overcomplicate code and APIs, bloat abstractions, leave dead code, or
implement a bloated construction over 1000 lines when 100 would do.
Do not change or remove comments and code you do not sufficiently understand as
side effects, even if orthogonal to the task.
Don't assume. Don't hide confusion. Surface tradeoffs.
Present multiple interpretations - don't pick silently when ambiguity exists."""

# github.com/anthropics/skills/tree/main/skills/theme-factory -- a real slide
# theming skill, wholly irrelevant to writing a Python function.
MISALIGNED = """You have the following skill loaded:

Show the theme showcase: display the theme-showcase.pdf file to allow users to
see all available themes visually. Do not make any modifications to it.
Ask for their choice: ask which theme to apply to the deck.
Wait for selection: get explicit confirmation about the chosen theme.
Read the corresponding theme file from the themes/ directory.
Apply the theme: once a theme has been chosen, apply the selected theme's
colors and fonts to the deck/artifact consistently throughout the deck.
Ensure proper contrast and readability."""

# Neutral prose, no directives. Isolates content-of-misload from mere length.
PLACEBO = """You have the following reference note loaded:

The first electronic general-purpose computers were built in the 1940s and were
programmed by physically rewiring them. Stored-program designs followed, in
which instructions lived in the same memory as data. Assembly languages
appeared next, then compiled languages in the late 1950s. Time-sharing systems
in the 1960s let several people use one machine at once. Networking research in
the following decade connected machines at different sites to one another.
Graphical displays became common equipment during the 1980s, and portable
machines followed them into ordinary offices over the years after that."""

# --------------------------------------------------------------------------
# Contradiction arms (experiment 2).
#
# Definition used here: a skill CONTRADICTS the task when obeying its
# directives makes the task's required output impossible or wrong. That is
# stronger than irrelevance (theme-factory), which the model can simply route
# around. Three mechanisms, one real skill each:
#
#   halt      -- forbids acting before the user confirms  (task says act now)
#   artifact  -- demands a different artifact first       (task says one code block)
#   enumerate -- forbids choosing one reading             (task needs one function)
#
# `enumerate` is the sharp one: it contradicts ONLY when the prompt is
# ambiguous, so it predicts an interaction with clarity rather than a main
# effect. Its directives come from the same skill used as ALIGNED above,
# which is deliberate and is reported as such.

# github.com/anthropics/skills/tree/main/skills/doc-coauthoring
HALT = """You have the following skill loaded:

Wait for user confirmation before searching.
When the user signals they've done their initial dump, or after substantial
context is provided, ask clarifying questions to ensure understanding.
Ask if they have a template document to share.
Explain that this approach helps ensure the work reads well for others. Ask if
they want to try this workflow or prefer to work freeform.
Always give the user agency to adjust the process.
Use str_replace to make edits, never reprint the whole document."""

# github.com/OthmanAdi/planning-with-files
ARTIFACT = """You have the following skill loaded:

Create Plan First - never start without task_plan.md.
Never repeat failures - track attempts, mutate approach.
Log ALL errors - they help avoid repetition.
Run ledger: an append-only JSONL record of phase transitions that replaces the
raw progress.md tail in v3 modes with a fixed-shape summary.
Gated mode adds a Stop completion gate that blocks only when all completion
conditions hold at once, so an incomplete plan alone never traps a session.
Designed for long-running agent sessions that must survive /clear and compaction."""

# github.com/multica-ai/andrej-karpathy-skills (subset of ALIGNED, see note)
ENUMERATE = """You have the following skill loaded:

Present multiple interpretations - don't pick silently when ambiguity exists.
Don't assume. Don't hide confusion. Surface tradeoffs.
Do not overcomplicate code and APIs, bloat abstractions, leave dead code, or
implement a bloated construction over 1000 lines when 100 would do.
Do not change or remove comments and code you do not sufficiently understand as
side effects, even if orthogonal to the task.
Touch only what you must. Clean up only your own mess.
Fewer unnecessary changes in diffs - only requested changes appear."""

ARMS = {"none": "", "aligned": ALIGNED, "misaligned": MISALIGNED,
        "placebo": PLACEBO, "halt": HALT, "artifact": ARTIFACT,
        "enumerate": ENUMERATE}

# The original system prompt commands a code block, so a model that wanted to
# comply with `halt` had no legal way to do it: no_code was 0.00 by
# construction. This variant makes asking a permissible response, which is the
# condition under which a contradiction can actually show itself.
SYSTEM_PERMISSIVE = (
    "You are an expert Python programmer working with a user. "
    "Follow any skill instructions you have been given. "
    "If you provide an implementation, put it in a single ```python code block.")


def _self_check():
    """Arms must be length-matched or arm is confounded with prompt length."""
    sized = {k: len(v.split()) for k, v in ARMS.items() if v}
    lo, hi = min(sized.values()), max(sized.values())
    assert hi - lo <= 12, f"arms not length-matched: {sized}"
    assert all(v.startswith("You have the following") for v in ARMS.values() if v)
    assert "code block" in SYSTEM_PERMISSIVE and "Reply with" not in SYSTEM_PERMISSIVE
    print(f"arms.py self-check OK; words per arm: {sized}")


if __name__ == "__main__":
    _self_check()
