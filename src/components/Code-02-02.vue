<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let container, stats;
let camera, controls, scene, renderer;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  let width = window.innerWidth; //窗口宽度
  let height = window.innerHeight; //窗口高度
  let k = width / height; //窗口宽高比
  let s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
  //创建相机对象
  camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
  camera.position.set(200, 300, 200); //设置相机位置
  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.addEventListener("change", render);
  controls.minDistance = 10;
  controls.maxDistance = 100;
  controls.enablePan = false;

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

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
  const geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
  //类型数组创建顶点位置position数据
  const vertices = new Float32Array([
    0,
    0,
    0, //顶点1坐标
    80,
    0,
    0, //顶点2坐标
    80,
    80,
    0, //顶点3坐标
    0,
    80,
    0, //顶点4坐标
  ]);
  // 创建属性缓冲区对象
  const attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组

  // 设置几何体attributes属性的位置position属性
  geometry.attributes.position = attribue;
  const normals = new Float32Array([
    0,
    0,
    1, //顶点1法向量
    0,
    0,
    1, //顶点2法向量
    0,
    0,
    1, //顶点3法向量
    0,
    0,
    1, //顶点4法向量
  ]);
  // 设置几何体attributes属性的位置normal属性
  geometry.attributes.normal = new THREE.BufferAttribute(normals, 3);

  // Uint16Array类型数组创建顶点索引数据
  const indexes = new Uint16Array([
    // 0对应第1个顶点位置数据、第1个顶点法向量数据
    // 1对应第2个顶点位置数据、第2个顶点法向量数据
    // 索引值3个为一组，表示一个三角形的3个顶点
    0, 1, 2, 0, 2, 3,
  ]);
  // 索引数据赋值给几何体的index属性
  geometry.index = new THREE.BufferAttribute(indexes, 1); //1个为一组

  //材质对象
  const material = new THREE.MeshBasicMaterial({
    color: 0x0000cc,
    side: THREE.DoubleSide, //两面可见
  });
  // 点渲染模式  点模型对象Points
  const mesh = new THREE.Mesh(geometry, material); //点模型对象
  scene.add(mesh); //点对象添加到场景
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
