<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ConvexGeometry } from "../../node_modules/three/examples/jsm/geometries/ConvexGeometry.js";
import { initRenderer, initCamera, initControls, addGroundPlane, redrawGeometryAndUpdateUI, applyMeshNormalMaterial, applyMeshStandardMaterial, initDefaultLighting, addLargeGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, groundPlane, plane, params, operations, gui;
let step = 0,
  spGroup;

function generatePoints(segments, phiStart, phiLength) {
  if (spGroup) scene.remove(spGroup);

  let points = [];
  let height = 5;
  let count = 30;
  for (let i = 0; i < count; i++) {
    points.push(new THREE.Vector2((Math.sin(i * 0.2) + Math.cos(i * 0.3)) * height + 12, i - count + count / 2));
  }

  spGroup = new THREE.Object3D();
  let material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: false,
  });
  points.forEach(function (point) {
    let spGeom = new THREE.SphereGeometry(0.2);
    let spMesh = new THREE.Mesh(spGeom, material);
    spMesh.position.set(point.x, point.y, 0);

    spGroup.add(spMesh);
  });
  // add the points as a group to the scene
  scene.add(spGroup);

  // use the same points to create a LatheGeometry
  let latheGeometry = new THREE.LatheGeometry(points, segments, phiStart, phiLength);
  return latheGeometry;
}

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

  initDefaultLighting(scene);
  groundPlane = addLargeGroundPlane(scene);
  groundPlane.position.y = -30;

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
  params.mesh.rotation.y = step += 0.01;
  params.mesh.rotation.x = step;
  params.mesh.rotation.z = step;

  if (spGroup) {
    spGroup.rotation.y = step;
    spGroup.rotation.x = step;
    spGroup.rotation.z = step;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();
}

function setupControls() {
  params = new (function () {
    let self = this;

    this.appliedMaterial = applyMeshNormalMaterial;
    this.castShadow = true;
    this.groundPlaneVisible = true;

    this.segments = 12;
    this.phiStart = 0;
    this.phiLength = 2 * Math.PI;

    // redraw function, updates the control UI and recreates the geometry.
    this.redraw = function () {
      redrawGeometryAndUpdateUI(gui, scene, params, function () {
        return generatePoints(params.segments, params.phiStart, params.phiLength);
      });
    };
  })();

  gui = new GUI();
  gui.add(params, "segments", 0, 50).step(1).onChange(params.redraw);
  gui.add(params, "phiStart", 0, 2 * Math.PI).onChange(params.redraw);
  gui.add(params, "phiLength", 0, 2 * Math.PI).onChange(params.redraw);

  // add a material section, so we can switch between materials
  gui
    .add(params, "appliedMaterial", {
      meshNormal: applyMeshNormalMaterial,
      meshStandard: applyMeshStandardMaterial,
    })
    .onChange(params.redraw);

  gui.add(params, "castShadow").onChange(function (e) {
    params.mesh.castShadow = e;
  });
  gui.add(params, "groundPlaneVisible").onChange(function (e) {
    groundPlane.material.visible = e;
  });
  gui.add(params, "redraw");

  // initialize the first redraw so everything gets initialized
  params.redraw();

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
