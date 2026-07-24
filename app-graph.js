// Network Analyzer — renders the instruction-dependency graph for one skill
// bundle in an overlay. Depends on GRAPHS (graph-data.js), SKILLS/DIR + esc()
// (data.js / app-rec.js). Pure vanilla SVG force layout, no libraries.

const EDGE_TYPES = {
  conflict:   { color: "#d81f1f", label: "Conflict",   width: 3,   dash: "6 4", directed: false },
  overlap:    { color: "#e6a100", label: "Redundant overlap", width: 2.4, dash: "2 4", directed: false },
  depends:    { color: "#2563eb", label: "Depends on", width: 1.7, dash: "",    directed: true  },
  reinforces: { color: "#12a150", label: "Reinforces", width: 1.7, dash: "",    directed: false },
};
const SVGNS = "http://www.w3.org/2000/svg";

let AN = null; // live analyzer state

function skillMeta(g, skillKey) {
  const s = g.skills[skillKey];
  const dir = DIR.get(s.dir);
  return {
    label: s.label,
    color: s.color,
    href: s.href || (dir && dir.url) || "#",
    type: dir ? dir.type : "skill",
  };
}

function openAnalyzer(key) {
  const g = GRAPHS[key];
  if (!g) return;
  buildOverlayShell();
  const box = document.getElementById("analyzerOverlay");
  box.hidden = false;
  document.body.style.overflow = "hidden";

  // Header + summary
  const counts = { conflict: 0, overlap: 0, depends: 0, reinforces: 0 };
  g.edges.forEach(e => counts[e.type]++);
  document.getElementById("anTitle").textContent = `${g.persona} · ${g.task}`;
  const provenance = g.verified
    ? `<span class="an-chip an-chip-verified">✓ Human-verified</span>`
    : `<span class="an-chip an-chip-draft" title="Nodes are real directives; edges are auto-detected candidates, not verified. Conflicts only shown on verified bundles.">⚙ Auto-generated draft</span>`;
  document.getElementById("anSummary").innerHTML =
    provenance +
    ` ${Object.keys(g.skills).length} skills · ${g.nodes.length} instructions` +
    ` <span class="an-chip an-chip-conflict">⚠ ${counts.conflict} conflicts</span>` +
    ` <span class="an-chip an-chip-overlap">${counts.overlap} redundant</span>` +
    ` <span class="an-chip an-chip-depends">${counts.depends} dependencies</span>`;

  buildLegend(g);
  renderGraph(g);
  showDefaultDetail(g, counts);
}

function closeAnalyzer() {
  const box = document.getElementById("analyzerOverlay");
  if (box) box.hidden = true;
  document.body.style.overflow = "";
  if (AN && AN.raf) cancelAnimationFrame(AN.raf);
  AN = null;
}

function buildOverlayShell() {
  if (document.getElementById("analyzerOverlay")) return;
  const el = document.createElement("div");
  el.id = "analyzerOverlay";
  el.hidden = true;
  el.innerHTML = `
    <div class="an-backdrop" data-close></div>
    <div class="an-panel" role="dialog" aria-label="Skill instruction network analyzer">
      <header class="an-head">
        <div>
          <p class="an-eyebrow">Network Analyzer · instruction dependency map</p>
          <h2 id="anTitle"></h2>
          <p id="anSummary" class="an-summary"></p>
        </div>
        <button class="an-close" data-close aria-label="Close">✕</button>
      </header>
      <div class="an-legend" id="anLegend"></div>
      <div class="an-body">
        <div class="an-graph" id="anGraph"></div>
        <aside class="an-detail" id="anDetail"></aside>
      </div>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener("click", (e) => { if (e.target.dataset.close !== undefined) closeAnalyzer(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("analyzerOverlay").hidden) closeAnalyzer();
  });
}

function buildLegend(g) {
  const edgeLegend = Object.entries(EDGE_TYPES).map(([, t]) =>
    `<span class="an-leg"><span class="an-leg-line" style="background:${t.color}"></span>${t.label}</span>`).join("");
  const skillLegend = Object.keys(g.skills).map(k => {
    const m = skillMeta(g, k);
    return `<span class="an-leg"><span class="an-leg-dot" style="background:${m.color}"></span>${esc(m.label)}</span>`;
  }).join("");
  document.getElementById("anLegend").innerHTML =
    `<div class="an-leg-group">${edgeLegend}</div><div class="an-leg-group">${skillLegend}</div>`;
}

// ---------- Graph rendering + force layout ----------
function renderGraph(g) {
  const host = document.getElementById("anGraph");
  host.innerHTML = "";
  const W = host.clientWidth || 640, H = host.clientHeight || 520;

  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  // arrowheads for directed (depends) edges
  svg.innerHTML = `<defs><marker id="anArrow" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${EDGE_TYPES.depends.color}"/></marker></defs>`;
  host.appendChild(svg);

  // init node physics — seeded on a circle so layout is deterministic (no RNG)
  const nodes = g.nodes.map((n, i) => {
    const a = (i / g.nodes.length) * Math.PI * 2;
    return { ...n, x: W / 2 + Math.cos(a) * W * 0.28, y: H / 2 + Math.sin(a) * H * 0.28,
             vx: 0, vy: 0, pinned: false };
  });
  const byId = new Map(nodes.map(n => [n.id, n]));
  const edges = g.edges.map(e => ({ ...e, s: byId.get(e.a), t: byId.get(e.b) }));

  // draw edges
  const edgeEls = edges.map(e => {
    const cfg = EDGE_TYPES[e.type];
    const line = document.createElementNS(SVGNS, "line");
    line.setAttribute("stroke", cfg.color);
    line.setAttribute("stroke-width", cfg.width);
    if (cfg.dash) line.setAttribute("stroke-dasharray", cfg.dash);
    if (cfg.directed) line.setAttribute("marker-end", "url(#anArrow)");
    line.setAttribute("class", "an-edge");
    line.dataset.a = e.a; line.dataset.b = e.b;
    svg.appendChild(line);
    return { e, line };
  });

  // draw nodes
  const nodeEls = nodes.map(n => {
    const m = skillMeta(g, n.skill);
    const grp = document.createElementNS(SVGNS, "g");
    grp.setAttribute("class", "an-node");
    grp.dataset.id = n.id;
    const c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("r", 13);
    c.setAttribute("fill", m.color);
    const label = document.createElementNS(SVGNS, "text");
    label.setAttribute("class", "an-node-label");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dy", 27);
    label.textContent = n.label;
    grp.appendChild(c); grp.appendChild(label);
    svg.appendChild(grp);
    grp.addEventListener("click", (ev) => { ev.stopPropagation(); selectNode(n.id); });
    enableDrag(grp, n, svg, W, H);
    return { n, grp };
  });

  AN = { g, W, H, nodes, edges, edgeEls, nodeEls, byId, svg, ticks: 0, selected: null };
  runSim();
}

function runSim() {
  if (!AN) return;
  const { nodes, edges, W, H } = AN;
  const K_REP = 9000, K_SPRING = 0.04, L = 118, GRAV = 0.015, DAMP = 0.86, PAD = 34;

  function step() {
    for (const n of nodes) { n.ax = 0; n.ay = 0; }
    // repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy || 0.01;
        const f = K_REP / d2;
        const d = Math.sqrt(d2);
        const ux = dx / d, uy = dy / d;
        a.ax += ux * f; a.ay += uy * f;
        b.ax -= ux * f; b.ay -= uy * f;
      }
    }
    // springs
    for (const e of edges) {
      const a = e.s, b = e.t;
      let dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = K_SPRING * (d - L);
      const ux = dx / d, uy = dy / d;
      a.ax += ux * f; a.ay += uy * f;
      b.ax -= ux * f; b.ay -= uy * f;
    }
    // gravity to center + integrate
    for (const n of nodes) {
      if (n.pinned) continue;
      n.ax += (W / 2 - n.x) * GRAV;
      n.ay += (H / 2 - n.y) * GRAV;
      n.vx = (n.vx + n.ax) * DAMP;
      n.vy = (n.vy + n.ay) * DAMP;
      n.x = Math.max(PAD, Math.min(W - PAD, n.x + n.vx));
      n.y = Math.max(PAD, Math.min(H - PAD, n.y + n.vy));
    }
    paint();
    AN.ticks++;
    const moving = nodes.some(n => Math.abs(n.vx) + Math.abs(n.vy) > 0.4);
    if ((AN.ticks < 400 && moving) || AN.dragging) AN.raf = requestAnimationFrame(step);
  }
  step();
}

function paint() {
  if (!AN) return;
  for (const { e, line } of AN.edgeEls) {
    line.setAttribute("x1", e.s.x); line.setAttribute("y1", e.s.y);
    line.setAttribute("x2", e.t.x); line.setAttribute("y2", e.t.y);
  }
  for (const { n, grp } of AN.nodeEls) grp.setAttribute("transform", `translate(${n.x},${n.y})`);
}

function enableDrag(grp, node, svg, W, H) {
  grp.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    node.pinned = true; AN.dragging = true;
    grp.setPointerCapture(ev.pointerId);
    const move = (e) => {
      const pt = svgPoint(svg, e, W, H);
      node.x = pt.x; node.y = pt.y; node.vx = 0; node.vy = 0;
      paint();
    };
    const up = () => {
      node.pinned = false; AN.dragging = false;
      grp.removeEventListener("pointermove", move);
      grp.removeEventListener("pointerup", up);
      runSim();
    };
    grp.addEventListener("pointermove", move);
    grp.addEventListener("pointerup", up);
  });
}

function svgPoint(svg, evt, W, H) {
  const r = svg.getBoundingClientRect();
  return { x: (evt.clientX - r.left) / r.width * W, y: (evt.clientY - r.top) / r.height * H };
}

// ---------- Selection + detail panel ----------
function selectNode(id) {
  AN.selected = id;
  const connected = new Set([id]);
  AN.edges.forEach(e => { if (e.a === id) connected.add(e.b); if (e.b === id) connected.add(e.a); });

  AN.nodeEls.forEach(({ n, grp }) => {
    grp.classList.toggle("is-selected", n.id === id);
    grp.classList.toggle("is-dim", !connected.has(n.id));
  });
  AN.edgeEls.forEach(({ e, line }) => {
    const on = e.a === id || e.b === id;
    line.classList.toggle("is-active", on);
    line.classList.toggle("is-dim", !on);
  });
  showNodeDetail(id);
}

function showNodeDetail(id) {
  const g = AN.g;
  const n = AN.byId.get(id);
  const m = skillMeta(g, n.skill);
  const rels = AN.edges.filter(e => e.a === id || e.b === id).map(e => {
    const otherId = e.a === id ? e.b : e.a;
    const other = AN.byId.get(otherId);
    const cfg = EDGE_TYPES[e.type];
    let verb = cfg.label;
    if (e.type === "depends") verb = e.a === id ? "Depends on" : "Required by";
    return `<li class="an-rel" data-goto="${otherId}">
        <span class="an-rel-tag" style="background:${cfg.color}">${verb}</span>
        <span class="an-rel-target">${esc(other.label)}</span>
        <p class="an-rel-note">${esc(e.note)}</p>
      </li>`;
  }).join("");

  document.getElementById("anDetail").innerHTML = `
    <button class="an-detail-back" data-defaultview>← Bundle overview</button>
    <span class="an-src" style="border-color:${m.color};color:${m.color}">${esc(m.label)}</span>
    <h3 class="an-node-title">${esc(n.label)}</h3>
    <p class="an-node-text">${esc(n.text)}</p>
    <a class="an-src-link" href="${m.href}" target="_blank" rel="noopener">Open this skill's repo ↗</a>
    <p class="an-rel-head">${rels ? "This instruction's relationships" : "No modeled relationships."}</p>
    <ul class="an-rel-list">${rels}</ul>`;

  document.querySelectorAll("#anDetail .an-rel").forEach(li =>
    li.addEventListener("click", () => selectNode(li.dataset.goto)));
  const back = document.querySelector("#anDetail [data-defaultview]");
  if (back) back.addEventListener("click", () => {
    const counts = { conflict: 0, overlap: 0, depends: 0, reinforces: 0 };
    g.edges.forEach(e => counts[e.type]++);
    clearSelection();
    showDefaultDetail(g, counts);
  });
}

function clearSelection() {
  AN.selected = null;
  AN.nodeEls.forEach(({ grp }) => grp.classList.remove("is-selected", "is-dim"));
  AN.edgeEls.forEach(({ line }) => line.classList.remove("is-active", "is-dim"));
}

function showDefaultDetail(g, counts) {
  const conflicts = g.edges.filter(e => e.type === "conflict").map(e => {
    const a = g.nodes.find(n => n.id === e.a), b = g.nodes.find(n => n.id === e.b);
    return `<li class="an-conflict" data-goto="${e.a}">
        <strong>${esc(a.label)}</strong> ✕ <strong>${esc(b.label)}</strong>
        <p>${esc(e.note)}</p></li>`;
  }).join("");
  document.getElementById("anDetail").innerHTML = `
    <p class="an-detail-lead">Every node is a real instruction pulled from one of these skills' repos.
      Click any node — or a conflict below — to trace what it collides with.</p>
    <p class="an-rel-head an-rel-head-danger">⚠ ${counts.conflict} conflicts to resolve before bundling</p>
    <ul class="an-conflict-list">${conflicts}</ul>`;
  document.querySelectorAll("#anDetail .an-conflict").forEach(li =>
    li.addEventListener("click", () => selectNode(li.dataset.goto)));
}

if (typeof window !== "undefined") { window.openAnalyzer = openAnalyzer; }
