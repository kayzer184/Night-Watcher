import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import addStreetLight from "./Street Light";

function MapLoader(lightObjects, hitboxes, collidableObjects, scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.02);
  scene.add(ambientLight);

  const MapModelLoader = new FBXLoader();
  MapModelLoader.load("/Models/Map.fbx",
    (object) => {
      object.scale.set(0.1, 0.1, 0.1);
      object.position.set(0, 0, 0);

      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const box = new THREE.Box3().setFromObject(child);
          collidableObjects.push({ object: child, box: box });
        }
      });

      scene.add(object);
    },
    undefined,
    (error) => {
      console.error("Error loading Map model:", error);
    }
  );

  addStreetLight(lightObjects, hitboxes, scene, -223, 108, 55);
  addStreetLight(lightObjects, hitboxes, scene, -975, 108, 55);
  addStreetLight(lightObjects, hitboxes, scene, -975, 108, 55);
  addStreetLight(lightObjects, hitboxes, scene, -1558, 108, 55);
  addStreetLight(lightObjects, hitboxes, scene, -2200, 108, 55);

  addStreetLight(lightObjects, hitboxes, scene, 60, 108, 330, 0, Math.PI / 2, 0);
  addStreetLight(lightObjects, hitboxes, scene, -655, 108, 180, 0, Math.PI * 1.5, 0);
  addStreetLight(lightObjects, hitboxes, scene, -1250, 108, 180, 0, Math.PI * 1.5, 0);
  addStreetLight(lightObjects, hitboxes, scene, -1855, 108, 300, 0, Math.PI * 1.5, 0);
  addStreetLight(lightObjects, hitboxes, scene, -2350, 108, 300, 0, Math.PI / 2, 0);

  addStreetLight(lightObjects, hitboxes, scene, 60, 108, 930, 0, Math.PI / 2, 0);
  addStreetLight(lightObjects, hitboxes, scene, -245, 108, 1117, 0, Math.PI / 2, 0);
  addStreetLight(lightObjects, hitboxes, scene, -655, 108, 780, 0, Math.PI * 1.5, 0);

  addStreetLight(lightObjects, hitboxes, scene, 60, 108, 1380, 0, Math.PI / 2, 0);
  addStreetLight(lightObjects, hitboxes, scene, -655, 108, 1380, 0, Math.PI * 1.5, 0);
}

export default MapLoader;