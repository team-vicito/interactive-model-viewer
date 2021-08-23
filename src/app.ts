import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { mouseClick } from "./interaction";

export let raycaster: THREE.Raycaster, mouse: THREE.Vector2, ccamera: THREE.Camera, scene: THREE.Scene;
let renderer: THREE.WebGLRenderer, lights: Array<THREE.DirectionalLight> = [];

const initializeLights = () => {
  const ambientLight = new THREE.AmbientLight(0xAAAAAA, 0.5);
  scene.add(ambientLight);

  lights[0] = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  lights[0].position.set(500, 500, 0);
  scene.add(lights[0]);

  lights[1] = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  lights[1].position.set(-500, 500, 0);
  scene.add(lights[1]);

  lights[2] = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  lights[2].position.set(0, -500, 0);
  scene.add(lights[2]);
}

const initializeScene = () => {
  let controls: OrbitControls, loader: GLTFLoader;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(localStorage.getItem("currentTheme") == "dark" ? 0x121212 : 0xFFFFFF);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  document.body.appendChild(renderer.domElement);

  ccamera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
  ccamera.rotation.set(-0.4, -0.7, -0.2);
  ccamera.position.set(-45, 25, 55);

  controls = new OrbitControls(ccamera, renderer.domElement);
  controls.addEventListener("change", render);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  initializeLights();

  loader = new GLTFLoader();
  loader.load("../public/model-1.glb", (gltf) => {
    const box = new THREE.Box3();
    box.setFromObject(gltf.scene);
    box.getCenter(controls.target);

    scene.add(gltf.scene);
    render();
  });
}

export const render = () => {
  renderer.render(scene, ccamera);
  console.log(ccamera);
}

window.addEventListener("mousedown", mouseClick, true);
window.addEventListener("touchstart", mouseClick, true);
//window.addEventListener("mousemove", mouseMove, true);

try {
  initializeScene();
} catch (error) {
  console.error(error);

  document.querySelectorAll(".error").forEach((elem: HTMLElement) => {
    elem.style.display = "block";
  });
  document.querySelectorAll(".info").forEach((elem: HTMLElement) => {
    elem.style.display = "none";
  });
}
