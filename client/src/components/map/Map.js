import { useSelector } from 'react-redux';
import Sprite from '../sprites';
import MapTile from './MapTile';
import './style.css';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import {
  kanbanPosition,
  kanbanData,
  projectData,
  projectPosition,
  taskData,
  taskPosition,
  ganttChartPosition,
  ganttChartData,
  userData,
  userPosition,
  libraryPosition,
  meetingPosition,
  viewportWidth,
  viewportHeight,
  spriteDimensions,
  MAPS_DATA,
} from '../../utils/constants';
import { useState, useEffect, useRef } from 'react';

function Map({ x }) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const canvasRef = useRef(null);

  const kanban = useSelector((state) => state.mapGuide.kanban);
  const userDashboard = useSelector((state) => state.mapGuide.userDashboard);
  const ganttChart = useSelector((state) => state.mapGuide.ganttChart);
  const projectDashboard = useSelector(
    (state) => state.mapGuide.projectDashboard
  );
  const taskList = useSelector((state) => state.mapGuide.taskList);
  const piano = useSelector((state) => state.mapGuide.piano);
  const guitar = useSelector((state) => state.mapGuide.guitar);
  const tetris = useSelector((state) => state.mapGuide.tetris);
  const globe = useSelector((state) => state.mapGuide.globe);
  const reception = useSelector((state) => state.mapGuide.reception);
  const win98 = useSelector((state) => state.mapGuide.win98);
  const library = useSelector((state) => state.mapGuide.library);
  const meeting = useSelector((state) => state.mapGuide.meeting);
  const localUserState = useSelector((state) => state.players[state.localID]);
  const currentMap= useSelector((state) => MAPS_DATA[state.currentMap]);

  const { leftMargin, topMargin } = useWindowDimensions();

  const cameraX = Math.max(
    Math.min(
      -(localUserState?.x || 0) + viewportWidth / 2,
      0
    ),
    -(currentMap.width - viewportWidth)
  );

  const cameraY = Math.max(
    Math.min(
      -(localUserState?.y || 0) + viewportHeight / 2,
      0
    ),
    -(currentMap.height - viewportHeight)
  );

  const getTileColor = (tile) => {
    if (!tile) return 'transparent';
    
    if (!tile.walk) {
      return 'rgba(255, 0, 0, 0.3)';
    }
    
    if (tile.action) {
      switch (tile.asset) {
        case 'kanban':
          return 'rgba(0, 255, 0, 0.3)';
        case 'ganttChart':
          return 'rgba(0, 0, 255, 0.3)';
        case 'projectDashboard':
          return 'rgba(255, 165, 0, 0.3)';
        case 'userDashboard':
          return 'rgba(128, 0, 128, 0.3)';
        default:
          return 'rgba(255, 255, 0, 0.3)';
      }
    }
    
    return 'transparent';
  };

  useEffect(() => {
    if (!isDebugMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match viewport
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate visible tile range based on current map
    const startCol = Math.max(0, Math.floor(-cameraX / spriteDimensions.w));
    const startRow = Math.max(0, Math.floor(-cameraY / spriteDimensions.h));
    const endCol = Math.min(
      Math.ceil(currentMap.width / spriteDimensions.w),
      Math.ceil((viewportWidth - cameraX) / spriteDimensions.w)
    );
    const endRow = Math.min(
      Math.ceil(currentMap.height / spriteDimensions.h),
      Math.ceil((viewportHeight - cameraY) / spriteDimensions.h)
    );
    
    // Draw visible tiles
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const x = col * spriteDimensions.w + cameraX;
        const y = row * spriteDimensions.h + cameraY;
        
        // Draw tile color - adjust row index based on current map
        const tileColor = getTileColor(currentMap.table[row]?.[col]);
        if (tileColor !== 'transparent') {
          ctx.fillStyle = tileColor;
          ctx.fillRect(x, y, spriteDimensions.w, spriteDimensions.h);
        }
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeRect(x, y, spriteDimensions.w, spriteDimensions.h);
      }
    }
  }, [isDebugMode, cameraX, cameraY, localUserState?.x, localUserState?.y, currentMap]);

  return (
    <div
      id="map"
      key={currentMap.name}
      style={{
        position: 'absolute',
        top: `${topMargin}px`,
        left: `${leftMargin}px`,
        width: `${viewportWidth}px`,
        height: `${viewportHeight}px`,
        overflow: 'hidden',
      }}>
      <div style={{
        position: 'absolute',
        transform: `translate(${cameraX}px, ${cameraY}px)`,
        width: `${currentMap.width}px`,
        height: `${currentMap.height}px`,
      }}>
        <MapTile map={currentMap.name} />
        {/* Only show sprites for current map */}
        {currentMap.name === 'main' && (
          <>
            {kanban && (
              <Sprite
                zoom={0.4}
                image={'/sprites/bubbles/kanban.gif'}
                data={kanbanData}
                position={kanbanPosition}
              />
            )}
            {userDashboard && (
              <Sprite
                zoom={0.4}
                image={'/sprites/bubbles/about.gif'}
                data={userData}
                position={userPosition}
              />
            )}
            {ganttChart && (
              <Sprite
                zoom={0.4}
                image={'/sprites/bubbles/schedule.gif'}
                data={ganttChartData}
                position={ganttChartPosition}
              />
            )}
            {projectDashboard && (
              <Sprite
                zoom={0.4}
                image={'/sprites/bubbles/projects.gif'}
                data={projectData}
                position={projectPosition}
              />
            )}
            {taskList && (
              <Sprite
                zoom={0.4}
                image={'/sprites/bubbles/tasks.gif'}
                data={taskData}
                position={taskPosition}
              />
            )}
            {piano && (
              <Sprite
                image={'/sprites/action.png'}
                data={{ h: 32, w: 32, x: 0, y: 0 }}
                position={{ x: 336, y: 286 }}
              />
            )}
            {guitar && (
              <Sprite
                image={'/sprites/action.png'}
                data={{ h: 32, w: 32, x: 0, y: 0 }}
                position={{ x: 225, y: 286 }}
              />
            )}
            {tetris && (
              <Sprite
                image={'/sprites/action.png'}
                data={{ h: 32, w: 32, x: 0, y: 0 }}
                position={{ x: 145, y: 286 }}
              />
            )}
            {globe && (
              <Sprite
                image={'/sprites/action.png'}
                data={{ h: 32, w: 32, x: 0, y: 0 }}
                position={{ x: 560, y: 480 }}
              />
            )}
            {reception && (
              <Sprite
                zoom={0.3}
                image={'/sprites/bubbles/work.gif'}
                data={{ h: 180, w: 588, x: 0, y: 0 }}
                position={{ x: -135, y: 456 }}
              />
            )}
            {win98 && (
              <Sprite
                image={'/sprites/action.png'}
                data={{ h: 180, w: 288, x: 0, y: 0 }}
                position={{ x: 45, y: 286 }}
              />
            )}
            {library && (
              <Sprite
                image={'/sprites/action.png'}
                data={{ h: 32, w: 32, x: 0, y: 0 }}
                position={libraryPosition}
              />
            )}
            {meeting && (
              <Sprite
                image={'/sprites/action.png'}
                data={{ h: 32, w: 32, x: 0, y: 0 }}
                position={meetingPosition}
              />
            )}
          </>
        )}
      </div>
      {isDebugMode && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      )}
      <button
        onClick={() => setIsDebugMode(!isDebugMode)}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '8px',
          backgroundColor: isDebugMode ? '#4CAF50' : '#f0f0f0',
          color: isDebugMode ? 'white' : 'black',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}>
        {isDebugMode ? 'Disable Debug' : 'Enable Debug'}
      </button>
    </div>
  );
}

export default Map;
