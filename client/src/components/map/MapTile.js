import { useSelector } from 'react-redux';
import { MAPS_DATA } from '../../utils/constants';

function MapTile({ map, style }) {
  const currentMap = useSelector((state) => MAPS_DATA[state.currentMap]);

  return (
    <div
      id={map}
      style={{
        boxSizing: 'border-box',
        backgroundImage: `url(/maps/${map}.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 0',
        width: `${currentMap.width}px`,
        height: `${currentMap.height}px`,
        imageRendering: 'pixelated',
        ...style
      }}
    />
  );
}

export default MapTile;
