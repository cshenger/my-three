<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let step = 0,
  rotation = 0;

let cubeMaterial = new THREE.MeshNormalMaterial({
  transparent: true,
  opacity: 0.5,
});

function addcube() {
  let cubeSize = 1.0;
  let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;

  // position the cube randomly in the scene
  cube.position.x = -60 + Math.round(Math.random() * 100);
  cube.position.y = Math.round(Math.random() * 10);
  cube.position.z = -150 + Math.round(Math.random() * 175);

  // add the cube to the scene
  return cube;
}

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(30, 30, 30));
  camera.lookAt(scene.position);
  // clock = new THREE.Clock();
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
  rotation += 0.005;

  camera.position.x = Math.sin(rotation) * 50;
  // camera.position.y = Math.sin(rotation) * 40;
  camera.position.z = Math.cos(rotation) * 50;
  camera.lookAt(scene.position);
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
    this.cameraNear = camera.near;
    this.cameraFar = camera.far;
    this.rotationSpeed = 0.02;
    this.combined = false;

    this.numberOfObjects = 500;

    this.redraw = () => {
      let toRemove = [];
      scene.traverse((e) => {
        if (e instanceof THREE.Mesh) toRemove.push(e);
      });
      toRemove.forEach((e) => {
        scene.remove(e);
      });

      // add a large number of cubes
      const geos = [];
      if (params.combined) {
        for (let i = 0; i < params.numberOfObjects; i++) {
          let cubeMesh = addcube();
          cubeMesh.updateMatrix(); // 更新投影矩阵，不更新各mesh位置会不正确
          // 更新后的矩阵，重新转换为几何体，此时，几何体位置才正确
          const newGeometry = cubeMesh.geometry.applyMatrix4(cubeMesh.matrix);
          geos.push(newGeometry);
        }
        const bufferGeometry = mergeBufferGeometries(geos);
        scene.add(new THREE.Mesh(bufferGeometry, cubeMaterial));
      } else {
        for (let i = 0; i < params.numberOfObjects; i++) {
          scene.add(params.addCube());
        }
      }
      this.outputObjects();
    };

    this.addCube = addcube;

    this.outputObjects = () => {
      console.log(scene.children);
    };
  })();

  const gui = new GUI();
  gui.add(params, "numberOfObjects", 0, 20000);
  gui.add(params, "combined").onChange(params.redraw);
  gui.add(params, "redraw");

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
