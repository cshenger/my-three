<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations;
let water_mesh; // 飞船主体模型
let cubeRenderTarget; // 光锥纹理贴图
let cubeCamera;
let parameters = [],
  mouseX = 0,
  mouseY = 0,
  geom = null;
const textureLoader = new THREE.TextureLoader();
const sprite1 = textureLoader.load("../../public/textures/sprites/snowflake1.png");
const sprite2 = textureLoader.load("../../public/textures/sprites/snowflake2.png");
const sprite3 = textureLoader.load("../../public/textures/sprites/snowflake3.png");
const sprite4 = textureLoader.load("../../public/textures/sprites/snowflake4.png");
const sprite5 = textureLoader.load("../../public/textures/sprites/snowflake5.png");
let textGroup;

function createPointCloud(name, texture, size, transparent, opacity, sizeAttenuation, color) {
  geom = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;
    vertices.push(x, y, z);
  }

  geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({
    size: size,
    transparent: transparent,
    opacity: opacity,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    sizeAttenuation: sizeAttenuation,
    color: color,
  });

  const particles = new THREE.Points(geom, material);
  particles.rotation.x = Math.random() * 6;
  particles.rotation.y = Math.random() * 6;
  particles.rotation.z = Math.random() * 6;
  particles.name = name;
  return particles;
}

function createPointInstances(size, transparent, opacity, sizeAttenuation, color) {
  parameters = [
    [[1.0, 0.2, 0.5], sprite2, 20],
    [[0.95, 0.1, 0.5], sprite3, 15],
    [[0.9, 0.05, 0.5], sprite1, 10],
    [[0.85, 0, 0.5], sprite5, 8],
    [[0.8, 0, 0.5], sprite4, 5],
  ];

  for (let i = 0; i < parameters.length; i++) {
    const sprite = parameters[i][1];
    scene.add(createPointCloud("" + sprite, sprite, size, transparent, opacity, sizeAttenuation, color));
  }
}

/**
 * 求导
 * 为了算x轴所对应的y值
 * **/
const Deri = {
  /**
   * @param ps 包含了4个数的数组
   * @param targ 目标值
   * @param t
   * @constructor
   */
  NTBezierFunc: function (ps, targ, t) {
    return (1.0 - t) * (1.0 - t) * (1.0 - t) * ps[0] + 3 * (1.0 - t) * (1.0 - t) * t * ps[1] + 3 * (1.0 - t) * t * t * ps[2] + t * t * t * ps[3] - targ;
  },
  /**
   * 求导数公式
   * @param ps
   * @param targ
   * @param t
   * @constructor
   */
  DeltaNTBezierFunc: function (ps, targ, t) {
    var dt = 1e-8;
    return (this.NTBezierFunc(ps, targ, t) - this.NTBezierFunc(ps, targ, t - dt)) / dt;
  },
  /**
   * 开始创建曲线
   **/
  start: function (x) {
    const dot_x = [0, 0, 28, 42]; // 0 0 25 42 / 0, 0, 28, 42
    const dot_y = [0, 14.5, 0, 0]; // -0.4, 15, 0.1, 0 / 0, 15, 0, 0
    let t = 0.8; // t的初始值
    for (let i = 0; i < 512; i++) {
      t = t - this.NTBezierFunc(dot_x, x, t) / this.DeltaNTBezierFunc(dot_x, x, t);
      if (this.NTBezierFunc(dot_x, x, t) <= 0.00001) {
        break;
      }
    }
    var res_y = this.NTBezierFunc(dot_y, 0, t);
    return res_y;
  },
};

/** 初始化两个六面体相机 为了模拟镜面做准备 **/
function initCubeCameras() {
  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  cubeRenderTarget.texture.type = THREE.HalfFloatType;
  cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
}

/** 创建水滴探测器Obj 以及上面的光锥**/
function initWaterShip() {
  const cubeMeterial = new THREE.MeshStandardMaterial({
    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1,
  });

  const points = [];
  const lang = 41;
  for (let i = 0; i < lang; i += 0.005) {
    if (i < 1) {
      const y = Deri.start(i);
      points.push(new THREE.Vector2(y, i));
    } else if ((i * 1000).toFixed(2) % 2) {
      const y = Deri.start(i);
      points.push(new THREE.Vector2(y, i));
      i += 0.03;
    }
  }

  const water_m = new THREE.LatheGeometry(points, 20);
  water_mesh = new THREE.Mesh(water_m, cubeMeterial);
  water_mesh.rotation.set(0, 0, Math.PI / 2);
  water_mesh.position.x = 15;

  scene.add(water_mesh);
}

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
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x9c9d9c);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // create the ground plane
  // plane = addGroundPlane(scene);
  // scene.add(plane);

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
  cubeCamera.update(renderer, scene);

  const time = Date.now() * 0.00005;
  // camera.position.x += (mouseX - camera.position.x) * 0.05;
  // camera.position.y += (-mouseY - camera.position.y) * 0.05;
  // camera.lookAt(scene.position);

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
    }
  }

  if (textGroup) {
    textGroup.rotation.y += 0.02;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  /* 雪花部分 */
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const textureLoader = new THREE.TextureLoader();
  const materials = [];

  const sprite1 = textureLoader.load("../../public/textures/sprites/snowflake1.png");
  const sprite2 = textureLoader.load("../../public/textures/sprites/snowflake2.png");
  const sprite3 = textureLoader.load("../../public/textures/sprites/snowflake3.png");
  const sprite4 = textureLoader.load("../../public/textures/sprites/snowflake4.png");
  const sprite5 = textureLoader.load("../../public/textures/sprites/snowflake5.png");

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;
    vertices.push(x, y, z);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

  const parameters = [
    [[1.0, 0.2, 0.5], sprite2, 20],
    [[0.95, 0.1, 0.5], sprite3, 15],
    [[0.9, 0.05, 0.5], sprite1, 10],
    [[0.85, 0, 0.5], sprite5, 8],
    [[0.8, 0, 0.5], sprite4, 5],
  ];

  for (let i = 0; i < parameters.length; i++) {
    const color = parameters[i][0];
    const sprite = parameters[i][1];
    const size = parameters[i][2];

    materials[i] = new THREE.PointsMaterial({ size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true });
    materials[i].color.setHSL(color[0], color[1], color[2]);

    const particles = new THREE.Points(geometry, materials[i]);

    particles.rotation.x = Math.random() * 6;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 6;

    scene.add(particles);
  }

  /* 文字部分 */
  const textLoader = new FontLoader();
  textLoader.load("../../public/fonts/smiley_sans_blique_Regular.json", function (font) {
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xc3c5c4, flatShading: true }), // front
      new THREE.MeshPhongMaterial({ color: 0xc3c5c4 }), // side
    ];
    const geometry = new TextGeometry("三体", {
      font: font,
      size: 90,
      height: 5,
      bevelEnabled: true,
    });

    textGroup = new THREE.Object3D();
    const text = new THREE.Mesh(geometry, materials);
    text.scale.set(0.1, 0.1, 0.1);
    textGroup.position.set(0, 0, 0); //世界原点坐标
    textGroup.add(text);
    text.position.set(-10, 15, 0);
    scene.add(textGroup);
  });

  /* 水滴部分 */
  // new RGBELoader().setPath("../../public/textures/equirectangular/").load("vintage_measuring_lab_2k.hdr", function (texture) {
  //   texture.mapping = THREE.EquirectangularReflectionMapping;
  //   scene.background = texture;
  //   scene.environment = texture;
  // });

  // 定顺序: pos-x, neg-x, pos-y, neg-y, pos-z, neg-z.
  const urls = ["../../public/waters/skybox/posx.jpg", "../../public/waters/skybox/negx.jpg", "../../public/waters/skybox/posy.jpg", "../../public/waters/skybox/negy.jpg", "../../public/waters/skybox/posz.jpg", "../../public/waters/skybox/negz.jpg"];
  const cuberLoader = new THREE.CubeTextureLoader();
  scene.background = cuberLoader.load(urls);

  initCubeCameras(); // 初始化六面体相机
  initWaterShip(); // 初始化水滴

  setupControls();
}

function setupControls() {
  params = new (function () {
    this.size = 10;
    this.transparent = true;
    this.opacity = 0.6;
    this.color = 0xffffff;
    this.sizeAttenuation = true;
    this.redraw = () => {
      let toRemove = [];
      scene.children.forEach((child) => {
        if (child instanceof THREE.Points) {
          toRemove.push(child);
        }
      });
      toRemove.forEach((child) => {
        scene.remove(child);
      });
      createPointInstances(params.size, params.params, params.opacity, params.sizeAttenuation, params.color);
    };
  })();

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
