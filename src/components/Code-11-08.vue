<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader";
import { HorizontalTiltShiftShader } from "three/examples/jsm/shaders/HorizontalTiltShiftShader";
import { VerticalTiltShiftShader } from "three/examples/jsm/shaders/VerticalTiltShiftShader";
import { TriangleBlurShader } from "three/examples/jsm/shaders/TriangleBlurShader";
import { FocusShader } from "three/examples/jsm/shaders/FocusShader";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls, addLargeGroundPlane, initDefaultDirectionalLighting } from "./utils.js";
import { addShaderControl } from "./util-11.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, delta, plane, params, operations, gui;
let composer;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

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
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();

  initDefaultDirectionalLighting(scene);
  const groundPlane = addLargeGroundPlane(scene, true);
  groundPlane.position.y = -2;

  // add a whole lot of boxes
  let totalWidth = 800;
  let totalDepth = 800;
  let nBoxes = 51;
  let mBoxes = 51;
  let colors = [0x66ff00, 0x6600ff, 0x0066ff, 0xff6600, 0xff0066];
  for (let i = 0; i < nBoxes; i++) {
    for (let j = 0; j < mBoxes; j++) {
      let box = new THREE.BoxGeometry(5, 10, 5);
      let mat = new THREE.MeshStandardMaterial({
        color: colors[Math.round(Math.random() * 100) % 5],
        roughness: 0.6,
      });
      let mesh = new THREE.Mesh(box, mat);
      mesh.position.z = -(totalDepth / 2) + (totalDepth / mBoxes) * j;
      mesh.position.x = -(totalWidth / 2) + (totalWidth / nBoxes) * i;
      // mesh.rotation.y = i;
      mesh.castShadow = true;
      scene.add(mesh);
    }
  }

  const renderPass = new RenderPass(scene, camera);
  renderPass.renderToScreen = false;
  const effectCopy = new ShaderPass(CopyShader);
  effectCopy.renderToScreen = true;
  const horBlurShader = new ShaderPass(HorizontalBlurShader);
  const verBlurShader = new ShaderPass(VerticalBlurShader);
  const horTiltShiftShader = new ShaderPass(HorizontalTiltShiftShader);
  const verTiltShiftShader = new ShaderPass(VerticalTiltShiftShader);
  const triangleBlurShader = new ShaderPass(TriangleBlurShader, "texture");
  const focusShader = new ShaderPass(FocusShader);

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(horBlurShader);
  composer.addPass(verBlurShader);
  composer.addPass(horTiltShiftShader);
  composer.addPass(verTiltShiftShader);
  composer.addPass(triangleBlurShader);
  composer.addPass(focusShader);
  composer.addPass(effectCopy);

  addShaderControl(gui, "horizontalBlur", horBlurShader, { floats: [{ key: "h", from: 0, to: 0.01, step: 0.0001 }] });
  addShaderControl(gui, "verticalBlur", verBlurShader, { floats: [{ key: "v", from: 0, to: 0.01, step: 0.0001 }] });
  addShaderControl(gui, "horizontalTiltShift", horTiltShiftShader, {
    floats: [
      { key: "r", from: 0, to: 1, step: 0.01 },
      { key: "h", from: 0, to: 0.01, step: 0.0001 },
    ],
  });
  addShaderControl(gui, "verticalTiltShift", verTiltShiftShader, {
    floats: [
      { key: "r", from: 0, to: 1, step: 0.01 },
      { key: "v", from: 0, to: 0.01, step: 0.0001 },
    ],
  });
  addShaderControl(gui, "triangleBlur", triangleBlurShader, { vector2: [{ key: "delta", from: { x: 0, y: 0 }, to: { x: 0.1, y: 0.1 }, step: { x: 0.0001, y: 0.0001 } }] });
  addShaderControl(gui, "focus", focusShader, {
    floats: [
      { key: "sampleDistance", from: 0, to: 10, step: 0.01 },
      { key: "waveFactor", from: 0, to: 0.005, step: 0.0001 },
    ],
  });
}

function setupControls() {
  params = {};

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
