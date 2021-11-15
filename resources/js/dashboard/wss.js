import * as store from "../video/store.js";
import * as ui from "./ui.js";

let socketIO = null;

export const registerSocketEvents = (socket, authIdData, usrLoggedUid) => {
  socketIO = socket;

  socket.on('connect', () => {
    console.log("succesfully connected to socket.io server");
    store.setSocketId(socket.id);

    const usrData = {
        uuid: usrLoggedUid,
        socketId: socket.id,
        authId: authIdData
    }
    sendUsrUidOnConnect(usrData);
  });

  socket.on("connectedUser", (data) => {
    console.log(data);
    ui.setOnlineBadges(data);
  });

  socket.on("disconnectedUser", (data) => {
    console.log(data);
    ui.setOfflineBadges(data);
  });
}

const sendUsrUidOnConnect = (data) => {
  socketIO.emit('usr-uuid', data);
};