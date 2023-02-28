<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "../../node_modules/three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let parameters = [],
  mouseX = 0,
  mouseY = 0,
  geom = null;
const textureLoader = new THREE.TextureLoader();
const sprite1 = textureLoader.load("../../public/textures/sprites/snowflake1.png");
const sprite2 = textureLoader.load("../../public/textures/sprites/snowflake2.png");
const sprite3 = textureLoader.load("../../public/textures/sprites/snowflake3.png");
const sprite4 = textureLoader.load("../../public/textures/sprites/snowflake4.png");
const sprite5 = textureLoader.load("../../public/textures/sprites/snowflake5.png");

function createPointCloud(name, texture, size, transparent, opacity, sizeAttenuation, color) {
  geom = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;
    vertices.push(x, y, z);
  }

  geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({
    size: size,
    transparent: transparent,
    opacity: opacity,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    sizeAttenuation: sizeAttenuation,
    color: color,
  });

  const particles = new THREE.Points(geom, material);
  particles.rotation.x = Math.random() * 6;
  particles.rotation.y = Math.random() * 6;
  particles.rotation.z = Math.random() * 6;
  particles.name = name;
  return particles;
}

function createPointInstances(size, transparent, opacity, sizeAttenuation, color) {
  parameters = [
    [[1.0, 0.2, 0.5], sprite2, 20],
    [[0.95, 0.1, 0.5], sprite3, 15],
    [[0.9, 0.05, 0.5], sprite1, 10],
    [[0.85, 0, 0.5], sprite5, 8],
    [[0.8, 0, 0.5], sprite4, 5],
  ];

  for (let i = 0; i < parameters.length; i++) {
    const sprite = parameters[i][1];
    scene.add(createPointCloud("" + sprite, sprite, size, transparent, opacity, sizeAttenuation, color));
  }
}

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
  const time = Date.now() * 0.00005;

  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
    }
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
    this.size = 10;
    this.transparent = true;
    this.opacity = 0.6;
    this.color = 0xffffff;
    this.sizeAttenuation = true;
    this.redraw = () => {
      let toRemove = [];
      scene.children.forEach((child) => {
        if (child instanceof THREE.Points) {
          toRemove.push(child);
        }
      });
      toRemove.forEach((child) => {
        scene.remove(child);
      });
      createPointInstances(params.size, params.params, params.opacity, params.sizeAttenuation, params.color);
    };
  })();

  const gui = new GUI();
  gui.add(params, "size", 0, 20).onChange(params.redraw);
  gui.add(params, "transparent").onChange(params.redraw);
  gui.add(params, "opacity", 0, 1).onChange(params.redraw);
  gui.addColor(params, "color").onChange(params.redraw);
  gui.add(params, "sizeAttenuation").onChange(params.redraw);
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
