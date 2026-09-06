"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const CDN_ORIGIN = "https://cdn.cacx.online";
const LOCAL_ASSET_ORIGIN = ".";

/** Lightweight flagship stand-in. When the converted Avatar model is ready,
 * replace this group with GLTFLoader + its .glb; camera choreography stays. */
function makeAmarrCapital() {
  const ship = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({ color: "#d8b76b", metalness: .82, roughness: .25, emissive: "#5d3c09", emissiveIntensity: .45 });
  const edge = new THREE.MeshStandardMaterial({ color: "#fff0b2", metalness: .9, roughness: .18, emissive: "#b87818", emissiveIntensity: 1.15 });
  const dark = new THREE.MeshStandardMaterial({ color: "#35475a", metalness: .88, roughness: .28, emissive: "#0f283f", emissiveIntensity: .32 });
  const engine = new THREE.MeshBasicMaterial({ color: "#8cfcff", transparent: true, opacity: 1 });
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.rotation.set(...rotation); ship.add(mesh);
  };

  // Cathedral-like Amarr capital silhouette: prow left, engines right.
  add(new THREE.CylinderGeometry(.46, .78, 4.6, 6), hull, [0, 0, 0], [0, 0, Math.PI / 2]);
  add(new THREE.ConeGeometry(.46, 1.75, 6), edge, [-3.05, 0, 0], [0, 0, -Math.PI / 2]);
  // The large, exposed ring is the recognisable near-facing end in the reference composition.
  add(new THREE.TorusGeometry(1.22, .12, 8, 32), edge, [-2.35, 0, 0], [0, Math.PI / 2, 0]);
  add(new THREE.CylinderGeometry(.7, .7, .14, 12), dark, [-2.35, 0, 0], [0, 0, Math.PI / 2]);
  add(new THREE.CylinderGeometry(.72, .72, .45, 6), dark, [2.44, 0, 0], [0, 0, Math.PI / 2]);
  [[-.15, 1.15, 0], [-.15, -1.15, 0], [.9, .9, 0], [.9, -.9, 0]].forEach(([x, y, z], index) => {
    add(new THREE.BoxGeometry(index < 2 ? 2.8 : 2.1, .16, .75), hull, [x, y, z], [0, 0, index % 2 ? -.12 : .12]);
    add(new THREE.BoxGeometry(index < 2 ? 1.55 : 1.1, .06, .82), edge, [x - .2, y + (y > 0 ? .13 : -.13), z]);
  });
  add(new THREE.BoxGeometry(1.5, 1.2, .95), dark, [-.42, 0, 0]);
  add(new THREE.BoxGeometry(.48, 1.7, .55), edge, [.2, 0, 0]);
  [-.42, .18, .76].forEach(x => add(new THREE.BoxGeometry(.05, 1.82, 1.02), edge, [x, 0, 0]));
  [-.5, 0, .5].forEach(y => add(new THREE.SphereGeometry(.16, 10, 10), engine, [2.72, y, 0]));
  ship.rotation.set(-.18, -.58, .23); ship.scale.setScalar(.66);
  return ship;
}

export default function SpaceScene({ onAssetProgress, onAssetReady }: {
  onAssetProgress: (value: number) => void;
  onAssetReady: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current; if (!container) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08; renderer.setClearColor("#02050b", 0); container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2("#02050b", .043);
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, .1, 10.6);
    scene.add(new THREE.HemisphereLight("#b6ddff", "#182435", 2));
    const rim = new THREE.DirectionalLight("#bed9ff", 5.2); rim.position.set(4, 5, 6); scene.add(rim);
    const amber = new THREE.PointLight("#ffbd47", 22, 12); amber.position.set(1.4, 2.2, 3.2); scene.add(amber);
    const blue = new THREE.PointLight("#50dbff", 19, 12); blue.position.set(4, -1, 1); scene.add(blue);
    const shipRig = new THREE.Group();
    shipRig.position.set(-.45, 1.08, -3.7);
    shipRig.rotation.set(-.18, -.58, .23);
    scene.add(shipRig);
    // Keep a small procedural fallback until the real Avatar asset is ready.
    const fallback = makeAmarrCapital();
    shipRig.add(fallback);
    let activeDracoLoader: DRACOLoader | null = null;
    let loadedAvatar = false;
    let activeRequest = 0;
    const loadAvatar = (origin: string, canRetry: boolean) => {
      const requestId = ++activeRequest;
      let settled = false;
      activeDracoLoader?.dispose();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(`${origin}/draco/`);
      activeDracoLoader = dracoLoader;
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      const continueWithoutThisRequest = () => {
        if (settled || requestId !== activeRequest || loadedAvatar) return;
        settled = true;
        window.clearTimeout(timeout);
        // A stalled CDN request does not call GLTFLoader's error handler.
        // Give the Pages copy a chance, then deliberately reveal the stable
        // procedural stand-in instead of trapping visitors on the loader.
        if (canRetry) loadAvatar(LOCAL_ASSET_ORIGIN, false);
        else onAssetReady();
      };
      const timeout = window.setTimeout(continueWithoutThisRequest, canRetry ? 7000 : 5000);
      loader.load(`${origin}/models/avatar.glb`, (gltf) => {
        if (settled || requestId !== activeRequest || loadedAvatar) return;
        settled = true;
        window.clearTimeout(timeout);
        loadedAvatar = true;
        const avatar = gltf.scene;
        avatar.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(avatar);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 5.1 / Math.max(size.x, size.y, size.z);
        avatar.scale.setScalar(scale);
        avatar.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        avatar.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = false;
            object.frustumCulled = false;
          }
        });
        shipRig.remove(fallback);
        shipRig.add(avatar);
        onAssetProgress(1);
        onAssetReady();
      }, (event) => {
        if (!settled && requestId === activeRequest && event.lengthComputable && event.total > 0) onAssetProgress(Math.min(event.loaded / event.total, .985));
      }, continueWithoutThisRequest);
    };
    loadAvatar(CDN_ORIGIN, true);
    const stars = new THREE.BufferGeometry(), points = new Float32Array(7200);
    for (let i = 0; i < points.length; i += 3) { points[i] = (Math.random() - .5) * 52; points[i + 1] = (Math.random() - .5) * 32; points[i + 2] = -Math.random() * 42; }
    stars.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const starMaterial = new THREE.PointsMaterial({ color: "#cfe3ff", size: .035, transparent: true, opacity: .8, sizeAttenuation: true }); scene.add(new THREE.Points(stars, starMaterial));
    // The canvas lives in the 16:9 hero stage. Its own frame always keeps the
    // flagship in view, so camera size never needs to guess from the browser's
    // physical resolution or page scroll position.
    let cameraZ = 10.6;
    let shipScale = 1.78;
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const aspect = width / height;
      renderer.setSize(width, height, false); camera.aspect = aspect; camera.updateProjectionMatrix();
      // Only the portrait-shaped mobile frame needs a separate fit. Desktop,
      // laptop and 2K all share the same 16:9 stage composition.
      const portraitFrame = aspect < 1;
      cameraZ = portraitFrame ? 12.6 : 10.6;
      shipScale = portraitFrame ? 1.42 : 1.78;
    };
    resize(); const observer = new ResizeObserver(resize); observer.observe(container); const clock = new THREE.Clock(); let frame = 0;
    const render = () => {
      const t = clock.getElapsedTime();
      camera.position.set(0, .1, cameraZ);
      camera.lookAt(0, -.05, -3.3);
      shipRig.position.y = 1.08 + Math.sin(t * .22) * .08;
      shipRig.rotation.z = .23 + Math.sin(t * .16) * .012;
      shipRig.rotation.y = -.58;
      // The Avatar's long stern extends farther to camera-right than its
      // circular bow does to camera-left. Offset its true centre slightly so
      // the complete silhouette sits inside the dedicated model frame.
      shipRig.position.x = -.45;
      shipRig.scale.setScalar(shipScale);
      renderer.render(scene, camera); frame = requestAnimationFrame(render);
    }; render();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); stars.dispose(); starMaterial.dispose(); scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } }); activeDracoLoader?.dispose(); renderer.dispose(); container.removeChild(renderer.domElement); };
  }, []);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}
