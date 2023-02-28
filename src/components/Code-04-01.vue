<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";
import { createMultiMaterialObject } from "../../node_modules/three/examples/jsm/utils/SceneUtils";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  // camera = initCamera(scene);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 50, 110);
  camera.position.set(-50, 40, 50);
  camera.lookAt(scene.position);
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
  // const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  // scene.add(ambientLight);

  // add spotlight for the shadows
  // const spotLight = new THREE.SpotLight(0xffffff);
  // spotLight.position.set(-40, 60, -10);
  // spotLight.castShadow = true;
  // scene.add(spotLight);

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
  // rotate the cubes around its axes
  scene.traverse((e) => {
    if (e instanceof THREE.Group) {
      e.rotation.x += params.rotationSpeed;
      e.rotation.y += params.rotationSpeed;
      e.rotation.z += params.rotationSpeed;
    }
  });
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
    this.numberOfObjects = scene.children.length;
    this.color = 0x00ff00;

    this.removeCube = () => {
      let allChildren = scene.children;
      let lastObject = allChildren[allChildren.length - 1];
      if (lastObject instanceof THREE.Group) {
        scene.remove(lastObject);
        this.numberOfObjects = scene.children.length;
      }
    };

    this.addCube = () => {
      let cubeSize = Math.ceil(3 + Math.random() * 3);
      let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

      //let cubeMaterial = new THREE.MeshLambertMaterial({color:  Math.random() * 0xffffff });
      let cubeMaterial = new THREE.MeshDepthMaterial();
      let colorMaterial = new THREE.MeshBasicMaterial({
        color: params.color,
        transparent: true,
        blending: THREE.MultiplyBlending,
      });
      let cube = new createMultiMaterialObject(cubeGeometry, [colorMaterial, cubeMaterial]);
      cube.children[1].scale.set(0.99, 0.99, 0.99);
      cube.castShadow = true;

      // position the cube randomly in the scene
      cube.position.x = -60 + Math.round(Math.random() * 100);
      cube.position.y = Math.round(Math.random() * 10);
      cube.position.z = -100 + Math.round(Math.random() * 150);

      // add the cube to the scene
      scene.add(cube);
      this.numberOfObjects = scene.children.length;
    };

    this.outputObjects = () => {
      console.log(scene.children);
    };
  })();

  const gui = new GUI();
  gui.addColor(params, "color");
  gui.add(params, "rotationSpeed", 0, 0.5);
  gui.add(params, "addCube");
  gui.add(params, "removeCube");
  gui.add(params, "cameraNear", 0, 50).onChange((e) => {
    camera.near = e;
    camera.updateProjectionMatrix();
  });
  gui.add(params, "cameraFar", 50, 200).onChange((e) => {
    camera.far = e;
    camera.updateProjectionMatrix();
  });

  let i = 0;
  while (i < 10) {
    params.addCube();
    i++;
  }

  render();

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
