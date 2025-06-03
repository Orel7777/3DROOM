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
  "ComputerScreen": "Video Games",
  "DeskLamp": "מנורת שולחן",
  "Gamepad": "Video Games",
  "Keyboard": "Video Games",
  "TostitosBag": "Brand Logos",
  "Cube008": "Brand Logos", // החטיף
  "Cube.300": "Hidden Notes", // היומן
  "Cube300_1": "Hidden Notes", // השם האמיתי של היומן
  "Notebook": "Hidden Notes", // יומן
  "Desk": "שולחן",
  "Chair": "כיסא",
  "Poster": "Movie Posters", // רק Plane014 ישתמש במפתח הזה
  "Plane014": "Movie Posters", // הפוסטר - האחד שצריך להציג את זה
  "Plane002_1": "Movie Scenes", // הטלוויזיה
  "Plane002_2": "Video Games", // המחשב
  "Window": "חלון",
  "Monitor": "Video Games",
  "Computer": "Video Games",
  "Screen": "Video Games", // מסך נוסף
  "Mouse": "Video Games",
  "TV": "Movie Scenes",
  "Poster_TV": "Movie Scenes",
  "Screen_TV": "Movie Scenes",
  "Television": "Movie Scenes",
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
function LoadingScreen({ progress = 0 }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1611 0%, #2c2416 50%, #1a1611 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 9999
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          background: 'linear-gradient(45deg, #f7dc6f, #f39c12)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Loading 3D Model...
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#bbb',
          margin: '0'
        }}>
          Please wait while the room loads
        </p>
      </div>

      {/* Progress Container */}
      <div style={{
        width: '400px',
        maxWidth: '80vw',
        textAlign: 'center'
      }}>
        {/* Progress Text */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#f7dc6f',
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
        }}>
          {Math.round(progress)}%
        </div>

        {/* Main Progress Bar Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '20px',
          backgroundColor: '#333',
          borderRadius: '15px',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)',
          marginBottom: '15px'
        }}>
          {/* Progress Fill */}
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f39c12 0%, #f7dc6f 50%, #f39c12 100%)',
            borderRadius: '15px',
            transition: 'width 0.3s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Shine Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: progress > 0 ? 'shine 2s infinite' : 'none'
            }} />
          </div>
          
          {/* Progress Marker */}
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '28px',
            backgroundColor: '#fff',
            borderRadius: '2px',
            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            transition: 'left 0.3s ease-out'
          }} />
        </div>

        {/* Secondary Decorative Sliders */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          marginTop: '20px'
        }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: '8px',
              backgroundColor: '#444',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${Math.max(0, Math.min(100, (progress - i * 20)))}%`,
                height: '100%',
                background: `linear-gradient(90deg, #${['e74c3c', 'e67e22', 'f39c12', '27ae60', '3498db'][i]} 0%, #${['c0392b', 'd35400', 'e67e22', '229954', '2980b9'][i]} 100%)`,
                borderRadius: '4px',
                transition: 'width 0.3s ease-out'
              }} />
            </div>
          ))}
        </div>

        {/* Loading Animation Dots */}
        <div style={{
          marginTop: '30px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#f7dc6f',
              borderRadius: '50%',
              animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
              boxShadow: '0 0 10px rgba(247, 220, 111, 0.5)'
            }} />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(0.8); 
            opacity: 0.5; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 1; 
          }
        }
      `}</style>
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
  if (object.name === "Plane014" || object.name.includes("Poster") ||
      object.name === "TV" || object.name.includes("TV") ||
      object.name === "Plane002_1") {
    // הגדלה של 2% בלבד לפוסטרים וטלוויזיה - הקטנה משמעותית מ-5%
    interactionHelper.scale.multiplyScalar(1.02);
  }

  // טיפול מיוחד בג'ויסטיק - הקטנה משמעותית של אזור האינטראקציה
  if (object.name === "base" || object.name.includes("base")) {
    // הקטנה ל-80% מהגודל המקורי
    interactionHelper.scale.multiplyScalar(0.8);
  }

  // טיפול מיוחד בחטיף - הקטנת אזור האינטראקציה משמעותית כדי להימנע מ-overlap עם פוסטרים
  if (object.name === "Cube008" || object.name.includes("Cube008") || 
      object.name.includes("Tostitos") || object.name.includes("bag")) {
    // הקטנה ל-70% מהגודל המקורי לדיוק גבוה יותר
    interactionHelper.scale.multiplyScalar(0.7);
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
  "Plane014", // רק הפוסטר - זה האחד שצריך להציג "Movie Posters"
  "TV", "TV_1", "TV_2", // הטלוויזיה
  "Plane002_1", // הטלוויזיה השנייה
  "Plane002_2", // המחשב
  "Cube008", // החטיף
  "Tostitos", "bag", // חטיף נוספים
  "base", // הג'ויסטיק
  "gamepad", "Gamepad", // ג'ויסטיק נוספים
  "Monitor", "Screen", "Computer", // מסך ומחשב
  "Keyboard", "keyboard", // מקלדת
  "Mouse", "mouse", // עכבר
  "Cube.300", "Cube300", "Cube300_1", "Notebook", "notebook", "book", "diary", "journal" // היומן - כולל השם האמיתי
];

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
  // הסרנו את מיקום העכבר כי עכשיו אנחנו משתמשים במיקומים קבועים

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
    
        console.log("מתחיל טעינת GLTF מ-URL:", modelUrl);
        
        loader.load(
          modelUrl,
          // onLoad
          (gltf) => {
            console.log("GLTF נטען בהצלחה:", gltf);
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

    // לוג מפורט של כל האובייקטים עם מיקום
    console.log("=== FULL SCENE OBJECTS LIST ===");
    gltfScene.traverse((object) => {
      if (object.isMesh) {
        console.log(`Object: "${object.name}", type: ${object.type}, position:`, object.position, "parent:", object.parent?.name);
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
            // רק הפוסטר - זיהוי מדויק ביותר
            key = "Poster";
            description = "Movie Posters";
            console.log("זיהוי פוסטר מדויק - רק Plane014:", object.name);
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
    console.log(`בדיקת שם האובייקט הישיר: "${obj.name}"`);
    if (obj.parent) {
      console.log(`בדיקת שם האובייקט האב: "${obj.parent.name}"`);
      if (obj.parent.parent) {
        console.log(`בדיקת שם סב אבא: "${obj.parent.parent.name}"`);
      }
    }
    console.log(`האם כולל 300? ${obj.name.includes("300")}`);
    console.log(`האם כולל Cube? ${obj.name.includes("Cube")}`);
    console.log(`האם כולל book? ${obj.name.toLowerCase().includes("book")}`);
    console.log(`position:`, obj.position);
    console.log(`=== END DEBUG ===`);
    
    // לוג מיוחד לכל האובייקטים באזור השולחן
    if (obj.position && obj.position.x > -2 && obj.position.x < 3 && 
        obj.position.z > -2 && obj.position.z < 2) {
      console.log(`🔍 אובייקט באזור השולחן: "${obj.name}", position:`, obj.position);
    }
    
    // בדיקה מיוחדת לחטיף - עדיפות מקסימלית
    if (obj.name === "Cube008" || obj.name.includes("Cube008") || 
        obj.name.includes("Tostitos") || obj.name.includes("bag") ||
        (obj.name.toLowerCase().includes("tostitos"))) {
      console.log("זיהוי חטיף ישיר:", obj.name);
      setHovered("Cube008");
      document.body.style.cursor = 'pointer';
      return;
    }
    
    // בדיקה מיוחדת ליומן - עדיפות מקסימלית מאוד (לפני הפוסטר)
    if (obj.name === "Cube300_1" || obj.name.includes("Cube300") ||
        obj.name === "Cube.300" || obj.name.includes("300") ||
        obj.name.toLowerCase().includes("notebook") || obj.name.toLowerCase().includes("book") ||
        obj.name.toLowerCase().includes("diary") || obj.name.toLowerCase().includes("journal") ||
        (obj.parent && (obj.parent.name.includes("300") || obj.parent.name.toLowerCase().includes("book"))) ||
        // זיהוי לפי מיקום - אובייקטים קטנים באזור השולחן הימני
        (obj.position && obj.position.x > 1 && obj.position.x < 2.5 && 
         obj.position.z > -1 && obj.position.z < 0.5 && 
         obj.position.y > -0.5 && obj.position.y < 0.5)) {
      console.log("זיהוי יומן ישיר מעודכן עם עדיפות מקסימלית:", obj.name, "position:", obj.position);
      setHovered("Cube300_1");
      document.body.style.cursor = 'pointer';
      return;
    }
    
    // בדיקה מיוחדת לפוסטר Plane014 - עדיפות נמוכה יותר
    if (obj.name === "Plane014" && 
        obj.position && obj.position.x < 0.5) { // רק אם הפוסטר נמצא משמאל לשולחן
      console.log("זיהוי פוסטר ישיר:", obj.name);
      setHovered("Poster");
      document.body.style.cursor = 'pointer';
      return;
    }
    
    if (obj && (obj.userData.isInteractive || (obj.parent && obj.parent.userData && obj.parent.userData.isInteractive))) {
      const interactiveObj = obj.userData.isInteractive ? obj : obj.parent;
      
      // בדיקה נוספת לחטיף ברמת האובייקט האינטראקטיבי
      if (interactiveObj.userData.name === "Cube008" || 
          interactiveObj.name === "Cube008" || 
          interactiveObj.name.includes("Cube008")) {
        console.log("זיהוי חטיף באובייקט אינטראקטיבי:", interactiveObj.name);
        setHovered("Cube008");
        document.body.style.cursor = 'pointer';
        return;
      }
      
      // בדיקה נוספת לפוסטר ברמת האובייקט האינטראקטיבי
      if (interactiveObj.userData.name === "Poster" || 
          interactiveObj.name === "Plane014") {
        console.log("זיהוי פוסטר באובייקט אינטראקטיבי:", interactiveObj.name);
        setHovered("Poster");
        document.body.style.cursor = 'pointer';
        return;
      }
      
      // בדיקה נוספת ליומן ברמת האובייקט האינטראקטיבי
      if (interactiveObj.userData.name === "Cube300_1" || 
          interactiveObj.name === "Cube300_1" || interactiveObj.name.includes("Cube300_1") ||
          interactiveObj.name === "Cube.300" || interactiveObj.name.includes("Cube.300") ||
          interactiveObj.name === "Cube300" || interactiveObj.name.includes("Cube300") ||
          interactiveObj.name.includes("Notebook") || interactiveObj.name.includes("notebook") ||
          interactiveObj.name.includes("book") || interactiveObj.name.includes("diary") ||
          interactiveObj.name.includes("journal") ||
          // זיהוי לפי מיקום - כל אובייקט באזור השולחן הימני הוא יומן
          (obj.position && obj.position.x > 1.2 && obj.position.x < 2.3 && 
           obj.position.z > -0.8 && obj.position.z < 0.3 && 
           obj.position.y > -0.3 && obj.position.y < 0.3) ||
          // גם אם זה פוסטר באזור השולחן - יזוהה כיומן
          (interactiveObj.name === "Plane014" && obj.position && obj.position.x > 1.0)) {
        console.log("🔴 זיהוי יומן באובייקט אינטראקטיבי עם כל התנאים:", interactiveObj.name, "position:", obj.position);
        setHovered("Cube300_1");
        document.body.style.cursor = 'pointer';
        return;
      }
      
      // בדיקה שאנחנו לא כבר מציגים את אותו אובייקט
      if (hovered === interactiveObj.userData.name) {
        return; // כבר מציגים את האובייקט הזה
      }
      
      console.log(`אובייקט אינטראקטיבי נמצא: ${interactiveObj.name}, userData.name: ${interactiveObj.userData.name}`);
      console.log(`מה שיוצג בטקסט: ${ELEMENTS_MAP[interactiveObj.userData.name]}`);
      
      setHovered(interactiveObj.userData.name);
      
      document.body.style.cursor = 'pointer';
    } else {
      console.log(`אובייקט לא אינטראקטיבי: ${obj.name}`);
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
 * Component to display information about the currently hovered object with fixed positions.
 * @param {Object} props - Component properties.
 * @param {string|null} props.hovered - The name of the currently hovered object.
 */
function HoverInfo({ hovered }) {
  if (!hovered) return null;

  const text = ELEMENTS_MAP[hovered];
  console.log(`HoverInfo: hovered="${hovered}", text="${text}"`);
  
  // מיקומים קבועים עבור כל אלמנט בהתבסס על מיקומם בחדר
  const getFixedPosition = (elementKey) => {
    switch(elementKey) {
      case "Poster": // הפוסטר
        return { left: '22%', top: '11%' }; // למעלה משמאל
      case "Cube008": // החטיף
        return { left: '55%', top: '48%' }; // מעל החטיף על השולחן
      case "Plane002_2": // המחשב
        return { left: '42%', top: '40%' }; // מעל המחשב
      case "Gamepad": // הג'ויסטיק
        return { left: '55%', top: '25%' }; // מעל הג'ויסטיק
      case "Cube300_1": // היומן
        return { left: '35%', top: '55%' }; // מעל היומן
      default:
        return { left: '43%', top: '5%' }; // מיקום ברירת מחדל
    }
  };

  const position = getFixedPosition(hovered);
  
  return (
    <div style={{
      position: 'fixed',
      left: position.left,
      top: position.top,
      transform: 'translate(-50%, -100%)', // ממרכז את הטקסט ומציב אותו מעל הנקודה
      color: 'white',
      padding: '0px',
      fontFamily: 'BebasNeue-Regular, Arial, sans-serif',
      fontSize: '18px',
      zIndex: 1000,
      direction: 'ltr',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      transition: 'all 0.3s ease-out',
      animation: 'fadeInScale 0.3s ease-out'
    }}>
      {text || hovered}
      
      {/* CSS for animation */}
      <style>{`
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -100%) scale(0.8);
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, -100%) scale(1);
          }
        }
      `}</style>
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
      
      // טיפול מיוחד בפוסטר שמאלי (Plane014)
      if (obj.name === "Plane014") {
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  // הסרנו את מיקום העכבר כי עכשיו אנחנו משתמשים במיקומים קבועים

  // Camera initial settings
  const cameraX = 1;
  const cameraY = 2.2;
  const cameraZ = 14;
  const cameraFov = 45;

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
    posterLight: {
      position: [-11.5, -5.0, 19.8],
      angle: 0.30,
      penumbra: 0.77,
      distance: 24,
      decay: 0.1,
      intensity: 5,
      color: '#ffffff'
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

  // Effect to handle loading state - רק מסיים כשהמודל באמת נטען
  useEffect(() => {
    if (modelLoaded) {
      // המודל נטען - מסיים את הטעינה
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [modelLoaded]);

  return (
    <div id="model-container" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {isLoading && <LoadingScreen progress={loadingProgress} />}

      <Canvas
        style={{ background: '#1a1611' }}
        camera={{ 
          position: [cameraX, cameraY, cameraZ], 
          fov: cameraFov,
          near: 0.1,
          far: 1000
        }}
        shadows
        dpr={[1, 2]}
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
          <Model setHovered={setHovered} hovered={hovered} lights={lights} setModelLoaded={setModelLoaded} setLoadingProgress={setLoadingProgress} />
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