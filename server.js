const { default: axios } = require("axios");
const express = require("express");
// const session = require('express-session');
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const { forEach, isArray } = require("lodash");

// require('dotenv').config();
const PORT = process.env.PORT || 5000;
// const oneDay = 1000 * 60 * 60 * 24;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:8000",
        methods: ["GET", "POST"],
        // allowedHeaders: ["Accept, "],
        // credentials: true
    }
});
// const sessionMiddleware = session({
//     secret: process.env.NODE_SESSION_SECRET,
//     resave: true,
//     saveUninitialized: true,
//     cookie: { maxAge: oneDay }
// });
// // use secure cookie here for production cookie.secure in https://www.npmjs.com/package/express-session
// // register middleware in Express
// app.use(sessionMiddleware);
// // register middleware in Socket.IO
// io.use((socket, next) => {
//   sessionMiddleware(socket.request, {}, next);
//   // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
//   // connections, as 'socket.request.res' will be undefined in that case
// });

let connectedPeers = [];
// let conversationMembers = {};
let rooms = [];
let connectedUsers = [];
// let sessionConnectedUserSocketids = {};

io.on("connection", (socket) => {
    connectedPeers.push(socket.id);
    // const session = socket.request.session;

    socket.on('usr-uuid', (data) => {
        
        if('conversationId' in data){
            // console.log('conv_usr-uuid', data);
            const { conversationId, authId, uuid, socketId } = data;
            let hasthatconvId = false;
            connectedUsers.forEach((connectedUser) => {
                if (uuid in connectedUser){
                    if(conversationId in connectedUser[uuid]){
                        let convSidArr = connectedUser[uuid][conversationId];
                        if(isArray(convSidArr)){
                            convSidArr.push(socketId);
                        }

                        connectedUser[uuid][conversationId] = convSidArr;
                        hasthatconvId = true;
                    }
                    if(!hasthatconvId) {
                        let convsocketIdArr = [];
                        convsocketIdArr.push(socketId);
                        connectedUser[uuid][conversationId] = convsocketIdArr;
                    }
                }
            })
        } else {
            // console.log('usr-uuid', data);
            const { uuid, socketId, authId } = data;
            let usrPresent = false;
            connectedUsers.forEach((connectedUser) => {
                if(uuid in connectedUser){
                    let logsinSidArr = connectedUser[uuid]['logsin'];
                    if(!connectedUser[uuid]['authId']){
                        connectedUser[uuid]['authId'] = authId;
                    }
                    if(isArray(logsinSidArr)) {
                        logsinSidArr.push(socketId);
                    }
                    usrPresent = true;
                }
            });
            if(!usrPresent){
                const dataUsr = {};
                let socketIdArr = [];
                socketIdArr.push(socketId)
                dataUsr[uuid] = {
                    logsin: socketIdArr,
                    authId: authId
                };
                connectedUsers.push(dataUsr);
            }
        }
        console.log('-----------------------------------\n');
        console.log(JSON.stringify(connectedUsers));
        console.log('\n-----------------------------------\n');
        let connectedUserAuths = [];
        connectedUsers.forEach( (connectedUser) => {
            Object.values(connectedUser).forEach((data) => {
                connectedUserAuths.push(data['authId']);
            });
        });
        io.to(connectedPeers).emit("connectedUser", {authIds: connectedUserAuths});
        // if(connectedUsers[0]){
        //     console.log(connectedUsers[0][data.uuid]['logsin']);
        // }
        
        // let connectedUserSocketids = [];
        // if(session.connectedUserSocketids) {
        //     console.log('check ---\n', session.connectedUserSocketids);
        //     connectedUserSocketids = session.connectedUserSocketids;
        // }
        // console.log('connectedUserSocketids 1', connectedUserSocketids);
        // connectedUserSocketids.push(data.socketId);
        // console.log('connectedUserSocketids 2', connectedUserSocketids);
        // session.connectedUserSocketids = connectedUserSocketids;
        // session.uuid = data.uuid;
        // session.save();
        // console.log("\n ---------------------------- \n session inside \n---------------\n", session );
    });

    socket.on("pre-offer", (data) => {
        console.log("pre-offer-came");
        console.log(data);
        // let calleePersonalCode;
        const { callType, authId, authUuid, conversationId } = data;
        let toSend = [];
        console.log(JSON.stringify(connectedUsers));

        Object.values(connectedUsers).forEach((connectedUser) => {
            Object.keys(connectedUser).forEach((key) => {
                if(key != authUuid){
                    if(conversationId in connectedUser[key]){
                        toSend = [...toSend, ...connectedUser[key][conversationId]];
                    }
                }
            })
        });
        if(toSend.length != 0){
            const data = {
                callerSocketId: socket.id,
                callType,
                connectorUserId: authId,
                conversationId
            };
            io.to(toSend).emit("pre-offer", data);
        } else {
            const data = {
                preOfferAnswer: "CALLEE_NOT_FOUND",
            };
            io.to(socket.id).emit("pre-offer-answer", data);
        }
        // axios.get(`http://localhost:8000/socket/back/${conversationId}`)
        // .then(function (response) {
        //     conversationMembers = response.data.details;
        //     console.log(conversationMembers);
        //     if(!(Object.keys(conversationMembers).length === 0 && conversationMembers.constructor === Object)){
        //         // console.log(Object.values(conversationMembers));
        //         // const connectedPeer = Object.keys(conversationMembers).find(
        //         //     (peerUserId) => console.log(peerUserId, peerUserId === authId)//peerUserId === authId
        //         // );
        //         const connectedPeer = Object.keys(conversationMembers).includes(authId.toString());
                               
        //         Object.keys(conversationMembers).forEach(userIdAsKey => {
        //             if(userIdAsKey != authId){
        //                 calleePersonalCode = conversationMembers[userIdAsKey];
        //             }
        //         });
        //         // console.log("connectedPeer", connectedPeer);
        //         if (connectedPeer) {
        //             const data = {
        //                 callerSocketId: socket.id,
        //                 callType,
        //                 connectorUserId: authId,
        //                 conversationId
        //             };
        //             io.to(calleePersonalCode).emit("pre-offer", data);
        //             // console.log("after emit line");
        //         } else {
        //             const data = {
        //                 preOfferAnswer: "CALLEE_NOT_FOUND",
        //             };
        //             io.to(socket.id).emit("pre-offer-answer", data);
        //         }
        //     }
        // })
        // .catch(function (error) {
        //     console.log(error);
        // });
        // console.log(connectedPeers);
        
    });

    socket.on("pre-offer-answer", (data) => {
        const { callerSocketId } = data;

        // console.log("pre-offer-answer came", data);

        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === callerSocketId
        );

        if (connectedPeer) {
            // console.log("connectedPeer inside , pre-offer-answer", callerSocketId);
            io.to(data.callerSocketId).emit("pre-offer-answer", data);
            // console.log("pre-offer-anwer sent to other side", callerSocketId);
        }
    });

    socket.on("webRTC-signaling", (data) => {
        // console.log("data", data);
        const { connectedUserSocketId } = data;
        // console.log("webRTC-signaling connectedUserSocketId", connectedUserSocketId);

        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );

        if(connectedPeer) {
            io.to(connectedUserSocketId).emit("webRTC-signaling", data);
        }
    });

    socket.on("caller-hanged-up", (data) => {
        console.log("caller-hanged-up", data);
        let calleePersonalCode;
        const { authId, conversationId, authUuid } = data;
        let toSend = [];
        console.log(JSON.stringify(connectedUsers));

        Object.values(connectedUsers).forEach((connectedUser) => {
            Object.keys(connectedUser).forEach((key) => {
                if(key != authUuid){
                    if(conversationId in connectedUser[key]){
                        toSend = [...toSend, ...connectedUser[key][conversationId]];
                    }
                }
            })
        });

        if(toSend.length != 0){
            io.to(toSend).emit("caller-hanged-up", data);
        } else {
            const data = {
                preOfferAnswer: "CALLEE_NOT_FOUND",
            };
            io.to(socket.id).emit("pre-offer-answer", data);
        }
        // axios.get(`http://localhost:8000/socket/back/${conversationId}`)
        // .then(function (response) {
        //     conversationMembers = response.data.details;
        //     if(!(Object.keys(conversationMembers).length === 0 && conversationMembers.constructor === Object)){
        //         const connectedPeer = Object.keys(conversationMembers).includes(authId.toString());
                               
        //         Object.keys(conversationMembers).forEach(userIdAsKey => {
        //             if(userIdAsKey != authId){
        //                 calleePersonalCode = conversationMembers[userIdAsKey];
        //             }
        //         });
        //         if (connectedPeer) {
        //             io.to(calleePersonalCode).emit("caller-hanged-up", data);
        //         } else {
        //             const data = {
        //                 preOfferAnswer: "CALLEE_NOT_FOUND",
        //             };
        //             io.to(socket.id).emit("pre-offer-answer", data);
        //         }
        //     }
        // })
        // .catch(function (error) {
        //     console.log(error);
        // });
    });

    socket.on("close-con-on-hangup", (data) => {
        // console.log("close-con-on-hangup", data);
        const { connectedUserSocketId } = data;
        
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );

        if(connectedPeer) {
            io.to(connectedUserSocketId).emit("close-con-on-hangup", data);
        }
    });

    socket.on("send-msg", (data) => {
        // calleePersonalCodes = [];
        // let is_group = false;
        console.log("send-msg", data);
        const { authId, conversationId, authUuid, time, text, type } = data;
        let toSend = [];
        console.log(JSON.stringify(connectedUsers));

        Object.values(connectedUsers).forEach((connectedUser) => {
            Object.keys(connectedUser).forEach((key) => {
                if(key != authUuid){
                    if(conversationId in connectedUser[key]){
                        toSend = [...toSend, ...connectedUser[key][conversationId]];
                    }
                }
            })
        });

        if(toSend.length != 0){
            data['callerSocketId'] = socket.id;
            data['user'] = {
                name: null,
                id: null
            };
            axios.get(`http://localhost:8000/that-user/${authId}`)
            .then( (response) => {
                data.user.name = response.data.user.name;
                data.user.id = response.data.user.id;
                io.to(toSend).emit("recieve-msg", data);
            })
            .catch((error) => console.log(error));
            
        } else {
            const data = {
                preOfferAnswer: "MESSAGEE_NOT_FOUND",
            };
            io.to(socket.id).emit("msg-error", data);
        }
        // axios.get(`http://localhost:8000/socket/back/${conversationId}`)
        // .then(function (response) {
        //     conversationMembers = response.data.details;
        //     if(!(Object.keys(conversationMembers).length === 0 && conversationMembers.constructor === Object)){
                
        //         const connectedPeer = Object.keys(conversationMembers).includes(authId.toString());
        //         if(Object.keys(conversationMembers).length > 2){
        //             Object.keys(conversationMembers).forEach(userIdAsKey => {
        //                 if(userIdAsKey != authId){
        //                     calleePersonalCodes.push(conversationMembers[userIdAsKey]);
        //                 }
        //             });
        //             is_group = true;
        //         } else {
        //             Object.keys(conversationMembers).forEach(userIdAsKey => {
        //                 if(userIdAsKey != authId){
        //                     calleePersonalCode = conversationMembers[userIdAsKey];
        //                 }
        //             });
        //         }               

        //         if (connectedPeer) {
        //             data['callerSocketId'] = socket.id;
        //             data['user'] = {
        //                 name: null,
        //                 id: null
        //             };
        //             axios.get(`http://localhost:8000/that-user/${authId}`)
        //             .then( (response) => {
        //                 // console.log(response.data.user.name, response.data);
        //                 data.user.name = response.data.user.name;
        //                 data.user.id = response.data.user.id;
        //                 console.log("inside send msg, connected peer, recieve msg", data);
        //                 if(is_group){
        //                     calleePersonalCodes.forEach((calleePersonalCode) => {
        //                         io.to(calleePersonalCode).emit("recieve-msg", data);
        //                     });
        //                 } else {
        //                     io.to(calleePersonalCode).emit("recieve-msg", data);
        //                 }
        //             })
        //             .catch((error) => console.log(error));
        //         } else {
        //             const data = {
        //                 preOfferAnswer: "MESSAGEE_NOT_FOUND",
        //             };
        //             io.to(socket.id).emit("msg-error", data);
        //         }
        //     }
        // })
        // .catch(function (error) {
        //     console.log(error);
        // });
        // console.log(connectedPeers);

    });
    // group mesh
    socket.on("create-new-room", (data) => {
        createNewRoomHandler(data, socket);
    })

    socket.on("join-room", (data) => {
        joinRoomHandler(data, socket);
    });

    socket.on("conn-signal", (data) => {
        signalingHandler(data, socket);
    });

    socket.on("conn-init", (data) => {
        initializeConnectionHandler(data, socket);
    });

    socket.on("current-user-leaves-room", (data) => {
        const { roomId } = data;
        console.log("current-user-leaves-room: ", data, socket.id);
        socket.leave(roomId);
        io.to(roomId).emit("user-disconnected-room", { socketId: socket.id });
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");

        const newConnectedPeers = connectedPeers.filter(
            (peerSocketId) => peerSocketId !== socket.id
        );

        connectedPeers = newConnectedPeers;

        connectedUsers.forEach( (connectedUser) => {
            Object.values(connectedUser).forEach((UserData) => {
                Object.keys(UserData).forEach((key, val) => {
                    if(key != 'authId') {
                        if( Array.isArray(UserData[key]) ){
                            if( UserData[key].includes(socket.id) ){
                                let i = UserData[key].indexOf(socket.id);
                                UserData[key].splice(i, 1);
                            }
                        }
                    }
                });
            });
        });
        let disconnectedUserAuth = null;
        connectedUsers.forEach( (connectedUser, index, object) => {
            let connectedUserDatas = Object.values(connectedUser);
            let currentAuthId = connectedUserDatas[0]['authId'];
            delete connectedUserDatas[0]['authId'];
            let socketIdsArray = Object.values(connectedUserDatas[0]);
            socketIdsArray = socketIdsArray.flat();
            if(socketIdsArray.length == 0){
                disconnectedUserAuth = currentAuthId;
                object.splice(index, 1);
            } else {
                connectedUserDatas[0]['authId'] = currentAuthId;
            }
        });
        if(disconnectedUserAuth) {
            // delete the user from rooms
            let disconnectedRoomUser = {};
            if ( rooms.length != 0 ) {
                rooms.forEach((room) => {
                    room.connectedRoomUsers = room.connectedRoomUsers.filter(
                        (user) => {
                            if(user.authId === disconnectedUserAuth) {
                                disconnectedRoomUser = user;
                            }
                            return user.authId !== disconnectedUserAuth
                        }
                    );
                });
                
                if(!(Object.keys(disconnectedRoomUser).length === 0) && disconnectedRoomUser.constructor === Object){
                    // leave socket io room
                    console.log("disconnectedRoomUser leaving room", disconnectedRoomUser.roomId, disconnectedRoomUser.authId);
                    socket.leave(disconnectedRoomUser.roomId);
                    const room = rooms.find((room) => room.id === disconnectedRoomUser.roomId);
    
                    // close the room if amount of the users which will stay in room will be 0
                    if(!(Object.keys(room).length === 0) && room.constructor === Object) {
                        if (room.connectedRoomUsers.length > 0) {
                            // emit to all users which are still in the room that user disconnected
                            io.to(room.id).emit("user-disconnected-room", { socketId: socket.id });
                    
                            // emit an event to rest of the users which left in the toom 
                            // new connectedRoomUsers in room
                            io.to(room.id).emit("room-update", {
                                connectedRoomUsers: room.connectedRoomUsers,
                            });
                        } else {
                            rooms = rooms.filter((r) => r.id !== room.id);
                        }
                    }
                }
            }

            axios.put(`http://localhost:8000/api/user-disconnected/`, {user_id: disconnectedUserAuth})
            .then(function (response) {
                console.log('message: user disconnected send', response.status);
            })
            .catch((err) => console.log(err));
            io.to(connectedPeers).emit("disconnectedUser", {authId: disconnectedUserAuth});
        }
        disconnectedUserAuth = null;
        console.log("disconnect", socket.id, connectedPeers);
    });

});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});

// socket io handlers
const createNewRoomHandler = (data, socket) => {
    console.log('host is creating new room: ', data);
    const { identity, conversationId, callType } = data;

    let roomGeneratorAuthId = null;
    Object.values(connectedUsers).forEach( (connectedUser) => {
        if(Object.keys(connectedUser).includes(identity)){
            roomGeneratorAuthId = connectedUser[identity]['authId'];
        }
    });
    if(!roomGeneratorAuthId){
        io.to(socket.id).emit("room-error", {error: 'no such user'});
    }
    const roomId = uuidv4();

    axios.post(`http://localhost:8000/api/create-room/`, {
        roomId,
        conversationId,
        callType,
        authId: roomGeneratorAuthId
    })
    .then(function (response) {
        console.log('message: room saved to db successfully', response.status);
    })
    .catch((err) => console.log(err));

    const newUser = {
        identity,
        socketId: socket.id,
        roomId,
        authId: roomGeneratorAuthId,
        isRoomHost: true,
        conversationId,
        callType
    };
    //create new room
    const newRoom = {
        id: roomId,
        connectedRoomUsers: [newUser],
    };
    // join socket.io room
    socket.join(roomId);

    rooms = [...rooms, newRoom];

    // emit to that client which created that room roomId
    io.to(socket.id).emit("room-id", { roomId });

    // emit an event to all users connected
    // to that room about new users which are right in this room
    let connectedPossibleRoomUsers = [];
    Object.values(connectedUsers).forEach((connectedUser) => {
        if(!Object.keys(connectedUser).includes(identity)){
            Object.values(connectedUser).forEach((details) => {
                if(Object.keys(details).includes(conversationId)){
                    connectedPossibleRoomUsers = [...connectedPossibleRoomUsers, ...details[conversationId]];
                }
            });
        }
    });
    if(connectedPossibleRoomUsers && connectedPossibleRoomUsers.length != 0 ){
        io.to(connectedPossibleRoomUsers).emit("room-update", { connectedRoomUsers: newRoom.connectedRoomUsers });
    }
    console.log("rooms arr in createNewRoomHandler", JSON.stringify(rooms));
}

const joinRoomHandler = (data, socket) => {
    console.log('user joining room', data);
    const { identity, conversationId, callType, roomId } = data;
    
    let inRoomAuthId = null;
    Object.values(connectedUsers).forEach( (connectedUser) => {
        if(Object.keys(connectedUser).includes(identity)){
            inRoomAuthId = connectedUser[identity]['authId'];
        }
    });
    if(!inRoomAuthId){
        io.to(socket.id).emit("room-error", {error: 'no such user'});
    }

    const newUser = {
        identity,
        socketId: socket.id,
        roomId,
        authId: inRoomAuthId,
        isRoomHost: false,
        conversationId,
        callType
    };

    // check room exists
    axios.put(`http://localhost:8000/api/check-room/`, {
        roomId,
        conversationId,
        callType,
        authId: inRoomAuthId
    })
    .then(function (response) {
        console.log("check-room", response.data.roomSet);
        //#TODO test set data if roomSet comes as true

        // join room as user which just is trying to join room passing room id
        const room = rooms.find((room) => room.id === roomId);
        room.connectedRoomUsers = [...room.connectedRoomUsers, newUser];

        // join socket.io room
        socket.join(roomId);

        // emit to all users which are already in this room to prepare peer connection
        room.connectedRoomUsers.forEach((user) => {
            if (user.socketId !== socket.id) {
                const data = {
                    connUserSocketId: socket.id,
                };

                io.to(user.socketId).emit("conn-prepare", data);
            }
        });

        io.to(roomId).emit("room-update", { connectedRoomUsers: room.connectedRoomUsers });
        console.log("rooms arr in joinRoomHandler", JSON.stringify(rooms));
    })
    .catch((err) => console.log(err));
}

const signalingHandler = (data, socket) => {
    const { connUserSocketId, signal } = data;

    const signalingData = { signal, connUserSocketId: socket.id };
    io.to(connUserSocketId).emit('conn-signal', signalingData);
}

// information from clients which are already in room that they have prepared for incoming connection.
const initializeConnectionHandler = (data, socket) => {
    const { connUserSocketId } = data;

    const initData = { connUserSocketId: socket.id };
    io.to(connUserSocketId).emit("conn-init", initData);
}