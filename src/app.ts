import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadInformation, mouseClick } from "./interaction";

export let raycaster: THREE.Raycaster, mouse: THREE.Vector2, camera: THREE.Camera, scene: THREE.Scene;
let renderer: THREE.WebGLRenderer, lights: Array<THREE.DirectionalLight> = [];
let latestModelRequestPath: string;

const initializeLights = (): void => {
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

const initializeScene = (): OrbitControls => {
  let controls: OrbitControls;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(localStorage.getItem("currentTheme") == "dark" ? 0x121212 : 0xFFFFFF);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
  camera.rotation.set(-0.4, -0.7, -0.2);
  camera.position.set(-45, 25, 55);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  initializeLights();

  return controls;
}

const loadModel = (controls: OrbitControls, modelPath: string): void => {
  let loader: GLTFLoader

  loader = new GLTFLoader();
  loader.load(`${modelPath}.glb`, (gltf) => {
    const box = new THREE.Box3();
    box.setFromObject(gltf.scene);
    box.getCenter(controls.target);

    scene.add(gltf.scene);
    render();
  });

  loadInformation(`${modelPath}.yml`);
}

const getModelPath = (): string => {
  if (latestModelRequestPath != null) return latestModelRequestPath;

  return "models/default";
}

export const render = (): void => {
  renderer.render(scene, camera);
  console.log(camera);
}

window.addEventListener("mousedown", mouseClick, true);
window.addEventListener("touchstart", mouseClick, true);

try {
  let controls: OrbitControls = initializeScene();
  loadModel(controls, getModelPath());
} catch (error) {
  console.error(error);

  document.querySelectorAll(".error").forEach((elem: HTMLElement) => {
    elem.style.display = "block";
  });
  document.querySelectorAll(".info").forEach((elem: HTMLElement) => {
    elem.style.display = "none";
  });
}
