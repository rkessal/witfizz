import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { TOGGLE_MODAL_CAN_OPEN } from "../../reducers/mapReducer";
import "./modal.css";
import UserDashboard from "../userDashboard/UserDashboard";
import ProjectCardList from "../projects/projectCardList";
import Kanban from "../kanban/Kanban";
import TaskTable from "../tasks/TaskTable";
import PianoComp from "../piano";
import GuitarComp from "../guitar";
import TetrisComp from "../game";
import GanttChart from "../gantt-chart/GanttChart";
import GlobeComp from "../globe";
import Computer from "../win98";
import BBBMeeting from "../bbbMeeting/BBBMeeting";
import Library from "../Library/Library";
import UserManagement from "../userManagement/UserManagement";
import Teleport from "../teleport/Teleport";

function MainModal(props) {
  const dispatch = useDispatch();
  const [modalIsOpen, setModalIsOpen] = useState(props.isOpen);
  const { routeName: mapRoute, data: mapData } = useSelector((state) => state.mapRoute);
  const userRole = useSelector((state) => state.user.role);
  let modal = document.getElementsByClassName("ReactModal__Overlay");
  modal.className += "main-modal";
  MainModal.defaultStyles = {};
  console.log(mapRoute)

  // Handle keyboard events when modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalIsOpen) {
        // Stop propagation of keyboard events when modal is open
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [modalIsOpen]);

  return (
    <>
      <Modal
        className="nes-container is-rounded is-dark main-modal"
        isOpen={modalIsOpen}
        ariaHideApp={true}
        onRequestClose={() => {
          setModalIsOpen(false);
          dispatch(TOGGLE_MODAL_CAN_OPEN());
        }}
      >
        <i
          style={{ backgroundColor: "white" }}
          className="nes-icon close is-small nes-pointer"
          onClick={() => {
            setModalIsOpen(false);
            dispatch(TOGGLE_MODAL_CAN_OPEN());
          }}
        ></i>
        {/* {===============project management features==========} */}
        {mapRoute === "userDashboard" ? <UserDashboard /> : <div />}
        {mapRoute === "kanban" ? <Kanban /> : <div />}
        {mapRoute === "ganttChart" ? <GanttChart></GanttChart> : <div />}
        {mapRoute === "projectDashboard" ? <ProjectCardList /> : <div />}
        {mapRoute === "taskList" ? <TaskTable /> : <div />}
        {mapRoute === "user-admin" && <UserManagement />}

        {/* <div>
          <ProjectCardList />
        </div> */}

        {/* {===============cool extra features==================} */}
        {mapRoute === "piano" ? (
          <div>
            <PianoComp></PianoComp>
          </div>
        ) : (
          <div />
        )}
        {mapRoute === "guitar" ? (
          <div>
            <GuitarComp></GuitarComp>
          </div>
        ) : (
          <div />
        )}
        {mapRoute === "tetris" ? (
          <div>
            <TetrisComp></TetrisComp>
          </div>
        ) : (
          <div />
        )}

        {mapRoute === "globe" ? (
          <div>
            <GlobeComp></GlobeComp>
          </div>
        ) : (
          <div />
        )}

        {mapRoute === "win98" ? (
          <div>
            <Computer></Computer>
          </div>
        ) : (
          <div />
        )}

        {mapRoute === "reception" ? (
          <div>
            <UserDashboard />
          </div>
        ) : (
          <div />
        )}

        {['meeting', 'call'].includes(mapRoute) && (
          <div>
            <BBBMeeting id={mapRoute === 'meeting' && 'meeting'} />
          </div>
        )}
        {mapRoute === 'library' && <Library />}
        {mapRoute === 'tp' && <Teleport />}
      </Modal>
    </>
  );
}

export default MainModal;
