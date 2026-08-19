"""Merge per-host result files, dropping duplicate (task, condition, sample, arm)."""
import json, sys

seen, out = set(), []
for path in sys.argv[1:-1]:
    for line in open(path):
        r = json.loads(line)
        k = (r["name"], r["condition"], r["sample"], r.get("arm", "none"))
        if k in seen:
            continue
        seen.add(k)
        out.append(r)
with open(sys.argv[-1], "w") as f:
    for r in out:
        f.write(json.dumps(r) + "\n")
print(f"merged {len(out)} unique generations -> {sys.argv[-1]}")
