import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import "../Sass/Game.scss";
import MapLoader from "./MapLoader";
import NPCLoader from "./NPCLoader";

function Game() {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [collidableObjects, mixers, lightObjects, hitboxes, NPCObjects] = [
    [],
    [],
    [],
    [],
    [],
  ];
  const [npcMood, setNpcMood] = useState(100);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      10,
      10000
    );
    camera.position.set(0, 500, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;

    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxPolarAngle = Math.PI / 2;

    MapLoader(lightObjects, hitboxes, collidableObjects, scene);
    NPCLoader(NPCObjects, mixers, scene);

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        for (let i = 0; i < hitboxes.length; i++) {
          const { object, box } = hitboxes[i];
          if (box.containsPoint(intersection.point)) {
            const light = lightObjects[i].light;
            light.visible = !light.visible;

            console.log("Свет переключен:", light.visible);

            lightObjects.forEach(({ light, model }) => {
              light.updateMatrixWorld(true);
              model.updateMatrixWorld(true);
              light.shadow.needsUpdate = true;
            });

            renderer.render(scene, camera);
            return;
          }
        }
      } else {
        console.log("Нет пересечений для клика");
      }
    };

    window.addEventListener("click", onMouseClick, false);

    const moveNpc = () => {
      NPCObjects.forEach((npcData) => {
        const { model, path, speed } = npcData;
        const target = path[npcData.currentTarget];

        // Вычисляем направление к следующей точке
        const direction = new THREE.Vector3(
          target.x - model.position.x,
          0,
          target.z - model.position.z
        );

        if (direction.length() < speed) {
          // Если NPC достигает текущей цели, переключаемся на следующую
          npcData.currentTarget = (npcData.currentTarget + 1) % path.length;
        } else {
          // Обновляем позицию
          direction.normalize();
          model.position.addScaledVector(direction, speed);

          // Поворот модели в направлении движения
          if (Math.abs(direction.x) > Math.abs(direction.z)) {
            model.rotation.y = direction.x > 0 ? Math.PI / 2 : -Math.PI / 2;
          } else {
            model.rotation.y = direction.z > 0 ? 0 : Math.PI;
          }
        }

        let isInLight = false;
        lightObjects.forEach((lightObject) => {
          const distance = model.position.distanceTo(
            lightObject.model.position
          );
          if (lightObject.light.visible && distance < 300) {
            isInLight = true;
          }
        });

        setNpcMood((prevMood) => {
          return isInLight
            ? Math.min(100, prevMood + 0.1)
            : Math.max(0, prevMood - 0.1);
        });
      });
    };


    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      mixers.forEach((mixer) => {
        mixer.update(0.01);
      });
      moveNpc();
      lightObjects.forEach(({ light }) => {
        light.updateMatrixWorld(true);
        light.shadow.needsUpdate = true;
      });
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  return (
    <div ref={mountRef}>
      <div className="Interface">
        Уровень настроения NPC: {Math.floor(npcMood)}
      </div>
    </div>
  );
}

export default Game;
