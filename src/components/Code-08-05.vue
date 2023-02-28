<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { PDBLoader } from "three/examples/jsm/loaders/PDBLoader";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, labelRenderer;
let step = 0,
  group;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  //创建相机对象
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 1000;
  scene.add(camera);
  // clock = new THREE.Clock();
  renderer = initRenderer(container);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";
  document.getElementById("container").appendChild(labelRenderer.domElement);

  // controls
  controls = new TrackballControls(camera, renderer.domElement);
  controls.minDistance = 500;
  controls.maxDistance = 2000;
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x343434);
  scene.add(ambientLight);

  const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(-1, -1, 1);
  scene.add(light2);

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
  controls.update();
  const time = Date.now() * 0.0004;
  group.rotation.x = time;
  group.rotation.y = time * 0.7;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  const loader = new PDBLoader();
  const offset = new THREE.Vector3();
  group = new THREE.Object3D();
  scene.add(group);

  loader.load("../../public/models/molecules/7kmb.pdb", (pdb) => {
    console.log(pdb);
    const geometryAtoms = pdb.geometryAtoms;
    const geometryBonds = pdb.geometryBonds;
    const json = pdb.json;
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const sphereGeometry = new THREE.IcosahedronGeometry(1, 3);

    geometryAtoms.computeBoundingBox();
    geometryAtoms.boundingBox.getCenter(offset).negate();

    geometryAtoms.translate(offset.x, offset.y, offset.z);
    geometryBonds.translate(offset.x, offset.y, offset.z);

    let positions = geometryAtoms.getAttribute("position");
    const colors = geometryAtoms.getAttribute("color");

    const position = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0; i < positions.count; i++) {
      position.x = positions.getX(i);
      position.y = positions.getY(i);
      position.z = positions.getZ(i);

      color.r = colors.getX(i);
      color.g = colors.getY(i);
      color.b = colors.getZ(i);

      const material = new THREE.MeshPhongMaterial({ color: color });

      const object = new THREE.Mesh(sphereGeometry, material);
      object.position.copy(position);
      object.position.multiplyScalar(75);
      object.scale.multiplyScalar(25);
      group.add(object);

      const atom = json.atoms[i];

      const text = document.createElement("div");
      text.className = "label";
      text.style.color = "rgb(" + atom[3][0] + "," + atom[3][1] + "," + atom[3][2] + ")";
      text.textContent = atom[4];

      const label = new CSS2DObject(text);
      label.position.copy(object.position);
      group.add(label);
    }

    positions = geometryBonds.getAttribute("position");

    const start = new THREE.Vector3();
    const end = new THREE.Vector3();

    for (let i = 0; i < positions.count; i += 2) {
      start.x = positions.getX(i);
      start.y = positions.getY(i);
      start.z = positions.getZ(i);

      end.x = positions.getX(i + 1);
      end.y = positions.getY(i + 1);
      end.z = positions.getZ(i + 1);

      start.multiplyScalar(75);
      end.multiplyScalar(75);

      const object = new THREE.Mesh(boxGeometry, new THREE.MeshPhongMaterial(0xffffff));
      object.position.copy(start);
      object.position.lerp(end, 0.5);
      object.scale.set(5, 5, start.distanceTo(end));
      object.lookAt(end);
      group.add(object);
    }
  });

  setupControls();
}

function setupControls() {
  const gui = new GUI();

  // params.redraw();

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
