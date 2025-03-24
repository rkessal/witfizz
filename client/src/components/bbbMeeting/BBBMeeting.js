import React from 'react';
import 'nes.css/css/nes.min.css';
import '../rpgui.css';
import '../styles/animations.css';
import './bbb-meeting.css';
import { useState, useEffect } from 'react';
// import {useApplicationData} from '../hooks/useApplicationData.js'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { JOIN_BBB_MEETING, LEAVE_BBB_MEETING } from '../../reducers/mapReducer';
import Modal from "react-modal";

function BBBMeeting({ id }) {
  const meetingUrl = useSelector(state => state.bbbMeeting.url)
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  const onGeneralMeeting = async () => {
    if (meetingUrl === '') {
      const response = await axios.post('bbb/join-room', {
        fullName: user.name,
        meetingID: id,
        role: 'VIEWER'
      })
      dispatch(JOIN_BBB_MEETING(response.data.url))
    }
  }

  onGeneralMeeting()

  useEffect(() => {

    return () => dispatch(LEAVE_BBB_MEETING())
  }, [dispatch])

  return (
    <div className="main-dashboard-layout">
      <iframe 
        className='bbb-iframe'
        allow={`"camera ${meetingUrl}; microphone ${meetingUrl}"`}
        title='Meeting' src={meetingUrl} 
      />
    </div>
  );
}

export default BBBMeeting;
