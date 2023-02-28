<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params;
let step = 0;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(50, 50, 50));
  camera.lookAt(scene.position);
  // clock = new THREE.Clock();
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
  const ambientLight = new THREE.AmbientLight(0x343434);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-10, 30, 40);
  spotLight.castShadow = true;
  scene.add(spotLight);

  const keyLight = new THREE.SpotLight(0xffffff);
  keyLight.position.set(-10, 80, 80);
  keyLight.intensity = 2;
  keyLight.lookAt(new THREE.Vector3(0, 15, 0));
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.height = 4096;
  keyLight.shadow.mapSize.width = 4096;
  scene.add(keyLight);

  const backlight1 = new THREE.SpotLight(0xffffff);
  backlight1.position.set(150, 40, -20);
  backlight1.intensity = 0.5;
  backlight1.lookAt(new THREE.Vector3(0, 15, 0));
  scene.add(backlight1);

  const backlight2 = new THREE.SpotLight(0xffffff);
  backlight2.position.set(-150, 40, -20);
  backlight2.intensity = 0.5;
  backlight2.lookAt(new THREE.Vector3(0, 15, 0));
  scene.add(backlight2);

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

function animate() {}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  camera.lookAt(new THREE.Vector3(0, 15, 0));
  const loader = new ColladaLoader();
  loader.load("../../public/models/medieval/Medieval_building.DAE", (result) => {
    // 该组用来重新存放模型网格，方便我们加入到自己的场景
    const meshGroup = new THREE.Group();
    // 获取模型中的场景数据
    const scenceGroup = result.scene;
    // 遍历模型中的对象（scenceGroup.children中包含了网格、灯光等对象）
    scenceGroup.children.forEach((child) => {
      // 剔除模型中的非网格数据，并对网格开启阴影效果
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        meshGroup.add(child);
      } else {
        scenceGroup.remove(child);
      }
    });
    meshGroup.rotation.x = (-90 * Math.PI) / 180; // 让模型沿Z轴旋转负90度
    meshGroup.scale.set(6, 6, 6);
    scene.add(meshGroup);
  });

  setupControls();
}

function setupControls() {
  const gui = new GUI();

  // params.redraw();

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
