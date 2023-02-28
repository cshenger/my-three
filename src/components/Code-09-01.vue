<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations;
let step = 0,
  scalingStep = 0,
  cube,
  sphere,
  cylinder;

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
  plane = addGroundPlane(scene);
  plane.position.y = 0;
  scene.add(plane);

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
  cube.rotation.x += params.rotationSpeed;
  cube.rotation.y += params.rotationSpeed;
  cube.rotation.z += params.rotationSpeed;

  // bounce the sphere up and down
  step += params.bouncingSpeed;
  sphere.position.x = 20 + 10 * Math.cos(step);
  sphere.position.y = 2 + 10 * Math.abs(Math.sin(step));

  // scale the cylinder
  scalingStep += params.scalingSpeed;
  var scaleX = Math.abs(Math.sin(scalingStep / 4));
  var scaleY = Math.abs(Math.cos(scalingStep / 5));
  var scaleZ = Math.abs(Math.sin(scalingStep / 7));
  cylinder.scale.set(scaleX, scaleY, scaleZ);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  cube.position.x = -10;
  cube.position.y = 4;
  cube.position.z = 0;
  scene.add(cube);

  const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x7777ff });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.x = 20;
  sphere.position.y = 0;
  sphere.position.z = 2;
  sphere.castShadow = true;
  scene.add(sphere);

  const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 20);
  const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x77ff77 });
  cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.castShadow = true;
  cylinder.position.set(0, 0, 1);
  scene.add(cylinder);

  document.addEventListener(
    "click",
    (event) => {
      // 获取屏幕坐标
      let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      // 将屏幕坐标转换为three.js场景坐标（鼠标点击位坐标置转三维坐标）
      vector = vector.unproject(camera);

      // 摄像机位置向场景发射“光线”
      const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      // 判断指定的对象中哪些被该光线照射到了
      const intersects = raycaster.intersectObjects([sphere, cylinder, cube]);

      if (intersects.length > 0) {
        // 旋转网格(mesh)
        console.log(intersects[0]);
        intersects[0].object.rotation.x += (10 * Math.PI) / 180;
        intersects[0].object.rotation.y += (10 * Math.PI) / 180;
        intersects[0].object.rotation.z += (10 * Math.PI) / 180;
      }
    },
    false
  );

  setupControls();
}

function setupControls() {
  params = new (function () {
    this.rotationSpeed = 0.02;
    this.bouncingSpeed = 0.03;
    this.scalingSpeed = 0.03;
  })();

  const gui = new GUI();
  gui.add(params, "rotationSpeed", 0, 0.5);
  gui.add(params, "bouncingSpeed", 0, 0.5);
  gui.add(params, "scalingSpeed", 0, 0.5);

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
