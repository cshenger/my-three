<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "../../node_modules/three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initCameraPos, initControls, addGroundPlane, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls, cameraOrtho;
let step = 0,
  knot = null;

function generateSprite() {
  let canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;

  let context = canvas.getContext("2d");
  let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(0,255,255,1)");
  gradient.addColorStop(0.4, "rgba(0,0,64,1)");
  gradient.addColorStop(1, "rgba(0,0,0,1)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  let texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPoints(geom) {
  let material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    map: generateSprite(),
    depthWrite: false, // instead of sortParticles
  });

  let cloud = new THREE.Points(geom, material);
  return cloud;
}

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(0, 0, 50));
  clock = new THREE.Clock();
  renderer = initRenderer(container);

  // controls
  controls = initControls(camera, renderer, OrbitControls);
  // trackballControls = initTrackballControls(camera, renderer, TrackballControls);
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
  // trackballControls.update(clock.getDelta());
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function animate() {
  if (params.rotate) {
    knot.rotation.y = step += 0.01;
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
    // we need the first child, since it's a multimaterial
    this.radius = 13;
    this.tube = 1.7;
    this.radialSegments = 156;
    this.tubularSegments = 12;
    this.p = 5;
    this.q = 4;
    this.asParticles = false;
    this.rotate = false;

    this.redraw = () => {
      // remove the old plane
      if (knot) scene.remove(knot);
      // create a new one
      let geom = new THREE.TorusKnotGeometry(params.radius, params.tube, Math.round(params.radialSegments), Math.round(params.tubularSegments), Math.round(params.p), Math.round(params.q));

      if (params.asParticles) {
        knot = createPoints(geom);
      } else {
        knot = new THREE.Mesh(geom, new THREE.MeshNormalMaterial());
      }

      // add it to the scene.
      scene.add(knot);
    };
  })();

  const gui = new GUI();
  gui.add(params, "radius", 0, 40).onChange(params.redraw);
  gui.add(params, "tube", 0, 40).onChange(params.redraw);
  gui.add(params, "radialSegments", 0, 400).step(1).onChange(params.redraw);
  gui.add(params, "tubularSegments", 1, 20).step(1).onChange(params.redraw);
  gui.add(params, "p", 1, 10).step(1).onChange(params.redraw);
  gui.add(params, "q", 1, 15).step(1).onChange(params.redraw);
  gui.add(params, "asParticles").onChange(params.redraw);
  gui.add(params, "rotate").onChange(params.redraw);

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
