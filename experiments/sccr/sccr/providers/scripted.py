from __future__ import annotations

from ..model import Proposal, Scenario, TraceEvent
from .base import Provider


class ScriptedProvider(Provider):
    """Deterministic provider for CI, examples, and non-LLM dry runs."""

    def propose(self, scenario: Scenario, trace: list[TraceEvent]) -> Proposal:
        proposed = [e.action_id for e in trace if e.event == "proposal" and e.action_id]
        if len(proposed) >= len(scenario.script):
            return Proposal("finish", justification="script exhausted")
        return Proposal("action", scenario.script[len(proposed)], "preregistered scripted action")

