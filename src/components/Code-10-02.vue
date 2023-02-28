<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometry } from "./util-10.js";

let container, camera, scene, renderer, stats, trackballControls, clock, groundPlane, params, operations, gui;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(0, 20, 40));
  renderer = initRenderer(container);

  // controls
  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  // light
  scene.add(new THREE.AmbientLight(0x444444));
  initDefaultLighting(scene);

  // create the ground plane
  groundPlane = addLargeGroundPlane(scene);
  groundPlane.position.y = -10;
  scene.add(groundPlane);

  clock = new THREE.Clock();

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
  trackballControls.update(clock.getDelta());
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();

  const hdrTextureLoader = new RGBELoader();
  hdrTextureLoader.load("../../public/textures/hdr/dani_cathedral_oBBC.hdr", (texture, metadata) => {
    texture.encoding = THREE.RGBEEncoding;
    texture.flipY = true;

    // add a simple plane to show the texture
    const plane = new THREE.PlaneGeometry(20, 20);
    const planeMesh = addGeometry(scene, plane, "plane", texture, gui, params);

    // we add the webgl folder. When the tonemapping changes, we need to update the material.
    addWebglFolder(gui, renderer, () => {
      planeMesh.material.needsUpdate = true;
    });
  });
}

function setupControls() {
  params = {};
  gui = new GUI();
  return params;
}

/**
 * Adds the folder to the menu to control some tonemapping settings
 *
 * @param {*} gui
 * @param {*} renderer
 * @param {*} onToneMappingChange
 */
function addWebglFolder(gui, renderer, onToneMappingChange) {
  const folder = gui.addFolder("WebGL Renderer");
  const controls = {
    toneMapping: renderer.toneMapping,
  };
  folder.add(renderer, "toneMappingExposure", 0, 2, 0.1);
  folder.add(renderer, "toneMappingWhitePoint", 0, 2, 0.1);
  folder
    .add(controls, "toneMapping", {
      NoToneMapping: THREE.NoToneMapping,
      LinearToneMapping: THREE.LinearToneMapping,
      ReinhardToneMapping: THREE.ReinhardToneMapping,
      Uncharted2ToneMapping: THREE.Uncharted2ToneMapping,
      Uncharted2ToneMapping: THREE.Uncharted2ToneMapping,
      CineonToneMapping: THREE.CineonToneMapping,
    })
    .onChange(function (tm) {
      renderer.toneMapping = parseInt(tm);
      onToneMappingChange();
    });
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
