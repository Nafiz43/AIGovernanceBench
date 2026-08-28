from __future__ import annotations

from dataclasses import dataclass
from itertools import permutations, product
from typing import Any


class WorkflowError(ValueError):
    pass


def _interleave(left: tuple[str, ...], right: tuple[str, ...]) -> set[tuple[str, ...]]:
    if not left:
        return {right}
    if not right:
        return {left}
    return {
        (left[0],) + tail for tail in _interleave(left[1:], right)
    } | {
        (right[0],) + tail for tail in _interleave(left, right[1:])
    }


def expand(spec: dict[str, Any], known_actions: set[str], limit: int = 10000) -> set[tuple[str, ...]]:
    kind = spec.get("kind")
    if kind == "action":
        action_id = spec.get("action_id")
        if action_id not in known_actions:
            raise WorkflowError(f"unknown workflow action {action_id!r}")
        return {(action_id,)}
    if kind in {"sequence", "choice", "parallel"}:
        children = spec.get("children")
        if not isinstance(children, list) or not children:
            raise WorkflowError(f"{kind} requires a non-empty children list")
        expanded = [expand(child, known_actions, limit) for child in children]
        if kind == "choice":
            result = set().union(*expanded)
        elif kind == "sequence":
            result = {tuple(item for part in combo for item in part)
                      for combo in product(*expanded)}
        else:
            result = {()}
            for child_traces in expanded:
                result = {merged for base in result for child in child_traces
                          for merged in _interleave(base, child)}
        if len(result) > limit:
            raise WorkflowError(f"workflow expansion exceeds {limit} traces")
        return result
    if kind == "retry":
        attempts = spec.get("max_attempts")
        if not isinstance(attempts, int) or not 1 <= attempts <= 8:
            raise WorkflowError("retry max_attempts must be an integer in [1, 8]")
        child = expand(spec.get("child", {}), known_actions, limit)
        result: set[tuple[str, ...]] = set()
        current = {()}
        for _ in range(attempts):
            current = {a + b for a in current for b in child}
            result |= current
        return result
    if kind == "approval":
        if not spec.get("token"):
            raise WorkflowError("approval requires a token name")
        return expand(spec.get("child", {}), known_actions, limit)
    if kind == "compensate":
        primary = expand(spec.get("primary", {}), known_actions, limit)
        compensation = expand(spec.get("compensation", {}), known_actions, limit)
        return primary | {a + b for a in primary for b in compensation}
    raise WorkflowError(f"unknown workflow kind {kind!r}")


@dataclass
class WorkflowGate:
    traces: set[tuple[str, ...]]
    prefix: tuple[str, ...] = ()

    @classmethod
    def compile(cls, specs: list[dict[str, Any]], known_actions: set[str],
                allowed_actions: set[str]) -> "WorkflowGate":
        if not specs:
            raise WorkflowError("cannot compile an empty workflow list")
        combined = {()}
        for spec in specs:
            child = expand(spec, known_actions)
            combined = {a + b for a in combined for b in child}
        # Policy compilation erases prohibited steps from procedural suggestions.
        # Required effects remain independently checked by the policy engine.
        filtered = {tuple(item for item in trace if item in allowed_actions) for trace in combined}
        return cls(filtered)

    def can_commit(self, action_id: str) -> bool:
        candidate = self.prefix + (action_id,)
        return any(trace[:len(candidate)] == candidate for trace in self.traces)

    def commit(self, action_id: str) -> None:
        if not self.can_commit(action_id):
            raise WorkflowError(f"illegal workflow transition: {action_id}")
        self.prefix += (action_id,)

    def complete(self) -> bool:
        return self.prefix in self.traces

