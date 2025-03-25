import { useState } from 'react';
import useWindowDimensions from '../../hooks/useWindowDimensions';
function GuitarComp() {
  const [strings, setStrings] = useState([0, 1, 2, 2, 0, -1]);
  const { width, height } = useWindowDimensions();
  return (
    <>
      <div
        style={{
          display: 'flex',
          width: `${width * 0.9}px`,
          height: `${height * 0.9}px`,
          flexDirection: 'column',
          justifyContent: 'center',
        }}></div>
    </>
  );
}

export default GuitarComp;
