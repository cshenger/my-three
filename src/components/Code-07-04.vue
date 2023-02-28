<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "../../node_modules/three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let step = 0,
  cloud = null;

const createGhostTexture = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // the body
  ctx.translate(-81, -84);

  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(83, 116);
  ctx.lineTo(83, 102);
  ctx.bezierCurveTo(83, 94, 89, 88, 97, 88);
  ctx.bezierCurveTo(105, 88, 111, 94, 111, 102);
  ctx.lineTo(111, 116);
  ctx.lineTo(106.333, 111.333);
  ctx.lineTo(101.666, 116);
  ctx.lineTo(97, 111.333);
  ctx.lineTo(92.333, 116);
  ctx.lineTo(87.666, 111.333);
  ctx.lineTo(83, 116);
  ctx.fill();

  // the eyes
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(91, 96);
  ctx.bezierCurveTo(88, 96, 87, 99, 87, 101);
  ctx.bezierCurveTo(87, 103, 88, 106, 91, 106);
  ctx.bezierCurveTo(94, 106, 95, 103, 95, 101);
  ctx.bezierCurveTo(95, 99, 94, 96, 91, 96);
  ctx.moveTo(103, 96);
  ctx.bezierCurveTo(100, 96, 99, 99, 99, 101);
  ctx.bezierCurveTo(99, 103, 100, 106, 103, 106);
  ctx.bezierCurveTo(106, 106, 107, 103, 107, 101);
  ctx.bezierCurveTo(107, 99, 106, 96, 103, 96);
  ctx.fill();

  // the pupils
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(101, 102, 2, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(89, 102, 2, 0, Math.PI * 2, true);
  ctx.fill();

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createCloud = (size, transparent, opacity, sizeAttenuation, color) => {
  const geom = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    size: size,
    transparent: transparent,
    opacity: opacity,
    map: createGhostTexture(),
    sizeAttenuation: sizeAttenuation,
    color: color,
  });
  let veticsFloat32Array = [];
  const range = 500;
  for (let i = 0; i < 1000; i++) {
    const particle = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
    veticsFloat32Array.push(particle.x, particle.y, particle.z);
  }
  const vertices = new THREE.Float32BufferAttribute(veticsFloat32Array, 3);
  geom.attributes.position = vertices;
  cloud = new THREE.Points(geom, material);
  cloud.name = "points";
  scene.add(cloud);
};
// createCloud(20, true, 0.6, true, 0xffffff);

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  clock = new THREE.Clock();
  renderer = initRenderer(container);

  // controls
  controls = initControls(camera, renderer, OrbitControls);
  // trackballControls = initTrackballControls(camera, renderer, TrackballControls);
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
  // trackballControls.update(clock.getDelta());
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function animate() {
  if (params.rotate) {
    step += 0.01;
    cloud.rotation.x = step;
    cloud.rotation.z = step;
  }
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
    this.size = 20;
    this.transparent = true;
    this.opacity = 0.6;
    this.color = 0xffffff;
    this.rotate = true;
    this.sizeAttenuation = true;

    this.redraw = function () {
      if (scene.getObjectByName("points")) {
        scene.remove(scene.getObjectByName("points"));
      }
      createCloud(params.size, params.transparent, params.opacity, params.sizeAttenuation, params.color);
    };
  })();

  const gui = new GUI();
  gui.add(params, "size", 0, 20).onChange(params.redraw);
  gui.add(params, "transparent").onChange(params.redraw);
  gui.add(params, "opacity", 0, 1).onChange(params.redraw);
  gui.addColor(params, "color").onChange(params.redraw);
  gui.add(params, "sizeAttenuation").onChange(params.redraw);
  gui.add(params, "rotate");
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
