/* =====================================================================
   intros/sidescroller.js — 2D side-scroller intro.

   Contract (see intro-config.js):
     window.Intro = { start(container, content, onFinish), stop() }

   Run right, jump the project crates, enter the portal → onFinish().
   Everything is drawn procedurally on a <canvas>; no image assets.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------- Tunables (world units ≈ px at 1× scale) ---------------- */
  const WORLD_H = 540;            // reference world height
  const RUN_SPEED = 270;          // px/s
  const ACCEL = 2200;             // px/s²
  const GRAVITY = 1900;
  const JUMP_V = 640;
  const JUMP_HOLD_GRAVITY = 0.5;  // gravity multiplier while jump is held and rising
  const COYOTE = 0.09;            // s
  const JUMP_BUFFER = 0.12;       // s
  const OBSTACLE_GAP = 760;       // px between project crates
  const START_X = 620;            // first crate x
  const CARD_RANGE = 210;         // px from crate center to show the card
  const PLAYER_W = 22, PLAYER_H = 62;

  /* ---------------- State ---------------- */
  let root, C, onFinish, canvas, ctx, hud, raf = 0, running = false;
  let cssW = 0, cssH = 0, dpr = 1, scale = 1, viewW = 0, viewH = 0, groundY = 0;
  let theme = {};
  let glyphs = {};
  let world, player, cam, input, clock, ui, isTouch, reduceMotion;

  /* ---------------- Utilities ---------------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    theme = {
      bg: v("--bg-sunk"), elev: v("--bg-elev"), ink: v("--ink"), ink2: v("--ink-2"), ink3: v("--ink-3"),
      line: v("--line"), accent: v("--accent"), accentInk: v("--accent-ink"), accentSoft: v("--accent-soft"),
      warn: v("--warn"),
      dark: matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.getAttribute("data-theme") !== "light"
        || document.documentElement.getAttribute("data-theme") === "dark",
    };
    buildGlyphs();
  }

  function buildGlyphs() {
    const G = window.PROJECT_GLYPHS || {};
    glyphs = {};
    Object.keys(G).forEach((k) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="${theme.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${G[k]}</g></svg>`;
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      glyphs[k] = img;
    });
  }

  /* ---------------- Sizing ---------------- */
  function resize() {
    const r = root.getBoundingClientRect();
    cssW = Math.max(1, Math.floor(r.width));
    cssH = Math.max(1, Math.floor(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    // World scale: fit height, but never let the view get too narrow on portrait phones.
    scale = clamp(Math.min(cssH / WORLD_H, cssW / 620), 0.8, 2.2);
    viewW = cssW / scale;
    viewH = cssH / scale;
    // Ground sits above the touch controls on phones.
    const bottomPad = isTouch ? Math.max(150, cssH * 0.26) : cssH * 0.22;
    groundY = (cssH - bottomPad) / scale;
  }

  /* ---------------- World generation from content ---------------- */
  function buildWorld() {
    const projects = C.projects || [];
    const obstacles = projects.map((p, i) => {
      const h = 60 + (i % 3) * 8;
      const w = 84;
      return { p, i, x: START_X + i * OBSTACLE_GAP, w, h, seen: false };
    });
    // Background billboards: skills groups + education, placed midway between crates
    const boards = [];
    const skillGroups = (C.skills || []).map((g) => ({ head: g.group, lines: g.items.slice(0, 3) }));
    const eduBoards = (C.education || []).map((e) => ({ head: "Education", lines: [e.degree, e.school] }));
    const pool = [...skillGroups, ...eduBoards];
    for (let i = 0; i < obstacles.length - 1 && pool.length; i++) {
      const b = pool.shift();
      boards.push({ x: obstacles[i].x + OBSTACLE_GAP * 0.62, ...b });
    }
    const last = obstacles.length ? obstacles[obstacles.length - 1].x : START_X;
    const portalX = last + OBSTACLE_GAP * 0.9;
    world = { obstacles, boards, portalX, endX: portalX + 140, particles: [], t: 0 };
  }

  function reset() {
    player = { x: 120, y: 0, vx: 0, vy: 0, onGround: true, facing: 1, phase: 0, coyote: 0, buffer: 0, jumping: false, state: "idle" };
    player.y = groundY - PLAYER_H;
    cam = { x: 0 };
    input = { left: false, right: false, jump: false, jumpPressed: false, interact: false };
    clock = { last: 0, acc: 0 };
    ui = { card: null, nearest: null, finishing: 0, done: false, started: false };
  }

  /* ---------------- HUD (DOM) ---------------- */
  function buildHud() {
    hud = document.createElement("div");
    hud.className = "hud";
    hud.innerHTML = `
      <div class="hud-progress" aria-hidden="true"><i></i></div>
      <div class="hud-progress-label" aria-hidden="true">Distance to portal</div>
      <div class="hud-card" role="status" aria-live="polite"></div>
      <div class="touch-controls" aria-label="Touch controls">
        <div class="pad">
          <button class="touch-btn" data-k="left" aria-label="Move left">◀</button>
          <button class="touch-btn" data-k="right" aria-label="Move right">▶</button>
        </div>
        <button class="touch-btn jump" data-k="jump" aria-label="Jump">JUMP</button>
      </div>
      <div class="hud-msg" id="start-msg">
        <div class="box">
          <div class="mono">${esc(C.title || "")}</div>
          <h1>${esc(C.name || "Welcome")}</h1>
          <p class="sub">${esc(C.subtitle || "")}</p>
          <p style="color:var(--ink-2);margin:0">Run right, jump the crates, and enter the portal to reach my portfolio. Each crate is a project — get close to read about it.</p>
          <div class="keys">
            ${isTouch
              ? `<span>Use the on-screen buttons · tap the screen to jump</span>`
              : `<span><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> move</span><span><kbd>Space</kbd> / <kbd>↑</kbd> jump</span><span><kbd>Enter</kbd> project details</span><span><kbd>Esc</kbd> skip</span>`}
          </div>
          <div class="actions">
            <button class="btn btn-primary" id="start-btn" type="button">${isTouch ? "Tap to start" : "Start (any key)"}</button>
            <a class="btn" href="portfolio.html">Skip to portfolio →</a>
          </div>
        </div>
      </div>`;
    root.appendChild(hud);

    hud.querySelector("#start-btn").addEventListener("click", startGame);
    const card = hud.querySelector(".hud-card");
    card.addEventListener("click", (e) => { if (e.target.closest("button") && ui.nearest) openDetails(ui.nearest.p); });

    // Touch buttons
    hud.querySelectorAll(".touch-btn").forEach((b) => {
      const k = b.dataset.k;
      const down = (e) => { e.preventDefault(); b.classList.add("down"); if (!ui.started) startGame(); setKey(k, true); };
      const up = (e) => { e.preventDefault(); b.classList.remove("down"); setKey(k, false); };
      b.addEventListener("pointerdown", down);
      b.addEventListener("pointerup", up);
      b.addEventListener("pointercancel", up);
      b.addEventListener("pointerleave", up);
      b.addEventListener("contextmenu", (e) => e.preventDefault());
    });
  }

  function setKey(k, v) {
    if (k === "jump") { if (v && !input.jump) input.jumpPressed = true; input.jump = v; }
    else input[k] = v;
  }

  function startGame() {
    if (ui.started) return;
    ui.started = true;
    hud.querySelector("#start-msg").classList.add("hide");
    document.body.classList.add("no-select");
  }

  function showCard(o) {
    const card = hud.querySelector(".hud-card");
    if (ui.card === o) return;
    ui.card = o;
    if (!o) { card.classList.remove("show"); return; }
    const g = (window.PROJECT_GLYPHS || {})[o.p.icon] || (window.PROJECT_GLYPHS || {}).gear || "";
    card.innerHTML = `
      <div class="ic"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${g}</svg></div>
      <div class="txt">
        <h4>${esc(o.p.title)}</h4>
        <p>${esc(o.p.blurb)}</p>
        <div class="hint">${isTouch ? "Tap details for more" : "Press Enter for details"}</div>
      </div>
      <button class="btn" type="button">Details</button>`;
    card.classList.add("show");
  }

  function openDetails(p) {
    input.left = input.right = input.jump = false;
    window.openProjectModal(p, { inPortfolio: false });
  }

  /* ---------------- Input ---------------- */
  function onKeyDown(e) {
    if (document.getElementById("project-modal")) return;
    const k = e.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d", "w", "A", "D", "W", "Enter", "e", "E"].includes(k)) {
      if (!ui.started && k !== "Enter") { startGame(); }
      e.preventDefault();
    } else if (!ui.started && k !== "Escape" && k !== "Tab") { startGame(); }
    if (k === "ArrowLeft" || k === "a" || k === "A") input.left = true;
    if (k === "ArrowRight" || k === "d" || k === "D") input.right = true;
    if (k === "ArrowUp" || k === " " || k === "w" || k === "W") setKey("jump", true);
    if ((k === "Enter" || k === "e" || k === "E") && ui.started && ui.nearest) openDetails(ui.nearest.p);
    if (k === "Enter" && !ui.started) startGame();
  }
  function onKeyUp(e) {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") input.left = false;
    if (k === "ArrowRight" || k === "d" || k === "D") input.right = false;
    if (k === "ArrowUp" || k === " " || k === "w" || k === "W") setKey("jump", false);
  }
  function onCanvasPointer(e) {
    // On touch devices a tap anywhere on the canvas jumps (buttons handle movement).
    if (!isTouch) return;
    if (!ui.started) { startGame(); return; }
    if (e.type === "pointerdown") setKey("jump", true);
    else setKey("jump", false);
  }
  function onBlur() { input.left = input.right = input.jump = false; }

  /* ---------------- Simulation ---------------- */
  function step(dt) {
    world.t += dt;
    if (document.getElementById("project-modal")) return;   // paused while modal is open
    if (ui.finishing) { ui.finishing += dt; if (ui.finishing > 0.75 && !ui.done) { ui.done = true; onFinish(); } return; }
    if (!ui.started) return;

    // Horizontal
    const want = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const target = want * RUN_SPEED;
    const dv = ACCEL * dt;
    player.vx = player.vx < target ? Math.min(target, player.vx + dv) : Math.max(target, player.vx - dv);
    if (want) player.facing = want;

    // Jump: buffer + coyote + variable height
    player.buffer = input.jumpPressed ? JUMP_BUFFER : Math.max(0, player.buffer - dt);
    input.jumpPressed = false;
    player.coyote = player.onGround ? COYOTE : Math.max(0, player.coyote - dt);
    if (player.buffer > 0 && player.coyote > 0) {
      player.vy = -JUMP_V; player.onGround = false; player.coyote = 0; player.buffer = 0; player.jumping = true;
      spawnDust(player.x + PLAYER_W / 2, player.y + PLAYER_H, 6);
    }
    const g = (player.jumping && input.jump && player.vy < 0) ? GRAVITY * JUMP_HOLD_GRAVITY : GRAVITY;
    player.vy += g * dt;
    if (player.vy > 0) player.jumping = false;

    // Integrate + collide (X then Y)
    const wasOnGround = player.onGround;
    player.x += player.vx * dt;
    player.x = clamp(player.x, 0, world.endX - PLAYER_W);
    for (const o of world.obstacles) {
      const top = groundY - o.h;
      if (overlaps(player.x, player.y, PLAYER_W, PLAYER_H, o.x, top, o.w, o.h)) {
        if (player.vx > 0) player.x = o.x - PLAYER_W - 0.01; else if (player.vx < 0) player.x = o.x + o.w + 0.01;
        player.vx = 0;
      }
    }
    player.y += player.vy * dt;
    player.onGround = false;
    if (player.y + PLAYER_H >= groundY) { player.y = groundY - PLAYER_H; player.vy = 0; player.onGround = true; }
    for (const o of world.obstacles) {
      const top = groundY - o.h;
      if (overlaps(player.x, player.y, PLAYER_W, PLAYER_H, o.x, top, o.w, o.h)) {
        if (player.vy > 0 && player.y + PLAYER_H - player.vy * dt <= top + 1) { player.y = top - PLAYER_H; player.vy = 0; player.onGround = true; }
        else if (player.vy < 0) { player.y = top + o.h + 0.01; player.vy = 0; }
      }
    }
    if (player.onGround && !wasOnGround) spawnDust(player.x + PLAYER_W / 2, player.y + PLAYER_H, 8);

    // Animation phase
    const speed = Math.abs(player.vx);
    player.phase += (speed / RUN_SPEED) * dt * 11;
    player.state = !player.onGround ? "jump" : speed > 20 ? "run" : "idle";

    // Nearest obstacle → card
    const cx = player.x + PLAYER_W / 2;
    let nearest = null, best = CARD_RANGE;
    for (const o of world.obstacles) {
      const d = Math.abs(cx - (o.x + o.w / 2));
      if (d < best) { best = d; nearest = o; }
    }
    ui.nearest = nearest;
    showCard(nearest);

    // Portal
    // Portal: any part of the figure crossing the ring's centre line triggers the exit
    if (Math.abs(cx - world.portalX) < 30 && player.y + PLAYER_H > groundY - 140) { ui.finishing = 0.0001; showCard(null); }

    // Camera
    const targetCam = clamp(player.x - viewW * 0.38, 0, Math.max(0, world.endX - viewW));
    cam.x = lerp(cam.x, targetCam, 1 - Math.pow(0.001, dt));

    // Particles
    for (let i = world.particles.length - 1; i >= 0; i--) {
      const q = world.particles[i];
      q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 600 * dt;
      if (q.life <= 0) world.particles.splice(i, 1);
    }
    // Progress bar
    const prog = clamp(cx / world.portalX, 0, 1);
    hud.querySelector(".hud-progress i").style.width = (prog * 100).toFixed(1) + "%";
  }

  function overlaps(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }
  function spawnDust(x, y, n) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) world.particles.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 120, life: 0.35 + Math.random() * 0.25, r: 2 + Math.random() * 2, c: "dust" });
  }

  /* ---------------- Rendering ---------------- */
  function render() {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, viewW, viewH);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, theme.bg); sky.addColorStop(1, theme.elev);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, viewW, viewH);

    drawFarGrid();
    drawMidLayer();
    drawGround();
    drawStartSign();
    drawBoards();
    drawObstacles();
    drawPortal();
    drawParticles();
    drawPlayer();
  }

  function drawFarGrid() {
    const off = (cam.x * 0.15) % 48;
    ctx.strokeStyle = theme.line; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -off; x < viewW + 48; x += 48) { ctx.moveTo(x, 0); ctx.lineTo(x, groundY); }
    for (let y = 0; y < groundY; y += 48) { ctx.moveTo(0, y); ctx.lineTo(viewW, y); }
    ctx.stroke(); ctx.globalAlpha = 1;
  }

  function drawMidLayer() {
    // Skyline of silhouettes: buildings + a few "mechanical" shapes, parallax 0.4
    const f = 0.4, span = 1400, off = cam.x * f;
    ctx.fillStyle = theme.ink; ctx.globalAlpha = theme.dark ? 0.10 : 0.07;
    const base = groundY;
    const startI = Math.floor(off / span) - 1;
    for (let i = startI; i <= startI + Math.ceil(viewW / span) + 2; i++) {
      const bx = i * span - off;
      // deterministic pseudo-random skyline per tile
      let seed = (i * 9301 + 49297) % 233280;
      const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      let x = bx;
      while (x < bx + span) {
        const w = 60 + rnd() * 140, h = 60 + rnd() * 200;
        ctx.fillRect(x, base - h, w, h);
        if (rnd() > 0.6) ctx.fillRect(x + w * 0.3, base - h - 20, w * 0.15, 20);
        x += w + 20 + rnd() * 60;
      }
    }
    ctx.globalAlpha = 1;
    // Far horizon line (dimension line motif)
    ctx.strokeStyle = theme.ink3; ctx.globalAlpha = 0.35; ctx.setLineDash([12, 8]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY - 4); ctx.lineTo(viewW, groundY - 4); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }

  function drawGround() {
    ctx.fillStyle = theme.elev; ctx.fillRect(0, groundY, viewW, viewH - groundY);
    ctx.strokeStyle = theme.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(viewW, groundY); ctx.stroke();
    // hatch marks
    ctx.strokeStyle = theme.line; ctx.lineWidth = 1;
    const off = cam.x % 24;
    ctx.beginPath();
    for (let x = -off; x < viewW + 24; x += 24) { ctx.moveTo(x, groundY + 2); ctx.lineTo(x - 10, groundY + 14); }
    ctx.stroke();
    // ruler ticks with distance labels every 200 px
    ctx.fillStyle = theme.ink3; ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
    const tOff = cam.x % 200, first = cam.x - tOff;
    for (let x = -tOff, wx = first; x < viewW + 200; x += 200, wx += 200) {
      ctx.fillRect(x, groundY + 22, 1, 8);
      ctx.globalAlpha = 0.7; ctx.fillText((wx / 100).toFixed(1) + " m", x, groundY + 42); ctx.globalAlpha = 1;
    }
  }

  function drawStartSign() {
    const x = 40 - cam.x;
    if (x < -420) return;
    // banner
    ctx.fillStyle = theme.elev; ctx.strokeStyle = theme.ink; ctx.lineWidth = 2;
    roundRect(x, groundY - 200, 300, 74, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = theme.ink; ctx.textAlign = "left";
    ctx.font = "700 20px Inter, system-ui, sans-serif"; ctx.fillText(C.name || "", x + 16, groundY - 168);
    ctx.fillStyle = theme.ink2; ctx.font = "13px Inter, system-ui, sans-serif"; ctx.fillText(C.title || "", x + 16, groundY - 146);
    // posts
    ctx.fillStyle = theme.ink; ctx.fillRect(x + 30, groundY - 126, 4, 126); ctx.fillRect(x + 266, groundY - 126, 4, 126);
    // arrow hint
    ctx.fillStyle = theme.accent; ctx.font = "600 13px Inter, system-ui, sans-serif";
    ctx.fillText("this way →", x + 320, groundY - 24);
  }

  function drawBoards() {
    for (const b of world.boards) {
      const x = b.x - cam.x - 90;
      if (x < -240 || x > viewW + 20) continue;
      const y = groundY - 150, w = 180, h = 92;
      ctx.fillStyle = theme.ink; ctx.globalAlpha = 0.9; ctx.fillRect(x + w / 2 - 3, y + h, 6, groundY - y - h); ctx.globalAlpha = 1;
      ctx.fillStyle = theme.elev; ctx.strokeStyle = theme.line; ctx.lineWidth = 1.5;
      roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = theme.accentInk; ctx.font = "700 10px ui-monospace, Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText(String(b.head).toUpperCase(), x + 12, y + 20);
      ctx.fillStyle = theme.ink2; ctx.font = "12px Inter, system-ui, sans-serif";
      b.lines.forEach((l, i) => ctx.fillText(truncate(l, 26), x + 12, y + 40 + i * 17));
    }
  }

  function drawObstacles() {
    for (const o of world.obstacles) {
      const x = o.x - cam.x, top = groundY - o.h;
      if (x < -300 || x > viewW + 100) continue;
      const near = ui.nearest === o;
      // crate
      ctx.fillStyle = theme.elev; ctx.strokeStyle = near ? theme.accent : theme.ink; ctx.lineWidth = near ? 3 : 2;
      roundRect(x, top, o.w, o.h, 6); ctx.fill(); ctx.stroke();
      // corner rivets
      ctx.fillStyle = theme.ink3;
      [[6, 6], [o.w - 6, 6], [6, o.h - 6], [o.w - 6, o.h - 6]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(x + dx, top + dy, 1.8, 0, Math.PI * 2); ctx.fill(); });
      // glyph
      const img = glyphs[o.p.icon] || glyphs.gear;
      if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x + o.w / 2 - o.h * 0.38, top + o.h * 0.12, o.h * 0.76, o.h * 0.76);
      // index tag
      ctx.fillStyle = theme.accent; ctx.font = "700 9px ui-monospace, Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("PRJ-" + String(o.i + 1).padStart(2, "0"), x + 8, top + o.h - 6);
      // signpost with title
      const sx = x + o.w + 22, sy = top - 62;
      ctx.fillStyle = theme.ink; ctx.fillRect(sx + 10, sy + 30, 3, groundY - sy - 30);
      ctx.font = "600 12px Inter, system-ui, sans-serif";
      const label = truncate(o.p.title, 30);
      const tw = ctx.measureText(label).width + 20;
      ctx.fillStyle = near ? theme.accent : theme.elev; ctx.strokeStyle = near ? theme.accent : theme.line; ctx.lineWidth = 1.5;
      roundRect(sx, sy, tw, 30, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = near ? "#fff" : theme.ink; ctx.fillText(label, sx + 10, sy + 19);
    }
  }

  function drawPortal() {
    const x = world.portalX - cam.x, y = groundY - 78, r = 58;
    if (x < -200 || x > viewW + 200) return;
    const t = world.t;
    // glow
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.6);
    g.addColorStop(0, theme.accentSoft); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
    // rings
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i === 1 ? theme.accentInk : theme.accent; ctx.lineWidth = 4 - i; ctx.globalAlpha = 0.9 - i * 0.25;
      ctx.beginPath();
      const rr = r - i * 12, a0 = t * (1.2 + i * 0.5) * (i % 2 ? -1 : 1);
      ctx.arc(x, y, rr, a0, a0 + Math.PI * 1.4); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // core
    ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.18 + 0.08 * Math.sin(t * 3);
    ctx.beginPath(); ctx.arc(x, y, r - 30, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    // orbiting particles
    if (!reduceMotion) for (let i = 0; i < 10; i++) {
      const a = t * 1.5 + i * (Math.PI * 2 / 10), rr = r + 8 + Math.sin(t * 2 + i) * 8;
      ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // frame
    ctx.strokeStyle = theme.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - r - 14, groundY); ctx.lineTo(x - r - 14, y); ctx.arc(x, y, r + 14, Math.PI, 0); ctx.lineTo(x + r + 14, groundY); ctx.stroke();
    ctx.fillStyle = theme.ink; ctx.font = "700 12px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("PORTFOLIO", x, y - r - 24);
  }

  function drawParticles() {
    ctx.fillStyle = theme.ink3;
    for (const q of world.particles) { ctx.globalAlpha = clamp(q.life / 0.4, 0, 1) * 0.7; ctx.beginPath(); ctx.arc(q.x - cam.x, q.y, q.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    const px = player.x - cam.x + PLAYER_W / 2, py = player.y;   // top-center of bounding box
    ctx.save();
    if (ui.finishing) {
      // shrink & spin into the portal
      const k = clamp(ui.finishing / 0.7, 0, 1);
      const portalX = world.portalX - cam.x, portalY = groundY - 78;
      const cx = lerp(px, portalX, k), cy = lerp(py + PLAYER_H / 2, portalY, k);
      ctx.translate(cx, cy); ctx.rotate(k * Math.PI * 3); ctx.scale(1 - k, 1 - k); ctx.globalAlpha = 1 - k * 0.8;
      ctx.translate(-px, -(py + PLAYER_H / 2));
    }
    // shadow
    ctx.fillStyle = theme.ink; ctx.globalAlpha = 0.12 * (player.onGround ? 1 : 0.5);
    ctx.beginPath(); ctx.ellipse(px, groundY + 3, 16, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = ui.finishing ? ctx.globalAlpha : 1;
    if (!ui.finishing) ctx.globalAlpha = 1;

    ctx.strokeStyle = theme.ink; ctx.lineWidth = 3.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    const f = player.facing, ph = player.phase;
    const headR = 8.5, headY = py + headR + 1, neckY = headY + headR, hipY = py + 36, footY = py + PLAYER_H;
    let lean = 0, la, lb, ra, rb, ll, lr; // arm/leg angles
    if (player.state === "run") {
      lean = 0.22 * f;
      const s = Math.sin(ph), c = Math.cos(ph);
      ll = { kneeX: 10 * s, kneeY: 12, footX: 18 * s, footY: 26 - Math.max(0, -c) * 8 };
      lr = { kneeX: -10 * s, kneeY: 12, footX: -18 * s, footY: 26 - Math.max(0, c) * 8 };
      la = { ex: -12 * s, ey: 12, hx: -16 * s, hy: 18 };
      ra = { ex: 12 * s, ey: 12, hx: 16 * s, hy: 18 };
    } else if (player.state === "jump") {
      const up = player.vy < 0;
      ll = { kneeX: 6, kneeY: 8, footX: 4, footY: up ? 14 : 22 };
      lr = { kneeX: -4, kneeY: 12, footX: -8, footY: up ? 18 : 24 };
      la = { ex: -10, ey: -6, hx: -14, hy: -18 };
      ra = { ex: 10, ey: -6, hx: 14, hy: -18 };
      lean = 0.1 * f;
    } else {
      const b = Math.sin(world.t * 2) * 1.2;   // idle breathing
      ll = { kneeX: 3, kneeY: 13, footX: 6, footY: 26 };
      lr = { kneeX: -3, kneeY: 13, footX: -6, footY: 26 };
      la = { ex: -6, ey: 12 + b, hx: -5, hy: 22 + b };
      ra = { ex: 6, ey: 12 + b, hx: 5, hy: 22 + b };
    }
    ctx.translate(px, hipY); ctx.rotate(lean); ctx.translate(-px, -hipY);
    // legs
    ctx.beginPath();
    ctx.moveTo(px, hipY); ctx.lineTo(px + ll.kneeX * f, hipY + ll.kneeY); ctx.lineTo(px + ll.footX * f, hipY + ll.footY);
    ctx.moveTo(px, hipY); ctx.lineTo(px + lr.kneeX * f, hipY + lr.kneeY); ctx.lineTo(px + lr.footX * f, hipY + lr.footY);
    // torso
    ctx.moveTo(px, neckY); ctx.lineTo(px, hipY);
    // arms
    const shY = neckY + 5;
    ctx.moveTo(px, shY); ctx.lineTo(px + la.ex * f, shY + la.ey); ctx.lineTo(px + la.hx * f, shY + la.hy);
    ctx.moveTo(px, shY); ctx.lineTo(px + ra.ex * f, shY + ra.ey); ctx.lineTo(px + ra.hx * f, shY + ra.hy);
    ctx.stroke();
    // head
    ctx.fillStyle = theme.elev; ctx.beginPath(); ctx.arc(px, headY, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // hard hat (engineer!)
    ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc(px, headY - 1, headR + 1, Math.PI, 0); ctx.fill();
    ctx.fillRect(px - headR - 4, headY - 2, (headR + 4) * 2, 2.5);
    // eye
    ctx.fillStyle = theme.ink; ctx.beginPath(); ctx.arc(px + 3.5 * f, headY + 1, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    void footY;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function truncate(s, n) { s = String(s ?? ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  /* ---------------- Main loop ---------------- */
  function frame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (!clock.last) clock.last = ts;
    let dt = (ts - clock.last) / 1000; clock.last = ts;
    dt = Math.min(dt, 0.1);
    clock.acc += dt;
    const h = 1 / 120;
    let n = 0;
    while (clock.acc >= h && n < 8) { step(h); clock.acc -= h; n++; }
    render();
  }

  /* ---------------- Public API ---------------- */
  let mq, mqTheme, ro;
  window.Intro = {
    start(container, content, finish) {
      root = container; C = content || {}; onFinish = finish || (() => {});
      isTouch = matchMedia("(hover: none) and (pointer: coarse)").matches;
      reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.body.classList.add(isTouch ? "is-touch" : "can-hover");
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-label", "Side-scroller intro. Use arrow keys to move and space to jump, or press Escape to skip.");
      canvas.setAttribute("role", "img");
      root.appendChild(canvas);
      ctx = canvas.getContext("2d");
      readTheme();
      buildHud();
      resize();
      buildWorld();
      reset();
      ro = new ResizeObserver(() => { const oldG = groundY; resize(); if (player) player.y += groundY - oldG; });
      ro.observe(root);
      mqTheme = matchMedia("(prefers-color-scheme: dark)");
      mqTheme.addEventListener("change", readTheme);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", onBlur);
      canvas.addEventListener("pointerdown", onCanvasPointer);
      canvas.addEventListener("pointerup", onCanvasPointer);
      canvas.addEventListener("pointercancel", onCanvasPointer);
      running = true;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      if (ro) ro.disconnect();
      if (mqTheme) mqTheme.removeEventListener("change", readTheme);
      if (hud) hud.remove();
      if (canvas) canvas.remove();
      document.body.classList.remove("no-select");
    },
  };
})();
