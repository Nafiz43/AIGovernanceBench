from __future__ import annotations

from dataclasses import asdict, dataclass
import json
from pathlib import Path
import time

from .conditions import compile_condition
from .model import Scenario, TraceEvent
from .providers.base import Provider
from .runtime import Simulator, state_digest


@dataclass
class RunResult:
    scenario_id: str
    condition: str
    provider: str
    model: str
    model_family: str
    repeat: int
    status: str
    committed: tuple[str, ...]
    blocked: tuple[str, ...]
    final_state_digest: str
    trace: tuple[TraceEvent, ...]
    latency_ms: int


def run_once(
    scenario: Scenario,
    condition: str,
    provider: Provider,
    model: str = "scripted",
    model_family: str = "scripted",
    repeat: int = 0,
    max_steps: int = 12,
) -> RunResult:
    started = time.monotonic()
    compiled = compile_condition(scenario, condition)
    simulator = Simulator(scenario.initial_state)
    trace: list[TraceEvent] = []
    committed: list[str] = []
    blocked: list[str] = []

    def record(event: str, **kwargs) -> None:
        trace.append(TraceEvent(len(trace), event, scenario.id, condition, **kwargs))

    record("compile", reason="condition-compiled", data={
        "preflight": {k: asdict(v) for k, v in compiled.preflight.items()},
        "capabilities": sorted(compiled.capabilities),
        "workflow_errors": list(compiled.workflow_errors),
    })
    status = "max-steps"
    for _ in range(max_steps):
        try:
            proposal = provider.propose(scenario, trace)
        except Exception as exc:
            record("provider-error", reason=type(exc).__name__, data={"message": str(exc)[:1000]})
            status = "provider-error"
            break
        record("proposal", action_id=proposal.action_id, reason=proposal.justification,
               data={"kind": proposal.kind})
        if proposal.kind == "finish":
            status = "finished"
            break
        if proposal.kind != "action" or not proposal.action_id:
            record("error", reason="malformed-proposal")
            status = "provider-error"
            break
        try:
            action = scenario.action_by_id(proposal.action_id)
        except KeyError:
            record("block", action_id=proposal.action_id, allowed=False, reason="unknown-action")
            blocked.append(proposal.action_id)
            continue
        decision = compiled.monitor.authorize(action)
        if not decision.allowed:
            blocked.append(action.id)
            record("block", action_id=action.id, allowed=False, reason=decision.reason,
                   data={"policy": asdict(decision.policy) if decision.policy else None})
            continue
        effect = simulator.execute(action)
        compiled.monitor.committed(action)
        committed.append(action.id)
        record("commit", action_id=action.id, allowed=True, reason=decision.reason,
               data={"effect": effect, "state_digest": state_digest(simulator.state)})
    required = compiled.policy.required_actions(scenario.actions) if compiled.policy else set()
    missing = sorted(required - set(committed))
    if missing and status == "finished":
        status = "incomplete"
        record("incomplete", reason="required-actions-missing", data={"missing": missing})
    elapsed = int((time.monotonic() - started) * 1000)
    return RunResult(
        scenario.id, condition, type(provider).__name__, model, model_family, repeat, status,
        tuple(committed), tuple(blocked), state_digest(simulator.state), tuple(trace), elapsed,
    )


def append_result(path: str, result: RunResult) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(asdict(result), sort_keys=True, default=str) + "\n")


def result_key(result: dict) -> tuple[str, str, str, int]:
    return (result["scenario_id"], result["condition"], result["model"], int(result["repeat"]))


def completed_keys(path: str) -> set[tuple[str, str, str, int]]:
    file = Path(path)
    if not file.exists():
        return set()
    with file.open(encoding="utf-8") as fh:
        return {result_key(json.loads(line)) for line in fh if line.strip()}
