<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "../../node_modules/three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let speed = 1,
  range = 0,
  cloud = null,
  veticsFloat32Array = [],
  material = null,
  geom = null;
const texture = new THREE.TextureLoader().load("../../public/textures/particles/raindrop-3.png");

// 初始化渲染粒子雨滴
function initRain(vetics) {
  const vertices = new THREE.Float32BufferAttribute(vetics, 3);
  geom.attributes.position = vertices;
  const cloud = new THREE.Points(geom, material);
  cloud.sortParticles = true;
  cloud.name = "particles1";
  scene.add(cloud);
  return cloud;
}

function createPointCloud(size, transparent, opacity, sizeAttenuation, color) {
  geom = new THREE.BufferGeometry();
  material = new THREE.PointsMaterial({
    size: size,
    transparent: transparent,
    opacity: opacity,
    map: texture,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: sizeAttenuation,
    color: color,
  });

  range = 500;
  for (let i = 0; i < 1000; i++) {
    const particle = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
    veticsFloat32Array.push(...particle.toArray());
  }

  cloud = initRain(veticsFloat32Array);
}

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
  if (scene.getObjectByName("particles1")) {
    scene.remove(scene.getObjectByName("particles1"));
  }
  let rainPositionArray = Array.from(cloud.geometry.attributes.position.array);
  for (let i = 0; i < rainPositionArray.length; i += 3) {
    rainPositionArray[i + 1] -= speed;
    if (rainPositionArray[i + 1] < 0) {
      rainPositionArray[i + 1] = Math.random() * range - range / 2;
    }
  }
  cloud = initRain(rainPositionArray);
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
    this.size = 3;
    this.transparent = true;
    this.opacity = 0.6;
    this.color = 0xffffff;
    this.sizeAttenuation = true;
    this.redraw = () => {
      scene.remove(scene.getObjectByName("particles1"));
      createPointCloud(params.size, params.transparent, params.opacity, params.sizeAttenuation, params.color);
    };
  })();

  const gui = new GUI();
  gui.add(params, "size", 0, 20).onChange(params.redraw);
  gui.add(params, "transparent").onChange(params.redraw);
  gui.add(params, "opacity", 0, 1).onChange(params.redraw);
  gui.addColor(params, "color").onChange(params.redraw);
  gui.add(params, "sizeAttenuation").onChange(params.redraw);
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
