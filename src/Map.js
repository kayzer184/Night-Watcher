import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three-stdlib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AnimationMixer } from 'three';

const Map = () => {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const collidableObjects = [];
  const mixers = [];

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    camera.position.set(0, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.type = THREE.BasicShadowMap; // Попробуйте другие варианты, если тени не видны: THREE.BasicShadowMap, THREE.PCFShadowMap

    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxPolarAngle = Math.PI / 2;

    const loader = new FBXLoader();
    loader.load(
      '/Models/Map.fbx',
      (object) => {
        object.scale.set(0.1, 0.1, 0.1);
        object.position.set(0, 0, 0);

        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
            const box = new THREE.Box3().setFromObject(child);
            collidableObjects.push({ object: child, box: box });
          }
        });

        scene.add(object);
      },
      undefined,
      (error) => {
        console.error('Error loading Map model:', error);
      }
    );

    let reusableModel = null;

    const reusableLoader = new FBXLoader();
    reusableLoader.load(
      '/Models/Street Light.fbx',
      (object) => {
        reusableModel = object;
        reusableModel.scale.set(0.09, 0.09, 0.09);

        reusableModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        addReusableModel(scene, -223, 108, 55);
        addReusableModel(scene, -975, 108, 55);
        addReusableModel(scene, -1558, 108, 55);
        addReusableModel(scene, -2200, 108, 55);

        addReusableModel(scene, 60, 108, 330, 0, Math.PI / 2, 0);
        addReusableModel(scene, -655, 108, 180, 0, Math.PI * 1.5, 0);
        addReusableModel(scene, -1250, 108, 180, 0, Math.PI * 1.5, 0);
        addReusableModel(scene, -1855, 108, 300, 0, Math.PI * 1.5, 0);
        addReusableModel(scene, -2350, 108, 300, 0, Math.PI / 2, 0);

        addReusableModel(scene, 60, 108, 930, 0, Math.PI / 2, 0);
        addReusableModel(scene, -245, 108, 1117, 0, Math.PI / 2, 0);
        addReusableModel(scene, -655, 108, 780, 0, Math.PI * 1.5, 0);
      
        addReusableModel(scene, 60, 108, 1380, 0, Math.PI / 2, 0);
      },
      undefined,
      (error) => {
        console.error('Error loading Street Light model:', error);
      }
    );

    let npcModel = null;
    let npcMixer = null;

    const npcLoader = new FBXLoader();
    npcLoader.load('/Models/NPC.fbx', (object) => {
      npcModel = object;
      npcModel.scale.set(0.1, 0.1, 0.1);
      npcModel.position.set(0, 0, 0);

      // Создание SkeletonHelper для NPC модели
      const skeletonHelper = new THREE.SkeletonHelper(npcModel);
      skeletonHelper.visible = true;
      scene.add(skeletonHelper);

      scene.add(npcModel);
    });

    const addReusableModel = (scene, x, y, z, xR = 0, yR = 0, zR = 0) => {
      if (reusableModel) {
        const clone = reusableModel.clone();
        clone.position.set(x, y, z);
        clone.rotation.set(xR, yR, zR);

        scene.add(clone);

        const modelLight = new THREE.SpotLight(0xffffff, 1000, 0, Math.PI / 2, 0.3, 1.25);
        modelLight.position.set(x, y, z);

        const targetObject = new THREE.Object3D();
        targetObject.position.set(x, y - 5, z);
        scene.add(targetObject);

        modelLight.target = targetObject;
        modelLight.castShadow = true;
        modelLight.shadow.mapSize.width = 512;
        modelLight.shadow.mapSize.height = 512;
        modelLight.shadow.bias = -0.01;

        const helper = new THREE.SpotLightHelper(modelLight);
        // scene.add(helper);
        scene.add(modelLight);
      }
    };

    const spawnNPC = (scene, x, y, z) => {
      if (npcModel) {
        const npcClone = npcModel.clone();
        npcClone.position.set(x, y, z);
        scene.add(npcClone);

        if (npcMixer) {
          npcClone.animations.forEach((clip) => {
            const action = npcMixer.clipAction(clip);
            action.play();
          });
        }
      }
    };

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.02);
    scene.add(ambientLight);

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        console.log('Coordinates:', intersection.point);

        collidableObjects.forEach(({ object, box }) => {
          box.setFromObject(object);
          if (box.containsPoint(intersection.point)) {
            console.log('Collision detected with:', object.name);
          }
        });
      }
    };

    window.addEventListener('click', onMouseClick, false);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      mixers.forEach((mixer) => {
        mixer.update(0.01);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('click', onMouseClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default Map;