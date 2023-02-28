<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { FlyControls } from "three/addons/controls/FlyControls.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, clock, plane, params, operations;
let trackballControls, flyControls, firstPersonControls;

const setRandomColors = (object, scale) => {
  const children = object.children;
  if (children && children.length > 0) {
    children.forEach((e) => {
      setRandomColors(e, scale);
    });
  } else {
    // no children assume contains a mesh
    if (object instanceof THREE.Mesh) {
      if (object.material instanceof Array) {
        object.material.forEach((m) => {
          m.color = new THREE.Color(scale(Math.random()).hex());
          if (m.name.indexOf("building") == 0) {
            m.emissive = new THREE.Color(0x444444);
            m.transparent = true;
            m.opacity = 0.8;
          }
        });
      } else {
        object.material.color = new THREE.Color(scale(Math.random()).hex());
        if (object.material.name.indexOf("building") == 0) {
          object.material.emissive = new THREE.Color(0x444444);
          object.material.transparent = true;
          object.material.opacity = 0.8;
        }
      }
    }
  }
};

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container);

  // controls
  // trackballControls = new TrackballControls(camera, renderer.domElement);
  // trackballControls.rotateSpeed = 1.0;
  // trackballControls.zoomSpeed = 1.0;
  // trackballControls.panSpeed = 1.0;

  // flyControls = new FlyControls(camera, renderer.domElement);
  // flyControls.movementSpeed = 25;
  // flyControls.rollSpeed = Math.PI / 24;
  // flyControls.autoForward = true;
  // flyControls.dragToLook = false;

  firstPersonControls = new FirstPersonControls(camera, renderer.domElement);
  firstPersonControls.lookSpeed = 0.1;
  firstPersonControls.movementSpeed = 20;
  firstPersonControls.lookVertical = true;
  firstPersonControls.constrainVertical = true;
  firstPersonControls.verticalMin = 1.0;
  firstPersonControls.verticalMax = 2.0;
  firstPersonControls.lon = -150;
  firstPersonControls.lat = 120;

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);

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
  // trackballControls.update(clock.getDelta());
  // flyControls.update(clock.getDelta());
  firstPersonControls.update(clock.getDelta());
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  const loader = new OBJLoader();
  loader.load("../../public/models/city/city.obj", (object) => {
    const scale = chroma.scale(["red", "green", "blue"]);
    setRandomColors(object, scale);
    scene.add(object);
  });

  // setupControls();
}

function setupControls() {
  params = new (function () {})();

  const gui = new GUI();

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
