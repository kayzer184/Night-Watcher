import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const NPCSpawns = [
  [80, 0, -80],
  [-80, 0, -80],
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
      "/Models/Walking (4).fbx",
      (NPC) => {
        console.log("NPC модель загружена:", NPC);

        const NPCAnimationLoader = new FBXLoader();
        NPCAnimationLoader.load(
          "/Models/Walking (2).fbx",
          (Animation) => {
            if (Animation.animations.length === 0) {
              console.error("Анимации не найдены в файле Walking (1).fbx");
              return;
            }

            //NPC.animations = Animation.animations;
            console.log("Loaded animations:", Animation.animations);

            const mixer = new THREE.AnimationMixer(NPC);
            mixers.push(mixer);

            const action = mixer.clipAction(NPC.animations[0], NPC);
            console.log("Animation action created:", action);
            action.play();

            NPC.scale.set(0.3, 0.3, 0.3);
            NPC.position.set(...spawn);
            scene.add(NPC);

            const npcData = {
              model: NPC,
              mixer: mixer,
              path: NPCPaths[index],
              currentTarget: 1,
              speed: 0.33,
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
            console.error("Error loading NPC animation:", error);
          }
        );
      },
      undefined,
      (error) => {
        console.error("Error loading NPC model:", error);
      }
    );
  });
}
