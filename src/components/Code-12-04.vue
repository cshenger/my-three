<script setup>
import { onMounted, nextTick } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, initCamera } from "./utils.js";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import Perlin from "./Perlin.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { ParametricGeometries } from "three/addons/geometries/ParametricGeometries.js";

let container, camera, scene, renderer, stats, controls, clock, params, gui, operations, trackballControls;
let world, sphere, body, defaultMaterial, defalutContactMaterial;
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
  dLight.shadow.mapSize.width = 1024;
  dLight.shadow.mapSize.height = 1024;
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
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innersizeX / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innersizeX, window.innerHeight);
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

  /* 添加一些集几何体，这里我不想写了 */
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

  addGround();
}

function animate() {
  world.fixedStep();
  let delta = clock.getDelta();

  elementObjects.forEach((e) => {
    e.mesh.position.copy(e.body.position);
    e.mesh.quaternion.copy(e.body.quaternion);
  });
  cannonDebugger.update(); // Update the CannonDebugger meshes
}

function initGrAvity() {
  // Setup our world
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // m/s²

  //给body的material
  defaultMaterial = new CANNON.Material("default");
  //给world的contactMaterial
  defalutContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0.4,
  });
  world.addContactMaterial(defalutContactMaterial);
}

function addGround() {
  const pn = new Perlin("rnd" + new Date().getTime());
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("../../public/textures/ground/grasslight-big.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);

  // Create a matrix of height values
  let sizeX = 100;
  let sizeZ = 100;
  const matrix = [];
  for (let i = 0; i < sizeX; i++) {
    matrix.push([]);
    for (let j = 0; j < sizeZ; j++) {
      if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
        // const height = 0.5 * Math.cos(0.2 * i);
        const height = pn.noise(i / 12, j / 12, 0) * 13;
        matrix[i].push(height);
        continue;
      }

      // const height = Math.cos((i / sizeX) * Math.PI * 2) * Math.cos((j / sizeZ) * Math.PI * 2) + 2;
      const height = pn.noise(i / 12, j / 12, 0) * 13;
      matrix[i].push(height);
    }
  }

  // Create the heightfield
  const shape = new CANNON.Heightfield(matrix, {
    elementSize: 1,
  });
  const body = new CANNON.Body({ mass: 0 });
  body.addShape(shape);
  body.position.set(-((sizeX - 1) * shape.elementSize) / 2, -4, ((sizeZ - 1) * shape.elementSize) / 2);
  body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(body);

  // 创建BufferGeometry对象
  const geometry = new THREE.BufferGeometry();

  // 定义顶点数据并将顶点数据添加到几何面
  const vertices = [];
  for (let i = 0; i < sizeX; i++) {
    for (let j = 0; j < sizeZ; j++) {
      vertices.push(i, matrix[i][j], j);
    }
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

  // 定义面数据并将面数据添加到几何面
  const indices = [];
  for (let i = 0; i < sizeX - 1; i++) {
    for (let j = 0; j < sizeZ - 1; j++) {
      let a = i * sizeZ + j;
      let b = i * sizeZ + j + 1;
      let c = (i + 1) * sizeZ + j + 1;
      let d = (i + 1) * sizeZ + j;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
  geometry.setIndex(indices);

  // 使用 Three.js 内置的 computeVertexNormals() 方法：
  geometry.computeVertexNormals();

  // const material = new THREE.MeshBasicMaterial({ color: 0x999999 });
  const material = new THREE.MeshPhongMaterial({
    // color: 0x666666,
    side: THREE.DoubleSide,
    map: texture,
    shininess: 100,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // const groundGeom = new ParametricGeometry(
  //   (u, v, target) => {
  //     var height = Math.cos(u * Math.PI * 8) * Math.cos(v * Math.PI * 8); //这里的方法和生成高度场的方法是一样的，不了解ParametricBufferGeometry几何体的可以参考我之前发的博客。
  //     target.set(u * sizeX - sizeX / 2, height, v * sizeZ - sizeZ / 2);
  //   },
  //   sizeX,
  //   sizeZ
  // );
  // let groundMate = new THREE.MeshPhongMaterial({ color: 0x666666, side: THREE.DoubleSide, map: texture });
  // const groundMesh = new THREE.Mesh(groundGeom, groundMate);
  // scene.add(groundMesh);
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
