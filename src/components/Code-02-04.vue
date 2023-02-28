<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";

let container, stats;
let camera, controls, scene, renderer;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.x = -20;
  camera.position.y = 25;
  camera.position.z = 100;
  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.addEventListener("change", render);
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.enablePan = false;

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // create the ground plane
  const planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;
  // add the plane to the scene
  scene.add(plane);

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x494949);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff, 1, 180, Math.PI / 4);
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.position.set(-40, 30, 30);
  spotLight.castShadow = true;
  // spotLight.lookAt(mesh);
  scene.add(spotLight);

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  // controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  // 创建一个缓冲几何体
  const geometry = new THREE.BufferGeometry();
  // 下文为了方便阅览，利用解构赋值创建类型数组

  // 位置属性，格式：[x,y,z]
  geometry.attributes.position = new THREE.BufferAttribute(new Float32Array([...[0, 0, 0], ...[0, 50, 0], ...[50, 0, 0], ...[50, 0, 0], ...[0, 50, 0], ...[50, 50, 0]]), 3);

  // 颜色属性，格式：[r,g,b]，
  // 顶点之间的颜色将采用插值处理
  geometry.attributes.color = new THREE.BufferAttribute(new Float32Array([...[1, 0, 0], ...[0, 1, 0], ...[0, 0, 1], ...[1, 1, 0], ...[0, 1, 1], ...[1, 0, 1]]), 3);

  // 法线（方向）属性，格式：[x,y,z]，
  // 法线用于计算光线与网格模型表面的入射角和出射角
  geometry.attributes.normal = new THREE.BufferAttribute(new Float32Array([...[0, 0, 1], ...[0, 0, 1], ...[0, 0, 1], ...[0, 0, 1], ...[0, 0, 1], ...[0, 0, 1]]), 3);

  // 顶点的位置数据、颜色数据和法线数据一一对应，
  // 如第2个顶点的属性为：
  // 位置 - [0,50,0]，
  // 颜色 - [0,1,0]，
  // 法线 - [0,0,1]

  // 几何体xyz三个方向都放大2倍
  geometry.scale(2, 2, 2);
  // 几何体沿着x轴平移50
  geometry.translate(50, 0, 0);
  // 几何体绕着x轴旋转45度
  geometry.rotateX(Math.PI / 4);
  // 居中：偏移的几何体居中
  geometry.center();

  // 创建材质和网格模型
  const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors, // 以顶点颜色为准
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

onMounted(() => {
  init();
  render();
  animate();
});
</script>

<template>
  <div id="container"></div>
</template>

<style></style>
