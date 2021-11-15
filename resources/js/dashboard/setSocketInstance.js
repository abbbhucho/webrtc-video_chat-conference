import * as wss from "./wss.js";
import axios from "axios";
require('../bootstrap.js'); 

// get data from dom elements
const dashboardContainer = document.getElementById('dashboard-container');
const authIdData = dashboardContainer.getAttribute('data-auth');
const usrLoggedUid = dashboardContainer.getAttribute('data-uuid');

// initialization of socketIO connection
const socket = io("http://localhost:5000", {
    // withCredentials: true,
    // extraHeaders: {
    //  "my-custom-header": "abcd"
    // }
});
wss.registerSocketEvents(socket, authIdData, usrLoggedUid);