import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TELEPORT_TO_MAP, TOGGLE_MODAL_CAN_OPEN } from '../../reducers/mapReducer';
import './Teleport.css';

const Teleport = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.mapRoute);

  const handleTeleport = (confirm) => {
    if (confirm && data?.id) {
      dispatch(TELEPORT_TO_MAP(data.id));
    }
    dispatch(TOGGLE_MODAL_CAN_OPEN());
  };

  return (
    <div className="teleport-container">
      <h2>Voulez-vous vous téléporter vers {data?.label} ?</h2>
      <div className="teleport-buttons">
        <button 
          className="nes-btn is-success"
          onClick={() => handleTeleport(true)}
        >
          Oui
        </button>
        <button 
          className="nes-btn is-error"
          onClick={() => handleTeleport(false)}
        >
          Non
        </button>
      </div>
    </div>
  );
};

export default Teleport;