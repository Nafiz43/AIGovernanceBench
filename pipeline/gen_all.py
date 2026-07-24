#!/usr/bin/env python3
"""Generate a Network Analyzer graph for ALL 142 pairs.

Nodes come from the per-skill cache (real verbatim directives). Predicates are
auto-derived from node text by keyword (stance/egress/overlap/goal), then the
same deterministic rule engine (rules.derive_edges) produces the edges.

The Radiologist bundle is preserved as hand-verified GOLD; every other bundle is
marked generated:true so the UI can badge it as an auto-draft. No LLM, offline.

Run:  python3 pipeline/gen_all.py
"""
import json, re, subprocess, pathlib
import rules

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = pathlib.Path(__file__).resolve().parent / "nodes"
NODES_PER_SKILL = 5
GOLD_KEY = "Radiologist|AI-assisted report drafting and worklist triage"

# broaden the conflict object-links for the open domain (gold bundle is preserved,
# not re-derived, so this doesn't touch it)
rules.LINKS = rules.LINKS | {("draft", "phi"), ("image", "phi"), ("output", "phi"),
                             ("document", "phi"), ("output", "draft")}

PALETTE = ["#1155CC", "#0f9d8f", "#e07b00", "#7c3aed", "#3aa6b9", "#c2410c",
           "#0369a1", "#65a30d", "#be185d", "#4f46e5", "#0891b2", "#9333ea"]

RESTRICT = re.compile(r"\b(never|no|not|don'?t|must not|cannot|avoid|block|reject|refrain|"
                      r"forbid|prohibit|without|refuse|limit|restrict|de-?identif|redact|anonymiz)\b", re.I)
OPEN = re.compile(r"\b(paste|send|upload|share|generate|create|produce|extract|brainstorm|"
                  r"draft|write|add|include|always|fill|convert|render|build|publish)\b", re.I)
OBJECTS = [  # first match wins
    ("phi",      r"patient|\bphi\b|\bpii\b|de-?identif|protected health|medical record|identifier|clinical data"),
    ("image",    r"image|alt-text|figure|dicom|photo|screenshot|picture"),
    ("draft",    r"draft|document|the doc|manuscript|contract|memo|report"),
    ("output",   r"output|response|finding|answer|result|generated"),
    ("input",    r"user input|incoming|prompt injection|user message|query"),
    ("code",     r"\bcode\b|function|script|repo|commit|codebase"),
    ("secret",   r"secret|api key|token|password|credential"),
]
GOALS = [
    ("phi-containment",  r"\bphi\b|de-?identif|patient privacy|protected health|clinical"),
    ("anti-fabrication", r"invent|hallucinat|unsupported|unverified|fabricat|cite|quote|verify|fact|accurate|ground"),
    ("human-oversight",  r"human|oversight|confirm|review|override|approval|wait for|user agency|user confirmation"),
    ("security",         r"injection|malicious|attack|sanitiz|vulnerab|exploit|canary|jailbreak|threat"),
    ("privacy",          r"confidential|sensitive|redact|privacy|anonymiz"),
    ("accessibility",    r"alt-text|accessib|screen reader|aria"),
]
OVERLAP = [
    ("egress-validation", r"validate|output rail|check output|verify.*response|schema.*valid|guardrail|moderat"),
    ("structure-format",  r"structure|format|schema|template|layout|style guide"),
    ("injection-guard",   r"prompt injection|sanitiz|canary|input rail"),
]


def first(text, table):
    low = text.lower()
    for name, pat in table:
        if re.search(pat, low):
            return name
    return None


# Only a data-exposure-sensitive object makes an open-vs-restrict pair a REAL
# conflict. Gating on these kills the lexical false positives ("never use SOLID
# shading" vs "always cite sources") while keeping the PHI/image/secret leaks.
SENSITIVE_OBJ = {"phi", "image", "secret"}


def predicate(skill, text):
    p = {"skill": skill}
    obj = first(text, OBJECTS)
    if obj in SENSITIVE_OBJ:
        if RESTRICT.search(text):
            p["stance"], p["egress"] = "restrict", obj
        elif OPEN.search(text):
            p["stance"], p["egress"] = "open", obj
    g = first(text, GOALS)
    if g:
        p["goal"] = g
    o = first(text, OVERLAP)
    if o:
        p["overlap"] = o
    return p


def load_cache():
    out = {}
    for f in CACHE.glob("*.json"):
        d = json.loads(f.read_text())
        if d.get("nodes"):
            out[d["name"]] = d
    return out


def node_eval(file, var, tail=""):
    src = (f"const fs=require('fs');let s=fs.readFileSync('{file}','utf8')"
           f".replace(/if \\(typeof window[\\s\\S]*$/,'');s+=';globalThis.__V={var};';eval(s);"
           f"{tail or 'process.stdout.write(JSON.stringify(globalThis.__V))'}")
    return json.loads(subprocess.run(["node", "-e", src], cwd=ROOT, capture_output=True, text=True).stdout)


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def build_bundle(persona, task, skill_names, cache, skillmeta):
    skills, nodes, preds = {}, [], {}
    used = [n for n in skill_names if n in cache]
    for i, name in enumerate(used):
        sk = slug(name)
        entry = skillmeta.get(name, {})
        skills[sk] = {"label": name, "dir": name, "color": PALETTE[sum(map(ord, name)) % len(PALETTE)]}
        for j, nd in enumerate(cache[name]["nodes"][:NODES_PER_SKILL]):
            nid = f"{sk}-{j}"
            nodes.append({"id": nid, "skill": sk, "label": nd["label"], "text": nd["text"]})
            preds[nid] = predicate(sk, nd["text"])
    edges = derive_dedup(preds, nodes)
    return {"persona": persona, "task": task, "generated": True,
            "skills": skills, "nodes": nodes, "edges": edges}


def derive_dedup(preds, nodes):
    """Run the rule engine, then keep at most one edge per (skillPair, type) to stay readable."""
    raw = rules.derive_edges(preds)
    skill_of = {n["id"]: n["skill"] for n in nodes}
    seen, edges = set(), []
    # conflicts first (most important), then overlap, depends, reinforces
    order = {"conflict": 0, "overlap": 1, "depends": 2, "reinforces": 3}
    for _k, (typ, reason, a, b) in sorted(raw.items(), key=lambda kv: order.get(kv[1][0], 9)):
        sp = (frozenset((skill_of[a], skill_of[b])), typ)
        if skill_of[a] == skill_of[b] or sp in seen:
            continue
        seen.add(sp)
        edges.append({"a": a, "b": b, "type": typ, "note": reason})
    return edges


def main():
    cache = load_cache()
    recs = node_eval("rec-data.js", "RECS")
    skillmeta = {s["name"]: s for s in node_eval("data.js", "SKILLS")}
    gold = node_eval("graph-data.js", "GRAPHS")  # preserve hand-verified bundles as-is

    graphs = {}
    for r in recs:
        key = f"{r['p']}|{r['t']}"
        # preserve ONLY hand-verified bundles (the gold key, or ones already flagged
        # verified). Do NOT preserve previously-generated bundles — regenerate them.
        if key == GOLD_KEY or gold.get(key, {}).get("verified"):
            g = gold[key]
            g["verified"] = True
            graphs[key] = g
            continue
        names = [s[0] for s in r["s"]]
        graphs[key] = build_bundle(r["p"], r["t"], names, cache, skillmeta)

    js = ("// AUTO-GENERATED by pipeline/gen_all.py — OFF-PROD ARTIFACT (gitignored).\n"
          "// Nodes are real cached directives; edges are rule-engine-derived from\n"
          "// auto-tagged predicates. verified:true bundles are preserved from the live\n"
          "// graph-data.js; the rest are drafts (generated:true). NOT loaded by the site.\n"
          "const GRAPHS = " + json.dumps(graphs, ensure_ascii=False) + ";\n"
          'if (typeof window !== "undefined") { window.GRAPHS = GRAPHS; }\n')
    (ROOT / "graph-data.generated.js").write_text(js)

    tot = len(graphs)
    gen = sum(1 for g in graphs.values() if g.get("generated"))
    with_conf = sum(1 for g in graphs.values() if any(e["type"] == "conflict" for e in g["edges"]))
    edgeless = sum(1 for g in graphs.values() if not g["edges"])
    ne = sum(len(g["edges"]) for g in graphs.values())
    print(f"wrote graph-data.generated.js: {tot} bundles ({tot-gen} verified, {gen} generated)")
    print(f"  total edges: {ne}   bundles with >=1 conflict: {with_conf}   edgeless bundles: {edgeless}")


if __name__ == "__main__":
    main()
