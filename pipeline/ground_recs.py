#!/usr/bin/env python3
"""Ground each recommended skill in its OWN words — verbatim, never paraphrased.

For every installable skill recommended in rec-data.js this fetches the skill's
real self-description (SKILL.md YAML `description:`, else the GitHub repo
description, else the first substantive README line) straight from the live repo,
pins the exact blob SHA it read, and stamps the date. Output -> grounding.js.

What this grounds: EXISTENCE (real, reachable, at this SHA today) and CAPABILITY
(the skill's own claim about what it does). It does NOT ground FIT (whether it's
the right pick for a given persona/task — that stays editorial) or EFFECTIVENESS
(needs usage data / the study in RESEARCH_PLAN.md). A skill we cannot reach is
reported ok:false with a reason — its snippet is never invented.

Usage:  python3 pipeline/ground_recs.py            # ground all recommended skills
        python3 pipeline/ground_recs.py --limit 5  # smoke test on the first few
"""
import argparse, base64, datetime, json, re, subprocess, sys, pathlib

from extract_nodes import resolve, load_skills, all_recommended_skills, clean_md

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "grounding.js"


def gh_json(repo, path):
    """(text, blob_sha) for repos/{repo}/contents/{path}, or (None, None)."""
    r = subprocess.run(
        ["gh", "api", f"repos/{repo}/contents/{path}",
         "--jq", "{content: .content, sha: .sha}"],
        capture_output=True, text=True)
    if r.returncode != 0:
        return None, None
    try:
        obj = json.loads(r.stdout)
        return base64.b64decode(obj["content"]).decode("utf-8", "ignore"), obj["sha"][:7]
    except Exception:
        return None, None


def repo_description(repo):
    """The repo's own GitHub 'description' field — verbatim self-declared metadata."""
    r = subprocess.run(["gh", "api", f"repos/{repo}", "--jq", ".description // empty"],
                       capture_output=True, text=True)
    d = r.stdout.strip()
    return d or None


def frontmatter_description(md):
    """Verbatim `description:` from a SKILL.md YAML frontmatter block, else None."""
    m = re.match(r"---\s*\n(.*?)\n---\s*\n", md, re.S)
    if not m:
        return None
    fm = m.group(1)
    # description: value  (value may be quoted and may fold onto continuation lines)
    dm = re.search(r"^description:\s*(.+?)(?=\n\S+:\s|\Z)", fm, re.S | re.M)
    if not dm:
        return None
    val = dm.group(1).strip()
    val = re.sub(r"^[|>][+\-]?\d*\s*", "", val)           # drop YAML block-scalar marker (|, |-, >, >-)
    val = re.sub(r"\s*\n\s*", " ", val).strip()          # unfold wrapped YAML
    val = val.strip("'\"").strip()
    return val or None


def first_readme_line(md):
    """First substantive prose line of a README — verbatim (skip headings/badges)."""
    for raw in clean_md(md).splitlines():
        s = raw.strip().lstrip("#>-*").strip()
        if len(s) >= 40 and not s.startswith("!") and "://" not in s:
            return s[:400]
    return None


def ground_one(name, entry):
    base = {"name": name, "url": entry["url"], "type": entry.get("type"),
            "installable": entry.get("type") == "skill" and entry["url"].startswith("https://github.com/")}
    if not base["installable"]:
        # governance docs / websites are cited by their URL already — no repo to quote.
        return {**base, "ok": False, "reason": "reference-only (no installable skill repo)"}

    repo, paths = resolve(entry["url"])
    if not repo:
        return {**base, "ok": False, "reason": "no repo (link-list / website)"}
    base["repo"] = repo

    for path in paths:
        md, sha = gh_json(repo, path)
        if not md or len(md) < 40:
            continue
        is_skillmd = path.lower().endswith(("skill.md",))
        quote = frontmatter_description(md) if is_skillmd else None
        source = "SKILL.md description"
        if not quote:
            rd = repo_description(repo)
            if rd:
                quote, source, sha = rd, "GitHub repo description", sha
        if not quote:
            quote = first_readme_line(md)
            source = f"{path} (first line)"
        if quote:
            return {**base, "ok": True, "path": path, "sha": sha,
                    "source": source, "quote": quote,
                    "fetched": datetime.date.today().isoformat()}
    # repo exists but nothing quotable — try the bare repo description as a last resort
    rd = repo_description(repo)
    if rd:
        return {**base, "ok": True, "path": None, "sha": None,
                "source": "GitHub repo description", "quote": rd,
                "fetched": datetime.date.today().isoformat()}
    return {**base, "ok": False, "reason": "no quotable self-description found"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="only ground the first N (smoke test)")
    args = ap.parse_args()

    skills = load_skills()
    names = all_recommended_skills()
    if args.limit:
        names = names[:args.limit]

    grounding, ok, fail = {}, 0, 0
    for name in sorted(names):
        entry = skills.get(name)
        if not entry:
            print(f"  ⊘ {name:34s} — not in data.js"); continue
        res = ground_one(name, entry)
        grounding[name] = res
        if res["ok"]:
            ok += 1
            print(f"  ✓ {name:32s} [{res['source']}]  {res['quote'][:70]}")
        else:
            fail += 1
            print(f"  ⚠ {name:32s} — {res['reason']}")

    header = ("// GROUNDING — verbatim self-descriptions of recommended skills, fetched from\n"
              "// each skill's live repo by pipeline/ground_recs.py. ok:true entries quote the\n"
              "// skill's OWN words (source + blob sha + date). ok:false = could not verify —\n"
              "// shown as 'unverified' in the UI, never fabricated. Regenerate, don't hand-edit.\n")
    OUT.write_text(header + "const GROUNDING = " +
                   json.dumps(grounding, indent=2, ensure_ascii=False) + ";\n")
    print(f"\n{'='*64}\nGROUNDED: {ok} verified, {fail} unverified -> {OUT.name}")
    installable_fail = [g for g in grounding.values() if g["installable"] and not g["ok"]]
    if installable_fail:
        print("  installable-but-unverified (needs a look):")
        for g in installable_fail:
            print(f"    - {g['name']}: {g['reason']}")


if __name__ == "__main__":
    sys.exit(main())
