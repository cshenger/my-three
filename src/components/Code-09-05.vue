<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

let container, camera, scene, renderer, stats, clock, controls, trackballControls, plane, params, operations;
let mesh, mixer;
// const radius = 600;
// let theta = 0;
// let prevTime = Date.now();
let animationClip, clipAction;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container);

  // controls
  // controls = initControls(camera, renderer, OrbitControls);
  trackballControls = new TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // add subtle ambient lighting
  scene.add(new THREE.AmbientLight(0x0c0c0c));

  const light1 = new THREE.DirectionalLight(0xefefff, 1.5);
  light1.position.set(1, 1, 1).normalize();
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffefef, 1.5);
  light2.position.set(-1, -1, -1).normalize();
  scene.add(light2);

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
  /*
  theta += 0.1;

  camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
  camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta));
  camera.lookAt(1, 1, 1);

  if (mixer) {
    const time = Date.now();
    mixer.update((time - prevTime) * 0.001);
    prevTime = time;
  }
  */
  let delta = clock.getDelta();
  trackballControls.update(delta);

  if (mixer && clipAction) {
    mixer.update(delta);
    params.time = mixer.time;
    params.effectiveTimeScale = clipAction.getEffectiveTimeScale();
    params.effectiveWeight = clipAction.getEffectiveWeight();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  const loader = new GLTFLoader();
  loader.load("../../public/models/gltf/Horse.glb", (gltf) => {
    mesh = gltf.scene.children[0];
    mesh.scale.set(0.2, 0.2, 0.2);

    mixer = new THREE.AnimationMixer(mesh);
    animationClip = gltf.animations[0];
    clipAction = mixer.clipAction(animationClip).setDuration(1).play();
    scene.add(mesh);
  });

  setupControls();
}

function setupControls() {
  params = {
    time: 0,
    timeScale: 1,
    repetitions: Infinity,
    stopAllAction: function () {
      mixer.stopAllAction();
    },

    // warp
    warpStartTimeScale: 1,
    warpEndTimeScale: 1,
    warpDurationInSeconds: 2,
    warp: function () {
      clipAction.warp(params.warpStartTimeScale, params.warpEndTimeScale, params.warpDurationInSeconds);
    },
    fadeDurationInSeconds: 2,
    fadeIn: function () {
      clipAction.fadeIn(params.fadeDurationInSeconds);
    },
    fadeOut: function () {
      clipAction.fadeOut(params.fadeDurationInSeconds);
    },
    effectiveWeight: 0,
    effectiveTimeScale: 0,
  };

  const gui = new GUI();
  const mixerFolder = gui.addFolder("AnimationMixer");
  mixerFolder.add(params, "time").listen();
  mixerFolder.add(params, "timeScale", 0, 5).onChange(function (timeScale) {
    mixer.timeScale = timeScale;
  });
  mixerFolder.add(params, "stopAllAction").listen();

  addClipActionFolder("AnimationAction", gui, clipAction, animationClip);

  return params;
}

/**
 * Adds a folder to the provided dat.gui to control an animation clip
 *
 * @param {*} folderName name of the folder to add
 * @param {*} gui dat.gui to add it to
 * @param {*} clipAction clipAction to control
 * @return the control object
 */
function addClipActionFolder(folderName, gui, clipAction, animationClip) {
  const actionControls = {
    keyframe: 0,
    time: 0,
    timeScale: 1,
    repetitions: Infinity,
    // warp
    warpStartTimeScale: 1,
    warpEndTimeScale: 1,
    warpDurationInSeconds: 2,
    warp: function () {
      clipAction.warp(actionControls.warpStartTimeScale, actionControls.warpEndTimeScale, actionControls.warpDurationInSeconds);
    },
    fadeDurationInSeconds: 2,
    fadeIn: function () {
      clipAction.fadeIn(actionControls.fadeDurationInSeconds);
    },
    fadeOut: function () {
      clipAction.fadeOut(actionControls.fadeDurationInSeconds);
    },
    effectiveWeight: 0,
    effectiveTimeScale: 0,
  };

  const actionFolder = gui.addFolder(folderName);
  // actionFolder.add(clipAction, "clampWhenFinished").listen();
  // actionFolder.add(clipAction, "enabled").listen();
  // actionFolder.add(clipAction, "paused").listen();
  // actionFolder.add(clipAction, "loop", { LoopRepeat: THREE.LoopRepeat, LoopOnce: THREE.LoopOnce, LoopPingPong: THREE.LoopPingPong }).onChange(function (e) {
  //   if (e == THREE.LoopOnce || e == THREE.LoopPingPong) {
  //     clipAction.reset();
  //     clipAction.repetitions = undefined;
  //     clipAction.setLoop(parseInt(e), undefined);
  //   } else {
  //     clipAction.setLoop(parseInt(e), actionControls.repetitions);
  //   }
  // });
  actionFolder
    .add(actionControls, "repetitions", 0, 100)
    .listen()
    .onChange(function (e) {
      if (clipAction.loop == THREE.LoopOnce || clipAction.loop == THREE.LoopPingPong) {
        clipAction.reset();
        clipAction.repetitions = undefined;
        clipAction.setLoop(parseInt(clipAction.loop), undefined);
      } else {
        clipAction.setLoop(parseInt(e), actionControls.repetitions);
      }
    });
  // actionFolder.add(clipAction, "time", 0, animationClip.duration, 0.001).listen();
  // actionFolder.add(clipAction, "timeScale", 0, 5, 0.1).listen();
  // actionFolder.add(clipAction, "weight", 0, 1, 0.01).listen();
  actionFolder.add(actionControls, "effectiveWeight", 0, 1, 0.01).listen();
  actionFolder.add(actionControls, "effectiveTimeScale", 0, 5, 0.01).listen();
  // actionFolder.add(clipAction, "zeroSlopeAtEnd").listen();
  // actionFolder.add(clipAction, "zeroSlopeAtStart").listen();
  // actionFolder.add(clipAction, "stop");
  // actionFolder.add(clipAction, "play");
  // actionFolder.add(clipAction, "reset");
  actionFolder.add(actionControls, "warpStartTimeScale", 0, 10, 0.01);
  actionFolder.add(actionControls, "warpEndTimeScale", 0, 10, 0.01);
  actionFolder.add(actionControls, "warpDurationInSeconds", 0, 10, 0.01);
  actionFolder.add(actionControls, "warp");
  actionFolder.add(actionControls, "fadeDurationInSeconds", 0, 10, 0.01);
  actionFolder.add(actionControls, "fadeIn");
  actionFolder.add(actionControls, "fadeOut");

  return actionControls;
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
