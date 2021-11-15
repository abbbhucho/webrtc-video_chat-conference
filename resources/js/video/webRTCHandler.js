import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";
import * as chatWindow from "./chatWindow.js";

let connectedUserDetails;
let peerConnection;

const defaultConstraints = {
  audio: true,
  video: true
}

const voiceConstraints = {
  audio: true
}

const configuration = {
  iceServers: [
    {
      urls: 'stun:stun.1.google.com:13902' 
    }
  ]
}
// voice 
export const getVoiceLocalPreview = async () => {
  navigator.mediaDevices.getUserMedia(voiceConstraints)
  .then((stream) => {
    store.setVoiceLocalStream(stream);
  }).catch((err) => {
    console.log("error occured when trying to get an access to microphone for voice call: ", err);
  });
}

// video
export const getLocalPreview = async () => {
  navigator.mediaDevices.getUserMedia(defaultConstraints)
  .then((stream) => {
    // ui.updateLocalVideo(stream);
    store.setLocalStream(stream);
  }).catch((err) => {
    console.log("error occured when trying to get an access to camera: ", err);
  });
}

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    console.log("getting ice candidate from stun server");
    if (event.candidate) {
      // send our ice candidate to other peer
      wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.WebRTCSignalling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  }

  peerConnection.onconnectionstatechange = (event) => {
    // console.log("event name onconnectionstatechange for peerconnection");
    if (peerConnection.connectionState === 'connected'){
      console.log("successfully connected with other peer");
    }
  }

  // receiving tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
    ui.updateRemoteVideo(remoteStream);
  } else if(connectedUserDetails.callType === constants.callType.VOICE_PERSONAL_CODE) {
    ui.updateRemoteAudio(remoteStream);
  }

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  }

  // add our stream to peer connection

  if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
    const localStream = store.getState().localStream;

    for (const track of localStream.getTracks()){
      peerConnection.addTrack(track, localStream);
    }
  } else if(connectedUserDetails.callType === constants.callType.VOICE_PERSONAL_CODE) {
    const localVoiceStream = store.getState().localVoiceStream;

    for (const track of localVoiceStream.getTracks()){
      peerConnection.addTrack(track, localVoiceStream);
    }
  }
};

export const sendPreOffer = (callType, conversationId, authId, authUuid) => {
  connectedUserDetails = {
    callType,
    authId,
    authUuid,
    conversationId
  };

  if (
    callType === constants.callType.VOICE_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    // const sendTo = store.getState().sendTo;
    const data = {
      callType,
      authId,
      authUuid,
      conversationId
      // sendTo
    };
    ui.showCallingDialog(callingDialogRejectCallHandler);
    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId, connectorUserId, callerConversationId } = data;

  connectedUserDetails = {
    conversationId: callerConversationId,
    callType,
    connectorUserId,
    socketId: callerSocketId
  };

  if (
    callType === constants.callType.VOICE_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    console.log("showing call dialog");
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);

    let call_container = null;
    if(callType === constants.callType.VOICE_PERSONAL_CODE)
    {
      call_container = document.getElementById('voice_call_container');
      chatWindow.useSpinner(getVoiceLocalPreview(), call_container);
    } 
    else if(callType === constants.callType.VIDEO_PERSONAL_CODE)
    {
      call_container = document.getElementById('call_container');
      chatWindow.useSpinner(getLocalPreview(), call_container);
    }

  }
};

const acceptCallHandler = () => {
  console.log("call accepted");
  
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  if( connectedUserDetails.callType == constants.callType.VIDEO_PERSONAL_CODE ) {
    ui.updateLocalVideo(store.getState().localStream);
    ui.showVideoContainer();
  } else if( connectedUserDetails.callType == constants.callType.VOICE_PERSONAL_CODE  ) {
    ui.updateLocalAudio(store.getState().localVoiceStream);
    ui.showVoiceContainer();
  }
  createPeerConnection();
  
  ui.showCallElements(connectedUserDetails.callType);
  
  
};

const rejectCallHandler = () => {
  console.log("call rejected");
  // // sendPreOfferAnswer();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {
  console.log("rejecting the call");
  const data = {
    authId: connectedUserDetails.authId,
    conversationId: connectedUserDetails.conversationId,
    authUuid: connectedUserDetails.authUuid
  }
  wss.sendCallerHangedUpCall(data);
  ui.hideCallContainerOnCloseConnection(connectedUserDetails.callType);
  connectedUserDetails = null;
  ui.removeAllDialogs();
};

const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    calleeSocketId: store.getState().socketId,
    preOfferAnswer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  const { callerSocketId, calleeSocketId, preOfferAnswer } = data;

  // console.log("calleeSocketId from handlePreOfferAnswer", callerSocketId, calleeSocketId);
  connectedUserDetails.socketId = calleeSocketId;
  ui.removeAllDialogs();
  
  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that callee has not been found
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that callee is not able to connect
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    console.log("your call was rejected");
    // show dialog that call is rejected by the callee
    ui.showInfoDialog(preOfferAnswer);
    ui.hideCallContainerOnCloseConnection(connectedUserDetails.callType);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    ui.showCallElements(connectedUserDetails.callType);
    if( connectedUserDetails.callType == constants.callType.VIDEO_PERSONAL_CODE ){
      ui.updateLocalVideo(store.getState().localStream);
    } else if( connectedUserDetails.callType == constants.callType.VOICE_PERSONAL_CODE ) {
      ui.updateLocalAudio(store.getState().localVoiceStream);
    }
    createPeerConnection();
    // send webRTC offer
    console.log("connectedUserDetails",connectedUserDetails);
    sendWebRTCOffer();
  }
};

export const handleCallerHangUpCall = (data) => {
  console.log("handleCallerHangUpCall came");
  ui.hideCallContainerOnCloseConnection(connectedUserDetails.callType);
  connectedUserDetails = null;
  ui.removeAllDialogs();
};

const sendWebRTCOffer = async () => {
  const offer =  await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.WebRTCSignalling.OFFER,
    offer: offer
  });
}

export const handleWebRTCOffer = async (data) => {
  // console.log("webRTC offer came")
  // console.log(data);
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.WebRTCSignalling.ANSWER,
    answer: answer
  });
}

export const handleWebRTCAnswer = async (data) => {
  console.log("handling webRTC answer");
  await peerConnection.setRemoteDescription(data.answer);
}

export const handleWebRTCCandidate = async (data) => {
  console.log('handling incoming webRTC candidates');
  try{
    await peerConnection.addIceCandidate(data.candidate);
  } catch(err){
    console.error("Error Occured: when trying to add recieved ice candidate", err);
  }
}

export const handleCloseConOnHangupOtherSide = async (data) => {
  console.log("asked to close connection from other side via hangup");
  const { connectedUserSocketId, reason } = data;
  if ( connectedUserSocketId === store.getState().socketId ) {
    if(peerConnection){
      await peerConnection.close();
      peerConnection = null;
    }

    // activate mic and camera for future calls(resolves bug for if someone remains the video closed during closing call)
    if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
      store.getState().localStream.getVideoTracks()[0].enabled = true;
      store.getState().localStream.getAudioTracks()[0].enabled = true;
    } else if(connectedUserDetails.callType === constants.callType.VOICE_PERSONAL_CODE) {
      store.getState().localVoiceStream.getAudioTracks()[0].enabled = true;
    }

    ui.hideCallContainerOnCloseConnection(connectedUserDetails.callType);
    connectedUserDetails = null;
  }
}

let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
  console.log("screenSharingActive", screenSharingActive);
  if(screenSharingActive) {
    // console.log("true local come back");
    const localStream = store.getState().localStream;
    const senders = peerConnection.getSenders();

    const sender = senders.find((sender) => {
      return sender.track.kind === localStream.getVideoTracks()[0].kind;
    });

    if(sender) {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    }

    // stop screen sharing stream
    store.getState().screenSharingStream.getTracks().forEach(
      (track) => track.stop()
    );
    
    store.setScreenSharingActive(!screenSharingActive);
    
    ui.updateScreenSharingButton(store.getState().screenSharingActive);
    ui.updateLocalVideo(localStream);

  } else {
    console.log('switching for screen sharing');
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      store.setScreenSharingStream(screenSharingStream);

      // replace track which sender is sending
      const senders = peerConnection.getSenders();

      const sender = senders.find((sender) => {
        return (
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
        );
      });

      if(sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setScreenSharingActive(!screenSharingActive);

      ui.updateScreenSharingButton(store.getState().screenSharingActive);
      ui.updateLocalVideo(screenSharingStream);
    } catch(err) {
      console.error('error occured: trying to get screen sharing stream', err);
    }
  }
};

// close the connection on hangup
export const closePeerConnection = async () => {
  if(peerConnection){
    await peerConnection.close();
    peerConnection = null;
  }
  
  // activate mic and camera for future calls(resolves bug for if someone remains the video closed during closing call)
  if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
    store.getState().localStream.getVideoTracks()[0].enabled = true;
    store.getState().localStream.getAudioTracks()[0].enabled = true;
  } else if(connectedUserDetails.callType === constants.callType.VOICE_PERSONAL_CODE) {
    store.getState().localVoiceStream.getAudioTracks()[0].enabled = true;
  }

  wss.sendCloseConnectionOnHangUp({
    connectedUserSocketId: connectedUserDetails.socketId,
    reason: constants.CloseConnectionReason.HANGUP_BUTTON
  });
  ui.hideCallContainerOnCloseConnection(connectedUserDetails.callType);
  connectedUserDetails = null;
};
