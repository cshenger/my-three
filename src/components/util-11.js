import * as THREE from "three";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { initDefaultLighting, addBasicMaterialSettings, addSpecificMaterialSettings } from "./utils.js";

export const addEarth = (scene, earthOptions = undefined) => {
  const textureLoader = new THREE.TextureLoader();
  const planeMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("../../public/textures/earth/Earth.png"),
    normalMap: textureLoader.load("../../public/textures/earth/EarthNormal.png"),
    specularMap: textureLoader.load("../../public/textures/earth/EarthSpec.png"),
    specular: new THREE.Color(0x4444aa),
    normalScale: new THREE.Vector2(6, 6),
    shininess: 0.5,
  });

  let options = {
    radius: 25,
    width: 100,
    height: 100,
  };
  if (earthOptions) {
    options = {
      radius: earthOptions.radius,
      width: earthOptions.width,
      height: earthOptions.height,
    };
  }
  const earth = new THREE.Mesh(new THREE.SphereGeometry(options.radius, options.width, options.height), planeMaterial);
  earth.name = "earth";
  scene.add(earth);
  const pivot = new THREE.Object3D();
  pivot.name = "pivot";
  initDefaultLighting(pivot);
  scene.add(pivot);

  return { earth: earth, pivot: pivot };
};

export const addMars = (scene) => {
  const textureLoader = new THREE.TextureLoader();
  const planetMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("../../public/textures/mars/mars_1k_color.jpg"),
    normalMap: textureLoader.load("../../public/textures/mars/mars_1k_normal.jpg"),
    normalScale: new THREE.Vector2(6, 6),
    shininess: 0.5,
  });

  const mars = new THREE.Mesh(new THREE.SphereGeometry(15, 40, 40), planetMaterial);
  scene.add(mars);
  const pivot = new THREE.Object3D();
  initDefaultLighting(pivot);
  scene.add(pivot);

  return { mars: mars, pivot: pivot };
};

export const addFilmPassControls = (gui, controls, effectFilm) => {
  controls.grayScale = false;
  controls.noiseIntensity = 0.8;
  controls.scanlinesIntensity = 0.325;
  controls.scanlinesCount = 256;
  controls.updateFilmPass = function () {
    if (controls.grayScale !== undefined) effectFilm.uniforms.grayscale.value = controls.grayScale;
    if (controls.noiseIntensity !== undefined) effectFilm.uniforms.nIntensity.value = controls.noiseIntensity;
    if (controls.scanlinesIntensity !== undefined) effectFilm.uniforms.sIntensity.value = controls.scanlinesIntensity;
    if (controls.scanlinesCount !== undefined) effectFilm.uniforms.sCount.value = controls.scanlinesCount;
  };

  const filmFolder = gui.addFolder("FilmPass");
  filmFolder.add(controls, "grayScale").onChange(controls.updateFilmPass);
  filmFolder.add(controls, "noiseIntensity", 0, 1, 0.01).onChange(controls.updateFilmPass);
  filmFolder.add(controls, "scanlinesIntensity", 0, 1, 0.01).onChange(controls.updateFilmPass);
  filmFolder.add(controls, "scanlinesCount", 0, 500, 1).onChange(controls.updateFilmPass);
};

export const addBloomPassControls = (gui, controls, bloom, callback) => {
  controls.strength = 3;
  controls.kernelSize = 25;
  controls.sigma = 5.0;
  controls.updateBloomPass = () => {
    const bloomPass = new BloomPass(controls.strength, controls.kernelSize, controls.sigma);
    callback(bloomPass);
  };

  const bloomFolder = gui.addFolder("BloomPass");
  bloomFolder.add(controls, "strength", 0, 5, 0.01).onChange(controls.updateBloomPass);
  bloomFolder.add(controls, "kernelSize", 10, 100, 1).onChange(controls.updateBloomPass);
  bloomFolder.add(controls, "sigma", 1, 8, 0.1).onChange(controls.updateBloomPass);
};

export const addDotScreenPassControls = (gui, controls, dotscreen) => {
  controls.centerX = 0.5;
  controls.centerY = 0.5;
  controls.angle = 1;
  controls.scale = 1;
  controls.updateDotScreen = function () {
    dotscreen.uniforms["center"].value.copy(new THREE.Vector2(controls.centerX, controls.centerY));
    dotscreen.uniforms["angle"].value = controls.angle;
    dotscreen.uniforms["scale"].value = controls.scale;
  };

  const dsFolder = gui.addFolder("DotScreenPass");
  dsFolder.add(controls, "centerX", 0, 5, 0.01).onChange(controls.updateDotScreen);
  dsFolder.add(controls, "centerY", 0, 5, 0.01).onChange(controls.updateDotScreen);
  dsFolder.add(controls, "angle", 0, 3.14, 0.01).onChange(controls.updateDotScreen);
  dsFolder.add(controls, "scale", 0, 10).onChange(controls.updateDotScreen);
};

export const addGlitchPassControls = (gui, controls, glitchPass, callback) => {
  controls.dtsize = 64;
  const gpFolder = gui.addFolder("GlitchPass");
  gpFolder.add(controls, "dtsize", 0, 1024).onChange((e) => {
    callback(new GlitchPass(e));
  });
};

export const addSepiaShaderControls = (gui, controls, shaderPass) => {
  controls.amount = 1;
  const folder = gui.addFolder("SepiaShader");
  folder.add(controls, "amount", 0, 10, 0.1).onChange(function (e) {
    shaderPass.uniforms["amount"].value = e;
  });
};

export const addColorifyShaderControls = (gui, controls, shaderPass) => {
  const folder = gui.addFolder("ColorifyShader");
  controls.color = 0xffffff;

  folder.addColor(controls, "color").onChange(function (value) {
    shaderPass.uniforms["color"].value = new THREE.Color(value);
  });
};

export const addGeometryWithMaterial = (scene, geom, name, gui, controls, material) => {
  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;

  scene.add(mesh);
  addBasicMaterialSettings(gui, controls, material, name + "-THREE.Material");
  addSpecificMaterialSettings(gui, controls, material, name + "-Material");

  return mesh;
};

export function addShaderControl(gui, folderName, shaderPass, toSet, enabled) {
  function uniformOrDefault(uniforms, key, def) {
    return uniforms[key].value !== undefined && uniforms[key].value !== null ? uniforms[key].value : def;
  }

  function addUniformBool(folder, key, shader) {
    let localControls = {};
    localControls[key] = uniformOrDefault(shader.uniforms, key, 0);
    folder.add(localControls, key).onChange(function (v) {
      shader.uniforms[key].value = v;
    });
  }

  function addUniformFloat(folder, key, from, to, step, shader) {
    let localControls = {};
    localControls[key] = uniformOrDefault(shader.uniforms, key, 0);
    folder.add(localControls, key, from, to, step).onChange(function (v) {
      shader.uniforms[key].value = v;
    });
  }

  function addUniformColor(folder, key, shader) {
    let localControls = {};
    localControls[key] = uniformOrDefault(shader.uniforms, key, new THREE.Color(0xffffff));
    folder.addColor(localControls, key).onChange(function (value) {
      shader.uniforms[key].value = new THREE.Color().setRGB(value.r / 255, value.g / 255, value.b / 255);
    });
  }

  function addUniformVector3(folder, key, shader, from, to, step) {
    let startValue = uniformOrDefault(shader.uniforms, key, new THREE.Vector3(0, 0, 0));
    let keyX = key + "_x";
    let keyY = key + "_y";
    let keyZ = key + "_z";

    let localControls = {};
    localControls[keyX] = startValue.x;
    localControls[keyY] = startValue.y;
    localControls[keyZ] = startValue.z;

    folder.add(localControls, keyX, from.x, to.x, step.x).onChange(function (v) {
      shader.uniforms[key].value.x = v;
    });
    folder.add(localControls, keyY, from.x, to.x, step.x).onChange(function (v) {
      shader.uniforms[key].value.y = v;
    });
    folder.add(localControls, keyZ, from.x, to.x, step.x).onChange(function (v) {
      shader.uniforms[key].value.z = v;
    });
  }

  function addUniformVector2(folder, key, shader, from, to, step) {
    let startValue = uniformOrDefault(shader.uniforms, key, new THREE.Vector2(0, 0));
    shader.uniforms[key].value = startValue;

    let keyX = key + "_x";
    let keyY = key + "_y";

    let localControls = {};
    localControls[keyX] = startValue.x;
    localControls[keyY] = startValue.y;

    folder.add(localControls, keyX, from.x, to.x, step.x).onChange(function (v) {
      shader.uniforms[key].value.x = v;
    });
    folder.add(localControls, keyY, from.x, to.x, step.x).onChange(function (v) {
      shader.uniforms[key].value.y = v;
    });
  }

  // create the folder and set enabled
  let folder = gui.addFolder(folderName);
  if (toSet.setEnabled !== undefined ? toSet.setEnabled : true) {
    shaderPass.enabled = enabled !== undefined ? enabled : false;
    folder.add(shaderPass, "enabled");
  }

  if (toSet.floats !== undefined) {
    toSet.floats.forEach(function (p) {
      let from = p.from !== undefined ? p.from : 0;
      let to = p.from !== undefined ? p.to : 1;
      let step = p.from !== undefined ? p.step : 0.01;
      addUniformFloat(folder, p.key, from, to, step, shaderPass);
    });
  }

  if (toSet.colors !== undefined) {
    toSet.colors.forEach(function (p) {
      addUniformColor(folder, p.key, shaderPass);
    });
  }

  if (toSet.vector3 !== undefined) {
    toSet.vector3.forEach(function (p) {
      addUniformVector3(folder, p.key, shaderPass, p.from, p.to, p.step);
    });
  }

  if (toSet.vector2 !== undefined) {
    toSet.vector2.forEach(function (p) {
      addUniformVector2(folder, p.key, shaderPass, p.from, p.to, p.step);
    });
  }

  if (toSet.booleans !== undefined) {
    toSet.booleans.forEach(function (p) {
      addUniformBool(folder, p.key, shaderPass);
    });
  }
}
