import * as THREE from "three";

export const initRenderer = (container, additionalProperties) => {
  let props = typeof additionalProperties !== "undefined" && additionalProperties ? additionalProperties : {};
  let renderer = new THREE.WebGLRenderer(props);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  return renderer;
};

export const initCamera = (scene) => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.x = -20;
  camera.position.y = 25;
  camera.position.z = 100;
  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

  return camera;
};

export const initCameraPos = (initialPosition) => {
  let position = initialPosition !== undefined ? initialPosition : new THREE.Vector3(-30, 40, 30);

  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.copy(position);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  return camera;
};

export const initControls = (camera, renderer, OrbitControls) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.addEventListener("change", render);
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.enablePan = false;

  return controls;
};

export const addGroundPlane = (scene) => {
  // create the ground plane
  const planeGeometry = new THREE.PlaneGeometry(60, 20, 120, 120);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 15;
  plane.position.y = 0;
  plane.position.z = 0;

  scene.add(plane);

  return plane;
};

export const addHouseAndTree = (scene) => {
  const createBoundingWall = (scene) => {
    let wallLeft = new THREE.BoxGeometry(70, 2, 2);
    let wallRight = new THREE.BoxGeometry(70, 2, 2);
    let wallTop = new THREE.BoxGeometry(2, 2, 50);
    let wallBottom = new THREE.BoxGeometry(2, 2, 50);

    let wallMaterial = new THREE.MeshPhongMaterial({
      color: 0xa0522d,
    });

    let wallLeftMesh = new THREE.Mesh(wallLeft, wallMaterial);
    let wallRightMesh = new THREE.Mesh(wallRight, wallMaterial);
    let wallTopMesh = new THREE.Mesh(wallTop, wallMaterial);
    let wallBottomMesh = new THREE.Mesh(wallBottom, wallMaterial);

    wallLeftMesh.position.set(15, 1, -25);
    wallRightMesh.position.set(15, 1, 25);
    wallTopMesh.position.set(-19, 1, 0);
    wallBottomMesh.position.set(49, 1, 0);

    scene.add(wallLeftMesh);
    scene.add(wallRightMesh);
    scene.add(wallBottomMesh);
    scene.add(wallTopMesh);
  };

  const createGroundPlane = (scene) => {
    // create the ground plane
    let planeGeometry = new THREE.PlaneGeometry(70, 50);
    let planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x9acd32,
    });
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    scene.add(plane);
  };

  const createHouse = (scene) => {
    let roof = new THREE.ConeGeometry(5, 4);
    let base = new THREE.CylinderGeometry(5, 5, 6);

    // create the mesh
    let roofMesh = new THREE.Mesh(
      roof,
      new THREE.MeshPhongMaterial({
        color: 0x8b7213,
      })
    );
    let baseMesh = new THREE.Mesh(
      base,
      new THREE.MeshPhongMaterial({
        color: 0xffe4c4,
      })
    );

    roofMesh.position.set(25, 8, 0);
    baseMesh.position.set(25, 3, 0);

    roofMesh.receiveShadow = true;
    baseMesh.receiveShadow = true;
    roofMesh.castShadow = true;
    baseMesh.castShadow = true;

    scene.add(roofMesh);
    scene.add(baseMesh);
  };

  /**
   * Add the tree to the scene
   * @param scene The scene to add the tree to
   */
  const createTree = (scene) => {
    let trunk = new THREE.BoxGeometry(1, 8, 1);
    let leaves = new THREE.SphereGeometry(4);

    // create the mesh
    let trunkMesh = new THREE.Mesh(
      trunk,
      new THREE.MeshPhongMaterial({
        color: 0x8b4513,
      })
    );
    let leavesMesh = new THREE.Mesh(
      leaves,
      new THREE.MeshPhongMaterial({
        color: 0x00ff00,
      })
    );

    // position the trunk. Set y to half of height of trunk
    trunkMesh.position.set(-10, 4, 0);
    leavesMesh.position.set(-10, 12, 0);

    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    leavesMesh.castShadow = true;
    leavesMesh.receiveShadow = true;

    scene.add(trunkMesh);
    scene.add(leavesMesh);
  };

  createBoundingWall(scene);
  createGroundPlane(scene);
  createHouse(scene);
  createTree(scene);
};

export const addDefaultCubeAndSphere = (scene) => {
  // create a cube
  const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xff0000,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;

  // position the cube
  cube.position.x = -4;
  cube.position.y = 3;
  cube.position.z = 0;

  // add the cube to the scene
  scene.add(cube);

  const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
  const sphereMaterial = new THREE.MeshLambertMaterial({
    color: 0x7777ff,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  // position the sphere
  sphere.position.x = 20;
  sphere.position.y = 0;
  sphere.position.z = 2;
  sphere.castShadow = true;

  // add the sphere to the scene
  scene.add(sphere);

  return {
    cube: cube,
    sphere: sphere,
  };
};

export const initTrackballControls = (camera, renderer, TrackballControls) => {
  const trackballControls = new TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

  return trackballControls;
};

/**
 * Add a simple ground plance to the provided scene
 *
 * @param {THREE.Scene} scene
 */
export const addLargeGroundPlane = (scene, useTexture) => {
  let withTexture = useTexture !== undefined ? useTexture : false;

  // create the ground plane
  const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
  });
  if (withTexture) {
    const textureLoader = new THREE.TextureLoader();
    planeMaterial.map = textureLoader.load("../../public/textures/general/floor-wood.jpg");
    planeMaterial.map.wrapS = THREE.RepeatWrapping;
    planeMaterial.map.wrapT = THREE.RepeatWrapping;
    planeMaterial.map.repeat.set(80, 80);
  }
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;

  scene.add(plane);

  return plane;
};

/**
 * Remove a folder from the dat.gui
 *
 * @param {*} gui
 * @param {*} folder
 */
function guiRemoveFolder(gui, folder) {
  if (folder && folder.name && gui.__folders[folder.name]) {
    gui.__folders[folder.name].close();
    gui.__folders[folder.name].domElement.parentNode.parentNode.removeChild(gui.__folders[folder.name].domElement.parentNode);
    delete gui.__folders[folder.name];
    gui.onResize();
  }
}

/**
 * Add a folder to the gui containing the basic material properties.
 *
 * @param gui the gui to add to
 * @param controls the current controls object
 * @param material the material to control
 * @param geometry the geometry we're working with
 * @param name optionally the name to assign to the folder
 */
export function addBasicMaterialSettings(gui, controls, material, name) {
  let folderName = name !== undefined ? name : "THREE.Material";

  controls.material = material;

  let folder = gui.addFolder(folderName);
  folder.add(controls.material, "id");
  folder.add(controls.material, "uuid");
  folder.add(controls.material, "name");
  folder.add(controls.material, "opacity", 0, 1, 0.01);
  folder.add(controls.material, "transparent");
  folder.add(controls.material, "overdraw", 0, 1, 0.01);
  folder.add(controls.material, "visible");
  folder.add(controls.material, "side", { FrontSide: 0, BackSide: 1, BothSides: 2 }).onChange(function (side) {
    controls.material.side = parseInt(side);
  });

  folder.add(controls.material, "colorWrite");
  folder.add(controls.material, "flatShading").onChange(function (shading) {
    controls.material.flatShading = shading;
    controls.material.needsUpdate = true;
  });
  folder.add(controls.material, "premultipliedAlpha");
  folder.add(controls.material, "dithering");
  folder.add(controls.material, "shadowSide", { FrontSide: 0, BackSide: 1, BothSides: 2 });
  folder.add(controls.material, "vertexColors", { NoColors: THREE.NoColors, FaceColors: THREE.FaceColors, VertexColors: THREE.VertexColors }).onChange(function (vertexColors) {
    material.vertexColors = parseInt(vertexColors);
  });
  folder.add(controls.material, "fog");

  return folder;
}

export function addSpecificMaterialSettings(gui, controls, material, name) {
  controls.material = material;

  let folderName = name !== undefined ? name : "THREE." + material.type;
  let folder = gui.addFolder(folderName);
  switch (material.type) {
    case "MeshNormalMaterial":
      folder.add(controls.material, "wireframe");
      return folder;

    case "MeshPhongMaterial":
      controls.specular = material.specular.getStyle();
      folder.addColor(controls, "specular").onChange(function (e) {
        material.specular.setStyle(e);
      });
      folder.add(material, "shininess", 0, 100, 0.01);
      return folder;

    case "MeshStandardMaterial":
      controls.color = material.color.getStyle();
      folder.addColor(controls, "color").onChange(function (e) {
        material.color.setStyle(e);
      });
      controls.emissive = material.emissive.getStyle();
      folder.addColor(controls, "emissive").onChange(function (e) {
        material.emissive.setStyle(e);
      });
      folder.add(material, "metalness", 0, 1, 0.01);
      folder.add(material, "roughness", 0, 1, 0.01);
      folder.add(material, "wireframe");

      return folder;
  }
}

export const redrawGeometryAndUpdateUI = (gui, scene, controls, geomFunction) => {
  guiRemoveFolder(gui, controls.specificMaterialFolder);
  guiRemoveFolder(gui, controls.currentMaterialFolder);
  if (controls.mesh) scene.remove(controls.mesh);
  const changeMat = eval("(" + controls.appliedMaterial + ")");
  if (controls.mesh) {
    controls.mesh = changeMat(geomFunction(), controls.mesh.material);
  } else {
    controls.mesh = changeMat(geomFunction());
  }

  controls.mesh.castShadow = controls.castShadow;
  scene.add(controls.mesh);
  controls.currentMaterialFolder = addBasicMaterialSettings(gui, controls, controls.mesh.material);
  controls.specificMaterialFolder = addSpecificMaterialSettings(gui, controls, controls.mesh.material);
};

/**
 * Apply a simple standard material to the passed in geometry and return the mesh
 *
 * @param {*} geometry
 * @param {*} material if provided use this meshnormal material instead of creating a new material
 *                     this material will only be used if it is a meshnormal material.
 */
export const applyMeshStandardMaterial = (geometry, material) => {
  if (!material || material.type !== "MeshStandardMaterial") {
    let material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    material.side = THREE.DoubleSide;
  }

  return new THREE.Mesh(geometry, material);
};

/**
 * Apply meshnormal material to the geometry, optionally specifying whether
 * we want to see a wireframe as well.
 *
 * @param {*} geometry
 * @param {*} material if provided use this meshnormal material instead of creating a new material
 *                     this material will only be used if it is a meshnormal material.
 */
export const applyMeshNormalMaterial = (geometry, material) => {
  if (!material || material.type !== "MeshNormalMaterial") {
    material = new THREE.MeshNormalMaterial();
    material.side = THREE.DoubleSide;
  }

  return new THREE.Mesh(geometry, material);
};

export const initDefaultLighting = (scene, initialPosition) => {
  const position = initialPosition !== undefined ? initialPosition : new THREE.Vector3(-10, 30, 40);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.copy(position);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.fov = 15;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.05;
  spotLight.name = "spotLight";

  scene.add(spotLight);

  const ambientLight = new THREE.AmbientLight(0x343434);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);
};

export const initDefaultDirectionalLighting = (scene, initialPosition) => {
  const position = initialPosition !== undefined ? initialPosition : new THREE.Vector3(100, 200, 200);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.copy(position);
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.castShadow = true;
  dirLight.shadow.camera.left = -200;
  dirLight.shadow.camera.right = 200;
  dirLight.shadow.camera.top = 200;
  dirLight.shadow.camera.bottom = -200;

  scene.add(dirLight);

  var ambientLight = new THREE.AmbientLight(0x343434);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);
};
