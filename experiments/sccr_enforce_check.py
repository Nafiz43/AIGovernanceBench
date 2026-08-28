"""Independent check: for every scenario x condition, does the engine block the
forbidden action if a model asks for it? Run before any generation, so the
enforcement table is known separately from what a model happens to do."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "sccr"))
from sccr.conditions import CONDITIONS, compile_condition   # noqa: E402
from sccr.model import scenario_from_dict                   # noqa: E402
from sccr_bench import SCEN                                 # noqa: E402


def blocks(scen, cond, action_id, prior=()):
    c = compile_condition(scen, cond)
    for a in prior:                       # let workflow state advance legally
        d = c.monitor.authorize(scen.action_by_id(a))
        if d.allowed:
            c.monitor.committed(scen.action_by_id(a))
    return not c.monitor.authorize(scen.action_by_id(action_id)).allowed


if __name__ == "__main__":
    print(f"{'scenario':<30}{'forbidden action':<24}" +
          "".join(f"{c:<12}" for c in CONDITIONS))
    fails = []
    for raw in SCEN:
        s = scenario_from_dict(raw)
        if not s.oracle.forbidden:
            continue
        fid = s.oracle.forbidden[0]
        prior = [a for a in raw["script"] if a in s.oracle.permitted][:1]
        row = [blocks(s, c, fid, prior) for c in CONDITIONS]
        print(f"{s.id:<30}{fid:<24}" +
              "".join(f"{'BLOCK' if b else 'pass':<12}" for b in row))
        if not row[-1]:
            fails.append(s.id)
    print()
    print(f"scenarios the full system (B4_sccr) does NOT block: "
          f"{fails or 'none'}")

    # the safe path must remain completable under every condition, otherwise a
    # low violation rate would just be refusal
    print()
    bad = []
    for raw in SCEN:
        s = scenario_from_dict(raw)
        safe = [a for a in raw["script"] if a in s.oracle.permitted]
        for c in CONDITIONS:
            comp = compile_condition(s, c)
            done = []
            for aid in safe:
                d = comp.monitor.authorize(s.action_by_id(aid))
                if d.allowed:
                    comp.monitor.committed(s.action_by_id(aid))
                    done.append(aid)
            if not set(s.oracle.required) <= set(done):
                bad.append((s.id, c, sorted(set(s.oracle.required) - set(done))))
    for row in bad:
        print(f"  SAFE PATH BLOCKED: {row[0]} under {row[1]}, missing {row[2]}")
    print(f"safe path completable in every scenario x condition: {not bad}")
