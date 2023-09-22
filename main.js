import "./style.css";
import { animate, inView } from "motion";
import {
  Scene,
  Clock,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Mesh,
  MeshLambertMaterial,
  AmbientLight,
  DirectionalLight,
  TorusKnotGeometry,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { NoiseShader } from "./noise";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const sneakerTag = document.querySelector("section.sneaker");
const loaderTag = document.querySelector("div.loader");

let currentEffect = 0;
let aimEffect = 0;
let timeoutEffect;

animate("section.content p, section.content img", { opacity: 0 });

inView("section.content", (info) => {
  animate(
    info.target.querySelectorAll("p, img"),
    { opacity: 1 },
    { duration: 1, delay: 1 }
  );
});

const clock = new Clock();

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000, 0);
sneakerTag.appendChild(renderer.domElement);

const ambient = new AmbientLight(0x404040); // soft white light
camera.add(ambient);

const keyLight = new DirectionalLight(0xffffff, 1);
keyLight.position.set(-1, 1, 3);
camera.add(keyLight);

const fillLight = new DirectionalLight(0xffffff, 0.25);
fillLight.position.set(1, 1, 3);
camera.add(fillLight);

scene.add(camera);

const loadGroup = new Group();
loadGroup.position.y = -10;

const scrollGroup = new Group();
scrollGroup.add(loadGroup);

scene.add(scrollGroup);

animate("header", { y: -100, opacity: 0 });
animate("section.new-drop", { y: -100, opacity: 0 });

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "sneaker.glb",
  (gltf) => {
    loadGroup.add(gltf.scene);

    animate(
      "header",
      {
        y: [-100, 0],
        opacity: [0, 1],
      },
      {
        duration: 1,
        delay: 1.5,
      }
    );

    animate(
      "section.new-drop",
      {
        y: [-100, 0],
        opacity: [0, 1],
      },
      { duration: 1, delay: 1 }
    );

    animate(
      (t) => {
        loadGroup.position.y = -10 + 10 * t;
      },
      { duration: 2, delay: 1 }
    );

    animate(
      "div.loader",
      {
        y: "-100%",
      },
      {
        duration: 1,
        delay: 1,
      }
    );
  },
  (xhr) => {
    loaderTag.querySelector("span").innerHTML =
      Math.round((xhr.loaded / xhr.total) * 100) + "% Carregado";
  },
  (error) => {
    console.error(error);
  }
);

camera.position.z = 2;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 2;
controls.update();

//Post-Processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

const noisePass = new ShaderPass(NoiseShader);
noisePass.uniforms.time.value = clock.getElapsedTime();
noisePass.uniforms.effect.value = currentEffect;
composer.addPass(noisePass);

function render() {
  controls.update();
  scrollGroup.rotation.set(0, window.scrollY * 0.001, 0);

  currentEffect += (aimEffect - currentEffect) * 0.05;

  noisePass.uniforms.time.value = clock.getElapsedTime();
  noisePass.uniforms.effect.value = currentEffect;

  requestAnimationFrame(render);
  composer.render();
}

const resize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerHeight, window.innerWidth);
};

function scroll() {
  clearTimeout(timeoutEffect);
  aimEffect = 1;

  timeoutEffect = setTimeout(() => {
    aimEffect = 0;
  }, 300);
}

render();
window.addEventListener("resize", resize);
window.addEventListener("scroll", scroll);
