import * as THREE from 'three';

/**
 * Converts a snake_case or regular string to camelCase
 */
function toCamelCase(str) {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

/**
 * Converts a snake_case string to Title Case (e.g. cam_out_water_01 -> Out Water 01)
 */
function toTitleCase(str) {
  let cleaned = str;
  if (cleaned.startsWith("cam_")) {
    cleaned = cleaned.substring(4);
  }
  return cleaned
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Dynamically builds the TOUR_DATA graph from a GLTF scene containing camera nodes.
 * @param {THREE.Group} scene - The GLTF scene object.
 * @param {string} panoramasFolder - The folder containing the panorama images.
 */
export function buildTourGraph(scene, panoramasFolder) {
  const nodes = [];
  const tourData = {};

  // 1. Extract all camera nodes
  scene.traverse((child) => {
    // In Blender, cameras often come in as Object3D or PerspectiveCamera. 
    // We filter by checking if it has a translation and matches our expected node naming.
    if ((child.isCamera || child.name.includes("cam_") || child.type === "Object3D" || child.type === "Group") && child.parent?.type === "Scene") {
      // Ignore root objects that are just holding geometry, focus on the camera locators
      if (child.name !== "Scene") {
         nodes.push(child);
      }
    }
  });

  // If traverse didn't catch them properly because of GLTF nesting, ensure we only pick nodes that look like cameras
  // Usually, they are direct children of the scene
  const cameraNodes = scene.children.filter(c => c.name !== "Scene");

  let orderCounter = 0;

  cameraNodes.forEach((node) => {
    const rawName = node.name; // e.g. "cam_out_water_seating_04" or "penthouse"
    const id = toCamelCase(rawName);
    const isNamed = !rawName.startsWith("cam_");
    
    // Convert local position to world space just in case
    const worldPos = new THREE.Vector3();
    node.getWorldPosition(worldPos);

    tourData[id] = {
      id: id,
      rawName: rawName,
      name: toTitleCase(rawName),
      panorama: `${panoramasFolder}/${rawName}.jpg`,
      isNamed: isNamed,
      worldPosition: [worldPos.x, worldPos.y, worldPos.z],
      hotspots: [] // We'll compute these next
    };

    if (isNamed) {
      tourData[id].order = orderCounter++;
    }
  });

  // 2. Compute Hotspots based on Nearest Neighbors
  const allIds = Object.keys(tourData);
  
  allIds.forEach(id => {
    const current = tourData[id];
    const currentPos = new THREE.Vector3(...current.worldPosition);
    
    const distances = [];
    
    allIds.forEach(targetId => {
      if (id === targetId) return;
      const target = tourData[targetId];
      const targetPos = new THREE.Vector3(...target.worldPosition);
      
      const distance = currentPos.distanceTo(targetPos);
      
      // We only consider cameras within a reasonable walking distance (e.g., 20 units)
      // to avoid jumping through walls across the whole building.
      if (distance < 15) {
        distances.push({ targetId, distance, targetPos, target });
      }
    });

    // Sort by closest and pick top 4
    distances.sort((a, b) => a.distance - b.distance);
    const closest = distances.slice(0, 4);

    closest.forEach(neighbor => {
      // Calculate directional vector for the hotspot
      const direction = new THREE.Vector3()
        .subVectors(neighbor.targetPos, currentPos)
        .normalize();
      
      // Multiply by 6 to place the hotspot on the floor 6 units away (matching original hardcoded logic)
      const hotspotPos = direction.multiplyScalar(6);

      current.hotspots.push({
        targetId: neighbor.targetId,
        position: [hotspotPos.x, hotspotPos.y, hotspotPos.z],
        label: neighbor.target.name
      });
    });
  });

  return tourData;
}
