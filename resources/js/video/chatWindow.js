import * as ui from "./ui.js";
import * as wss from "./wss.js";
import * as store from "./store.js";
import * as constants from "./constants.js";
// import axios from "axios";

export const setFileToMsg = {
    fileName: null,
    fileId: null,
    url: null
};

// chat messages
export const sendChatMessages = (data) => {
  wss.sendTextMessage(data);
}

export const receiveChatMessages = (data) => {
  const loggedInUser = store.getState().authId;
  ui.showChatMessage(data, loggedInUser);
}

export const changeGroupNameFromConversationList = (groupName) => {
  const conversationId = store.getState().conversationId; 
  const conversationLists = document.getElementById("conversation_lists");
  const individualConversationId = 'selected_converse_'+conversationId;
  const selectedChatChildNode = conversationLists.querySelector('#'+individualConversationId+' .sideBar-main .row .sideBar-name .name-meta');
  // console.log(selectedChatChildNode, selectedChatChildNode.innerText);
  selectedChatChildNode.innerText = groupName;
}

export const useSpinner = (fn, options = {}) => {

  let { container } = options;

  if (!container) {
    container = 'body';
  }

  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  return async (...args) => {

    // (1) add loading spinner to DOM
    const spinner = ui._addSpinner(container);

    // (2) execute registered function
    const result = await fn(...args);

    // (3) cleanup spinner
    ui._cleanupSpinner(container, spinner);

    // (4) return + finish
    return result;
  };
};

// Function to delete remote_video_in_group
export const less = () => {
    let Cameras = document.getElementsByClassName('remote_video_in_group');
    if (Cameras.length > 1) {
        let Camera = Cameras[Cameras.length - 1];
        Camera.parentNode.removeChild(Camera);
    }
    Dish();
}

// Function to add remote_video_in_group
export const add = (videoElement, socketId = null) =>  {
    let Scenary = document.getElementById('remote_video_group_container');
    let Camera = document.createElement('div');
    Camera.className = 'remote_video_in_group';
    if(socketId) {
      Camera.id = socketId;
    }
    Camera.appendChild(videoElement);
    Scenary.appendChild(Camera);
    Dish();
}

export const Area = (Increment, Count, Width, Height, Margin = 10) => {
    let i = 0; let w = 0;
    let h = Increment * 0.75 + (Margin * 2);
    while (i < (Count)) {
        if ((w + Increment) > Width) {
            w = 0;
            h = h + (Increment * 0.75) + (Margin * 2);
        }
        w = w + Increment + (Margin * 2);
        i++;
    }
    if (h > Height) return false;
    else return Increment;
}

export const Dish = (isAudio=false) => {

    // variables:
        let Margin = 2;
        let Scenary = document.getElementById('remote_video_group_container');
        if(isAudio) {
          Scenary = document.getElementById('remote_audio_group_container');  
        }
        let Width = Scenary.offsetWidth - (Margin * 2);
        let Height = Scenary.offsetHeight - (Margin * 2);
        let Cameras = document.getElementsByClassName('remote_video_in_group');
        if(isAudio) {
          Cameras = document.getElementsByClassName('remote_audio_in_group');
        }
        let max = 0;
    
    // loop (i recommend you optimize this)
        let i = 1;
        while (i < 5000) {
            let w = Area(i, Cameras.length, Width, Height, Margin);
            if (w === false) {
                max =  i - 1;
                break;
            }
            i++;
        }
    
    // set styles
        max = max - (Margin * 2);
        setWidth(max, Margin, isAudio);
}

// Set Width and Margin 
export const setWidth = (width, margin, isAudio=false) => {
  let Cameras = document.getElementsByClassName('remote_video_in_group');
  if(isAudio) {
    Cameras = document.getElementsByClassName('remote_audio_in_group');
  }
  for (var s = 0; s < Cameras.length; s++) {
      Cameras[s].style.width = width + "px";
      Cameras[s].style.margin = margin + "px";
      Cameras[s].style.height = (width * 0.75) + "px";
  }
}

// window.addEventListener("load",function(event) {
   
//     let Body = document.body;
//     let Add = document.createElement('div');
//     Add.className='more';
//     Add.addEventListener("click",function(event) {
//         add();
//     });

//     let Less = document.createElement('div');
//     Less.className='less';
//     Less.addEventListener("click",function(event) {
//         less();
//     });


//     Body.appendChild(Add);
//     Body.appendChild(Less);

// },false);

// audio group call templates

// Function to delete remote_audio_in_group
export const subAudioDiv = () => {
  let Cameras = document.getElementsByClassName('remote_audio_in_group');
  if (Cameras.length > 1) {
      let Camera = Cameras[Cameras.length - 1];
      Camera.parentNode.removeChild(Camera);
  }
  Dish(true);
}

// Function to add remote_audio_in_group
export const addAudioDiv = (audioElement, socketId = null) =>  {
  let Scenary = document.getElementById('remote_audio_group_container');
  let Camera = document.createElement('div');
  Camera.className = 'remote_audio_in_group';
  if(socketId) {
    Camera.id = socketId;
  }
  let bgdDiv = document.createElement('div');
  bgdDiv.classList.add('audio-user-profile');
  let bgdImg = document.createElement('img');
  const usrAudioImagePath = constants.publicUrl+"/assets/images/usr-audioimg.png";
  bgdImg.src = usrAudioImagePath;
  bgdImg.alt = "user";
  bgdDiv.appendChild(bgdImg);

  Camera.appendChild(bgdDiv);
  Camera.appendChild(audioElement);
  Scenary.appendChild(Camera);
  Dish(true);
}
