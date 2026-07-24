#!/usr/bin/env python3
"""Extract real directive nodes from a skill's repo — verbatim, never paraphrased.

Per-SKILL cache (pipeline/nodes/<slug>.json) so bundles reuse extracted nodes:
full coverage of 142 pairs = extract each distinct skill once, then compose.

Usage:
  python3 pipeline/extract_nodes.py "pdf" "Rebuff"        # named skills
  python3 pipeline/extract_nodes.py --bundle "Corporate Lawyer|Contract review and drafting with AI"
"""
import argparse, base64, json, re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = pathlib.Path(__file__).resolve().parent / "nodes"
TOP_K = 7

DIRECTIVE = re.compile(r"\b(never|always|must|only|do not|don'?t|should|ensure|avoid|"
                       r"block|reject|validate|verify|wait for|fail fast|no network|"
                       r"refrain|constrain|de-?identif|quote|require|prohibit|forbid)\b", re.I)
# imperative-mood directives (SKILL.md style: "Use str_replace…", "Extract text…")
IMPERATIVE = re.compile(r"^(use|extract|fill|convert|wait|ask|explain|generate|create|add|set|"
                        r"include|ensure|avoid|keep|prefer|return|check|read|write|run|call|pass|"
                        r"store|save|load|split|merge|validate|verify|quote|report|flag|handle|"
                        r"escape|normalize|render|parse|format|apply|choose|select|remove|replace|"
                        r"update|confirm|review|cite|summariz|classif|detect|refuse|limit|restrict|"
                        r"require|prohibit|forbid|de-?identif|redact|anonymiz)\b", re.I)
# setup/env/boilerplate that is NOT an agent directive — reject outright
NOISE = re.compile(r"(localhost|https?://|://|should be running|billing|npm |pip3? install|"
                   r"git clone|^cd |export |api[_ ]?key|©|licens|chmod|\.env|docker|"
                   r"version \d|v\d+\.\d+|install the|download the|clone the|node_modules|"
                   r"requirements\.txt|contributing|pull request|badge|star this)", re.I)
STRONG = ["never", "must not", "do not", "only", "always", "must", "block", "reject",
          "fail fast", "wait for", "validate", "ensure", "no network", "refrain", "forbid"]


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _node_eval(file, var, tail):
    """Eval a data-file and read a var out (const doesn't leak from eval → globalThis)."""
    return (f"const fs=require('fs');let s=fs.readFileSync('{file}','utf8')"
            f".replace(/if \\(typeof window[\\s\\S]*$/,'');s+=';globalThis.__V={var};';eval(s);{tail}")


def load_skills():
    """name -> {url,type} from data.js (via node, the source of truth)."""
    node = _node_eval("data.js", "SKILLS", "process.stdout.write(JSON.stringify(globalThis.__V))")
    out = subprocess.run(["node", "-e", node], cwd=ROOT, capture_output=True, text=True)
    return {s["name"]: s for s in json.loads(out.stdout)}


def bundle_skills(key):
    """persona|task -> [skill names] from rec-data.js."""
    node = _node_eval("rec-data.js", "RECS",
                      "const r=globalThis.__V.find(r=>r.p+'|'+r.t===process.argv[1]);"
                      "process.stdout.write(JSON.stringify(r?r.s.map(x=>x[0]):[]))")
    out = subprocess.run(["node", "-e", node, key], cwd=ROOT, capture_output=True, text=True)
    return json.loads(out.stdout or "[]")


def all_recommended_skills():
    """Every distinct skill name recommended across all 142 pairs."""
    node = _node_eval("rec-data.js", "RECS",
                      "const set=new Set();globalThis.__V.forEach(r=>r.s.forEach(x=>set.add(x[0])));"
                      "process.stdout.write(JSON.stringify([...set]))")
    out = subprocess.run(["node", "-e", node], cwd=ROOT, capture_output=True, text=True)
    return json.loads(out.stdout or "[]")


def resolve(url):
    """GitHub url -> (repo, [candidate directive paths]). None for non-repo link-lists."""
    m = re.search(r"github\.com/([^/]+)/([^/]+)/tree/[^/]+/(.+)$", url)
    if m:  # anthropics/skills/tree/main/skills/pdf -> that subdir's SKILL.md
        owner, repo, sub = m.group(1), m.group(2), m.group(3).rstrip("/")
        return f"{owner}/{repo}", [f"{sub}/SKILL.md", f"{sub}/skill.md", f"{sub}/README.md"]
    m = re.search(r"github\.com/([^/]+)/([^/]+)/?$", url)
    if m:
        repo = f"{m.group(1)}/{m.group(2)}"
        return repo, ["SKILL.md", "skill.md", ".claude/skills/SKILL.md", "README.md", "readme.md"]
    return None, None  # website / docs page — no machine-readable directives


def gh_raw(repo, path):
    r = subprocess.run(["gh", "api", f"repos/{repo}/contents/{path}", "--jq", ".content"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    try:
        return base64.b64decode(r.stdout).decode("utf-8", "ignore")
    except Exception:
        return None


def clean_md(md):
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    md = re.sub(r"```.*?```", "", md, flags=re.S)          # code blocks
    md = re.sub(r"^---\n.*?\n---\n", "", md, flags=re.S)    # yaml frontmatter
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md)            # images
    md = re.sub(r"<[^>]+>", "", md)                          # html tags (img/a/p/badges)
    md = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)         # unwrap links -> text
    return md


def label(text):
    words = re.sub(r"^(the|a|an|if|when)\s+", "", text, flags=re.I).split()
    lab = " ".join(words[:6]).rstrip(".,:;")
    return lab if len(lab) <= 42 else lab[:40] + "…"


def extract(md):
    """clean markdown -> ranked verbatim directive lines (no paraphrase)."""
    seen, out = set(), []
    for raw in clean_md(md).splitlines():
        s = raw.strip().lstrip("-*>#0123456789.) ").strip()
        s = re.sub(r"\*\*|__|`|~~", "", s).strip()
        s = re.sub(r"^(IMPORTANT|NOTE|WARNING|TIP)\s*[:\-]\s*", "", s, flags=re.I)
        if not (20 <= len(s) <= 240):
            continue
        if not (DIRECTIVE.search(s) or IMPERATIVE.match(s)):
            continue
        if NOISE.search(s) or s.count("|") > 1 or s.endswith("?"):  # noise / table / question
            continue
        key = re.sub(r"[^a-z]", "", s.lower())[:60]
        if key in seen:
            continue
        seen.add(key)
        out.append((sum(s.lower().count(k) for k in STRONG), s))
    out.sort(key=lambda x: -x[0])
    return [{"label": label(s), "text": s} for _, s in out[:TOP_K]]


def extract_skill(name, skills):
    entry = skills.get(name)
    if not entry:
        return {"name": name, "skipped": "not in data.js"}
    repo, paths = resolve(entry["url"])
    if not repo:
        return {"name": name, "url": entry["url"], "skipped": "no repo (link-list / website)"}
    for path in paths:
        md = gh_raw(repo, path)
        if md and len(md) > 40:
            nodes = extract(md)
            return {"name": name, "url": entry["url"], "repo": repo, "path": path,
                    "type": entry.get("type"), "nodes": nodes,
                    **({"skipped": "no directive lines found"} if not nodes else {})}
    return {"name": name, "url": entry["url"], "repo": repo, "skipped": "no fetchable directive file"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("names", nargs="*")
    ap.add_argument("--bundle", help="persona|task key from rec-data.js")
    ap.add_argument("--all", action="store_true", help="every distinct recommended skill (full coverage)")
    ap.add_argument("--quiet", action="store_true", help="summary only, no per-node dump")
    args = ap.parse_args()

    skills = load_skills()
    names = list(args.names)
    if args.bundle:
        names += bundle_skills(args.bundle)
    if args.all:
        names += all_recommended_skills()
    names = list(dict.fromkeys(names))  # dedup, keep order
    if not names:
        ap.error("give skill names, --bundle, or --all")

    CACHE.mkdir(exist_ok=True)
    print(f"Extracting {len(names)} skill(s):\n")
    ok = skipped = total_nodes = 0
    skip_reasons = {}
    for name in names:
        res = extract_skill(name, skills)
        if res.get("skipped"):
            skipped += 1
            skip_reasons[res["skipped"]] = skip_reasons.get(res["skipped"], 0) + 1
            print(f"  ⊘ {name:34s} — SKIPPED: {res['skipped']}")
            continue
        ok += 1
        total_nodes += len(res["nodes"])
        (CACHE / f"{slug(name)}.json").write_text(json.dumps(res, indent=2, ensure_ascii=False))
        print(f"  ✓ {name:34s} — {len(res['nodes'])} directives from {res['repo']}/{res['path']}")
        if not args.quiet:
            for n in res["nodes"]:
                print(f"        • {n['text'][:96]}")
            print()
    print(f"\n{'='*60}\nCOVERAGE: {ok}/{len(names)} skills yielded nodes "
          f"({total_nodes} nodes cached), {skipped} skipped")
    for r, c in sorted(skip_reasons.items(), key=lambda x: -x[1]):
        print(f"    {c:3d} skipped — {r}")


if __name__ == "__main__":
    sys.exit(main())
