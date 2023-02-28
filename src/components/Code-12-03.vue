<script setup>
import { onMounted, nextTick } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, initTrackballControls } from "./utils.js";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, params, gui, operations;
let world, defaultMaterial, floorMaterial, wallMaterial;
let oldElapsedTime = 0;
let cannonDebugger,
  cannonMeshes = [];
let direction = 1;
let groundGroup = [];
let groundObjects = [];

let elementObjects = [];
let meshes = [];

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(10, 10, 80));
  renderer = initRenderer(container);

  // controls
  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
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
  addCannonDebugger();

  /* 具体代码 */
  const colors = [0x66ff00, 0x6600ff, 0x0066ff, 0xff6600, 0xff0066];

  params.cubeRestitution = 0.4;
  params.cubeFriction = 0.4;
  params.sphereRestitution = 0.9;
  params.sphereFriction = 0.1;
  params.clearMeshes = () => {
    meshes.forEach((e) => {
      scene.remove(e);
    });
    meshes = [];
    elementObjects = [];
    cannonMeshes = cannonMeshes.splice(0, 5);
  };
  params.addCubes = () => {
    const cubeMaterial = new CANNON.Material("cubeMaterial");
    const cubeContactMaterial = new CANNON.ContactMaterial(cubeMaterial, defaultMaterial, {
      friction: params.cubeFriction,
      restitution: params.cubeRestitution,
    });
    world.addContactMaterial(cubeContactMaterial);
    let colorBox = colors[Math.floor(Math.random() * 5)];

    for (let i = 0; i < 5; i++) {
      let gemotry = new THREE.BoxGeometry(4, 4, 4);
      let material = new THREE.MeshStandardMaterial({
        color: colorBox,
      });
      let box = new THREE.Mesh(gemotry, material);
      box.position.set(Math.random() * 50 - 25, 20 + Math.random() * 5, Math.random() * 50 - 25);
      box.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      meshes.push(box);
      scene.add(box);

      const shape = new CANNON.Box(new CANNON.Vec3(2, 2, 2));
      const body = new CANNON.Body({
        mass: 0.5,
        shape,
        material: cubeMaterial,
      });
      body.position.copy(box.position);
      body.quaternion.copy(box.quaternion);
      world.addBody(body);

      elementObjects.push({
        mesh: box,
        body: body,
      });

      elementObjects.forEach((e) => {
        e.mesh.position.copy(e.body.position);
        e.mesh.quaternion.copy(e.body.quaternion);
      });
    }
  };
  params.addSpheres = () => {
    const sphereMaterial = new CANNON.Material("sphereMaterial");
    const sphereContactMaterial = new CANNON.ContactMaterial(sphereMaterial, defaultMaterial, {
      friction: params.sphereFriction,
      restitution: params.sphereRestitution,
    });
    world.addContactMaterial(sphereContactMaterial);
    let colorSphere = colors[Math.floor(Math.random() * 5)];

    for (let i = 0; i < 5; i++) {
      let gemotry = new THREE.SphereGeometry(2, 20);
      let material = new THREE.MeshStandardMaterial({
        color: colorSphere,
      });
      let sphere = new THREE.Mesh(gemotry, material);
      sphere.position.set(Math.random() * 50 - 25, 20 + Math.random() * 5, Math.random() * 50 - 25);
      meshes.push(sphere);
      scene.add(sphere);

      const body = new CANNON.Body({
        mass: 0.5,
        shape: new CANNON.Sphere(2),
        material: sphereMaterial,
      });
      body.position.copy(sphere.position);
      body.quaternion.copy(sphere.quaternion);
      world.addBody(body);

      elementObjects.push({
        mesh: sphere,
        body: body,
      });

      elementObjects.forEach((e) => {
        e.mesh.position.copy(e.body.position);
        e.mesh.quaternion.copy(e.body.quaternion);
      });
    }
  };

  gui.add(params, "cubeRestitution", 0, 1);
  gui.add(params, "cubeFriction", 0, 1);
  gui.add(params, "sphereRestitution", 0, 1);
  gui.add(params, "sphereFriction", 0, 1);
  gui.add(params, "addCubes");
  gui.add(params, "addSpheres");
  gui.add(params, "clearMeshes");

  // 添加地板
  addGround(true);
}

// 动画效果
function animate() {
  // const time = clock.getElapsedTime();
  // let deltaTime = time - oldElapsedTime;
  // oldElapsedTime = time;
  // world.step(1 / 60, deltaTime, 3);
  world.fixedStep();

  let delta = clock.getDelta();
  trackballControls.update(delta);

  groundGroup.rotation.x += 0.003 * direction;
  if (groundGroup.rotation.x < -0.5) direction = 1;
  if (groundGroup.rotation.x > 0.5) direction = -1;

  groundGroup.updateMatrixWorld();
  for (let i = 0; i < groundGroup.children.length; i++) {
    let child = groundGroup.children[i];
    let body = child.userData.body;
    body.position.copy(child.getWorldPosition(new THREE.Vector3()));
    body.quaternion.copy(child.getWorldQuaternion(new THREE.Quaternion()));
  }

  elementObjects.forEach((e) => {
    e.mesh.position.copy(e.body.position);
    e.mesh.quaternion.copy(e.body.quaternion);
  });
  cannonDebugger.update(); // Update the CannonDebugger meshes
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
    friction: 0.6,
    restitution: 0.2,
  });
  world.addContactMaterial(defalutContactMaterial);
  world.addContactMaterial(floorContactMaterial);
  world.addContactMaterial(wallContactMaterial);
}

function addGround(withTexture = false) {
  groundGroup = new THREE.Group();
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
  groundGroup.add(plane);
  // scene.add(plane);

  const floorShape = new CANNON.Box(new CANNON.Vec3(50, 50, 1));
  const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape,
    material: defaultMaterial,
  });
  // floorBody.position.copy(plane.position);
  // floorBody.quaternion.copy(plane.quaternion);
  world.addBody(floorBody);
  groundObjects.push({
    mesh: plane,
    body: floorBody,
  });

  // // 创建围墙
  let woodMaterial = textureLoader.load("../../public/textures/general/wood-2.jpg");

  // // left
  const borderLeft = new THREE.Mesh(
    new THREE.BoxGeometry(2, 5, 100),
    new THREE.MeshStandardMaterial({
      color: 0x666666,
      map: woodMaterial,
    })
  );
  borderLeft.position.x = -51;
  borderLeft.position.y = 1;
  borderLeft.castShadow = true;
  borderLeft.receiveShadow = true;
  groundGroup.add(borderLeft);
  // scene.add(borderLeft);

  const shapeBorderLeft = new CANNON.Box(new CANNON.Vec3(1, 2.5, 50));
  const borderLeftBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderLeft,
    material: wallMaterial,
  });
  // borderLeftBody.position.copy(borderLeft.position);
  // borderLeftBody.quaternion.copy(borderLeft.quaternion);
  world.addBody(borderLeftBody);
  groundObjects.push({
    mesh: borderLeft,
    body: borderLeftBody,
  });

  // right
  const borderRight = borderLeft.clone();
  borderRight.position.x = 51;
  groundGroup.add(borderRight);
  // scene.add(borderRight);

  const borderRightBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderLeft,
    material: wallMaterial,
  });
  // borderRightBody.position.copy(borderRight.position);
  // borderRightBody.quaternion.copy(borderRight.quaternion);
  world.addBody(borderRightBody);
  groundObjects.push({
    mesh: borderRight,
    body: borderRightBody,
  });

  // top
  const borderTop = new THREE.Mesh(
    new THREE.BoxGeometry(100, 5, 2),
    new THREE.MeshStandardMaterial({
      color: 0x666666,
      map: woodMaterial,
    })
  );
  borderTop.position.z = -49;
  borderTop.position.y = 1;
  borderTop.castShadow = true;
  borderTop.receiveShadow = true;
  groundGroup.add(borderTop);
  // scene.add(borderTop);

  const shapeBorderTop = new CANNON.Box(new CANNON.Vec3(50, 2.5, 1));
  const borderTopBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderTop,
    material: wallMaterial,
  });
  // borderTopBody.position.copy(borderTop.position);
  // borderTopBody.quaternion.copy(borderTop.quaternion);
  world.addBody(borderTopBody);
  groundObjects.push({
    mesh: borderTop,
    body: borderTopBody,
  });

  // bottom
  const borderBottom = borderTop.clone();
  borderBottom.position.z = 49;
  groundGroup.add(borderBottom);
  // scene.add(borderBottom);

  const borderBottomBody = new CANNON.Body({
    mass: 0,
    shape: shapeBorderTop,
    material: wallMaterial,
  });
  // borderBottomBody.position.copy(borderBottom.position);
  // borderBottomBody.quaternion.copy(borderBottom.quaternion);
  world.addBody(borderBottomBody);
  groundObjects.push({
    mesh: borderBottom,
    body: borderBottomBody,
  });

  for (let i = 0; i < groundGroup.children.length; i++) {
    let child = groundGroup.children[i];
    child.userData.body = groundObjects[i].body;
  }
  scene.add(groundGroup);
}

function addCannonDebugger() {
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
  const gravityFolder = gui.addFolder("gravity");
  gravityFolder.add(params, "gravityX", -100, 100, 1).onChange((e) => {
    world.gravity.set(params.gravityX, params.gravityY, params.gravityZ);
  });
  gravityFolder.add(params, "gravityY", -100, 100, 1).onChange((e) => {
    world.gravity.set(params.gravityX, params.gravityY, params.gravityZ);
  });
  gravityFolder.add(params, "gravityZ", -100, 100, 1).onChange((e) => {
    world.gravity.set(params.gravityX, params.gravityY, params.gravityZ);
  });
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
