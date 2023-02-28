<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { TexturePass } from "three/examples/jsm/postprocessing/TexturePass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { BleachBypassShader } from "three/examples/jsm/shaders/BleachBypassShader";
import { BrightnessContrastShader } from "three/examples/jsm/shaders/BrightnessContrastShader";
import { ColorifyShader } from "three/examples/jsm/shaders/ColorifyShader";
import { ColorCorrectionShader } from "three/examples/jsm/shaders/ColorCorrectionShader";
import { FreiChenShader } from "three/examples/jsm/shaders/FreiChenShader";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { HueSaturationShader } from "three/examples/jsm/shaders/HueSaturationShader";
import { KaleidoShader } from "three/examples/jsm/shaders/KaleidoShader";
import { LuminosityHighPassShader } from "three/examples/jsm/shaders/LuminosityHighPassShader";
import { LuminosityShader } from "three/examples/jsm/shaders/LuminosityShader";
import { MirrorShader } from "three/examples/jsm/shaders/MirrorShader";
import { PixelShader } from "three/examples/jsm/shaders/PixelShader";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import { SepiaShader } from "three/examples/jsm/shaders/SepiaShader";
import { SobelOperatorShader } from "three/examples/jsm/shaders/SobelOperatorShader";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls } from "./utils.js";
import { addShaderControl, addEarth } from "./util-11.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, delta, plane, params, operations, gui;
let composer, earth, pivot;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container, { antialias: true, alpha: true });

  // controls
  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  clock = new THREE.Clock();
  delta = clock.getDelta();

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  stats.update();

  animate();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  composer.render(delta);
}

function animate() {
  trackballControls.update(delta);
  earth.rotation.y += 0.001;
  pivot.rotation.y += -0.0003;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();

  const textureLoader = new THREE.TextureLoader();
  scene.background = textureLoader.load("../../public/textures/bg/starry-deep-outer-space-galaxy.jpg");
  const earthAndLight = addEarth(scene);
  earth = earthAndLight.earth;
  pivot = earthAndLight.pivot;

  // setup effects
  let renderPass = new RenderPass(scene, camera);
  let effectCopy = new ShaderPass(CopyShader);
  effectCopy.renderToScreen = true;
  let bleachByPassFilter = new ShaderPass(BleachBypassShader);
  let brightnessContrastShader = new ShaderPass(BrightnessContrastShader);
  let colorifyShader = new ShaderPass(ColorifyShader);
  let colorCorrectionShader = new ShaderPass(ColorCorrectionShader);
  let freiChenShader = new ShaderPass(FreiChenShader);
  let gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
  let hueSaturationShader = new ShaderPass(HueSaturationShader);
  let kaleidoShader = new ShaderPass(KaleidoShader);
  let luminosityHighPassShader = new ShaderPass(LuminosityHighPassShader);
  let luminosityShader = new ShaderPass(LuminosityShader);
  let mirrorShader = new ShaderPass(MirrorShader);
  let pixelShader = new ShaderPass(PixelShader);
  pixelShader.uniforms.resolution.value = new THREE.Vector2(256, 256);
  let rgbShiftShader = new ShaderPass(RGBShiftShader);
  let sepiaShader = new ShaderPass(SepiaShader);
  let sobelOperatorShader = new ShaderPass(SobelOperatorShader);
  sobelOperatorShader.uniforms.resolution.value = new THREE.Vector2(256, 256);
  let vignetteShader = new ShaderPass(VignetteShader);

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bleachByPassFilter);
  composer.addPass(brightnessContrastShader);
  composer.addPass(colorifyShader);
  composer.addPass(colorCorrectionShader);
  composer.addPass(freiChenShader);
  composer.addPass(gammaCorrectionShader);
  composer.addPass(hueSaturationShader);
  composer.addPass(kaleidoShader);
  composer.addPass(luminosityHighPassShader);
  composer.addPass(luminosityShader);
  composer.addPass(mirrorShader);
  composer.addPass(pixelShader);
  composer.addPass(rgbShiftShader);
  composer.addPass(sepiaShader);
  composer.addPass(sobelOperatorShader);
  composer.addPass(vignetteShader);
  composer.addPass(effectCopy);

  // setup controls
  addShaderControl(gui, "BleachBypass", bleachByPassFilter, { floats: [{ key: "opacity", from: 0, to: 2, step: 0.01 }] });
  addShaderControl(gui, "BrightnessContrast", brightnessContrastShader, {
    floats: [
      { key: "brightness", from: 0, to: 1, step: 0.01 },
      { key: "contrast", from: 0, to: 1, step: 0.01 },
    ],
  });
  addShaderControl(gui, "Colorify", colorifyShader, { colors: [{ key: "color" }] });
  addShaderControl(gui, "ColorCorrection", colorCorrectionShader, {
    vector3: [
      { key: "powRGB", from: { x: 0, y: 0, z: 0 }, to: { x: 5, y: 5, z: 5 }, step: { x: 0.01, y: 0.01, z: 0.01 } },
      { key: "mulRGB", from: { x: 0, y: 0, z: 0 }, to: { x: 5, y: 5, z: 5 }, step: { x: 0.01, y: 0.01, z: 0.01 } },
      { key: "addRGB", from: { x: 0, y: 0, z: 0 }, to: { x: 1, y: 1, z: 1 }, step: { x: 0.01, y: 0.01, z: 0.01 } },
    ],
  });
  addShaderControl(gui, "FreiChen", freiChenShader, { vector2: [{ key: "aspect", from: { x: 128, y: 128 }, to: { x: 1024, y: 1024 }, step: { x: 1, y: 1 } }] });
  addShaderControl(gui, "GammaCorrection", gammaCorrectionShader, {});
  addShaderControl(gui, "HueSaturation", hueSaturationShader, {
    floats: [
      { key: "hue", from: -1, to: 1, step: 0.01 },
      { key: "saturation", from: -1, to: 1, step: 0.01 },
    ],
  });
  addShaderControl(gui, "Kaleido", kaleidoShader, {
    floats: [
      { key: "sides", from: 0, to: 20, step: 1 },
      { key: "angle", from: 0, to: 6.28, step: 0.01 },
    ],
  });
  addShaderControl(gui, "LuminosityHighPass", luminosityHighPassShader, {
    colors: [{ key: "defaultColor" }],
    floats: [
      { key: "luminosityThreshold", from: 0, to: 2, step: 0.01 },
      { key: "smoothWidth", from: 0, to: 2, step: 0.01 },
      { key: "defaultOpacity", from: 0, to: 1, step: 0.01 },
    ],
  });
  addShaderControl(gui, "Luminosity", luminosityShader, {});
  addShaderControl(gui, "Mirror", mirrorShader, { floats: [{ key: "side", from: 0, to: 3, step: 1 }] });
  addShaderControl(gui, "Pixel", pixelShader, { vector2: [{ key: "resolution", from: { x: 2, y: 2 }, to: { x: 512, y: 512 }, step: { x: 1, y: 1 } }], floats: [{ key: "pixelSize", from: 0, to: 10, step: 1 }] });
  addShaderControl(gui, "rgbShift", rgbShiftShader, {
    floats: [
      { key: "angle", from: 0, to: 6.28, step: 0.001 },
      { key: "amount", from: 0, to: 0.5, step: 0.001 },
    ],
  });
  addShaderControl(gui, "sepia", sepiaShader, { floats: [{ key: "amount", from: 0, to: 10, step: 0.01 }] });
  addShaderControl(gui, "sobelOperator", sobelOperatorShader, { vector2: [{ key: "resolution", from: { x: 2, y: 2 }, to: { x: 512, y: 512 }, step: { x: 1, y: 1 } }] });
  addShaderControl(gui, "vignette", vignetteShader, {
    floats: [
      { key: "offset", from: 0, to: 10, step: 0.01 },
      { key: "darkness", from: 0, to: 10, step: 0.01 },
    ],
  });
}

function setupControls() {
  params = {};

  gui = new GUI();

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
