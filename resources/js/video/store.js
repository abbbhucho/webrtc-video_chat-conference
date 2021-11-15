
let state = {
  socketId: null,
  authId: null,
  authUuId: null,
  conversationId: null,
  localStream: null,
  localVoiceStream: null,
  remoteStream: null,
  screenSharingActive: false,
  screenSharingStream: null,
  // group store
  roomId: null,
  isRoomHost: false,
  roomParticipants: []
};

export const setSocketId = (socketId) => {
  state = {
    ...state,
    socketId,
  };
  console.log(state);
};

export const setAuthId = (authId) => {
  state = {
    ...state,
    authId,
  };
  console.log(state);
};

export const setAuthUuId = (authUuId) => {
  state = {
    ...state,
    authUuId,
  };
  console.log(state);
};

export const setConversationId = (conversationId) => {
  state = {
    ...state,
    conversationId,
  };
  console.log(state);
};

export const setLocalStream = (stream) => {
  state = {
    ...state,
    localStream: stream,
  };
};

export const setVoiceLocalStream = (stream) => {
  state = {
    ...state,
    localVoiceStream: stream,
  };
};

export const setScreenSharingActive = (screenSharingActive) => {
  state = {
    ...state,
    screenSharingActive,
  };
};

export const setScreenSharingStream = (stream) => {
  state = {
    ...state,
    screenSharingStream: stream,
  };
};

export const setRemoteStream = (stream) => {
  state = {
    ...state,
    remoteStream: stream,
  };
};
// group video calls
export const setRoomId = (roomId) => {
  state = {
    ...state,
    roomId
  }
}

export const setIsRoomHost = (isRoomHost) => {
  state = {
    ...state,
    isRoomHost
  }
}

export const setRoomParticipants = (roomParticipants) => {
  state = {
    ...state,
    roomParticipants
  }
}

export const getState = () => {
  return state;
};
