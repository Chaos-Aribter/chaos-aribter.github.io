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

export default function SpaceScene({ progress, onAssetProgress, onAssetReady }: {
  progress: number;
  onAssetProgress: (value: number) => void;
  onAssetReady: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress); progressRef.current = progress;

  useEffect(() => {
    const container = host.current; if (!container) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08; renderer.setClearColor("#02050b", 0); container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2("#02050b", .043);
    const camera = new THREE.PerspectiveCamera(47, 1, .1, 100); camera.position.set(0, .15, 11.6);
    scene.add(new THREE.HemisphereLight("#b6ddff", "#182435", 2));
    const rim = new THREE.DirectionalLight("#bed9ff", 5.2); rim.position.set(4, 5, 6); scene.add(rim);
    const amber = new THREE.PointLight("#ffbd47", 22, 12); amber.position.set(1.4, 2.2, 3.2); scene.add(amber);
    const blue = new THREE.PointLight("#50dbff", 19, 12); blue.position.set(4, -1, 1); scene.add(blue);
    const shipRig = new THREE.Group();
    shipRig.position.set(-.35, 1.3, -3.7);
    shipRig.rotation.set(-.18, -.58, .23);
    scene.add(shipRig);
    // Keep a small procedural fallback until the real Avatar asset is ready.
    const fallback = makeAmarrCapital();
    shipRig.add(fallback);
    let activeDracoLoader: DRACOLoader | null = null;
    let loadedAvatar = false;
    const loadAvatar = (origin: string, canRetry: boolean) => {
      activeDracoLoader?.dispose();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(`${origin}/draco/`);
      activeDracoLoader = dracoLoader;
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.load(`${origin}/models/avatar.glb`, (gltf) => {
        if (loadedAvatar) return;
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
        if (event.lengthComputable && event.total > 0) onAssetProgress(Math.min(event.loaded / event.total, .985));
      }, () => {
        // Some networks or CDN edges may reject a GLB or Draco worker request.
        // Retry from the Pages artifact before exposing the procedural stand-in.
        if (canRetry) loadAvatar(LOCAL_ASSET_ORIGIN, false);
        else onAssetReady();
      });
    };
    loadAvatar(CDN_ORIGIN, true);
    const stars = new THREE.BufferGeometry(), points = new Float32Array(7200);
    for (let i = 0; i < points.length; i += 3) { points[i] = (Math.random() - .5) * 52; points[i + 1] = (Math.random() - .5) * 32; points[i + 2] = -Math.random() * 42; }
    stars.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const starMaterial = new THREE.PointsMaterial({ color: "#cfe3ff", size: .035, transparent: true, opacity: .8, sizeAttenuation: true }); scene.add(new THREE.Points(stars, starMaterial));
    type SceneProfile = { cameraStartX: number; cameraEndX: number; cameraStartZ: number; cameraEndZ: number; lookStartX: number; lookEndX: number; shipStartX: number; shipEndX: number; shipY: number; scaleStart: number; scaleEnd: number };
    let profile: SceneProfile = { cameraStartX: 0, cameraEndX: -1.5, cameraStartZ: 11.6, cameraEndZ: 7.2, lookStartX: .65, lookEndX: .05, shipStartX: -.35, shipEndX: -.75, shipY: 1.3, scaleStart: 1.4, scaleEnd: 1.62 };
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const aspect = width / height;
      renderer.setSize(width, height, false); camera.aspect = aspect; camera.updateProjectionMatrix();
      // Match the CSS art-direction bands: ultrawide earns a larger, farther
      // right vessel; narrow desktop protects the editorial reading column.
      profile = aspect >= 2
        ? { cameraStartX: -.18, cameraEndX: -1.8, cameraStartZ: 12.6, cameraEndZ: 7.8, lookStartX: -.9, lookEndX: -.35, shipStartX: .3, shipEndX: -.2, shipY: 1.35, scaleStart: 1.34, scaleEnd: 1.62 }
        : aspect < 1.5
          ? { cameraStartX: .1, cameraEndX: -1.05, cameraStartZ: 13, cameraEndZ: 8.7, lookStartX: -.35, lookEndX: -.05, shipStartX: .4, shipEndX: .1, shipY: .95, scaleStart: 1.06, scaleEnd: 1.2 }
          : { cameraStartX: 0, cameraEndX: -1.5, cameraStartZ: 12.4, cameraEndZ: 7.7, lookStartX: -.82, lookEndX: -.22, shipStartX: .28, shipEndX: -.25, shipY: 1.18, scaleStart: 1.26, scaleEnd: 1.5 };
    };
    resize(); const observer = new ResizeObserver(resize); observer.observe(container); const clock = new THREE.Clock(); const desiredCamera = new THREE.Vector3(); let frame = 0;
    const render = () => {
      const t = clock.getElapsedTime(), p = progressRef.current;
      desiredCamera.set(THREE.MathUtils.lerp(profile.cameraStartX, profile.cameraEndX, Math.min(p * 1.18, 1)), THREE.MathUtils.lerp(.15, -.5, p), THREE.MathUtils.lerp(profile.cameraStartZ, profile.cameraEndZ, p)); camera.position.lerp(desiredCamera, .03);
      camera.lookAt(THREE.MathUtils.lerp(profile.lookStartX, profile.lookEndX, p), THREE.MathUtils.lerp(.05, -.35, p), -3.3);
      shipRig.position.y = profile.shipY + Math.sin(t * .22) * .1; shipRig.rotation.z = .23 + Math.sin(t * .16) * .014; shipRig.rotation.y = -.58 - p * .12; shipRig.position.x = THREE.MathUtils.lerp(profile.shipStartX, profile.shipEndX, Math.min(p * 1.1, 1)); shipRig.scale.setScalar(THREE.MathUtils.lerp(profile.scaleStart, profile.scaleEnd, Math.min(p * 1.1, 1)));
      renderer.render(scene, camera); frame = requestAnimationFrame(render);
    }; render();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); stars.dispose(); starMaterial.dispose(); scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } }); activeDracoLoader?.dispose(); renderer.dispose(); container.removeChild(renderer.domElement); };
  }, []);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}
