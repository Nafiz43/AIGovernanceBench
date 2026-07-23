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

function card(r) {
  const items = r.s.slice().sort((a, b) => IMPORTANCE_ORDER[a[1]] - IMPORTANCE_ORDER[b[1]]);
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
    <p class="rec-skills-label">AI skills &amp; governance files to import</p>
    <ul class="rec-skills">
      ${items.map(skillRow).join("")}
    </ul>
  </article>`;
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
  </li>`;
}

initRec();
