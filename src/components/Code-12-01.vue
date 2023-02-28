<script setup>
import { onMounted, nextTick } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls } from "./utils.js";
import * as CANNON from "cannon-es";

let container, camera, scene, renderer, stats, controls, clock, params, operations, trackballControls;
let world, sphere, body, defaultMaterial, defalutContactMaterial;
let oldElapsedTime = 0;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(10, 10, 40));
  renderer = initRenderer(container);

  // controls
  controls = initControls(camera, renderer, OrbitControls);
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  //Light
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);
  const dLight = new THREE.DirectionalLight(0xffffff, 1);
  dLight.position.set(0, 100, 85);
  dLight.castShadow = true;
  dLight.shadow.camera.near = 0.1;
  dLight.shadow.camera.far = 200;
  dLight.shadow.camera.left = -50;
  dLight.shadow.camera.right = 50;
  dLight.shadow.camera.top = 50;
  dLight.shadow.camera.bottom = -50;
  dLight.shadow.mapSize.width = 2048;
  dLight.shadow.mapSize.height = 2048;
  scene.add(dLight);
  // 初始化聚光源
  // const spotLight = new THREE.SpotLight(0x999999);
  // spotLight.position.set(-10, 30, 20); // 设置聚光源的位置
  // spotLight.castShadow = true; // 开启聚光源投射阴影
  // // spotLight.distance = 1000000000
  // scene.add(spotLight);

  // clock
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
  const time = clock.getElapsedTime();
  let deltaTime = time - oldElapsedTime; //每帧的时间间隔
  oldElapsedTime = time;
  //step
  world.step(1 / 60, deltaTime, 3);
  //位置更新
  sphere.position.copy(body.position);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupControls() {
  params = new (function () {})();
  const gui = new GUI();
  return params;
}

// createCorps
function createCorps() {
  setupControls();
  initGrAvity();
  addGround();

  const sphereG = new THREE.SphereGeometry(1, 32, 32);
  const sphereM = new THREE.MeshStandardMaterial({ color: 0x888888 });
  sphere = new THREE.Mesh(sphereG, sphereM);
  sphere.castShadow = true;
  scene.add(sphere);

  let radius = 1;
  body = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(radius),
    position: new CANNON.Vec3(0, 0, 10), // m
    material: defaultMaterial,
  });
  world.addBody(body);
  //或者直接用three.js中的copy方法，更加简单
  // sphere.position.copy(body.position);
  console.log(body);
}

function initGrAvity() {
  // Setup our world
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // m/s²

  //给body的material
  defaultMaterial = new CANNON.Material("default");
  //给world的contactMaterial
  defalutContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0.4,
  });
  world.addContactMaterial(defalutContactMaterial);
}

function addGround(withTexture = false) {
  const textureLoader = new THREE.TextureLoader();

  // Create a plane
  const planeG = new THREE.PlaneGeometry(100, 100);
  const planeM = new THREE.MeshStandardMaterial({ color: 0x666666 });
  if (withTexture) {
    planeM.map = textureLoader.load("../../public/textures/general/floor-wood.jpg");
    planeM.map.wrapS = THREE.RepeatWrapping;
    planeM.map.wrapT = THREE.RepeatWrapping;
    planeM.map.repeat.set(40, 40);
  }
  const plane = new THREE.Mesh(planeG, planeM);
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow = true;
  scene.add(plane);

  const planeShape = new CANNON.Plane();
  const planeBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    material: defaultMaterial,
  });
  planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
  world.addBody(planeBody);
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
