@php
    if(!$conversation->is_group)
        $title = \App\Models\User::getUserNameById($send_to);
    else
        $title = $conversation->title;
@endphp
{{-- 
    chat-heading
     --}}
<div class='dashboard_blur display_none' id='dashboard_blur'></div>
<div class="row chat-heading">
    <div class="col col-lg-1 heading-avatar">
        <div class="heading-avatar-icon">
            <img src=" {{ url('') . '/assets/profiles/fs1.jpg' }}">
        </div>
    </div>
    <div class="col heading-name float-left">
        <span class="heading-name-meta" data-toggle="tooltip" data-placement="bottom" title="{{ __($title) }}">
            {{ __($title) }}
        </span>
        <span class="heading-online">Online</span>
    </div>
    <div class="col col-lg-2 heading-dot-right">
        <button id="{{$conversation->is_group ? 'group_code_voice_button' : 'personal_code_voice_button' }}" @if( $conversation->is_group && ((isset($is_voice_room_set) && $is_voice_room_set) && !empty($room_id)) ) class='join-room pulsate-fwd manual_tool_tip' room-set="true" data-roomid="{{$room_id}}" title="Meeting in Progress, click to join" @endif>
        <!-- call -->
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-phone" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#93918f" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
            </svg>
        </button>
        <button id="{{ $conversation->is_group ? 'group_code_video_button' : 'personal_code_video_button' }}" @if( $conversation->is_group && ((isset($is_video_room_set) && $is_video_room_set) && !empty($room_id)) )class='join-room pulsate-fwd manual_tool_tip' room-set="true" data-roomid="{{$room_id}}" title="Meeting in Progress, click to join" @endif>
        <!-- video -->
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-video" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#93918f" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
                <rect x="3" y="6" width="12" height="12" rx="2" />
            </svg>
        </button>
        {{-- <button type="button" class="dropdown-btn float-right">
            <i class="fa fa-ellipsis-v fa-2x float-right" aria-hidden="true"></i>
        </button> --}}
        {{-- Default dropleft button --}}
        <div class="btn-group dropleft">
            <button type="button" class=" float-right" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fa fa-ellipsis-v fa-2x float-right" aria-hidden="true"></i>
            </button>
            <div class="dropdown-menu">
                <a style="cursor:pointer" class="dropdown-item" data-toggle="modal" data-target="#about-conversation-modal">About</a>
            </div>
        </div>
    </div>
</div>
{{-- 
    Chat Window
     --}}
<div class="chat-window " id="chat-window" data-conversation="{{ $conversation->id }}">
        <div class="chat-body" id="chat-box-scroll-down">
            @include('components.chat-block', [
                'messages' => $messages,
            ])
        </div>
</div>
@if(!$conversation->is_group)
{{--  video call container --}}
<div class='call_container display_none' id="call_container">
    <div class='videos_container' id="videos_container">
        <div id='video_placeholder' class='videos_placeholder'>
            <img src='{{ url('') . '/assets/images/user-icon.png' }}'>
        </div>
        <video class='remote_video display_none' autoplay id='remote_video'></video>
        <div class='local_video_container'>
            <video class='local_video' id='local_video' muted autoplay></video>
        </div>
        <div class='call_buttons_container display_none' id='call_buttons'>
            <button class='video-conference call_button_small' id='mic_button'>
                <img src='{{ url('') . '/assets/images/mic.png' }}' id='mic_button_image'>
            </button>
            <button class='video-conference call_button_small' id='camera_button'>
                <img src='{{ url('') . '/assets/images/camera.png' }}' id='camera_button_image'>
            </button>
            <button class='video-conference call_button_large' id='hang_up_button'>
                <img src='{{ url('') . '/assets/images/hangUp.png' }}'>
            </button>
            <button class='video-conference call_button_small' id='screen_sharing_button'>
                {{-- <img src='{{ url('') . '/assets/images/switchCameraScreenSharing.png' }}'></img> --}}
                <span id="screen_sharing_button_svg"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-screen-share" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#dff9fb" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
                    <line x1="7" y1="20" x2="17" y2="20" />
                    <line x1="9" y1="16" x2="9" y2="20" />
                    <line x1="15" y1="16" x2="15" y2="20" />
                    <path d="M17 4h4v4" />
                    <path d="M16 9l5 -5" />
                    </svg></span>
            </button>
            <button class='video-conference call_button_small' id='start_recording_button'>
                <img src='{{ url('') . '/assets/images/recordingStart.png' }}'>
            </button>
        </div>
        <div class="flex_end_button_container display_none" id="full_screen_button_container">
            <button class="video-conference call_button_small" id="full_screen_button">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-maximize" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                    <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                    <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                </svg>
            </button>
        </div>
        <div class='finish_chat_button_container display_none' id='finish_chat_button_container'>
            <button class='call_button_large' id='finish_chat_call_button'>
                <img src='{{ url('') . '/assets/images/hangUp.png' }}'>
            </button>
        </div>
        <div class='video_recording_buttons_container display_none' id='video_recording_buttons'>
            <button id='pause_recording_button' class='video-conference'>
                <img src='{{url(''). '/assets/images/pause.png' }}'>
            </button>
            <button id='resume_recording_button' class='video-conference'>
                <img src='{{ url(''). '/assets/images/resume.png' }}'>
            </button>
            <button class="video-conference" id='stop_recording_button'>
                Stop recording
            </button>
        </div>
    </div>
</div>
{{-- voice call container --}}
<div class='call_container display_none' id="voice_call_container">
    <div class='videos_container' id="voices_container">
        <div id='voice_placeholder' class='videos_placeholder'>
            <img src='{{ url('') . '/assets/images/calling-icon.png' }}'>
        </div>
        <audio autoplay id='remote_audio'></audio>
        <audio id='local_audio' muted autoplay></audio>
        <div class='call_buttons_container display_none' id='voice_call_buttons'>
            <button class='voice-conference call_button_small' id='voice_call_mic_button'>
                <img src='{{ url('') . '/assets/images/mic.png' }}' id='mic_button_image_audio'>
            </button>
            <button class='voice-conference call_button_small' style="background-color:#fc5d5b;" id='voice_call_hang_up_button'>
                <img src='{{ url('') . '/assets/images/hangUp.png' }}'>
            </button>
        </div>
    </div>
</div>
@else
{{-- group video call container --}}
<div class='call_container display_none' id="call_container">
    <div class='videos_container' id="videos_container">
        <div id='video_placeholder' class='videos_placeholder display_none'>
            <img src='{{ url('') . '/assets/images/user-icon.png' }}'>
        </div>
        {{-- <div class='local_video_group_container'>
            <video class='local_video' id='local_video' muted autoplay></video>
        </div> --}}
        <div id="remote_video_group_container">
            {{-- <div class="remote_video_in_group"></div> --}}
        </div>
        <div class='call_buttons_container display_none' id='group_video_call_buttons'>
            <button class='video-conference call_button_small' id='group_video_call_mic_button'>
                <img src='{{ url('') . '/assets/images/mic.png' }}' id='mic_button_image_videogrp'>
            </button>
            <button class='video-conference call_button_small' id='group_video_call_camera_button'>
                <img src='{{ url('') . '/assets/images/camera.png' }}' id='camera_button_image_videogrp'>
            </button>
            <button class='video-conference call_button_large' id='group_video_call_hang_up_button'>
                <img src='{{ url('') . '/assets/images/hangUp.png' }}'>
            </button>
            <button class='video-conference call_button_small' id='group_video_call_screen_sharing_button'>
                {{-- <img src='{{ url('') . '/assets/images/switchCameraScreenSharing.png' }}'></img> --}}
                <span id="screen_sharing_button_svg"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-screen-share" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#dff9fb" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
                    <line x1="7" y1="20" x2="17" y2="20" />
                    <line x1="9" y1="16" x2="9" y2="20" />
                    <line x1="15" y1="16" x2="15" y2="20" />
                    <path d="M17 4h4v4" />
                    <path d="M16 9l5 -5" />
                    </svg></span>
            </button>
            <button class='video-conference call_button_small' id='group_video_call_start_recording_button'>
                <img src='{{ url('') . '/assets/images/recordingStart.png' }}'>
            </button>
        </div>
        <div class="flex_end_button_container display_none" id="full_screen_button_container">
            <button class="video-conference call_button_small" id="full_screen_button">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-maximize" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                    <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                    <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                </svg>
            </button>
        </div>
        <div class='video_recording_buttons_container display_none' id='video_recording_buttons'>
            <button id='pause_recording_button' class='video-conference'>
                <img src='{{url(''). '/assets/images/pause.png' }}'>
            </button>
            <button id='resume_recording_button' class='video-conference'>
                <img src='{{ url(''). '/assets/images/resume.png' }}'>
            </button>
            <button class="video-conference" id='stop_recording_button'>
                Stop recording
            </button>
        </div>
    </div>
</div>
{{-- group voice call container --}}
<div class='call_container display_none' id="voice_call_container">
    <div class='videos_container' id="voices_container">
        <div id='voice_placeholder' class='videos_placeholder'>
            <img src='{{ url('') . '/assets/images/calling-icon.png' }}'>
        </div>
        <div id="remote_audio_group_container">
        </div>
        <div class='call_buttons_container display_none' id='group_voice_call_buttons'>
            <button class='voice-conference call_button_small' id='group_voice_call_mic_button'>
                <img src='{{ url('') . '/assets/images/mic.png' }}' id='mic_button_image_grpaudio'>
            </button>
            <button class='voice-conference call_button_large' {{--style="background-color:#fc5d5b;"--}} id='group_voice_call_hang_up_button'>
                <img src='{{ url('') . '/assets/images/hangUp.png' }}'>
            </button>
            <button class='video-conference call_button_small' id='group_voice_call_start_recording_button'>
                <img src='{{ url('') . '/assets/images/recordingStart.png' }}'>
            </button>
        </div>
        <div class='video_recording_buttons_container display_none' id='video_recording_buttons'>
            <button id='pause_recording_button' class='video-conference'>
                <img src='{{url(''). '/assets/images/pause.png' }}'>
            </button>
            <button id='resume_recording_button' class='video-conference'>
                <img src='{{ url(''). '/assets/images/resume.png' }}'>
            </button>
            <button class="video-conference" id='stop_recording_button'>
                Stop recording
            </button>
        </div>
    </div>
</div>
@endif

{{-- Modal --}}
{{-- File Upload Modal --}}
<div class="modal fade" id="upload-chat-file" tabindex="-1" aria-labelledby="file-upload-chat-modal" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content rounded-borders">
            <div class="modal-header">
                <h5 class="modal-title" id="file-upload-chat-modal">
                    File Upload
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="hr-modal">
                <hr style="border-top: 1px solid #b2bec3; width:85%; padding:0 25px 0 25px;">
            </div>
            <div class="modal-body">
                <div class="container-fluid">
                    <div class="alert alert-primary" role="alert">
                        You can either add images(.png, .gif .jpg, or .jpeg), spreadsheet files(.xlsx, .csv), word document(.doc, .docx), text(.txt) or pdf files <strong>Max File Size allowed</strong> : 4 mb
                    </div>
                    <div class="row">
                        <form class="col-sm-12" type="post" enctype="multipart/form-data" id="chatfile-submit">
                        @csrf
                            <div class="display-file">
                            </div>
                            <input type="file" name="file" class="col-sm-8">
                            <button type="submit" id="chat-window-submit-file" class="btn btn-warning button-center" style="border-radius:8px;"><span class="arc float-right"></span><strong style="margin:2px;"> Save</strong></button>
                        </form>
                    </div>
                    <div id="alert-invalid-file" class="alert alert-danger" role="alert" style="display:none;">
                        <button type="button" class="close" data-dismiss="alert">x</button>
                    </div>
                    <div id="alert-no-file-save" class="alert alert-warning alert-dismissible fade show display_none" role="alert">
                        <strong>Note!</strong> No file uploaded to be send.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-modal btn-close" data-dismiss="modal">Close</button>
                <button type="button" id="set-fileto-chat" class="btn-modal btn-modal-primary">Send File</button>
            </div>
        </div>
    </div>
</div>
{{-- Modal End --}}
{{-- About Modal --}}

<div class="modal fade" id="about-conversation-modal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="aboutConversationModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content rounded-borders" id="changeGroupNameModalContent">
      <div class="modal-header about-conversation-title">
        <h5 class="modal-title  title-word-wrap" id="aboutConversationModalLabel"><span {{ $conversation->is_group ? 'id=editable' : 'id=non-editable' }}>{{ $title }}</span></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div id="ppt-grp-membr">
        @foreach($participants as $participant)
            <div class="table-content-flex">
                <div class="avatar-icon">
                    <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                </div>
                <div style="padding: 0 4px; align-items: center">
                    <strong>{{ __($participant->user->name) }}</strong>
                </div>
            </div>
            <hr style="border-top: 1px solid #b2bec3; width:85%; padding:0 25px 0 25px;">
        @endforeach
        </div>
        @if($conversation->is_group)
        <button class="btn btn-light btn-block btn-border-box" type="button" data-toggle="collapse" data-target="#add_new_group_members_accordian" aria-expanded="false" aria-controls="collapse-accordian">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-plus" width="56" height="56" viewBox="0 0 24 24" stroke-width="1.5" stroke="#0984e3" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <circle cx="12" cy="12" r="9" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="12" y1="9" x2="12" y2="15" />
                </svg>
                <span class="add-new-text">Add new members to group</span>
        </button>
        <div class="collapse" id="add_new_group_members_accordian">
        </div>
        @endif
      </div>
    </div>
  </div>
</div>
{{-- Modal End --}}
{{-- 
    chat-reply
     --}}
<form class="row reply " id="chat-form" onsubmit="return false;">
    
    <div class="col-sm-1 col-xs-1 reply-emojis">
        <button type="button" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="false" aria-expanded="false">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-mood-smile" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#93918f" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <circle cx="12" cy="12" r="9" />
                <line x1="9" y1="10" x2="9.01" y2="10" />
                <line x1="15" y1="10" x2="15.01" y2="10" />
                <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
            </svg>
        </button>
        <div class="dropdown-menu all-emojis" id="emoji-dropup">
            <div class="emoji-content">
                @php 
                $emojis = \App\Constants\ChatConstants::EMOJIS;
                @endphp
                @foreach($emojis as $emoji )
                    <span class="emoji-component" style="margin: 7px; font-size: 21px; cursor:pointer;">{{ $emoji }}</span>
                @endforeach
                <br>
                </div>
        </div>
    </div>
    <div class="col-sm-9 col-xs-8 reply-main">
            <div class="msg-file display_none">
            </div>
            <input type="hidden" name="conv_id" value="{{ $conversation->id }}">
            <input type="text" autocomplete="off" class="form-control" placeholder="Type a message" name="chat_text" id="chat_text" />
    </div>
    <div class="col-sm-1 col-xs-1 reply-recording">
        <button type="button"  data-toggle="modal" data-target="#upload-chat-file" data-converse={{ $conversation->id }} data-toggle="tooltip" data-placement="top" title="Upload Attachment">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-upload" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#93918f" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <polyline points="9 14 12 11 15 14" />
        </svg>
        </button>
        {{-- <button type="button">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-microphone" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#93918f" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        </button> --}}
    </div>
    <div class="col-sm-1 col-xs-1 reply-send">
        <button id="btn-save-chat" type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-telegram" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#93918f" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
            </svg>
        </button>
    </div>
</form>
<div id='dialog'></div>
<script src='{{ asset('/js/main.js') }}'></script>