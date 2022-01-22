import * as fs from "fs";
import * as THREE from "three";
import * as yaml from "js-yaml";
import * as io from "socket.io-client";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { mouseClick } from "./interaction";

export let raycaster: THREE.Raycaster, mouse: THREE.Vector2, camera: THREE.Camera, scene: THREE.Scene;
let renderer: THREE.WebGLRenderer, lights: Array<THREE.DirectionalLight> = [], controls: OrbitControls;
let latestModelRequestPath: string;

/** Initializes the lights in the scene */
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

/** Creates the scene and makes it interactive */
const initializeScene = (): void => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(localStorage.getItem("currentTheme") == "dark" ? 0x121212 : 0xFFFFFF);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  document.body.replaceChild(renderer.domElement, document.body.querySelector("canvas"));

  const config: any = readConfig(getModelPath());

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(config.position[0], config.position[1], config.position[2]);
  camera.rotation.set(config.euler[0], config.euler[1], config.euler[2]);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  initializeLights();
  loadModel(controls, config.model);
}

const readConfig = (config: string) => {
  const data = fs.readFileSync(`${config}.yml`, `utf8`);
  
  return yaml.load(data);
}

/** Loads a model into the scene */
const loadModel = (controls: OrbitControls, model: string): void => {
  let dracoLoader: DRACOLoader = new DRACOLoader();
  let loader: GLTFLoader

  dracoLoader.setDecoderPath("./");
  dracoLoader.setDecoderConfig({type: "js"})

  loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(model, (gltf) => {
    const box = new THREE.Box3();
    box.setFromObject(gltf.scene);
    box.getCenter(controls.target);

    scene.add(gltf.scene);
  });

  (document.body.querySelector(".overlay") as HTMLElement).style.display = "none";

  render();
}

/** Queues a new model to load */
export const setModelPath = (path: string): void => {
  (document.body.querySelector(".overlay") as HTMLElement).style.display = "block";

  latestModelRequestPath = path;

  scene.clear();
  initializeScene();
}

/** Returns a safe path to a model */
const getModelPath = (): string => {
  if (latestModelRequestPath != null) return latestModelRequestPath;

  return "default";
}

export const render = (): void => {
  renderer.render(scene, camera);
}

window.addEventListener("mousedown", mouseClick, true);
window.addEventListener("touchstart", mouseClick, true);

let socket = io.io();

/** Forwads the id from the scanner to a path */
socket.on("rfid", (id: string) => {
  setModelPath(id);
});

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
