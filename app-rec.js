// Skill Recommender view.
// Depends on RECS (rec-data.js) and the directory SKILLS (data.js).
// Every recommendation names a real directory entry; its type/category/purpose/URL
// are read live from SKILLS so a card always links to the real GitHub repo.

const DIR = new Map(SKILLS.map(s => [s.name, s]));

// ---- View switching ----
function activateView(view) {
  document.querySelectorAll(".nav-tab").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  document.getElementById("view-recommend").hidden = view !== "recommend";
  document.getElementById("view-directory").hidden = view !== "directory";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("mainNav").addEventListener("click", (e) => {
  const btn = e.target.closest(".nav-tab");
  if (!btn) return;
  activateView(btn.dataset.view);
});

// ---- Elements ----
const recSearch = document.getElementById("recSearch");
const recPersona = document.getElementById("recPersona");
const recTask = document.getElementById("recTask");
const recResults = document.getElementById("recResults");
const recEmpty = document.getElementById("recEmpty");
const recSuggest = document.getElementById("recSuggest");

const IMPORTANCE_ORDER = { High: 0, Medium: 1, Low: 2 };

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function initRec() {
  document.getElementById("recStatPairs").textContent = RECS.length;
  document.getElementById("recStatPersonas").textContent = new Set(RECS.map(r => r.p)).size;
  document.getElementById("recStatDomains").textContent = new Set(RECS.map(r => r.d)).size;

  const personas = [...new Set(RECS.map(r => r.p))].sort();
  recPersona.innerHTML = `<option value="">All personas</option>` +
    personas.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join("");

  // Search autocomplete: personas, tasks, domains.
  const suggestions = new Set();
  RECS.forEach(r => { suggestions.add(r.p); suggestions.add(r.t); suggestions.add(r.d); });
  recSuggest.innerHTML = [...suggestions].sort().map(s => `<option value="${esc(s)}">`).join("");

  recPersona.addEventListener("change", () => { syncTaskOptions(); renderRec(); });
  recTask.addEventListener("change", renderRec);
  recSearch.addEventListener("input", renderRec);

  renderRec();
}

// When a persona is chosen, scope the task dropdown to that persona's tasks.
function syncTaskOptions() {
  const p = recPersona.value;
  const tasks = RECS.filter(r => !p || r.p === p).map(r => r.t);
  recTask.innerHTML = `<option value="">All tasks / workflows</option>` +
    [...new Set(tasks)].sort().map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
}

function matches(r) {
  if (recPersona.value && r.p !== recPersona.value) return false;
  if (recTask.value && r.t !== recTask.value) return false;
  const q = recSearch.value.trim().toLowerCase();
  if (q) {
    const hay = (r.p + " " + r.d + " " + r.t + " " + r.s.map(x => x[0]).join(" ")).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderRec() {
  const hits = RECS.filter(matches);
  recEmpty.hidden = hits.length !== 0;
  recResults.innerHTML = hits.map(card).join("");
}

recResults.addEventListener("click", (e) => {
  const analyzeBtn = e.target.closest("[data-analyze]");
  if (analyzeBtn && typeof openAnalyzer === "function") { openAnalyzer(analyzeBtn.dataset.analyze); return; }

  if (e.target.closest("[data-import]")) {
    const panel = e.target.closest(".rec-card").querySelector(".rec-import-panel");
    if (panel) panel.hidden = !panel.hidden;
    return;
  }

  const copyBtn = e.target.closest(".rec-import-copy");
  if (copyBtn) {
    const pre = copyBtn.parentElement.querySelector("pre");
    const flash = () => { copyBtn.textContent = "Copied ✓"; setTimeout(() => { copyBtn.textContent = "Copy"; }, 1600); };
    const selectPre = () => { // fallback when the async clipboard API is unavailable (or blocked)
      const range = document.createRange();
      range.selectNodeContents(pre);
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(pre.textContent).then(flash, () => { selectPre(); flash(); });
    } else {
      selectPre(); flash();
    }
  }
});

// Build a copy-paste prompt that installs a bundle's real skills into an agent's skills folder.
// Installable = a directory entry that is a skill AND lives on github.com. Governance docs and other
// non-git entries are listed as reference only — never dressed up as a clonable skill (golden rule).
function importSet(r) {
  const install = [], reference = [];
  r.s.forEach(([name]) => {
    const e = DIR.get(name);
    if (!e) return;
    (e.type === "skill" && e.url.startsWith("https://github.com/") ? install : reference).push(e);
  });
  if (!install.length) return null;
  let prompt =
`Install this set of Claude Agent Skills for "${r.p} — ${r.t}".

For each repo below, add it to my skills folder (~/.claude/skills/ for personal use, or .claude/skills/ in the current project). If a URL points to a subfolder of a monorepo, copy just that skill's folder — the one holding SKILL.md. If a repo is a collection, add the folders relevant to this task. When done, list what you installed and confirm the skills load.

` + install.map(e => `- ${e.name}: ${e.url}`).join("\n");
  if (reference.length) {
    prompt += `\n\nReference only — open and adopt manually, do not install as skills:\n` +
      reference.map(e => `- ${e.name}: ${e.url}`).join("\n");
  }
  return { prompt, count: install.length };
}

function card(r) {
  const items = r.s.slice().sort((a, b) => IMPORTANCE_ORDER[a[1]] - IMPORTANCE_ORDER[b[1]]);
  const hasGraph = typeof GRAPHS !== "undefined" && GRAPHS[r.p + "|" + r.t];
  const analyzeBtn = hasGraph
    ? `<button class="rec-analyze" data-analyze="${esc(r.p + "|" + r.t)}"
         title="See how these skills' instructions depend on and conflict with each other">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="8" cy="18" r="2.5"/><line x1="8" y1="8" x2="16" y2="8.5"/><line x1="7" y1="8.5" x2="8" y2="15.5"/><line x1="10" y1="17" x2="16" y2="9"/></svg>
         Network Analyzer</button>`
    : "";
  const imp = importSet(r);
  const importBtn = imp
    ? `<button class="rec-import" data-import type="button"
         title="Copy a prompt that installs this exact set into your agent's skills folder">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><polyline points="8 11 12 15 16 11"/><path d="M5 21h14"/></svg>
         Import ${imp.count} ${imp.count === 1 ? "skill" : "skills"}</button>`
    : "";
  const bar = (analyzeBtn || importBtn)
    ? `<div class="rec-analyze-bar">${analyzeBtn}${importBtn}</div>` : "";
  return `
  <article class="rec-card">
    <header class="rec-card-head">
      <div>
        <span class="rec-domain">${esc(r.d)}</span>
        <h3 class="rec-persona">${esc(r.p)}</h3>
        <p class="rec-task">${esc(r.t)}</p>
      </div>
      <span class="rec-count">${items.length} to import</span>
    </header>
    ${bar}
    ${imp ? `<div class="rec-import-panel" hidden>
      <p class="rec-import-hint">Paste into your <strong>Claude Code</strong> or <strong>Codex</strong> CLI — it installs this set into your skills folder, ready to use.</p>
      <div class="rec-import-code">
        <button class="rec-import-copy" type="button">Copy</button>
        <pre>${esc(imp.prompt)}</pre>
      </div>
    </div>` : ""}
    <p class="rec-skills-label">AI skills &amp; governance files to import</p>
    <ul class="rec-skills">
      ${items.map(skillRow).join("")}
    </ul>
  </article>`;
}

// Grounding row: quote the skill's OWN verbatim self-description (fetched from its
// live repo into GROUNDING by pipeline/ground_recs.py) so a capability claim is
// checkable against source — never our paraphrase. Non-verifiable entries say so.
function groundRow(name) {
  const g = typeof GROUNDING !== "undefined" ? GROUNDING[name] : null;
  if (g && g.ok && g.quote) {
    const prov = esc(g.source) + (g.sha ? " · blob " + esc(g.sha) : "") + " · fetched " + esc(g.fetched);
    return `
    <details class="skill-ground">
      <summary><span class="grounded-tick">✓ Grounded</span> — the skill's own words <span class="skill-ground-meta">(${esc(g.source)})</span></summary>
      <blockquote class="skill-ground-quote">${esc(g.quote)}</blockquote>
      <p class="skill-ground-src">Verbatim from ${prov}. Grounds what the skill <em>claims to do</em>; the fit for this task is our editorial call.</p>
    </details>`;
  }
  return `<p class="skill-ground-unverified">Not machine-verified — cited by its source link above (external doc / link-list, no quotable skill repo).</p>`;
}

function skillRow([name, importance, why]) {
  const e = DIR.get(name);
  if (!e) return ""; // validation guarantees a match; guard just in case
  const typeLabel = e.type === "skill" ? "Skill" : "Governance";
  return `
  <li class="skill-item">
    <div class="skill-item-top">
      <a class="skill-name" href="${e.url}" target="_blank" rel="noopener" title="Open ${esc(name)} on GitHub">
        ${esc(name)}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
      <span class="type-pill type-${e.type}">${typeLabel}</span>
      <span class="badge imp-${importance.toLowerCase()}">${esc(importance)}</span>
      <span class="skill-cat">${esc(e.category)}</span>
    </div>
    <p class="skill-desc">${esc(e.purpose)}</p>
    <p class="skill-why"><span>Why:</span> ${esc(why)}</p>
    ${groundRow(name)}
  </li>`;
}

initRec();
