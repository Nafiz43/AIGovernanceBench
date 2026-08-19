"""Generate + grade (task x condition x sample) against Ollama. Resumable."""
import argparse
import concurrent.futures as cf
import difflib
import json
import os
import random
import re
import threading
import urllib.request

from arms import ARMS, SYSTEM_PERMISSIVE
from execute import grade

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "datasets", "Orchid", "Orchid-HEval", "data.jsonl")
CONDITIONS = ["clear", "Lexical", "Semantic", "Syntactic", "Vagueness"]
OLLAMA = os.environ.get("OLLAMA_URL", "http://localhost:11434") + "/api/chat"

SYSTEM = ("You are an expert Python programmer. Complete the function. "
          "Reply with a single ```python code block containing the full function.")


SIG = re.compile(r"^\s*def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*(->[^:]*)?:", re.M | re.S)


def _defines(prompt, entry_point):
    """True if the prompt declares entry_point. Some prompts define helper
    functions first, so check every def, not just the first."""
    return any(name == entry_point for name, _, _ in SIG.findall(prompt))


def load_tasks(verbose=True):
    """Load Orchid-HEval, dropping variants that cannot be graded fairly.

    Orchid ships three rotated Semantic variants (HumanEval/24 carries the
    factorize problem, 25 carries remove_duplicates, 26 carries
    largest_divisor). They are graded against the original row's entry_point
    and tests, so they score zero for a reason unrelated to ambiguity.
    A further 27 variants are byte-identical to their clear prompt, i.e. the
    injection was a no-op; those dilute the effect toward zero.
    """
    rows = [json.loads(l) for l in open(DATA)]
    rotated, noop = [], []
    for r in rows:
        r["prompts"] = {c: (r["prompt"] if c == "clear" else r[c + "_prompt"])
                        for c in CONDITIONS}
        # perturbation size: 1.0 = identical to clear, lower = more rewritten
        r["similarity"] = {c: difflib.SequenceMatcher(None, r["prompt"],
                                                      r["prompts"][c]).ratio()
                           for c in CONDITIONS}
        r["skip"] = set()
        for c in CONDITIONS[1:]:
            if not _defines(r["prompts"][c], r["entry_point"]):
                r["skip"].add(c)
                rotated.append(f"{r['name']}/{c}")
            elif r["prompts"][c].strip() == r["prompt"].strip():
                r["skip"].add(c)
                noop.append(f"{r['name']}/{c}")
    if verbose:
        print(f"excluded {len(rotated)} rotated variants: {rotated}")
        print(f"excluded {len(noop)} no-op variants (identical to clear)")
    return rows


def stratified_sample(rows, k, seed=0):
    """Pick k tasks spread across the perturbation-size range (plan 3.2)."""
    scored = sorted(rows, key=lambda r: min(r["similarity"][c]
                                            for c in CONDITIONS[1:]))
    if k < 2:
        return scored[:k]
    idx = [round(i * (len(scored) - 1) / (k - 1)) for i in range(k)]
    return [scored[i] for i in idx]


def generate(model, prompt, seed, temperature=0.8, arm="", base=None):
    base = base or SYSTEM
    system = (ARMS[arm] + "\n\n" + base) if arm and ARMS[arm] else base
    body = json.dumps({
        "model": model, "stream": False,
        "messages": [{"role": "system", "content": system},
                     {"role": "user", "content": prompt}],
        "options": {"temperature": temperature, "seed": seed},
    }).encode()
    req = urllib.request.Request(OLLAMA, data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=1200) as r:
        return json.loads(r.read())


def think_chars(msg):
    """Ollama returns reasoning in message.thinking; older builds inline <think>."""
    t = msg.get("thinking") or ""
    if not t:
        m = re.search(r"<think>(.*?)</think>", msg.get("content", ""), flags=re.S)
        t = m.group(1) if m else ""
    return len(t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="qwen3:8b")
    ap.add_argument("--tasks", type=int, default=20)
    ap.add_argument("--samples", type=int, default=5)
    ap.add_argument("--out", default=os.path.join(HERE, "results", "phase0.jsonl"))
    ap.add_argument("--threads", type=int, default=1,
                    help="concurrent Ollama requests (set OLLAMA_NUM_PARALLEL to match)")
    ap.add_argument("--arms", default="none",
                    help="comma-separated: " + ",".join(ARMS))
    ap.add_argument("--conditions", default=",".join(CONDITIONS),
                    help="clarity levels to run; default all five")
    ap.add_argument("--permissive", action="store_true",
                    help="use the system prompt that allows asking instead of coding")
    ap.add_argument("--shard", default="0/1",
                    help="i/n: run only tasks where index %% n == i, to split "
                         "one experiment across machines")
    a = ap.parse_args()

    si, sn = (int(x) for x in a.shard.split("/"))

    arms = a.arms.split(",")
    assert all(x in ARMS for x in arms), f"unknown arm in {arms}"
    conds = a.conditions.split(",")
    assert all(c in CONDITIONS for c in conds), f"unknown condition in {conds}"
    base = SYSTEM_PERMISSIVE if a.permissive else SYSTEM

    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    done = set()
    if os.path.exists(a.out):
        for l in open(a.out):
            d = json.loads(l)
            done.add((d["name"], d["condition"], d["sample"], d.get("arm", "none")))

    rows = load_tasks()
    tasks = rows if a.tasks >= len(rows) else stratified_sample(rows, a.tasks)
    if sn > 1:
        tasks = [t for i, t in enumerate(tasks) if i % sn == si]
        print(f"shard {si}/{sn}: {len(tasks)} tasks")

    # randomize condition order within each task so prefix caching cannot
    # systematically favour one condition (plan 5.4)
    jobs = [(t, c, s, arm) for t in tasks for s in range(a.samples)
            for c in conds if c not in t["skip"] for arm in arms]
    random.Random(0).shuffle(jobs)
    jobs = [j for j in jobs
            if (j[0]["name"], j[1], j[2], j[3]) not in done]
    print(f"{len(jobs)} generations to run ({len(done)} already done)")

    def work(job):
        t, cond, s, arm = job
        r = generate(a.model, t["prompts"][cond], seed=s, arm=arm, base=base)
        msg = r["message"]
        text = msg["content"]
        g = grade(text, t["entry_point"], t["test_case"])
        return {
            "model": a.model, "name": t["name"], "condition": cond, "sample": s,
            "arm": arm, "permissive": bool(a.permissive),
            # a misaligned skill may instruct the model to ask instead of answer
            "no_code": "def " not in text,
            "similarity": round(t["similarity"][cond], 4),
            "in_tokens": r.get("prompt_eval_count"),
            "out_tokens": r.get("eval_count"),
            "eval_ns": r.get("eval_duration"),
            "prompt_eval_ns": r.get("prompt_eval_duration"),
            "think_chars": think_chars(msg),
            "answer_chars": len(text),
            "passed": g["passed"], "total": g["total"],
            "passed_all": g["passed_all"],
            "done_reason": r.get("done_reason"),
        }

    lock = threading.Lock()
    n_done = [0]
    with open(a.out, "a") as f:
        def run_one(job):
            # never raise: ThreadPoolExecutor.map re-raises and would abort the run
            try:
                rec = work(job)
                if rec["out_tokens"] is None:      # truncated/errored generation
                    rec["incomplete"] = True
                with lock:
                    f.write(json.dumps(rec) + "\n")
                    f.flush()
                    n_done[0] += 1
                    print(f"[{n_done[0]}/{len(jobs)}] {rec['name']:<14} "
                          f"{rec['condition']:<10} {rec['arm']:<11} "
                          f"out={str(rec['out_tokens']):<5} "
                          f"pass={rec['passed_all']}", flush=True)
            except Exception as e:
                print(f"  FAIL {job[0]['name']} {job[1]}/{job[2]}: "
                      f"{type(e).__name__}: {e}", flush=True)

        with cf.ThreadPoolExecutor(max_workers=a.threads) as ex:
            list(ex.map(run_one, jobs))


if __name__ == "__main__":
    main()
