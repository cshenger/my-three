<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
// 用于鼠标移动镜头
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
// 用于后期处理的依赖
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { TexturePass } from "three/examples/jsm/postprocessing/TexturePass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";

onMounted(() => {
  // 定义场景
  const scene = new THREE.Scene();
  // 创建一个粗细为20的坐标轴
  const axes = new THREE.AxesHelper(100);
  scene.add(axes);

  // 定义摄像机
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
  camera.position.set(-50, 40, 50);
  camera.lookAt(scene.position);

  // 定义渲染器
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  // 定义场景的颜色为黑色
  renderer.setClearColor(0x000000);
  // 定义场景大小为整个窗口
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 通道
  const renderPass = new RenderPass(scene, camera);
  const effectCopy = new ShaderPass(CopyShader);
  effectCopy.renderToScreen = true;

  const composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(effectCopy);

  const renderedScene = new TexturePass(composer.renderTarget2);

  // 电视效果
  const effectFilm = new FilmPass(0.8, 0.325, 256, false);
  effectFilm.renderToScreen = true;
  const effectFilmComposer = new EffectComposer(renderer);
  // 创建新场景
  effectFilmComposer.addPass(renderedScene);
  // 添加FilmPass通道
  effectFilmComposer.addPass(effectFilm);
  // 使用effectCopy输出渲染
  effectFilmComposer.addPass(effectCopy);

  // 泛光效果
  const bloomPass = new BloomPass();
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderedScene);
  bloomComposer.addPass(bloomPass);
  bloomComposer.addPass(effectCopy);

  // 将场景作为点集输出
  const dotScreenPass = new DotScreenPass();
  const dotScreeComposer = new EffectComposer(renderer);
  dotScreeComposer.addPass(renderedScene);
  dotScreeComposer.addPass(dotScreenPass);
  dotScreeComposer.addPass(effectCopy);

  // 将渲染的结果加入到div中
  document.querySelector("#container").appendChild(renderer.domElement);
  // 实现鼠标移动摄像头
  const trackballControls = new TrackballControls(camera, renderer.domElement);
  const clock = new THREE.Clock();

  // 聚光灯
  const spotLight = new THREE.SpotLight(0xffffff, 1.2, 150, 120);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);
  const ambientLight = new THREE.AmbientLight(0x3c3c3c);
  scene.add(ambientLight);

  // 添加一个地球
  function createSphere(material) {
    const sphereGeometry = new THREE.SphereGeometry(20, 100, 100);
    const mesh = new THREE.Mesh(sphereGeometry, material);
    return mesh;
  }
  const textureLoader = new THREE.TextureLoader();
  const cubeMaterial = new THREE.MeshLambertMaterial({
    map: textureLoader.load("../../public/textures/earth/Earth.png"),
    normalMap: textureLoader.load("../../public/textures/earth/EarthNormal.png"),
  });
  const sphere = createSphere(cubeMaterial);
  scene.add(sphere);

  // 帧率动画
  const width = window.innerWidth;
  const height = window.innerHeight;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  renderer.autoClear = false;
  function renderScence() {
    const delta = clock.getDelta();
    sphere.rotation.y += 0.01;
    trackballControls.update(clock);

    renderer.clear();
    renderer.setViewport(0, 0, halfWidth, halfHeight);
    effectFilmComposer.render(delta);

    renderer.setViewport(0, halfHeight, halfWidth, halfHeight);
    bloomComposer.render(delta);

    renderer.setViewport(halfWidth, 0, halfWidth, halfHeight);
    dotScreeComposer.render(delta);

    renderer.setViewport(halfWidth, halfHeight, halfWidth, halfHeight);
    composer.render(delta);

    requestAnimationFrame(renderScence);
    renderer.render(scene, camera);
  }
  renderScence();

  // 窗口大小改变后，改变摄像头
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize, false);
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
