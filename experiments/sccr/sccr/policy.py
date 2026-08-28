from __future__ import annotations

from dataclasses import dataclass
from fnmatch import fnmatchcase

from .model import Action, Contract, Decision, Grant, Modality, Rule


BUILTIN_RANK = {"system": 400, "developer": 300, "user": 200}


@dataclass
class PolicySnapshot:
    version: int
    rules: tuple[Rule, ...]
    grants: tuple[Grant, ...]


class PolicyEngine:
    """Finite, auditable authority and conflict resolver.

    Built-in principals are ordered system > developer > user. Other principals
    have authority only through an in-scope grant. A higher-rank rule suppresses
    a lower-rank contradictory rule. Contradictory maximal rules are rejected as
    an unsatisfiable core; the engine never silently chooses between them.
    """

    def __init__(self, contracts: tuple[Contract, ...], version: int = 1):
        self.snapshot = PolicySnapshot(
            version,
            tuple(rule for c in contracts for rule in c.rules),
            tuple(grant for c in contracts for grant in c.grants),
        )

    def _grant_depth(self, principal: str, action: Action) -> int | None:
        if principal in BUILTIN_RANK:
            return 0
        frontier = [(p, 0) for p in BUILTIN_RANK]
        seen = set()
        while frontier:
            current, depth = frontier.pop(0)
            if current in seen:
                continue
            seen.add(current)
            for grant in self.snapshot.grants:
                if grant.grantor == current and grant.scope.contains(action):
                    if grant.grantee == principal:
                        return depth + 1
                    frontier.append((grant.grantee, depth + 1))
        return None

    def authority_rank(self, rule: Rule, action: Action) -> tuple[int, int] | None:
        if rule.issuer in BUILTIN_RANK:
            return (BUILTIN_RANK[rule.issuer], rule.priority)
        depth = self._grant_depth(rule.issuer, action)
        if depth is None:
            return None
        # Delegation cannot increase authority. All delegated skill principals
        # remain below direct user authority; explicit priority only breaks ties.
        return (100 - depth, rule.priority)

    @staticmethod
    def _applies(rule: Rule, action: Action) -> bool:
        return rule.scope.contains(action)

    def decide(self, action: Action, default_allow: bool = False) -> Decision:
        applicable = [r for r in self.snapshot.rules if self._applies(r, action)]
        ranked: list[tuple[Rule, tuple[int, int]]] = []
        invalid: list[str] = []
        for rule in applicable:
            rank = self.authority_rank(rule, action)
            if rank is None:
                invalid.append(rule.id)
            else:
                ranked.append((rule, rank))
        if not ranked:
            return Decision(default_allow, "default-allow" if default_allow else "default-deny",
                            invalid_rules=tuple(sorted(invalid)))

        max_rank = max(rank for _, rank in ranked)
        top = [r for r, rank in ranked if rank == max_rank]
        suppressed = [r.id for r, rank in ranked if rank < max_rank]
        denies = [r for r in top if r.modality == Modality.FORBID]
        allows = [r for r in top if r.modality in (Modality.PERMIT, Modality.REQUIRE)]
        if denies and allows:
            # Because modalities are binary at one concrete action, any opposing
            # pair is already a cardinality-minimal unsatisfiable core.
            core = tuple(sorted((denies[0].id, allows[0].id)))
            return Decision(False, "unsatisfiable-policy", tuple(r.id for r in top),
                            tuple(sorted(suppressed)), tuple(sorted(invalid)), core)
        if denies:
            return Decision(False, "forbidden", tuple(sorted(r.id for r in denies)),
                            tuple(sorted(suppressed)), tuple(sorted(invalid)))
        return Decision(True, "authorized", tuple(sorted(r.id for r in allows)),
                        tuple(sorted(suppressed)), tuple(sorted(invalid)))

    def required_actions(self, actions: tuple[Action, ...]) -> set[str]:
        required = set()
        for action in actions:
            decision = self.decide(action)
            controlling = {r.id for r in self.snapshot.rules if r.id in decision.controlling_rules}
            if decision.allowed and any(
                r.modality == Modality.REQUIRE and r.id in controlling
                for r in self.snapshot.rules
            ):
                required.add(action.id)
        return required
