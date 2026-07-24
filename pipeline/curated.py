#!/usr/bin/env python3
"""Hand-verified Network Analyzer bundles → live graph-data.js.

Nodes are pulled VERBATIM from the per-skill cache (pipeline/nodes/*.json) by
index; edges are hand-authored after reading the real directives. Only these
bundles ship live (all verified:true). The 141 auto-drafts live off-prod in
graph-data.generated.js (gitignored) — see pipeline/gen_all.py.

Run:  python3 pipeline/curated.py
"""
import json, subprocess, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = pathlib.Path(__file__).resolve().parent / "nodes"
PALETTE = ["#1155CC", "#0f9d8f", "#e07b00", "#7c3aed", "#3aa6b9", "#c2410c"]
GOLD_KEY = "Radiologist|AI-assisted report drafting and worklist triage"

# Each bundle: skills{sid:name}, nodes[(nid,sid,cache_idx,label)], edges[(a,b,type,note)]
CURATION = {
  "Physician (Primary Care)|Adopting ambient clinical documentation": {
    "skills": {"hc": "healthcare-agents", "ng": "NeMo Guardrails", "dc": "doc-coauthoring"},
    "nodes": [
      ("dc-read", "dc", 0, "Reader-test in a fresh AI"),
      ("dc-edit", "dc", 3, "Edit in place, never reprint"),
      ("hc-env", "hc", 4, "Only in an approved PHI environment"),
      ("hc-hipaa", "hc", 3, "Prompts ≠ HIPAA-compliant"),
      ("ng-in", "ng", 2, "Input rail can reject input"),
      ("ng-out", "ng", 3, "Output rail can reject output"),
    ],
    "edges": [
      ("dc-read", "hc-env", "conflict",
       "Reader-testing pastes the ambient clinical note into a fresh external AI; the note is PHI, and healthcare-agents says PHI may be handled ONLY inside an org-approved environment. The two directives cannot both hold."),
      ("hc-hipaa", "hc-env", "reinforces",
       "Both warn that the skill alone doesn't make handling safe — PHI stays inside an approved, agreement-backed environment."),
      ("ng-in", "ng-out", "reinforces",
       "Input and output rails constrain both ends of the exchange with the same guard posture."),
    ],
  },
  "Medical Resident|AI-assisted literature review for journal club": {
    "skills": {"ms": "medsci-skills", "sa": "scientific-agent-skills", "nb": "notebooklm-py"},
    "nodes": [
      ("ms-fab", "ms", 0, "Never fabricate numbers"),
      ("sa-trace", "sa", 1, "Evidence-traceable reports"),
      ("sa-crit", "sa", 6, "Low-stakes critical evaluation"),
      ("nb-index", "nb", 0, "Index sources before generation"),
      ("nb-auth", "nb", 2, "Authenticate before any command"),
    ],
    "edges": [
      ("ms-fab", "sa-trace", "reinforces",
       "Anti-fabrication from two angles: never invent numbers, and every claim must trace to evidence."),
      ("sa-trace", "nb-index", "depends",
       "Generating an evidence-traceable review depends on notebooklm having indexed the sources first."),
      ("nb-index", "nb-auth", "depends",
       "Indexing/generation can't run until authentication is in place."),
    ],
  },
  "Academic Researcher|Writing a competitive grant proposal": {
    "skills": {"ar": "academic-research-skills", "dc": "doc-coauthoring", "hu": "humanizer", "pf": "pdf"},
    "nodes": [
      ("ar-cite", "ar", 6, "Citations required for strong claims"),
      ("ar-conf", "ar", 5, "Wait for explicit user confirmation"),
      ("dc-read", "dc", 0, "Reader-test in a fresh AI"),
      ("dc-conf", "dc", 1, "Wait for confirmation before searching"),
      ("hu-voice", "hu", 0, "Match the intended voice"),
      ("hu-src", "hu", 4, "Never invent a source"),
      ("pf-pdf", "pf", 2, "Assemble a multi-page PDF"),
    ],
    "edges": [
      ("ar-cite", "hu-src", "reinforces",
       "Both refuse unsupported claims: cite specific evidence, and never fabricate a source to sound grounded."),
      ("ar-conf", "dc-conf", "reinforces",
       "Both gate action on an explicit user confirmation before proceeding."),
      ("pf-pdf", "dc-read", "depends",
       "The exported proposal PDF is assembled from the doc that doc-coauthoring drafts and reader-tests."),
    ],
  },
  "Corporate Lawyer|Contract review and drafting with AI": {
    "skills": {"pf": "pdf", "rb": "Rebuff", "dc": "doc-coauthoring"},
    "nodes": [
      ("pf-ocr", "pf", 3, "OCR scanned contracts"),
      ("pf-layout", "pf", 1, "Extract text with layout"),
      ("rb-inj", "rb", 0, "Detect prompt injection"),
      ("rb-canary", "rb", 1, "Detect canary-word leakage"),
      ("dc-edit", "dc", 3, "Edit in place, never reprint"),
    ],
    "edges": [
      ("dc-edit", "pf-layout", "depends",
       "Editing/redlining the contract depends on first extracting its text and layout from the PDF."),
      ("rb-inj", "pf-ocr", "depends",
       "Injection scanning only helps if it runs on the extracted document text — a scanned contract can carry adversarial instructions."),
      ("rb-inj", "rb-canary", "reinforces",
       "Both guard against adversarial content and covert data leakage from the same egress point."),
    ],
  },
  "Software Engineer|Developing an AI coding assistant": {
    "skills": {"ca": "claude-api", "mb": "mcp-builder", "pm": "prompt-master", "wt": "webapp-testing"},
    "nodes": [
      ("ca-sdk", "ca", 3, "Call Claude via the SDK"),
      ("ca-flow", "ca", 6, "Agent once, Session per run"),
      ("mb-ro", "mb", 0, "Read-only, non-destructive ops"),
      ("mb-srv", "mb", 3, "Build MCP servers"),
      ("pm-cite", "pm", 2, "Force cite-only prompts"),
      ("pm-ground", "pm", 3, "Ground: don't extrapolate"),
      ("pm-scope", "pm", 5, "Scope prompts to file paths"),
      ("wt-idle", "wt", 1, "Wait for networkidle"),
      ("wt-close", "wt", 2, "Always close the browser"),
    ],
    "edges": [
      ("mb-srv", "ca-sdk", "depends",
       "The assistant's MCP server is wired to Claude through the SDK the claude-api skill mandates."),
      ("ca-sdk", "ca-flow", "reinforces",
       "Both enforce the same SDK discipline for how the agent talks to Claude."),
      ("pm-cite", "pm-ground", "reinforces",
       "Both curb hallucination: cite only what's certain, answer only from provided context."),
      ("pm-scope", "mb-ro", "reinforces",
       "Both are least-privilege: anchor prompts to explicit paths, and keep tool operations read-only."),
      ("wt-idle", "wt-close", "reinforces",
       "Both keep the test browser correct — wait for load, then always tear it down."),
    ],
  },
  "Data Scientist|Building an LLM-powered analytics assistant": {
    "skills": {"ca": "claude-api", "ga": "Guardrails AI", "xl": "xlsx", "gf": "graphify"},
    "nodes": [
      ("ca-sdk", "ca", 3, "Call Claude via the SDK"),
      ("ga-val", "ga", 0, "Input/output validation guards"),
      ("ga-struct", "ga", 3, "Enforce structured output"),
      ("xl-form", "xl", 1, "Formulas, never hardcoded"),
      ("xl-zero", "xl", 0, "Zero formula errors"),
      ("gf-conf", "gf", 4, "Tag inference confidence"),
    ],
    "edges": [
      ("xl-zero", "xl-form", "reinforces",
       "Both protect numeric correctness — live formulas and zero recalc errors before shipping."),
      ("ga-val", "xl-zero", "reinforces",
       "Both stop wrong output reaching the user: schema validation and a hard zero-error gate."),
      ("gf-conf", "ga-val", "reinforces",
       "Both refuse to overstate: tag every inference's confidence, and validate before release."),
      ("ga-struct", "ca-sdk", "depends",
       "Structured-output validation runs on the response the SDK call returns — it needs that call in place."),
    ],
  },
  "Application Security Engineer|Securing AI features and reviewing code with AI": {
    "skills": {"ac": "Anthropic-Cybersecurity-Skills", "rb": "Rebuff", "lg": "Llama Guard / PurpleLlama", "ng": "NeMo Guardrails"},
    "nodes": [
      ("ac-live", "ac", 1, "Run live offensive exercises"),
      ("rb-inj", "rb", 0, "Detect prompt injection"),
      ("lg-block", "lg", 0, "Block malicious prompts"),
      ("ng-in", "ng", 2, "Input rail rejects input"),
      ("ng-out", "ng", 3, "Output rail rejects output"),
    ],
    "edges": [
      ("ac-live", "lg-block", "conflict",
       "The offensive skill runs live exercises that intentionally send malicious prompts; Prompt Guard exists to block exactly those. Loaded together, the guard suppresses the red-team payloads — they defeat each other with no defined precedence."),
      ("ac-live", "ng-in", "conflict",
       "NeMo's input rail rejects the very adversarial inputs the live security exercise needs to deliver to its target."),
      ("rb-inj", "lg-block", "overlap",
       "Two independent frameworks guard the same input against injection — redundant, and they can disagree on what to block."),
      ("lg-block", "ng-in", "overlap",
       "A third input guard on the same egress point; three overlapping filters with no precedence order."),
      ("ng-in", "ng-out", "reinforces",
       "Input and output rails apply the same guard posture at both ends."),
    ],
  },
  "Investigative Journalist|Analyzing large document leaks": {
    "skills": {"gf": "graphify", "pf": "pdf", "rb": "Rebuff", "ss": "Skill_Seekers"},
    "nodes": [
      ("pf-ocr", "pf", 3, "OCR scanned leak documents"),
      ("gf-conf", "gf", 4, "Tag inference confidence"),
      ("rb-inj", "rb", 0, "Detect prompt injection"),
      ("rb-canary", "rb", 1, "Detect canary-word leakage"),
      ("ss-ckpt", "ss", 3, "Checkpoint long scrapes"),
    ],
    "edges": [
      ("gf-conf", "pf-ocr", "depends",
       "Building the relationship graph depends on OCR'ing the leaked documents into text first."),
      ("rb-inj", "pf-ocr", "depends",
       "Injection scanning must run on the extracted text — leaked files can carry adversarial instructions aimed at the journalist's AI."),
      ("rb-inj", "rb-canary", "reinforces",
       "Both defend against adversarial content and covert leakage in untrusted source material."),
    ],
  },
  "Financial Analyst|Earnings analysis and report automation": {
    "skills": {"pf": "pdf", "xl": "xlsx", "ga": "Guardrails AI"},
    "nodes": [
      ("pf-layout", "pf", 1, "Extract text from filings"),
      ("pf-ocr", "pf", 3, "OCR scanned filings"),
      ("xl-form", "xl", 1, "Formulas, never hardcoded"),
      ("xl-zero", "xl", 0, "Zero formula errors"),
      ("ga-val", "ga", 0, "Validate model output"),
    ],
    "edges": [
      ("xl-form", "pf-layout", "depends",
       "The spreadsheet model depends on the figures extracted from the filing PDF."),
      ("xl-zero", "xl-form", "reinforces",
       "Both protect the numbers — live formulas and a zero-error gate before the report ships."),
      ("ga-val", "xl-zero", "reinforces",
       "Both stop bad numbers reaching the reader: output validation plus a hard recalc-error gate."),
    ],
  },
}


def load_cache(name):
    f = CACHE / (re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") + ".json")
    return json.loads(f.read_text())["nodes"]


def build(persona, task, spec):
    skills = {}
    for i, (sid, name) in enumerate(spec["skills"].items()):
        skills[sid] = {"label": name, "dir": name, "color": PALETTE[i % len(PALETTE)]}
    nodes = []
    for nid, sid, idx, label in spec["nodes"]:
        text = load_cache(spec["skills"][sid])[idx]["text"]
        nodes.append({"id": nid, "skill": sid, "label": label, "text": text})
    edges = [{"a": a, "b": b, "type": t, "note": n} for a, b, t, n in spec["edges"]]
    return {"persona": persona, "task": task, "verified": True,
            "skills": skills, "nodes": nodes, "edges": edges}


def main():
    # preserve the existing hand-verified gold bundle from the live file
    src = (f"const fs=require('fs');let s=fs.readFileSync('graph-data.js','utf8')"
           f".replace(/if \\(typeof window[\\s\\S]*$/,'');s+=';globalThis.__V=GRAPHS;';eval(s);"
           f"process.stdout.write(JSON.stringify(globalThis.__V))")
    live = json.loads(subprocess.run(["node", "-e", src], cwd=ROOT, capture_output=True, text=True).stdout)

    graphs = {GOLD_KEY: {**live[GOLD_KEY], "verified": True}}
    for key, spec in CURATION.items():
        persona, task = key.split("|", 1)
        graphs[key] = build(persona, task, spec)

    js = ("// LIVE hand-verified Network Analyzer bundles (verified:true).\n"
          "// Nodes are verbatim real directives; edges are hand-authored. Regenerate\n"
          "// with pipeline/curated.py. The 141 auto-drafts live in graph-data.generated.js.\n"
          "const GRAPHS = " + json.dumps(graphs, ensure_ascii=False) + ";\n"
          'if (typeof window !== "undefined") { window.GRAPHS = GRAPHS; }\n')
    (ROOT / "graph-data.js").write_text(js)
    ne = sum(len(g["edges"]) for g in graphs.values())
    nc = sum(1 for g in graphs.values() for e in g["edges"] if e["type"] == "conflict")
    print(f"wrote graph-data.js: {len(graphs)} verified bundles, {ne} edges, {nc} conflicts")


if __name__ == "__main__":
    main()
