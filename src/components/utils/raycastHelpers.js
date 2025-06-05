import * as THREE from 'three';

/**
 * Creates an improved raycast function for an object to utilize the interaction helper.
 * @param {THREE.Mesh} object - The Three.js mesh object.
 * @returns {Function} The improved raycast function.
 */
export function createImprovedRaycast(object) {
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
export function findInteractiveObject(object) {
  let currentObj = object;
  while (currentObj) {
    if (currentObj.userData && currentObj.userData.isInteractive) {
      return currentObj;
    }
    currentObj = currentObj.parent;
  }
  return null;
} 