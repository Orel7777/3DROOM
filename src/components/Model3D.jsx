import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useControls, folder } from 'leva';
import { storage  } from '../../firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// מפת שמות בעברית לאובייקטים בסצנה
const ELEMENTS_MAP = {
  "ComputerScreen": "מסך מחשב עם שורות קוד",
  "DeskLamp": "מנורת שולחן",
  "Gamepad": "שלט / ג'ויסטיק על השולחן",
  "Keyboard": "מקלדת",
  "TostitosBag": "שקית חטיף טוסטיטוס",
  "Desk": "שולחן",
  "Chair": "כיסא",
  "Poster_OnceUponATime": "פוסטר שמאלי - סרט הוליוודי",
  "Poster_ReadyPlayerOne": "פוסטר ימין - Ready Player One",
  "Window": "חלון",
  "Monitor": "מסך מחשב",
  "Computer": "מחשב",
  "Mouse": "עכבר",
  "TV": "טלויזיה",
  "Poster_TV": "טלויזיה עם סרט",
  "Screen_TV": "מסך טלויזיה",
  "Television": "טלויזיה",
  "Ready_poster": "פוסטר",
  "Poster": "פוסטר",
  "Frame": "מסגרת תמונה"
};

/**
 * Logs all mesh objects in the scene to the console for debugging.
 * @param {THREE.Scene} scene - The Three.js scene object.
 */
function logSceneObjects(scene) {
  console.log("========== רשימת כל האובייקטים בסצנה: ==========");
  scene.traverse((object) => {
    if (object.isMesh) {
      console.log(`מש: ${object.name}, סוג: ${object.type}`);
      if (object.parent) {
        console.log(`  אבא: ${object.parent.name}`);
      }
    }
  });
  console.log("================================================");
}

/**
 * Loading Screen Component displayed while the model is loading.
 */
function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#1a1611',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 9999
    }}>
      <div>
        <div>Loading...</div>
      </div>
    </div>
  );
}


/**
 * Creates an improved outline effect for a given 3D object.
 * For thin objects (like TV screens and posters), it uses EdgesGeometry for a clear line outline.
 * For solid objects, it uses a scaled mesh with a BackSide material for a halo effect.
 * @param {THREE.Mesh} obj - The Three.js mesh object to create an outline for.
 */
function createOutlineEffect(obj) {
  try {
    if (!obj.geometry) {
      console.warn(`אין גיאומטריה לאובייקט ${obj.name}, לא ניתן ליצור מסגרת.`);
      return;
    }

    let outlineMesh;
    const outlineColor = 0xf1eded; // Light gray color

    // Check if the object is a thin plane (like a TV screen or poster)
    const isThinPlane = obj.name.includes("Plane") || obj.name.includes("TV") || obj.name.includes("Poster");

    if (isThinPlane) {
      // For thin planes, use EdgesGeometry to create a distinct line outline
      const edges = new THREE.EdgesGeometry(obj.geometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: outlineColor,
        linewidth: 2, // Line width (may not be supported on all renderers)
        transparent: true,
        opacity: 1.0,
        depthTest: false, // Render on top of other objects
        depthWrite: false, // Do not write to depth buffer
      });
      outlineMesh = new THREE.LineSegments(edges, lineMaterial);

      // Slightly scale up for visibility and prevent z-fighting
      outlineMesh.scale.copy(obj.scale).multiplyScalar(1.02);
      // Adjust position slightly forward for planes to prevent z-fighting
      // This assumes the plane's normal is generally along the Z-axis in its local space.
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(obj.quaternion);
      outlineMesh.position.copy(obj.position).add(normal.multiplyScalar(0.01));

    } else {
      // For solid meshes, use a scaled mesh with BackSide material for a solid outline/halo
      const outlineGeometry = obj.geometry.clone();
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: outlineColor,
        side: THREE.BackSide, // Render only the back side to create an outline effect
        transparent: true,
        opacity: 1.0,
        depthTest: false, // Render on top of other objects
        depthWrite: false, // Do not write to depth buffer
      });
      outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);

      outlineMesh.position.copy(obj.position);
      outlineMesh.quaternion.copy(obj.quaternion);
      outlineMesh.scale.copy(obj.scale).multiplyScalar(1.05); // Increase scale for a more noticeable outline
    }

    // Ensure the outline mesh updates its matrix automatically
    outlineMesh.matrixAutoUpdate = true;
    // Set a high renderOrder to ensure it's drawn on top of everything else
    outlineMesh.renderOrder = 999;
    // Initially hide the outline
    outlineMesh.visible = false;

    // Add the outline to the parent of the original object
    if (obj.parent) {
      obj.parent.add(outlineMesh);
    } else {
      console.warn("אין הורה לאובייקט, לא ניתן להוסיף מסגרת.");
      return;
    }

    // Store the outline mesh in the original object's userData
    obj.userData.outlineEffect = true;
    obj.userData.outlineMesh = outlineMesh;

  } catch (error) {
    console.error(`שגיאה ביצירת מסגרת לאובייקט ${obj.name}:`, error);
  }
}

/**
 * Starts a pulsing animation for the outline effect.
 * The animation changes the opacity and scale of the outline.
 * @param {THREE.Mesh} obj - The original Three.js mesh object.
 */
function startPulseAnimation(obj) {
  if (!obj.userData.outlineMesh || !obj.userData.outlineMesh.material) return;

  let intensity = 0;
  let increasing = true;
  const maxIntensity = 1.0;
  const minIntensity = 0.6;
  const pulseSpeed = 50; // milliseconds for each step (faster pulse)

  // Clear any existing animation to prevent multiple intervals
  if (obj.userData.pulseAnimation) {
    clearInterval(obj.userData.pulseAnimation);
  }

  obj.userData.pulseAnimation = setInterval(() => {
    try {
      if (!obj.userData.outlineMesh || !obj.userData.outlineMesh.material) {
        clearInterval(obj.userData.pulseAnimation);
        obj.userData.pulseAnimation = null;
        return;
      }

      // Update opacity
      if (increasing) {
        intensity += 0.05; // Faster pulse
        if (intensity >= maxIntensity) {
          intensity = maxIntensity;
          increasing = false;
        }
      } else {
        intensity -= 0.05; // Faster pulse
        if (intensity <= minIntensity) {
          intensity = minIntensity;
          increasing = true;
        }
      }

      obj.userData.outlineMesh.material.opacity = intensity;

      // Update scale for pulse effect (only for Mesh outlines, not LineSegments)
      // LineSegments typically don't need scale pulsing as their thickness is fixed.
      if (obj.userData.outlineMesh.isMesh) { // Check if it's a Mesh (BackSide outline)
        const baseScale = 1.05; // Base scale for the outline
        const scaleVariation = 0.02; // More noticeable scale variation
        const newScale = baseScale + (scaleVariation * intensity);
        obj.userData.outlineMesh.scale.copy(obj.scale).multiplyScalar(newScale);
      }

    } catch (error) {
      console.error(`שגיאה באנימציית פעימה לאובייקט ${obj.name}:`, error);
      clearInterval(obj.userData.pulseAnimation);
      obj.userData.pulseAnimation = null;
    }
  }, pulseSpeed);
}


/**
 * Enhances the interaction area of an object by adding an invisible bounding box helper.
 * This makes it easier to hover over thin or small objects.
 * @param {THREE.Mesh} object - The Three.js mesh object to enhance.
 */
function enhanceInteractionArea(object) {
  if (!object.geometry) return;

  // חישוב תיבת הגבולות של האובייקט
  const boundingBox = new THREE.Box3().setFromObject(object);

  // חישוב הגודל של האובייקט
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  // יצירת גיאומטריה מוגדלת מעט לזיהוי
  const boxGeometry = new THREE.BoxGeometry(
    size.x * 1.02,  // הגדלה של 2% בלבד ברוחב
    size.y * 1.02,  // הגדלה של 2% בלבד בגובה
    size.z * 1.02   // הגדלה של 2% בלבד בעומק
  );

  // יצירת חומר שקוף לחלוטין לאזור האינטראקציה
  const helperMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    depthTest: true,   // שינוי ל-true כדי לכבד את עומק האובייקטים
    visible: false
  });

  // יצירת המש העוזר
  const interactionHelper = new THREE.Mesh(boxGeometry, helperMaterial);

  // מיקום העוזר במרכז האובייקט המקורי
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  interactionHelper.position.copy(center.sub(object.position));

  // העתקת הסיבוב של האובייקט המקורי
  interactionHelper.rotation.copy(object.rotation);

  // שמירת העוזר בנתוני האובייקט
  object.userData.interactionHelper = interactionHelper;
  object.userData.isInteractionHelper = true;

  // הוספת העוזר כילד של האובייקט
  object.add(interactionHelper);

  // טיפול מיוחד בפוסטרים וטלוויזיה - הגדלה מינימלית
  if (object.name === "Plane012" || object.name.includes("Poster") ||
      object.name === "TV" || object.name.includes("TV") ||
      object.name === "Plane002_1") {
    // הגדלה של 5% בלבד לפוסטרים וטלוויזיה
    interactionHelper.scale.multiplyScalar(1.05);
  }

  // טיפול מיוחד בג'ויסטיק - הקטנה משמעותית של אזור האינטראקציה
  if (object.name === "base" || object.name.includes("base")) {
    // הקטנה ל-80% מהגודל המקורי
    interactionHelper.scale.multiplyScalar(0.8);
  }

  // טיפול מיוחד בחטיף - הקטנת אזור האינטראקציה
  if (object.name === "Cube008" || object.name.includes("Cube008")) {
    // הקטנה ל-90% מהגודל המקורי
    interactionHelper.scale.multiplyScalar(0.9);
  }
}

/**
 * Creates an improved raycast function for an object to utilize the interaction helper.
 * @param {THREE.Mesh} object - The Three.js mesh object.
 * @returns {Function} The improved raycast function.
 */
function createImprovedRaycast(object) {
  // Store the original raycast function
  const originalRaycast = object.raycast || new THREE.Mesh().raycast;

  // Define an improved raycast function with expanded detection area
  return function(raycaster, intersects) {
    // Call the original raycast function first
    originalRaycast.call(this, raycaster, intersects);

    // If no intersections found with the original object, and it's interactive,
    // check the expanded interaction helper.
    if (this.userData.isInteractive && this.userData.interactionHelper) {
      // Perform raycast on the expanded helper
      const helperIntersects = [];
      this.userData.interactionHelper.raycast(raycaster, helperIntersects);

      // If an intersection is found with the helper, add the original object to intersects
      if (helperIntersects.length > 0) {
        // Find the closest intersection with the helper
        const closestHelperIntersection = helperIntersects[0];
        // Create an intersection object for the original object
        const originalIntersection = {
          distance: closestHelperIntersection.distance,
          point: closestHelperIntersection.point,
          object: this, // The original object
        };
        // Add it to the main intersects array
        intersects.push(originalIntersection);
      }
    }
  };
}

/**
 * Helper function to find the actual interactive object by traversing up the parent chain.
 * @param {THREE.Object3D} object - The object hit by the raycaster.
 * @returns {THREE.Object3D|null} The interactive object or null if not found.
 */
function findInteractiveObject(object) {
  let currentObj = object;
  while (currentObj) {
    if (currentObj.userData && currentObj.userData.isInteractive) {
      return currentObj;
    }
    currentObj = currentObj.parent;
  }
  return null;
}

// רשימת האובייקטים שיהיו לחיצים בלבד
const INTERACTIVE_OBJECTS = [
  "Poster", // הפוסטר
  "TV", "TV_1", "TV_2", // הטלוויזיה
  "Plane002_1", // הטלוויזיה השנייה
  "Plane012", // הפוסטר השמאלי
  "Cube008", // החטיף
  "base" // הג'ויסטיק
];

/**
 * Main 3D Model component that loads the GLTF model and handles interactions.
 * @param {Function} setHovered - Callback to set the currently hovered object.
 * @param {Object} lights - Light settings object
 */
function Model({ setHovered, lights }) {
  const [modelUrl, setModelUrl] = useState(null);
  const [gltfScene, setGltfScene] = useState(null);
  const interactiveObjects = useRef({});
  const modelRef = useRef();
  const rotationState = useRef({
    arrowLeft: false,
    arrowRight: false,
    arrowUp: false,
    arrowDown: false
  });
  const cylinderRef = useRef(null);
  const lampRef = useRef();

  useEffect(() => {
    // קבלת ה-URL של הקובץ מ-Firebase Storage
    const getModelUrl = async () => {
      try {
        const modelRef = ref(storage, 'dor1000.glb');
        const url = await getDownloadURL(modelRef);
        console.log("התקבל URL למודל:", url);
        setModelUrl(url);
      } catch (error) {
        console.error("שגיאה בטעינת המודל:", error.code, error.message);
      }
    };
    
    getModelUrl();
  }, []);

  useEffect(() => {
    if (modelUrl) {
      try {
        console.log("התקבל URL למודל:", modelUrl);
        //const { scene } = useGLTF(modelUrl, true);
        const loader = new GLTFLoader();
    
        console.log("מתחיל טעינת GLTF מ-URL:", modelUrl);
        
        loader.load(
          modelUrl,
          // onLoad
          (gltf) => {
            console.log("GLTF נטען בהצלחה:", gltf);
            setGltfScene(gltf.scene);
          },
          // onProgress
          (progress) => {
            if (progress.lengthComputable) {
              const percent = (progress.loaded / progress.total * 100);
              console.log(`טעינה: ${percent.toFixed(2)}%`);
            }
          },
          // onError
          (error) => {
            console.error("שגיאה בטעינת GLTF:", error);
            setLoadingError(`שגיאה בטעינת המודל: ${error.message}`);
          }
        );
        
     // setGltfScene(scene);
      } catch (error) {
      console.log(error)
        console.error("שגיאה בטעינת המודל:", error.code, error.message);
      }
      
    }
  }, [modelUrl]);


  // Initial rotation values for resetting the model
  const initialRotation = [
    -0.4 * (Math.PI / 180),
    -59.7 * (Math.PI / 180),
    -0.1 * (Math.PI / 180)
  ];

  // Effect for handling keyboard input for model rotation and reset
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch(event.key) {
        case 'ArrowLeft':
          rotationState.current.arrowLeft = true;
          event.preventDefault();
          break;
        case 'ArrowRight':
          rotationState.current.arrowRight = true;
          event.preventDefault();
          break;
        case 'ArrowUp':
          rotationState.current.arrowUp = true;
          event.preventDefault();
          break;
        case 'ArrowDown':
          rotationState.current.arrowDown = true;
          event.preventDefault();
          break;
        case ' ': // Spacebar to reset rotation
          if (modelRef.current) {
            modelRef.current.rotation.set(
              initialRotation[0],
              initialRotation[1],
              initialRotation[2]
            );
          }
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch(event.key) {
        case 'ArrowLeft':
          rotationState.current.arrowLeft = false;
          break;
        case 'ArrowRight':
          rotationState.current.arrowRight = false;
          break;
        case 'ArrowUp':
          rotationState.current.arrowUp = false;
          break;
        case 'ArrowDown':
          rotationState.current.arrowDown = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // useFrame hook for continuous model rotation based on arrow key state
  useFrame(() => {
    if (!modelRef.current) return;

    const rotationSpeed = 0.02; // Slower rotation speed

    // Define rotation limits similar to OrbitControls
    const minAzimuthAngle = -Math.PI / 12; // ~15 degrees left
    const maxAzimuthAngle = Math.PI / 12;  // ~15 degrees right
    const minPolarAngle = Math.PI / 30; // ~6 degrees - allows looking almost at the floor
    const maxPolarAngle = Math.PI / 4; // 45 degrees

    const fixedYRotationBase = -44.7 * (Math.PI / 180); // Base Y rotation from fixedRotation - חזרה לבסיס המקורי
    const fixedXRotationBase = -0.4 * (Math.PI / 180); // Base X rotation from fixedRotation

    // Left arrow - rotates right around Y-axis (clockwise)
    if (rotationState.current.arrowLeft) {
      const nextRotation = modelRef.current.rotation.y + rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedYRotationBase;

      if (nextRelativeRotation <= maxAzimuthAngle) {
        modelRef.current.rotation.y += rotationSpeed;
      } else {
        modelRef.current.rotation.y = fixedYRotationBase + maxAzimuthAngle;
      }
    }

    // Right arrow - rotates left around Y-axis (counter-clockwise)
    if (rotationState.current.arrowRight) {
      const nextRotation = modelRef.current.rotation.y - rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedYRotationBase;

      if (nextRelativeRotation >= minAzimuthAngle) {
        modelRef.current.rotation.y -= rotationSpeed;
      } else {
        modelRef.current.rotation.y = fixedYRotationBase + minAzimuthAngle;
      }
    }

    // Up arrow - rotates up around X-axis
    if (rotationState.current.arrowUp) {
      const nextRotation = modelRef.current.rotation.x + rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedXRotationBase;

      if (nextRelativeRotation <= maxPolarAngle) {
        modelRef.current.rotation.x += rotationSpeed;
      } else {
        modelRef.current.rotation.x = fixedXRotationBase + maxPolarAngle;
      }
    }

    // Down arrow - rotates down around X-axis
    if (rotationState.current.arrowDown) {
      const nextRotation = modelRef.current.rotation.x - rotationSpeed;
      const nextRelativeRotation = nextRotation - fixedXRotationBase;

      if (nextRelativeRotation >= minPolarAngle) {
        modelRef.current.rotation.x -= rotationSpeed;
      } else {
        modelRef.current.rotation.x = fixedXRotationBase + minPolarAngle;
      }
    }
  });

  // Effect to process the loaded scene, identify interactive objects, and apply enhancements
  useEffect(() => {
    if (!gltfScene) return;
    logSceneObjects(gltfScene); // Log all objects in the scene
    interactiveObjects.current = {};

    // Find and reference Cylinder.010 for Leva controls
    gltfScene.traverse((object) => {
      if (object.isMesh && object.name === "Cylinder.010") {
        console.log("Found Cylinder.010 mesh:", object);
        cylinderRef.current = object;
        
        // הסרת האינטראקטיביות מהמנורה
        object.userData.isInteractive = false;
        object.userData.interactionType = null;
        object.userData.description = null;
        object.userData.descriptionEn = null;
        
        // Apply initial settings from Leva
        if (object.material) {
          object.material.color = new THREE.Color(lights.cylinder010.color);
          object.material.metalness = lights.cylinder010.metalness;
          object.material.roughness = lights.cylinder010.roughness;
          object.material.emissive = new THREE.Color(lights.cylinder010.emissive);
          object.material.emissiveIntensity = lights.cylinder010.emissiveIntensity;
        }
        object.visible = lights.cylinder010.visible;
        // Store original position, rotation, scale for reference
        const newSettings = { ...lights };
        newSettings.cylinder010 = {
          ...newSettings.cylinder010,
          position: [object.position.x, object.position.y, object.position.z],
          rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
          scale: [object.scale.x, object.scale.y, object.scale.z]
        };
        setLights(newSettings);
      }
    });
  }, [gltfScene]); // Only depend on scene to avoid re-running unnecessarily
  
  // Effect to optimize objects and identify interactive ones
  useEffect(() => {
    if (!gltfScene) return;
    // Optimize and identify objects
    gltfScene.traverse((object) => {
      if (object.isMesh) {
        // Performance optimizations
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;

        // זיהוי חלקי המנורה והסרת האינטראקטיביות מהם
        if (object.name === "Cylinder.010" || 
            object.name === "Plane014_1" || 
            object.name.includes("lamp") || 
            object.name.includes("Lamp") ||
            (object.parent && (
              object.parent.name === "Cylinder.010" ||
              object.parent.name.includes("lamp") ||
              object.parent.name.includes("Lamp")
            ))) {
          object.userData.isInteractive = false;
          object.userData.interactionType = null;
          object.userData.description = null;
          object.userData.name = null;
          console.log("Removing interactivity from lamp part:", object.name);
          return; // סיום הטיפול באובייקט זה
        }

        // Improve material appearance to be more luminous
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(mat => {
          if (mat && (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial)) {
            mat.roughness = 0.3; // Less roughness = more shine
            mat.metalness = 0.1; // Slight metallic feel
            mat.envMapIntensity = 1.5; // Stronger environmental reflection

            // Make keyboard completely black
            if (object.name.includes("Keyboard") || object.name.includes("keyboard") || 
                object.name === "Keyboard" || object.parent?.name?.includes("Keyboard") ||
                object.name.includes("מקלדת") || (object.name === "keyb") ||
                (object.parent && object.parent.name && (
                  object.parent.name.includes("Keyboard") || 
                  object.parent.name.includes("keyboard")
                ))) {
              // Force the material to be completely black regardless of lighting
              mat.color = new THREE.Color("#000000"); // Pure black
              mat.roughness = 0.9; // Very rough for a matte keyboard look
              mat.metalness = 0.0; // No metallic effect at all
              mat.envMapIntensity = 0.2; // Minimal reflection
              // Add slight emission to ensure it appears black even without lighting
              mat.emissive = new THREE.Color("#000000");
              mat.emissiveIntensity = 0.1;
              console.log("Found keyboard, setting to black: ", object.name);
            }

            // Enhance specific poster materials to be brighter and emissive
            if (object.name.includes("Poster") || object.name.includes("poster") || object.name.includes("Frame")) {
              mat.roughness = 0.08; // Further reduce roughness for more sheen
              mat.metalness = 0.02; // Reduce metalness for a more natural glow
              mat.envMapIntensity = 3.5; // Increase reflection

              if (mat.color) {
                mat.color.multiplyScalar(3.2); // Significantly increase brightness
              }

              // Add emission for the left poster
              if (object.name.includes("Once") || object.name.includes("Hollywood")) {
                mat.emissive = new THREE.Color("#ff5500"); // Brighter orange-red emission
                mat.emissiveIntensity = 1.2; // Increase emission intensity
              }
            }
          }
        });

        // בדיקה האם האובייקט נמצא ברשימת האובייקטים הלחיצים
        const isInteractive = INTERACTIVE_OBJECTS.some(name => 
          object.name === name || 
          object.name.includes(name) ||
          (object.parent && object.parent.name.includes(name))
        );

        if (isInteractive) {
          // מצאנו אובייקט שצריך להיות לחיץ
          let key = "";
          let description = "";

          // קביעת התיאור והמפתח בהתאם לשם האובייקט
          if (object.name === "Poster" || object.name.includes("Poster") || object.name === "Plane012") {
            key = "Poster";
            description = "פוסטר";
          } else if (object.name === "TV" || object.name === "TV_1" || object.name === "TV_2" || 
                     object.name.includes("TV") || object.name === "Plane002_1") {
            key = "TV";
            description = "טלויזיה";
          } else if (object.name === "Cube008" || object.name.includes("Cube008")) {
            key = "Cube008";
            description = "חטיף";
          } else if (object.name === "base" || object.name.includes("base")) {
            key = "Gamepad";
            description = "ג'ויסטיק";
          }

          object.userData.name = key;
          object.userData.description = description;
          object.userData.isInteractive = true;
          interactiveObjects.current[key] = object;

          // Apply improved raycasting for better interaction detection
          object.raycast = createImprovedRaycast(object);

          // Enhance the interaction area with an invisible helper bounding box
          enhanceInteractionArea(object);

          console.log(`נמצא אובייקט אינטראקטיבי: ${key} (${object.name})`);
        } else {
          // Non-interactive object - clear user data
          object.userData.isInteractive = false;
        }
      }
    });
  }, [gltfScene, interactiveObjects]); // Removed setSelectedObject from dependencies since it's not defined

  // Effect to find and setup the lamp
  useEffect(() => {
    if (!gltfScene) return;
    gltfScene.traverse((object) => {
      if (object.isMesh && object.name === "Cylinder.010") {
        lampRef.current = object;
        console.log("Found lamp:", object);
        
        // Set initial material properties
        if (object.material) {
          object.material.color = new THREE.Color('#ffffff');
          object.material.metalness = 0.5;
          object.material.roughness = 0.3;
          object.material.emissive = new THREE.Color('#f7dc6f');
          object.material.emissiveIntensity = 1.0;
        }
      }
    });
  }, [gltfScene]);

  // Effect to update lamp properties when controls change
  useEffect(() => {
    if (lampRef.current && lampRef.current.material && lights && lights.cylinder010) {
      const lamp = lampRef.current;
      
      try {
        // עדכון תכונות החומר
        lamp.material.color = new THREE.Color(lights.cylinder010.color);
        lamp.material.metalness = lights.cylinder010.metalness;
        lamp.material.roughness = lights.cylinder010.roughness;
        lamp.material.emissive = new THREE.Color(lights.cylinder010.emissive);
        lamp.material.emissiveIntensity = lights.cylinder010.emissiveIntensity;
        
        // עדכון מיקום וסיבוב
        if (Array.isArray(lights.cylinder010.position)) {
          lamp.position.set(...lights.cylinder010.position);
        }
        if (Array.isArray(lights.cylinder010.rotation)) {
          lamp.rotation.set(...lights.cylinder010.rotation);
        }
        if (Array.isArray(lights.cylinder010.scale)) {
          lamp.scale.set(...lights.cylinder010.scale);
        }
        
        // עדכון נראות
        lamp.visible = lights.cylinder010.visible;
        
        console.log('Updated lamp properties:', {
          color: lights.cylinder010.color,
          emissive: lights.cylinder010.emissive,
          position: lights.cylinder010.position
        });
      } catch (error) {
        console.error('Error updating lamp properties:', error);
      }
    }
  }, [lights?.cylinder010]); // תלוי בשינויים בהגדרות המנורה

  /**
   * Handles pointer over (hover) event on interactive objects.
   * Creates a yellow outline effect and updates the hovered state.
   * @param {Object} e - The event object from react-three-fiber.
   */
  const handlePointerOver = (e) => {
    e.stopPropagation();
    const obj = e.object;
    
    if (obj && (obj.userData.isInteractive || (obj.parent && obj.parent.userData && obj.parent.userData.isInteractive))) {
      const interactiveObj = obj.userData.isInteractive ? obj : obj.parent;
      console.log(`עומד מעל: ${interactiveObj.name}, userData.name: ${interactiveObj.userData.name}`);
      
      setHovered(interactiveObj.userData.name);
      document.body.style.cursor = 'pointer';
    }
  };

  /**
   * Handles pointer out (unhover) event on interactive objects.
   * Hides the yellow outline and resets the hovered state.
   * @param {Object} e - The event object from react-three-fiber.
   */
  const handlePointerOut = (e) => {
    e.stopPropagation();
    const obj = e.object;
    
    if (obj && (obj.userData.isInteractive || (obj.parent && obj.parent.userData && obj.parent.userData.isInteractive))) {
      setHovered(null);
      document.body.style.cursor = 'auto';
    }
  };

  /**
   * Handles click event on interactive objects.
   * Displays an alert with information about the clicked object.
   * @param {Object} e - The event object from react-three-fiber.
   */
  const handleClick = (e) => {
    e.stopPropagation();
    const targetObj = findInteractiveObject(e.object); // Find the actual interactive object
    
    if (targetObj) { // Only proceed if an interactive object was found
      const name = targetObj.userData.name;
      const description = targetObj.userData.description || name;

      // מעבר לעמוד הפוסטרים כשלוחצים על פוסטר
      if (name === "Poster" || targetObj.name === "Plane012") {
        // משתמשים ב-window.location כי אנחנו מחוץ למרחב של React Router
        window.location.href = '/poster';
        return;
      }

      const meshInfo = {
        name: targetObj.name,
        type: targetObj.type,
        geometry: targetObj.geometry ? targetObj.geometry.type : "אין מידע",
        materialType: targetObj.material ? (Array.isArray(targetObj.material) ? targetObj.material.map(m => m.type).join(', ') : targetObj.material.type) : "אין מידע"
      };

      // Use a custom modal or console.log instead of alert() for better UX
      // For demonstration, we'll use alert() as requested by the user.
      alert(`מידע על ${description}:\nשם האובייקט: ${meshInfo.name}\nסוג: ${meshInfo.type}\nגיאומטריה: ${meshInfo.geometry}\nחומר: ${meshInfo.materialType}`);
    }
  };

     // אם אין סצנה עדיין, נחזיר null
  if (!gltfScene) {
    return null;
  }

  // Fixed scale, position, and rotation for the GLTF model
  const fixedScale = 5.4;
  const fixedPosition = [-1.8, -0.1, 1.3];
  const fixedRotation = [
    -0.4 * (Math.PI / 180),
    -59.7 * (Math.PI / 180), // זווית ימנית מקסימלית: בסיס (-44.7) - גבול ימני (15) = -59.7
    -0.1 * (Math.PI / 180)
  ];

  return (
    <primitive
      ref={modelRef}
      object={gltfScene}
      scale={fixedScale}
      position={fixedPosition}
      rotation={fixedRotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}

/**
 * Component for limited OrbitControls to restrict camera movement.
 */
function LimitedControls() {
  const controlsRef = useRef();

  // Function to reset the camera to its initial state
  useEffect(() => {
    const handleReset = (e) => {
      if (e.key === ' ' && controlsRef.current) {
        controlsRef.current.reset();
      }
    };

    window.addEventListener('keydown', handleReset);
    return () => window.removeEventListener('keydown', handleReset);
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      minDistance={8} // מרחק מינימלי מהמודל
      maxDistance={16} // הקטנת המרחק המקסימלי מ-18 ל-16
      minPolarAngle={Math.PI / 2.5} // הגבלת סיבוב המצלמה כלפי מעלה
      maxPolarAngle={Math.PI / 2.2} // הגבלת סיבוב המצלמה כלפי מטה
      minAzimuthAngle={-Math.PI / 12} // הגבלת סיבוב שמאלה
      maxAzimuthAngle={Math.PI / 12} // הגבלת סיבוב ימינה
      enableZoom={true}
      enablePan={false} // ביטול אפשרות הזזה
      enableRotate={true}
      autoRotate={false}
      enableDamping // אפשר תנועה חלקה
      dampingFactor={0.07}
      zoomSpeed={0.7} // האטת מהירות הזום
    />
  );
}

/**
 * Component to display information about the currently hovered object.
 * @param {Object} props - Component properties.
 * @param {string|null} props.hovered - The name of the currently hovered object.
 */
function HoverInfo({ hovered }) {
  if (!hovered) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      zIndex: 1000,
      direction: 'rtl', // Right-to-left for Hebrew text
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      {ELEMENTS_MAP[hovered]}
    </div>
  );
}

/**
 * פונקציה פשוטה להוספת אפקט הדגשה (emissive)
 * @param {THREE.Mesh} obj - The Three.js mesh object to apply the highlight effect to.
 */
const applyHighlightEffect = (obj) => {
  try {
    // מדפיס את שם האובייקט לבדיקה
    console.log(`מפעיל אפקט על אובייקט: ${obj.name}, סוג: ${obj.type}`);
    
    // שמירת החומר המקורי אם עוד לא נשמר
    if (!obj.userData.origMaterial) {
      // שמירת העתק עמוק של החומר המקורי
      if (Array.isArray(obj.material)) {
        obj.userData.origMaterial = obj.material.map(mat => mat.clone());
      } else if (obj.material) {
        obj.userData.origMaterial = obj.material.clone();
      } else {
        console.warn(`אין חומר לאובייקט ${obj.name}`);
        return;
      }
    }
    
    // הפונקציה הפנימית שמוסיפה אפקט למקרה של חומר בודד
    const addGlowToMaterial = (material) => {
      if (!material) return;
      
      // מגדיר את צבע ה-emissive לאפור בהיר (#f1eded)
      material.emissive = new THREE.Color(0xf1eded);
      material.emissiveIntensity = 1.0;
      
      // טיפול מיוחד בפוסטר שמאלי (Plane012)
      if (obj.name === "Plane012") {
        material.emissiveIntensity = 1.5;
        material.emissive = new THREE.Color(0xf1eded);
      }
      
      // טיפול מיוחד באובייקטי טלוויזיה
      if (obj.userData.name === "TV" || obj.name.includes("TV")) {
        material.emissive = new THREE.Color(0xf1eded);
        material.emissiveIntensity = 1.5;
      }
      
      // טיפול מיוחד לחטיף Cube008
      if (obj.name === "Cube008" || obj.name.includes("Cube008")) {
        material.emissive = new THREE.Color(0xf1eded);
        material.emissiveIntensity = 1.8;
      }
      
      // טיפול מיוחד לבסיס (ג'ויסטיק)
      if (obj.name === "base" || obj.name.includes("base")) {
        material.emissive = new THREE.Color(0xf1eded);
        material.emissiveIntensity = 2.0;
      }
    };
    
    // טיפול במקרה של מערך חומרים או חומר בודד
    if (Array.isArray(obj.material)) {
      obj.material.forEach(addGlowToMaterial);
    } else if (obj.material) {
      addGlowToMaterial(obj.material);
    }
    
    // הוספת אנימציית פעימה לאפקט
    if (!obj.userData.pulseAnimation) {
      let pulseUp = true;
      const minIntensity = 0.6;
      const maxIntensity = 1.5;
      const pulseStep = 0.05;
      
      obj.userData.pulseAnimation = setInterval(() => {
        if (!obj.material) {
          clearInterval(obj.userData.pulseAnimation);
          obj.userData.pulseAnimation = null;
          return;
        }
        
        const updateMaterialIntensity = (mat) => {
          if (!mat || !mat.emissive) return;
          
          // עדכון עוצמת ה-emissive לפי כיוון הפעימה
          if (pulseUp) {
            mat.emissiveIntensity += pulseStep;
            if (mat.emissiveIntensity >= maxIntensity) {
              pulseUp = false;
            }
          } else {
            mat.emissiveIntensity -= pulseStep;
            if (mat.emissiveIntensity <= minIntensity) {
              pulseUp = true;
            }
          }
        };
        
        // עדכון החומר/ים
        if (Array.isArray(obj.material)) {
          obj.material.forEach(updateMaterialIntensity);
        } else if (obj.material) {
          updateMaterialIntensity(obj.material);
        }
      }, 50); // קצב עדכון מהיר יותר - 50ms
    }
  } catch (error) {
    console.error(`שגיאה בהפעלת אפקט על אובייקט ${obj.name}:`, error);
  }
};

// פונקציה פשוטה להסרת אפקט הדגשה
const removeHighlightEffect = (obj) => {
  try {
    // החזרת החומר המקורי
    if (obj.userData.origMaterial) {
      if (Array.isArray(obj.material) && Array.isArray(obj.userData.origMaterial)) {
        // החזרת מערך חומרים
        obj.material.forEach((mat, index) => {
          if (obj.userData.origMaterial[index]) {
            mat.copy(obj.userData.origMaterial[index]);
          }
        });
      } else if (!Array.isArray(obj.material) && !Array.isArray(obj.userData.origMaterial)) {
        // החזרת חומר בודד
        obj.material.copy(obj.userData.origMaterial);
      }
      
      // ניקוי
      obj.userData.origMaterial = null;
    }
    
    // עצירת אנימציית הפעימה
    if (obj.userData.pulseAnimation) {
      clearInterval(obj.userData.pulseAnimation);
      obj.userData.pulseAnimation = null;
    }
  } catch (error) {
    console.error(`שגיאה בהסרת אפקט מאובייקט ${obj.name}:`, error);
  }
};

/**
 * Main application component for the 3D room model.
 */
const Model3D = () => { // Renamed from App to Model3D as requested
  const [hovered, setHovered] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Camera initial settings
  const cameraX = 1;
  const cameraY = 2.2;
  const cameraZ = 14;
  const cameraFov = 45;

  // Reference for the Cylinder.010 mesh
  const cylinderRef = useRef(null);

  // Set up basic lighting controls with useState for stability
  const [lights, setLights] = useState({
    ambient: {
      intensity: 0,
      color: '#8b7a3c'
    },
    windowLight: {
      position: [9.0, 2.0, -9.0],
      angle: 0.21,
      penumbra: 0.33,
      distance: 23,
      decay: 0.2,
      intensity: 25,
      color: '#fdf4e3'
    },
    // 
    posterLight: {
      position: [-11.5, -5.0, 19.8],
      angle: 0.30,
      penumbra: 0.77,
      distance: 24,
      decay: 0.1,
      intensity: 5,
      color: '#ffffff'
    },
    deskLamp: {
      visible: true,
      emissive: '#f7dc6f',
      emissiveIntensity: 1.0,
      metalness: 0.5,
      roughness: 0.3
    }
  });

  // הגדרת בקרי התאורה
  useControls('Ambient Light', {
    intensity: {
      value: lights.ambient.intensity,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, ambient: { ...prev.ambient, intensity: value } }))
    },
    color: {
      value: lights.ambient.color,
      onChange: (value) => setLights(prev => ({ ...prev, ambient: { ...prev.ambient, color: value } }))
    }
  });

  useControls('Window Light', {
    position: {
      value: lights.windowLight.position,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, position: value } }))
    },
    angle: {
      value: lights.windowLight.angle,
      min: 0,
      max: Math.PI / 2,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, angle: value } }))
    },
    penumbra: {
      value: lights.windowLight.penumbra,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, penumbra: value } }))
    },
    distance: {
      value: lights.windowLight.distance,
      min: 0,
      max: 50,
      step: 1,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, distance: value } }))
    },
    decay: {
      value: lights.windowLight.decay,
      min: 0,
      max: 3,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, windowLight: { ...prev.windowLight, decay: value } }))
    }
  });

  useControls('Poster Light', {
    position: {
      value: [-11.5, -5.0, 19.8],
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, position: value } }))
    },
    angle: {
      value: 0.30,
      min: 0,
      max: Math.PI / 2,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, angle: value } }))
    },
    penumbra: {
      value: 0.77,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, penumbra: value } }))
    },
    distance: {
      value: 24,
      min: 0,
      max: 50,
      step: 1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, distance: value } }))
    },
    decay: {
      value: 0.1,
      min: 0,
      max: 3,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, decay: value } }))
    },
    intensity: {
      value: 5,
      min: 0,
      max: 100,
      step: 1,
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, intensity: value } }))
    },
    color: {
      value: '#ffffff',
      onChange: (value) => setLights(prev => ({ ...prev, posterLight: { ...prev.posterLight, color: value } }))
    }
  });

  useControls('Desk Lamp', {
    visible: {
      value: lights.deskLamp.visible,
      onChange: (value) => setLights(prev => ({ ...prev, deskLamp: { ...prev.deskLamp, visible: value } }))
    },
    emissive: {
      value: lights.deskLamp.emissive,
      onChange: (value) => setLights(prev => ({ ...prev, deskLamp: { ...prev.deskLamp, emissive: value } }))
    },
    emissiveIntensity: {
      value: lights.deskLamp.emissiveIntensity,
      min: 0,
      max: 3,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, deskLamp: { ...prev.deskLamp, emissiveIntensity: value } }))
    },
    metalness: {
      value: lights.deskLamp.metalness,
      min: 0,
      max: 1,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, deskLamp: { ...prev.deskLamp, metalness: value } }))
    },
    roughness: {
      value: lights.deskLamp.roughness,
      min: 0,
      max: 1,
      step: 0.1,
      onChange: (value) => setLights(prev => ({ ...prev, deskLamp: { ...prev.deskLamp, roughness: value } }))
    }
  });

  // Global keyboard listener to prevent page scrolling when arrow keys are pressed
  useEffect(() => {
    const preventDefaultArrows = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefaultArrows);
    return () => window.removeEventListener('keydown', preventDefaultArrows);
  }, []);

  // Handle loading state with a minimum display time for the loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loading screen for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="model-container" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {isLoading && <LoadingScreen />}

      <Canvas
        style={{ background: '#1a1611' }}
        camera={{ position: [cameraX, cameraY, cameraZ], fov: cameraFov }}
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.toneMapping = THREE.ReinhardToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        performance={{ min: 0.5 }}
      >
        {/* אור סביבה */}
        <ambientLight intensity={lights.ambient.intensity} color={lights.ambient.color} />
        
        {/* אור חלון */}
        <spotLight 
          position={lights.windowLight.position} 
          intensity={lights.windowLight.intensity}
          color={lights.windowLight.color}
          angle={lights.windowLight.angle}
          penumbra={lights.windowLight.penumbra}
          distance={lights.windowLight.distance}
          decay={lights.windowLight.decay}
        />

        {/* אור פוסטר */}
        <spotLight 
          position={lights.posterLight.position} 
          intensity={lights.posterLight.intensity}
          color={lights.posterLight.color}
          angle={lights.posterLight.angle}
          penumbra={lights.posterLight.penumbra}
          distance={lights.posterLight.distance}
          decay={lights.posterLight.decay}
        />

        {/* Environment map for realistic reflections */}
        <Environment preset="night" />

        {/* Suspense for loading the GLTF model */}
        <Suspense fallback={null}>
          <Model setHovered={setHovered} lights={lights} />
        </Suspense>

        {/* Camera controls */}
        <LimitedControls />
      </Canvas>

      {/* Hover information display */}
      <HoverInfo hovered={hovered} />
    </div>
  );
};

export default Model3D; // Exporting Model3D as the default component