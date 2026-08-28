from __future__ import annotations

from dataclasses import asdict, dataclass, field
try:
    from enum import StrEnum
except ImportError:                      # python < 3.11 (the run hosts)
    from enum import Enum

    class StrEnum(str, Enum):
        def __str__(self):
            return str(self.value)
from fnmatch import fnmatchcase
from hashlib import sha256
import json
from typing import Any, Iterable


class Modality(StrEnum):
    PERMIT = "permit"
    FORBID = "forbid"
    REQUIRE = "require"


class RiskTier(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


RISK_ORDER = {
    RiskTier.LOW: 0,
    RiskTier.MEDIUM: 1,
    RiskTier.HIGH: 2,
    RiskTier.CRITICAL: 3,
}


@dataclass(frozen=True)
class Scope:
    action: str = "*"
    resource: str = "*"
    sink: str = "*"
    purpose: str = "*"
    max_risk: RiskTier = RiskTier.CRITICAL

    def contains(self, action: "Action") -> bool:
        return (
            fnmatchcase(action.name, self.action)
            and fnmatchcase(action.resource, self.resource)
            and fnmatchcase(action.sink or "", self.sink)
            and fnmatchcase(action.purpose or "", self.purpose)
            and RISK_ORDER[action.risk] <= RISK_ORDER[self.max_risk]
        )


@dataclass(frozen=True)
class Grant:
    grantor: str
    grantee: str
    scope: Scope = Scope()


@dataclass(frozen=True)
class Rule:
    id: str
    issuer: str
    modality: Modality
    scope: Scope
    text: str = ""
    priority: int = 0


@dataclass(frozen=True)
class Action:
    id: str
    name: str
    resource: str = "*"
    sink: str = ""
    purpose: str = ""
    risk: RiskTier = RiskTier.LOW
    args: dict[str, Any] = field(default_factory=dict)
    labels: tuple[str, ...] = ()
    approval: str | None = None

    def digest(self) -> str:
        payload = json.dumps(asdict(self), sort_keys=True, separators=(",", ":"))
        return sha256(payload.encode()).hexdigest()


@dataclass
class Contract:
    id: str
    principal: str
    declared_effects: tuple[str, ...]
    rules: tuple[Rule, ...] = ()
    grants: tuple[Grant, ...] = ()
    playbook: tuple[str, ...] = ()
    workflow: dict[str, Any] | None = None


@dataclass
class Oracle:
    permitted: tuple[str, ...]
    required: tuple[str, ...]
    forbidden: tuple[str, ...]
    expected_status: str = "satisfiable"


@dataclass
class Scenario:
    id: str
    domain: str
    conflict_class: str
    goal: str
    contracts: tuple[Contract, ...]
    actions: tuple[Action, ...]
    script: tuple[str, ...]
    oracle: Oracle
    sink_clearance: dict[str, tuple[str, ...]] = field(default_factory=dict)
    initial_state: dict[str, Any] = field(default_factory=dict)
    policy_version: int = 1

    def action_by_id(self, action_id: str) -> Action:
        for action in self.actions:
            if action.id == action_id:
                return action
        raise KeyError(action_id)


@dataclass
class Decision:
    allowed: bool
    reason: str
    controlling_rules: tuple[str, ...] = ()
    suppressed_rules: tuple[str, ...] = ()
    invalid_rules: tuple[str, ...] = ()
    unsat_core: tuple[str, ...] = ()


@dataclass
class Proposal:
    kind: str
    action_id: str | None = None
    justification: str = ""


@dataclass
class TraceEvent:
    seq: int
    event: str
    scenario_id: str
    condition: str
    action_id: str | None = None
    allowed: bool | None = None
    reason: str = ""
    data: dict[str, Any] = field(default_factory=dict)


def _scope(value: dict[str, Any] | None) -> Scope:
    value = value or {}
    return Scope(
        action=value.get("action", "*"),
        resource=value.get("resource", "*"),
        sink=value.get("sink", "*"),
        purpose=value.get("purpose", "*"),
        max_risk=RiskTier(value.get("max_risk", "critical")),
    )


def scenario_from_dict(raw: dict[str, Any]) -> Scenario:
    contracts: list[Contract] = []
    for item in raw.get("contracts", []):
        rules = tuple(
            Rule(
                id=r["id"], issuer=r["issuer"], modality=Modality(r["modality"]),
                scope=_scope(r.get("scope")), text=r.get("text", ""),
                priority=int(r.get("priority", 0)),
            )
            for r in item.get("rules", [])
        )
        grants = tuple(
            Grant(g["grantor"], g["grantee"], _scope(g.get("scope")))
            for g in item.get("grants", [])
        )
        contracts.append(Contract(
            id=item["id"], principal=item["principal"],
            declared_effects=tuple(item.get("declared_effects", [])), rules=rules,
            grants=grants, playbook=tuple(item.get("playbook", [])),
            workflow=item.get("workflow"),
        ))
    actions = tuple(
        Action(
            id=a["id"], name=a["name"], resource=a.get("resource", "*"),
            sink=a.get("sink", ""), purpose=a.get("purpose", ""),
            risk=RiskTier(a.get("risk", "low")), args=a.get("args", {}),
            labels=tuple(a.get("labels", [])), approval=a.get("approval"),
        )
        for a in raw["actions"]
    )
    o = raw["oracle"]
    return Scenario(
        id=raw["id"], domain=raw["domain"], conflict_class=raw["conflict_class"],
        goal=raw["goal"], contracts=tuple(contracts), actions=actions,
        script=tuple(raw.get("script", [])),
        oracle=Oracle(tuple(o.get("permitted", [])), tuple(o.get("required", [])),
                      tuple(o.get("forbidden", [])), o.get("expected_status", "satisfiable")),
        sink_clearance={k: tuple(v) for k, v in raw.get("sink_clearance", {}).items()},
        initial_state=raw.get("initial_state", {}),
        policy_version=int(raw.get("policy_version", 1)),
    )


def load_scenarios(path: str) -> list[Scenario]:
    with open(path, encoding="utf-8") as fh:
        if path.endswith(".jsonl"):
            return [scenario_from_dict(json.loads(line)) for line in fh if line.strip()]
        raw = json.load(fh)
    records: Iterable[dict[str, Any]] = raw if isinstance(raw, list) else [raw]
    return [scenario_from_dict(record) for record in records]
