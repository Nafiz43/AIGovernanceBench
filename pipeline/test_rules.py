"""Score the rule engine against the 13 hand-curated edges (the gold set).

Run:  python3 pipeline/test_rules.py
"""
from rules import derive_edges

# The 13 hand-verified edges in graph-data.js — treated as ground truth.
GOLD = {
    frozenset(("dc-reader-test", "di-local-only")): "conflict",
    frozenset(("dc-image-alt", "di-local-only")):   "conflict",
    frozenset(("dc-generate", "ng-output-rail")):   "conflict",
    frozenset(("ng-output-rail", "ga-validate")):   "overlap",
    frozenset(("ng-dialog-rail", "ga-schema")):     "overlap",
    frozenset(("eu-oversight", "dc-confirm")):      "depends",
    frozenset(("eu-oversight", "ng-output-rail")):  "depends",
    frozenset(("eu-data-gov", "di-local-only")):    "depends",
    frozenset(("eu-logging", "di-audit-only")):     "depends",
    frozenset(("ga-schema", "cr-quote")):           "depends",
    frozenset(("cr-quote", "ng-output-rail")):      "reinforces",
    frozenset(("cr-quote", "ga-validate")):         "reinforces",
    frozenset(("di-no-mapping", "di-audit-only")):  "reinforces",
}

# Extra edges the engine surfaces that gold omits but are defensible (reported,
# not counted as errors). Both: di-local-only shares the PHI-containment goal.
DEFENSIBLE_EXTRA = {
    frozenset(("di-local-only", "di-no-mapping")),
    frozenset(("di-local-only", "di-audit-only")),
}


def score(edges, gold, verbose=False):
    got = {k: v[0] for k, v in edges.items()}
    matched = [k for k in gold if got.get(k) == gold[k]]
    mistyped = [k for k in gold if k in got and got[k] != gold[k]]
    missing = [k for k in gold if k not in got]
    extra = [k for k in got if k not in gold]
    bad_extra = [k for k in extra if k not in DEFENSIBLE_EXTRA]

    recall = len(matched) / len(gold)
    # precision counts defensible extras as correct, only bad_extra as wrong
    precision = len(matched) / (len(matched) + len(bad_extra)) if (matched or bad_extra) else 1.0

    if verbose:
        def name(k):
            return " × ".join(sorted(k))
        print(f"\nGold edges: {len(gold)}   Engine edges: {len(got)}\n")
        print(f"  matched (type-correct):   {len(matched)}/{len(gold)}")
        print(f"  wrong type:               {len(mistyped)}")
        print(f"  missed:                   {len(missing)}")
        print(f"  extra (defensible):       {len(extra) - len(bad_extra)}")
        print(f"  extra (spurious):         {len(bad_extra)}")
        print(f"\n  RECALL   {recall:5.0%}   PRECISION {precision:5.0%}")
        by = {}
        for k in gold:
            t = gold[k]
            by.setdefault(t, [0, 0])
            by[t][1] += 1
            if k in matched:
                by[t][0] += 1
        print("\n  per-type recall:")
        for t in ("conflict", "overlap", "depends", "reinforces"):
            if t in by:
                print(f"    {t:12s} {by[t][0]}/{by[t][1]}")
        for k in mistyped:
            print(f"  ! wrong type {name(k)}: got {got[k]}, want {gold[k]}")
        for k in missing:
            print(f"  ! missed     {name(k)} ({gold[k]})")
        for k in sorted(extra, key=lambda k: k not in DEFENSIBLE_EXTRA):
            tag = "defensible" if k in DEFENSIBLE_EXTRA else "SPURIOUS"
            print(f"  + extra      {name(k)}: {got[k]} [{tag}]")
    return recall, precision


def test():
    edges = derive_edges()
    recall, precision = score(edges, GOLD)
    got = {k: v[0] for k, v in edges.items()}
    # every gold edge reproduced with the right type
    for k, t in GOLD.items():
        assert got.get(k) == t, f"{sorted(k)}: got {got.get(k)}, want {t}"
    # no spurious edges outside the defensible allowlist
    bad = [k for k in got if k not in GOLD and k not in DEFENSIBLE_EXTRA]
    assert not bad, f"spurious edges: {[sorted(k) for k in bad]}"
    assert recall == 1.0 and precision == 1.0
    print("OK: rule engine reproduces all 13 gold edges, 0 spurious.")


if __name__ == "__main__":
    test()
