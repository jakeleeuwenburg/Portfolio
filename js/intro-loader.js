/* =====================================================================
   intro-loader.js — loads js/intros/<INTRO>.js and starts it.
   Handles: name/title in the top bar, Esc-to-skip, "replay" handling,
   and a graceful fallback if the module fails to load.
   ===================================================================== */
(function () {
  const C = window.CONTENT || {};
  const root = document.getElementById("intro-root");
  const fallback = document.getElementById("intro-fallback");
  document.getElementById("bar-name").textContent = C.name || "";
  document.getElementById("fb-name").textContent = C.name || "";
  document.getElementById("fb-title").textContent = [C.title, C.subtitle].filter(Boolean).join(" · ");
  document.title = `${C.name || "Welcome"} — Interactive Intro`;

  function goToPortfolio() {
    try { sessionStorage.setItem("introDone", "1"); } catch (e) {}
    location.href = "portfolio.html";
  }
  window.goToPortfolio = goToPortfolio;

  document.getElementById("skip-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (window.Intro && window.Intro.stop) { try { window.Intro.stop(); } catch (err) {} }
    goToPortfolio();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("project-modal")) goToPortfolio();
  });

  function showFallback(reason) {
    if (reason) console.warn("[intro-loader]", reason);
    root.hidden = true;
    fallback.hidden = false;
  }

  const name = String(window.INTRO || "").replace(/[^a-z0-9_-]/gi, "");
  if (!name) return showFallback("No intro configured in intro-config.js");

  const s = document.createElement("script");
  s.src = `js/intros/${name}.js`;
  s.onerror = () => showFallback(`Could not load js/intros/${name}.js`);
  s.onload = () => {
    if (!window.Intro || typeof window.Intro.start !== "function") {
      return showFallback(`js/intros/${name}.js did not define window.Intro.start`);
    }
    try {
      window.Intro.start(root, C, goToPortfolio);
    } catch (err) {
      console.error(err);
      showFallback("Intro crashed on start");
    }
  };
  document.body.appendChild(s);
})();
