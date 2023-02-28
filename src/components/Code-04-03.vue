<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations;
let step = 0,
  cube = null;

function createMaterial(vertexShader, fragmentShader) {
  let vertShader = document.getElementById(vertexShader).innerHTML;
  let fragShader = document.getElementById(fragmentShader).innerHTML;

  let attributes = {};
  let uniforms = {
    time: {
      type: "f",
      value: 0.2,
    },
    scale: {
      type: "f",
      value: 0.2,
    },
    alpha: {
      type: "f",
      value: 0.6,
    },
    resolution: {
      type: "v2",
      value: new THREE.Vector2(),
    },
  };

  uniforms.resolution.value.x = window.innerWidth;
  uniforms.resolution.value.y = window.innerHeight;

  let meshMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    transparent: true,
  });

  return meshMaterial;
}

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

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // create the ground plane
  // plane = addGroundPlane(scene);
  // scene.add(plane);

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
  cube.rotation.y = step += 0.01;
  cube.rotation.x = step;
  cube.rotation.z = step;

  cube.material.forEach((e) => {
    e.uniforms.time.value += 0.01;
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  let cubeGeometry = new THREE.BoxGeometry(20, 20, 20);

  let meshMaterial1 = createMaterial("vertex-shader", "fragment-shader-1");
  let meshMaterial2 = createMaterial("vertex-shader", "fragment-shader-2");
  let meshMaterial3 = createMaterial("vertex-shader", "fragment-shader-3");
  let meshMaterial4 = createMaterial("vertex-shader", "fragment-shader-4");
  let meshMaterial5 = createMaterial("vertex-shader", "fragment-shader-5");
  let meshMaterial6 = createMaterial("vertex-shader", "fragment-shader-6");

  let material = [meshMaterial1, meshMaterial2, meshMaterial3, meshMaterial4, meshMaterial5, meshMaterial6];
  cube = new THREE.Mesh(cubeGeometry, material);

  // add the sphere to the scene
  scene.add(cube);

  setupControls();
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
