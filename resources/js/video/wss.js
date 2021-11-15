import axios from "axios";
import * as store from "./store.js";
import * as ui from "./ui.js";
import * as constants from "./constants.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as webRTCGroupHandler from "./webRTCGroupHandler.js";
import * as chatWindow from "./chatWindow.js";

let socketIO = null;

export const registerSocketEvents = (socket) => {
  socketIO = socket;

  socket.on("connect", () => {
    console.log("succesfully connected to socket.io server");
    store.setSocketId(socket.id);
    
    if(store.getState().authId !== null && store.getState().conversationId !== null && store.getState().authUuId !== null){
      const data = {
        conversationId: store.getState().conversationId,
        authId: store.getState().authId,
        uuid: store.getState().authUuId,
        socketId: store.getState().socketId
      }
      sendUsrUidOnParticipantConnect(data);
    }

    // get conversation id
    // axios.get('/user/converse')
    //   .then(function (response) {
    //     store.setAuthId(response.data.auth);
    //     store.setConversationId(response.data.conversation_id);
    //     // // set live on connection db
    //     // axios.post('/participant/socket', {
    //     //   socket_id: store.getState().socketId,
    //     //   conversation_id: store.getState().conversationId
    //     //   })
    //     //   .then(function (response) {
    //     //     console.log(response);
    //     //   })
    //     //   .catch(function (error) {
    //     //     console.log(error);
    //     // });

    //   })
    //   .catch(function (error) {
    //     console.log(error);

    // });
    
  });

  socket.on("pre-offer", (data) => {
    console.log("pre-offer-came");
    console.log(data);
    webRTCHandler.handlePreOffer(data);
  });

  socket.on("pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on("webRTC-signaling", (data) => {
    switch (data.type) {
      case constants.WebRTCSignalling.OFFER:
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case constants.WebRTCSignalling.ANSWER:
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case constants.WebRTCSignalling.ICE_CANDIDATE:
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });

  socket.on("close-con-on-hangup", (data) => {
    webRTCHandler.handleCloseConOnHangupOtherSide(data);
  });

  socket.on("caller-hanged-up",  (data) => {
    webRTCHandler.handleCallerHangUpCall(data);
  });

  socket.on("recieve-msg", (data) => {
    console.log(data);
    chatWindow.receiveChatMessages(data);
  });
  // group mesh
  socket.on("room-id", (data) => {
    const { roomId } = data;
    store.setRoomId(roomId);
    console.log(store.getState());
  });

  socket.on("room-update", (data) => {
    console.log("room-update", data);
    webRTCGroupHandler.informMeetingSet(data);
  });

  socket.on("conn-prepare", (data) => {
    const { connUserSocketId } = data;

    webRTCGroupHandler.prepareNewPeerConnection(connUserSocketId, false);

    // inform the user which just join the room that we have prepared for incoming connection
    socket.emit("conn-init", { connUserSocketId: connUserSocketId });
  });

  socket.on("conn-signal", (data) => {
    webRTCGroupHandler.handleSignalingData(data);
  });

  socket.on("conn-init", (data) => {
    const { connUserSocketId } = data;
    webRTCGroupHandler.prepareNewPeerConnection(connUserSocketId, true);
  });

  socket.on("user-disconnected-room", (data) => {
    webRTCGroupHandler.removePeerConnection(data);
  });
};

const sendUsrUidOnParticipantConnect = (data) => {
  socketIO.emit('usr-uuid', data);
};

export const sendPreOffer = (data) => {
  console.log("emmiting to server pre offer event");
  socketIO.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
  socketIO.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
  socketIO.emit('webRTC-signaling', data);
}

export const sendCallerHangedUpCall = (data) => {
  socketIO.emit('caller-hanged-up', data);
}

export const sendCloseConnectionOnHangUp = (data) => {
  socketIO.emit('close-con-on-hangup', data);
}

export const sendTextMessage = (data) => {
  socketIO.emit('send-msg', data);
}

// group mesh
export const createNewRoom = (data) => {
  // emit an event to the server that we would like to create a new room for the conversation model
  socketIO.emit('create-new-room', data);
}

export const joinRoom = (data) => {
  // emit an event that we would like to join the room
  socketIO.emit('join-room', data);
}

export const signalPeerData = (data) => {
  socketIO.emit("conn-signal", data);
};

export const userDisconnectedRoom = (data) => {
  socketIO.emit("current-user-leaves-room", data);
}