import { MAP_TABLE, INTERIOR_OFFICE_MAP, spriteDimensions, viewportWidth, viewportHeight, basemapWidth, basemapHeight } from '../utils/constants';
import { stepSize } from '../utils/constants';

function getNextTile(direction, x, y, mapTable) {
  const tileSize = spriteDimensions.w; // 32 pixels
  
  // Calculate the next position based on direction
  let checkX = x;
  let checkY = y;
  
  switch (direction) {
    case 'ArrowDown':
      checkY = y + stepSize;
      break;
      
    case 'ArrowLeft':
      checkX = x - stepSize; // Check at left edge
      break;
      
    case 'ArrowRight':
      checkX = x + stepSize; // Check at right edge
      break;
      
    case 'ArrowUp':
      checkY = y - stepSize; // Check at top edge
      break;
      
    default:
      return null;
  }
  
  // Convert check position to tile coordinates
  const tileX = Math.floor(checkX / tileSize);
  const tileY = Math.floor(checkY / tileSize);
  
  // Determine which map to check based on Y position
  
  // Ensure we don't access array out of bounds
  if (tileY >= 0 && tileY < mapTable.length && tileX >= 0 && tileX < mapTable[0].length) {
    return mapTable[tileY][tileX];
  }
  
  // Return a non-walkable tile if out of bounds
  return { walk: false, action: false, special: false };
}

export default getNextTile;
