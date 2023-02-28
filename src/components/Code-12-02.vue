<script setup>
import { onMounted, nextTick } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls } from "./utils.js";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

let container, camera, scene, renderer, stats, controls, clock, params, gui, operations, trackballControls;
let world, defaultMaterial, floorMaterial, wallMaterial;
let oldElapsedTime = 0;
let stoneObjects = [];
let cannonDebugger,
  cannonMeshes = [];

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(10, 10, 60));
  renderer = initRenderer(container);

  // controls
  controls = initControls(camera, renderer, OrbitControls);
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  //Light
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);
  const dLight = new THREE.DirectionalLight(0xffffff, 1);
  dLight.position.set(0, 100, 85);
  dLight.castShadow = true;
  dLight.shadow.camera.near = 0.1;
  dLight.shadow.camera.far = 200;
  dLight.shadow.camera.left = -50;
  dLight.shadow.camera.right = 50;
  dLight.shadow.camera.top = 50;
  dLight.shadow.camera.bottom = -50;
  dLight.shadow.mapSize.width = 2048;
  dLight.shadow.mapSize.height = 2048;
  scene.add(dLight);
  // 初始化聚光源
  // const spotLight = new THREE.SpotLight(0x999999);
  // spotLight.position.set(-10, 30, 20); // 设置聚光源的位置
  // spotLight.castShadow = true; // 开启聚光源投射阴影
  // // spotLight.distance = 1000000000
  // scene.add(spotLight);

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
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupControls() {
  params = {
    CannonDebugger: false,
    gravityX: 0,
    gravityY: -10,
    gravityZ: 0,
  };
  gui = new GUI();
  return params;
}

// createCorps
function createCorps() {
  setupControls();
  initGrAvity();

  // cannonDebugger
  cannonDebugger = CannonDebugger(scene, world, {
    onInit(body, mesh) {
      mesh.visible = false;
      cannonMeshes.push(mesh);
    },
  });
  gui
    .add(params, "CannonDebugger")
    .name("CannonDebugger mesh visible")
    .onChange((value) => {
      if (value) {
        cannonMeshes.forEach((item) => {
          item.visible = true;
        });
      } else {
        cannonMeshes.forEach((item) => {
          item.visible = false;
        });
      }
    });

  // 添加重力操作
  gui.add(params, "gravityX", -100, 100, 1).onChange((e) => {
    world.gravity.set(params.gravityX, params.gravityY, params.gravityZ);
  });
  gui.add(params, "gravityY", -100, 100, 1).onChange((e) => {
    world.gravity.set(params.gravityX, params.gravityY, params.gravityZ);
  });
  gui.add(params, "gravityZ", -100, 100, 1).onChange((e) => {
    world.gravity.set(params.gravityX, params.gravityY, params.gravityZ);
  });

  // 添加并生成骨牌
  const colors = [0x66ff00, 0x6600ff];
  let points = getPoints();
  let stWidth = 0.6;
  let stHeight = 6;
  let stDepth = 2;

  points.forEach((point, index) => {
    const stoneGeom = new THREE.BoxGeometry(stWidth, stHeight, stDepth);
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: colors[index % colors.length],
      transparent: true,
      opacity: 0.8,
    });
    const stone = new THREE.Mesh(stoneGeom, stoneMaterial);
    stone.position.copy(point);
    stone.lookAt(scene.position);
    stone.position.y = 3.5;
    stone.castShadow = true;
    stone.receiveShadow = true;
    scene.add(stone);

    const shape = new CANNON.Box(new CANNON.Vec3(stWidth / 2, stHeight / 2, stDepth / 2));
    const stoneBody = new CANNON.Body({
      mass: 1,
      shape,
      material: defaultMaterial,
    });
    stoneBody.position.copy(stone.position);
    stoneBody.quaternion.copy(stone.quaternion);
    stoneBody.sleepSpeedLimit = 0.05;
    world.addBody(stoneBody);

    stoneObjects.push({
      mesh: stone,
      body: stoneBody,
    });
  });

  // 控制第一个骨牌倒下
  params.start = () => {
    world.bodies[0].applyForce(new CANNON.Vec3(0, 0, 300), new CANNON.Vec3(0, 0, 0));
  };
  gui.add(params, "start");

  // 添加地板
  addGround(true);
}

// 动画效果
function animate() {
  const time = clock.getElapsedTime();
  let deltaTime = time - oldElapsedTime;
  oldElapsedTime = time;
  world.step(1 / 60, deltaTime, 3);
  world.fixedStep();
  cannonDebugger.update(); // Update the CannonDebugger meshes

  stoneObjects.forEach((e) => {
    e.mesh.position.copy(e.body.position);
    e.mesh.quaternion.copy(e.body.quaternion);
  });
}

function initGrAvity() {
  // Setup our world
  world = new CANNON.World();
  // world.gravity.set(0, -9.82, 0); // m/s²
  world.gravity.set(params.gravityX, params.gravityY, params.gravityZ);
  world.allowSleep = true;

  //给body的material
  defaultMaterial = new CANNON.Material("default");
  floorMaterial = new CANNON.Material("floorMaterial");
  wallMaterial = new CANNON.Material("wallMaterial");

  //给world的contactMaterial
  const defalutContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.05,
    restitution: 0.1,
  });
  const floorContactMaterial = new CANNON.ContactMaterial(floorMaterial, defaultMaterial, {
    friction: 0.9,
    restitution: 0.6,
  });
  const wallContactMaterial = new CANNON.ContactMaterial(wallMaterial, defaultMaterial, {
    friction: 0,
    restitution: 0,
  });
  world.addContactMaterial(defalutContactMaterial);
  world.addContactMaterial(floorContactMaterial);
  world.addContactMaterial(wallContactMaterial);
}

function addGround(withTexture = false) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Create a plane
  const planeG = new THREE.PlaneGeometry(100, 100);
  const planeM = new THREE.MeshStandardMaterial({ color: 0x666666 });
  if (withTexture) {
    planeM.map = textureLoader.load("../../public/textures/general/floor-wood.jpg");
    planeM.map.wrapS = THREE.RepeatWrapping;
    planeM.map.wrapT = THREE.RepeatWrapping;
    planeM.map.repeat.set(10, 10);
  }
  const plane = new THREE.Mesh(planeG, planeM);
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow = true;
  group.add(plane);

  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: floorShape,
    material: floorMaterial,
  });
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);

  // 创建围墙
  let woodMaterial = textureLoader.load("../../public/textures/general/wood-2.jpg");

  // left
  const borderLeft = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 100),
    new THREE.MeshStandardMaterial({
      color: 0x666666,
      map: woodMaterial,
    })
  );
  borderLeft.position.x = -51;
  borderLeft.position.y = 1;
  borderLeft.castShadow = true;
  borderLeft.receiveShadow = true;
  group.add(borderLeft);

  const shapeBorderLeft = new CANNON.Box(new CANNON.Vec3(1, 1.5, 50));
  const borderLeftBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderLeft,
    material: wallMaterial,
  });
  borderLeftBody.position.copy(borderLeft.position);
  borderLeftBody.quaternion.copy(borderLeft.quaternion);
  world.addBody(borderLeftBody);

  // right
  const borderRight = borderLeft.clone();
  borderRight.position.x = 51;
  group.add(borderRight);

  const borderRightBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderLeft,
    material: wallMaterial,
  });
  borderRightBody.position.copy(borderRight.position);
  borderRightBody.quaternion.copy(borderRight.quaternion);
  world.addBody(borderRightBody);

  // top
  const borderTop = new THREE.Mesh(
    new THREE.BoxGeometry(100, 3, 2),
    new THREE.MeshStandardMaterial({
      color: 0x666666,
      map: woodMaterial,
    })
  );
  borderTop.position.z = -49;
  borderTop.position.y = 1;
  borderTop.castShadow = true;
  borderTop.receiveShadow = true;
  group.add(borderTop);

  const shapeBorderTop = new CANNON.Box(new CANNON.Vec3(50, 1.5, 1));
  const borderTopBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderTop,
    material: wallMaterial,
  });
  borderTopBody.position.copy(borderTop.position);
  borderTopBody.quaternion.copy(borderTop.quaternion);
  world.addBody(borderTopBody);

  // bottom
  const borderBottom = borderTop.clone();
  borderBottom.position.z = 49;
  group.add(borderBottom);

  const borderBottomBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderTop,
    material: wallMaterial,
  });
  borderBottomBody.position.copy(borderBottom.position);
  borderBottomBody.quaternion.copy(borderBottom.quaternion);
  world.addBody(borderBottomBody);

  scene.add(group);
}

function getPoints() {
  let points = [];
  let r = 27;
  let cX = 0;
  let cY = 0;

  let circleOffset = 0;
  for (let i = 0; i < 1000; i += 6 + circleOffset) {
    circleOffset = 4.5 * (i / 360);

    let x = (r / 1440) * (1440 - i) * Math.cos(i * (Math.PI / 180)) + cX;
    let z = (r / 1440) * (1440 - i) * Math.sin(i * (Math.PI / 180)) + cY;
    let y = 0;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
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
