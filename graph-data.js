// Instruction-dependency graphs for a persona × task skill bundle.
// POC scope: ONE bundle (Radiologist × report drafting). Every node is a REAL
// directive read out of the recommended skill's actual repo — nothing invented.
// Edges are typed relationships BETWEEN those instructions:
//   conflict   — one instruction does what another forbids (the money finding)
//   overlap    — two skills do the same job; redundant, may disagree
//   depends    — one instruction only works if another is in place
//   reinforces — two instructions push the same way
//
// skill.dir = exact directory-entry name (app-graph looks up the live GitHub
// URL + type from SKILLS via DIR). href overrides with a deep link when a
// directive lives in a specific sub-skill file.

const GRAPHS = {
  "Radiologist|AI-assisted report drafting and worklist triage": {
    persona: "Radiologist",
    task: "AI-assisted report drafting and worklist triage",
    skills: {
      dc: { label: "doc-coauthoring", dir: "doc-coauthoring", color: "#1155CC" },
      di: { label: "medsci-skills · deidentify", dir: "medsci-skills", color: "#0f9d8f",
            href: "https://github.com/Aperivue/medsci-skills/blob/main/docs/skills/deidentify.md" },
      cr: { label: "medsci-skills · check-reporting", dir: "medsci-skills", color: "#3aa6b9",
            href: "https://github.com/Aperivue/medsci-skills/blob/main/docs/skills/check-reporting.md" },
      ng: { label: "NeMo Guardrails", dir: "NeMo Guardrails", color: "#7c3aed" },
      ga: { label: "Guardrails AI", dir: "Guardrails AI", color: "#e07b00" },
      eu: { label: "EU AI Act", dir: "EU AI Act", color: "#5b6472" },
    },
    nodes: [
      // --- doc-coauthoring (Anthropic) ---
      { id: "dc-reader-test", skill: "dc", label: "Reader-test in a fresh context",
        text: "Stage 3 “Reader Testing”: paste the draft into a fresh Claude with no prior context to catch blind spots before others read it." },
      { id: "dc-image-alt", skill: "dc", label: "Paste images in for alt-text",
        text: "If embedded images lack alt-text, ask the user to paste each image into chat so the agent can generate descriptive alt-text." },
      { id: "dc-confirm", skill: "dc", label: "Confirm before searching tools",
        text: "When the user points to channels or connected tools, wait for explicit user confirmation before searching integrations." },
      { id: "dc-generate", skill: "dc", label: "Brainstorm & draft sections",
        text: "Act as an active guide: brainstorm 5–20 options per section, then draft and iteratively refine the document." },

      // --- medsci-skills / deidentify (Aperivue) ---
      { id: "di-local-only", skill: "di", label: "No AI/network on PHI",
        text: "De-identification runs as a standalone local script with no network and no AI calls — the agent never sees raw PHI." },
      { id: "di-no-mapping", skill: "di", label: "Never read re-id mapping",
        text: "Never read or display the re-identification mapping file; it holds the original PHI values." },
      { id: "di-audit-only", skill: "di", label: "Read only report + audit log",
        text: "Only the scan report (no raw values), the hash-only SHA-256 audit log, and the de-identified output may be read." },

      // --- medsci-skills / check-reporting (Aperivue) ---
      { id: "cr-quote", skill: "cr", label: "Quote items, never invent",
        text: "Report/checklist items are quoted from the guideline and never invented; missing items are not marked present." },
      { id: "cr-fail-fast", skill: "cr", label: "Fail fast if checklist absent",
        text: "If the required reporting checklist is missing, fail fast rather than generating a guessed one." },

      // --- NeMo Guardrails (NVIDIA) ---
      { id: "ng-output-rail", skill: "ng", label: "Block unverified findings",
        text: "Output / self-check rails block the agent from emitting unverified or unsupported findings (fact-check & hallucination rails)." },
      { id: "ng-dialog-rail", skill: "ng", label: "Constrain topics & actions",
        text: "Input and dialog rails restrict what the agent will discuss or act on." },

      // --- Guardrails AI ---
      { id: "ga-validate", skill: "ga", label: "Validate output vs spec",
        text: "Validate every output against the RAIL spec before it reaches the user; on failure reask, fix, filter, or refrain." },
      { id: "ga-schema", skill: "ga", label: "Enforce report structure",
        text: "Structured-schema validation rejects any output that doesn't match the required report structure." },

      // --- EU AI Act ---
      { id: "eu-oversight", skill: "eu", label: "Art 14 · human oversight",
        text: "High-risk systems must allow effective human oversight — a person can review and override the output." },
      { id: "eu-data-gov", skill: "eu", label: "Art 10 · data governance",
        text: "Input data must be governed — relevant, representative, and for health data lawfully de-identified." },
      { id: "eu-logging", skill: "eu", label: "Art 12 · traceability",
        text: "Automatic logging must make the system's operation traceable across its lifecycle." },
    ],
    edges: [
      // ---- CONFLICTS (the reason this tool exists) ----
      { a: "dc-reader-test", b: "di-local-only", type: "conflict",
        note: "Reader-testing ships the draft report to a fresh AI context; deidentify forbids any AI or network contact with PHI. One instruction does exactly what the other bans." },
      { a: "dc-image-alt", b: "di-local-only", type: "conflict",
        note: "Pasting a radiology image in for alt-text exposes burned-in DICOM PHI to the agent — which deidentify says must never happen." },
      { a: "dc-generate", b: "ng-output-rail", type: "conflict",
        note: "The drafting skill is expansive (brainstorm options, draft findings); the output rail withholds anything unverified. They pull the same output in opposite directions with no defined precedence." },

      // ---- OVERLAPS (redundant — two libraries, one job) ----
      { a: "ng-output-rail", b: "ga-validate", type: "overlap",
        note: "Two independent frameworks guard the same egress point. Redundant, and they can disagree on pass/fail — output gets double-moderated." },
      { a: "ng-dialog-rail", b: "ga-schema", type: "overlap",
        note: "Both impose structural/scope constraints on the output with no defined precedence over each other." },

      // ---- DEPENDS (directed: a relies on b) ----
      { a: "eu-oversight", b: "dc-confirm", type: "depends",
        note: "The human-oversight obligation is partly satisfied by doc-coauthoring's confirm-before-acting gate." },
      { a: "eu-oversight", b: "ng-output-rail", type: "depends",
        note: "Oversight also relies on the guardrail holding outputs back for a human to review before release." },
      { a: "eu-data-gov", b: "di-local-only", type: "depends",
        note: "Data-governance compliance depends on the de-identification step running first." },
      { a: "eu-logging", b: "di-audit-only", type: "depends",
        note: "Traceability depends on the hash-only audit log that deidentify produces." },
      { a: "ga-schema", b: "cr-quote", type: "depends",
        note: "Schema validation needs the reporting-guideline items as the rules it checks the report against." },

      // ---- REINFORCES ----
      { a: "cr-quote", b: "ng-output-rail", type: "reinforces",
        note: "Both enforce “don't state what isn't supported” — anti-fabrication from two angles." },
      { a: "cr-quote", b: "ga-validate", type: "reinforces",
        note: "Guideline-quoting and output validation push the same not-invented standard." },
      { a: "di-no-mapping", b: "di-audit-only", type: "reinforces",
        note: "Both minimize PHI exposure — reinforcing the same containment boundary." },
    ],
  },
};

if (typeof window !== "undefined") { window.GRAPHS = GRAPHS; }
