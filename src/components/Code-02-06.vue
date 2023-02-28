<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";

let container, camera, scene, renderer, stats, controls, clock;
let params;
let planeGeometry,
  lookAtMesh,
  step = 0;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.x = 120;
  camera.position.y = 60;
  camera.position.z = 180;
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
  planeGeometry = new THREE.PlaneGeometry(180, 180);
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // plane.receiveShadow = true;
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

  // directionalLight
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(-20, 40, 60);
  scene.add(directionalLight);

  // clock
  clock = new THREE.Clock();

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  controls.update(clock.getDelta());

  step += 0.02;
  if (camera instanceof THREE.Camera) {
    let x = 10 + 100 * Math.sin(step);
    camera.lookAt(new THREE.Vector3(x, 10, 0));
    lookAtMesh.position.copy(new THREE.Vector3(x, 10, 0));
  }

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
  const lookAtGeom = new THREE.SphereGeometry(2);
  lookAtMesh = new THREE.Mesh(lookAtGeom, new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
  scene.add(lookAtMesh);

  const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
  for (let j = 0; j < planeGeometry.parameters.height / 5; j++) {
    for (let i = 0; i < planeGeometry.parameters.width / 5; i++) {
      let rnd = Math.random() * 0.75 + 0.25;
      let cubeMaterial = new THREE.MeshLambertMaterial();
      cubeMaterial.color = new THREE.Color(rnd, 0, 0);
      let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

      cube.position.z = -(planeGeometry.parameters.height / 2) + 2 + j * 5;
      cube.position.x = -(planeGeometry.parameters.width / 2) + 2 + i * 5;
      cube.position.y = 2;

      scene.add(cube);
    }
  }

  const renderControls = () => {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.enablePan = false;
  };

  params = new (function () {
    this.perspective = "Perspective";
    this.switchCamera = function () {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
        camera.position.x = 120;
        camera.position.y = 60;
        camera.position.z = 180;
        camera.lookAt(scene.position);

        renderControls();
        this.perspective = "Orthographic";
      } else {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.x = 120;
        camera.position.y = 60;
        camera.position.z = 180;

        camera.lookAt(scene.position);
        renderControls();
        this.perspective = "Perspective";
      }
    };
  })();

  const gui = new GUI();
  gui.add(params, "switchCamera");
  gui.add(params, "perspective").listen();
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
