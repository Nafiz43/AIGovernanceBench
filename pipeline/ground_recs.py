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


def repo_meta(repo):
    """One call for the repo's own metadata: {description, stars, forks}, or None."""
    r = subprocess.run(
        ["gh", "api", f"repos/{repo}", "--jq",
         '{description: (.description // ""), stars: .stargazers_count, forks: .forks_count}'],
        capture_output=True, text=True)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout)
    except Exception:
        return None


def release_downloads(repo):
    """Total download count across all release assets. 0 if the repo ships none —
    GitHub has no repo-level download metric, so most source-only skill repos are 0."""
    r = subprocess.run(
        ["gh", "api", f"repos/{repo}/releases", "--paginate", "--jq",
         "[.[].assets[].download_count] | add // 0"],
        capture_output=True, text=True)
    if r.returncode != 0:
        return 0
    return sum(int(x) for x in r.stdout.split() if x.strip().lstrip("-").isdigit())


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
    url = entry["url"]
    today = datetime.date.today().isoformat()
    base = {"name": name, "url": url, "type": entry.get("type"),
            "installable": entry.get("type") == "skill" and url.startswith("https://github.com/")}

    # Traction signals — real GitHub stars/forks (and release downloads, if any) for ANY
    # entry that resolves to a github repo, skill or governance alike. Monorepo-subpath
    # skills carry the whole collection's stats -> repoWide, so we never imply they're the
    # one skill's. Non-github docs/websites resolve to no repo and simply get no stats.
    repo, paths = resolve(url)
    meta = None
    if repo:
        base["repo"] = repo
        meta = repo_meta(repo)
        if meta:
            base["stars"], base["forks"] = meta.get("stars"), meta.get("forks")
            dl = release_downloads(repo)
            if dl:
                base["downloads"] = dl
            if "/tree/" in url:
                base["repoWide"] = True

    if not base["installable"]:
        return {**base, "ok": False, "reason": "reference-only (no installable skill repo)"}
    if not repo:
        return {**base, "ok": False, "reason": "no repo (link-list / website)"}

    repo_desc = (meta or {}).get("description") or None
    for path in paths:
        md, sha = gh_json(repo, path)
        if not md or len(md) < 40:
            continue
        is_skillmd = path.lower().endswith("skill.md")
        quote = frontmatter_description(md) if is_skillmd else None
        source, sha_used = "SKILL.md description", sha
        if not quote and repo_desc:
            quote, source, sha_used = repo_desc, "GitHub repo description", None
        if not quote:
            quote, source = first_readme_line(md), f"{path} (first line)"
        if quote:
            from_repo_desc = source.startswith("GitHub repo")
            return {**base, "ok": True, "path": None if from_repo_desc else path,
                    "sha": sha_used, "source": source, "quote": quote, "fetched": today}
    if repo_desc:
        return {**base, "ok": True, "path": None, "sha": None,
                "source": "GitHub repo description", "quote": repo_desc, "fetched": today}
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
    with_stars = sum(1 for g in grounding.values() if g.get("stars") is not None)
    with_dl = sum(1 for g in grounding.values() if g.get("downloads"))
    print(f"\n{'='*64}\nGROUNDED: {ok} verified, {fail} unverified -> {OUT.name}")
    print(f"STATS: {with_stars} entries with GitHub stars/forks, {with_dl} with real release downloads")
    installable_fail = [g for g in grounding.values() if g["installable"] and not g["ok"]]
    if installable_fail:
        print("  installable-but-unverified (needs a look):")
        for g in installable_fail:
            print(f"    - {g['name']}: {g['reason']}")


if __name__ == "__main__":
    sys.exit(main())
