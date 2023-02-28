<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane;
let params, operations, trackballControls, hemiLight;

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
  // controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

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

  // add spotlight for a bit of light
  const spotLight0 = new THREE.SpotLight(0xcccccc);
  spotLight0.position.set(-40, 60, -10);
  spotLight0.lookAt(plane);
  scene.add(spotLight0);

  const target = new THREE.Object3D();
  target.position.set(new THREE.Vector3(5, 0, 0));

  hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
  hemiLight.position.set(0, 500, 0);
  scene.add(hemiLight);

  const pointColor = "#ffffff";
  const dirLight = new THREE.DirectionalLight(pointColor);
  dirLight.position.set(30, 10, -50);
  dirLight.castShadow = true;
  dirLight.target = plane;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  // call the render function
  let step = 0;
  operations = setupControls();

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
    this.hemisphere = true;
    this.color = 0x0000ff;
    this.groundColor = 0x00ff00;
    this.intensity = 0.6;
  })();

  const gui = new GUI();

  gui.add(params, "hemisphere").onChange(function (e) {
    if (!e) {
      hemiLight.intensity = 0;
    } else {
      hemiLight.intensity = params.intensity;
    }
  });
  gui.addColor(params, "groundColor").onChange(function (e) {
    hemiLight.groundColor = new THREE.Color(e);
  });
  gui.addColor(params, "color").onChange(function (e) {
    hemiLight.color = new THREE.Color(e);
  });
  gui.add(params, "intensity", 0, 5).onChange(function (e) {
    hemiLight.intensity = e;
  });

  return params;
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
