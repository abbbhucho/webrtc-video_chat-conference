import * as chatWindow from "./chatWindow.js";
import * as wss from "./wss.js";
import * as store from "./store.js";
import * as ui from "./ui.js";
import * as constants from "./constants.js";
import Peer from "simple-peer";

const defaultConstraints = {
    audio: true,
    video: {
      width: "960",
      height: "720",
    },
};

const audioConstraints = {
  audio: true,
  video: false
}

let localStream;

let peers = {};
let streams = [];

const getConfiguration = () => {
  return {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };
};

export const getLocalPreviewAndInitRoomConnection = async (
  isRoomHost,
  identity,
  callType,
  roomId = null
) => {
  const constraints = callType === constants.callType.VIDEO_GROUP_CODE ? defaultConstraints : audioConstraints;
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      console.log("successfuly received local stream");
      localStream = stream;
      ui.showLocalVideoPreview(localStream, callType);

      if(isRoomHost){
        const data = {
          identity,
          conversationId: store.getState().conversationId,
          callType
        }
        wss.createNewRoom(data) 
      } else {
        const data = {
          identity,
          conversationId: store.getState().conversationId,
          callType,
          roomId
        }
        wss.joinRoom(data);
      }
    })
    .catch((err) => {
      console.log(
        "error occurred when trying to get an access to local stream"
      );
      console.log(err);
    });
};

export const informMeetingSet = (data) => {
  const { connectedRoomUsers } = data;
  store.setRoomParticipants(connectedRoomUsers);
  let callType = null;

  connectedRoomUsers.forEach((connectedRoomUser) => {
    if(connectedRoomUser.conversationId == store.getState().conversationId && connectedRoomUser.isRoomHost) {
      if(connectedRoomUser.roomId){
        store.setRoomId(connectedRoomUser.roomId);
      }
      if(connectedRoomUser.callType === constants.callType.VIDEO_GROUP_CODE ||
          connectedRoomUser.callType === constants.callType.VOICE_GROUP_CODE
        ) {
          callType = connectedRoomUser.callType;
      }
    }
  });
  if(callType){
    if(callType === constants.callType.VIDEO_GROUP_CODE) {
      const groupCodeVideoButton = ui.changeVideoGroupBtn();
      // set data-attribute to group btn
      groupCodeVideoButton.setAttribute('room-set', 'true');
    } else {
      const groupCodeAudioButton = ui.changeAudioGroupBtn();
      // set data-attribute to audio btn
      groupCodeAudioButton.setAttribute('room-set', 'true');
    }
    // returns live group video/audio code btn after setting in-room
  }
  console.log(store.getState());
}

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  const configuration = getConfiguration();

  peers[connUserSocketId] = new Peer({
    initiator: isInitiator,
    config: configuration,
    stream: localStream,
  });

  peers[connUserSocketId].on("signal", (data) => {
    // webRTC offer, webRTC Answer (SDP informations), ice candidates

    const signalData = {
      signal: data,
      connUserSocketId: connUserSocketId,
    };

    wss.signalPeerData(signalData);
  });

  peers[connUserSocketId].on("stream", (stream) => {
    console.log("new stream came");

    ui.addStream(stream, connUserSocketId);
    streams = [...streams, stream];
  });
}

export const handleSignalingData = (data) => {
  //add signaling data to peer connection
  peers[data.connUserSocketId].signal(data.signal);
}

export const removePeerConnection = (data) => {
  const { socketId } = data;
  const videoContainer = document.getElementById(socketId);
  const videoEl = document.getElementById(`${socketId}-video`);

  if(videoContainer && videoEl) {
    const tracks = videoEl.srcObject.getTracks();

    tracks.forEach(t => t.stop());
    
    videoEl.srcObject = null;
    videoContainer.removeChild(videoEl);

    videoContainer.parentNode.removeChild(videoContainer);
    chatWindow.Dish();

    if (peers[socketId]) {
      peers[socketId].destroy();
    }
    delete peers[socketId];
  }
}
// group buttons logic
// audio
export const muteAudioInVoiceCall = () => {
  const localAudioStream = localStream;
  const micEnabled = localAudioStream.getAudioTracks()[0].enabled;
  localAudioStream.getAudioTracks()[0].enabled = !micEnabled;
  ui.updateMicButtonForGrpVoiceCall(micEnabled);
}

export const hangUpVoiceCall = () => {
  const currUserSocketId = store.getState().socketId;
  if (peers[currUserSocketId]) {
    peers.forEach(peer => {
      peer.destroy();
    });
    peers = null;
  }

  const roomId = store.getState().roomId;
  wss.userDisconnectedRoom({ roomId });
  store.setRoomParticipants([]);
  store.setRoomId(null);
  localStream = null;
  // ui change back to chat room
  ui.hideCallContainerOnCloseConnection(constants.callType.VOICE_GROUP_CODE);
}

// group buttons logic
// video
export const muteAudioInVideoCall = () => {
  const localAudioStream = localStream;
  const micEnabled = localAudioStream.getAudioTracks()[0].enabled;
  localAudioStream.getAudioTracks()[0].enabled = !micEnabled;
  ui.updateMicButtonForGrpVideoCall(micEnabled);
}

export const muteVideoInVideoCall = () => {
  const localVideoStream = localStream;
  const cameraEnabled = localVideoStream.getVideoTracks()[0].enabled;
  localVideoStream.getVideoTracks()[0].enabled = !cameraEnabled;
  ui.updateCameraButtonForGrpVideoCall(cameraEnabled);
}


export const hangUpVideoCall = () => {
  const currUserSocketId = store.getState().socketId;
  if (peers[currUserSocketId]) {
    peers.forEach(peer => {
      peer.destroy();
    });
    peers = null;
  }

  const roomId = store.getState().roomId;
  wss.userDisconnectedRoom({ roomId });
  store.setRoomParticipants([]);
  store.setRoomId(null);
  localStream = null;
  // ui change back to chat room
  ui.hideCallContainerOnCloseConnection(constants.callType.VIDEO_GROUP_CODE);
}