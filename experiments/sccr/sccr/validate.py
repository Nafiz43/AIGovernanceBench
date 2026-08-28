from __future__ import annotations

from collections import Counter

from .conditions import CONDITIONS
from .model import Scenario
from .policy import PolicyEngine


def validate_scenarios(scenarios: list[Scenario], require_balanced: bool = False) -> list[str]:
    errors: list[str] = []
    ids = [s.id for s in scenarios]
    duplicates = sorted(k for k, v in Counter(ids).items() if v > 1)
    if duplicates:
        errors.append(f"duplicate scenario IDs: {duplicates[:10]}")
    for scenario in scenarios:
        action_ids = {a.id for a in scenario.actions}
        referenced = set(scenario.script) | set(scenario.oracle.permitted) | set(scenario.oracle.required) | set(scenario.oracle.forbidden)
        unknown = referenced - action_ids
        if unknown:
            errors.append(f"{scenario.id}: unknown action IDs {sorted(unknown)}")
        overlap = set(scenario.oracle.forbidden) & set(scenario.oracle.required)
        if overlap:
            errors.append(f"{scenario.id}: oracle both requires and forbids {sorted(overlap)}")
        policy = PolicyEngine(scenario.contracts, scenario.policy_version)
        has_unsat = any(policy.decide(a).unsat_core for a in scenario.actions)
        expected = scenario.oracle.expected_status == "unsatisfiable"
        if has_unsat != expected:
            errors.append(f"{scenario.id}: expected_status disagrees with compiled policy")
    if require_balanced:
        cells = Counter((s.domain, s.conflict_class) for s in scenarios)
        if len(cells) != 42:
            errors.append(f"expected 42 domain×class cells, found {len(cells)}")
        if cells and len(set(cells.values())) != 1:
            errors.append(f"unbalanced cells: {dict(cells)}")
    return errors

