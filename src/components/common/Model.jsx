import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { storage } from '../../../firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { 
  ELEMENTS_MAP, 
  INTERACTIVE_OBJECTS, 
  INITIAL_ROTATION,
  MODEL_SETTINGS 
} from '../constant';
import { logSceneObjects, enhanceInteractionArea } from '../utils/sceneHelpers';
import { createImprovedRaycast, findInteractiveObject } from '../utils/raycastHelpers';

/**
 * Main 3D Model component that loads the GLTF model and handles interactions.
 * @param {Function} setHovered - Callback to set the currently hovered object.
 * @param {Object} lights - Light settings object
 */
function Model({ setHovered, hovered, lights, setModelLoaded, setLoadingProgress }) {
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
        const loader = new GLTFLoader();
        
        loader.load(
          modelUrl,
          // onLoad
          (gltf) => {
            console.log("GLTF נטען בהצלחה:", gltf);
            
            // מציאת המקלדת וצביעה בשחור
            gltf.scene.traverse((object) => {
              // מחפש אובייקטים בשם Cube.041 או Keyboard Genius
              if (object.isMesh && 
                  (object.name === "Cube.041" || 
                  object.name === "Keyboard Genius" || 
                  object.name.toLowerCase().includes("keyboard"))) {
                console.log("מצאתי את המקלדת!", object.name);
                
                // יצירת חומר שחור חדש
                const blackMaterial = new THREE.MeshStandardMaterial({
                  color: 0x000000,  // שחור
                  roughness: 0.5,
                  metalness: 0.8
                });
                
                // החלפת החומר של המקלדת לשחור
                if (Array.isArray(object.material)) {
                  // אם יש מספר חומרים, מחליף את כולם לשחור
                  object.material = Array(object.material.length).fill(blackMaterial);
                } else {
                  // אחרת מחליף את החומר היחיד
                  object.material = blackMaterial;
                }
                
                console.log("צבעתי את המקלדת בשחור!", object.name);
              }
            });
            
            setGltfScene(gltf.scene);
            // עדכון הפרוגרס ל-100% כשהמודל נטען
            setLoadingProgress(100);
            setModelLoaded(true);
          },
          // onProgress
          (progress) => {
            if (progress.lengthComputable) {
              const percent = (progress.loaded / progress.total * 100);
              console.log(`טעינה: ${percent.toFixed(2)}%`);
              // עדכון הפרוגרס בהתאם לטעינה האמיתית
              setLoadingProgress(Math.min(98, percent));
            } else {
              // אם אין מידע על הגודל, נעדכן בצורה חלקה
              setLoadingProgress(prev => Math.min(90, prev + 1));
            }
          },
          // onError
          (error) => {
            console.error("שגיאה בטעינת GLTF:", error);
            setModelLoaded(false);
          }
        );
        
      } catch (error) {
      console.log(error)
        console.error("שגיאה בטעינת המודל:", error.code, error.message);
        setModelLoaded(false);
      }
      
    }
  }, [modelUrl]);

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
              INITIAL_ROTATION[0],
              INITIAL_ROTATION[1],
              INITIAL_ROTATION[2]
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
    
    // Don't rotate model if hovering over an interactive object
    if (hovered) return;

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

    // לוג מפורט של כל האובייקטים עם מיקום
    console.log("=== FULL SCENE OBJECTS LIST ===");
    
    // חיפוש מקלדת וצביעתה בשחור - בשלב מוקדם עם לוג מפורט
    console.log("🔍 מחפש מקלדת להפוך לשחור...");
    gltfScene.traverse((object) => {
      if (object.isMesh) {
        // לוג מורחב לכל אובייקט כדי למצוא את המקלדת
        console.log(`Object: "${object.name}", type: ${object.type}, position:`, object.position, "parent:", object.parent?.name);
        
        // בדיקת מקלדת באופן מורחב - לפי שם חלקי או לפי אב
        const lowerName = object.name.toLowerCase();
        const isKeyboard = 
          lowerName.includes("keyboard") || 
          lowerName.includes("key") || 
          lowerName.includes("מקלדת") || 
          object.name === "Cube.041" ||
          (object.parent && object.parent.name && object.parent.name.toLowerCase().includes("keyboard"));
        
        if (isKeyboard) {
          console.log("🎯 מצאתי אובייקט מקלדת!", object.name);
          console.log("מידע על החומר הנוכחי:", object.material);
          
          // יצירת חומר שחור חדש
          const blackMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x000000), // שחור מוחלט
            roughness: 0.3,
            metalness: 0.7,
            name: "KeyboardBlackMaterial"
          });
          
          // החלפת החומר של המקלדת לשחור
          if (Array.isArray(object.material)) {
            console.log("מחליף מערך חומרים לשחור", object.material.length);
            object.material = Array(object.material.length).fill(blackMaterial);
          } else {
            console.log("מחליף חומר בודד לשחור");
            object.material = blackMaterial;
          }
          
          // מאלץ עדכון חומרים
          object.material.needsUpdate = true;
          if (object.geometry) object.geometry.attributes.position.needsUpdate = true;
          
          console.log("✅ צבעתי את המקלדת בשחור!", object.name);
        }
      }
    });
    
    console.log("=== END FULL SCENE LIST ===");

    // Find and reference Cylinder.010 for Leva controls
    gltfScene.traverse((object) => {
      if (object.isMesh && object.name === "Cylinder.010") {
        console.log("Found Cylinder.010 mesh:", object);
        
        // הסרת האינטראקטיביות מהמנורה
        object.userData.isInteractive = false;
        object.userData.interactionType = null;
        object.userData.description = null;
        object.userData.descriptionEn = null;
        
        // Apply initial settings from Leva
        if (object.material) {
          object.material.color = new THREE.Color("#ffffff");
          object.material.metalness = 0.5;
          object.material.roughness = 0.3;
          object.material.emissive = new THREE.Color("#f7dc6f");
          object.material.emissiveIntensity = 1.0;
        }
        object.visible = true;
      }
    });
    
    // לוג מיוחד לבדוק את שמות כל האובייקטים שיכולים להיות יומן
    console.log("=== מחפש אובייקטים שיכולים להיות יומן - מורחב ===");
    gltfScene.traverse((object) => {
      if (object.isMesh) {
        // חיפוש רחב יותר של כל האובייקטים על השולחן
        if (object.name.includes("Cube") || 
            object.name.includes("book") || 
            object.name.includes("notebook") ||
            object.name.includes("300") ||
            object.name.includes("diary") ||
            object.name.includes("journal") ||
            object.name.toLowerCase().includes("note") ||
            // גם אובייקטים שיכולים להיות על השולחן
            (object.position && object.position.x > -1 && object.position.x < 3 && 
             object.position.z > -2 && object.position.z < 2 && 
             object.position.y > -1 && object.position.y < 1)) {
          console.log(`מצא אובייקט פוטנציאלי ליומן: "${object.name}", position:`, object.position, "parent:", object.parent?.name, "userData:", object.userData);
        }
      }
    });
    console.log("=== סיום חיפוש יומן מורחב ===");
    
    // לוג נוסף - כל האובייקטים בסצנה
    console.log("=== כל האובייקטים בסצנה ===");
    gltfScene.traverse((object) => {
      if (object.isMesh) {
        console.log(`אובייקט: "${object.name}", position:`, object.position, "parent:", object.parent?.name);
      }
    });
    console.log("=== סיום רשימת כל האובייקטים ===");
  }, [gltfScene]);
  
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

        // זיהוי חלקי המנורה והסרת האינטראקטיביות מהם וגם מהמקלדת
        if (object.name === "Cylinder.010" || 
            object.name === "Plane014_1" || 
            object.name.includes("lamp") || 
            object.name.includes("Lamp") ||
            object.name.includes("Keyboard") || object.name.includes("keyboard") ||
            object.name === "Keyboard" || 
            (object.parent && (
              object.parent.name === "Cylinder.010" ||
              object.parent.name.includes("lamp") ||
              object.parent.name.includes("Lamp") ||
              object.parent.name.includes("Keyboard") ||
              object.parent.name.includes("keyboard")
            ))) {
          object.userData.isInteractive = false;
          object.userData.interactionType = null;
          object.userData.description = null;
          object.userData.name = null;
          console.log("Removing interactivity from lamp/keyboard part:", object.name);
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

        // סינון מיוחד: מסנן את PLANE002 הרגיל (ללא סיומת)
        const isExcluded = object.name === "PLANE002" || object.name === "Plane002";

        if (isInteractive && !isExcluded) {
          // מצאנו אובייקט שצריך להיות לחיץ
          let key = "";
          let description = "";

          // הסרנו את המגבלה על מיקום הפוסטר - כל Plane014 יהיה אינטראקטיבי
          console.log("מעבד אובייקט אינטראקטיבי:", object.name, "position:", object.position);

          // קביעת התיאור והמפתח בהתאם לשם האובייקט - סדר עדיפות מדויק עם עדיפות גבוהה לחטיף
          if (object.name === "Cube008" || object.name.includes("Cube008") || 
              object.name.includes("Tostitos") || object.name.includes("bag") ||
              (object.name.toLowerCase().includes("tostitos"))) {
            // החטיף תמיד יזוהה ראשון עם עדיפות מקסימלית
            key = "Cube008";
            description = "שקית חטיף טוסטיטוס";
            console.log("זיהוי חטיף מדויק:", object.name);
          } else if (object.name === "Cube300_1" || object.name.includes("Cube300_1") ||
                     object.name === "Cube.300" || object.name.includes("Cube.300") ||
                     object.name === "Cube300" || object.name.includes("Cube300") ||
                     object.name.includes("Notebook") || object.name.includes("notebook") ||
                     object.name.includes("book") || object.name.includes("diary") ||
                     object.name.includes("journal")) {
            // היומן
            key = "Cube300_1";
            description = "יומן / פנקס על השולחן";
          } else if (object.name === "base" || object.name.includes("base") ||
                     object.name.includes("gamepad") || object.name.includes("Gamepad")) {
            // הג'ויסטיק
            key = "Gamepad";
            description = "שלט / ג'ויסטיק על השולחן";
          } else if (object.name === "Plane002_2") {
            // המחשב - זיהוי מדויק
            key = "Plane002_2";
            description = "מסך מחשב עם שורות קוד";
          } else if (object.name === "Plane002_1") {
            // הטלוויזיה - זיהוי מדויק
            key = "Plane002_1";
            description = "טלויזיה";
          } else if (object.name === "Plane014") {
            // הפוסטר - כל Plane014 יהיה פוסטר ללא מגבלות מיקום
            key = "Poster";
            description = "Movie Posters";
            console.log("🖼️ זיהוי פוסטר מדויק - Plane014:", object.name, "position:", object.position);
          } else if (object.name === "TV" || object.name === "TV_1" || object.name === "TV_2" || 
                     object.name.includes("TV")) {
            // הטלוויזיה - רק אם זה לא אחד מהאובייקטים האחרים
            key = "TV";
            description = "טלויזיה";
          } else if (object.name.includes("Monitor") || object.name.includes("Screen") ||
                     object.name.includes("Computer") || object.name === "Monitor") {
            key = "Monitor";
            description = "מסך מחשב עם שורות קוד";
          } else if (object.name.includes("Keyboard") || object.name.includes("keyboard") ||
                     object.name === "Keyboard") {
            key = "Keyboard";
            description = "מקלדת";
          } else if (object.name.includes("Mouse") || object.name.includes("mouse")) {
            key = "Mouse";
            description = "עכבר";
          } else {
            // מקרה ברירת מחדל - ננסה להבין לפי השם הכללי
            key = object.name;
            description = object.name;
          }

          object.userData.name = key;
          object.userData.description = description;
          object.userData.isInteractive = true;
          interactiveObjects.current[key] = object;

          // Apply improved raycasting for better interaction detection
          object.raycast = createImprovedRaycast(object);

          // Enhance the interaction area with an invisible helper bounding box
          enhanceInteractionArea(object);

          console.log(`נמצא אובייקט אינטראקטיבי: ${key} (${object.name}) - תיאור: ${description}`);
        } else {
          // Non-interactive object - clear user data
          object.userData.isInteractive = false;
        }
      }
    });
  }, [gltfScene, interactiveObjects]); // Removed setSelectedObject from dependencies since it's not defined

  /**
   * Handles pointer over (hover) event on interactive objects.
   * Creates a yellow outline effect and updates the hovered state.
   * @param {Object} e - The event object from react-three-fiber.
   */
  const handlePointerOver = (e) => {
    e.stopPropagation();
    const obj = e.object;
    
    console.log(`=== HOVER DEBUG ===`);
    console.log(`עכבר על אובייקט: ${obj.name}, userData:`, obj.userData);
    console.log(`position:`, obj.position);
    console.log(`=== END DEBUG ===`);
    
    // בדיקה מיוחדת לחטיף - עדיפות עליונה
    if (obj.name === "Cube008" || obj.name.includes("Cube008") || 
        obj.name.includes("Tostitos") || obj.name.includes("bag") ||
        (obj.parent && (obj.parent.name === "Cube008" || obj.parent.name.includes("Cube008")))) {
      console.log("🟠 זיהוי חטיף ישיר - עדיפות עליונה:", obj.name);
      if (hovered !== "Cube008") {
        setHovered("Cube008");
      }
      document.body.style.cursor = 'pointer';
      return;
    }
    
    // סינון מיוחד: אל תתן לPLANE002 (ללא סיומת) להיות אינטראקטיבי
    if (obj.name === "PLANE002" || obj.name === "Plane002") {
      console.log("❌ מסנן PLANE002 רגיל:", obj.name);
      setHovered(null);
      document.body.style.cursor = 'auto';
      return;
    }
    
    // מצא את האובייקט האינטראקטיבי (עצמו או ההורה שלו)
    const interactiveObj = findInteractiveObject(obj);
    
    if (interactiveObj && interactiveObj.userData.isInteractive) {
      const objectName = interactiveObj.userData.name;
      
      // בדיקה שאנחנו לא כבר מציגים את אותו אובייקט
      if (hovered === objectName) {
        return; // כבר מציגים את האובייקט הזה
      }
      
      console.log(`✅ אובייקט אינטראקטיבי נמצא: ${interactiveObj.name}, userData.name: ${objectName}`);
      console.log(`מה שיוצג בטקסט: ${ELEMENTS_MAP[objectName]}`);
      
      // אם יש כבר טקסט מוצג, נעלם אותו קודם
      if (hovered !== null) {
        setHovered(null);
        // עיכוב קטן לפני הצגת הטקסט החדש
        setTimeout(() => {
          setHovered(objectName);
        }, 100);
      } else {
        // אם אין טקסט מוצג, נציג מיד
        setHovered(objectName);
      }
      
      document.body.style.cursor = 'pointer';
    } else {
      console.log(`❌ אובייקט לא אינטראקטיבי: ${obj.name}`);
      // רק נקה את הסטייט אם באמת אין אובייקט אינטראקטיבי
      if (hovered !== null) {
        setHovered(null);
        document.body.style.cursor = 'auto';
      }
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
    
    console.log(`=== POINTER OUT DEBUG ===`);
    console.log(`עוזב אובייקט: ${obj.name}`);
    console.log(`=== END POINTER OUT DEBUG ===`);
    
    // תמיד נקה את המצב כשעוזבים אובייקט
      setHovered(null);
      document.body.style.cursor = 'auto';
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
      if (name === "Poster" || targetObj.name === "Plane014") {
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

  return (
    <primitive
      ref={modelRef}
      object={gltfScene}
      scale={MODEL_SETTINGS.scale}
      position={MODEL_SETTINGS.position}
      rotation={MODEL_SETTINGS.rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}

export default Model; 