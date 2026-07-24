"""Regenerate graph-data.js edges from the deterministic rule engine.

Keeps the hand-curated nodes (real directives) untouched; replaces the edges
array with derive_edges() output over ALL pairs. Reuses the rich hand-written
note where a pair already had one; auto-generates a note for new edges.

Run:  python3 pipeline/gen_graph.py
"""
import re
import pathlib
from rules import derive_edges, NODES

GRAPH = pathlib.Path(__file__).resolve().parent.parent / "graph-data.js"

SECTION = {
    "conflict":   "      // ---- CONFLICTS (the reason this tool exists) ----",
    "overlap":    "      // ---- OVERLAPS (redundant — two libraries, one job) ----",
    "depends":    "      // ---- DEPENDS (directed: a relies on b) ----",
    "reinforces": "      // ---- REINFORCES ----",
}
ORDER = ["conflict", "overlap", "depends", "reinforces"]


def parse(js):
    labels = dict(re.findall(r'id:\s*"([^"]+)",\s*skill:\s*"[^"]+",\s*label:\s*"([^"]+)"', js))
    notes = {}
    order = []
    for a, b, _t, note in re.findall(
            r'\{\s*a:\s*"([^"]+)",\s*b:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*note:\s*"([^"]*)"', js):
        notes[frozenset((a, b))] = note
        order.append(frozenset((a, b)))
    return labels, notes, order


def auto_note(typ, a, b, reason, labels):
    la, lb = labels.get(a, a), labels.get(b, b)
    if typ == "reinforces":
        return f"“{la}” and “{lb}” push the same way — reinforcing the same boundary."
    if typ == "overlap":
        return f"“{la}” and “{lb}” do the same job from different skills — redundant, and they can disagree."
    if typ == "depends":
        return f"“{la}” relies on what “{lb}” provides."
    return f"“{la}” does what “{lb}” forbids — a conflict with no defined precedence."


def emit(edges, labels, notes, orig_order):
    def rank(k):
        return orig_order.index(k) if k in orig_order else len(orig_order)
    lines = []
    for typ in ORDER:
        group = [(k, v) for k, v in edges.items() if v[0] == typ]
        group.sort(key=lambda kv: rank(kv[0]))
        if not group:
            continue
        lines.append(SECTION[typ])
        for k, (t, reason, a, b) in group:
            note = notes.get(k) or auto_note(t, a, b, reason, labels)
            note = note.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'      {{ a: "{a}", b: "{b}", type: "{t}",')
            lines.append(f'        note: "{note}" }},')
        lines.append("")
    return "\n".join(lines).rstrip()


def main():
    js = GRAPH.read_text()
    labels, notes, orig_order = parse(js)
    edges = derive_edges(NODES)
    block = emit(edges, labels, notes, orig_order)
    new = re.sub(r"(\n    edges: \[\n)[\s\S]*?(\n    \],)", rf"\1{block}\2", js, count=1)
    if new == js:
        raise SystemExit("edges array not found / unchanged — check the splice regex")
    GRAPH.write_text(new)
    by = {}
    for _k, (t, *_r) in edges.items():
        by[t] = by.get(t, 0) + 1
    print(f"wrote {GRAPH.name}: {len(edges)} edges "
          + " ".join(f"{t}={by.get(t,0)}" for t in ORDER))
    added = [sorted(k) for k in edges if k not in orig_order]
    if added:
        print("new edges (not in prior graph):")
        for k in added:
            print("  +", " × ".join(k))


if __name__ == "__main__":
    main()
