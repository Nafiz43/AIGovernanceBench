from __future__ import annotations

import argparse
import json
import os
import sys

from .conditions import CONDITIONS
from .model import load_scenarios
from .providers import (
    AnthropicMessagesProvider, OpenAICompatibleProvider,
    OpenAIResponsesProvider, ScriptedProvider,
)
from .runner import append_result, completed_keys, run_once
from .scoring import score_file
from .validate import validate_scenarios


def _provider(args):
    if args.provider == "scripted":
        return ScriptedProvider()
    if args.provider == "openai":
        return OpenAIResponsesProvider(args.model, base_url=args.base_url or "https://api.openai.com/v1")
    if args.provider == "anthropic":
        return AnthropicMessagesProvider(args.model, base_url=args.base_url or "https://api.anthropic.com/v1")
    return OpenAICompatibleProvider(args.model, os.getenv("OPENAI_COMPATIBLE_API_KEY", "local"),
                                    args.base_url or "http://127.0.0.1:8000/v1")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="sccr", description="Run the SCCR preregistered experiment")
    sub = parser.add_subparsers(dest="command", required=True)

    validate = sub.add_parser("validate", help="validate benchmark and oracle consistency")
    validate.add_argument("scenarios")
    validate.add_argument("--balanced", action="store_true")

    run = sub.add_parser("run", help="execute one or more experimental cells")
    run.add_argument("scenarios")
    run.add_argument("--condition", choices=CONDITIONS + ("all",), default="all")
    run.add_argument("--provider", choices=("scripted", "openai", "anthropic", "openai-compatible"), default="scripted")
    run.add_argument("--model", default="scripted")
    run.add_argument("--model-family", default=None,
                     help="preregistered family label; defaults to provider name")
    run.add_argument("--base-url")
    run.add_argument("--repeats", type=int, default=1)
    run.add_argument("--max-steps", type=int, default=12)
    run.add_argument("--output", default="artifacts/runs.jsonl")
    run.add_argument("--resume", action="store_true")

    score = sub.add_parser("score", help="score immutable traces against scenario oracles")
    score.add_argument("scenarios")
    score.add_argument("results")
    score.add_argument("--output", default="artifacts/scores.csv")

    args = parser.parse_args(argv)
    scenarios = load_scenarios(args.scenarios)
    if args.command == "validate":
        errors = validate_scenarios(scenarios, args.balanced)
        if errors:
            print("\n".join(f"ERROR: {e}" for e in errors), file=sys.stderr)
            return 1
        print(f"valid: {len(scenarios)} scenarios")
        return 0
    if args.command == "score":
        summary = score_file(args.results, scenarios, args.output)
        print(json.dumps(summary, indent=2, sort_keys=True))
        return 0

    conditions = CONDITIONS if args.condition == "all" else (args.condition,)
    done = completed_keys(args.output) if args.resume else set()
    provider = _provider(args)
    count = 0
    for scenario in scenarios:
        for condition in conditions:
            for repeat in range(args.repeats):
                key = (scenario.id, condition, args.model, repeat)
                if key in done:
                    continue
                family = args.model_family or args.provider
                result = run_once(scenario, condition, provider, args.model, family, repeat, args.max_steps)
                append_result(args.output, result)
                count += 1
    print(f"completed {count} runs -> {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
