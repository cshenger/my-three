import * as THREE from "three";

export const addGeometry = (scene, geom, name, texture, gui, controls) => {
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.2,
    roughness: 0.07,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;

  scene.add(mesh);
  addBasicMaterialSettings(gui, controls, mat, name + "-THREE.Material");
  addSpecificMaterialSettings(gui, controls, mat, name + "-THREE.MeshStandardMaterial");

  return mesh;
};

export const addGeometryWithMaterial = (scene, geom, name, gui, controls, material) => {
  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;

  scene.add(mesh);
  addBasicMaterialSettings(gui, controls, material, name + "-THREE.Material");
  addSpecificMaterialSettings(gui, controls, material, name + "-Material");

  return mesh;
};

/**
 * Add a folder to the gui containing the basic material properties.
 *
 * @param gui the gui to add to
 * @param controls the current controls object
 * @param material the material to control
 * @param geometry the geometry we're working with
 * @param name optionally the name to assign to the folder
 */
function addBasicMaterialSettings(gui, controls, material, name) {
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

function addSpecificMaterialSettings(gui, controls, material, name) {
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
