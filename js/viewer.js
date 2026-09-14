/* =====================================================================
   viewer.js — interactive 3D STEP viewer (ES module, loaded on demand).

   Parses .step/.stp in the browser with occt-import-js (OpenCascade
   compiled to WebAssembly) and renders with three.js + OrbitControls.
   Everything is self-hosted under assets/libs/ so the site has no
   runtime dependency on a CDN.

   Usage (from shared.js):
     const v = await import("./viewer.js");
     const handle = await v.mountStepViewer(containerEl, "assets/models/part.step", { onStatus });
     handle.dispose();
   ===================================================================== */
import * as THREE from "three";
import { OrbitControls } from "three/addons/OrbitControls.js";

let occtPromise = null;
const meshCache = new Map();   // url -> parsed occt result

function loadOcct() {
  if (occtPromise) return occtPromise;
  occtPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "assets/libs/occt-import-js.js";
    s.onload = () => {
      window.occtimportjs({ locateFile: (f) => "assets/libs/" + f }).then(resolve, reject);
    };
    s.onerror = () => reject(new Error("Could not load occt-import-js"));
    document.head.appendChild(s);
  });
  return occtPromise;
}

async function parseStep(url, onStatus) {
  if (meshCache.has(url)) return meshCache.get(url);
  onStatus("Downloading model…");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Model not found (${res.status})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  onStatus("Loading CAD kernel…");
  const occt = await loadOcct();
  onStatus("Tessellating geometry…");
  // Let the status paint before the (synchronous) tessellation blocks the thread.
  await new Promise((r) => setTimeout(r, 30));
  const result = occt.ReadStepFile(buf, { linearDeflection: 0.2, angularDeflection: 0.4 });
  if (!result || !result.success || !result.meshes || !result.meshes.length) throw new Error("The STEP file could not be read");
  meshCache.set(url, result);
  return result;
}

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export async function mountStepViewer(container, url, opts = {}) {
  const onStatus = opts.onStatus || (() => {});
  const result = await parseStep(url, onStatus);
  onStatus("Building scene…");

  const dark = matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.getAttribute("data-theme") !== "light"
    || document.documentElement.getAttribute("data-theme") === "dark";
  const accent = new THREE.Color(cssVar("--accent", "#0e8f8a"));

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none;outline:none";

  // Geometry: one mesh per occt mesh, with per-face colors when the STEP carries them.
  const group = new THREE.Group();
  const baseColor = new THREE.Color(dark ? 0xb9c4d0 : 0xa7b3c0);
  for (const m of result.meshes) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(m.attributes.position.array, 3));
    if (m.attributes.normal) g.setAttribute("normal", new THREE.Float32BufferAttribute(m.attributes.normal.array, 3));
    else g.computeVertexNormals();
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(m.index.array), 1));
    let color = baseColor;
    if (m.color) color = new THREE.Color(m.color[0], m.color[1], m.color[2]);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.55, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, mat);
    group.add(mesh);
    // Subtle feature edges so flat CAD surfaces still read
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(g, 28), new THREE.LineBasicMaterial({ color: dark ? 0x2a3442 : 0x3b4756, transparent: true, opacity: 0.55 }));
    group.add(edges);
  }
  scene.add(group);

  // Center + fit
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);
  const radius = Math.max(size.x, size.y, size.z, 1e-3) * 0.6;

  const camera = new THREE.PerspectiveCamera(38, 1, radius * 0.01, radius * 100);
  const home = new THREE.Vector3(1, 0.8, 1.3).normalize().multiplyScalar(radius * 3.1);
  camera.position.copy(home);
  camera.lookAt(0, 0, 0);

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, dark ? 0x1a2230 : 0x8a97a5, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(radius * 3, radius * 4, radius * 2); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-radius * 3, radius, -radius * 2); scene.add(fill);
  const rim = new THREE.DirectionalLight(accent, 0.35); rim.position.set(0, -radius * 3, -radius * 2); scene.add(rim);

  // Ground grid for scale reference
  const grid = new THREE.GridHelper(radius * 6, 24, dark ? 0x2a3442 : 0xc9d1da, dark ? 0x1f2733 : 0xe1e7ee);
  grid.position.y = -size.y / 2 - radius * 0.02;
  grid.material.transparent = true; grid.material.opacity = 0.7;
  scene.add(grid);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = radius * 0.4;
  controls.maxDistance = radius * 12;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  const stopSpin = () => { controls.autoRotate = false; };
  renderer.domElement.addEventListener("pointerdown", stopSpin, { once: true });
  renderer.domElement.addEventListener("wheel", stopSpin, { once: true, passive: true });

  let raf = 0, alive = true;
  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  function loop() {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  }
  loop();
  onStatus("");

  return {
    resetView() { camera.position.copy(home); controls.target.set(0, 0, 0); controls.update(); },
    toggleSpin() { controls.autoRotate = !controls.autoRotate; return controls.autoRotate; },
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      renderer.dispose();
      renderer.domElement.remove();
    },
    stats: { meshes: result.meshes.length, triangles: result.meshes.reduce((n, m) => n + m.index.array.length / 3, 0) },
  };
}
