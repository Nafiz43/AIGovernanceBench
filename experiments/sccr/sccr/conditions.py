from __future__ import annotations

from dataclasses import dataclass

from .model import Action, Decision, Scenario
from .policy import PolicyEngine
from .runtime import Capability, CapabilityIssuer, ReferenceMonitor
from .workflow import WorkflowError, WorkflowGate


CONDITIONS = ("B0_prompt", "B1_tags", "B2_static", "B3_runtime", "B4_sccr")


@dataclass
class CompiledCondition:
    name: str
    policy: PolicyEngine | None
    preflight: dict[str, Decision]
    capabilities: dict[str, Capability]
    monitor: ReferenceMonitor
    workflow_errors: tuple[str, ...] = ()


def _declared(scenario: Scenario, action: Action) -> bool:
    patterns = [effect for contract in scenario.contracts for effect in contract.declared_effects]
    return action.name in patterns or "*" in patterns


def compile_condition(scenario: Scenario, condition: str) -> CompiledCondition:
    if condition not in CONDITIONS:
        raise ValueError(f"unknown condition {condition!r}; choose from {CONDITIONS}")
    policy = PolicyEngine(scenario.contracts, scenario.policy_version)
    preflight: dict[str, Decision] = {}
    capabilities: dict[str, Capability] = {}

    for action in scenario.actions:
        if condition == "B0_prompt":
            decision = Decision(True, "prompt-only-default-allow")
        elif condition in {"B1_tags", "B3_runtime"}:
            allowed = _declared(scenario, action)
            decision = Decision(allowed, "declared-effect" if allowed else "undeclared-effect")
        else:
            decision = policy.decide(action)
        preflight[action.id] = decision
        static_runtime_denial = False
        if condition == "B4_sccr" and decision.allowed:
            if action.sink and action.labels:
                clearance = set(scenario.sink_clearance.get(action.sink, ()))
                static_runtime_denial = not set(action.labels).issubset(clearance)
            if action.approval:
                static_runtime_denial = static_runtime_denial or (
                    action.approval not in set(scenario.initial_state.get("approvals", []))
                )
        if decision.allowed and not static_runtime_denial:
            capabilities[action.id] = CapabilityIssuer.mint(
                action, scenario.policy_version, f"{scenario.id}:{condition}"
            )

    workflow_gate = None
    workflow_errors: list[str] = []
    specs = [c.workflow for c in scenario.contracts if c.workflow]
    if specs and condition in {"B2_static", "B4_sccr"}:
        try:
            workflow_gate = WorkflowGate.compile(
                specs, {a.id for a in scenario.actions}, set(capabilities)
            )
        except WorkflowError as exc:
            workflow_errors.append(str(exc))
            if condition == "B4_sccr":
                capabilities.clear()  # full SCCR fails closed on malformed workflow
    monitor = ReferenceMonitor(
        scenario=scenario,
        capabilities=capabilities,
        policy=policy if condition in {"B2_static", "B4_sccr"} else None,
        enforce_policy_at_commit=condition == "B4_sccr",
        enforce_taint=condition in {"B3_runtime", "B4_sccr"},
        enforce_approval=condition in {"B3_runtime", "B4_sccr"},
        workflow_gate=workflow_gate,
    )
    return CompiledCondition(condition, policy, preflight, capabilities, monitor,
                             tuple(workflow_errors))
