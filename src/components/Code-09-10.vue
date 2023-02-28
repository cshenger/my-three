<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, initDefaultLighting } from "./utils.js";
import { MD2Loader } from "../../node_modules/three/examples/jsm/loaders/MD2Loader.js";

let container, camera, scene, renderer, stats, clock, controls, trackballControls, plane, params, operations;
let model, skeleton, mixer;
let clipAction1;
let clipAction2;
let clipAction3;
let animationClip1;
let animationClip2;
let animationClip3;
let selectedClipAction;
const mixerControls = {
  time: 0,
  timeScale: 1,
  stopAllAction: function () {
    mixer.stopAllAction();
  },
};

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
  scene.add(new THREE.AmbientLight(0x333333));
  initDefaultLighting(scene);

  // clock
  clock = new THREE.Clock();

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
  const delta = clock.getDelta(); // 获取自上次调用的时间差

  if (mixer) {
    mixer.update(delta);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  const textureLoader = new THREE.TextureLoader();
  const loader = new MD2Loader();
  loader.load("../../public/models/ogre/ogro.md2", (result) => {
    const mat = new THREE.MeshStandardMaterial({ morphTargets: true, color: 0xffffff, metalness: 0, map: textureLoader.load("../../public/models/ogre/skins/skin.jpg") });
    model = new THREE.Mesh(result, mat);
    scene.add(model);

    // setup the mixer
    mixer = new THREE.AnimationMixer(model);
    animationClip1 = result.animations[7];
    clipAction1 = mixer.clipAction(animationClip1);
    animationClip2 = result.animations[9];
    clipAction2 = mixer.clipAction(animationClip2);
    animationClip3 = result.animations[10];
    clipAction3 = mixer.clipAction(animationClip3).play();

    setupControls(result);
  });
}

function setupControls(geometry) {
  params = {
    showHelper: false,
  };

  const gui = new GUI();
  // gui.add(params, "showHelper").onChange(function (e) {
  //   if (e) {
  //     skeleton = new THREE.SkeletonHelper(model);
  //     skeleton.material.linewidth = 2;
  //     scene.add(skeleton);
  //   } else {
  //     if (skeleton) {
  //       scene.remove(skeleton);
  //     }
  //   }
  // });

  const mixerFolder = gui.addFolder("AnimationMixer");
  mixerFolder.add(mixerControls, "time").listen();
  mixerFolder.add(mixerControls, "timeScale", 0, 5).onChange(function (timeScale) {
    mixer.timeScale = timeScale;
  });
  mixerFolder.add(mixerControls, "stopAllAction").listen();

  const animationsArray = geometry.animations.map(function (e) {
    return e.name;
  });
  animationsArray.push("none");
  const animationMap = geometry.animations.reduce(
    function (res, el) {
      res[el.name] = el;
      return res;
    },
    { none: undefined }
  );

  gui.add({ animation: "none" }, "animation", animationsArray).onChange(function (selection) {
    clipAction1.stop();
    clipAction2.stop();
    clipAction3.stop();

    if (selectedClipAction) selectedClipAction.stop();
    if (selection != "none") {
      selectedClipAction = mixer.clipAction(animationMap[selection]).play();
    }
  });

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
