# The Ambiguity Tax
### What unclear instructions cost an LLM, even when it still gets the answer right

**Status:** research plan / pre-registration draft
**Owner:** Nafiz Imtiaz Khan
**Last updated:** 2026-08-17
**Home project:** [AIGovernanceBench](https://github.com/Nafiz43/AIGovernanceBench)

> The companion study on conflicting co-installed skills lives in
> [RESEARCH_PLAN.md](RESEARCH_PLAN.md). The two are separate
> lines of work: that one is about *contradictory* information, this one about
> *missing* information.

---

## 0. One-paragraph pitch

Every published result on prompt ambiguity reports the same outcome variable:
accuracy. Orchid, HumanEvalComm, and Larbi et al. between them cover more than
2,000 verifiable programming tasks and all three conclude that ambiguous
requirements make models fail more often. None of them reports what the
ambiguity costs when the model *doesn't* fail. That gap matters because
production agents are billed per token and judged on latency, so a tax paid on
every successful run is invisible to an accuracy benchmark and fully visible on
an invoice. This study holds the task, the model, and the test oracle fixed,
varies only the clarity of the instruction, and measures tokens and wall time
alongside correctness. The headline quantity is the **Ambiguity Tax**: expected
token spend per correct solution under ambiguity, divided by the same quantity
under a clear prompt.

---

## 1. Motivation and gap

### 1.1 What is already known

| Work | Scale | Finding | Cost reported? |
|---|---|---|---|
| Orchid (Yang et al., 2026) | 1,304 tasks / 5,216 variants, 6 LLMs | Pass@1 drops 7.22pp mean, 31.10pp max; intra-model conflict rate on GPT-4 rises 14.09% → 28.29% | No |
| When Prompts Go Wrong (Larbi et al., 2025) | HumanEval + MBPP, GPT-4 mutations | GPT-4 Pass@1 73.8 → 34.8 (ambiguous) → 6.7 (contradictory); syntactic error rate unchanged at 95-98% | No |
| HumanEvalComm (Wu & Fard, TOSEM) | 762 modified problems | Models generate code instead of asking >60% of the time; Pass@1 down 35-52% | No |
| Underthinking/Overthinking (Su et al., 2025) | GSM8K, MATH | Response length is non-monotonic in accuracy; incorrect answers run >6,000 tokens where correct ones stay under 3,000 | Length, but as a *symptom of failure*, not a cost of ambiguity |
| Cost-of-Pass (Erol et al., ICLR 2026) | Cross-model | `v(m,p) = C(p)/R(p)`, expected spend per correct answer | Yes, but varies the *model*, not the *prompt* |

### 1.2 The gap

Two literatures sit next to each other without touching. One measures what
ambiguity does to accuracy. The other measures cost per correct answer as a
property of the model. Nobody has held the model fixed and varied prompt clarity
under a cost metric.

The consequence is a blind spot with a specific shape. Suppose a model resolves
an ambiguous requirement correctly on nine runs out of ten, the same as on the
clear version, but burns 40% more reasoning tokens getting there. Every existing
benchmark scores those two prompts identically. The operator paying the bill does
not.

### 1.3 Why this is not a rerun of Su et al.

Su et al. establish that long responses correlate with wrong answers. If we
simply reported "ambiguous prompts produce longer outputs," a reviewer would say
we had rediscovered that ambiguous prompts fail more often, which Orchid already
showed. The design answer is in §4.2: restrict the comparison to runs that pass
every test in *both* conditions. Any cost difference that survives that
restriction cannot be explained by impending failure.

---

## 2. Hypotheses

Stated in advance, to be tested as written.

- **H1 (accuracy, replication).** Pass rate is lower under every ambiguity type
  than under the clear prompt. This is a check that our harness reproduces
  established results, not a contribution.
- **H2 (cost, primary).** Ambiguity Tax > 1 for every model × ambiguity-type
  cell. Ambiguity raises expected token spend per correct solution.
- **H3 (cost conditional on success, the contribution).** Restricted to tasks
  solved correctly under both conditions, ambiguous prompts consume more output
  tokens than clear ones. This is the tax paid on runs that look perfectly fine.
- **H4 (latency).** Wall-clock generation time moves with output tokens, so the
  cost is not purely an accounting artifact.
- **H5 (locus, exploratory).** On a reasoning model, the excess is concentrated
  in the thinking block rather than the emitted answer.
- **H6 (dose-response, exploratory).** Ambiguity Tax increases with how far the
  ambiguous prompt was rewritten from the clear one.

- **H7 (skill misload, added 2026-08-17).** Loading a task-irrelevant Agent Skill
  costs more than a task-relevant one saves.
- **H8 (misload × ambiguity).** Misload hurts more when the instruction is
  ambiguous, because the loaded skill becomes the most confident thing in context.

**Direction we would accept as a null.** If H3 fails while H1 and H2 hold, the
honest conclusion is that ambiguity costs money only through failures, and the
tax collapses into the known accuracy effect. That result is publishable as a
negative and we will report it as such.

**Status after the pilots (see §7b):** H1 and H2 supported for Vagueness and
Semantic only; H3 null twice; H5 not demonstrated though its absolute finding is
striking; H6 inverted and confounded; H7 and H8 refuted in this setting.

---

## 3. Data

### 3.1 Primary: Orchid-HEval

`datasets/Orchid/Orchid-HEval/data.jsonl`, 164 tasks, Apache-2.0. Each row gives
the same programming task in five clarity conditions plus one executable test
suite:

| Field | Condition |
|---|---|
| `prompt` | clear (base HumanEval) |
| `Lexical_prompt` | a word with two possible referents |
| `Semantic_prompt` | a phrase with two readings |
| `Syntactic_prompt` | ambiguous attachment or ordering |
| `Vagueness_prompt` | an underspecified quantifier or predicate |
| `test_case` | list of `{input, output, relation}`, shared across all five |
| `solution` | reference implementation |

This is the design the hypothesis needs. Task difficulty, function signature, and
grading oracle are held fixed by construction; clarity is the only thing that
moves. 164 × 5 = 820 distinct prompts.

**Worked example, `HumanEval/0` (`has_close_elements`):**

- clear: `Check if in given list of numbers, are any two numbers closer to each other than given threshold.`
- lexical: `... in given set of numbers ...` (mathematical collection, or Python `set`? the signature says `List`)
- semantic: `... any two numbers are closer to each other than ...` (some pair is within threshold, or every number has a neighbor within threshold?)
- syntactic: `... are any two numbers closer than given threshold to each other.` (attachment ambiguity)
- vagueness: `... there are any numbers close to each other within the given threshold.` ("two" is gone; adjacent pairs or all pairs?)

All five are graded against the same tests, and the reference solution is the
all-pairs scan, so only one reading passes.

### 3.2 Perturbation size is not uniform

Character-level similarity between each variant and its base prompt has a median
of **0.95** across the 656 variants, but the tail runs to 0.15 (`HumanEval/67`
Semantic, `HumanEval/24` Semantic). Most rewrites are a word or two; a few are
near-total. Two consequences, both load-bearing:

1. Any pilot sample must be **stratified by perturbation size**. Draw 20 tasks at
   the median and the injected ambiguity may be too slight to move anything.
2. Similarity becomes a covariate, which turns H6 into a dose-response test. A
   monotone relationship between rewrite distance and tax is a stronger result
   than a single mean difference.

### 3.3 Held-out and replication sets

- `datasets/Orchid/Orchid-BCB-Expand/data.jsonl`, 976 rows, held out until the
  primary analysis is frozen.
- `datasets/HumanEvalComm/HumanEvalComm_v2.csv`, 164 problems, 762 modified
  variants (the released v2 CSV has 771 non-empty cells; the paper reports 762).
  Built by a different team with a different injection procedure, so replication
  here separates "a fact about ambiguity" from "a fact about Orchid."

### 3.4 Note on repository hygiene

`datasets/` is roughly 14 MB and is currently tracked. This repo deploys to
GitHub Pages from `main`. Decide before the full run whether to gitignore it.

---

## 4. Metrics

### 4.1 Ambiguity Tax

Adapting Cost-of-Pass by holding the model fixed and varying the prompt:

```
v(m, cond)  = mean_output_tokens(m, cond) / pass_rate(m, cond)
AT(m, type) = v(m, type) / v(m, clear)
```

`v` is expected tokens spent per correct solution. `AT = 1.9` means ambiguity
nearly doubles the bill for the same working function. Reported per model × type,
with paired bootstrap confidence intervals over tasks.

`v` is undefined when a cell's pass rate is zero. Report those cells as infinite
rather than dropping them, and note how many there are.

### 4.2 Conditional-on-success cost

The primary contribution. For each task where at least one sample passes all
tests under both the clear and the ambiguous condition, compare median output
tokens between conditions. Paired across tasks, so each task is its own control.

A significant positive difference here means ambiguity costs money on runs that
an accuracy benchmark scores as clean successes.

### 4.3 Supporting measures

- **Latency**: `eval_duration + prompt_eval_duration` from the Ollama response,
  nanoseconds.
- **Input tokens**: `prompt_eval_count`, used as a covariate. Orchid's own
  statistics report that ambiguous prompts are *shorter* than clear ones (-2.59%,
  -1.06%, -0.60% by type) with higher perplexity. If our output cost rises while
  input length falls, the naive "longer prompt, longer output" confound is dead
  on our own numbers rather than by citation.
- **Thinking-token share** on a reasoning model: tokens inside `<think>` versus
  after it, testing H5.

---

## 5. Experimental design

### 5.1 Models

`qwen3:8b` for the pilot and as the primary reasoning model; its thinking mode is
what makes H5 testable. `llama3:8b` as a non-reasoning control at matched
parameter count, which turns "reasoning vs not" into a clean contrast rather than
a confound with size. Add a third model only if the local two show a signal.

### 5.2 Sampling

Temperature 0.8, `n = 5` samples per prompt, matching Orchid so pass@1 is
comparable to their published table. Full run: 164 tasks × 5 conditions × 5
samples × 2 models = 8,200 generations.

### 5.3 Unit of analysis

The **task**, not the generation. Aggregate the 5 samples to a per-task median
before comparing conditions; then Wilcoxon signed-rank on the 164 paired
differences. A generation-level test would treat 5 correlated samples as
independent and inflate significance.

### 5.4 Controls and confound handling

| Confound | Handling |
|---|---|
| Task difficulty | Within-task pairing; the same task appears in all conditions |
| Length tracks impending failure (Su et al.) | Conditional-on-success analysis, §4.2 |
| Longer prompt causes longer output | Measure `prompt_eval_count`; Orchid's variants are *shorter* |
| Prompt perturbation per se, not ambiguity | **Padding ablation**: clear prompt plus a neutral sentence matched to the ambiguous variant's token count. If padding does not move cost but ambiguity does, the effect is ambiguity |
| Prefix caching under-reporting `prompt_eval_count` | Randomize condition order within a task; never loop conditions in blocks |
| Sampling noise | n = 5, fixed seeds recorded per generation |

### 5.5 Analysis plan, fixed in advance

Primary test: Wilcoxon signed-rank on per-task median output tokens, clear versus
each ambiguity type, restricted to dual-success tasks (H3). Four comparisons per
model, Holm-corrected. Effect size as median paired difference with a bootstrap
CI. Secondary: AT table (H2), latency (H4), thinking-share (H5), similarity
dose-response via Spearman correlation (H6).

---

## 6. Harness

Under `experiments/`:

```
run.py          # (task × condition × sample) -> Ollama /api/chat, appends JSONL
execute.py      # runs generated code against test_case in a subprocess
analyze.py      # JSONL -> AT table, paired stats, plots
results/*.jsonl # one row per generation, append-only
```

Design constraints, all learned the hard way or from the literature:

- **Non-streaming** `/api/chat`, so the response body carries `prompt_eval_count`,
  `eval_count`, `eval_duration`, `prompt_eval_duration`.
- `num_predict: 0` does **not** suppress generation in Ollama; it returns a full
  completion. Leave `num_predict` at its default for real runs.
- **Resumable**: `run.py` skips any `(task, condition, sample)` already present in
  the JSONL, so rerunning after a crash costs one row, not the run.
- **Sandboxed execution**: generated code runs in a subprocess with a 10-second
  timeout, on the GPU box, not on a laptop. It is model-written code executing
  against attacker-uncontrolled but unreviewed input.
- Extraction: strip `<think>...</think>`, take the last fenced code block, fall
  back to the whole response.

---

## 7. Phases

**Phase 0, pilot. DONE 2026-08-17,** 498 generations, results in §7b. 20 tasks
stratified by perturbation size, 5 conditions, 5 samples, `qwen3:8b`. Validated
plumbing and produced a clear pass-rate gap on two of four ambiguity types.

**Phase 1a, skill-load arms. DONE 2026-08-17,** 1,959 generations, results in
§7b.3. 4 system-prompt arms × 5 clarity levels × 20 tasks × 5 samples, split
across jackstraw and sugaree and merged with `experiments/merge.py`.

**Phase 1, full run.** Both models, 164 tasks, 5 conditions, plus the padding
ablation. Roughly 9,000 generations. Runs on sugaree or jackstraw in a named
tmux session, not the Mac.

**Phase 2, analysis.** AT table by model × type; conditional-on-success test;
tokens-versus-input-length scatter; thinking-token decomposition.

**Phase 3, generalization.** Orchid-BCB-Expand as held-out, HumanEvalComm as an
independent replication. If the tax replicates across two datasets built by
different teams, the finding is about ambiguity rather than about Orchid.

**Phase 4, write-up.** Target venue TBD; the cost framing suits an empirical
software-engineering track, and the reasoning-token decomposition suits an NLP one.

---

## 7b. Results so far (2026-08-17)

Two pilot runs are complete, 2,457 generations of `qwen3:8b` on 20 stratified
Orchid-HEval tasks. Raw data: `experiments/results/phase0.jsonl` (498 rows) and
`experiments/results/phase1_merged.jsonl` (1,959 rows, deduplicated across two
hosts). Reproduce with `python3 experiments/analyze.py --path <file>`.

### 7b.1 Ambiguity replicates, and only for two of the four types

Phase 1's no-skill arm is an independent replication of Phase 0 on different
hardware:

| condition | pass@1 (P0 / P1) | Ambiguity Tax (P0 / P1) |
|---|---|---|
| clear | 0.606 / 0.626 | 1.00 / 1.00 |
| Lexical | 0.602 / 0.582 | 1.02 / 0.98 |
| Syntactic | 0.586 / 0.622 | 0.99 / 1.06 |
| Semantic | 0.475 / 0.484 | 1.11 / 1.17 |
| Vagueness | 0.360 / 0.340 | 1.59 / 1.71 |

**H1 supported, with a caveat the literature's averages hide.** Vagueness costs
about 28 points of pass@1 and Semantic about 14, while Lexical and Syntactic are
indistinguishable from clear in both runs. Orchid's reported 7.22-point mean drop
is the average of two damaging types and two inert ones. The type breakdown is
more informative than the mean.

**H2 supported for Vagueness only.** AT ≈ 1.65 there; within noise of 1.0
elsewhere. Crucially, the tax comes almost entirely from the pass-rate
denominator: mean output tokens barely move across conditions (2,500-2,930) and
Vagueness is actually *below* clear. Ambiguity here costs money by causing
failures, not by causing longer work.

**Input length behaves as §5.4 predicted.** Ambiguous prompts are shorter than
clear ones (105.3 vs 109.5 tokens in the no-skill arm) while cost rises, so the
"longer prompt causes longer output" confound is ruled out on our own data.

### 7b.2 H3 is not supported

Restricted to tasks passing under both conditions, no-skill arm:

| vs clear | n | median delta (tokens) | p |
|---|---|---|---|
| Lexical | 12 | −203 | 0.308 |
| Semantic | 12 | −102 | 0.530 |
| Syntactic | 14 | −46 | 0.470 |
| Vagueness | 10 | −107 | 0.646 |

Every delta is negative, none is significant, and Phase 0 gave the same null with
signs that were merely inconsistent. This is the study's core claim, that
ambiguity taxes even successful runs, and two pilots show no sign of it.

Treat it as inconclusive rather than refuted: n is 10-14 paired tasks, badly
underpowered. But the effect sizes are also small, under 10% of a ~2,000-token
baseline, and small-and-noisy is a worse starting position than large-and-noisy.
Whether to spend the full 164-task run on it is now a real decision.

### 7b.3 Skill misload produced no effect (H7, H8)

Added after the ambiguity pilot: does loading an irrelevant Agent Skill cost more
than loading a relevant one? Four system-prompt arms, verbatim directives from
real repos in `data.js`, length-matched at 89-96 words (`experiments/arms.py`):
`none`; `aligned` = andrej-karpathy-skills; `misaligned` = theme-factory;
`placebo` = neutral prose. 1,959 generations, ~97 per cell.

Cost relative to no skill (`v` ratio, >1 means the arm cost more):

| clarity | aligned | misaligned | placebo |
|---|---|---|---|
| clear | 0.96 | 0.98 | 0.97 |
| Lexical | 1.14 | 0.94 | 1.00 |
| Semantic | 0.97 | 0.91 | 0.86 |
| Syntactic | 1.10 | 0.94 | 1.14 |
| Vagueness | 1.03 | 0.86 | 1.11 |

**H7 refuted in this setting.** The misaligned arm is at or below 1.00 at every
clarity level. Aligned is not reliably better. Pass@1 within a clarity level is
flat across arms to within about ±0.05.

**H8 has nothing to interact with.** The misaligned ratio does not grow as
clarity degrades.

**The most informative number is `no_code` ≈ 0.00.** `theme-factory` instructs
"Ask for their choice" and "Wait for selection: get explicit confirmation."
Across 489 generations carrying that directive, the model asked for confirmation
essentially never and wrote the function every time. It did not get confused by
the misaligned skill; it ignored it.

Interpretation: on a task this constrained (a signature, a docstring, and "reply
with a python code block"), the task instruction dominates and skill text is
inert. A real test of misload needs conditions where a skill can bite: an agentic
task with tool calls, a skill that *contradicts* the task rather than merely
being irrelevant, or a skill large enough to occupy real context. That is the
shape of [RESEARCH_PLAN.md](RESEARCH_PLAN.md)'s composition study, and this null
is useful evidence for it: irrelevance alone is not enough, contradiction is
required.

### 7b.4 H5, and an unresolved inversion

The reasoning block is **96.1-97.4% of the response** in every condition and every
arm, near-constant. Mean 9,947 characters of thinking behind a 365-character
answer on clear prompts, and one generation ran to 33,949 output tokens. The
share does not shift with ambiguity, so H5's "excess concentrates in thinking" is
not demonstrated, but the absolute finding stands: for this model on this task,
essentially all token cost is reasoning and the answer is a rounding error. It
also suggests reasoning-token spend may be saturating any ambiguity signal, which
is an argument for adding the non-reasoning control model.

**H6 came out inverted and remains unresolved.** Heavily rewritten prompts
(similarity < 0.90) produced *fewer* tokens (2,167 vs 2,853) and *higher* pass@1
(0.567 vs 0.481) than light edits, consistently at n = 490 vs 1,063. The
comparison is between-task and therefore confounded with which tasks receive
heavy rewrites, made worse by a sample stratified to overweight them. It needs a
within-task test before it means anything.

### 7b.5 Data defects found in Orchid-HEval

Now excluded automatically by `run.py:load_tasks`, which prints both counts at
every run start:

- **3 rotated variants.** `HumanEval/24`'s `Semantic_prompt` carries the
  `factorize` problem, 25 carries `remove_duplicates`, and 26 carries
  `largest_divisor`, a three-way cycle. Each is graded against its original row's
  `entry_point` and tests, so it scores zero for a reason unrelated to ambiguity.
- **27 no-op variants** are byte-identical to their clear prompt (14 Syntactic,
  7 Lexical, 6 Semantic). The injection did nothing, so they dilute the measured
  effect toward zero.

Two further variants drop a type annotation (`HumanEval/23` Vagueness,
`HumanEval/29` Syntactic); both are cosmetic and retained.

### 7b.6 Revised plan

1. Add the non-reasoning control model. If 97% of spend is reasoning, the effect
   may be invisible in a model that reasons less, or much clearer.
2. Rerun H6 within-task before drawing any conclusion from the inversion.
3. Decide on the full 164-task run for H3 with open eyes: it buys roughly 8× the
   paired n, which would detect a 200-token effect, but nothing so far suggests
   one exists.
4. Report the Vagueness/Semantic result regardless. It replicates and it is the
   solid finding.

---

## 8. Threats to validity

- **Construct.** Orchid's ambiguity was injected by a DeepSeek-V3 pipeline and
  curated over 246 person-hours. It is human-validated but still synthetic;
  naturally occurring ambiguity may differ in kind. HumanEvalComm replication in
  Phase 3 partially addresses this.
- **External.** Two open models under 15B parameters. Findings may not transfer to
  frontier models, whose stronger instruction-following could either absorb the
  ambiguity or spend more reasoning on it. Stated as a limitation, not patched
  with speculation.
- **Domain.** Python function synthesis only. Ambiguity in prose or multi-step
  agentic tasks is out of scope.
- **Metric.** Token counts are a proxy for cost; real pricing differs by provider
  and input/output tokens are billed at different rates. AT is reported in tokens,
  with a currency conversion as a secondary table.
- **Statistical.** 164 paired tasks with n = 5 is adequate for a moderate effect
  and underpowered for a small one. The pilot exists to find out which we have.
  It answered: the conditional-on-success effect, if any, is small (§7b.2).
- **Dataset defects.** Orchid-HEval ships 3 rotated variants and 27 no-op
  variants (§7b.5). Any result computed without excluding them is contaminated,
  the rotated ones guaranteeing failures unrelated to ambiguity.
- **Ceiling on the misload null.** H7 was tested on single-function synthesis with
  one model. The null says irrelevant skill text is inert *there*, not that
  skill composition is safe. See [RESEARCH_PLAN.md](RESEARCH_PLAN.md).

---

## 9. What success looks like

A single table: model × ambiguity type × Ambiguity Tax, with the
conditional-on-success column beside it showing that the tax does not vanish when
you throw away the failures. If that column is positive and significant, the
claim is that ambiguity is a cost, not just a correctness risk, and that current
benchmarks cannot see it.
