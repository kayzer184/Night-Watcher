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
  const [collidableObjects, mixers, hitboxes] = [[], [], []];
  const NPCObjects = useRef([]);
  const [npcMood, setNpcMood] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isWin, setIsWin] = useState(null);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const energyConsumptionInterval = 1000;
  const lastEnergyUpdateRef = useRef(Date.now());
  const lightObjects = useRef([]);

  const resetGame = () => {
    setIsWin(null);
    setNpcMood(100);
    setEnergy(100);
    setTimeLeft(60);
    isPausedRef.current = false;
    setIsPaused(false);

    NPCObjects.current.forEach((npc) => {
      npc.mixer.timeScale = isPausedRef.current ? 0 : 1;
      npc.currentTarget = 0;
      npc.model.position.set(
        npc.initialPosition.x,
        npc.initialPosition.y,
        npc.initialPosition.z
      );
    });

    lightObjects.current.forEach((lightObject) => {
      lightObject.light.visible = lightObject.initialState;
    });

    lastEnergyUpdateRef.current = Date.now();
  };

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

    MapLoader(lightObjects.current, hitboxes, collidableObjects, scene);
    NPCLoader(NPCObjects.current, 3, mixers, scene);

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const toggleLight = (light, index) => {
      light.visible = !light.visible;
    };

    const onMouseClick = (event) => {
      if (!isPausedRef.current) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          const intersection = intersects[0];
          console.log(
            `x: ${intersection.point.x}, y: ${intersection.point.y}, z: ${intersection.point.z}`
          );
          hitboxes.forEach(({ box }, index) => {
            if (box.containsPoint(intersection.point)) {
              const light = lightObjects.current[index].light;
              toggleLight(light, index);
            }
          });
        }
      }
    };

    window.addEventListener("click", onMouseClick, false);
    window.addEventListener("resize", onWindowResize);
    const moveNpc = () => {
      NPCObjects.current.forEach((npcData) => {
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
        lightObjects.current.forEach((lightObject) => {
          const distance = model.position.distanceTo(
            lightObject.model.position
          );
          if (lightObject.light.visible && distance < 300) {
            isInLight = true;
          }
        });

        setNpcMood((prevMood) => {
          const targetMood = isInLight
            ? Math.min(100, prevMood + 0.005)
            : Math.max(0, prevMood - 0.005);

          return prevMood + (targetMood - prevMood);
        });
      });
    };

    const updateEnergy = () => {
      const currentTime = Date.now();
      if (
        currentTime - lastEnergyUpdateRef.current >=
        energyConsumptionInterval
      ) {
        lastEnergyUpdateRef.current = currentTime;

        const totalEnergyConsumption = lightObjects.current.reduce(
          (acc, lightObject) => {
            if (lightObject.light.visible) {
              return acc + (lightObject.energyConsumption || 1);
            }
            return acc;
          },
          0
        );

        setEnergy((prevEnergy) =>
          Math.max(0, prevEnergy - totalEnergyConsumption)
        );
      }
    };

    const animate = () => {
      controls.update();
      mixers.forEach((mixer) => mixer.update(0.01));
      if (!isPausedRef.current) {
        moveNpc();
        updateEnergy();
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("click", onMouseClick, false);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 || npcMood === 0 || energy === 0) {
      isPausedRef.current = true;
      setIsPaused(true);
      endGame();
    }
  }, [timeLeft, npcMood, energy]);

  const handlePause = () => {
    if (isWin === null) {
      isPausedRef.current = !isPausedRef.current;
      NPCObjects.current.forEach((npcData) => {
        if (npcData.mixer) { // Убедитесь, что mixer существует
          npcData.mixer.timeScale = isPausedRef.current ? 0 : 1;
        } else {
          console.warn('Mixer is undefined for NPC:', npcData);
        }
      });
      setIsPaused((prevPause) => !prevPause);
    }
  };  
  const endGame = () => {
    NPCObjects.current.forEach((npcData) => {
      if (npcData.mixer) { // Убедитесь, что mixer существует
        npcData.mixer.timeScale = isPausedRef.current ? 0 : 1;
      } else {
        console.warn('Mixer is undefined for NPC:', npcData);
      }
    });
    if (timeLeft === 0 && npcMood !== 0 && energy !== 0) {
      setIsWin(true);
    } else if (npcMood === 0 || energy === 0) {
      setIsWin(false);
    }
  };
  return (
    <div ref={mountRef}>
      <div className="Interface-Box">
        <Interface
          NPCMood={Math.round(npcMood)}
          Energy={energy}
          timeLeft={timeLeft}
          onPause={handlePause}
          onRestart={resetGame}
          isPaused={isPaused}
          isWin={isWin}
        />
      </div>
    </div>
  );
}

export default Game;
