import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as webRTCGroupHandler from "./webRTCGroupHandler";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as recordingUtils from "./recordingUtils.js";
import * as chatWindow from "./chatWindow.js";
import { initial } from "lodash";
import axios from "axios";
require('../bootstrap.js');

// importing data from dom
const dashboardContainer = document.getElementById('dashboard-container');
const chatWindowBlock = document.getElementById('chat-window');

if(dashboardContainer.getAttribute('data-auth') && dashboardContainer.getAttribute('data-uuid')) {
    const authIdData = dashboardContainer.getAttribute('data-auth');
    const usrLoggedUid = dashboardContainer.getAttribute('data-uuid');
    store.setAuthId(authIdData);
    store.setAuthUuId(usrLoggedUid);
}
if(chatWindowBlock.getAttribute('data-conversation')) {
    const conversationIdData = chatWindowBlock.getAttribute('data-conversation');
    store.setConversationId(conversationIdData);
}

// initialization of socketIO connection
const socket = io("http://localhost:5000", {
    // withCredentials: true,
    // extraHeaders: {
    //  "my-custom-header": "abcd"
    // }
});
wss.registerSocketEvents(socket);

// show local video stream
// webRTCHandler.getLocalPreview();
// get local audio stream
// webRTCHandler.getVoiceLocalPreview();


// register event listeners for connection buttons

const personalCodeVoiceButton = document.getElementById(
    "personal_code_voice_button"
);

const personalCodeVideoButton = document.getElementById(
    "personal_code_video_button"
);

const groupCodeVoiceButton = document.getElementById(
    "group_code_voice_button"
);

const groupCodeVideoButton = document.getElementById(
    "group_code_video_button"
);

if(personalCodeVoiceButton){
    personalCodeVoiceButton.addEventListener("click", () => {
        console.log("voice button clicked");

        // show call_container
        const voice_call_container = document.getElementById("voice_call_container");
        if (voice_call_container.classList.contains("display_none")) {
            voice_call_container.classList.remove("display_none");
        }

        chatWindow.useSpinner(webRTCHandler.getVoiceLocalPreview(), voice_call_container);

        // hide chat box
        const chat_window = document.getElementsByClassName("chat-window");
        if (!chat_window[0].classList.contains("display_none")) {
            chat_window[0].classList.add("display_none");
        }
    
        const chat_form = document.getElementsByClassName("row reply");
        if (!chat_form[0].classList.contains("display_none")) {
            chat_form[0].classList.add("display_none");
        }
        
        const conversationId = store.getState().conversationId;
        const authId = store.getState().authId;
        const callType = constants.callType.VOICE_PERSONAL_CODE;
        const authUuid = store.getState().authUuId;
        if(authUuid == null) {
            throw new Error('Error: Unable to start voice call, please logout and try again'); 
        }
    
        webRTCHandler.sendPreOffer(callType, conversationId, authId, authUuid);
    });
}

if(personalCodeVideoButton) {
    personalCodeVideoButton.addEventListener("click", () => {
        console.log("video button clicked");
        // show call_container
        const call_container = document.getElementById("call_container");
        if (call_container.classList.contains("display_none")) {
            call_container.classList.remove("display_none");
        }

        chatWindow.useSpinner(webRTCHandler.getLocalPreview(), call_container);

        // hide chat box
        const chat_window = document.getElementsByClassName("chat-window");
        if (!chat_window[0].classList.contains("display_none")) {
            chat_window[0].classList.add("display_none");
        }
    
        const chat_form = document.getElementsByClassName("row reply");
        if (!chat_form[0].classList.contains("display_none")) {
            chat_form[0].classList.add("display_none");
        }
    
        const conversationId = store.getState().conversationId;
        const callType = constants.callType.VIDEO_PERSONAL_CODE;
        const authId = store.getState().authId;
        const authUuid = store.getState().authUuId;
        if(authUuid == null) {
            throw new Error('Error: Unable to start video call, please logout and try again'); 
        }
    
        webRTCHandler.sendPreOffer(callType, conversationId, authId, authUuid);
    });
}
if(groupCodeVoiceButton){
    groupCodeVoiceButton.addEventListener("click", () => {
        console.log("group voice button clicked");
    
        // // show call_container
        // const voice_call_container = document.getElementById("voice_call_container");
        // if (voice_call_container.classList.contains("display_none")) {
        //     voice_call_container.classList.remove("display_none");
        // }
        // // hide chat box
        // const chat_window = document.getElementsByClassName("chat-window");
        // if (!chat_window[0].classList.contains("display_none")) {
        //     chat_window[0].classList.add("display_none");
        // }
    
        // const chat_form = document.getElementsByClassName("row reply");
        // if (!chat_form[0].classList.contains("display_none")) {
        //     chat_form[0].classList.add("display_none");
        // }
        ui.showCallElements(constants.callType.VOICE_GROUP_CODE);
        // ui.updateLocalAudio(store.getState().localVoiceStream);

        // const conversationId = store.getState().conversationId;
        // const authId = store.getState().authId;
        // const callType = constants.callType.VOICE_GROUP_CODE;
        // webRTCHandler.setGrpVideo({
        //     conversationId, authId, callType
        // });
        let isRoomHost = false;
        if(groupCodeVoiceButton.getAttribute('room-set') != "true" && !store.getState().roomId ){
            isRoomHost = true;
        }
        store.setIsRoomHost(isRoomHost);
        if(groupCodeVoiceButton.getAttribute('room-set') == "true" || store.getState().roomId ){
            // #TODO show permission dialog test
            if(!store.getState().roomId && groupCodeVoiceButton.getAttribute('data-roomid')){
                store.setRoomId(groupCodeVoiceButton.getAttribute('data-roomid'));
            }
            chatWindow.useSpinner(webRTCGroupHandler.getLocalPreviewAndInitRoomConnection(isRoomHost, store.getState().authUuId, constants.callType.VOICE_GROUP_CODE, store.getState().roomId), voice_call_container);
        } else {
            chatWindow.useSpinner(webRTCGroupHandler.getLocalPreviewAndInitRoomConnection(isRoomHost, store.getState().authUuId, constants.callType.VOICE_GROUP_CODE ), voice_call_container);
        }
        // show the voice buttons container
        const group_voice_buttons = document.getElementById("group_voice_call_buttons");
        if (group_voice_buttons.classList.contains("display_none")) {
            group_voice_buttons.classList.remove("display_none");
        }
    });
}
if(groupCodeVideoButton){
    groupCodeVideoButton.addEventListener("click", () => {
        console.log("group video button clicked");
        // // show call_container
        // const call_container = document.getElementById("call_container");
        // if (call_container.classList.contains("display_none")) {
        //     call_container.classList.remove("display_none");
        // }
        // // hide chat box
        // const chat_window = document.getElementsByClassName("chat-window");
        // if (!chat_window[0].classList.contains("display_none")) {
        //     chat_window[0].classList.add("display_none");
        // }
    
        // const chat_form = document.getElementsByClassName("row reply");
        // if (!chat_form[0].classList.contains("display_none")) {
        //     chat_form[0].classList.add("display_none");
        // }
        ui.showCallElements(constants.callType.VIDEO_GROUP_CODE);
        // ui.updateLocalVideo(store.getState().localStream);
        // const conversationId = store.getState().conversationId;
        // const authId = store.getState().authId;
        // const callType = constants.callType.VIDEO_GROUP_CODE;
        // webRTCHandler.setGrpAudio({
        //     conversationId, authId, callType
        // });

        // group video call grid
        // ##############################################################################
        let isRoomHost = false;
        if(groupCodeVideoButton.getAttribute('room-set') != "true" && !store.getState().roomId ){
            isRoomHost = true;
        }
        store.setIsRoomHost(isRoomHost);
        if(groupCodeVideoButton.getAttribute('room-set') == "true" || store.getState().roomId ){
            // #TODO show permission dialog test
            if(!store.getState().roomId && groupCodeVideoButton.getAttribute('data-roomid')){
                store.setRoomId(groupCodeVideoButton.getAttribute('data-roomid'));
            }
            chatWindow.useSpinner(webRTCGroupHandler.getLocalPreviewAndInitRoomConnection(isRoomHost, store.getState().authUuId, constants.callType.VIDEO_GROUP_CODE, store.getState().roomId), call_container);
        } else {
            chatWindow.useSpinner(webRTCGroupHandler.getLocalPreviewAndInitRoomConnection(isRoomHost, store.getState().authUuId, constants.callType.VIDEO_GROUP_CODE ), call_container);
        }
        // show the video buttons
        const group_video_buttons = document.getElementById('group_video_call_buttons');
        if(group_video_buttons.classList.contains('display_none')) {
            group_video_buttons.classList.remove("display_none");
        }
    });
}

// event listener for all the personal audio call buttons

const voice_mic_button = document.getElementById('voice_call_mic_button');
if(voice_mic_button) {
    voice_mic_button.addEventListener("click", () => {
        const localAudioStream = store.getState().localVoiceStream;
        const micEnabled = localAudioStream.getAudioTracks()[0].enabled;
        localAudioStream.getAudioTracks()[0].enabled = !micEnabled;
        ui.updateMicButtonForVoiceCall(micEnabled); 
    });
}

// hangup button for audio
const hangUpVoiceCallButton = document.getElementById('voice_call_hang_up_button');
if(hangUpVoiceCallButton){
    hangUpVoiceCallButton.addEventListener('click', () => {
        webRTCHandler.closePeerConnection();
    });
}

// event listener for all the group audio call buttons

const grp_voice_mic_button = document.getElementById('group_voice_call_mic_button');
if(grp_voice_mic_button){
    grp_voice_mic_button.addEventListener("click", () => {
        webRTCGroupHandler.muteAudioInVoiceCall();
    });
}

// hangup button for audio group call
const grpHangUpVoiceCallButton = document.getElementById('group_voice_call_hang_up_button');
if(grpHangUpVoiceCallButton){
    grpHangUpVoiceCallButton.addEventListener('click', () => {
        webRTCGroupHandler.hangUpVoiceCall();
        ui.setBackDefaultGroupCallBtn(constants.callType.VOICE_GROUP_CODE);
    });
}

// event listener for all the personal video call buttons

const mic_button = document.getElementById('mic_button');
if(mic_button) {
    mic_button.addEventListener("click", () => {
        const localStream = store.getState().localStream;
        const micEnabled = localStream.getAudioTracks()[0].enabled;
        localStream.getAudioTracks()[0].enabled = !micEnabled;
        ui.updateMicButton(micEnabled); 
    });
}

const camera_button = document.getElementById('camera_button');
if(camera_button) {
    camera_button.addEventListener("click", () => {
        const localStream = store.getState().localStream;
        const cameraEnabled = localStream.getVideoTracks()[0].enabled;
        localStream.getVideoTracks()[0].enabled = !cameraEnabled;
        ui.updateCameraButton(cameraEnabled);
    });
}

const switchForScreenSharingButton = document.getElementById('screen_sharing_button');
if(switchForScreenSharingButton) {
    switchForScreenSharingButton.addEventListener("click", () => {
        const screenSharingActive = store.getState().screenSharingActive;
        webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
    });
}

// hangup button
const hangUpButton = document.getElementById('hang_up_button');
if(hangUpButton) {
    hangUpButton.addEventListener('click', () => {
        webRTCHandler.closePeerConnection();
    });
}

// recording
const startRecordingButton = document.getElementById('start_recording_button');
if(startRecordingButton){
    startRecordingButton.addEventListener('click', () => {
        recordingUtils.startRecording();
        ui.showRecordingPanel();
    });
}

const stopRecordingButton = document.getElementById('stop_recording_button');
if(stopRecordingButton){
    stopRecordingButton.addEventListener('click', () => {
        recordingUtils.stopRecording();
        ui.resetRecordingButtons();
    });
}
// full screen
const fullScreenButton = document.getElementById('full_screen_button');
if(fullScreenButton) {
    fullScreenButton.addEventListener('click', () => {
        if( document.fullscreenEnabled ){
            if(!document.fullscreenElement){
                ui.enableFullScreen();
            } else {
                ui.disableFullScreen();
            }
        } else {
            console.error('Fullscreen error: browser couldnot support fullscreen right now');
        }
    });
}

document.addEventListener('fullscreenchange', (event) => {
    if (document.fullscreenElement) {
        ui.changeToggleFullScreenButton(true);
    } else {
        ui.changeToggleFullScreenButton(false);
    }
});

// event listener for all the group video call buttons

const mic_video_group_btn = document.getElementById('group_video_call_mic_button');
if (mic_video_group_btn) {
    mic_video_group_btn.addEventListener('click', () => {
        webRTCGroupHandler.muteAudioInVideoCall();
    });
}

const camera_video_group_btn = document.getElementById('group_video_call_camera_button');
if (camera_video_group_btn) {
    camera_video_group_btn.addEventListener('click', () => {
        webRTCGroupHandler.muteVideoInVideoCall();
    });
}
// hangup button for video group call
const video_group_hangup_btn = document.getElementById('group_video_call_hang_up_button');
if (video_group_hangup_btn) {
    video_group_hangup_btn.addEventListener('click', () => {
        webRTCGroupHandler.hangUpVideoCall();
        ui.setBackDefaultGroupCallBtn(constants.callType.VIDEO_GROUP_CODE);
    });
}
///////////////////////////////////////////////////////////////////////////////////////////
const changeGroupName = document.getElementById('editable');
if(changeGroupName){
    changeGroupName.addEventListener('click', (e) => {
        if(!document.getElementById("changeGroupNameInput") || document.getElementById("changeGroupNameInput").length == 0) {
            const initialText = e.target.childNodes[0].data;
            const uicomponents = ui.setTextInputToChangeName(initialText);
            changeGroupName.innerHTML = '';
            changeGroupName.appendChild(uicomponents.input);
            changeGroupName.appendChild(uicomponents.btn);
            const submitChangedGroupName = document.getElementById('submitChangedGroupName');
            submitChangedGroupName.addEventListener('click', () => {
                console.log("inside submitChangedGroupName");
                const changeGroupNameInput = document.getElementById('changeGroupNameInput');
                    const data = {groupname: changeGroupNameInput.value};
                if(document.getElementById("changeGroupNameInput") && document.getElementById("changeGroupNameInput").length != 0) {
                    axios.put(constants.publicUrl + '/group/name/'+store.getState().conversationId, data).
                    then(() => {
                        const groupNameSpan = document.getElementById('editable');
                        groupNameSpan.innerHTML = data.groupname;
                    }).
                    catch((err) => {
                        console.log(err);
                    })
                }
            });
        }
    });
}

var emojiComponents = document.querySelectorAll('.emoji-component');
Array.from(emojiComponents).forEach(emojiComponent => {
    emojiComponent.addEventListener('click', function(e) {
        var emoji = e.target.innerText;
        $('#chat_text').val($('#chat_text').val() + emoji);
        $('#btn-save-chat').addClass('has-chat');
  });
});

// #######################################################################
/***
 * Jquery part
 */
// #######################################################################

$('.manual_tool_tip')
  .attr('data-toggle', 'tooltip')
  .attr('data-placement', 'bottom')
  .tooltip({
    trigger: 'manual'
  })
.tooltip('show');

$('#changeGroupNameModalContent').click(function(e) {
    var changeGroupName = $('#editable');
    if (!changeGroupName.is(e.target) && changeGroupName.has(e.target).length === 0) {
        var changeGroupName_input = $("#changeGroupNameInput").val();
        changeGroupName.html(changeGroupName_input);
    }
});

$('#add_new_group_members_accordian').on('shown.bs.collapse', function () {
    const conv_id = store.getState().conversationId;
    $.ajax({
        url: constants.publicUrl + '/conversation/non-members/'+ conv_id.toString(),
        type: "GET",
        beforeSend: function() {
            var loader = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: #dcdde1; display: block; shape-rendering: auto; top: 70px;" width="70px" height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <circle cx="50" cy="50" fill="none" stroke="#5699d2" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
                    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"/>
                    </circle></svg>`;
            $("#add_new_group_members_accordian").html(loader);
        },
        success: function(response) {
            console.log(response);
            var obj = response.data;
                allUsersForSearch = obj;
                if (response.status == 'success') {
                    var accordian_html = `<div class="card card-body">
                        <div class="input-group">
                            <select class="custom-select" id="add_new_group_members_dropdown">
                                <option selected>Choose...</option>`;
                    $.each(obj, function(key, val) {
                        accordian_html += `<option value="`+val.id+`">`+val.name+` ( `+val.email+` ) </option>`
                    });
                    accordian_html += `</select>
                            <div class="input-group-append">
                                <button class="btn btn-outline-primary" type="button" id="saveAddMemberGroup">
                                    <span class="arc float-right"></span>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-plus" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                                        <path d="M16 11h6m-3 -3v6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="alert-new-mbr-err" class="alert alert-danger" role="alert" style="display:none;">
                        <button type="button" class="close" data-dismiss="alert">x</button>
                    </div>`;
                    $("#add_new_group_members_accordian").html(accordian_html);
                }
        },
        error: function(data, status) {
            console.log(data, data.error);
        }
    });
});

$('#add_new_group_members_accordian').on('click', '#saveAddMemberGroup', function (e) {
    e.preventDefault();
    console.log('saveAddMemberGroup');
    var id = null;
    var conv_id = store.getState().conversationId;
    if($('#add_new_group_members_dropdown').children(":selected").val() != 'Choose...'){
        id = $('#add_new_group_members_dropdown').children(":selected").val();
    } else {
        console.log('choose a user first');
        return false;
    }
    if(id){
        console.log('id: ',id);
        $.ajax({
            url: constants.publicUrl + '/conversation/add-member',
            type: 'PUT',
            data: { conv_id: conv_id, req_usr: id, is_group: true},
            beforeSend: function() {
                if (!$('.arc').hasClass("loader-show")) {
                    $('.arc').addClass('loader-show');
                }
            },
            success: function(response) {
                var obj = response.data;
                var new_participant_html = '';
                console.log(response);
                if ($('.arc').hasClass("loader-show")) {
                    $('.arc').removeClass('loader-show');
                }
                new_participant_html = `<div class="table-content-flex">
                        <div class="avatar-icon">
                            <img src=" `+constants.publicUrl+`/assets/profiles/fs1.jpg">
                        </div>
                        <div style="padding: 0 4px; align-items: center">
                            <strong>`+obj.name+`</strong>
                        </div>
                    </div>
                    <hr style="border-top: 1px solid #b2bec3; width:85%; padding:0 25px 0 25px;">`;
                $('#ppt-grp-membr').append(new_participant_html);
            },
            error: function(err) {
                if(err.status == 422){
                    if(err.responseJSON.message == 'user_already_in_group'){
                        $("#alert-new-mbr-err").append("<strong>Already Existing Member</strong> cannot add already existing member to group.");
                        $("#alert-new-mbr-err").show();
                        $("#alert-new-mbr-err").delay(8000).slideUp(200, function() {
                            $(this).alert('close');
                        });
                        if ($('.arc').hasClass("loader-show")) {
                            $('.arc').removeClass('loader-show');
                        }
                    }
                }
                console.log(err);
            }
    
        })
    }
});

$('#about-conversation-modal').on('hidden.bs.modal', function (e) {
    const changeGroupName = document.getElementById('editable');
    if(!changeGroupName){
        return false;
    }
    let groupName = changeGroupName.innerText;
    chatWindow.changeGroupNameFromConversationList(groupName);
    // change heading
    const headingNameSpan = document.querySelector('.chat-heading .heading-name .heading-name-meta');
    console.log(headingNameSpan);
    headingNameSpan.setAttribute('title', groupName);
    headingNameSpan.innerText = groupName;
});

// chat part

// save file
$("#chatfile-submit").submit(function(e) {
    const conversationId = store.getState().conversationId;
    e.preventDefault();
    if(!$('input[type=file]')[0].files.length){
        console.log('no file submitted');
        return false;
    }
    $('#chat-window-submit-file').prop("disabled", true);
    let form = new FormData();
    let files = $('input[type=file]')[0].files[0];
    // console.log(files);
    if(!constants.allowedFileType.includes(files.name.split('.').pop())){
        $("#alert-invalid-file").append("<strong>Invalid File Type</strong> You can only add the given file types mentioned above.");
        $("#alert-invalid-file").show();
        $("#alert-invalid-file").delay(8000).slideUp(200, function() {
            $(this).alert('close');
            $('#chat-window-submit-file').prop("disabled", false);
        });
        return false;
    }
    form.append('file',files);
    const saveFileUrl = '/save-file/'+ conversationId ;
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        url: constants.publicUrl + saveFileUrl,
        type: "POST",
        data: form,
        contentType: false,
        processData: false,
        beforeSend: function() {
            if (!$('.arc').hasClass("loader-show")) {
                $('.arc').addClass('loader-show');
            }
        },
        success: function(response) {
            console.log(response);
            if ($('.arc').hasClass("loader-show")) {
                $('.arc').removeClass('loader-show');
            }
            $('#chat-window-submit-file').prop("disabled", false);
            var data = getFileHtml(files.name, response.data.url);
            chatWindow.setFileToMsg.fileName = files.name;
            chatWindow.setFileToMsg.fileId = response.data.file_id;
            chatWindow.setFileToMsg.url = response.data.url;
            $('.display-file').html(data);
        },
        error: function(data, status) {
            if(data.status == 422){
                $("#alert-invalid-file").append("<strong>Error!</strong> "+data.responseJSON.data.file);
            }else{
                $("#alert-invalid-file").append("<strong>Error!</strong> Something went wrong. Try again later");
            }
            $("#alert-invalid-file").show();
            $("#alert-invalid-file").delay(6000).slideUp(200, function() {
                $(this).alert('close');
                $('#chat-window-submit-file').prop("disabled", false);
                if ($('.arc').hasClass("loader-show")) {
                    $('.arc').removeClass('loader-show');
                    $('#chat-window-submit-file').prop("disabled", false);
                }
            });
            
        }
    });    
});
// include file to chat
$('#set-fileto-chat').click(() => {
    if( chatWindow.setFileToMsg.fileName != null ){
        // has file along
        $('#upload-chat-file').modal('hide');

        $('.msg-file').html(getChatFileDisplayHtml(chatWindow.setFileToMsg.fileName));
        $('.msg-file').removeClass('display_none');
        $("input[name='chat_text']").val('File:');
    } else {
        $('#alert-no-file-save').removeClass('display_none');
        $("#alert-no-file-save").delay(3000).slideUp(200, function() {
                $(this).alert('close');
            });
    }
});

$('#upload-chat-file').on('hidden.bs.modal', function (e) {
    // console.log('hidden bs modal upload chat file');
    $('#chatfile-submit > input[type=file]').val(null);
    const displayFileContainer = document.querySelector('.display-file');
    if(displayFileContainer.innerHTML) {
        displayFileContainer.innerHTML = "";
    }
    $('#chat-window-submit-file').prop("disabled", false);
});

$('#chat_text').keyup(function(e) {
    e.preventDefault();
    if ($(this).val() == ''){
        if($('#btn-save-chat').hasClass("has-chat")){
        $('#btn-save-chat').removeClass('has-chat');
        }
    }else{
        $('#btn-save-chat').addClass('has-chat');
    }
});

// save chat
var request;
$('#chat-form').submit(function(event){
    event.preventDefault();
    
    // Abort any pending request
    if (request) {
        request.abort();
    }
    var $form = $(this);
    var data = {};

    var $inputs = $form.find("input, select, button, textarea");

    $form.find( '[name]' ).each( function( i , v ){
        var input = $( this ),
            name = input.attr( 'name' ),
            value = input.val();
        data[name] = value;
    });
    if(data.chat_text == null || data.chat_text == ''){
        //  no chat text
        return false;
    }
    if(!chatWindow.setFileToMsg.fileName) {
        data.message_type = 'text';
    } else {
        data.message_type = 'file';
    }
    
    $inputs.prop("disabled", true);

    var currentTimestamp = Math.round(new Date().getTime()/1000);
    
    if(data.message_type != 'file' && !chatWindow.setFileToMsg.fileId){
        chatWindow.sendChatMessages({
            authId: store.getState().authId,
            conversationId: store.getState().conversationId,
            authUuId: store.getState().authUuId,
            time: currentTimestamp,
            text: data.chat_text,
            type: data.message_type
        });
    } else {
        chatWindow.sendChatMessages({
            authId: store.getState().authId,
            conversationId: store.getState().conversationId,
            authUuId: store.getState().authUuId,
            time: currentTimestamp,
            text: data.chat_text,
            type: data.message_type,
            file_id: chatWindow.setFileToMsg.fileId,
            file_url: chatWindow.setFileToMsg.url,
            file_name: chatWindow.setFileToMsg.fileName
        });
        data.file_name = chatWindow.setFileToMsg.fileName;
        data.file_url = chatWindow.setFileToMsg.url;
    }
    request = $.ajax({
        url: constants.publicUrl +'/save-chat',
        type: "post",
        data: data
    });

    request.done(function (response, textStatus, jqXHR){
        $('#chat-box-scroll-down').html('');
        $('#chat-box-scroll-down').html(response);
        $("input[name='chat_text']").val('');
        $('#chat-box-scroll-down').scrollTop($('#chat-box-scroll-down')[0].scrollHeight);
        $('.msg-file').addClass('display_none');
        $('.display-file').html('');
        $('input[type=file]').val('');
    });

    request.fail(function (jqXHR, textStatus, errorThrown){
        console.error(
            "The following error occurred: "+
            textStatus, errorThrown
        );
    });

    request.always(function () {
        // Re-enable the inputs
        $inputs.prop("disabled", false);
        if ($('#chat_text').val() == ''){
            if($('#btn-save-chat').hasClass("has-chat")){
                $('#btn-save-chat').removeClass("has-chat");
            }
        }
    });
});

// helper functions
function getFileHtml(filename, url) {
    var file_html = "";
    if (['jpg', 'jpeg', 'png', 'gif'].includes(filename.split('.').pop())) {
        file_html = "<img src='" + url + "' class='display-uploaded-image'>";
    } else if (filename.split('.').pop() == 'pdf') {
        file_html = `<div class="format-file">
                        <span><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="32" height="32" viewBox="0 0 16 16">
                        <path fill="#000000" d="M13.156 9.211c-0.213-0.21-0.686-0.321-1.406-0.331-0.487-0.005-1.073 0.038-1.69 0.124-0.276-0.159-0.561-0.333-0.784-0.542-0.601-0.561-1.103-1.34-1.415-2.197 0.020-0.080 0.038-0.15 0.054-0.222 0 0 0.339-1.923 0.249-2.573-0.012-0.089-0.020-0.115-0.044-0.184l-0.029-0.076c-0.092-0.212-0.273-0.437-0.556-0.425l-0.171-0.005c-0.316 0-0.573 0.161-0.64 0.403-0.205 0.757 0.007 1.889 0.39 3.355l-0.098 0.239c-0.275 0.67-0.619 1.345-0.923 1.94l-0.040 0.077c-0.32 0.626-0.61 1.157-0.873 1.607l-0.271 0.144c-0.020 0.010-0.485 0.257-0.594 0.323-0.926 0.553-1.539 1.18-1.641 1.678-0.032 0.159-0.008 0.362 0.156 0.456l0.263 0.132c0.114 0.057 0.234 0.086 0.357 0.086 0.659 0 1.425-0.821 2.48-2.662 1.218-0.396 2.604-0.726 3.819-0.908 0.926 0.521 2.065 0.883 2.783 0.883 0.128 0 0.238-0.012 0.327-0.036 0.138-0.037 0.254-0.115 0.325-0.222 0.139-0.21 0.168-0.499 0.13-0.795-0.011-0.088-0.081-0.196-0.157-0.271zM3.307 12.72c0.12-0.329 0.596-0.979 1.3-1.556 0.044-0.036 0.153-0.138 0.253-0.233-0.736 1.174-1.229 1.642-1.553 1.788zM7.476 3.12c0.212 0 0.333 0.534 0.343 1.035s-0.107 0.853-0.252 1.113c-0.12-0.385-0.179-0.992-0.179-1.389 0 0-0.009-0.759 0.088-0.759v0zM6.232 9.961c0.148-0.264 0.301-0.543 0.458-0.839 0.383-0.724 0.624-1.29 0.804-1.755 0.358 0.651 0.804 1.205 1.328 1.649 0.065 0.055 0.135 0.111 0.207 0.166-1.066 0.211-1.987 0.467-2.798 0.779v0zM12.952 9.901c-0.065 0.041-0.251 0.064-0.37 0.064-0.386 0-0.864-0.176-1.533-0.464 0.257-0.019 0.493-0.029 0.705-0.029 0.387 0 0.502-0.002 0.88 0.095s0.383 0.293 0.318 0.333v0z"/>
                        <path fill="#000000" d="M14.341 3.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-7.75c-0.689 0-1.25 0.561-1.25 1.25v13.5c0 0.689 0.561 1.25 1.25 1.25h11.5c0.689 0 1.25-0.561 1.25-1.25v-9.75c0-0.224-0.068-0.615-0.659-1.421v0zM12.271 2.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-11.5c-0.135 0-0.25-0.114-0.25-0.25v-13.5c0-0.135 0.115-0.25 0.25-0.25 0 0 7.749-0 7.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v9.75z"/>
                        </svg></span>
                        <a target="_blank" href="` + url + `">` + filename + `</a>
                    </div>`;
    } else if (filename.split('.').pop() == 'doc' || filename.split('.').pop() == 'docx') {
        file_html = `<div class="format-file">
                        <span><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="32" height="32" viewBox="0 0 16 16">
                            <path fill="#000000" d="M9.997 7.436h0.691l-0.797 3.534-1.036-4.969h-1.665l-1.205 4.969-0.903-4.969h-1.741l1.767 7.998h1.701l1.192-4.73 1.066 4.73h1.568l2.025-7.998h-2.663v1.435z"/>
                            <path fill="#000000" d="M14.341 3.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-7.75c-0.689 0-1.25 0.561-1.25 1.25v13.5c0 0.689 0.561 1.25 1.25 1.25h11.5c0.689 0 1.25-0.561 1.25-1.25v-9.75c0-0.224-0.068-0.615-0.659-1.421v0zM12.271 2.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-11.5c-0.135 0-0.25-0.114-0.25-0.25v-13.5c0-0.135 0.115-0.25 0.25-0.25 0 0 7.749-0 7.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v9.75z"/>
                            </svg></span>
                        <a target="_blank" href="` + url + `">` + filename + `</a>
                    </div>`;
    } else if (filename.split('.').pop() == 'xlsx' || filename.split('.').pop() == 'csv') {
        file_html = `<div class="format-file">
                        <span><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="32" height="32" viewBox="0 0 16 16">
                                <path fill="#000000" d="M11.61 6h-2.114l-1.496 2.204-1.496-2.204h-2.114l2.534 3.788-2.859 4.212h3.935v-1.431h-0.784l0.784-1.172 1.741 2.603h2.194l-2.859-4.212 2.534-3.788z"/>
                                <path fill="#000000" d="M14.341 3.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-7.75c-0.689 0-1.25 0.561-1.25 1.25v13.5c0 0.689 0.561 1.25 1.25 1.25h11.5c0.689 0 1.25-0.561 1.25-1.25v-9.75c0-0.224-0.068-0.615-0.659-1.421v0zM12.271 2.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-11.5c-0.135 0-0.25-0.114-0.25-0.25v-13.5c0-0.135 0.115-0.25 0.25-0.25 0 0 7.749-0 7.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v9.75z"/>
                            </svg></span>
                        <a target="_blank" href="` + url + `">` + filename + `</a>
                    </div>`;
    } else if (filename.split('.').pop() == 'txt') {
        file_html = `<div class="format-file">
                        <span><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-text" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                                <line x1="9" y1="9" x2="10" y2="9" />
                                <line x1="9" y1="13" x2="15" y2="13" />
                                <line x1="9" y1="17" x2="15" y2="17" />
                            </svg></span>
                        <a target="_blank" href="` + url + `">` + filename + `</a>
                    </div>`;
    } else {
        // not allowed
    }
    return file_html;
}

function getChatFileDisplayHtml(filename) {
    var file_html = "";
    if (['jpg', 'jpeg', 'png', 'gif'].includes(filename.split('.').pop())) {
        file_html = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-photo" width="56" height="56" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9e9e9e" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <line x1="15" y1="8" x2="15.01" y2="8" />
                        <rect x="4" y="4" width="16" height="16" rx="3" />
                        <path d="M4 15l4 -4a3 5 0 0 1 3 0l5 5" />
                        <path d="M14 14l1 -1a3 5 0 0 1 3 0l2 2" />
                    </svg>
                    <p>` + filename + `</p>`;
    } else if (filename.split('.').pop() == 'pdf') {
        file_html = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="0 0 16 16" style="opacity: 0.3;">
                        <path fill="#000000" d="M13.156 9.211c-0.213-0.21-0.686-0.321-1.406-0.331-0.487-0.005-1.073 0.038-1.69 0.124-0.276-0.159-0.561-0.333-0.784-0.542-0.601-0.561-1.103-1.34-1.415-2.197 0.020-0.080 0.038-0.15 0.054-0.222 0 0 0.339-1.923 0.249-2.573-0.012-0.089-0.020-0.115-0.044-0.184l-0.029-0.076c-0.092-0.212-0.273-0.437-0.556-0.425l-0.171-0.005c-0.316 0-0.573 0.161-0.64 0.403-0.205 0.757 0.007 1.889 0.39 3.355l-0.098 0.239c-0.275 0.67-0.619 1.345-0.923 1.94l-0.040 0.077c-0.32 0.626-0.61 1.157-0.873 1.607l-0.271 0.144c-0.020 0.010-0.485 0.257-0.594 0.323-0.926 0.553-1.539 1.18-1.641 1.678-0.032 0.159-0.008 0.362 0.156 0.456l0.263 0.132c0.114 0.057 0.234 0.086 0.357 0.086 0.659 0 1.425-0.821 2.48-2.662 1.218-0.396 2.604-0.726 3.819-0.908 0.926 0.521 2.065 0.883 2.783 0.883 0.128 0 0.238-0.012 0.327-0.036 0.138-0.037 0.254-0.115 0.325-0.222 0.139-0.21 0.168-0.499 0.13-0.795-0.011-0.088-0.081-0.196-0.157-0.271zM3.307 12.72c0.12-0.329 0.596-0.979 1.3-1.556 0.044-0.036 0.153-0.138 0.253-0.233-0.736 1.174-1.229 1.642-1.553 1.788zM7.476 3.12c0.212 0 0.333 0.534 0.343 1.035s-0.107 0.853-0.252 1.113c-0.12-0.385-0.179-0.992-0.179-1.389 0 0-0.009-0.759 0.088-0.759v0zM6.232 9.961c0.148-0.264 0.301-0.543 0.458-0.839 0.383-0.724 0.624-1.29 0.804-1.755 0.358 0.651 0.804 1.205 1.328 1.649 0.065 0.055 0.135 0.111 0.207 0.166-1.066 0.211-1.987 0.467-2.798 0.779v0zM12.952 9.901c-0.065 0.041-0.251 0.064-0.37 0.064-0.386 0-0.864-0.176-1.533-0.464 0.257-0.019 0.493-0.029 0.705-0.029 0.387 0 0.502-0.002 0.88 0.095s0.383 0.293 0.318 0.333v0z"/>
                        <path fill="#000000" d="M14.341 3.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-7.75c-0.689 0-1.25 0.561-1.25 1.25v13.5c0 0.689 0.561 1.25 1.25 1.25h11.5c0.689 0 1.25-0.561 1.25-1.25v-9.75c0-0.224-0.068-0.615-0.659-1.421v0zM12.271 2.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-11.5c-0.135 0-0.25-0.114-0.25-0.25v-13.5c0-0.135 0.115-0.25 0.25-0.25 0 0 7.749-0 7.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v9.75z"/>
                    </svg>
                    <p>` + filename + `</p>`;
    } else if (filename.split('.').pop() == 'doc' || filename.split('.').pop() == 'docx') {
        file_html = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="0 0 16 16" style="opacity: 0.3;">
                        <path fill="#000000" d="M9.997 7.436h0.691l-0.797 3.534-1.036-4.969h-1.665l-1.205 4.969-0.903-4.969h-1.741l1.767 7.998h1.701l1.192-4.73 1.066 4.73h1.568l2.025-7.998h-2.663v1.435z"/>
                        <path fill="#000000" d="M14.341 3.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-7.75c-0.689 0-1.25 0.561-1.25 1.25v13.5c0 0.689 0.561 1.25 1.25 1.25h11.5c0.689 0 1.25-0.561 1.25-1.25v-9.75c0-0.224-0.068-0.615-0.659-1.421v0zM12.271 2.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-11.5c-0.135 0-0.25-0.114-0.25-0.25v-13.5c0-0.135 0.115-0.25 0.25-0.25 0 0 7.749-0 7.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v9.75z"/>
                    </svg>
                    <p>` + filename + `</p>`;
    } else if (filename.split('.').pop() == 'xlsx' || filename.split('.').pop() == 'csv') {
        file_html = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="0 0 16 16" style="opacity: 0.3;">
                        <path fill="#000000" d="M11.61 6h-2.114l-1.496 2.204-1.496-2.204h-2.114l2.534 3.788-2.859 4.212h3.935v-1.431h-0.784l0.784-1.172 1.741 2.603h2.194l-2.859-4.212 2.534-3.788z"/>
                        <path fill="#000000" d="M14.341 3.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-7.75c-0.689 0-1.25 0.561-1.25 1.25v13.5c0 0.689 0.561 1.25 1.25 1.25h11.5c0.689 0 1.25-0.561 1.25-1.25v-9.75c0-0.224-0.068-0.615-0.659-1.421v0zM12.271 2.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-11.5c-0.135 0-0.25-0.114-0.25-0.25v-13.5c0-0.135 0.115-0.25 0.25-0.25 0 0 7.749-0 7.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v9.75z"/>
                    </svg>
                    <p>` + filename + `</p>`;
    } else if (filename.split('.').pop() == 'txt') {
        file_html = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-text" width="48" height="48" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9e9e9e" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                        <line x1="9" y1="9" x2="10" y2="9" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                    <p>` + filename + `</p>`;
    } else {
        // not allowed
    }
    return file_html;
}