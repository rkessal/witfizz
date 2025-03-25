import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactGiphySearchbox from 'react-giphy-searchbox';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import {
  ANNOUNCEMENT,
  SEND_DIRECT,
  CLEAR_INCOMING,
  TOGGLE_GIF_SEARCH_OPEN,
  JOIN_BBB_MEETING,
  TOGGLE_MODAL_CAN_OPEN,
  SET_MAP_GUIDE,
} from '../../reducers/mapReducer';
import './chat.css';
import { FaClipboardList } from 'react-icons/fa';
import axios from '../../config/axios';
function Chat({ canOpen }) {
  const [chatboxShow, setChatboxShow] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [receiver, setReceiver] = useState('Everyone');
  const [showInstruction, setShowInstruction] = useState(false);
  const [nearPlayer, setNearPlayerPopup] = useState(false);
  const dispatch = useDispatch();
  const { width, height, topMargin, leftMargin } = useWindowDimensions();
  const userId = useSelector((state) => state.user.id);
  const userName = useSelector(state => state.user.name)
  const playersArr = useSelector((state) => state.players);
  const incomingGifState = useSelector((state) => state.incomingGif);
  const onlineUsers = useSelector((state) => state.players);
  const gifSearchOpen = useSelector((state) => state.gifSearchOpen);

  useEffect(() => {
    if (!incomingGifState.gifObj || !canOpen) return;
    setShowGif(true);
    let timer;
    timer = setTimeout(() => {
      setShowGif(false);
      dispatch(CLEAR_INCOMING());
    }, 5200);
  }, [incomingGifState, canOpen]);

  const toggleGifSearch = () => {
    dispatch(TOGGLE_GIF_SEARCH_OPEN());
  };
  const toggleInstruction = () => {
    setShowInstruction(!showInstruction);
  };
  const toggleNearPlayerPopup = () => {
    setNearPlayerPopup(prev => !prev)
  }

  const joinMeeting = async ({ guestId }) => {
    const sortedIds = [guestId, userId].sort();
    const meetingID = sortedIds.join('-');

    const response = await axios.post('bbb/join-room', {
      fullName: userName,
      meetingID,
      role: 'VIEWER'
    })

    dispatch(JOIN_BBB_MEETING(response.data.url))
    dispatch(SET_MAP_GUIDE({actionAsset: 'call'}))
    setNearPlayerPopup(false)
  }
  const userArr = [];
  for (let key in onlineUsers) {
    userArr.push(onlineUsers[key].name);
  }
  const userSelectList = userArr.map((e, ind) => {
    return (
      <option key={ind} value={e}>
        {e}
      </option>
    );
  });

  const isNearPlayer = Object.keys(playersArr[userId].nearPlayer).length > 0

  return (
    <>
      {canOpen && isNearPlayer && (
        <button
          className="nes-btn is-primary"
          onClick={toggleNearPlayerPopup}
          style={{
            zIndex: 21,
            position: 'absolute',
            left: `${width - leftMargin - 255}px`,
            top: `${topMargin + 230}px`,
            width: '186px',
            height: '39px',
            paddingLeft: '3px',
          }}>
          Chat
        </button>
      )}
      {canOpen && nearPlayer && (
        <div
          className="nes-container is-rounded is-dark"
          style={{
            position: 'absolute',
            left: `${(width - 375) / 2}px`, //keep instruction window centered
            top: `${(height - 200) / 2}px`,
            width: '375px',
            height: '200px',
            margin: '0 15px 0',
          }}>
          <div style={{ display: 'flex', 'justify-content': 'space-between' }}>
            <h2
              style={{
                zIndex: '1',
                color: 'white',
              }}>
              Chat
            </h2>
            <section className="icon-list">
              <i
                style={{ backgroundColor: 'white' }}
                className="nes-icon close is-small nes-pointer"
                onClick={toggleNearPlayerPopup}></i>
            </section>
          </div>
          <p>Do you want to chat with: </p>
          <ul>
            {Object.keys(playersArr[userId].nearPlayer).map(id => (
              <li key={id} onClick={() => joinMeeting({guestId: id})}>{playersArr[id].name}</li>
            ))}
          </ul>
        </div>
      )}
      {/* ---Instruction--- */}
      {canOpen && (
        <button
          className="nes-btn is-primary"
          onClick={toggleInstruction}
          style={{
            zIndex: 21,
            position: 'absolute',
            left: `${width - leftMargin - 255}px`,
            top: `${topMargin + 38}px`,
            width: '186px',
            height: '39px',
            paddingLeft: '3px',
          }}>
          Instruction
        </button>
      )}
      {canOpen && showInstruction && (
        <div
          className="nes-container is-rounded is-dark"
          style={{
            position: 'absolute',
            left: `${(width - 375) / 2}px`, //keep instruction window centered
            top: `${(height - 200) / 2}px`,
            width: '375px',
            height: '200px',
            margin: '0 15px 0',
          }}>
          <div style={{ display: 'flex', 'justify-content': 'space-between' }}>
            <h2
              style={{
                zIndex: '1',
                color: 'white',
              }}>
              Instruction
            </h2>
            <section className="icon-list">
              <i
                style={{ backgroundColor: 'white' }}
                className="nes-icon close is-small nes-pointer"
                onClick={() => toggleInstruction()}></i>
            </section>
          </div>
          <p>Move: ⬆ ➡ ⬇ ⬅ </p>
          <p>Action: Space</p>
          <p>Close window: Space</p>
        </div>
      )}
      {/* ---Send GIF button--- */}
      {canOpen &&
        playersArr[userId] !== undefined &&
        playersArr[userId].socketId &&
        playersArr[userId].skin && (
          <button
            className="nes-btn is-primary"
            onClick={toggleGifSearch}
            style={{
              zIndex: 20,
              position: 'absolute',
              left: `${width - leftMargin - 255}px`,
              top: `${topMargin + 134}px`,
              width: '186px',
              height: '39px',
              paddingLeft: '3px',
            }}>
            Send a GIF
          </button>
        )}

      {/* ---Logo--- */}
      {canOpen && (
        <div>
          <h1
            style={{
              left: `${leftMargin}px`,
              top: `${topMargin - 10}px`,
              margin: '0 15px 0',
              position: 'absolute',
              zIndex: -200,
              color: 'white',
            }}>
            WorkLand
          </h1>
        </div>
      )}

      {/* ---Search GIF Box--- */}
      {gifSearchOpen && canOpen && (
        <div
          className="nes-container is-rounded is-dark"
          style={{
            zIndex: 20,
            position: 'absolute',
            left: `${width / 2 + 200}px`,
            top: `${height / 2 - 150}px`,
            width: '335px',
            margin: '0 15px 0',
          }}
          onKeyPressCapture={(e) => {
            if (e.code === 'Space') {
              e.stopPropagation();
            }
          }}>
          <div style={{ display: 'flex', 'justify-content': 'space-between' }}>
            <h3
              style={{
                color: 'white',
              }}>
              Send a GIF!
            </h3>
            <section className="icon-list">
              <i
                style={{ backgroundColor: 'white' }}
                className="nes-icon close is-small nes-pointer"
                onClick={() => toggleGifSearch()}></i>
            </section>
          </div>
          <div
            style={{
              color: 'white',
            }}>
            To:{' '}
          </div>
          <select
            style={{
              width: '100%',
            }}
            name="pets"
            id="pet-select"
            onChange={(event) => setReceiver(event.target.value)}>
            <option value="">Everyone</option>
            {userSelectList}
          </select>
          <ReactGiphySearchbox
            masonryConfig={[
              { columns: 2, imageWidth: 110, gutter: 4 },
              { mq: '280px', columns: 2, imageWidth: 140, gutter: 4 },
            ]}
            apiKey="IqdjO72Noi1ikvZCa1ehpeiKkK7atZGd"
            onSelect={(item) => {
              toggleGifSearch();
              if (receiver === 'Everyone') {
                return dispatch(ANNOUNCEMENT({ gifObj: item }));
              }
              dispatch(SEND_DIRECT({ gifObj: item, receiverName: receiver }));
              setReceiver('Everyone');
            }}
          />
        </div>
      )}

      {/* ---GIF Message Display--- */}
      {showGif && canOpen && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            flexDirection: 'column',
            left: `${width / 2 + 260}px`, //260 to center the GIF within walls on the map
            top: `${height / 2 - 70}px`,
          }}>
          <p
            className="textBubble"
            style={{
              width: '235px',
              marginBottom: '0px !important',
              padding: '10px 10px 10px 10px',
              justifyContent: 'center',
            }}
            className="nes-balloon from-right">
            A GIF' from: {incomingGifState.senderName} to{' '}
            {incomingGifState.receiverName === null
              ? 'everyone'
              : `${incomingGifState.receiverName}`}
          </p>

          <iframe
            style={{
              width: '235px',
              justifyContent: 'center',
            }}
            title="GIF"
            src={incomingGifState.gifObj.embed_url}
            width="320"
            height="320"
            frameBorder="0"
            className="giphy-embed"></iframe>
        </div>
      )}
    </>
  );
}

export default Chat;
