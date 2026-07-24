#!/usr/bin/env python3
"""Annotate a bundle's cross-skill instruction pairs with a LOCAL model (Ollama,
qwen3:14b, thinking ON) and write the live graph-data.js the frontend renders.

Nodes stay as the clean hand-verified directives; the LOCAL LLM decides every
edge (conflict / overlap / depends / reinforces / none). No API key, offline.

  python3 pipeline/annotate_graph.py
"""
import json, re, sys, time, urllib.request

IN = "/private/tmp/claude-501/-Users-nafiz43-Documents-GitHub/6a3714f4-b55a-4f83-8a94-786b218eb172/scratchpad/graph_in.json"
PROGRESS = "/private/tmp/claude-501/-Users-nafiz43-Documents-GitHub/6a3714f4-b55a-4f83-8a94-786b218eb172/scratchpad/annotate_progress.json"
OUT = "graph-data.js"
MODEL = "qwen3:14b"

TOPICS = {
 "phi":["phi","de-identif","deidentif","patient","identifier","raw","anonymiz"],
 "external_ai":["fresh claude","prior context","paste","network","ai call","external","upload","send","image"],
 "output_control":["output","validate","rail","schema","hallucinat","unverified","unsupported","refrain","filter","block","finding"],
 "human_oversight":["human","oversight","confirm","review","override","author","guide"],
 "logging":["log","audit","trace","sha-256","record"],
 "reporting":["checklist","guideline","invent","present","missing","quote","report"],
 "images":["image","alt-text","dicom","figure"],
}
SYS = ("You audit AI Agent Skills. Two instructions are BOTH loaded into the SAME agent session "
       "for this context: {ctx}. Reason about what each instruction makes the agent DO or FORBID in "
       "THIS context (reason about what the data actually is — e.g. a draft radiology report contains PHI). "
       "Then choose ONE relation and end with a single JSON line: "
       '{{"relation":"<conflict|overlap|depends|reinforces|none>","reason":"<=18 words"}}.\n'
       "conflict = obeying one VIOLATES the other, cannot both hold; different approaches to the same goal is overlap NOT conflict.\n"
       "overlap = both do the SAME job redundantly (two tools, one purpose).\n"
       "depends = one only works if the other is already in place (needs it, not merely aligned).\n"
       "reinforces = independent instructions that happen to push the same policy.\n"
       "none = unrelated.")


def topics(t):
    low = t.lower()
    return {k for k, kw in TOPICS.items() if any(w in low for w in kw)}


def classify(a, b, ctx):
    body = json.dumps({
        "model": MODEL,
        "messages": [{"role": "system", "content": SYS.format(ctx=ctx)},
                     {"role": "user", "content": f"A ({a['skill']}): {a['text']}\nB ({b['skill']}): {b['text']}"}],
        "stream": False, "think": True, "options": {"temperature": 0},
    }).encode()
    req = urllib.request.Request("http://localhost:11434/api/chat", body, {"Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=600))
    txt = r["message"]["content"]
    m = re.findall(r'\{[^{}]*"relation"[^{}]*\}', txt)
    if not m:
        return None, txt[:60]
    o = json.loads(m[-1])
    rel = o.get("relation", "none")
    return (rel if rel in ("conflict", "overlap", "depends", "reinforces") else None), o.get("reason", "")


def main():
    G = json.load(open(IN))
    key = list(G)[0]
    g = G[key]
    ctx = f"a {g['persona']} using an AI agent for {g['task']}"
    nodes = g["nodes"]
    tset = {n["id"]: topics(n["text"]) for n in nodes}

    pairs = [(a, b) for i, a in enumerate(nodes) for b in nodes[i + 1:]
             if a["skill"] != b["skill"] and (tset[a["id"]] & tset[b["id"]])]
    print(f"{len(pairs)} candidate pairs → {MODEL} (thinking ON, local)", flush=True)

    edges, log = [], []
    for i, (a, b) in enumerate(pairs, 1):
        t = time.time()
        try:
            rel, reason = classify(a, b, ctx)
        except Exception as e:
            rel, reason = None, f"(err: {e})"
        dt = time.time() - t
        rec = {"a": a["id"], "b": b["id"], "rel": rel, "reason": reason,
               "a_label": a["label"], "b_label": b["label"]}
        log.append(rec)
        if rel:
            edges.append({"a": a["id"], "b": b["id"], "type": rel, "note": reason})
        json.dump({"done": i, "total": len(pairs), "log": log}, open(PROGRESS, "w"), indent=1)
        print(f"[{i:2d}/{len(pairs)}] {dt:5.1f}s {str(rel):11s} {a['label'][:26]:26s} × {b['label'][:26]}", flush=True)

    counts = {}
    for e in edges:
        counts[e["type"]] = counts.get(e["type"], 0) + 1
    print(f"\nDONE. edges: {counts}", flush=True)

    out = {key: {"persona": g["persona"], "task": g["task"], "skills": g["skills"],
                 "nodes": [{k: v for k, v in n.items() if not k.startswith("_")} for n in nodes],
                 "edges": edges}}
    js = ("// Nodes: hand-verified real directives. Edges: annotated by a LOCAL model\n"
          "// (Ollama qwen3:14b, thinking ON) via pipeline/annotate_graph.py — no API key.\n"
          "const GRAPHS = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n"
          'if (typeof window !== "undefined") { window.GRAPHS = GRAPHS; }\n')
    open(OUT, "w").write(js)
    print(f"Wrote {OUT}", flush=True)


if __name__ == "__main__":
    sys.exit(main())
