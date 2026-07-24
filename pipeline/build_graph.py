#!/usr/bin/env python3
"""Auto-generate an instruction-dependency graph for a persona x task skill bundle.

Offline build step (GitHub Pages has no runtime backend): it emits a static
graph-data.generated.js that the existing frontend renders as-is.

Pipeline:
  1. scrape   - fetch each skill's instruction file via `gh api` (raw markdown)
  2. extract  - pull directive lines -> atomic instruction NODES
  3. tag      - topic + polarity per instruction (cheap keyword pass)
  4. relate   - cross-skill prefilter proposes candidate EDGES
                (conflict / overlap / reinforces). Conflict candidates SHOULD
                then be confirmed by classify_pair_llm() in production.
  5. emit     - write GRAPHS-schema JS

The relation tier here is the LIGHTWEIGHT BASELINE. It is a candidate-generator,
not ground truth. classify_pair_llm() is the seam where an LLM/NLI model plugs in.
"""
import argparse, base64, json, re, subprocess, sys, urllib.request

# --- Bundle to build. Only skills with a machine-readable instruction file are
# --- listed; link-list/website "skills" (e.g. EU AI Act) have no directives to
# --- extract and are reported as skipped. This is the honest coverage boundary.
BUNDLE = {
    "persona": "Radiologist",
    "task": "AI-assisted report drafting and worklist triage",
    "skills": [
        {"key": "dc", "label": "doc-coauthoring", "dir": "doc-coauthoring", "color": "#1155CC",
         "repo": "anthropics/skills", "path": "skills/doc-coauthoring/SKILL.md"},
        {"key": "di", "label": "medsci-skills · deidentify", "dir": "medsci-skills", "color": "#0f9d8f",
         "repo": "Aperivue/medsci-skills", "path": "docs/skills/deidentify.md",
         "href": "https://github.com/Aperivue/medsci-skills/blob/main/docs/skills/deidentify.md"},
        {"key": "cr", "label": "medsci-skills · check-reporting", "dir": "medsci-skills", "color": "#3aa6b9",
         "repo": "Aperivue/medsci-skills", "path": "docs/skills/check-reporting.md",
         "href": "https://github.com/Aperivue/medsci-skills/blob/main/docs/skills/check-reporting.md"},
        {"key": "ng", "label": "NeMo Guardrails", "dir": "NeMo Guardrails", "color": "#7c3aed",
         "repo": "NVIDIA-NeMo/Guardrails", "path": "README.md"},
        {"key": "ga", "label": "Guardrails AI", "dir": "Guardrails AI", "color": "#e07b00",
         "repo": "guardrails-ai/guardrails", "path": "README.md"},
    ],
}

TOP_K = 5  # keep the strongest directives per skill so the graph stays readable

# topic -> trigger keywords (a cheap stand-in for real embeddings)
TOPICS = {
    "phi":            ["phi", "pii", "de-identif", "deidentif", "patient", "identifier", "raw data", "anonymiz"],
    "external_ai":    ["fresh claude", "no prior context", "paste", "network", "ai call", "external", "upload", "send"],
    "output_control": ["output", "validate", "rail", "schema", "hallucinat", "unverified", "unsupported", "refrain", "filter", "block"],
    "human_oversight":["human", "oversight", "confirm", "review", "override", "author", "guide"],
    "logging":        ["log", "audit", "trace", "sha-256", "record"],
    "reporting":      ["checklist", "guideline", "invent", "present", "missing", "quote"],
    "images":         ["image", "alt-text", "dicom", "figure"],
}
SENSITIVE = {"phi", "external_ai", "images"}  # opposite polarity here = real conflict
PROHIBIT = re.compile(r"\b(never|no |not |don'?t|must not|cannot|without|forbid|refrain|reject|block)\b", re.I)
DIRECTIVE = re.compile(r"\b(never|always|must|only|do not|don'?t|block|reject|validate|ensure|"
                       r"wait for|fail fast|no network|refrain|constrain|de-?identif|quote)\b", re.I)
STRONG = ["never", "must not", "do not", "only", "always", "must", "block", "reject",
          "fail fast", "wait for", "validate", "ensure", "no network", "refrain"]


def gh_raw(repo, path):
    r = subprocess.run(["gh", "api", f"repos/{repo}/contents/{path}", "--jq", ".content"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    try:
        return base64.b64decode(r.stdout).decode("utf-8", "ignore")
    except Exception:
        return None


def extract(md):
    """Markdown -> ranked list of atomic directive sentences."""
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    md = re.sub(r"```.*?```", "", md, flags=re.S)      # drop code blocks
    md = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)    # unwrap links
    seen, out = set(), []
    for raw in md.splitlines():
        s = raw.strip().lstrip("-*>#").strip()
        s = re.sub(r"\*\*|__|`", "", s).strip()
        if not (20 <= len(s) <= 240) or not DIRECTIVE.search(s):
            continue
        key = re.sub(r"[^a-z]", "", s.lower())[:60]
        if key in seen:
            continue
        seen.add(key)
        score = sum(s.lower().count(k) for k in STRONG)
        out.append((score, s))
    out.sort(key=lambda x: -x[0])
    return [s for _, s in out[:TOP_K]]


def label(text):
    words = re.sub(r"^(the|a|an)\s+", "", text, flags=re.I).split()
    lab = " ".join(words[:6]).rstrip(".,:;")
    return lab if len(lab) <= 42 else lab[:40] + "…"


def topics_of(text):
    low = text.lower()
    return {t for t, kws in TOPICS.items() if any(k in low for k in kws)}


def polarity(text):
    return "prohibit" if PROHIBIT.search(text) else "act"


OLLAMA_URL = "http://localhost:11434/api/chat"
LLM_SYS = (
    "You audit AI Agent Skills. Two instructions are BOTH loaded into the SAME agent session "
    "for this context: {ctx}. Reason first: fill a_does/b_does with what each instruction makes "
    "the agent DO or FORBID in THIS context (reason about what the data actually is — e.g. a draft "
    "radiology report contains patient PHI). Then choose relation.\n"
    "Reply ONLY strict JSON: {{\"a_does\":\"..\",\"b_does\":\"..\","
    "\"relation\":one of [conflict,overlap,depends,reinforces,none],\"reason\":\"<=18 words\"}}.\n"
    "conflict = obeying one VIOLATES the other; they cannot both be satisfied. "
    "Do NOT label conflict merely for different approaches to the same goal — that is overlap.\n"
    "overlap = both do the same job (redundant). depends = one only works if the other is in place. "
    "reinforces = both enforce the same policy. none = unrelated."
)


def classify_pair_llm(a, b, ctx, model):
    """Local-LLM classifier via Ollama — no API key, nothing leaves the machine.
    The cheap prefilter decides WHICH pairs reach this call, keeping cost ~linear."""
    body = json.dumps({
        "model": model,
        "messages": [{"role": "system", "content": LLM_SYS.format(ctx=ctx)},
                     {"role": "user", "content": f"A ({a['skill']}): {a['text']}\nB ({b['skill']}): {b['text']}"}],
        "stream": False, "format": "json", "think": False, "options": {"temperature": 0},
    }).encode()
    req = urllib.request.Request(OLLAMA_URL, body, {"Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=300))
        out = json.loads(r["message"]["content"])
        rel = out.get("relation", "none")
        return (rel if rel in ("conflict", "overlap", "depends", "reinforces") else None,
                out.get("reason", ""))
    except Exception as e:
        return None, f"(llm error: {e})"


def prefilter(nodes):
    """Cheap O(n^2) topic scan -> candidate cross-skill pairs worth an LLM call."""
    cand = []
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            a, b = nodes[i], nodes[j]
            if a["skill"] != b["skill"] and (a["_topics"] & b["_topics"]):
                cand.append((a, b))
    return cand


def relate(nodes):
    edges, used = [], set()
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            a, b = nodes[i], nodes[j]
            if a["skill"] == b["skill"]:
                continue                      # only cross-skill matters
            shared = a["_topics"] & b["_topics"]
            if not shared:
                continue
            pair = (a["id"], b["id"])
            if pair in used:
                continue
            etype = note = None
            if a["_pol"] != b["_pol"] and (shared & SENSITIVE):
                etype = "conflict"
                note = (f"Opposite polarity on shared topic “{'/'.join(sorted(shared & SENSITIVE))}”. "
                        f"Prefilter flags this for LLM confirmation.")
            elif a["_pol"] == b["_pol"] == "prohibit":
                etype = "reinforces"
                note = f"Both constrain “{'/'.join(sorted(shared))}” the same way."
            elif "output_control" in shared:
                etype = "overlap"
                note = "Two skills act on the same output path — candidate redundancy."
            if etype:
                edges.append({"a": a["id"], "b": b["id"], "type": etype, "note": note})
                used.add(pair)
    return edges


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--llm", action="store_true", help="classify candidate pairs with a local Ollama model")
    ap.add_argument("--model", default="qwen3:14b", help="Ollama model name")
    args = ap.parse_args()

    ctx = f"a {BUNDLE['persona']} using an AI agent for {BUNDLE['task']}"
    nodes, skills_meta, report = [], {}, []
    for sk in BUNDLE["skills"]:
        skills_meta[sk["key"]] = {k: sk[k] for k in ("label", "dir", "color") if k in sk}
        if sk.get("href"):
            skills_meta[sk["key"]]["href"] = sk["href"]
        md = gh_raw(sk["repo"], sk["path"])
        if not md:
            report.append(f"  ✗ {sk['label']:32s} — no instruction file fetched (skipped)")
            continue
        instrs = extract(md)
        report.append(f"  ✓ {sk['label']:32s} — {len(instrs)} directives auto-extracted")
        for n, text in enumerate(instrs):
            nodes.append({
                "id": f"{sk['key']}-{n}", "skill": sk["key"], "label": label(text), "text": text,
                "_topics": topics_of(text), "_pol": polarity(text),
            })
    if args.llm:
        cand = prefilter(nodes)
        print(f"\nPREFILTER: {len(cand)} candidate cross-skill pairs → classifying with {args.model} (local)")
        byid = {n["id"]: n for n in nodes}
        edges = []
        for a, b in cand:
            rel, reason = classify_pair_llm(a, b, ctx, args.model)
            if rel:
                edges.append({"a": a["id"], "b": b["id"], "type": rel, "note": reason})
    else:
        edges = relate(nodes)

    print("\nSCRAPE + EXTRACT (live repos):")
    print("\n".join(report))
    counts = {}
    for e in edges:
        counts[e["type"]] = counts.get(e["type"], 0) + 1
    print(f"\nNODES: {len(nodes)}   EDGES: {counts}")
    print("\nCANDIDATE CONFLICTS the cheap prefilter surfaced (→ send to LLM):")
    byid = {n["id"]: n for n in nodes}
    for e in edges:
        if e["type"] == "conflict":
            print(f"  ⚠ [{byid[e['a']]['skill']}] {byid[e['a']]['text'][:70]}")
            print(f"    ✕ [{byid[e['b']]['skill']}] {byid[e['b']]['text'][:70]}\n")

    clean = [{k: v for k, v in n.items() if not k.startswith("_")} for n in nodes]
    graph = {f"{BUNDLE['persona']}|{BUNDLE['task']}": {
        "persona": BUNDLE["persona"], "task": BUNDLE["task"],
        "skills": skills_meta, "nodes": clean, "edges": edges}}
    js = ("// AUTO-GENERATED by pipeline/build_graph.py — do not hand-edit.\n"
          "const GRAPHS = " + json.dumps(graph, indent=2, ensure_ascii=False) + ";\n"
          'if (typeof window !== "undefined") { window.GRAPHS = GRAPHS; }\n')
    with open("graph-data.generated.js", "w") as f:
        f.write(js)
    print("Wrote graph-data.generated.js")


if __name__ == "__main__":
    sys.exit(main())
