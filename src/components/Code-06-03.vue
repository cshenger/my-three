<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, redrawGeometryAndUpdateUI, applyMeshNormalMaterial, applyMeshStandardMaterial, initDefaultLighting, addLargeGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, groundPlane, plane, params, operations, gui;
let step = 0;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var transformSVGPathExposed;
var applySVGTransformExposed;

function d3threeD(exports) {
  const DEGS_TO_RADS = Math.PI / 180,
    UNIT_SIZE = 1;

  const DIGIT_0 = 48,
    DIGIT_9 = 57,
    COMMA = 44,
    SPACE = 32,
    PERIOD = 46,
    MINUS = 45;

  function transformSVGPath(pathStr) {
    var paths = [];
    var path = new THREE.Shape();

    var idx = 1,
      len = pathStr.length,
      activeCmd,
      x = 0,
      y = 0,
      nx = 0,
      ny = 0,
      firstX = null,
      firstY = null,
      x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0,
      rx = 0,
      ry = 0,
      xar = 0,
      laf = 0,
      sf = 0,
      cx,
      cy;

    function eatNum() {
      var sidx,
        c,
        isFloat = false,
        s;
      // eat delims
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE) break;
        idx++;
      }
      if (c === MINUS) sidx = idx++;
      else sidx = idx;
      // eat number
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (DIGIT_0 <= c && c <= DIGIT_9) {
          idx++;
          continue;
        } else if (c === PERIOD) {
          idx++;
          isFloat = true;
          continue;
        }

        s = pathStr.substring(sidx, idx);
        return isFloat ? parseFloat(s) : parseInt(s);
      }

      s = pathStr.substring(sidx);
      return isFloat ? parseFloat(s) : parseInt(s);
    }

    function nextIsNum() {
      var c;
      // do permanently eat any delims...
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE) break;
        idx++;
      }
      c = pathStr.charCodeAt(idx);
      return c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9);
    }

    var canRepeat;
    var enteredSub = false;
    var zSeen = false;
    activeCmd = pathStr[0];

    while (idx <= len) {
      canRepeat = true;
      switch (activeCmd) {
        // moveto commands, become lineto's if repeated
        case "M":
          enteredSub = false;
          x = eatNum();
          y = eatNum();
          path.moveTo(x, y);
          activeCmd = "L";
          break;
        case "m":
          x += eatNum();
          y += eatNum();
          path.moveTo(x, y);
          activeCmd = "l";
          break;
        case "Z":
        case "z":
          // z is a special case. This ends a segment and starts
          // a new path. Since the three.js path is continuous
          // we should start a new path here. This also draws a
          // line from the current location to the start location.
          canRepeat = false;
          if (x !== firstX || y !== firstY) path.lineTo(firstX, firstY);

          paths.push(path);

          // reset the elements
          firstX = null;
          firstY = null;

          // avoid x,y being set incorrectly
          enteredSub = true;

          path = new THREE.Shape();

          zSeen = true;

          break;
        // - lines!
        case "L":
        case "H":
        case "V":
          nx = activeCmd === "V" ? x : eatNum();
          ny = activeCmd === "H" ? y : eatNum();
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        case "l":
        case "h":
        case "v":
          nx = activeCmd === "v" ? x : x + eatNum();
          ny = activeCmd === "h" ? y : y + eatNum();
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        // - cubic bezier
        case "C":
          x1 = eatNum();
          y1 = eatNum();
        case "S":
          if (activeCmd === "S") {
            x1 = 2 * x - x2;
            y1 = 2 * y - y2;
          }
          x2 = eatNum();
          y2 = eatNum();
          nx = eatNum();
          ny = eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx;
          y = ny;
          break;
        case "c":
          x1 = x + eatNum();
          y1 = y + eatNum();
        case "s":
          if (activeCmd === "s") {
            x1 = 2 * x - x2;
            y1 = 2 * y - y2;
          }
          x2 = x + eatNum();
          y2 = y + eatNum();
          nx = x + eatNum();
          ny = y + eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx;
          y = ny;
          break;
        // - quadratic bezier
        case "Q":
          x1 = eatNum();
          y1 = eatNum();
        case "T":
          if (activeCmd === "T") {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = eatNum();
          ny = eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx;
          y = ny;
          break;
        case "q":
          x1 = x + eatNum();
          y1 = y + eatNum();
        case "t":
          if (activeCmd === "t") {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = x + eatNum();
          ny = y + eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx;
          y = ny;
          break;
        // - elliptical arc
        case "A":
          rx = eatNum();
          ry = eatNum();
          xar = eatNum() * DEGS_TO_RADS;
          laf = eatNum();
          sf = eatNum();
          nx = eatNum();
          ny = eatNum();
          if (rx !== ry) {
            console.warn("Forcing elliptical arc to be a circular one :(", rx, ry);
          }
          // SVG implementation notes does all the math for us! woo!
          // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
          // step1, using x1 as x1'
          x1 = (Math.cos(xar) * (x - nx)) / 2 + (Math.sin(xar) * (y - ny)) / 2;
          y1 = (-Math.sin(xar) * (x - nx)) / 2 + (Math.cos(xar) * (y - ny)) / 2;
          // step 2, using x2 as cx'
          var norm = Math.sqrt((rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1) / (rx * rx * y1 * y1 + ry * ry * x1 * x1));
          if (laf === sf) norm = -norm;
          x2 = (norm * rx * y1) / ry;
          y2 = (norm * -ry * x1) / rx;
          // step 3
          cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
          cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;

          var u = new THREE.Vector2(1, 0),
            v = new THREE.Vector2((x1 - x2) / rx, (y1 - y2) / ry);
          var startAng = Math.acos(u.dot(v) / u.length() / v.length());
          if (u.x * v.y - u.y * v.x < 0) startAng = -startAng;

          // we can reuse 'v' from start angle as our 'u' for delta angle
          u.x = (-x1 - x2) / rx;
          u.y = (-y1 - y2) / ry;

          var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
          // This normalization ends up making our curves fail to triangulate...
          if (v.x * u.y - v.y * u.x < 0) deltaAng = -deltaAng;
          if (!sf && deltaAng > 0) deltaAng -= Math.PI * 2;
          if (sf && deltaAng < 0) deltaAng += Math.PI * 2;

          path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
          x = nx;
          y = ny;
          break;

        case " ":
          // if it's an empty space, just skip it, and see if we can find a real command
          break;

        default:
          throw new Error("weird path command: " + activeCmd);
      }
      if (firstX === null && !enteredSub) {
        firstX = x;
        firstY = y;
      }

      // just reissue the command
      if (canRepeat && nextIsNum()) continue;
      activeCmd = pathStr[idx++];
    }

    if (zSeen) {
      return paths;
    } else {
      paths.push(path);
      return paths;
    }
  }

  transformSVGPathExposed = transformSVGPath;

  function applySVGTransform(obj, tstr) {
    var idx = tstr.indexOf("("),
      len = tstr.length,
      cmd = tstr.substring(0, idx++);
    function eatNum() {
      var sidx,
        c,
        isFloat = false,
        s;
      // eat delims
      while (idx < len) {
        c = tstr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE) break;
        idx++;
      }
      if (c === MINUS) sidx = idx++;
      else sidx = idx;
      // eat number
      while (idx < len) {
        c = tstr.charCodeAt(idx);
        if (DIGIT_0 <= c && c <= DIGIT_9) {
          idx++;
          continue;
        } else if (c === PERIOD) {
          idx++;
          isFloat = true;
          continue;
        }

        s = tstr.substring(sidx, idx);
        return isFloat ? parseFloat(s) : parseInt(s);
      }

      s = tstr.substring(sidx);
      return isFloat ? parseFloat(s) : parseInt(s);
    }
    switch (cmd) {
      case "translate":
        obj.position.x = Math.floor(eatNum() * UNIT_SIZE);
        obj.position.y = Math.floor(eatNum() * UNIT_SIZE);
        break;
      case "scale":
        obj.scale.x = Math.floor(eatNum() * UNIT_SIZE);
        obj.scale.y = Math.floor(eatNum() * UNIT_SIZE);
        break;
      default:
        console.warn("don't understand transform", tstr);
        break;
    }
  }

  applySVGTransformExposed = applySVGTransform;

  function wrap_setAttribute(name, value) {}
  function wrap_setAttributeNS(namespace, name, value) {}

  var extrudeDefaults = {
    amount: 20,
    bevelEnabled: true,
    material: 0,
    extrudeMaterial: 0,
  };

  function commonSetAttribute(name, value) {
    switch (name) {
      case "x":
        this.position.x = Math.floor(value * UNIT_SIZE);
        break;

      case "y":
        this.position.y = Math.floor(value * UNIT_SIZE);
        break;

      case "class":
        this.clazz = value;
        break;

      case "stroke":
      case "fill":
        if (typeof value !== "string") value = value.toString();
        this.material.color.setHex(parseInt(value.substring(1), 16));
        break;

      case "transform":
        applySVGTransform(this, value);
        break;

      case "d":
        var shape = transformSVGPath(value),
          geom = shape.extrude(extrudeDefaults);
        this.geometry = geom;
        this.geometry.boundingSphere = { radius: 3 * UNIT_SIZE };
        this.scale.set(UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);

        break;

      default:
        throw new Error("no setter for: " + name);
    }
  }
  function commonSetAttributeNS(namespace, name, value) {
    this.setAttribute(name, value);
  }

  function Group(parentThing) {
    THREE.Object3D.call(this);

    this.d3class = "";

    parentThing.add(this);
  }
  Group.prototype = new THREE.Object3D();
  Group.prototype.constructor = Group;
  Group.prototype.d3tag = "g";
  Group.prototype.setAttribute = commonSetAttribute;
  Group.prototype.setAttributeNS = commonSetAttributeNS;

  function fabGroup() {
    return new Group(this);
  }

  function Mesh(parentThing, tag, geometry, material) {
    THREE.Mesh.call(this, geometry, material);

    this.d3tag = tag;
    this.d3class = "";

    parentThing.add(this);
  }
  Mesh.prototype = new THREE.Mesh();
  Mesh.prototype.constructor = Mesh;
  Mesh.prototype.setAttribute = commonSetAttribute;
  Mesh.prototype.setAttributeNS = commonSetAttributeNS;

  const SPHERE_SEGS = 16,
    SPHERE_RINGS = 16,
    DEFAULT_COLOR = 0xcc0000;

  var sharedSphereGeom = null,
    sharedCubeGeom = null;

  function fabSphere() {
    if (!sharedSphereGeom) sharedSphereGeom = new THREE.SphereGeometry(UNIT_SIZE / 2, SPHERE_SEGS, SPHERE_RINGS);
    var material = new THREE.MeshLambertMaterial({
      color: DEFAULT_COLOR,
    });
    return new Mesh(this, "sphere", sharedSphereGeom, material);
  }

  function fabCube() {
    if (!sharedCubeGeom) sharedCubeGeom = new THREE.CubeGeometry(UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);
    var material = new THREE.MeshLambertMaterial({
      color: DEFAULT_COLOR,
    });
    return new Mesh(this, "cube", sharedCubeGeom, material);
  }

  function fabPath() {
    // start with a cube that we will replace with the path once it gets created
    if (!sharedCubeGeom) sharedCubeGeom = new THREE.CubeGeometry(UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);
    var material = new THREE.MeshLambertMaterial({
      color: DEFAULT_COLOR,
    });
    return new Mesh(this, "path", sharedCubeGeom, material);
  }

  function Scene() {
    THREE.Scene.call(this);
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this._d3_width = null;
    this._d3_height = null;
  }
  Scene.prototype = new THREE.Scene();
  Scene.prototype.constructor = Scene;
  Scene.prototype._setBounds = function () {
    this.renderer.setSize(this._d3_width, this._d3_height);
    var aspect = this.camera.aspect;
    this.camera.position.set((this._d3_width * UNIT_SIZE) / 2, (this._d3_height * UNIT_SIZE) / 2, Math.max((this._d3_width * UNIT_SIZE) / Math.sqrt(2), (this._d3_height * UNIT_SIZE) / Math.sqrt(2)));
    this.controls.target.set(this.camera.position.x, this.camera.position.y, 0);
    console.log("camera:", this.camera.position.x, this.camera.position.y, this.camera.position.z);

    //this.camera.position.z = 1000;
  };
  Scene.prototype.setAttribute = function (name, value) {
    switch (name) {
      case "width":
        this._d3_width = value;
        if (this._d3_height) this._setBounds();
        break;
      case "height":
        this._d3_height = value;
        if (this._d3_width) this._setBounds();
        break;
    }
  };

  function fabVis() {
    var camera, scene, controls, renderer;

    // - scene
    scene = new Scene();
    threeJsScene = scene;

    // - camera
    camera = scene.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    /*
          camera = scene.camera = new THREE.OrthographicCamera(
          window.innerWidth / -2, window.innerWidth / 2,
          window.innerHeight / 2, window.innerHeight / -2,
          1, 50000);
          */
    scene.add(camera);

    // - controls
    // from misc_camera_trackball.html example
    controls = scene.controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [65, 83, 68];

    controls.addEventListener("change", render);

    // - light
    /*
          var pointLight = new THREE.PointLight(0xFFFFFF);
          pointLight.position.set(10, 50, 130);
          scene.add(pointLight);
          */

    var spotlight = new THREE.SpotLight(0xffffff);
    spotlight.position.set(-50000, 50000, 100000);
    scene.add(spotlight);

    var backlight = new THREE.SpotLight(0x888888);
    backlight.position.set(50000, -50000, -100000);
    scene.add(backlight);

    /*
          var ambientLight = new THREE.AmbientLight(0x888888);
          scene.add(ambientLight);
          */

    function helperPlanes(maxBound) {
      var geom = new THREE.PlaneGeometry(maxBound, maxBound, 4, 4);
      for (var i = 0; i < 4; i++) {
        var color, cx, cy;
        switch (i) {
          case 0:
            color = 0xff0000;
            cx = maxBound / 2;
            cy = maxBound / 2;
            break;
          case 1:
            color = 0x00ff00;
            cx = maxBound / 2;
            cy = -maxBound / 2;
            break;
          case 2:
            color = 0x0000ff;
            cx = -maxBound / 2;
            cy = -maxBound / 2;
            break;
          case 3:
            color = 0xffff00;
            cx = -maxBound / 2;
            cy = maxBound / 2;
            break;
        }
        var material = new THREE.MeshLambertMaterial({ color: color });
        var mesh = new THREE.Mesh(geom, material);
        mesh.position.set(cx, cy, -1);

        scene.add(mesh);
      }
    }
    //helperPlanes(UNIT_SIZE * 225);

    // - renderer
    renderer = scene.renderer = new THREE.WebGLRenderer({
      // too slow...
      //antialias: true,
    });
    this.appendChild(renderer.domElement);

    // - stats
    var stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.top = "0px";
    stats.domElement.style.zIndex = 100;
    this.appendChild(stats.domElement);

    function animate() {
      requestAnimationFrame(animate, renderer.domElement);
      controls.update();
    }

    function render() {
      renderer.render(scene, camera);
      stats.update();
    }

    animate();

    return scene;
  }
}

var $d3g = {};
d3threeD($d3g);

function drawShape() {
  let svgString = document.querySelector("#batman-path").getAttribute("d");
  let shape = transformSVGPathExposed(svgString);
  // return the shape
  return shape;
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
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  initDefaultLighting(scene);
  groundPlane = addLargeGroundPlane(scene);
  groundPlane.position.y = -30;

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
  params.mesh.rotation.y = step += 0.01;
  params.mesh.rotation.x = step;
  params.mesh.rotation.z = step;
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
    let self = this;

    this.appliedMaterial = applyMeshNormalMaterial;
    this.castShadow = true;
    this.groundPlaneVisible = true;

    this.amount = 2;
    this.bevelThickness = 2;
    this.bevelSize = 0.5;
    this.bevelEnabled = true;
    this.bevelSegments = 3;
    this.bevelEnabled = true;
    this.curveSegments = 12;
    this.steps = 1;

    // redraw function, updates the control UI and recreates the geometry.
    this.redraw = () => {
      redrawGeometryAndUpdateUI(gui, scene, params, () => {
        let options = {
          amount: params.amount,
          bevelThickness: params.bevelThickness,
          bevelSize: params.bevelSize,
          bevelSegments: params.bevelSegments,
          bevelEnabled: params.bevelEnabled,
          curveSegments: params.curveSegments,
          steps: params.steps,
        };

        let geom = new THREE.ExtrudeGeometry(drawShape(), options);
        geom.center();

        return geom;
      });
    };
  })();

  gui = new GUI();
  gui.add(params, "amount", 0, 20).onChange(params.redraw);
  gui.add(params, "bevelThickness", 0, 10).onChange(params.redraw);
  gui.add(params, "bevelSize", 0, 10).onChange(params.redraw);
  gui.add(params, "bevelSegments", 0, 30).step(1).onChange(params.redraw);
  gui.add(params, "bevelEnabled").onChange(params.redraw);
  gui.add(params, "curveSegments", 1, 30).step(1).onChange(params.redraw);
  gui.add(params, "steps", 1, 5).step(1).onChange(params.redraw);

  // add a material section, so we can switch between materials
  gui
    .add(params, "appliedMaterial", {
      meshNormal: applyMeshNormalMaterial,
      meshStandard: applyMeshStandardMaterial,
    })
    .onChange(params.redraw);

  gui.add(params, "castShadow").onChange(function (e) {
    params.mesh.castShadow = e;
  });
  gui.add(params, "groundPlaneVisible").onChange(function (e) {
    groundPlane.material.visible = e;
  });

  // initialize the first redraw so everything gets initialized
  params.redraw();

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
