const PAGE_SIZE = 10;
let filtered = SKILLS.slice();
let page = 1;
let activeType = "";

const body = document.getElementById("skillsBody");
const empty = document.getElementById("emptyState");
const pager = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const typeTabs = document.getElementById("typeTabs");

function init() {
  document.getElementById("statTotal").textContent = SKILLS.length;
  document.getElementById("statSkills").textContent = SKILLS.filter(s => s.type === "skill").length;
  document.getElementById("statGov").textContent = SKILLS.filter(s => s.type === "governance").length;

  const cats = [...new Set(SKILLS.map(s => s.category))].sort();
  categoryFilter.innerHTML =
    `<option value="">All categories</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join("");

  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  typeTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".type-tab");
    if (!btn) return;
    typeTabs.querySelectorAll(".type-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeType = btn.dataset.type;
    applyFilters();
  });

  render();
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  filtered = SKILLS.filter(s => {
    const matchesQ = !q ||
      s.name.toLowerCase().includes(q) ||
      s.purpose.toLowerCase().includes(q) ||
      s.source.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    const matchesCat = !cat || s.category === cat;
    const matchesType = !activeType || s.type === activeType;
    return matchesQ && matchesCat && matchesType;
  });
  page = 1;
  render();
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function render() {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(page, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  empty.hidden = rows.length !== 0;
  body.innerHTML = rows.map(s => `
    <tr>
      <td class="col-name">
        <a class="skill-link" href="${s.url}" target="_blank" rel="noopener">
          ${escapeHtml(s.name)}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </td>
      <td class="col-type"><span class="type-pill type-${s.type}">${s.type === "skill" ? "Skill" : "Governance"}</span></td>
      <td class="col-cat"><span class="cat-pill">${escapeHtml(s.category)}</span></td>
      <td class="col-purpose purpose-text">${escapeHtml(s.purpose)}</td>
      <td class="col-source source-text">${escapeHtml(s.source)}</td>
    </tr>
  `).join("");

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (filtered.length === 0) { pager.innerHTML = ""; return; }
  let html = `<button class="page-btn" ${page === 1 ? "disabled" : ""} data-page="${page - 1}">‹ Prev</button>`;
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
      if (p === 2 || p === totalPages - 1) html += `<span class="page-btn" style="border:none;cursor:default;">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${p === page ? "active" : ""}" data-page="${p}">${p}</button>`;
  }
  html += `<button class="page-btn" ${page === totalPages ? "disabled" : ""} data-page="${page + 1}">Next ›</button>`;
  pager.innerHTML = html;
  pager.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      page = Number(btn.dataset.page);
      render();
      document.querySelector(".table-wrap").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

init();
