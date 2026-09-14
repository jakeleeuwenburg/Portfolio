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
    catheter: '<path d="M6 50h32"/><path d="M38 50c0-8 8-11 20-11s20 3 20 11-8 11-20 11-20-3-20-11z"/><path d="M78 50h10"/><path d="M42 30a24 24 0 0 1 32 0"/><path d="M42 70a24 24 0 0 0 32 0"/><path d="M36 20a34 34 0 0 1 44 0"/><path d="M36 80a34 34 0 0 0 44 0"/>',
    hammer: '<path d="M34 62a16 16 0 1 0 32 0C66 50 58 30 50 30S34 50 34 62z"/><circle cx="50" cy="62" r="4"/><rect x="38" y="22" width="24" height="6" rx="1"/><path d="M50 22V6"/><path d="M40 12h20"/><path d="M24 77A30 30 0 0 1 35 36"/><path d="M32.3 43.3L35 36L27.3 34.7"/>',
    wave: '<path d="M12 50c8-30 16-30 24 0s16 30 24 0 16-30 24 0"/><path d="M12 76h76" stroke-dasharray="4 4"/><path d="M12 24h76" stroke-dasharray="4 4"/>',
    chart: '<path d="M18 82h66"/><path d="M18 82V22"/><rect x="28" y="52" width="10" height="30"/><rect x="46" y="38" width="10" height="44"/><rect x="64" y="58" width="10" height="24"/><path d="M28 34l18-8 18 12 16-18"/>',
    fixture: '<rect x="14" y="36" width="72" height="52" rx="4"/><path d="M18 76C26 46 36 46 44 66S60 86 66 66 78 46 82 76"/><circle cx="30" cy="54" r="4"/><circle cx="55" cy="74" r="4"/><circle cx="73" cy="54" r="4"/><path d="M36 26c-4-5 4-7 0-12M50 26c-4-5 4-7 0-12M64 26c-4-5 4-7 0-12"/>',
    beat: '<path d="M10 52h14l8-22 12 44 10-30 8 14 6-6h22"/><path d="M78 26a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke-dasharray="3 3"/>',
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
    if (activeViewer) { try { activeViewer.dispose(); } catch (e) {} activeViewer = null; }
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

  /* ---------- Media: 3D STEP viewer and/or screenshot gallery ---------- */
  let activeViewer = null;
  function normImages(p) {
    return (p.images || []).map((x) => (typeof x === "string" ? { src: x, caption: "" } : x)).filter((x) => x && x.src);
  }
  function buildMedia(p, modalEl) {
    const images = normImages(p);
    const hasModel = !!p.model, hasImages = images.length > 0;
    if (!hasModel && !hasImages) return;
    const wrap = modalEl.querySelector(".modal-media");
    const tabs = hasModel && hasImages;
    wrap.innerHTML = `
      ${tabs ? `<div class="media-tabs" role="tablist">
        <button type="button" role="tab" aria-selected="true" data-tab="model">3D model</button>
        <button type="button" role="tab" aria-selected="false" data-tab="images">Screenshots</button>
      </div>` : ""}
      ${hasModel ? `<div class="media-pane" data-pane="model">
        <div class="viewer3d" aria-label="Interactive 3D model of ${esc(p.title)}">
          <div class="viewer-status"><span class="spinner"></span><span class="txt">Loading 3D model…</span></div>
        </div>
        <div class="viewer-bar">
          <span class="mono">Drag to rotate · scroll or pinch to zoom · right-drag to pan</span>
          <span class="viewer-btns">
            <button type="button" class="btn btn-ghost" data-act="spin">Pause spin</button>
            <button type="button" class="btn btn-ghost" data-act="reset">Reset view</button>
            <a class="btn btn-ghost" href="${esc(p.model)}" download>Download STEP</a>
          </span>
        </div>
      </div>` : ""}
      ${hasImages ? `<div class="media-pane" data-pane="images" ${tabs ? "hidden" : ""}>
        <figure class="gallery">
          <div class="gallery-main">
            <button type="button" class="gnav prev" aria-label="Previous screenshot" ${images.length > 1 ? "" : "hidden"}>‹</button>
            <img src="${esc(images[0].src)}" alt="${esc(images[0].caption || p.title)}">
            <button type="button" class="gnav next" aria-label="Next screenshot" ${images.length > 1 ? "" : "hidden"}>›</button>
          </div>
          <figcaption>${esc(images[0].caption || "")}</figcaption>
          ${images.length > 1 ? `<div class="gallery-thumbs">${images.map((im, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "on" : ""}" aria-label="Screenshot ${i + 1}"><img src="${esc(im.src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
        </figure>
      </div>` : ""}`;

    // Gallery behaviour
    if (hasImages) {
      let idx = 0;
      const main = wrap.querySelector(".gallery-main img"), cap = wrap.querySelector("figcaption");
      const show = (i) => {
        idx = (i + images.length) % images.length;
        main.src = images[idx].src; main.alt = images[idx].caption || p.title; cap.textContent = images[idx].caption || "";
        wrap.querySelectorAll(".gallery-thumbs button").forEach((t, j) => t.classList.toggle("on", j === idx));
      };
      wrap.querySelector(".gnav.prev")?.addEventListener("click", () => show(idx - 1));
      wrap.querySelector(".gnav.next")?.addEventListener("click", () => show(idx + 1));
      wrap.querySelectorAll(".gallery-thumbs button").forEach((t) => t.addEventListener("click", () => show(+t.dataset.i)));
      main.addEventListener("click", () => { if (images.length > 1) show(idx + 1); });
    }

    // Tabs
    if (tabs) {
      wrap.querySelectorAll("[role=tab]").forEach((t) => t.addEventListener("click", () => {
        wrap.querySelectorAll("[role=tab]").forEach((x) => x.setAttribute("aria-selected", String(x === t)));
        wrap.querySelectorAll(".media-pane").forEach((pn) => (pn.hidden = pn.dataset.pane !== t.dataset.tab));
      }));
    }

    // 3D viewer (lazy-loaded module)
    if (hasModel) {
      const host = wrap.querySelector(".viewer3d"), status = wrap.querySelector(".viewer-status"), txt = status.querySelector(".txt");
      const onStatus = (s) => { txt.textContent = s; status.hidden = !s; };
      const fail = (msg) => { status.hidden = false; status.querySelector(".spinner").hidden = true; txt.textContent = msg; };
      if (!window.WebGLRenderingContext) return fail("This browser can't show 3D models. Use the Download STEP button instead.");
      import("./viewer.js").then((v) => v.mountStepViewer(host, p.model, { onStatus })).then((h) => {
        activeViewer = h;
        wrap.querySelector("[data-act=reset]").addEventListener("click", () => h.resetView());
        const spinBtn = wrap.querySelector("[data-act=spin]");
        spinBtn.addEventListener("click", () => { spinBtn.textContent = h.toggleSpin() ? "Pause spin" : "Auto spin"; });
        host.addEventListener("pointerdown", () => { spinBtn.textContent = "Auto spin"; }, { once: true });
      }).catch((err) => { console.error(err); fail("Couldn't load the 3D model. " + (err && err.message ? err.message : "")); });
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
    const hasMedia = !!p.model || (p.images && p.images.length);
    b.innerHTML = `
      <div class="modal ${hasMedia ? "modal-wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="pm-title" tabindex="-1">
        <div class="modal-head">
          <div>
            <div class="mono">${esc(p.role)} · ${esc(p.period)}</div>
            <h3 id="pm-title">${esc(p.title)}</h3>
          </div>
          <button class="close" type="button" aria-label="Close">×</button>
        </div>
        <div class="modal-media"></div>
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
    buildMedia(p, b);
    document.addEventListener("keydown", onKey);
    // Focus the dialog itself (not the close button) so the key that opened it cannot also activate Close.
    setTimeout(() => b.querySelector(".modal").focus(), 0);
  };
})();
