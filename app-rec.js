// Skill Recommender view. Depends on RECS + SKILL_LIB from rec-data.js.

// ---- View switching ----
document.getElementById("mainNav").addEventListener("click", (e) => {
  const btn = e.target.closest(".nav-tab");
  if (!btn) return;
  document.querySelectorAll(".nav-tab").forEach(b => b.classList.toggle("active", b === btn));
  const view = btn.dataset.view;
  document.getElementById("view-recommend").hidden = view !== "recommend";
  document.getElementById("view-directory").hidden = view !== "directory";
  window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Search autocomplete: personas + tasks + a few keywords
  const suggestions = new Set();
  RECS.forEach(r => { suggestions.add(r.p); suggestions.add(r.t); suggestions.add(r.d); });
  recSuggest.innerHTML = [...suggestions].sort().map(s => `<option value="${esc(s)}">`).join("");

  recPersona.addEventListener("change", () => { syncTaskOptions(); render(); });
  recTask.addEventListener("change", render);
  recSearch.addEventListener("input", render);

  render();
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

function render() {
  const hits = RECS.filter(matches);
  recEmpty.hidden = hits.length !== 0;
  recResults.innerHTML = hits.map(card).join("");
}

function card(r) {
  const skills = r.s.slice().sort((a, b) => IMPORTANCE_ORDER[a[1]] - IMPORTANCE_ORDER[b[1]]);
  return `
  <article class="rec-card">
    <header class="rec-card-head">
      <div>
        <span class="rec-domain">${esc(r.d)}</span>
        <h3 class="rec-persona">${esc(r.p)}</h3>
        <p class="rec-task">${esc(r.t)}</p>
      </div>
      <span class="rec-count">${skills.length} skills</span>
    </header>
    <ul class="rec-skills">
      ${skills.map(skillRow).join("")}
    </ul>
  </article>`;
}

function skillRow([name, importance, proficiency, why]) {
  const lib = SKILL_LIB[name] || ["", ""];
  const [category, description] = lib;
  return `
  <li class="skill-item">
    <div class="skill-item-top">
      <span class="skill-name">${esc(name)}</span>
      <span class="badge imp-${importance.toLowerCase()}">${esc(importance)}</span>
      <span class="badge prof">${esc(proficiency)}</span>
      ${category ? `<span class="skill-cat">${esc(category)}</span>` : ""}
    </div>
    ${description ? `<p class="skill-desc">${esc(description)}</p>` : ""}
    <p class="skill-why"><span>Why:</span> ${esc(why)}</p>
  </li>`;
}

initRec();
