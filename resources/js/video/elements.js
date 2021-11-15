import * as constants from "./constants.js";

export const getIncomingCallDialog = (
  callTypeInfo,
  acceptCallHandler,
  rejectCallHandler
) => {
  console.log("getting incoming call dialog");
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");
  dialog.appendChild(dialogContent);

  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = `Incoming ${callTypeInfo} Call`;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");
  const avatarImagePath = constants.publicUrl+"/assets/images/dialogAvatar.png";
  image.src = avatarImagePath;
  imageContainer.appendChild(image);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("dialog_button_container");

  const acceptCallButton = document.createElement("button");
  acceptCallButton.classList.add("dialog_accept_call_button");
  const acceptCallImg = document.createElement("img");
  acceptCallImg.classList.add("dialog_button_image");
  const acceptCallImgPath = constants.publicUrl+"/assets/images/acceptCall.png";
  acceptCallImg.src = acceptCallImgPath;
  acceptCallButton.append(acceptCallImg);
  buttonContainer.appendChild(acceptCallButton);

  const rejectCallButton = document.createElement("button");
  rejectCallButton.classList.add("dialog_reject_call_button");
  const rejectCallImg = document.createElement("img");
  rejectCallImg.classList.add("dialog_button_image");
  const rejectCallImgPath = constants.publicUrl+"/assets/images/rejectCall.png";
  rejectCallImg.src = rejectCallImgPath;
  rejectCallButton.append(rejectCallImg);
  buttonContainer.appendChild(rejectCallButton);

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(buttonContainer);

  acceptCallButton.addEventListener("click", () => {
    acceptCallHandler();
  });

  rejectCallButton.addEventListener("click", () => {
    rejectCallHandler();
  });

  return dialog;
};

export const getCallingDialog = (rejectCallHandler) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");
  dialog.appendChild(dialogContent);

  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = `Calling`;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");
  const avatarImagePath = constants.publicUrl+"/assets/images/dialogAvatar.png";
  image.src = avatarImagePath;
  imageContainer.appendChild(image);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("dialog_button_container");

  const hangUpCallButton = document.createElement("button");
  hangUpCallButton.classList.add("dialog_reject_call_button");
  const hangUpCallImg = document.createElement("img");
  hangUpCallImg.classList.add("dialog_button_image");
  const rejectCallImgPath = constants.publicUrl+"/assets/images/rejectCall.png";
  hangUpCallImg.src = rejectCallImgPath;
  hangUpCallButton.append(hangUpCallImg);
  buttonContainer.appendChild(hangUpCallButton);

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(buttonContainer);

  hangUpCallButton.addEventListener('click', () => {
    rejectCallHandler();
  });
  return dialog;
};

export const getInfoDialog = (dialogTitle, dialogDescription) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");
  dialog.appendChild(dialogContent);

  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = dialogTitle;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");
  const avatarImagePath = constants.publicUrl+"/assets/images/dialogAvatar.png";
  image.src = avatarImagePath;
  imageContainer.appendChild(image);

  const description = document.createElement("p");
  description.classList.add("dialog_description");
  description.innerHTML = dialogDescription;

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(description);

  return dialog;
};
// group
export const getMeetingInviteDialog = (
  hostName, 
  dialogDescription,
  acceptCallHandler,
  rejectCallHandler
  ) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");
  dialog.appendChild(dialogContent);

  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = `A Meeting has been set by ${hostName}`;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");
  const avatarImagePath = constants.publicUrl+"/assets/images/dialogAvatar.png";
  image.src = avatarImagePath;
  imageContainer.appendChild(image);

  const description = document.createElement("p");
  description.classList.add("dialog_description");
  description.innerHTML = dialogDescription;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("dialog_button_container");

  const acceptCallButton = document.createElement("button");
  acceptCallButton.classList.add("dialog_accept_call_button");
  const acceptCallImg = document.createElement("img");
  acceptCallImg.classList.add("dialog_button_image");
  const acceptCallImgPath = constants.publicUrl+"/assets/images/acceptCall.png";
  acceptCallImg.src = acceptCallImgPath;
  acceptCallButton.append(acceptCallImg);
  buttonContainer.appendChild(acceptCallButton);

  const rejectCallButton = document.createElement("button");
  rejectCallButton.classList.add("dialog_reject_call_button");
  const rejectCallImg = document.createElement("img");
  rejectCallImg.classList.add("dialog_button_image");
  const rejectCallImgPath = constants.publicUrl+"/assets/images/rejectCall.png";
  rejectCallImg.src = rejectCallImgPath;
  rejectCallButton.append(rejectCallImg);
  buttonContainer.appendChild(rejectCallButton);

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(description);
  dialogContent.appendChild(buttonContainer);

  acceptCallButton.addEventListener("click", () => {
    acceptCallHandler();
  });

  rejectCallButton.addEventListener("click", () => {
    rejectCallHandler();
  });

  return dialog;
}

export const getChatDisplayBlock = (chatDataMsg, loggedInUser) => {
  const current_timestamp = Math.round(new Date().getTime()/1000);
  const humanizedTime = moment.duration((chatDataMsg.time - current_timestamp).toString(), 'seconds').humanize(true);
  const message = document.createElement("div");
  message.classList.add("answer");
  const leftRight = chatDataMsg.user.id == loggedInUser ? "right" : "left";
  message.classList.add(leftRight);
  const msgName = document.createElement("div");
  msgName.classList.add('name');
  msgName.innerHTML = chatDataMsg.user.name;
  const msgText = document.createElement("div");
  msgText.classList.add('text');
  msgText.innerHTML = chatDataMsg.text;
  const msgTime = document.createElement("div");
  msgTime.classList.add('time');
  msgTime.classList.add('msg-time');
  msgTime.setAttribute("data-time", chatDataMsg.time.toString());
  msgTime.innerHTML = humanizedTime;

  message.appendChild(msgName);
  message.appendChild(msgText);
  message.appendChild(msgTime);

  return message;
}

export const getChatDisplayBlockWithFile = (chatDataMsgWithFile, loggedInUser) => {
  const current_timestamp = Math.round(new Date().getTime()/1000);
  const humanizedTime = moment.duration((chatDataMsgWithFile.time - current_timestamp).toString(), 'seconds').humanize(true);
  const message = document.createElement("div");
  message.classList.add("answer");
  const leftRight = chatDataMsgWithFile.user.id == loggedInUser ? "right" : "left";
  message.classList.add(leftRight);
  const msgName = document.createElement("div");
  msgName.classList.add('name');
  msgName.innerHTML = chatDataMsgWithFile.user.name;
  const msgText = document.createElement("div");
  msgText.classList.add('text');
  if("file_url" in chatDataMsgWithFile && "file_name" in chatDataMsgWithFile){
    const msgFile = document.createElement("div");
    msgFile.classList.add('file-txt');
    msgFile.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    </svg><a href="${chatDataMsgWithFile.file_url}" target="_blank" class="file-link">${chatDataMsgWithFile.file_name}</a>`
    msgText.appendChild(msgFile);
    if(chatDataMsgWithFile.text != ''){
      const textMsg = document.createElement('span');
      textMsg.innerHTML = chatDataMsgWithFile.text;
      msgText.appendChild(textMsg);
    }
  } else {
    msgText.innerHTML = chatDataMsgWithFile.text;
  }
  const msgTime = document.createElement("div");
  msgTime.classList.add('time');
  msgTime.classList.add('msg-time');
  msgTime.setAttribute("data-time", chatDataMsgWithFile.time.toString());
  msgTime.innerHTML = humanizedTime;

  message.appendChild(msgName);
  message.appendChild(msgText);
  message.appendChild(msgTime);

  return message;
}
const tickSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M5 12l5 5l10 -10" />
</svg>`;

export const getHtmlTextInputToChangeName = (text) => {
  // `<input class="change-group-name" id="changeGroupNameInput" value="`+initialText+`">
  // <button class="btn btn-primary btn-border-box btn-sm flex-right" id="submitChangedGroupName">Change</button>
  // `;
  const textInput = document.createElement('input');
  textInput.classList.add('change-group-name');
  textInput.setAttribute("id", "changeGroupNameInput");
  textInput.setAttribute("type", "text");
  textInput.setAttribute("value", text);

  const submitBtn = document.createElement('button');
  submitBtn.classList.add('btn', 'btn-primary', 'btn-border-box', 'btn-sm', 'flex-right');
  submitBtn.setAttribute("id", 'submitChangedGroupName');
  // const btnContent = document.innerHTML(tickSvg);
  submitBtn.innerHTML = tickSvg;
  return {
    input: textInput,
    btn: submitBtn 
  };
}