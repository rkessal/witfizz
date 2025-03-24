import { useEffect, useState } from 'react';

import { MAPS_DATA, navBarHeight } from '../utils/constants';
import { useSelector } from 'react-redux';
function getWindowDimensions({ baseWidth, baseHeight}) {
  const { innerWidth: width, innerHeight: height } = window;
  let left, top;
  if (width < baseWidth) {
    left = 0;
  } else {
    left = (width - baseWidth) / 2;
  }
  if (height < baseHeight + navBarHeight) {
    top = navBarHeight;
  } else {
    top = (height - baseHeight - navBarHeight) / 2 + navBarHeight;
  }
  return {
    leftMargin: left,
    topMargin: top,
    width,
    height,
  };
}

export default function useWindowDimensions() {
  const currentMap = useSelector((state) => MAPS_DATA[state.currentMap]);
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions({baseWidth: currentMap.width, baseHeight: currentMap.height})
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions({baseWidth: currentMap.width, baseHeight: currentMap.height}));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
