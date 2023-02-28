<script setup>
import { onMounted } from "vue";
import * as THREE from "three";

onMounted(() => {
  /**
   * 创建场景对象Scene
   */
  let scene = new THREE.Scene();
  /**
   * 创建网格模型
   */
  let material = new THREE.MeshPhongMaterial({
    color: 0x4080ff,
    dithering: true,
  });
  let geometry = new THREE.BoxBufferGeometry(3, 1, 2);
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(4, 1, 0);

  // 对产生阴影的物体设置
  mesh.castShadow = true;
  scene.add(mesh);

  let planeMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
  let planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
  let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.position.set(0, 0, 0);
  planeMesh.rotation.x = -Math.PI * 0.5;

  // 对接收阴影的物体设置
  planeMesh.receiveShadow = true;
  scene.add(planeMesh);

  let directionLight = new THREE.DirectionalLight(0xffffff, 1);
  directionLight.position.set(0, 100, 85);

  // 对灯光设置
  directionLight.castShadow = true;
  //设置阴影分辨率
  directionLight.shadow.mapSize.width = 2048;
  directionLight.shadow.mapSize.height = 2048;

  directionLight.distance = 500;
  directionLight.target = mesh;
  scene.add(directionLight);

  //环境光
  let ambient = new THREE.AmbientLight(0xeeeeee);
  scene.add(ambient);
  /**
   * 相机设置
   */
  let width = window.innerWidth; //窗口宽度
  let height = window.innerHeight; //窗口高度
  //创建相机对象
  let camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(15, 8, -10);
  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
  /**
   * 创建渲染器对象
   */
  let renderer = new THREE.WebGLRenderer({ antialias: true });

  // 对render设置
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height); //设置渲染区域尺寸
  renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
  document.body.appendChild(renderer.domElement); //body元素中插入canvas对象
  //执行渲染操作   指定场景、相机作为参数
  renderer.render(scene, camera);
});
</script>

<template>
  <div id="container"></div>
</template>

<style></style>
