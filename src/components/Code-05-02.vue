<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, redrawGeometryAndUpdateUI, applyMeshNormalMaterial, applyMeshStandardMaterial } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, gui;
let step = 0;

function drawShape() {
  // create a basic shape
  let shape = new THREE.Shape();

  // startpoint
  shape.moveTo(10, 10);

  // straight line upwards
  shape.lineTo(10, 40);

  // the top of the figure, curve to the right
  shape.bezierCurveTo(15, 25, 25, 25, 30, 40);

  // spline back down
  shape.splineThru([new THREE.Vector2(32, 30), new THREE.Vector2(28, 20), new THREE.Vector2(30, 10)]);

  // curve at the bottom
  shape.quadraticCurveTo(20, 15, 10, 10);

  // add 'eye' hole one
  var hole1 = new THREE.Path();
  hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true);
  shape.holes.push(hole1);

  // add 'eye hole 2'
  var hole2 = new THREE.Path();
  hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true);
  shape.holes.push(hole2);

  // add 'mouth'
  var hole3 = new THREE.Path();
  hole3.absarc(20, 16, 2, 0, Math.PI, true);
  shape.holes.push(hole3);

  // return the shape
  return shape;
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

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);

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

function animate() {
  params.mesh.rotation.y = step += 0.01;
  params.mesh.rotation.x = step;
  params.mesh.rotation.z = step;
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

    this.curveSegments = 12;
    // the start geometry and material. Used as the base for the settings in the control UI
    this.appliedMaterial = applyMeshNormalMaterial;
    this.castShadow = true;
    this.groundPlaneVisible = true;
    // redraw function, updates the control UI and recreates the geometry.
    this.redraw = function () {
      redrawGeometryAndUpdateUI(gui, scene, params, function () {
        return new THREE.ShapeGeometry(drawShape(), self.curveSegments).center();
      });
    };
  })();

  gui = new GUI();
  gui.add(params, "curveSegments", 1, 100, 1).onChange(params.redraw);
  // add a material section, so we can switch between materials
  gui
    .add(params, "appliedMaterial", {
      meshNormal: applyMeshNormalMaterial,
      meshStandard: applyMeshStandardMaterial,
    })
    .onChange(params.redraw);
  gui.add(params, "castShadow").onChange((e) => {
    params.mesh.castShadow = e;
  });
  gui.add(params, "groundPlaneVisible").onChange((e) => {
    groundPlane.material.visible = e;
  });

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
