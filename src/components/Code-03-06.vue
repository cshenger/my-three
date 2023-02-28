<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls } from "./utils.js";
import { LensflareElement, Lensflare } from "../../node_modules/three/examples/jsm/objects/Lensflare";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let ambiColor, ambientLight, pointColor, spotLight;

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

  // create the ground plane
  // plane = addGroundPlane(scene);

  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  clock = new THREE.Clock();

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  stats.update();
  trackballControls.update(clock.getDelta());

  // animate();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function animate() {}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  const textureGrass = new THREE.TextureLoader().load("../../public/textures/ground/grasslight-big.jpg");
  textureGrass.wrapS = THREE.RepeatWrapping;
  textureGrass.wrapT = THREE.RepeatWrapping;
  textureGrass.repeat.set(10, 10);

  const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 20, 20);
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: textureGrass,
  });
  // var planeMaterial = new THREE.MeshLambertMaterial();
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 15;
  plane.position.y = 0;
  plane.position.z = 0;
  // add the plane to the scene
  scene.add(plane);

  // create a cube
  const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xff3333,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  // position the cube
  cube.position.x = -4;
  cube.position.y = 3;
  cube.position.z = 0;
  // add the cube to the scene
  scene.add(cube);

  const sphereGeometry = new THREE.SphereGeometry(4, 25, 25);
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x7777ff,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // position the sphere
  sphere.position.x = 10;
  sphere.position.y = 5;
  sphere.position.z = 10;
  sphere.castShadow = true;
  // add the sphere to the scene
  scene.add(sphere);

  // add subtle ambient lighting
  ambiColor = "#1c1c1c";
  ambientLight = new THREE.AmbientLight(ambiColor);
  scene.add(ambientLight);

  // add spotlight for a bit of light
  const spotLight0 = new THREE.SpotLight(0xcccccc);
  spotLight0.position.set(-40, 60, -10);
  spotLight0.lookAt(plane);
  scene.add(spotLight0);

  const target = new THREE.Object3D();
  target.position.set(new THREE.Vector3(5, 0, 0));

  pointColor = "#ffffff";
  //    var spotLight = new THREE.SpotLight( pointColor);
  spotLight = new THREE.DirectionalLight(pointColor);
  spotLight.position.set(30, 10, -50);
  spotLight.castShadow = true;
  spotLight.shadowCameraNear = 0.1;
  spotLight.shadowCameraFar = 100;
  spotLight.shadowCameraFov = 50;
  spotLight.target = plane;
  spotLight.distance = 0;
  spotLight.shadowCameraNear = 2;
  spotLight.shadowCameraFar = 200;
  spotLight.shadowCameraLeft = -100;
  spotLight.shadowCameraRight = 100;
  spotLight.shadowCameraTop = 100;
  spotLight.shadowCameraBottom = -100;
  spotLight.shadowMapWidth = 2048;
  spotLight.shadowMapHeight = 2048;
  scene.add(spotLight);

  // call the render function
  let step = 0;
  operations = setupControls();

  let textureFlare0 = new THREE.TextureLoader().load("../../public/textures/flares/lensflare0.png");
  let textureFlare3 = new THREE.TextureLoader().load("../../public/textures/flares/lensflare3.png");
  let flareColor = new THREE.Color(0xffaacc);
  let lensFlare = new Lensflare();

  lensFlare.addElement(new LensflareElement(textureFlare0, 350, 0.0, flareColor));
  lensFlare.addElement(new LensflareElement(textureFlare3, 60, 0.6, flareColor));
  lensFlare.addElement(new LensflareElement(textureFlare3, 70, 0.7, flareColor));
  lensFlare.addElement(new LensflareElement(textureFlare3, 120, 0.9, flareColor));
  lensFlare.addElement(new LensflareElement(textureFlare3, 70, 1.0, flareColor));
  spotLight.add(lensFlare);

  render();
  function render() {
    stats.update();
    trackballControls.update(clock.getDelta());
    // rotate the cube around its axes
    cube.rotation.x += operations.rotationSpeed;
    cube.rotation.y += operations.rotationSpeed;
    cube.rotation.z += operations.rotationSpeed;

    // bounce the sphere up and down
    step += operations.bouncingSpeed;
    sphere.position.x = 20 + 10 * Math.cos(step);
    sphere.position.y = 2 + 10 * Math.abs(Math.sin(step));

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function setupControls() {
  params = new (function () {
    this.rotationSpeed = 0.03;
    this.bouncingSpeed = 0.03;
    this.ambientColor = ambiColor;
    this.pointColor = pointColor;
    this.intensity = 0.1;
    this.distance = 0;
    this.exponent = 30;
    this.angle = 0.1;
    this.debug = false;
    this.castShadow = true;
    this.onlyShadow = false;
    this.target = "Plane";
  })();

  const gui = new GUI();

  gui.addColor(params, "ambientColor").onChange(function (e) {
    ambientLight.color = new THREE.Color(e);
  });
  gui.addColor(params, "pointColor").onChange(function (e) {
    spotLight.color = new THREE.Color(e);
  });
  gui.add(params, "intensity", 0, 5).onChange(function (e) {
    spotLight.intensity = e;
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
