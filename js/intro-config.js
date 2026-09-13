/* =====================================================================
   intro-config.js — choose which interactive landing experience runs.

   The value must match a file in js/intros/<name>.js that sets
   window.Intro = { start(container, content, onFinish), stop() }.

   Available:
     "sidescroller"  — 2D platformer; run right, jump obstacles, enter the portal.

   To add a new intro style later: create js/intros/<name>.js following the
   same contract and change the string below. Nothing else needs to change.
   ===================================================================== */
window.INTRO = "sidescroller";
