import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const NPCSpawns = [
  [0, 0, 0]
];

export default function NPCLoader(NPCObjects, mixers, scene) {
  const NPCModelLoader = new FBXLoader();

  // Загружаем модель NPC
  NPCModelLoader.load("/Models/NPC.fbx", (NPC) => {
    console.log("NPC модель загружена:", NPC);  // Логируем загруженную модель

    const NPCAnimationLoader = new FBXLoader();
    
    // Загружаем анимацию
    NPCAnimationLoader.load("/Models/Walking (1).fbx", (Animation) => {
      console.log("Анимация загружена:", Animation);  // Логируем загруженную анимацию

      // Проверяем, есть ли анимации
      if (Animation.animations.length === 0) {
        console.error("Анимации не найдены в файле Walking (1).fbx");
        return;
      }

      // Логируем структуру анимации
      console.log("Анимации внутри файла:", Animation.animations);

      // Убедимся, что анимации присваиваются NPC
      NPC.animations = Animation.animations;

      // Создаем анимационный миксер для NPC
      const mixer = new THREE.AnimationMixer(NPC);
      mixers.push(mixer);

      // Применяем первую анимацию к NPC
      const action = mixer.clipAction(NPC.animations[0]);
      action.play();

      // Настройка и добавление NPC в сцену
      NPC.scale.set(0.1, 0.1, 0.1);
      NPC.position.set(...NPCSpawns[Math.floor(Math.random() * NPCSpawns.length)]);
      scene.add(NPC);

      // Добавляем NPC в список объектов
      NPCObjects.push(NPC);

      // Настройка теней
      NPC.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Если у дочернего объекта есть анимации, применяем их
          if (child.animations && child.animations.length > 0) {
            const childMixer = new THREE.AnimationMixer(child);
            mixers.push(childMixer);
            const childAction = childMixer.clipAction(child.animations[0]);
            childAction.play();
          }
        }
      });

    }, undefined, (error) => {
      console.error("Error loading NPC animation:", error);
    });

  }, undefined, (error) => {
    console.error("Error loading NPC model:", error);
  });
}
