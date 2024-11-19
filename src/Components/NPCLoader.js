import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const NPCSpawns = [
  [80, 2, -80],
  [-80, 2, -80],
  [-680, 2, -80],
  [80, 2, 1280],
  [-680, 2, 1280],
];

const NPCPaths = [
  [
    { x: 80, z: -80 },
    { x: 80, z: 1280 },
    { x: -680, z: 1280 },
    { x: -680, z: -80 },
    { x: -680, z: 520 },
    { x: -80, z: 520 },
    { x: -80, z: -80 },
  ],
  [
    { x: -80, z: -80 },
    { x: 80, z: -80 },
    { x: 75, z: 675 },
    { x: -520, z: 680 },
    { x: -520, z: 1280 },
    { x: -680, z: 1280 },
    { x: -680, z: 1110 },
    { x: -520, z: 1110 },
    { x: -520, z: 680 },
    { x: -510, z: 80 },
    { x: -80, z: 80 },
    { x: -80, z: -80 },
  ],
  [
    { x: -680, z: -80 },
    { x: -685, z: 510 },
    { x: -510, z: 520 },
    { x: -80, z: 520 },
    { x: -80, z: 1110 },
    { x: -80, z: 1280 },
    { x: -520, z: 1280 },
    { x: -520, z: 1110 },
    { x: -520, z: 680 },
    { x: -80, z: 680 },
    { x: -80, z: -80 },
    { x: -680, z: -80 },
  ],
  [
    { x: 80, z: 1280 },
    { x: 80, z: 1120 },
    { x: -80, z: 1120 },
    { x: -80, z: 520 },
    { x: -80, z: 520 },
    { x: -680, z: 520 },
    { x: -680, z: 80 },
    { x: 80, z: 80 },
    { x: 80, z: 680 },
    { x: -680, z: 680 },
    { x: -680, z: 1120 },
    { x: -520, z: 1120 },
    { x: -520, z: 1280 },
    { x: 80, z: 1280 },
  ],
  [
    { x: -680, z: 1280 },
    { x: -680, z: 680 },
    { x: -80, z: 680 },
    { x: -80, z: 1120 },
    { x: 80, z: 1120 },
    { x: 80, z: 1280 },
    { x: -680, z: 1280 },
  ],
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default function NPCLoader(NPCObjects, NPCMaxCount, mixers, scene) {
  const NPCModelLoader = new FBXLoader();

  const indices = Array.from({ length: NPCSpawns.length }, (_, i) => i);
  shuffle(indices);
  const spawnIndices = indices.slice(0, Math.min(NPCMaxCount, NPCSpawns.length));

  spawnIndices.forEach((index) => {
    NPCModelLoader.load(
      `/Models/NPC_${Math.round(Math.random() * 0)}.fbx`,
      (NPC) => {
        const mixer = new THREE.AnimationMixer(NPC);
        mixers.push(mixer);

        const action = mixer.clipAction(NPC.animations[0], NPC);
        action.play();

        const spawn = NPCSpawns[index];
        const path = NPCPaths[index];

        NPC.scale.set(0.12, 0.12, 0.12);
        NPC.position.set(spawn[0], spawn[1], spawn[2]);
        scene.add(NPC);

        const npcData = {
          model: NPC,
          mixer: mixer,
          path: path,
          currentTarget: 1,
          speed: 0.33,
          initialPosition: { x: spawn[0], y: spawn[1], z: spawn[2] },
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
