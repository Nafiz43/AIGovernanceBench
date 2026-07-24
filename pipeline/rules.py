"""Deterministic rule engine for instruction-relationship edges.

No LLM. Each node carries a small structured predicate (a faithful reading of
its real directive text); edges fall out of four rules over those predicates.
Every edge is explainable ("because A opens X, B restricts X, X links Y").

The human input is O(n) predicates-per-node (+ a handful of domain facts:
object links, produced/consumed artifacts, shared goals) — NOT O(n^2) edges.

Run:  python3 pipeline/rules.py            # derive edges + score vs gold
"""

# --- domain facts (the only hand-authored knowledge beyond per-node reading) ---

# Object subsumption: LHS contains/exposes RHS. Used by the conflict rule to
# bridge instructions that never share a surface word (draft carries PHI).
LINKS = {("draft", "phi"), ("image", "phi")}

def linked(x, y):
    return x == y or (x, y) in LINKS or (y, x) in LINKS


# --- node predicates: one faithful reading per real directive ------------------
# stance:  how the node acts on an egress object -> "open" (sends/produces it out)
#          or "restrict" (forbids/blocks it). None = not an egress actor.
# egress:  the object the stance acts on.
# overlap: same-job class; two skills in one class do the same guard -> overlap.
# produces/consumes: artifact tags; consumer depends-on producer.
# goal:    shared intent; same goal + no structural collision -> reinforces.

NODES = {
    "dc-reader-test": dict(skill="dc", stance="open",     egress="draft"),
    "dc-image-alt":   dict(skill="dc", stance="open",     egress="image"),
    "dc-confirm":     dict(skill="dc", produces={"human-gate"}),
    "dc-generate":    dict(skill="dc", stance="open",     egress="output"),

    "di-local-only":  dict(skill="di", stance="restrict", egress="phi",
                           produces={"deid-data"}, goal="phi-containment"),
    "di-no-mapping":  dict(skill="di", goal="phi-containment"),
    "di-audit-only":  dict(skill="di", produces={"audit-log"}, goal="phi-containment"),

    "cr-quote":       dict(skill="cr", produces={"guideline-items"}, goal="anti-fabrication"),
    "cr-fail-fast":   dict(skill="cr"),

    "ng-output-rail": dict(skill="ng", stance="restrict", egress="output",
                           overlap="egress-validation", produces={"review-hold"},
                           goal="anti-fabrication"),
    "ng-dialog-rail": dict(skill="ng", overlap="structure-scope"),

    "ga-validate":    dict(skill="ga", overlap="egress-validation", goal="anti-fabrication"),
    "ga-schema":      dict(skill="ga", overlap="structure-scope", consumes={"guideline-items"}),

    "eu-oversight":   dict(skill="eu", consumes={"human-gate", "review-hold"}),
    "eu-data-gov":    dict(skill="eu", consumes={"deid-data"}),
    "eu-logging":     dict(skill="eu", consumes={"audit-log"}),
}


def _pairs(nodes):
    ids = list(nodes)
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            yield ids[i], ids[j]


def derive_edges(nodes=NODES):
    """Return {(a,b): (type, reason)}. Precedence: conflict > overlap > depends > reinforces."""
    edges = {}

    def add(a, b, typ, reason):
        edges[frozenset((a, b))] = (typ, reason, a, b)

    for a, b in _pairs(nodes):
        na, nb = nodes[a], nodes[b]

        # CONFLICT: one node opens an egress object, the other restricts it,
        # on the same or a linked object.
        opener = restrictor = None
        if na.get("stance") == "open" and nb.get("stance") == "restrict":
            opener, restrictor = na, nb
        elif nb.get("stance") == "open" and na.get("stance") == "restrict":
            opener, restrictor = nb, na
        if opener and linked(opener["egress"], restrictor["egress"]):
            add(a, b, "conflict",
                f"{opener['egress']} is opened by one node and restricted by the other"
                + ("" if opener["egress"] == restrictor["egress"]
                   else f" ({opener['egress']} carries {restrictor['egress']})"))
            continue

        # OVERLAP: same overlap class, different skills -> redundant guard.
        if na.get("overlap") and na.get("overlap") == nb.get("overlap") \
                and na["skill"] != nb["skill"]:
            add(a, b, "overlap", f"both are {na['overlap']} guards from different skills")
            continue

        # DEPENDS (directed, consumer->producer): consumer needs an artifact
        # the producer emits. Stored a=consumer, b=producer for arrow direction.
        shared = (na.get("consumes", set()) & nb.get("produces", set())) \
            or (nb.get("consumes", set()) & na.get("produces", set()))
        if shared:
            consumer, producer = (a, b) if na.get("consumes", set()) & nb.get("produces", set()) else (b, a)
            add(consumer, producer, "depends",
                f"{consumer} needs {sorted(shared)[0]} produced by {producer}")
            continue

        # REINFORCES: same goal, no structural collision above.
        if na.get("goal") and na.get("goal") == nb.get("goal"):
            add(a, b, "reinforces", f"both serve {na['goal']}")

    return edges


if __name__ == "__main__":
    from test_rules import GOLD, score
    edges = derive_edges()
    score(edges, GOLD, verbose=True)
