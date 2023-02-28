<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations;
let parent_node;

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
  const time = Date.now() * 0.001;
  parent_node.rotation.z = time * 0.5;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ vertexColors: true });
  const indices = [];
  const positions = [];
  const colors = [];
  let next_positions_index = 0;
  const iteration_count = 4;
  const rangle = (60 * Math.PI) / 180.0;

  function add_vertex(v) {
    if (next_positions_index == 0xffff) console.error("Too many points.");

    positions.push(v.x, v.y, v.z);
    colors.push(Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1);

    return next_positions_index++;
  }

  function snowflake_iteration(p0, p4, depth) {
    if (--depth < 0) {
      const i = next_positions_index - 1; // p0 already there
      add_vertex(p4);
      indices.push(i, i + 1);

      return;
    }

    const v = p4.clone().sub(p0);
    const v_tier = v.clone().multiplyScalar(1 / 3);
    const p1 = p0.clone().add(v_tier);

    const angle = Math.atan2(v.y, v.x) + rangle;
    const length = v_tier.length();
    const p2 = p1.clone();
    p2.x += Math.cos(angle) * length;
    p2.y += Math.sin(angle) * length;

    const p3 = p0.clone().add(v_tier).add(v_tier);

    snowflake_iteration(p0, p1, depth);
    snowflake_iteration(p1, p2, depth);
    snowflake_iteration(p2, p3, depth);
    snowflake_iteration(p3, p4, depth);
  }

  function snowflake(points, loop, x_offset) {
    for (let iteration = 0; iteration != iteration_count; iteration++) {
      add_vertex(points[0]);

      for (let p_index = 0, p_count = points.length - 1; p_index != p_count; p_index++) {
        snowflake_iteration(points[p_index], points[p_index + 1], iteration);
      }

      if (loop) snowflake_iteration(points[points.length - 1], points[0], iteration);

      // translate input curve for next iteration

      for (let p_index = 0, p_count = points.length; p_index != p_count; p_index++) {
        points[p_index].x += x_offset;
      }
    }
  }

  let y = 0;

  snowflake([new THREE.Vector3(0, y, 0), new THREE.Vector3(500, y, 0)], false, 600);

  y += 600;
  snowflake([new THREE.Vector3(0, y, 0), new THREE.Vector3(250, y + 400, 0), new THREE.Vector3(500, y, 0)], true, 600);

  y += 600;
  snowflake([new THREE.Vector3(0, y, 0), new THREE.Vector3(500, y, 0), new THREE.Vector3(500, y + 500, 0), new THREE.Vector3(0, y + 500, 0)], true, 600);

  y += 1000;
  snowflake([new THREE.Vector3(250, y, 0), new THREE.Vector3(500, y, 0), new THREE.Vector3(250, y, 0), new THREE.Vector3(250, y + 250, 0), new THREE.Vector3(250, y, 0), new THREE.Vector3(0, y, 0), new THREE.Vector3(250, y, 0), new THREE.Vector3(250, y - 250, 0), new THREE.Vector3(250, y, 0)], false, 600);

  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  const lineSegments = new THREE.LineSegments(geometry, material);
  lineSegments.position.x -= 1200;
  lineSegments.position.y -= 1200;

  parent_node = new THREE.Object3D();
  parent_node.add(lineSegments);

  scene.add(parent_node);

  setupControls();
}

function setupControls() {
  params = new (function () {})();

  const gui = new GUI();

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
