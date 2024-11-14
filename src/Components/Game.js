import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import "../Sass/Game.scss";
import MapLoader from "./MapLoader";
import NPCLoader from "./NPCLoader";
import Interface from "./Interface";

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
  const [energy, setEnergy] = useState(100);

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

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxPolarAngle = Math.PI / 2;

    // Загрузка карты и NPC
    MapLoader(lightObjects, hitboxes, collidableObjects, scene);
    NPCLoader(NPCObjects, mixers, scene);

    const toggleLight = (light, index) => {
      if (!light.visible && energy >= 10) {  // Убедитесь, что энергии достаточно для включения
        setEnergy((prevEnergy) => Math.max(prevEnergy - 10, 0)); // Уменьшение на 10
        light.visible = true;
      } else if (light.visible) {
        light.visible = false;
      }
      console.log(`Свет ${index} переключен:`, light.visible);
    };
    

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        hitboxes.forEach(({ box }, index) => {
          if (box.containsPoint(intersection.point)) {
            const light = lightObjects[index].light;
            toggleLight(light, index);
          }
        });
      } else {
        console.log("Нет пересечений для клика");
      }
    };

    window.addEventListener("click", onMouseClick, false);

    const moveNpc = () => {
      NPCObjects.forEach((npcData) => {
        const { model, path, speed } = npcData;
        const target = path[npcData.currentTarget];

        const direction = new THREE.Vector3(
          target.x - model.position.x,
          0,
          target.z - model.position.z
        );

        if (direction.length() < speed) {
          npcData.currentTarget = (npcData.currentTarget + 1) % path.length;
        } else {
          direction.normalize();
          model.position.addScaledVector(direction, speed);

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
      controls.update();
      mixers.forEach((mixer) => mixer.update(0.01));
      moveNpc();
      lightObjects.forEach(({ light }) => {
        light.updateMatrixWorld(true);
        light.shadow.needsUpdate = true;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("click", onMouseClick, false);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef}>
      <div className="Interface-Box">
        <Interface NPCMood={Math.floor(npcMood)} Energy={energy} />
      </div>
    </div>
  );
}

export default Game;
