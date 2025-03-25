import 'react-piano/dist/styles.css';

import './styles.css';
import useWindowDimensions from '../../hooks/useWindowDimensions';
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

function PianoComp() {
  const { width, height } = useWindowDimensions();
  return (
    <div
      style={{
        display: 'flex',
        width: `${width * 0.9}px`,
        height: `${height * 0.9}px`,
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
      <h1>Play some tunes!</h1>

      <div className="mt-5">
        {/* <ResponsivePiano width={width} height={height * 0.5} /> */}
      </div>
    </div>
  );
}

export default PianoComp;
