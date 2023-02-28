<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let step = 0.03,
  sphere,
  cube,
  group,
  bboxMesh,
  arrow;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(30, 30, 30));
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
  plane = addGroundPlane(scene);
  scene.add(plane);

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
  if (params.grouping && params.rotate) {
    group.rotation.y += step;
  }

  if (params.rotate && !params.grouping) {
    sphere.rotation.y += step;
    cube.rotation.y += step;
  }
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
    this.cubePosX = 0;
    this.cubePosY = 3;
    this.cubePosZ = 10;

    this.spherePosX = 10;
    this.spherePosY = 5;
    this.spherePosZ = 0;

    this.groupPosX = 10;
    this.groupPosY = 5;
    this.groupPosZ = 0;

    this.grouping = false;
    this.rotate = false;

    this.groupScale = 1;
    this.cubeScale = 1;
    this.sphereScale = 1;

    this.redraw = () => {
      // remove the old plane
      scene.remove(group);

      // create a new one
      sphere = createMesh(new THREE.SphereGeometry(5, 10, 10));
      cube = createMesh(new THREE.BoxGeometry(6, 6, 6));

      sphere.position.set(params.spherePosX, params.spherePosY, params.spherePosZ);
      sphere.scale.set(params.sphereScale, params.sphereScale, params.sphereScale);
      cube.position.set(params.cubePosX, params.cubePosY, params.cubePosZ);
      cube.scale.set(params.cubeScale, params.cubeScale, params.cubeScale);

      // also create a group, only used for rotating
      group = new THREE.Group();
      group.position.set(params.groupPosX, params.groupPosY, params.groupPosZ);
      group.scale.set(params.groupScale, params.groupScale, params.groupScale);
      group.add(sphere);
      group.add(cube);

      scene.add(group);
      params.positionBoundingBox();

      if (arrow) scene.remove(arrow);
      arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), group.position, 10, 0x0000ff);
      scene.add(arrow);
    };

    this.positionBoundingBox = () => {
      scene.remove(bboxMesh);
      let box = setFromObject(group);
      let width = box.max.x - box.min.x;
      let height = box.max.y - box.min.y;
      let depth = box.max.z - box.min.z;

      let bbox = new THREE.BoxGeometry(width, height, depth);
      bboxMesh = new THREE.Mesh(
        bbox,
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          vertexColors: THREE.VertexColors,
          wireframeLinewidth: 2,
          wireframe: true,
        })
      );

      // scene.add(bboxMesh);
      bboxMesh.position.x = (box.min.x + box.max.x) / 2;
      bboxMesh.position.y = (box.min.y + box.max.y) / 2;
      bboxMesh.position.z = (box.min.z + box.max.z) / 2;
    };
  })();

  const gui = new GUI();
  let sphereFolder = gui.addFolder("sphere");
  sphereFolder.add(params, "spherePosX", -20, 20).onChange((e) => {
    sphere.position.x = e;
    params.positionBoundingBox();
    params.redraw();
  });
  sphereFolder.add(params, "spherePosZ", -20, 20).onChange((e) => {
    sphere.position.z = e;
    params.positionBoundingBox();
    params.redraw();
  });
  sphereFolder.add(params, "spherePosY", -20, 20).onChange((e) => {
    sphere.position.y = e;
    params.positionBoundingBox();
    params.redraw();
  });
  sphereFolder.add(params, "sphereScale", 0, 3).onChange((e) => {
    sphere.scale.set(e, e, e);
    params.positionBoundingBox();
    params.redraw();
  });

  let cubeFolder = gui.addFolder("cube");
  cubeFolder.add(params, "cubePosX", -20, 20).onChange((e) => {
    cube.position.x = e;
    params.positionBoundingBox();
    params.redraw();
  });
  cubeFolder.add(params, "cubePosZ", -20, 20).onChange((e) => {
    cube.position.z = e;
    params.positionBoundingBox();
    params.redraw();
  });
  cubeFolder.add(params, "cubePosY", -20, 20).onChange((e) => {
    cube.position.y = e;
    params.positionBoundingBox();
    params.redraw();
  });
  cubeFolder.add(params, "cubeScale", 0, 3).onChange((e) => {
    cube.scale.set(e, e, e);
    params.positionBoundingBox();
    params.redraw();
  });

  let gropuFolder = gui.addFolder("group");
  gropuFolder.add(params, "groupPosX", -20, 20).onChange((e) => {
    group.position.x = e;
    params.positionBoundingBox();
    params.redraw();
  });
  gropuFolder.add(params, "groupPosZ", -20, 20).onChange((e) => {
    group.position.z = e;
    params.positionBoundingBox();
    params.redraw();
  });
  gropuFolder.add(params, "groupPosY", -20, 20).onChange((e) => {
    group.position.y = e;
    params.positionBoundingBox();
    params.redraw();
  });
  gropuFolder.add(params, "groupScale", 0, 3).onChange((e) => {
    group.scale.set(e, e, e);
    params.positionBoundingBox();
    params.redraw();
  });

  gui.add(params, "grouping");
  gui.add(params, "rotate");
  params.redraw();

  return params;
}

function createMesh(geom) {
  // assign two materials
  let meshMaterial = new THREE.MeshNormalMaterial();
  meshMaterial.side = THREE.DoubleSide;

  // create a multimaterial
  let plane = new THREE.Mesh(geom, meshMaterial);

  return plane;
}

// http://jsfiddle.net/MREL4/
function setFromObject(object) {
  let box = new THREE.Box3();
  let v1 = new THREE.Vector3();
  object.updateMatrixWorld(true);
  box.makeEmpty();
  object.traverse((node) => {
    if (node.geometry !== undefined && node.geometry.vertices !== undefined) {
      let vertices = node.geometry.vertices;
      for (let i = 0, il = vertices.length; i < il; i++) {
        v1.copy(vertices[i]);
        v1.applyMatrix4(node.matrixWorld);
        box.expandByPoint(v1);
      }
    }
  });
  return box;
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
