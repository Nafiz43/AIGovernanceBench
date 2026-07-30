# How recommendations are grounded

Every `[skill, importance, why]` triple in `rec-data.js` used to be a single thing:
**editorial judgment.** The golden rule (see `CLAUDE.md`) only guarantees the repo
*exists* — not that the skill does what we claim, nor that it fits the persona/task.
This layer makes each recommendation's *factual* claims checkable against source, and
labels the *judgment* as judgment.

## Four claims, and which we can actually ground

| A card implicitly claims… | Groundable? | How we ground it |
|---|---|---|
| **Exists** — the repo is real & reachable | ✅ yes | `gh api` fetch; we pin the blob SHA and the fetch date |
| **Capability** — the skill really does what we say | ✅ yes | we quote the skill's **own** `SKILL.md`/repo description, **verbatim**, with source + SHA |
| **Fit** — right pick for *this* persona/task | ⚠️ partial | stays editorial (the *"Why"*); the verbatim quote sits next to it so a reader can audit our claim |
| **Effectiveness** — it actually helps | ❌ no | **not claimed.** Needs usage data or the empirical study in `RESEARCH_PLAN.md` |

Conflating these is the real dishonesty. The UI keeps them visibly separate: a green
**"✓ Grounded"** block is a verbatim fact; the **"Why"** line is our call.

## The pipeline

```bash
python3 pipeline/ground_recs.py        # -> grounding.js  (regenerate, don't hand-edit)
python3 pipeline/ground_recs.py --limit 6   # smoke test on the first few
```

For every installable skill recommended across `rec-data.js`, `ground_recs.py` (reusing
`resolve()`/`gh_raw()` from `extract_nodes.py`):

1. Resolves the skill's repo + candidate files from its `data.js` URL (handles the
   `anthropics/skills/tree/main/skills/<name>` monorepo-subpath case).
2. Fetches the real file via `gh api repos/{repo}/contents/{path}` and reads the
   self-description, in priority order:
   - `SKILL.md` YAML frontmatter `description:` (Anthropic-format skills), else
   - the repo's GitHub `description` field (verbatim self-declared metadata), else
   - the first substantive line of the README.
3. Records the exact **blob SHA** it read and the **fetch date** → provenance you can
   diff against the live repo later.
4. Writes `grounding.js` = `const GROUNDING = { "<name>": {ok, source, path, sha, quote,
   fetched, …} }`, loaded by `index.html` before `app-rec.js`.

**No fabrication:** a skill we can't reach (or that has no quotable self-description) is
written `ok:false` with a reason and shown in the UI as *"Not machine-verified"* — its
snippet is never invented. Governance docs / link-lists (no installable repo) are
`installable:false` and cited by their URL only.

**Traction signals.** For every entry that resolves to a GitHub repo (skill *or*
governance), the same pass records real `stars` and `forks` (`gh api repos/{repo}`) and
`downloads` (summed release-asset download counts — omitted when 0, since GitHub has no
repo-level download metric for source-only repos). Monorepo-subpath skills
(`anthropics/skills/tree/main/skills/<name>`) carry the whole collection's counts, so they
are flagged `repoWide` and labelled **repo-wide** in the UI — never presented as the one
skill's own. Numbers are a snapshot as of `fetched`; re-run to refresh.

Current pass: **48/48 installable skills grounded, 0 failures**; 15 reference-only
entries correctly marked unverified.

## In the UI (`app-rec.js` → `groundRow`)

- Each skill row gets a native `<details>`: **"✓ Grounded — the skill's own words
  (source)"**, expanding to the verbatim quote + `Verbatim from <source> · blob <sha> ·
  fetched <date>`.
- The hero has a **"How grounded is each pick?"** explainer stating the four-claim split.

## What this is *not* — the honest ceiling

Grounding the skill's **self-description** proves the skill *claims* a capability; it does
not prove the claim is **true**, nor that the skill is the **best** pick, nor that it
**works**. Two higher tiers remain, and both belong to the research, not the static site:

- **Tier 3 — reproducible fit signal.** A documented, re-runnable match score
  (embedding / keyword overlap between the task text and the skill's real description) so
  the *selection* is auditable, not just hand-picked. Cheap to add; deliberately omitted
  for now so we don't imply more rigor than a keyword overlap has.
- **Tier 4 — measured effectiveness.** Whether a bundle actually improves agent behavior
  on a task — the empirical arm of `RESEARCH_PLAN.md`. No static directory can supply this.

<!-- ponytail: self-description grounding only. Tier 3/4 are research, not site features. -->
