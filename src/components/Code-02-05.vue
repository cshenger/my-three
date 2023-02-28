<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";

let container, camera, scene, renderer, stats, controls, clock;
let cube;
let params;

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

  // clock
  clock = new THREE.Clock();

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  controls.update(clock.getDelta());

  cube.visible = params.visible;

  cube.rotation.x = params.rotationX;
  cube.rotation.y = params.rotationY;
  cube.rotation.z = params.rotationZ;

  cube.scale.set(params.scaleX, params.scaleY, params.scaleZ);

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
  const geometry = new THREE.BoxGeometry(5, 8, 3);
  const material = new THREE.MeshLambertMaterial({ color: 0x44ff44 });
  cube = new THREE.Mesh(geometry, material);
  cube.position.y = 4;
  cube.castShadow = true;
  scene.add(cube);

  // gui
  params = {
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,

    positionX: 0,
    positionY: 4,
    positionZ: 0,

    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,

    translateX: 0,
    translateY: 0,
    translateZ: 0,

    visible: true,

    translate() {
      cube.translateX(params.translateX);
      cube.translateY(params.translateY);
      cube.translateZ(params.translateZ);

      params.positionX = cube.position.x;
      params.positionY = cube.position.y;
      params.positionZ = cube.position.z;
    },
  };

  const gui = new GUI();
  let guiScale = gui.addFolder("scale");
  guiScale.add(params, "scaleX", 0, 5);
  guiScale.add(params, "scaleY", 0, 5);
  guiScale.add(params, "scaleZ", 0, 5);

  let guiPosition = gui.addFolder("position");
  let contX = guiPosition.add(params, "positionX", -10, 10);
  let contY = guiPosition.add(params, "positionY", -4, 20);
  let contZ = guiPosition.add(params, "positionZ", -10, 10);

  contX.listen();
  contX.onChange(function (value) {
    cube.position.x = params.positionX;
    // cube.children[1].position.x = params.positionX;
  });

  contY.listen();
  contY.onChange(function (value) {
    cube.position.y = params.positionY;
  });

  contZ.listen();
  contZ.onChange(function (value) {
    cube.position.z = params.positionZ;
  });

  let guiRotation = gui.addFolder("rotation");
  guiRotation.add(params, "rotationX", -4, 4);
  guiRotation.add(params, "rotationY", -4, 4);
  guiRotation.add(params, "rotationZ", -4, 4);

  let guiTranslate = gui.addFolder("translate");
  guiTranslate.add(params, "translateX", -10, 10);
  guiTranslate.add(params, "translateY", -10, 10);
  guiTranslate.add(params, "translateZ", -10, 10);
  guiTranslate.add(params, "translate");

  gui.add(params, "visible");
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
