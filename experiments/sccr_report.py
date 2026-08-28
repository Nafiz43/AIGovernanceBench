"""Tables for E5. Reads the merged jsonl, prints everything the design doc needs."""
import json
import math
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "sccr"))
from run_sccr import CELLS                                   # noqa: E402
from sccr_bench import SCEN                                  # noqa: E402

R = []
for path in (sys.argv[1:] or [os.path.join(HERE, "results", "sccr_merged.jsonl")]):
    R += [json.loads(l) for l in open(path)]
R = [r for r in R if r.get("model_calls") and r["status"] != "provider-error"]
for r in R:
    r.setdefault("menu", "annotated")
PATH = ", ".join(sys.argv[1:]) or "results/sccr_merged.jsonl"
CONFLICT = {s["id"] for s in SCEN if s["oracle"]["forbidden"]}
CONTROL = {s["id"] for s in SCEN if not s["oracle"]["forbidden"]}
LABEL = {("B0_prompt", "decoy"): "B0 flat, length-matched filler",
         ("B0_prompt", "none"): "B0 flat, nothing told",
         ("B0_prompt", "policy"): "B0 flat, policy in the prompt",
         ("B1_tags", "tags"): "B1 priority tags",
         ("B2_static", "policy"): "B2 checked before, not enforced",
         ("B3_runtime", "policy"): "B3 permissions at run time",
         ("B4_sccr", "policy"): "B4 full system"}
MENUS = sorted({r["menu"] for r in R})
ALLCELLS = [c for c in
            [("B0_prompt", "none"), ("B0_prompt", "decoy"),
             ("B0_prompt", "policy"), ("B1_tags", "tags"),
             ("B2_static", "policy"), ("B3_runtime", "policy"),
             ("B4_sccr", "policy")]
            if any(r["condition"] == c[0] and r["projection"] == c[1] for r in R)]


def pick(rows, **kw):
    return [r for r in rows if all(r[k] == v for k, v in kw.items())]


def rate(rows, key):
    return (sum(r[key] for r in rows) / len(rows)) if rows else float("nan")


def wilson(k, n, z=1.96):
    if not n:
        return (float("nan"), float("nan"))
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    m = z * math.sqrt((p * (1 - p) + z * z / (4 * n)) / n) / d
    return max(0.0, c - m), min(1.0, c + m)


def ztest(a, b, key="spv"):
    ka, na = sum(r[key] for r in a), len(a)
    kb, nb = sum(r[key] for r in b), len(b)
    if not na or not nb:
        return float("nan"), float("nan")
    p = (ka + kb) / (na + nb)
    se = math.sqrt(p * (1 - p) * (1 / na + 1 / nb))
    if se == 0:
        return 0.0, 1.0
    z = (ka / na - kb / nb) / se
    return z, math.erfc(abs(z) / math.sqrt(2))


print(f"{len(R)} runs from {PATH}")
print(f"scenarios with a forbidden action: {len(CONFLICT)}   "
      f"controls: {len(CONTROL)}")
print(f"model calls: {sum(r['model_calls'] for r in R)}")
print()

print("== headline by action-menu detail, conflict scenarios only ==")
for menu in MENUS:
    sub = [r for r in R if r["scenario_id"] in CONFLICT and r["menu"] == menu]
    if not sub:
        continue
    print(f"-- menu: {menu}")
    print(f"  {'cell':<34}{'n':>5}{'violation':>11}{'95% CI':>16}"
          f"{'safe success':>14}")
    b0 = pick(sub, condition="B0_prompt", projection="none")
    for cell in ALLCELLS:
        rows = pick(sub, condition=cell[0], projection=cell[1])
        if not rows:
            continue
        k, n = sum(r["spv"] for r in rows), len(rows)
        lo, hi = wilson(k, n)
        z, p = ztest(b0, rows) if b0 and cell != ("B0_prompt", "none") else (0, 1)
        tail = f"  z={z:5.2f} p={p:.1e}" if b0 and cell != ("B0_prompt","none") else ""
        print(f"  {LABEL[cell]:<34}{n:>5}{k/n:>11.3f}"
              f"{f'[{lo:.2f},{hi:.2f}]':>16}{rate(rows,'sts'):>14.3f}{tail}")
    print()

print("== headline pooled over menus, the 8 scenarios that contain a conflict ==")
print(f"{'cell':<34}{'n':>5}{'violation':>11}{'95% CI':>16}"
      f"{'safe success':>14}{'calls':>7}")
conf = [r for r in R if r["scenario_id"] in CONFLICT]
base = None
for cell in ALLCELLS:
    rows = pick(conf, condition=cell[0], projection=cell[1])
    if not rows:
        continue
    k, n = sum(r["spv"] for r in rows), len(rows)
    lo, hi = wilson(k, n)
    print(f"{LABEL[cell]:<34}{n:>5}{k/n:>11.3f}{f'[{lo:.2f},{hi:.2f}]':>16}"
          f"{rate(rows,'sts'):>14.3f}{sum(r['model_calls'] for r in rows)/n:>7.1f}")
    if cell == ("B0_prompt", "none"):
        base = rows
print()
if base:
    print("== contrasts against B0 flat with nothing told ==")
    for cell in ALLCELLS[1:]:
        rows = pick(conf, condition=cell[0], projection=cell[1])
        if not rows:
            continue
        z, p = ztest(base, rows)
        d = rate(base, "spv") - rate(rows, "spv")
        print(f"  {LABEL[cell]:<34} drop={d:+.3f}  z={z:6.2f}  p={p:.2e}")
    print()

print("== per scenario, violation rate ==")
hdr = f"{'scenario':<30}{'class':<24}"
for cell in ALLCELLS:
    hdr += f"{cell[0][:2] + '/' + cell[1][:4]:>11}"
print(hdr)
for s in SCEN:
    row = f"{s['id']:<30}{s['conflict_class']:<24}"
    for cell in ALLCELLS:
        rows = pick(pick(R, scenario_id=s["id"]),
                    condition=cell[0], projection=cell[1])
        key = "false_refusal" if s["id"] in CONTROL else "spv"
        row += f"{rate(rows, key):>11.2f}" if rows else f"{'-':>11}"
    print(row)
print("  (control rows F1/F2 show needless refusal, not violation)")
print()

print("== by conflict class, violation rate ==")
classes = sorted({s["conflict_class"] for s in SCEN if s["id"] in CONFLICT})
hdr = f"{'class':<26}"
for cell in ALLCELLS:
    hdr += f"{cell[0][:2] + '/' + cell[1][:4]:>11}"
print(hdr)
for c in classes:
    rows_c = [r for r in conf if r["conflict_class"] == c]
    row = f"{c:<26}"
    for cell in ALLCELLS:
        rows = pick(rows_c, condition=cell[0], projection=cell[1])
        row += f"{rate(rows,'spv'):>11.2f}" if rows else f"{'-':>11}"
    print(row)
print()

print("== controls: does the safe task still get done ==")
print(f"{'cell':<34}{'n':>5}{'safe success':>14}{'needless refusal':>18}")
ctrl = [r for r in R if r["scenario_id"] in CONTROL]
for cell in ALLCELLS:
    rows = pick(ctrl, condition=cell[0], projection=cell[1])
    if rows:
        print(f"{LABEL[cell]:<34}{len(rows):>5}{rate(rows,'sts'):>14.3f}"
              f"{rate(rows,'false_refusal'):>18.3f}")
print()

print("== which action the model actually took, conflict scenarios ==")
for s in SCEN:
    if s["id"] not in CONFLICT:
        continue
    fid = s["oracle"]["forbidden"][0]
    for cell in [("B0_prompt", "none"), ("B4_sccr", "policy")]:
        rows = pick(pick(R, scenario_id=s["id"]),
                    condition=cell[0], projection=cell[1])
        if not rows:
            continue
        asked = sum(1 for r in rows if fid in r["committed"] or fid in r["blocked"])
        print(f"  {s['id']:<30}{LABEL[cell]:<34}"
              f"asked for {fid} in {asked}/{len(rows)}, "
              f"committed in {sum(1 for r in rows if fid in r['committed'])}")
