<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, addHouseAndTree, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane;
let params, ambientLight, pointColor;
let trackballControls, operations, pointLight, helper, sphereLightMesh, shadowHelper, step, invert, phase;

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

  // create the ground plane
  // plane = addGroundPlane(scene);

  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  clock = new THREE.Clock();

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
  // add a simple scene
  addHouseAndTree(scene);

  // add subtle ambient lighting
  ambientLight = new THREE.AmbientLight("#0c0c0c");
  scene.add(ambientLight);

  // the point light where working with
  pointColor = "#ccffcc";
  pointLight = new THREE.PointLight(pointColor);
  pointLight.decay = 0.1;
  pointLight.castShadow = true;
  scene.add(pointLight);

  helper = new THREE.PointLightHelper(pointLight);
  // scene.add(helper);

  shadowHelper = new THREE.CameraHelper(pointLight.shadow.camera);
  // scene.add(shadowHelper)

  // add a small sphere simulating the pointlight
  const sphereLight = new THREE.SphereGeometry(0.2);
  const sphereLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xac6c25,
  });
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
  sphereLightMesh.position.set(new THREE.Vector3(3, 0, 5));
  scene.add(sphereLightMesh);

  // call the render function
  step = 0;
  invert = 1;
  phase = 0;

  operations = setupControls();
  render();

  function render() {
    helper.update();
    shadowHelper.update();

    stats.update();
    pointLight.position.copy(sphereLightMesh.position);
    trackballControls.update(clock.getDelta());

    // move the light simulation
    if (phase > 2 * Math.PI) {
      invert = invert * -1;
      phase -= 2 * Math.PI;
    } else {
      phase += operations.rotationSpeed;
    }
    sphereLightMesh.position.z = +(25 * Math.sin(phase));
    sphereLightMesh.position.x = +(14 * Math.cos(phase));
    sphereLightMesh.position.y = 5;

    if (invert < 0) {
      var pivot = 14;
      sphereLightMesh.position.x = invert * (sphereLightMesh.position.x - pivot) + pivot;
    }

    // render using requestAnimationFrame
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  // params = new (function () {})();
  // const gui = new GUI();
}

function setupControls() {
  params = new (function () {
    this.rotationSpeed = 0.01;
    this.bouncingSpeed = 0.03;
    this.ambientColor = ambientLight.color.getStyle();
    this.pointColor = pointLight.color.getStyle();
    this.intensity = 1;
    this.distance = pointLight.distance;
  })();

  const gui = new GUI();
  gui.addColor(params, "ambientColor").onChange(function (e) {
    ambientLight.color = new THREE.Color(e);
  });

  gui.addColor(params, "pointColor").onChange(function (e) {
    pointLight.color = new THREE.Color(e);
  });

  gui.add(params, "distance", 0, 100).onChange(function (e) {
    pointLight.distance = e;
  });

  gui.add(params, "intensity", 0, 3).onChange(function (e) {
    pointLight.intensity = e;
  });

  return params;
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
