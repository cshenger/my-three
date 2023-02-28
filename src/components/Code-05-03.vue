<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, redrawGeometryAndUpdateUI, applyMeshNormalMaterial, applyMeshStandardMaterial, initDefaultLighting, addLargeGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, groundPlane, plane, params, operations, gui;
let step = 0;

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
  const axesHelper = new THREE.AxesHelper(100);
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
  setupControls();
}

function setupControls() {
  params = new (function () {
    let self = this;

    this.appliedMaterial = applyMeshNormalMaterial;
    this.castShadow = true;
    this.groundPlaneVisible = true;

    var baseGeom = new THREE.BoxGeometry(4, 10, 10, 4, 4, 4);
    this.width = baseGeom.parameters.width;
    this.height = baseGeom.parameters.height;
    this.depth = baseGeom.parameters.depth;

    this.widthSegments = baseGeom.parameters.widthSegments;
    this.heightSegments = baseGeom.parameters.heightSegments;
    this.depthSegments = baseGeom.parameters.depthSegments;

    // redraw function, updates the control UI and recreates the geometry.
    this.redraw = () => {
      redrawGeometryAndUpdateUI(gui, scene, params, () => {
        return new THREE.BoxGeometry(params.width, params.height, params.depth, Math.round(params.widthSegments), Math.round(params.heightSegments), Math.round(params.depthSegments));
      });
    };
  })();

  gui = new GUI();
  gui.add(params, "width", 0, 40).onChange(params.redraw);
  gui.add(params, "height", 0, 40).onChange(params.redraw);
  gui.add(params, "depth", 0, 40).onChange(params.redraw);
  gui.add(params, "widthSegments", 0, 10).onChange(params.redraw);
  gui.add(params, "heightSegments", 0, 10).onChange(params.redraw);
  gui.add(params, "depthSegments", 0, 10).onChange(params.redraw);
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
