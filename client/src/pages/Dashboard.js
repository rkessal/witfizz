import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import 'nes.css/css/nes.min.css';
import '../components/styles/animations.css';
import Players from '../components/players';
import Map from '../components/map/Map';
import ModalInput from '../components/modal/ModalInput';
import MainModal from '../components/modal/MainModal';
import useMapGuide from './../hooks/useMapGuide';
import MainNav from '../components/MainNav';
import { SET_USER } from '../reducers/mapReducer';
import axios from '../config/axios';


const Dashboard = () => {
  const { playerNearGuide } = useMapGuide();
  const modalCanOpen = useSelector((state) => state.mapRoute.modalCanOpen);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get("/logout");
      dispatch(SET_USER({ id: '', name: '', avatar: '', role: '' }));
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div className="dashboard-layout stars" id="snow">
      <div className="twinkling">
        {modalCanOpen && playerNearGuide && <MainModal isOpen={true} className="main-modal"/>}
        {!(modalCanOpen && playerNearGuide) && <MainNav></MainNav>}
        <ModalInput isOpen={true} />
        <Map x={0} />
        <Players />
        <button 
        onClick={handleLogout}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
        Quitter
        </button>
        {/* <Chat canOpen={!(modalCanOpen && playerNearGuide)} /> */}
      </div>
    </div>
  );
};

export default Dashboard;
