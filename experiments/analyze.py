"""JSONL -> Ambiguity Tax table + paired conditional-on-success test."""
import argparse
import json
import os
import statistics as st
from collections import defaultdict

CONDITIONS = ["clear", "Lexical", "Semantic", "Syntactic", "Vagueness"]
AMB = CONDITIONS[1:]


def load(path):
    rows = [json.loads(l) for l in open(path)]
    bad = [r for r in rows if r.get("out_tokens") is None]
    if bad:
        print(f"note: dropping {len(bad)} incomplete generations "
              f"(done_reason={set(r.get('done_reason') for r in bad)})")
    return [r for r in rows if r.get("out_tokens") is not None]


def wilcoxon(diffs):
    """Signed-rank statistic + normal-approx two-sided p. Ties get mean ranks."""
    d = [x for x in diffs if x != 0]
    n = len(d)
    if n < 6:
        return None, None
    order = sorted(range(n), key=lambda i: abs(d[i]))
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and abs(d[order[j + 1]]) == abs(d[order[i]]):
            j += 1
        avg = (i + j) / 2 + 1
        for k in range(i, j + 1):
            ranks[order[k]] = avg
        i = j + 1
    w_pos = sum(r for r, x in zip(ranks, d) if x > 0)
    mu = n * (n + 1) / 4
    sigma = (n * (n + 1) * (2 * n + 1) / 24) ** 0.5
    z = (w_pos - mu) / sigma
    # two-sided normal tail
    p = 2 * (1 - 0.5 * (1 + _erf(abs(z) / 2 ** 0.5)))
    return z, p


def _erf(x):
    t = 1 / (1 + 0.3275911 * x)
    y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t
              - 0.284496736) * t + 0.254829592) * t * pow(2.718281828, -x * x)
    return y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--path", default=os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "results", "phase0.jsonl"))
    a = ap.parse_args()
    rows = load(a.path)

    by = defaultdict(list)          # (task, cond) -> rows
    for r in rows:
        by[(r["name"], r["condition"])].append(r)
    tasks = sorted({r["name"] for r in rows})

    # ---- aggregate cell stats -------------------------------------------
    print(f"\n{len(rows)} generations | {len(tasks)} tasks | "
          f"model={rows[0]['model']}\n")
    print(f"{'condition':<10} {'pass@1':>7} {'out_tok':>9} {'in_tok':>8} "
          f"{'sec':>7} {'v=tok/pass':>11} {'AT':>7}")
    base_v = None
    for c in CONDITIONS:
        rs = [r for r in rows if r["condition"] == c]
        if not rs:
            print(f"{c:<10} {'(no rows yet)':>7}")
            continue
        pr = sum(r["passed_all"] for r in rs) / len(rs)
        ot = st.mean(r["out_tokens"] for r in rs)
        it = st.mean(r["in_tokens"] for r in rs)
        sec = st.mean((r["eval_ns"] + (r["prompt_eval_ns"] or 0)) / 1e9 for r in rs)
        v = ot / pr if pr else float("inf")
        if c == "clear":
            base_v = v
        at = v / base_v if base_v else float("nan")
        print(f"{c:<10} {pr:>7.3f} {ot:>9.1f} {it:>8.1f} {sec:>7.1f} "
              f"{v:>11.1f} {at:>7.2f}")

    # ---- H3: conditional on success, paired by task ----------------------
    print(f"\nConditional on success (tasks passing in BOTH conditions)")
    print(f"{'vs clear':<10} {'n':>4} {'med clear':>10} {'med amb':>9} "
          f"{'delta':>8} {'p':>8}")
    for c in AMB:
        diffs, mc, ma = [], [], []
        for t in tasks:
            ok_c = [r for r in by[(t, "clear")] if r["passed_all"]]
            ok_a = [r for r in by[(t, c)] if r["passed_all"]]
            if not ok_c or not ok_a:
                continue
            a_ = st.median(r["out_tokens"] for r in ok_c)
            b_ = st.median(r["out_tokens"] for r in ok_a)
            mc.append(a_)
            ma.append(b_)
            diffs.append(b_ - a_)
        if not diffs:
            print(f"{c:<10} {0:>4}   (no dual-success tasks)")
            continue
        _, p = wilcoxon(diffs)
        ps = f"{p:.3f}" if p is not None else "n/a"
        print(f"{c:<10} {len(diffs):>4} {st.median(mc):>10.0f} "
              f"{st.median(ma):>9.0f} {st.median(diffs):>+8.0f} {ps:>8}")

    # ---- H6: dose-response ----------------------------------------------
    print(f"\nPerturbation size vs cost (ambiguous conditions only)")
    amb = [r for r in rows if r["condition"] != "clear"]
    lo = [r for r in amb if r["similarity"] < 0.9]
    hi = [r for r in amb if r["similarity"] >= 0.9]
    for label, g in (("heavily rewritten (<0.90)", lo), ("light edit (>=0.90)", hi)):
        if g:
            print(f"  {label:<26} n={len(g):<4} out_tok="
                  f"{st.mean(r['out_tokens'] for r in g):>7.1f}  pass@1="
                  f"{sum(r['passed_all'] for r in g) / len(g):.3f}")

    # ---- H5: thinking share ---------------------------------------------
    arms_report(rows)

    rows = [r for r in rows if "answer_chars" in r]  # drop pre-fix legacy rows
    if any(r.get("think_chars") for r in rows):
        print(f"\nReasoning vs answer (chars); share = think/(think+answer)")
        for c in CONDITIONS:
            rs = [r for r in rows if r["condition"] == c]
            if not rs:
                continue
            th = st.mean(r["think_chars"] for r in rs)
            an = st.mean(r["answer_chars"] for r in rs)
            print(f"  {c:<10} think={th:>8.0f}  answer={an:>7.0f}  "
                  f"share={th / (th + an):.3f}")


def arms_report(rows):
    """Misload Tax vs Skill Benefit, per clarity level (plan H7/H8)."""
    arms = sorted({r.get("arm", "none") for r in rows})
    if len(arms) < 2:
        return
    print("\n" + "=" * 64)
    print("SKILL-LOAD ARMS   v = mean output tokens / pass@1")
    for cond in CONDITIONS:
        sub = [r for r in rows if r["condition"] == cond]
        if not sub:
            continue
        print(f"\n{cond}")
        print(f"  {'arm':<12} {'n':>4} {'pass@1':>7} {'no_code':>8} "
              f"{'out_tok':>9} {'v':>9} {'vs none':>8}")
        base = None
        for arm in ["none"] + [a for a in arms if a != "none"]:
            rs = [r for r in sub if r.get("arm", "none") == arm]
            if not rs:
                continue
            pr = sum(r["passed_all"] for r in rs) / len(rs)
            nc = sum(r.get("no_code", False) for r in rs) / len(rs)
            ot = st.mean(r["out_tokens"] for r in rs)
            v = ot / pr if pr else float("inf")
            if arm == "none":
                base = v
            ratio = v / base if base else float("nan")
            print(f"  {arm:<12} {len(rs):>4} {pr:>7.3f} {nc:>8.3f} "
                  f"{ot:>9.1f} {v:>9.1f} {ratio:>8.2f}")
    print("\n  vs none > 1 = that arm cost more per correct solution.")
    print("  H7: misaligned ratio > (1 / aligned ratio).")
    print("  H8: misaligned ratio larger under ambiguity than under clear.")


if __name__ == "__main__":
    main()
