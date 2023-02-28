<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { FontLoader } from "../../node_modules/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "../../node_modules/three/examples/jsm/geometries/TextGeometry.js";
import { initRenderer, initCamera, initControls, addGroundPlane, redrawGeometryAndUpdateUI, applyMeshNormalMaterial, applyMeshStandardMaterial, initDefaultLighting, addLargeGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, groundPlane, plane, params, operations, gui;
let step = 0,
  font_bitstream,
  font_helvetiker_bold,
  font_helvetiker_regular,
  text1,
  text2;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container);

  // controls
  controls = initControls(camera, renderer, OrbitControls);
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(200);
  scene.add(axesHelper);

  initDefaultLighting(scene);
  groundPlane = addLargeGroundPlane(scene);
  groundPlane.position.y = -30;

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  stats.update();

  animate();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function animate() {
  params.mesh.rotation.y = step += 0.01;
  params.mesh.rotation.x = step;
  params.mesh.rotation.z = step;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  let fontload1 = new FontLoader();
  fontload1.load("../../public/fonts/bitstream_vera_sans_mono_roman.typeface.json", (response) => {
    params.font = response;
    font_bitstream = response;
    params.redraw();
    render();
  });

  let fontload2 = new FontLoader();
  fontload2.load("../../public/fonts/helvetiker_bold.typeface.json", (response) => {
    font_helvetiker_bold = response;
  });

  let fontload3 = new FontLoader();
  fontload3.load("../../public/fonts/helvetiker_regular.typeface.json", (response) => {
    font_helvetiker_regular = response;
  });

  setupControls();
}

function setupControls() {
  params = new (function () {
    let self = this;

    this.appliedMaterial = applyMeshNormalMaterial;
    this.castShadow = true;
    this.groundPlaneVisible = true;

    this.size = 90;
    this.height = 90;
    this.bevelThickness = 2;
    this.bevelSize = 0.5;
    this.bevelEnabled = true;
    this.bevelSegments = 3;
    this.bevelEnabled = true;
    this.curveSegments = 12;
    this.steps = 1;
    this.fontName = "bitstream vera sans mono";

    // redraw function, updates the control UI and recreates the geometry.
    this.redraw = () => {
      switch (params.fontName) {
        case "bitstream vera sans mono":
          params.font = font_bitstream;
          break;
        case "helvetiker":
          params.font = font_helvetiker_regular;
          break;
        case "helvetiker bold":
          params.font = font_helvetiker_bold;
          break;
      }

      redrawGeometryAndUpdateUI(gui, scene, params, () => {
        let options = {
          size: params.size,
          height: params.height,
          weight: params.weight,
          font: params.font,
          bevelThickness: params.bevelThickness,
          bevelSize: params.bevelSize,
          bevelSegments: params.bevelSegments,
          bevelEnabled: params.bevelEnabled,
          curveSegments: params.curveSegments,
          steps: params.steps,
        };

        let geom = new TextGeometry("Bullepop", options);

        return geom;
      });
    };
  })();

  gui = new GUI();
  gui.add(params, "size", 0, 200).onChange(params.redraw);
  gui.add(params, "height", 0, 200).onChange(params.redraw);
  gui.add(params, "fontName", ["bitstream vera sans mono", "helvetiker", "helvetiker bold"]).onChange(params.redraw);
  gui.add(params, "bevelThickness", 0, 10).onChange(params.redraw);
  gui.add(params, "bevelSize", 0, 10).onChange(params.redraw);
  gui.add(params, "bevelSegments", 0, 30).step(1).onChange(params.redraw);
  gui.add(params, "bevelEnabled").onChange(params.redraw);
  gui.add(params, "curveSegments", 1, 30).step(1).onChange(params.redraw);
  gui.add(params, "steps", 1, 5).step(1).onChange(params.redraw);

  // add a material section, so we can switch between materials
  gui
    .add(params, "appliedMaterial", {
      meshNormal: applyMeshNormalMaterial,
      meshStandard: applyMeshStandardMaterial,
    })
    .onChange(params.redraw);

  gui.add(params, "castShadow").onChange((e) => {
    params.mesh.castShadow = e;
  });
  gui.add(params, "groundPlaneVisible").onChange((e) => {
    groundPlane.material.visible = e;
  });

  // initialize the first redraw so everything gets initialized
  params.redraw();

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
