"""The hook demo: same instruction, same model, one skill added.

Runs scenario A1 twice. Once with the four directives that govern the work
(de-identification, audit scope, guideline quoting, output rail) and once with
those four plus one more real skill, doc-coauthoring's reader-testing step.
Nothing else changes: same goal, same action menu, same seeds, no enforcement.

    python3 demo_hook.py --model qwen3.8:27b --repeats 10
"""
import argparse
import concurrent.futures as cf
import copy
import json
import os
import threading

import run_sccr as R
from sccr.model import scenario_from_dict
from sccr.runner import run_once
from sccr.scoring import score_run

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = copy.deepcopy(R.RAW["A1.radiology-reader-test"])

WITHOUT = copy.deepcopy(BASE)
WITHOUT["id"] = "demo.without-skill"
WITHOUT["contracts"][0]["playbook"] = BASE["contracts"][0]["playbook"][1:]

WITH = copy.deepcopy(BASE)
WITH["id"] = "demo.with-skill"

for raw in (WITHOUT, WITH):
    R.RAW[raw["id"]] = raw
    R.SCENARIOS[raw["id"]] = scenario_from_dict(raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="qwen3.8:27b")
    ap.add_argument("--repeats", type=int, default=10)
    ap.add_argument("--threads", type=int, default=10)
    ap.add_argument("--out", default=os.path.join(HERE, "results", "raw",
                                                  "sccr_demo.jsonl"))
    a = ap.parse_args()
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    jobs = [(sid, rep) for sid in ("demo.without-skill", "demo.with-skill")
            for rep in range(a.repeats)]
    lock = threading.Lock()

    def work(job):
        sid, rep = job
        scen = R.SCENARIOS[sid]
        prov = R.OllamaProvider(a.model, "none", seed=rep, temperature=0.2,
                                menu="bare")
        res = run_once(scen, "B0_prompt", prov, model=a.model,
                       model_family="ollama", repeat=rep, max_steps=8)
        sc = score_run({"committed": list(res.committed),
                        "condition": "B0_prompt", "model": a.model,
                        "model_family": "ollama", "repeat": rep,
                        "status": res.status}, scen)
        rec = {"scenario_id": sid, "condition": "B0_prompt",
               "projection": "none", "menu": "bare", "repeat": rep,
               "model": a.model, "domain": scen.domain,
               "conflict_class": scen.conflict_class, "status": res.status,
               "committed": list(res.committed), "blocked": list(res.blocked),
               "spv": sc.spv, "sts": sc.sts, "false_refusal": sc.false_refusal,
               "attack_applicable": sc.attack_applicable,
               "attack_success": sc.attack_success,
               "forbidden_commits": sc.forbidden_commits,
               "missing_required": sc.missing_required,
               "model_calls": prov.calls, "latency_ms": res.latency_ms,
               "replies": prov.replies}
        with lock:
            with open(a.out, "a") as f:
                f.write(json.dumps(rec) + "\n")
            print(f"{sid:<22} r{rep} spv={sc.spv} "
                  f"committed={','.join(res.committed)}", flush=True)

    with cf.ThreadPoolExecutor(max_workers=a.threads) as ex:
        list(ex.map(work, jobs))


if __name__ == "__main__":
    main()
