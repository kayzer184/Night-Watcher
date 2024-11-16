import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const NPCSpawns = [
  [80, 2, -80],
  [-80, 2, -80],
];

const NPCPaths = [
  [
    { x: 80, z: -80 },
    { x: 80, z: 515 },
    { x: -80, z: 515 },
    { x: -80, z: -80 },
  ],
  [
    { x: -80, z: -80 },
    { x: -80, z: 515 },
    { x: 80, z: 515 },
    { x: 80, z: -80 },
  ],
];

export default function NPCLoader(NPCObjects, mixers, scene) {
  const NPCModelLoader = new FBXLoader();

  NPCSpawns.forEach((spawn, index) => {
    NPCModelLoader.load(
      "/Models/NPC.fbx",
      (NPC) => {
        const mixer = new THREE.AnimationMixer(NPC);
        mixers.push(mixer);

        const action = mixer.clipAction(NPC.animations[0], NPC);
        action.play();

        NPC.scale.set(0.12, 0.12, 0.12);
        NPC.position.set(...spawn);
        scene.add(NPC);

        const npcData = {
          model: NPC,
          mixer: mixer,
          path: NPCPaths[index],
          currentTarget: 1,
          speed: 0.33,
          initialPosition: { x: spawn[0], y: spawn[1], z: spawn[2] }, // Добавляем стартовую позицию
        };
        NPCObjects.push(npcData);

        NPC.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      },
      undefined,
      (error) => {
        console.error("Error loading NPC model:", error);
      }
    );
  });
}
