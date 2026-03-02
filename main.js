import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("bg3d");

// Respect reduced-motion users
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene + Camera
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 0, 6);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(4, 6, 7);
scene.add(key);

const fill = new THREE.DirectionalLight(0xffffff, 0.6);
fill.position.set(-4, -2, 6);
scene.add(fill);

// Helper: view size at Z
function getViewSizeAtZ(cam, z = 0) {
  const distance = cam.position.z - z;
  const vFov = (cam.fov * Math.PI) / 180;
  const height = 2 * Math.tan(vFov / 2) * distance;
  const width = height * cam.aspect;
  return { width, height };
}

// Load model
const loader = new GLTFLoader();
let model = null;

loader.load(
  "./models/model.glb",
  (gltf) => {
    model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);

    const scale = 0.75 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);

    scene.add(model);
  },
  undefined,
  (err) => console.error("❌ Model load error:", err)
);

// Animation
let t = 0;

function animate() {
  if (!reduceMotion) t += 0.0025;

  const { width, height } = getViewSizeAtZ(camera, 0);
  const rangeX = width / 2 - 0.8;
  const rangeY = height / 2 - 0.8;

  if (model) {
    const baseX = Math.sin(t * 0.55) * rangeX;
    const baseY = Math.cos(t * 0.65) * rangeY;
    const baseZ = Math.sin(t * 0.4) * 0.35;

    const wiggleX = Math.sin(t * 3.0) * 0.25;
    const wiggleY = Math.sin(t * 3.2) * 0.18;

    model.position.set(baseX + wiggleX, baseY + wiggleY, baseZ);

    model.rotation.z = 0;

    const edgeFactor = Math.min(Math.abs(baseX) / rangeX, 1);
    const easedEdge = edgeFactor * edgeFactor;

    model.rotation.y = Math.sign(baseX) * easedEdge * 0.7;
    model.rotation.y += Math.sin(t * 2.2) * 0.06 * easedEdge;

    model.rotation.x = Math.sin(t * 1.1) * 0.22;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// Resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// =============================
// OVERLAY SYSTEM (WORKING)
// =============================

function openOverlay(overlay) {
  overlay.classList.add("is-open");   // show overlay
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; 
}

function closeOverlay(overlay) {
  overlay.classList.remove("is-open"); // hide overlay
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // restore background scroll
}

// About button
const aboutBtn = document.getElementById("openAbout");
const aboutOverlay = document.getElementById("aboutOverlay");

if (aboutBtn && aboutOverlay) {
  aboutBtn.addEventListener("click", () => {
    aboutOverlay.classList.add("active"); // keep About page separate
  });
}

// Close About
const closeAbout = document.getElementById("closeAbout");
closeAbout.addEventListener("click", () => {
  aboutOverlay.classList.remove("active");
});

// Close on backdrop click for About
aboutOverlay.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay-backdrop")) {
    aboutOverlay.classList.remove("active");
  }
});


// Project buttons
const projects = document.querySelectorAll(".editorial-project");

projects.forEach(project => {
  project.addEventListener("click", () => {
    const overlayId = project.dataset.overlay;
    const overlay = document.getElementById(overlayId);
    if (overlay) openOverlay(overlay);
  });
});

// Close buttons + backdrop for project overlays
document.querySelectorAll(".overlay-close, .overlay-backdrop").forEach(el => {
  el.addEventListener("click", () => {
    const overlay = el.closest(".overlay");
    if (overlay) closeOverlay(overlay);
  });
});

// ESC closes any open overlay
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".overlay.is-open")
      .forEach(overlay => closeOverlay(overlay));
  }
});

// =============================
// CURSOR TOOLTIP SYSTEM
// =============================

// Create tooltip
const tooltip = document.createElement("div");
tooltip.classList.add("project-tooltip");
document.body.appendChild(tooltip);

projects.forEach(project => {
  const title = project.querySelector(".editorial-title")?.innerHTML;

  project.addEventListener("mousemove", (e) => {
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
    tooltip.innerHTML = title;
    tooltip.style.opacity = "1";
  });

  project.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });
});

const mayaFan = document.querySelector('.maya-fan');

if (mayaFan) {
  mayaFan.addEventListener('click', () => {
    mayaFan.classList.toggle('open');
  });
}

const boilingFan = document.querySelector('.boiling-fan');

if (boilingFan) {
  boilingFan.addEventListener('click', () => {
    boilingFan.classList.toggle('open');
  });
}

const trafficFan = document.querySelector('.traffic-fan');

if (trafficFan) {
  trafficFan.addEventListener('click', () => {
    trafficFan.classList.toggle('open');
  });
}

const traffic2Fan = document.querySelector('.traffic2-fan');

if (traffic2Fan) {
  traffic2Fan.addEventListener('click', () => {
    traffic2Fan.classList.toggle('open');
  });
}