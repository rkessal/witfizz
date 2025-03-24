import React, { useState, useEffect, useRef } from 'react';
import {
  spriteDimensions, MAPS_DATA,
  X, O, K, k, G, g, P, p, U, u, L, l, T, t, M, m, B, b, R, r, E, e,
  usr_admin,
  tpWiftfiz1,
  tpWiftfiz2,
  tpOffice1,
  tpOffice2,
  tpOffice3,
  tpGym,
  tpIcecream,
  tpMain,
} from '../utils/constants';
import { useSelector } from 'react-redux';

const MapEditor = () => {
  const canvasRef = useRef(null);
  const bgImageRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const rafRef = useRef(null);
  const isDrawingRef = useRef(false);
  const containerRef = useRef(null);
  const currentMap = useSelector(state => MAPS_DATA[state.currentMap]);

  const [selectedTile, setSelectedTile] = useState(X);
  const [mapData, setMapData] = useState(currentMap.table);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [configVisible, setConfigVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);

  const numRows = Math.ceil(currentMap.height / spriteDimensions.h);
  const numCols = Math.ceil(currentMap.width / spriteDimensions.w);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
        
        // Calculate initial zoom to fit the map
        const scaleX = width / currentMap.width;
        const scaleY = height / currentMap.height;
        const newZoom = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some margin
        
        // Center the map
        const centerX = (width - (currentMap.width * newZoom)) / 2;
        const centerY = (height - (currentMap.height * newZoom)) / 2;
        
        zoomRef.current = newZoom;
        positionRef.current = { x: centerX, y: centerY };
        
        if (canvasRef.current) {
          drawMap();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load background image once on mount
  useEffect(() => {
    const bgImage = new Image();
    bgImage.src = `/maps/${currentMap.name}.png`;
    bgImage.onload = () => {
      bgImageRef.current = bgImage;
      drawMap();
    };

    // Cleanup RAF on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const tileTypes = [
    { key: 'X', value: X, label: 'Wall' },
    { key: 'O', value: O, label: 'Floor' },
    { key: 'K', value: K, label: 'Kanban (walkable)' },
    { key: 'k', value: k, label: 'Kanban (blocked)' },
    { key: 'G', value: G, label: 'Gantt (walkable)' },
    { key: 'g', value: g, label: 'Gantt (blocked)' },
    { key: 'P', value: P, label: 'Project (walkable)' },
    { key: 'p', value: p, label: 'Project (blocked)' },
    { key: 'U', value: U, label: 'User (walkable)' },
    { key: 'u', value: u, label: 'User (blocked)' },
    { key: 'L', value: L, label: 'Task List (walkable)' },
    { key: 'l', value: l, label: 'Task List (blocked)' },
    { key: 'T', value: T, label: 'Tetris (walkable)' },
    { key: 't', value: t, label: 'Tetris (blocked)' },
    { key: 'M', value: M, label: 'Meeting (walkable)' },
    { key: 'm', value: m, label: 'Meeting (blocked)' },
    { key: 'B', value: B, label: 'Library (walkable)' },
    { key: 'b', value: b, label: 'Library (blocked)' },
    { key: 'R', value: R, label: 'Reception (walkable)' },
    { key: 'r', value: r, label: 'Reception (blocked)' },
    { key: 'E', value: E, label: 'Globe (walkable)' },
    { key: 'e', value: e, label: 'Globe (blocked)' },
    { key: 'usr_admin', value: usr_admin, label: 'User Admin (walkable)' },
    { key: 'tpOffice1', value: tpOffice1, label: 'TP Bureau 1 (walkable)' },
    { key: 'tpOffice2', value: tpOffice2, label: 'TP Bureau 2 (walkable)' },
    { key: 'tpOffice3', value: tpOffice3, label: 'TP Bureau Partenaire (walkable)' },
    { key: 'tpWiftfiz1', value: tpWiftfiz1, label: 'TP Witfizz 1 (walkable)' },
    { key: 'tpGym', value: tpGym, label: 'TP Gym (walkable)' },
    { key: 'tpIcecream', value: tpIcecream, label: 'TP Icecream (walkable)' },
    { key: 'tpMain', value: tpMain, label: 'TP Main (walkable)' },
  ];

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
        case 'taskList':
          return 'rgba(255, 192, 203, 0.3)'; // Pink
        case 'tetris':
          return 'rgba(0, 255, 255, 0.3)'; // Cyan
        case 'meeting':
          return 'rgba(255, 215, 0, 0.3)'; // Gold
        case 'library':
          return 'rgba(139, 69, 19, 0.3)'; // Brown
        case 'reception':
          return 'rgba(147, 112, 219, 0.3)'; // Purple
        case 'globe':
          return 'rgba(70, 130, 180, 0.3)'; // Steel Blue
        case 'tpOffice1':
          return 'rgba(255, 255, 0, 0.3)';
        case 'tpOffice2':
          return 'rgba(255, 255, 0, 0.3)';
        case 'tpOffice3':
          return 'rgba(255, 255, 0, 0.3)';
        case 'tpMain':
          return 'rgba(255, 255, 0, 0.3)';
        case 'tpWiftfiz1':
          return 'rgba(255, 255, 0, 0.3)';
        default:
          return 'rgba(255, 255, 0, 0.3)';
      }
    }
    
    return 'transparent';
  };

  const drawMap = () => {
    if (!canvasRef.current || !bgImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Create an off-screen canvas for double buffering
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    // Draw to offscreen canvas
    offscreenCtx.save();
    
    // Apply transformations
    offscreenCtx.translate(positionRef.current.x, positionRef.current.y);
    offscreenCtx.scale(zoomRef.current, zoomRef.current);
    
    // Draw background
    offscreenCtx.drawImage(bgImageRef.current, 0, 0, currentMap.width, currentMap.height);
    
    // Draw grid and tiles
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const x = col * spriteDimensions.w;
        const y = row * spriteDimensions.h;
        
        // Draw tile color
        const tileColor = getTileColor(mapData[row]?.[col]);
        if (tileColor !== 'transparent') {
          offscreenCtx.fillStyle = tileColor;
          offscreenCtx.fillRect(x, y, spriteDimensions.w, spriteDimensions.h);
        }
        
        // Draw grid
        offscreenCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        offscreenCtx.strokeRect(x, y, spriteDimensions.w, spriteDimensions.h);
      }
    }
    
    offscreenCtx.restore();
    
    // Clear main canvas and copy from offscreen canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get the position relative to the canvas
    const viewX = e.clientX - rect.left;
    const viewY = e.clientY - rect.top;

    // Convert to world coordinates
    const worldX = (viewX - positionRef.current.x) / zoomRef.current;
    const worldY = (viewY - positionRef.current.y) / zoomRef.current;

    const col = Math.floor(worldX / spriteDimensions.w);
    const row = Math.floor(worldY / spriteDimensions.h);

    // Update clicked position state with tile coordinates
    setClickedPosition({
      x: col,
      y: row
    });
    
    if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
      setMapData(prevMap => {
        const newMap = [...prevMap];
        newMap[row] = [...newMap[row]];
        newMap[row][col] = selectedTile;
        return newMap;
      });
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0 && e.shiftKey) {
      isDrawingRef.current = true;
      handleCanvasClick(e);
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawingRef.current) {
      handleCanvasClick(e);
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();

    // Handle zoom with Ctrl/Cmd + scroll
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY * -0.01;
      const newZoom = Math.min(Math.max(0.1, zoomRef.current + delta), 2);
      zoomRef.current = newZoom;
    } else if (e.shiftKey) {
      // Pan horizontally with Shift + scroll
      positionRef.current.x -= e.deltaY;
    } else {
      // Pan vertically with just scroll
      positionRef.current.y -= e.deltaY;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(drawMap);
  };

  // Update canvas setup effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to match container
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Draw map if background image is loaded
    if (bgImageRef.current) {
      console.log(currentMap);
      drawMap();
    }
  }, [mapData, canvasSize]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        width: '100vw', 
        height: '100vh',
        backgroundColor: '#1a1a1a',
        cursor: isDrawingRef.current ? 'crosshair' : 'default'
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
      />
      
      {clickedPosition && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 1000,
          fontFamily: 'monospace'
        }}>
          <div>Click Position (px):</div>
          <div>X: {clickedPosition.x}, Y: {clickedPosition.y}</div>
          <div>Tile Start (px):</div>
          <div>X: {clickedPosition.tileX}, Y: {clickedPosition.tileY}</div>
        </div>
      )}

      <button
        onClick={() => setConfigVisible(!configVisible)}
        style={{
          position: 'fixed',
          top: '10px',
          right: configVisible ? '320px' : '10px',
          zIndex: 1000,
          padding: '8px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'right 0.3s ease'
        }}
      >
        {configVisible ? 'Hide Config' : 'Show Config'}
      </button>

      {configVisible && (
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '300px',
            maxHeight: '95vh',
            overflowY: 'auto',
            backgroundColor: '#2a2a2a',
            padding: '15px',
            borderRadius: '8px',
            opacity: isHovering ? 1 : 0.2,
            transition: 'opacity 0.3s ease',
            zIndex: 999
          }}
        >
          <h3 style={{ color: '#fff', marginTop: 0 }}>Tile Selection</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {tileTypes.map(({ key, value, label }) => (
              <button
                key={key}
                onClick={() => setSelectedTile(value)}
                style={{
                  padding: '8px',
                  backgroundColor: selectedTile === value ? '#4CAF50' : '#3a3a3a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              // Convert tile objects back to keys for export
              const exportData = mapData.map(row => 
                row.map(tile => {
                  const tileType = tileTypes.find(t => t.value === tile);
                  return tileType ? tileType.key : ' ';
                })
              );
              // Format as raw characters without quotes
              const formattedData = '[\n  [' + 
                exportData.map(row => row.join(', ')).join('],\n  [') +
                ']\n]';
              console.log(formattedData);
            }}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Export Map Data
          </button>
        </div>
      )}
    </div>
  );
}

export default MapEditor;