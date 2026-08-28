from __future__ import annotations

from abc import ABC, abstractmethod

from ..model import Proposal, Scenario, TraceEvent


class Provider(ABC):
    @abstractmethod
    def propose(self, scenario: Scenario, trace: list[TraceEvent]) -> Proposal:
        raise NotImplementedError

