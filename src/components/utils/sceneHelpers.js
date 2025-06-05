import * as THREE from 'three';

/**
 * Logs all mesh objects in the scene to the console for debugging.
 * @param {THREE.Scene} scene - The Three.js scene object.
 */
export function logSceneObjects(scene) {
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
 * Enhances the interaction area of an object by adding an invisible bounding box helper.
 * This makes it easier to hover over thin or small objects.
 * @param {THREE.Mesh} object - The Three.js mesh object to enhance.
 */
export function enhanceInteractionArea(object) {
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

  // טיפול מיוחד בפוסטרים וטלוויזיה - הקטנה משמעותית למניעת חפיפות
  if (object.name === "Plane014" || object.name.includes("Poster") ||
      object.name === "TV" || object.name.includes("TV") ||
      object.name === "Plane002_1" || object.name === "Plane002_2") {
    // הקטנה ל-40% לפוסטרים וטלוויזיה למניעת חפיפות עם החטיף
    interactionHelper.scale.multiplyScalar(0.4);
    console.log("🖼️ הקטנת אזור פוסטר/טלוויזיה/מחשב ל-40%:", object.name);
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