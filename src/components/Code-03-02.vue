<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, addDefaultCubeAndSphere } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane;
let params, ambientLight, spotLight;
let ambiColor, spotLight0, target, debugCamera, pp, sphereLightMesh, step, invert, phase, operations;

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
  plane = addGroundPlane(scene);

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
  let cubeAndSphere = addDefaultCubeAndSphere(scene);
  let cube = cubeAndSphere.cube;
  let sphere = cubeAndSphere.sphere;

  // add subtle ambient lighting
  ambiColor = "#1c1c1c";
  ambientLight = new THREE.AmbientLight(ambiColor);
  scene.add(ambientLight);

  // add spotlight for a bit of light
  spotLight0 = new THREE.SpotLight(0xcccccc);
  spotLight0.position.set(-40, 30, -10);
  spotLight0.lookAt(plane);
  scene.add(spotLight0);

  target = new THREE.Object3D();
  target.position.set(new THREE.Vector3(5, 0, 0));

  spotLight = new THREE.SpotLight("#ffffff");
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 100;
  spotLight.target = plane;
  spotLight.distance = 0;
  spotLight.angle = 0.4;
  spotLight.shadow.camera.fov = 120;
  scene.add(spotLight);
  debugCamera = new THREE.CameraHelper(spotLight.shadow.camera);

  pp = new THREE.SpotLightHelper(spotLight);
  scene.add(pp);

  // add a small sphere simulating the pointlight
  const sphereLight = new THREE.SphereGeometry(0.2);
  const sphereLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xac6c25,
  });
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
  sphereLightMesh.castShadow = true;
  sphereLightMesh.position.set(new THREE.Vector3(3, 20, 3));
  scene.add(sphereLightMesh);

  // for controlling the rendering
  step = 0;
  invert = 1;
  phase = 0;

  operations = setupControls();
  render();

  function render() {
    stats.update();
    // rotate the cube around its axes
    cube.rotation.x += operations.rotationSpeed;
    cube.rotation.y += operations.rotationSpeed;
    cube.rotation.z += operations.rotationSpeed;

    // bounce the sphere up and down
    step += operations.bouncingSpeed;
    sphere.position.x = 20 + 10 * Math.cos(step);
    sphere.position.y = 2 + 10 * Math.abs(Math.sin(step));

    // move the light simulation
    if (!operations.stopMovingLight) {
      if (phase > 2 * Math.PI) {
        invert = invert * -1;
        phase -= 2 * Math.PI;
      } else {
        phase += operations.rotationSpeed;
      }
      sphereLightMesh.position.z = +(7 * Math.sin(phase));
      sphereLightMesh.position.x = +(14 * Math.cos(phase));
      sphereLightMesh.position.y = 15;

      if (invert < 0) {
        var pivot = 14;
        sphereLightMesh.position.x = invert * (sphereLightMesh.position.x - pivot) + pivot;
      }

      spotLight.position.copy(sphereLightMesh.position);
    }

    pp.update();
    // render using requestAnimationFrame
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  // params = new (function () {})();
  // const gui = new GUI();
}

function setupControls() {
  params = new (function () {
    this.rotationSpeed = 0.03;
    this.bouncingSpeed = 0.03;
    this.ambientColor = ambiColor;
    this.pointColor = spotLight.color.getStyle();
    this.intensity = 1;
    this.distance = 0;
    this.angle = 0.1;
    this.shadowDebug = false;
    this.castShadow = true;
    this.target = "Plane";
    this.stopMovingLight = false;
    this.penumbra = 0;
  })();

  const gui = new GUI();
  gui.addColor(params, "ambientColor").onChange(function (e) {
    ambientLight.color = new THREE.Color(e);
  });

  gui.addColor(params, "pointColor").onChange(function (e) {
    spotLight.color = new THREE.Color(e);
  });

  gui.add(params, "angle", 0, Math.PI * 2).onChange(function (e) {
    spotLight.angle = e;
  });

  gui.add(params, "intensity", 0, 5).onChange(function (e) {
    spotLight.intensity = e;
  });

  gui.add(params, "penumbra", 0, 1).onChange(function (e) {
    spotLight.penumbra = e;
  });

  gui.add(params, "distance", 0, 200).onChange(function (e) {
    spotLight.distance = e;
  });

  gui.add(params, "shadowDebug").onChange(function (e) {
    if (e) {
      scene.add(debugCamera);
    } else {
      scene.remove(debugCamera);
    }
  });

  gui.add(params, "castShadow").onChange(function (e) {
    spotLight.castShadow = e;
  });

  gui.add(params, "target", ["Plane", "Sphere", "Cube"]).onChange(function (e) {
    switch (e) {
      case "Plane":
        spotLight.target = plane;
        break;
      case "Sphere":
        spotLight.target = sphere;
        break;
      case "Cube":
        spotLight.target = cube;
        break;
    }
  });

  gui.add(params, "stopMovingLight").onChange(function (e) {
    stopMovingLight = e;
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
