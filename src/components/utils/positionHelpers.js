/**
 * מיקומים קבועים עבור כל אלמנט בהתבסס על מיקומם בחדר
 * @param {string} elementKey - מפתח האלמנט
 * @returns {Object} מיקום עם left ו-top
 */
export function getFixedPosition(elementKey) {
  switch(elementKey) {
    case "Poster": // הפוסטר
      return { left: '20%', top: '17%' }; // למעלה משמאל
    case "Cube008": // החטיף
      return { left: '55%', top: '54%' }; // מעל החטיף על השולחן
    case "Plane002_2": // המחשב
      return { left: '42%', top: '45%' }; // מעל המחשב
    case "Gamepad": // הג'ויסטיק
      return { left: '55%', top: '25%' }; // מעל הג'ויסטיק
    case "Cube300_1": // היומן
      return { left: '34%', top: '65%' }; // מעל היומן
    default:
      return { left: '42%', top: '8%' }; // מיקום ברירת מחדל
  }
} 