/* =====================================================================
   shared.js — helpers used by both the landing game and the portfolio:
   - placeholderThumb(project, index): inline SVG when no image is set
   - openProjectModal(project, opts): accessible detail modal
   ===================================================================== */
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Simple line-art glyphs, keyed by project.icon. Drawn in a 100x100 box. */
  const GLYPHS = {
    stapler: '<path d="M18 62h48l10-10H28z"/><path d="M28 52V40h38v12"/><path d="M18 62v10h58V52"/><path d="M40 40l6-12h14l6 12"/>',
    pump: '<rect x="24" y="22" width="52" height="60" rx="8"/><rect x="34" y="32" width="32" height="18" rx="3"/><circle cx="42" cy="64" r="4"/><circle cx="58" cy="64" r="4"/><path d="M50 82v8"/>',
    bone: '<path d="M30 30l40 40"/><circle cx="26" cy="26" r="8"/><circle cx="34" cy="20" r="8"/><circle cx="74" cy="74" r="8"/><circle cx="66" cy="80" r="8"/>',
    rig: '<rect x="20" y="70" width="60" height="10"/><path d="M30 70V30h40v40"/><path d="M30 44h40M30 58h40"/><circle cx="50" cy="37" r="4"/><circle cx="50" cy="51" r="4"/><circle cx="50" cy="65" r="4"/>',
    bracket: '<path d="M26 22v56h48"/><path d="M26 22h20v14H40v28h34"/><circle cx="34" cy="30" r="3"/><circle cx="66" cy="70" r="3"/><path d="M40 36l34 34"/>',
    gear: '<circle cx="50" cy="50" r="14"/><circle cx="50" cy="50" r="6"/><path d="M50 20v10M50 70v10M20 50h10M70 50h10M29 29l7 7M64 64l7 7M71 29l-7 7M36 64l-7 7"/>',
    cad: '<path d="M30 70V40l20-12 20 12v30l-20 12z"/><path d="M30 40l20 12 20-12M50 52v30"/><path d="M20 80h60" stroke-dasharray="4 3"/>',
    chip: '<rect x="30" y="30" width="40" height="40" rx="4"/><rect x="42" y="42" width="16" height="16"/><path d="M40 30V20M50 30V20M60 30V20M40 80V70M50 80V70M60 80V70M30 40H20M30 50H20M30 60H20M80 40H70M80 50H70M80 60H70"/>',
  };
  window.PROJECT_GLYPHS = GLYPHS;

  window.placeholderThumb = function (p, i) {
    const g = GLYPHS[p.icon] || GLYPHS.gear;
    const n = String(i + 1).padStart(2, "0");
    return `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.title)} placeholder">
      <defs><pattern id="pg${i}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" stroke-opacity="0.08"/></pattern></defs>
      <rect width="320" height="180" fill="url(#pg${i})"/>
      <g transform="translate(110 40) scale(1)" fill="none" stroke="currentColor" stroke-opacity="0.75" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${g}</g>
      <text x="14" y="168" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="currentColor" fill-opacity="0.55">PRJ-${n}  ·  ADD IMAGE IN content.js</text>
      <path d="M14 14h40M14 14v40" stroke="currentColor" stroke-opacity="0.35"/><path d="M306 166h-40M306 166v-40" stroke="currentColor" stroke-opacity="0.35"/>
    </svg>`;
  };

  let lastFocus = null;
  window.closeProjectModal = function () {
    const b = document.getElementById("project-modal");
    if (b) b.remove();
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  };
  function onKey(e) {
    if (e.key === "Escape") { e.stopPropagation(); window.closeProjectModal(); }
    if (e.key === "Tab") {
      const f = document.querySelectorAll("#project-modal button, #project-modal a[href]");
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  window.openProjectModal = function (p, opts = {}) {
    window.closeProjectModal();
    lastFocus = document.activeElement;
    const b = document.createElement("div");
    b.className = "modal-backdrop";
    b.id = "project-modal";
    const links = (p.links || []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("");
    const portfolioLink = opts.inPortfolio ? "" :
      `<a class="btn btn-primary" href="portfolio.html#project-${esc(p.id)}">View in portfolio →</a>`;
    b.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="pm-title" tabindex="-1">
        <div class="modal-head">
          <div>
            <div class="mono">${esc(p.role)} · ${esc(p.period)}</div>
            <h3 id="pm-title">${esc(p.title)}</h3>
          </div>
          <button class="close" type="button" aria-label="Close">×</button>
        </div>
        <p style="color:var(--ink-2)">${esc(p.summary)}</p>
        <dl>
          ${p.problem ? `<dt>Problem</dt><dd>${esc(p.problem)}</dd>` : ""}
          ${p.approach ? `<dt>Approach</dt><dd>${esc(p.approach)}</dd>` : ""}
          ${p.result ? `<dt>Result</dt><dd>${esc(p.result)}</dd>` : ""}
        </dl>
        <div class="tags">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="actions">${portfolioLink}${links}<button class="btn" type="button" data-close>Close</button></div>
      </div>`;
    b.addEventListener("click", (e) => { if (e.target === b || e.target.closest("[data-close], .close")) window.closeProjectModal(); });
    document.body.appendChild(b);
    document.addEventListener("keydown", onKey);
    // Focus the dialog itself (not the close button) so the key that opened it cannot also activate Close.
    setTimeout(() => b.querySelector(".modal").focus(), 0);
  };
})();
