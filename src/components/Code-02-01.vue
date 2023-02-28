<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let container, camera, scene, renderer, stats, controls, clock;
let mesh;

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500);
  camera.position.z = 64;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight();
  scene.add(light);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.minDistance = 10;
  controls.maxDistance = 100;
  controls.enablePan = false;

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

  // clock
  clock = new THREE.Clock();

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  const time = Date.now() * 0.001;

  mesh.rotation.x = time * 0.25;
  mesh.rotation.y = time * 0.5;

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  controls.update(clock.getDelta());

  requestAnimationFrame(animate);
  render();
  stats.update();
}

// createCorps
function createCorps() {
  const geometry = new THREE.BufferGeometry();

  const indices = [];

  const vertices = [];
  const normals = [];
  const colors = [];

  const size = 20;
  const segments = 10;

  const halfSize = size / 2;
  const segmentSize = size / segments;

  // generate vertices, normals and color data for a simple grid geometry
  for (let i = 0; i <= segments; i++) {
    const y = i * segmentSize - halfSize;

    for (let j = 0; j <= segments; j++) {
      const x = j * segmentSize - halfSize;

      vertices.push(x, -y, 0);
      normals.push(0, 0, 1);

      const r = x / size + 0.5;
      const g = y / size + 0.5;

      colors.push(r, g, 1);
    }
  }

  // generate indices (data for element array buffer)
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + (j + 1);
      const b = i * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + j;
      const d = (i + 1) * (segments + 1) + (j + 1);

      // generate two faces (triangles) per iteration

      indices.push(a, b, d); // face one
      indices.push(b, c, d); // face two
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    vertexColors: true,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const gui = new GUI();
  gui.add(material, "wireframe");
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
