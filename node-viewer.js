import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODEL_URL =
  "assets/manticore-field-node/Meshy_AI_Manticore_Field_Node_0722164359_texture.glb";

const CONTACT = "lucas@manticore.email";

const DEPLOYMENTS = {
  backyard: {
    label: "Backyard",
    ambient: 0x9aa89c,
    key: 0xfff2d8,
    ground: 0x2a3328,
    fog: 0x121816,
    intensity: 1.05,
  },
  forest: {
    label: "Forest edge",
    ambient: 0x6f8f72,
    key: 0xdde8c8,
    ground: 0x1a2618,
    fog: 0x0c140e,
    intensity: 0.85,
  },
  greenhouse: {
    label: "Greenhouse",
    ambient: 0xc8e8d4,
    key: 0xffffff,
    ground: 0x243028,
    fog: 0x152018,
    intensity: 1.25,
  },
  trail: {
    label: "Trail",
    ambient: 0x8a9aaa,
    key: 0xffe2b8,
    ground: 0x2a261f,
    fog: 0x14110e,
    intensity: 1.0,
  },
};

const state = {
  deployment: "forest",
  power: "solar",
  camera: true,
  mic: true,
  envSensors: true,
  gps: false,
  lora: false,
  ethernet: true,
  storage: "ssd",
  sync: "local",
  ledPwr: true,
  ledNet: true,
  ledAi: true,
  ledRec: false,
  autoRotate: true,
};

function $(id) {
  return document.getElementById(id);
}

function encodeMail({ subject, body }) {
  return `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function configSummary() {
  const d = DEPLOYMENTS[state.deployment]?.label || state.deployment;
  const modules = [
    state.camera && "Camera",
    state.mic && "Mic array",
    state.envSensors && "Env sensors",
    state.gps && "GPS",
    state.lora && "LoRa",
    state.ethernet && "Ethernet",
  ].filter(Boolean);

  const leds = [
    state.ledPwr && "PWR",
    state.ledNet && "NET",
    state.ledAi && "AI",
    state.ledRec && "REC",
  ].filter(Boolean);

  const powerLabel = {
    solar: "Solar 12V + battery",
    battery: "Battery 7.4–14.8V",
    usbc: "USB-C / tethered",
  }[state.power];

  const syncLabel = {
    local: "Local-only (private)",
    peer: "PeerWeave P2P sync",
    services: "Manticore data services",
  }[state.sync];

  return {
    deployment: d,
    power: powerLabel,
    modules: modules.join(", ") || "None",
    storage: state.storage === "ssd" ? "Local SSD" : "microSD",
    sync: syncLabel,
    leds: leds.join(", ") || "None",
  };
}

function buildRequestBody(intent) {
  const c = configSummary();
  return [
    `Request: ${intent}`,
    "",
    "Configured Field Node",
    `• Deployment: ${c.deployment}`,
    `• Power: ${c.power}`,
    `• Modules: ${c.modules}`,
    `• Storage: ${c.storage}`,
    `• Sync / data: ${c.sync}`,
    `• Status LEDs: ${c.leds}`,
    "",
    "Site / notes:",
    "",
  ].join("\n");
}

function updateMailLinks() {
  const install = $("requestInstall");
  const integrate = $("requestIntegrate");
  const configured = $("requestConfigured");
  if (install) {
    install.href = encodeMail({
      subject: "Manticore Field Node — install request",
      body: buildRequestBody("Install a Field Node in my habitat"),
    });
  }
  if (integrate) {
    integrate.href = encodeMail({
      subject: "Manticore — data services integration",
      body: [
        "Request: Integrate with Manticore data services",
        "",
        "Systems to integrate:",
        "Sites / volume:",
        "",
        "Preferred observation schema / sync:",
        configSummary().sync,
        "",
      ].join("\n"),
    });
  }
  if (configured) {
    configured.href = encodeMail({
      subject: "Manticore Field Node — configured request",
      body: buildRequestBody("Install / quote this configuration"),
    });
  }

  const chip = $("configSummary");
  if (chip) {
    const c = configSummary();
    chip.textContent = `${c.deployment} · ${c.power} · ${c.sync}`;
  }
}

function bindControls(api) {
  const map = [
    ["deploySelect", "deployment", "change"],
    ["powerSelect", "power", "change"],
    ["storageSelect", "storage", "change"],
    ["syncSelect", "sync", "change"],
    ["camToggle", "camera", "change"],
    ["micToggle", "mic", "change"],
    ["envToggle", "envSensors", "change"],
    ["gpsToggle", "gps", "change"],
    ["loraToggle", "lora", "change"],
    ["ethToggle", "ethernet", "change"],
    ["ledPwr", "ledPwr", "change"],
    ["ledNet", "ledNet", "change"],
    ["ledAi", "ledAi", "change"],
    ["ledRec", "ledRec", "change"],
    ["autoRotate", "autoRotate", "change"],
  ];

  for (const [id, key, evt] of map) {
    const el = $(id);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = Boolean(state[key]);
    else el.value = state[key];
    el.addEventListener(evt, () => {
      state[key] = el.type === "checkbox" ? el.checked : el.value;
      api.applyState();
      updateMailLinks();
    });
  }

  $("resetView")?.addEventListener("click", () => api.resetView());
  updateMailLinks();
}

export function initNodeViewer(root) {
  const canvas = root.querySelector("#nodeCanvas");
  const statusEl = root.querySelector("#viewerStatus");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c140e, 6, 16);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 50);
  camera.position.set(2.35, 1.45, 2.9);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1.6;
  controls.maxDistance = 6.5;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 0.28, 0);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) state.autoRotate = false;
  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = 0.55;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const hemi = new THREE.HemisphereLight(0xb8c8bc, 0x1a1c18, 0.55);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2d8, 1.1);
  key.position.set(2.4, 3.2, 1.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 12;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x6dff9a, 0.22);
  fill.position.set(-2.2, 1.4, -1.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.35);
  rim.position.set(-1.2, 2.4, 2.8);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 64),
    new THREE.MeshStandardMaterial({
      color: 0x1a2618,
      roughness: 0.92,
      metalness: 0.05,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const ringGlow = new THREE.PointLight(0x6dff9a, 0.8, 2.4, 2);
  ringGlow.position.set(0.15, 0.55, 0.55);
  scene.add(ringGlow);

  const solarGlow = new THREE.DirectionalLight(0xffc978, 0);
  solarGlow.position.set(0.2, 4.5, -0.4);
  scene.add(solarGlow);

  let modelRoot = null;
  const materials = [];

  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg;
  };

  const fitModel = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
    object.position.y += size.y * 0.5;
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    // Keep the product compact in frame across aspect ratios
    const scale = 0.82 / maxDim;
    object.scale.setScalar(scale);
    const midY = size.y * scale * 0.42;
    controls.target.set(0, midY, 0);
    camera.position.set(2.35, midY + 0.85, 2.9);
    controls.update();
  };

  const applyState = () => {
    const dep = DEPLOYMENTS[state.deployment] || DEPLOYMENTS.forest;
    scene.fog.color.setHex(dep.fog);
    hemi.color.setHex(dep.ambient);
    key.color.setHex(dep.key);
    key.intensity = dep.intensity;
    ground.material.color.setHex(dep.ground);
    fill.intensity = state.sync === "services" ? 0.38 : state.sync === "peer" ? 0.28 : 0.18;

    solarGlow.intensity =
      state.power === "solar" ? 0.85 : state.power === "battery" ? 0.2 : 0.05;

    const ledCount = [state.ledPwr, state.ledNet, state.ledAi, state.ledRec].filter(Boolean).length;
    ringGlow.intensity = 0.25 + ledCount * 0.35;
    ringGlow.distance = state.ledAi ? 2.8 : 2.1;

    for (const mat of materials) {
      if (!mat.emissive) continue;
      const boost = state.ledAi || state.ledPwr ? 0.22 + ledCount * 0.08 : 0.04;
      // Prefer green channel glow matching product ring
      mat.emissive.setRGB(0.02 * boost, 0.55 * boost, 0.18 * boost);
      mat.emissiveIntensity = boost;
    }

    controls.autoRotate = state.autoRotate;
    renderer.toneMappingExposure =
      state.deployment === "greenhouse" ? 1.18 : state.power === "solar" ? 1.1 : 1.0;

    root.dataset.camera = state.camera ? "on" : "off";
    root.dataset.mic = state.mic ? "on" : "off";
    root.dataset.gps = state.gps ? "on" : "off";
    root.dataset.lora = state.lora ? "on" : "off";
    root.dataset.ethernet = state.ethernet ? "on" : "off";
    root.dataset.env = state.envSensors ? "on" : "off";
  };

  const resetView = () => {
    camera.position.set(2.35, 1.45, 2.9);
    controls.target.set(0, 0.28, 0);
    controls.update();
  };

  const loader = new GLTFLoader();
  setStatus("Loading Field Node… 0%");
  loader.load(
    MODEL_URL,
    (gltf) => {
      modelRoot = gltf.scene;
      modelRoot.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const mat of mats) {
            if (!mat) continue;
            mat.envMapIntensity = 0.85;
            if ("roughness" in mat) mat.roughness = Math.min(0.72, mat.roughness ?? 0.55);
            if ("metalness" in mat) mat.metalness = Math.max(0.25, mat.metalness ?? 0.35);
            materials.push(mat);
          }
        }
      });
      fitModel(modelRoot);
      scene.add(modelRoot);
      applyState();
      setStatus("Drag to orbit · scroll to zoom");
    },
    (xhr) => {
      if (!xhr.total) {
        setStatus("Loading Field Node…");
        return;
      }
      const pct = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
      setStatus(`Loading Field Node… ${pct}%`);
    },
    (err) => {
      console.error(err);
      setStatus("Could not load 3D model. Check that the .glb is served.");
    }
  );

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);
  resize();

  let raf = 0;
  let active = true;
  const tick = () => {
    if (!active) return;
    raf = requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting;
      if (active && !raf) tick();
      if (!active && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { threshold: 0.05 }
  );
  io.observe(root);
  tick();

  const api = { applyState, resetView };
  bindControls(api);
  applyState();

  // Keep mailto bodies fresh if user changes nothing else before click
  root.addEventListener("pointerdown", updateMailLinks, { passive: true });
}

function boot() {
  const root = document.getElementById("configure");
  if (!root) return;
  // Business CTAs elsewhere on the page
  document.querySelectorAll("[data-mail-intent]").forEach((el) => {
    const intent = el.getAttribute("data-mail-intent");
    if (intent === "install") {
      el.setAttribute(
        "href",
        encodeMail({
          subject: "Manticore Field Node — install request",
          body: "Request: Install a Field Node in my habitat\n\nHabitat / site:\nUse case:\n",
        })
      );
    } else if (intent === "integrate") {
      el.setAttribute(
        "href",
        encodeMail({
          subject: "Manticore — data services integration",
          body: "Request: Integrate with Manticore data services\n\nSystems to integrate:\nSites / volume:\n",
        })
      );
    }
  });
  initNodeViewer(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
