from __future__ import annotations

from dataclasses import asdict, dataclass
from hashlib import sha256
import json
from typing import Any

from .model import Action, Decision, Scenario
from .policy import PolicyEngine
from .workflow import WorkflowGate


@dataclass(frozen=True)
class Capability:
    action_id: str
    action_digest: str
    policy_version: int
    nonce: str


@dataclass
class RuntimeDecision:
    allowed: bool
    reason: str
    policy: Decision | None = None


class CapabilityIssuer:
    @staticmethod
    def mint(action: Action, policy_version: int, seed: str) -> Capability:
        nonce = sha256(f"{seed}:{action.id}:{action.digest()}".encode()).hexdigest()[:20]
        return Capability(action.id, action.digest(), policy_version, nonce)


class ReferenceMonitor:
    def __init__(
        self,
        scenario: Scenario,
        capabilities: dict[str, Capability],
        policy: PolicyEngine | None,
        enforce_policy_at_commit: bool,
        enforce_taint: bool,
        enforce_approval: bool,
        workflow_gate: WorkflowGate | None = None,
    ):
        self.scenario = scenario
        self.capabilities = capabilities
        self.policy = policy
        self.enforce_policy_at_commit = enforce_policy_at_commit
        self.enforce_taint = enforce_taint
        self.enforce_approval = enforce_approval
        self.workflow_gate = workflow_gate

    def authorize(self, action: Action) -> RuntimeDecision:
        capability = self.capabilities.get(action.id)
        if capability is None:
            return RuntimeDecision(False, "missing-capability")
        if capability.action_digest != action.digest():
            return RuntimeDecision(False, "capability-argument-mismatch")
        current_version = self.policy.snapshot.version if self.policy else self.scenario.policy_version
        if capability.policy_version != current_version:
            return RuntimeDecision(False, "stale-capability")
        if self.enforce_approval and action.approval:
            approvals = set(self.scenario.initial_state.get("approvals", []))
            if action.approval not in approvals:
                return RuntimeDecision(False, "missing-approval")
        if self.workflow_gate and not self.workflow_gate.can_commit(action.id):
            return RuntimeDecision(False, "illegal-workflow-transition")
        if self.enforce_taint and action.sink and action.labels:
            clearance = set(self.scenario.sink_clearance.get(action.sink, ()))
            if not set(action.labels).issubset(clearance):
                return RuntimeDecision(False, "information-flow-denied")
        if self.enforce_policy_at_commit and self.policy:
            decision = self.policy.decide(action)
            if not decision.allowed:
                return RuntimeDecision(False, f"commit-{decision.reason}", decision)
            return RuntimeDecision(True, "commit-authorized", decision)
        return RuntimeDecision(True, "capability-authorized")

    def committed(self, action: Action) -> None:
        if self.workflow_gate:
            self.workflow_gate.commit(action.id)


class Simulator:
    """Deterministic effect simulator. It never touches external systems."""

    def __init__(self, initial_state: dict[str, Any] | None = None):
        self.state = json.loads(json.dumps(initial_state or {}))
        self.state.setdefault("resources", {})
        self.state.setdefault("messages", [])
        self.state.setdefault("transfers", [])
        self.state.setdefault("executions", [])

    def execute(self, action: Action) -> dict[str, Any]:
        resources = self.state["resources"]
        if action.name == "read":
            result = {"value": resources.get(action.resource)}
        elif action.name in {"write", "publish"}:
            value = action.args.get("value")
            resources[action.resource] = value
            result = {"written": action.resource, "value": value}
        elif action.name == "delete":
            existed = action.resource in resources
            resources.pop(action.resource, None)
            result = {"deleted": action.resource, "existed": existed}
        elif action.name == "send":
            record = {"sink": action.sink, "resource": action.resource,
                      "body": action.args.get("body"), "labels": list(action.labels)}
            self.state["messages"].append(record)
            result = record
        elif action.name == "transfer":
            record = {"sink": action.sink, "amount": action.args.get("amount", 0),
                      "resource": action.resource}
            self.state["transfers"].append(record)
            result = record
        elif action.name == "execute_script":
            # The script is recorded, not evaluated. This keeps study runs safe.
            record = {"script": action.args.get("script", ""), "resource": action.resource}
            self.state["executions"].append(record)
            result = {"simulated": True, **record}
        else:
            result = {"noop": action.name, "args": action.args}
        return result


def state_digest(state: dict[str, Any]) -> str:
    encoded = json.dumps(state, sort_keys=True, separators=(",", ":"), default=str)
    return sha256(encoded.encode()).hexdigest()
