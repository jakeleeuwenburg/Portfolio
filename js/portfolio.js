/* =====================================================================
   portfolio.js — renders portfolio.html from window.CONTENT
   ===================================================================== */
(function () {
  const C = window.CONTENT;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Theme toggle (persisted) ---------- */
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.setAttribute("data-theme", t); } catch (e) {}
  $("#theme-toggle").addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#nav-toggle"), navLinks = $("#nav-links");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });

  /* ---------- Hero ---------- */
  document.title = `${C.name} — ${C.title}`;
  $("#brand-name").textContent = C.name;
  $("#hero-name").textContent = C.name;
  $("#hero-title").textContent = C.title;
  $("#hero-subtitle").textContent = C.subtitle;
  $("#hero-tagline").textContent = C.tagline;
  $("#hero-bio").textContent = C.bio;
  $("#hero-location").textContent = C.location;
  $("#hero-focus").textContent = C.subtitle;
  const edu = C.education && C.education[0];
  $("#hero-edu").textContent = edu ? `${edu.degree}, ${edu.school}` : "";
  document.querySelectorAll("[data-resume]").forEach((a) => (a.href = C.resumeUrl));
  $("#resume-iframe").src = C.resumeUrl + "#view=FitH";

  /* ---------- Projects ---------- */
  const grid = $("#projects-grid");
  C.projects.forEach((p, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project";
    card.id = `project-${p.id}`;
    card.setAttribute("aria-haspopup", "dialog");
    card.innerHTML = `
      <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : window.placeholderThumb(p, i)}</div>
      <div class="body">
        <div class="meta mono"><span>${esc(p.role)}</span><span>${esc(p.period)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p class="blurb">${esc(p.blurb)}</p>
        <div class="tags">${(p.tags || []).slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <span class="more">View details →</span>
      </div>`;
    card.addEventListener("click", () => window.openProjectModal(p, { inPortfolio: true }));
    grid.appendChild(card);
  });

  /* ---------- Skills ---------- */
  const sg = $("#skills-grid");
  C.skills.forEach((g) => {
    const d = document.createElement("div");
    d.className = "skill-group";
    d.innerHTML = `<h3>${esc(g.group)}</h3><ul>${g.items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
    sg.appendChild(d);
  });

  /* ---------- Experience / Education / Extras ---------- */
  const tl = $("#experience-list");
  C.experience.forEach((x) => {
    const d = document.createElement("div");
    d.className = "tl-item";
    d.innerHTML = `
      <div class="top"><h3>${esc(x.role)}</h3><span class="mono">${esc(x.period)}</span></div>
      <div class="org">${esc(x.company)}${x.location ? ` · ${esc(x.location)}` : ""}</div>
      <ul>${(x.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
    tl.appendChild(d);
  });
  const el = $("#education-list");
  C.education.forEach((x) => {
    const d = document.createElement("div");
    d.className = "tl-item";
    d.innerHTML = `
      <div class="top"><h3>${esc(x.degree)}</h3><span class="mono">${esc(x.period)}</span></div>
      <div class="org">${esc(x.school)}</div>
      ${x.details ? `<ul><li>${esc(x.details)}</li></ul>` : ""}`;
    el.appendChild(d);
  });
  if (C.extras && C.extras.length) {
    $("#extras-wrap").hidden = false;
    $("#extras-list").innerHTML = C.extras.map((x) => `<li>${esc(x)}</li>`).join("");
  }

  /* ---------- Contact ---------- */
  const cg = $("#contact-grid");
  const icons = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 8.5v11h-3v-11h3ZM5 3.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5ZM20.5 13.2v6.3h-3v-5.7c0-1.5-.6-2.4-1.9-2.4-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1v5.7h-3v-11h3v1.5c.5-.8 1.4-1.8 3.3-1.8 2.4 0 3.7 1.6 3.7 5Z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  };
  const cards = [];
  const k = C.contact || {};
  if (k.email) cards.push({ href: `mailto:${k.email}`, ic: icons.mail, lbl: "Email", val: k.email });
  if (k.linkedin) cards.push({ href: k.linkedin, ic: icons.linkedin, lbl: "LinkedIn", val: k.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, ""), ext: true });
  if (k.github) cards.push({ href: k.github, ic: icons.github, lbl: "GitHub", val: k.github.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, ""), ext: true });
  if (k.phone) cards.push({ href: `tel:${k.phone.replace(/[^+\d]/g, "")}`, ic: icons.phone, lbl: "Phone", val: k.phone });
  if (C.location) cards.push({ href: null, ic: icons.pin, lbl: "Location", val: C.location });
  cards.forEach((c) => {
    const a = document.createElement(c.href ? "a" : "div");
    a.className = "contact-card";
    if (c.href) { a.href = c.href; if (c.ext) { a.target = "_blank"; a.rel = "noopener"; } }
    a.innerHTML = `<span class="ic">${c.ic}</span><span><span class="lbl">${esc(c.lbl)}</span><span class="val">${esc(c.val)}</span></span>`;
    cg.appendChild(a);
  });
  $("#footer-name").textContent = C.name;

  /* ---------- Deep link from the game: #project-<id> ---------- */
  function handleHash() {
    const m = location.hash.match(/^#project-(.+)$/);
    if (!m) return;
    const card = document.getElementById(`project-${m[1]}`);
    if (!card) return;
    card.scrollIntoView({ block: "center" });
    card.classList.add("flash");
    setTimeout(() => card.classList.remove("flash"), 1500);
  }
  window.addEventListener("hashchange", handleHash);
  setTimeout(handleHash, 50);
})();
