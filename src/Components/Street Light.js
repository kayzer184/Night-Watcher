import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

function addStreetLight(
  lightObjects,
  hitboxes,
  scene,
  x,
  y,
  z,
  xR = 0,
  yR = 0,
  zR = 0
) {
  const StreetLightModelLoader = new FBXLoader();
  StreetLightModelLoader.load(
    "/Models/Street Light.fbx",
    (object) => {
      object.scale.set(0.09, 0.09, 0.09);

      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const clone = object.clone();
      clone.position.set(x, y, z);
      clone.rotation.set(xR, yR, zR);
      scene.add(clone);

      const targetObject = new THREE.Object3D();
      targetObject.position.set(x, y - 5, z);
      scene.add(targetObject);

      const modelLight = new THREE.SpotLight(
        0xffffff,
        1000,
        1000,
        Math.PI / 2,
        0.3,
        1.25
      );
      modelLight.position.set(x, y, z);
      modelLight.castShadow = true;
      modelLight.shadow.mapSize.width = 512;
      modelLight.shadow.mapSize.height = 512;
      modelLight.shadow.bias = -0.01;
      modelLight.visible = false;
      modelLight.target = targetObject;

      scene.add(modelLight);
      lightObjects.push({
        model: clone,
        light: modelLight,
        initialState: modelLight.visible,
      });

      const box = new THREE.Box3().setFromObject(clone);
      box.expandByVector(new THREE.Vector3(45, 45, 45));
      hitboxes.push({ object: clone, box: box });
    },
    undefined,
    (error) => {
      console.error("Error loading Street Light model:", error);
    }
  );
}

export default addStreetLight;