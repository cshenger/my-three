<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "../../node_modules/three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let step = 0,
  cloud = null;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
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
    step += 0.01;
    cloud.rotation.x = step;
    cloud.rotation.z = step;
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
    this.size = 4;
    this.transparent = true;
    this.opacity = 0.6;
    this.vertexColors = true;
    this.color = 0xffffff;
    this.vertexColor = 0x00ff00;
    this.sizeAttenuation = true;
    this.rotate = true;

    this.redraw = () => {
      console.log(params.color);

      if (scene.getObjectByName("particles")) {
        scene.remove(scene.getObjectByName("particles"));
      }
      createParticles(params.size, params.transparent, params.opacity, params.vertexColors, params.sizeAttenuation, params.color, params.vertexColor);
    };
  })();

  const gui = new GUI();
  gui.add(params, "size", 0, 10).onChange(params.redraw);
  gui.add(params, "transparent").onChange(params.redraw);
  gui.add(params, "opacity", 0, 1).onChange(params.redraw);
  gui.add(params, "vertexColors").onChange(params.redraw);
  gui.addColor(params, "color").onChange(params.redraw);
  gui.addColor(params, "vertexColor").onChange(params.redraw);
  gui.add(params, "sizeAttenuation").onChange(params.redraw);
  gui.add(params, "rotate");

  params.redraw();
  return params;
}

function createParticles(size, transparent, opacity, vertexColors, sizeAttenuation, colorValue, vertexColorValue) {
  const vertices = [];
  const colors = [];

  let geom = new THREE.BufferGeometry();
  let material = new THREE.PointsMaterial({
    size: size,
    transparent: transparent,
    opacity: opacity,
    vertexColors: vertexColors,
    sizeAttenuation: sizeAttenuation,
    color: new THREE.Color(colorValue),
  });

  let range = 500;
  for (let i = 0; i < 8000; i++) {
    // let particle = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
    vertices.push(Math.random() * range - range / 2);
    vertices.push(Math.random() * range - range / 2);
    vertices.push(Math.random() * range - range / 2);
    let color = new THREE.Color(vertexColorValue);
    let asHSL = {};
    color.getHSL(asHSL);
    color.setHSL(asHSL.h, asHSL.s, asHSL.l * Math.random());
    colors.push(color.r, color.g, color.b);
    geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  }

  cloud = new THREE.Points(geom, material);
  cloud.name = "particles";
  scene.add(cloud);
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
