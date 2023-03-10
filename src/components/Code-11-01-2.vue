<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let renderer;

function initRender() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(new THREE.Color(0xffffff)); //设置背景颜色
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

let camera, cameraOrtho;

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 50);

  cameraOrtho = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10, 10);
}

let scene, sceneOrtho;

function initScene() {
  scene = new THREE.Scene();

  sceneOrtho = new THREE.Scene();
}

let light;

function initLight() {
  scene.add(new THREE.AmbientLight(0x404040));

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);
}

function initModel() {
  //轴辅助 （每一个轴的长度）
  let object = new THREE.AxesHelper(500);
  //scene.add(object);

  //场景添加一个球型
  let material = new THREE.MeshNormalMaterial();
  let geom = new THREE.SphereGeometry(15, 200, 200);
  let mesh = new THREE.Mesh(geom, material);

  scene.add(mesh);
}

//获取纹理
let getTexture = function () {
  let texture = new THREE.TextureLoader().load("../../public/textures/sprites/snowflake1.png");
  return texture;
};

//初始化性能插件
let stats;

function initStats() {
  stats = new Stats();
  document.body.appendChild(stats.dom);
}

//生成gui设置配置项
let gui;
function initGui() {
  //声明一个保存需求修改的相关数据的对象
  gui = {
    size: 50,
    sprite: 0,
    transparent: true,
    opacity: 0.6,
    color: 0xffffff,
    rotateSystem: true,
    redraw: function () {
      sceneOrtho.children.forEach(function (child) {
        if (child instanceof THREE.Sprite) sceneOrtho.remove(child);
      });
      createSprite(gui.size, gui.transparent, gui.opacity, gui.color, gui.sprite);
    },
  };
  let datGui = new GUI();
  //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）gui.add(controls, 'size', 0, 10).onChange(controls.redraw);
  datGui.add(gui, "sprite", 0, 4).step(1).onChange(gui.redraw); //step，保证每次数值更改为整数，
  datGui.add(gui, "size", 0, 120).onChange(gui.redraw);
  datGui.add(gui, "transparent").onChange(gui.redraw);
  datGui.add(gui, "opacity", 0, 1).onChange(gui.redraw);
  datGui.addColor(gui, "color").onChange(gui.redraw);

  gui.redraw();
}

//创建精灵贴图的方法
function createSprite(size, transparent, opacity, color, spriteNumber) {
  let spriteMaterial = new THREE.SpriteMaterial({
    opacity: opacity,
    color: color,
    transparent: transparent,
    map: getTexture(),
  });

  // 图片上面有五张图片，我们只需要显示其中一张
  spriteMaterial.map.offset = new THREE.Vector2(0.2 * spriteNumber, 0);
  spriteMaterial.map.repeat = new THREE.Vector2(1 / 5, 1);
  spriteMaterial.depthTest = false;

  spriteMaterial.blending = THREE.AdditiveBlending;

  let sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(size, size, size);
  sprite.position.set(1000, size / 2, 0);
  sprite.velocityX = 5;

  sceneOrtho.add(sprite);
}

let step = 0;
function render() {
  stats.update();

  camera.position.y = Math.sin((step += 0.01)) * 20;

  sceneOrtho.children.forEach(function (e) {
    if (e instanceof THREE.Sprite) {
      // move the sprite along the bottom
      e.position.x = e.position.x + e.velocityX;
      if (e.position.x > window.innerWidth) {
        e.velocityX = -5;
        gui.sprite++;
        e.material.map.offset.set((1 / 5) * (gui.sprite % 4), 0);
      }
      if (e.position.x < 0) {
        e.velocityX = 5;
      }
    }
  });

  renderer.render(scene, camera);
  renderer.autoClear = false;
  renderer.render(sceneOrtho, cameraOrtho);
}

//窗口变动触发的函数
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  cameraOrtho.right = window.innerWidth;
  cameraOrtho.top = window.innerHeight;
  cameraOrtho.updateProjectionMatrix();

  render();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  render();

  //更新性能插件
  stats.update();
  requestAnimationFrame(animate);
}

function draw() {
  initRender();
  initScene();
  initCamera();
  initLight();
  initModel();
  initStats();
  initGui();

  animate();
  window.onresize = onWindowResize;
}

onMounted(() => {
  draw();
});
</script>

<template>
  <div id="container"></div>
</template>

<style scoped>
#container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
