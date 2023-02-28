<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { TexturePass } from "three/examples/jsm/postprocessing/TexturePass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometryWithMaterial, addShaderControl } from "./util-11.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, delta, plane, params, operations, gui;
let composer, sphere;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();
  initDefaultLighting(scene);

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container, { antialias: true, alpha: true });

  // controls
  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  clock = new THREE.Clock();
  delta = clock.getDelta();

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  const groundPlane = addLargeGroundPlane(scene, true);
  groundPlane.position.y = -8;

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  stats.update();

  animate();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  composer.render(delta);
}

function animate() {
  trackballControls.update(delta);
  sphere.rotation.y -= 0.01;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();

  const textureLoader = new THREE.TextureLoader();
  const urls = ["../../public/textures/cubemap/flowers/right.png", "../../public/textures/cubemap/flowers/left.png", "../../public/textures/cubemap/flowers/top.png", "../../public/textures/cubemap/flowers/bottom.png", "../../public/textures/cubemap/flowers/front.png", "../../public/textures/cubemap/flowers/back.png"];

  const cubeLoader = new THREE.CubeTextureLoader();
  const sphereMaterial = new THREE.MeshStandardMaterial({
    envMap: cubeLoader.load(urls),
    color: 0xffffff,
    metalness: 1,
    roughness: 0.3,
  });

  sphereMaterial.normalMap = textureLoader.load("../../public/textures/engraved/Engraved_Metal_003_NORM.jpg");
  sphereMaterial.aoMap = textureLoader.load("../../public/textures/engraved/Engraved_Metal_003_OCC.jpg");
  sphereMaterial.shininessMap = textureLoader.load("../../public/textures/engraved/Engraved_Metal_003_ROUGH.jpg");

  const sphereGeo = new THREE.SphereGeometry(5, 50, 50);
  sphere = addGeometryWithMaterial(scene, sphereGeo, "sphere", gui, params, sphereMaterial);
  sphere.position.x = 0;

  const boxMaterial1 = new THREE.MeshStandardMaterial({ color: 0x0066ff });
  const m1 = new THREE.BoxGeometry(10, 10, 10);
  const m1m = addGeometryWithMaterial(scene, m1, "m1", gui, params, boxMaterial1);
  m1m.position.z = -40;
  m1m.position.x = -35;
  m1m.rotation.y = 1;

  const m2 = new THREE.BoxGeometry(10, 10, 10);
  const boxMaterial2 = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const m2m = addGeometryWithMaterial(scene, m2, "m2", gui, params, boxMaterial2);
  m2m.position.z = -40;
  m2m.position.x = 35;
  m2m.rotation.y = -1;

  let totalWidth = 220;
  let nBoxes = 10;
  for (let i = 0; i < nBoxes; i++) {
    let box = new THREE.BoxGeometry(10, 10, 10);
    let mat = new THREE.MeshStandardMaterial({ color: 0x66ff00 });
    let mesh = new THREE.Mesh(box, mat);
    mesh.position.z = -120;
    mesh.position.x = -(totalWidth / 2) + (totalWidth / nBoxes) * i;
    mesh.rotation.y = i;
    scene.add(mesh);
  }

  const params2 = {
    focus: 10,
    aspect: camera.aspect,
    aperture: 0.0002,
    maxblur: 1,
  };

  const renderPass = new RenderPass(scene, camera);
  const bokehPass = new BokehPass(scene, camera, params2);
  bokehPass.renderToScreen = true;

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bokehPass);

  addShaderControl(
    gui,
    "Bokeh",
    bokehPass.materialBokeh,
    {
      floats: [
        { key: "focus", from: 10, to: 200, step: 0.01 },
        { key: "aperture", from: 0, to: 0.0005, step: 0.000001 },
        { key: "maxblur", from: 0, to: 1, step: 0.1 },
      ],
    },
    false
  );
}

function setupControls() {
  params = {
    normalScaleX: 1,
    normalScaleY: 1,
  };

  gui = new GUI();

  return params;
}

onMounted(() => {
  init();
  render();
});
</script>

<template>
  <div id="container"></div>
</template>

<style></style>
