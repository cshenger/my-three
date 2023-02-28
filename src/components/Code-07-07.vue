<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "../../node_modules/three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initCameraPos, initControls, addGroundPlane, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls, cameraOrtho;

let step = 0;
const sceneOrtho = new THREE.Scene();
const getTexture = () => {
  const texture = new THREE.TextureLoader().load("../../public/textures/particles/sprite-sheet.png");
  return texture;
};

function createSprite(size, transparent, opacity, color, spriteNumber) {
  let spriteMaterial = new THREE.SpriteMaterial({
    opacity: opacity,
    color: color,
    transparent: transparent,
    map: getTexture(),
  });

  // we have 1 row, with five sprites
  spriteMaterial.map.offset = new THREE.Vector2(0.8 * spriteNumber, 0);
  spriteMaterial.map.repeat = new THREE.Vector2(1 / 5, 1);
  spriteMaterial.blending = THREE.AdditiveBlending;
  // make sure the object is always rendered at the front
  spriteMaterial.depthTest = false;

  let sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(size, size, size);
  sprite.position.set(100, 50, -10);
  sprite.velocityX = 5;

  sceneOrtho.add(sprite);
}

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(0, 0, 50));
  cameraOrtho = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10, 10);
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
  renderer.autoClear = false;
  renderer.render(sceneOrtho, cameraOrtho);
}

function animate() {
  camera.position.y = Math.sin((step += 0.01)) * 20;

  sceneOrtho.children.forEach((e) => {
    if (e instanceof THREE.Sprite) {
      // move the sprite along the bottom
      e.position.x = e.position.x + e.velocityX;
      if (e.position.x > window.innerWidth) {
        e.velocityX = -5;
        params.sprite += 1;
        e.material.map.offset.set((1 / 5) * (params.sprite % 4), 0);
      }
      if (e.position.x < 0) {
        e.velocityX = 5;
      }
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
  const material = new THREE.MeshNormalMaterial();
  const geom = new THREE.SphereGeometry(15, 20, 20);
  const mesh = new THREE.Mesh(geom, material);
  scene.add(mesh);

  setupControls();
}

function setupControls() {
  params = new (function () {
    this.size = 150;
    this.sprite = 0;
    this.transparent = true;
    this.opacity = 0.6;
    this.color = 0xffffff;
    this.rotateSystem = true;

    this.redraw = () => {
      sceneOrtho.children.forEach((child) => {
        if (child instanceof THREE.Sprite) sceneOrtho.remove(child);
      });
      createSprite(params.size, params.transparent, params.opacity, params.color, params.sprite);
    };
  })();

  const gui = new GUI();
  gui.add(params, "sprite", 0, 4).step(1).onChange(params.redraw);
  gui.add(params, "size", 0, 120).onChange(params.redraw);
  gui.add(params, "transparent").onChange(params.redraw);
  gui.add(params, "opacity", 0, 1).onChange(params.redraw);
  gui.addColor(params, "color").onChange(params.redraw);
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
