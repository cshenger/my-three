<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, plane, params, operations;
let mixer;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container);

  // controls
  // controls = initControls(camera, renderer, OrbitControls);
  trackballControls = new TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

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
  const light1 = new THREE.DirectionalLight(0xefefff, 1.5);
  light1.position.set(1, 1, 1).normalize();
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffefef, 1.5);
  light2.position.set(-1, -1, -1).normalize();
  scene.add(light2);

  // create the ground plane
  // plane = addGroundPlane(scene);
  // scene.add(plane);

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
  let delta = clock.getDelta();

  trackballControls.update(delta);
  if (mixer) {
    mixer.update(delta);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  // 创建立方体
  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xff0000,
  });
  const meshCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  meshCube.name = "CUBE";
  scene.add(meshCube);

  const times = [0, 10]; // 时间序列
  const values1 = [0, 0, 0, 40, 0, 0]; // 过渡的值
  const values2 = [1, 1, 1, 10, 5, 20]; // 过渡的值

  // 0 - 10 秒内的位置变化
  const posKeyFramTrack1 = new THREE.KeyframeTrack(".position", times, values1);
  const posKeyFramTrack2 = new THREE.KeyframeTrack(".scale", times, values2);
  const colorKF = new THREE.ColorKeyframeTrack(".material.color", [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete);

  // 通过THREE.AnimationClip对象对动画进行剪辑
  // name, 持续时间, KeyframeTrack<>
  const trackArr = [posKeyFramTrack1, posKeyFramTrack2, colorKF];
  const clip = new THREE.AnimationClip("CUBE-ANUMATION", 10, trackArr);

  // 通过THREE.AnimationMixer混合器，通过KeyframeTrack以及剪辑器AnimationClip对象，
  // 仅仅构成动画的数据基础，实际的动画播放需要通过AnimationMixer来控制，AnimationMixer就像一个动画控制台，
  // 它可以同时控制多个动画，以及合并它们
  mixer = new THREE.AnimationMixer(meshCube);
  const action = mixer.clipAction(clip);

  // 通过 action 控制动画播放
  action.timeScale = 5; // 调整播放速度 默认1
  // 设置动画循环
  // 默认值有：
  // THREE.LoopOnce - 只执行一次
  // THREE.LoopRepeat - 重复次数为repetitions的值, 且每次循环结束时候将回到起始动作开始下一次循环。
  // THREE.LoopPingPong - 重复次数为repetitions的值, 且像乒乓球一样在起始点与结束点之间来回循环。
  action.setLoop(THREE.LoopPingPong).play();

  // 事件
  // 可以通过给AnimationMixer播放器添加loop和finished事件来获取动画一个循环一个动画结束时的回调
  mixer.addEventListener("loop", function (e) {
    console.log("帧动画循环回调：", e);
  });
  mixer.addEventListener("finished", function (e) {
    console.log("帧动画结束回调：", e);
  });

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
