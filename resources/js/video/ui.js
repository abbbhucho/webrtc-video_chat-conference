import * as constants from "./constants.js";
import * as elements from "./elements.js";
import * as chatWindow from "./chatWindow.js";
import * as store from "./store.js";


export const updateLocalVideo = (stream) => {
  const localVideo = document.getElementById("local_video");
  localVideo.srcObject = stream;

  localVideo.addEventListener('loadedmetadata', () => {
    localVideo.play();
  });
}

export const updateRemoteVideo = (stream) => {
  const remoteVideo = document.getElementById('remote_video');
  remoteVideo.srcObject = stream;
}

export const updateLocalAudio =  (voiceStream) => {
  const localAudio = document.getElementById("local_audio");
  localAudio.srcObject = voiceStream;

  localAudio.addEventListener('loadedmetadata', () => {
    localAudio.play();
  });
}

export const updateRemoteAudio = (voiceStream) => {
  const remoteAudio = document.getElementById('remote_audio');
  remoteAudio.srcObject = voiceStream;
}

export const showIncomingCallDialog = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.VOICE_PERSONAL_CODE ? "Voice" : "Video";

  const incomingCallDialog = elements.getIncomingCallDialog(
    callTypeInfo,
    acceptCallHandler,
    rejectCallHandler
  );

  // removing all dialogs inside HTML dialog element
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

  dialog.appendChild(incomingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
  const callingDialog = elements.getCallingDialog(rejectCallHandler);

  // removing all dialogs inside HTML dialog element
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

  dialog.appendChild(callingDialog);
};

export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = elements.getInfoDialog(
      "Call rejected",
      "Callee rejected your call"
    );
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = elements.getInfoDialog(
      "Callee not found",
      "Please check connections"
    );
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    infoDialog = elements.getInfoDialog(
      "Call is not possible",
      "Probably callee is busy. Please try again later"
    );
  }

  if (infoDialog) {
    const dialog = document.getElementById("dialog");
    // console.log('has info dialog', infoDialog);
    dialog.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, [4000]);
  }
};

export const removeAllDialogs = () => {
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

export const showVideoContainer = () => {
  const call_container = document.getElementById("call_container");
  if (call_container.classList.contains("display_none")) {
      call_container.classList.remove("display_none");
  }
  console.log("trying to hide chat box");
  // hide chat box
  const chat_window = document.getElementsByClassName("chat-window");
  if (!chat_window[0].classList.contains("display_none")) {
      chat_window[0].classList.add("display_none");
  }

  const chat_form = document.getElementsByClassName("row reply");
  if (!chat_form[0].classList.contains("display_none")) {
      chat_form[0].classList.add("display_none");
  }
}

export const showVoiceContainer = () => {
  const voice_call_container = document.getElementById("voice_call_container");
  if (voice_call_container.classList.contains("display_none")) {
    voice_call_container.classList.remove("display_none");
  }
  console.log("trying to hide chat box for voice call");
  // hide chat box
  const chat_window = document.getElementsByClassName("chat-window");
  if (!chat_window[0].classList.contains("display_none")) {
      chat_window[0].classList.add("display_none");
  }

  const chat_form = document.getElementsByClassName("row reply");
  if (!chat_form[0].classList.contains("display_none")) {
      chat_form[0].classList.add("display_none");
  }
}

export const showCallElements = (callType) => {
  if (callType === constants.callType.VOICE_PERSONAL_CODE) {
    showVoiceCallElements();
  }

  if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
    showVideoCallElements();
  }

  if (callType === constants.callType.VOICE_GROUP_CODE) {
    showGroupVoiceCallElements();
  }

  if (callType === constants.callType.VIDEO_GROUP_CODE) {
    showGroupVideoCallElements();
  }
};

const showVoiceCallElements = () => {
  const voiceCallButtons = document.getElementById("voice_call_buttons");
  showElement(voiceCallButtons);

  const voicePlaceholder = document.getElementById("voice_placeholder");
  showElement(voicePlaceholder);

  // block panel
  disableDashboard();
};

const showVideoCallElements = () => {
  const callButtons = document.getElementById("call_buttons");
  showElement(callButtons);

  const fullScreenButtonContainer = document.getElementById('full_screen_button_container');
  showElement(fullScreenButtonContainer);

  const placeholder = document.getElementById("video_placeholder");
  hideElement(placeholder);

  const remoteVideo = document.getElementById("remote_video");
  showElement(remoteVideo);

  //block panel
  disableDashboard();
};

const showGroupVoiceCallElements = () => {
  // show call_container
  const voice_call_container = document.getElementById("voice_call_container");
  showElement(voice_call_container)
  // hide chat box
  const chat_window = document.getElementsByClassName("chat-window");
  hideElement(chat_window[0]);

  const chat_form = document.getElementsByClassName("row reply");
  hideElement(chat_form[0]);
  //block panel
  disableDashboard();
}

const showGroupVideoCallElements = () => {
  // show call_container
  const call_container = document.getElementById("call_container");
  showElement(call_container);
  // hide chat box
  const chat_window = document.getElementsByClassName("chat-window");
  hideElement(chat_window[0]);

  const chat_form = document.getElementsByClassName("row reply");
  hideElement(chat_form[0]);
  //block panel
  disableDashboard();
}

// ui call buttons

const micOnImgSrc = constants.publicUrl+"/assets/images/mic.png";
const micOffImgSrc = constants.publicUrl+"/assets/images/micOff.png";

export const updateMicButton = (micActive) => {
  const micButtonImage = document.getElementById('mic_button_image');
  micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
}

export const updateMicButtonForVoiceCall = (micActive) => {
  const micButtonImageForAudio = document.getElementById('mic_button_image_audio');
  micButtonImageForAudio.src = micActive ? micOffImgSrc : micOnImgSrc;
}

export const updateMicButtonForGrpVoiceCall = (micActive) => {
  const micButtonImageForAudio = document.getElementById('mic_button_image_grpaudio');
  micButtonImageForAudio.src = micActive ? micOffImgSrc : micOnImgSrc;
}

export const updateMicButtonForGrpVideoCall = (micActive) => {
  const micButtonImageForAudio = document.getElementById('mic_button_image_videogrp');
  micButtonImageForAudio.src = micActive ? micOffImgSrc : micOnImgSrc;
}

const cameraOnImgSrc = constants.publicUrl+"/assets/images/camera.png";
const cameraOffImgSrc = constants.publicUrl+"/assets/images/cameraOff.png";

export const updateCameraButton = (cameraActive) => {
  const cameraButtonImage = document.getElementById('camera_button_image');
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
}

export const updateCameraButtonForGrpVideoCall = (cameraActive) => {
  const cameraButtonImage = document.getElementById('camera_button_image_videogrp');
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
}

const screenShareSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-screen-share" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#dff9fb" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
      <line x1="7" y1="20" x2="17" y2="20" />
      <line x1="9" y1="16" x2="9" y2="20" />
      <line x1="15" y1="16" x2="15" y2="20" />
      <path d="M17 4h4v4" />
      <path d="M16 9l5 -5" />
  </svg>`;
const screenShareOffSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-screen-share-off" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#dff9fb" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
      <line x1="7" y1="20" x2="17" y2="20" />
      <line x1="9" y1="16" x2="9" y2="20" />
      <line x1="15" y1="16" x2="15" y2="20" />
      <path d="M17 8l4 -4m-4 0l4 4" />
  </svg>`;

export const updateScreenSharingButton = (screenSharingActive) => {
  const screenSharingButtonSvg = document.getElementById('screen_sharing_button_svg');
  screenSharingButtonSvg.innerHTML = screenSharingActive ? screenShareOffSvg : screenShareSvg;
}

// hide video call_container after close connection
export const hideCallContainerOnCloseConnection = (callType) => {
  if(callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.VIDEO_GROUP_CODE){
    // hide call_container
    const call_container = document.getElementById("call_container");
    if (!call_container.classList.contains("display_none")) {
        call_container.classList.add("display_none");
    }
    if(callType === constants.callType.VIDEO_PERSONAL_CODE) {
      updateMicButton(false);
      updateCameraButton(false);
    } else if(callType === constants.callType.VIDEO_GROUP_CODE) {
      updateMicButtonForGrpVideoCall(false);
      updateCameraButtonForGrpVideoCall(false);
    }
    
  } else if (callType === constants.callType.VOICE_PERSONAL_CODE || callType === constants.callType.VOICE_GROUP_CODE) {
    // hide audio call container
    const audio_call_container = document.getElementById("voice_call_container");
    if (!audio_call_container.classList.contains("display_none")) {
      audio_call_container.classList.add("display_none");
    }
    if(callType === constants.callType.VOICE_PERSONAL_CODE) {
      updateMicButtonForVoiceCall(false);
    } else if(callType === constants.callType.VOICE_GROUP_CODE) {
      updateMicButtonForGrpVoiceCall(false);
    }
  }
  // show chat box
  const chat_window = document.getElementsByClassName("chat-window");
  if (chat_window[0].classList.contains("display_none")) {
      chat_window[0].classList.remove("display_none");
  }

  const chat_form = document.getElementsByClassName("row reply");
  if (chat_form[0].classList.contains("display_none")) {
      chat_form[0].classList.remove("display_none");
  }

  enableDashboard();
}

// recording
export const showRecordingPanel = () => {
  const recordingButtons = document.getElementById('video_recording_buttons');
  showElement(recordingButtons);

  // hide start recording button if record is started or button is active
  const startRecordingButton = document.getElementById('start_recording_button');
  hideElement(startRecordingButton);
}

export const resetRecordingButtons = () => {
  const startRecordingButton = document.getElementById('start_recording_button');
  showElement(startRecordingButton);

  const recordingButtons = document.getElementById('video_recording_buttons');
  hideElement(recordingButtons);
}

// full screen
export const enableFullScreen = () => {
  // videos_container as full screen
  const videos_container_full = document.getElementById('videos_container');
  if(videos_container_full.requestFullscreen){
      videos_container_full.requestFullscreen();
  }
  else if(videos_container_full.mozRequestFullScreen){
      videos_container_full.mozRequestFullScreen();
  }
  else if(videos_container_full.webkitRequestFullscreen){
      videos_container_full.webkitRequestFullscreen();
  }
  else if(videos_container_full.msRequestFullscreen){
      videos_container_full.msRequestFullscreen();
  }
}

export const disableFullScreen = () => {
  if(document.exitFullscreen){
    document.exitFullscreen();
  }
  else if(document.mozCancelFullScreen){
      document.mozCancelFullScreen();
  }
  else if(document.webkitExitFullscreen){
      document.webkitExitFullscreen();
  }
  else if(document.msExitFullscreen){
      document.msExitFullscreen();
  }
} 

const fullScreenSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-maximize" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                      <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                      <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                      </svg>`;
const closeFullScreenSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-minimize" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M15 19v-2a2 2 0 0 1 2 -2h2" />
                            <path d="M15 5v2a2 2 0 0 0 2 2h2" />
                            <path d="M5 15h2a2 2 0 0 1 2 2v2" />
                            <path d="M5 9h2a2 2 0 0 0 2 -2v-2" />
                            </svg>`;

export const changeToggleFullScreenButton = (isFullScreen) => {
  const fullScreenButton = document.getElementById('full_screen_button');
  fullScreenButton.innerHTML = isFullScreen ? closeFullScreenSvg : fullScreenSvg;
}

let chatDataMsg = {
  user: {
    name: null,
    id: null
  },
  time: null,
  text: null
}

let chatDataMsgWithFile = {
  user: {
    name: null,
    id: null
  },
  time: null,
  text: null,
  file_url: null,
  file_name: null
}

// chat messages
export const showChatMessage = (data, loggedInUser) => {
  if ('file_id' in data){
    chatDataMsgWithFile = data;
    const messageBlock = elements.getChatDisplayBlockWithFile(chatDataMsgWithFile, loggedInUser);
    const chatWindowBox = document.getElementById('chat-box-scroll-down');
    const nochatclassdivId = document.getElementById('has-no-chat');
    if(chatWindowBox.contains(nochatclassdivId)){
      chatWindowBox.innerHTML = '';
    }
    chatWindowBox.appendChild(messageBlock);
    chatWindowBox.scroll({top: chatWindowBox.scrollHeight});
  } else {
    chatDataMsg = data; // JSON.parse(data);
    const messageBlock = elements.getChatDisplayBlock(chatDataMsg, loggedInUser);
    const chatWindowBox = document.getElementById('chat-box-scroll-down');
    const nochatclassdivId = document.getElementById('has-no-chat');
    if(chatWindowBox.contains(nochatclassdivId)){
      chatWindowBox.innerHTML = '';
    }
    chatWindowBox.appendChild(messageBlock);
    chatWindowBox.scroll({top: chatWindowBox.scrollHeight});
  }
}

// ui change group name
export const setTextInputToChangeName = (text) => {
  return elements.getHtmlTextInputToChangeName(text);
}

// spinner for localPreview

export const _addSpinner = (parent) => {
  const spinnerContainer = document.createElement('div');
  spinnerContainer.classList.add('us-container');

  const spinnerElement = document.createElement('div');
  spinnerElement.classList.add('us-spinner');

  spinnerContainer.appendChild(spinnerElement);

  parent.appendChild(spinnerContainer);

  return spinnerContainer;
};

export const _cleanupSpinner = (parent, element) => {
  parent.removeChild(element);
};

// group
export const changeVideoGroupBtn = () => {
  const groupCodeVideoButton = document.getElementById(
    "group_code_video_button"
  );

  if(groupCodeVideoButton){
    groupCodeVideoButton.classList.add("join-room", "pulsate-fwd", "manual_tool_tip");
    // data-toggle="tooltip" data-placement="bottom" title="" class="tool_tip"
    groupCodeVideoButton.setAttribute('title', 'Meeting in Progress, click to join');
  
    return groupCodeVideoButton;
  }
}

export const changeAudioGroupBtn = () => {
  const groupCodeVoiceButton = document.getElementById(
    "group_code_voice_button"
  );

  if(groupCodeVoiceButton){
    groupCodeVoiceButton.classList.add("join-room", "pulsate-fwd", "manual_tool_tip");
    // data-toggle="tooltip" data-placement="bottom" title="" class="tool_tip"
    groupCodeVoiceButton.setAttribute('title', 'Meeting in Progress, click to join');
  
    return groupCodeVoiceButton;
  }
}

export const setBackDefaultGroupCallBtn = (callType) => {
  let element = null;
  if(callType === constants.callType.VOICE_GROUP_CODE) {
    element = document.getElementById("group_code_voice_button");
  
  } else if (callType === constants.callType.VIDEO_GROUP_CODE) {
    element = document.getElementById("group_code_video_button");
  }
  if(element) {
    if (element.classList.contains("join-room","pulsate-fwd", "manual_tool_tip")) {
      element.classList.remove("join-room","pulsate-fwd", "manual_tool_tip");
      element.removeAttribute("title");
      element.removeAttribute("room-set");
    }
  }
}

////////////////////////////////// Group Videos //////////////////////////////////
export const showLocalVideoPreview = (stream, callType) => {
  // const videosContainer = document.getElementById("remote_video_group_container");
  // videosContainer.classList.add("videos_portal_styles");
  // const videoContainer = document.createElement("div");
  // videoContainer.classList.add("video_track_container");

  if(callType === constants.callType.VIDEO_GROUP_CODE) {
    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };

    chatWindow.add(videoElement);

  } else {
    const audioElement = document.createElement("audio");
    audioElement.autoplay = true;
    audioElement.muted = true;
    audioElement.srcObject = stream;

    audioElement.onloadedmetadata = () => {
      audioElement.play();
    };

    chatWindow.addAudioDiv(audioElement);

  }
  // videoContainer.appendChild(videoElement);
  // videosContainer.appendChild(videoContainer);
};

export const addStream = (stream, connUserSocketId) => {
  // display incoming stream
  const participants = store.getState().roomParticipants;
  const participant = participants.find((p) => p.socketId === connUserSocketId);
  console.log(participant);

  if (participant?.callType) {
    if(participant.callType === constants.callType.VIDEO_GROUP_CODE) {
      const videoElement = document.createElement("video");
      videoElement.autoplay = true;
      videoElement.srcObject = stream;
      videoElement.id = `${connUserSocketId}-video`;

      videoElement.onloadedmetadata = () => {
        videoElement.play();
      };

      chatWindow.add(videoElement, connUserSocketId);

    } else if(participant.callType === constants.callType.VOICE_GROUP_CODE) {
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElement.srcObject = stream;
      audioElement.id = `${connUserSocketId}-video`;

      audioElement.onloadedmetadata = () => {
        audioElement.play();
      };

      chatWindow.addAudioDiv(audioElement, connUserSocketId);
    }
  }

}

// ui helper functions

const enableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (!dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.add("display_none");
  }
};

const disableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.remove("display_none");
  }
};

const hideElement = (element) => {
  if (!element.classList.contains("display_none")) {
    element.classList.add("display_none");
  }
};

const showElement = (element) => {
  if (element.classList.contains("display_none")) {
    element.classList.remove("display_none");
  }
};
