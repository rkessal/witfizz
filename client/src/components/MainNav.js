import React from 'react';
import './styles/MainNav.css';
import { FaClipboardList } from 'react-icons/fa';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { useDispatch } from 'react-redux';
import { TELEPORT_TO_MAP } from '../reducers/mapReducer';
import { MAPS_DATA } from '../utils/constants';

function MainNav() {
  const dispatch = useDispatch();
  const debug = false;

  const handleTeleport = (map) => {
    dispatch(TELEPORT_TO_MAP(map));
  };

  return debug && (
    <div className='nav'>
      <div className='nav-container'>
        <div
            style={{
              position: 'fixed',
              display: 'flex',
              flexDirection: 'column',
              top: '10px',
              right: '10px',
              zIndex: 1000,
            }}>
          { Object.keys(MAPS_DATA).map((map) => (
            <button 
              className="nes-btn is-primary"
              onClick={() => handleTeleport(map)}
              >
            {MAPS_DATA[map].name}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}

export default MainNav;
