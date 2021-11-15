<script>
    var allConversationsForSearch = [];
    var allUsersForSearch = [];
    $(document).ready(function() {
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
        
        $("#heading-compose").click(function() {
            $(".chat-side-two").css({
                "left": "0%"
            });
        });
        $(".newMessage-back").click(function() {
            $(".chat-side-two").css({
                "left": "-100%"
            });
        });

    /* 
     *   -------- ajax setup --------
     */
    // ajax 
    $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

    // get all conversations
    getConversation();
    });

    //-- Selecting whom to chat with --
    $("#user_lists").on("click", '.new-chat', function(e) {
            {{-- //why only this syntax to know follow this answer https://stackoverflow.com/questions/15090942/event-handler-not-working-on-dynamic-content --}}
                e.preventDefault();
                var chk = $(this).find("input[type='checkbox']");
                if ($(this).hasClass("user-selected")) {
                    if (chk.is(":checked") != false) {
                        chk.prop("checked", false);
                    }
                    $(this).removeClass("user-selected");
                    $(this).find('.sideBar-checkbox').addClass('display_none');
                } else {
                    if (chk.is(":checked") == false) {
                        chk.prop("checked", true);
                    } else {
                        chk.prop("checked", false);
                    }
                    $(this).addClass("user-selected");
                    $(this).find('.sideBar-checkbox').removeClass('display_none');
                }
            });

        $("#user-confirm").click(function() {
                var selected_users = [];
                $('#user_lists .user-selected :checkbox:checked').each(function(i) {
                    selected_users[i] = $(this).val();
                });
                console.log(selected_users);
                // alert(selected_users);
                if(!selected_users.length){
                    console.log('no user selected');
                    return false;
                }
                // start new conversation
                var is_private;
                if (isPrivateChat(selected_users)) {
                    is_private = true;
                } else {
                    is_private = false;
                }
                $.ajax({
                    url: "{{ route('set_conversation') }}",
                    method: "POST",
                    data: { is_private: is_private, selected_users: selected_users },
                    }).done(function(response) {
                        console.log(response.data);
                        getConversation();
                        $('.compose-sideBar input:checkbox').prop('checked', false);
                        $('#user_lists .user-selected').removeClass('user-selected');
                        $(".chat-side-two").css({ "left": "-100%" });
                    }).fail(function(jqXHR, textStatus) {
                        console.log(textStatus + jqXHR);
                    });
        });

         //-- fetch conversations list :get --
        function getConversation(id=null){
            $.ajax({
                type: 'GET',
                url: '{{route("get_conversation")}}',
                beforeSend: function() {
                    var loader = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(255, 255, 255); display: block; shape-rendering: auto; top: 70px;" width="70px" height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                        <circle cx="50" cy="50" fill="none" stroke="#5699d2" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
                        <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"/>
                        </circle></svg>`;
                    $("#conversation_lists").html(loader);
                },
                success: function(data) {
                    var obj = data.data;
                    var converse_html = "";
                    
                    if(obj.length){
                        if(!id){
                            $.each(obj, function(key, val) {
                                if(val.type == 'PERSONAL_CHAT') {
                                    converse_html += `<div class="row sideBar-body selected-converse" id="selected_converse_`+ val.id +`">
                                        <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                            <div class="avatar-icon image-badge" data-auth="`+val.auth_id+`">
                                                <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                                                <span class="badge offline">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle" width="14" height="14" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ee5253" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <circle cx="12" cy="12" r="9" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="col-sm-9 col-xs-9 sideBar-main">
                                            <div class="row">
                                                <div class="col-sm-8 col-xs-8 sideBar-name">
                                                    <span class="name-meta">`+val.title+`
                                                    </span>
                                                </div>
                                                <div class="col-sm-4 col-xs-4 float-right sideBar-time">
                                                    <span class="time-meta float-right">18:18
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                                } else {
                                    converse_html += `<div class="row sideBar-body selected-converse" id="selected_converse_`+ val.id +`">
                                        <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                            <div class="avatar-icon">
                                                <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                                            </div>
                                        </div>
                                        <div class="col-sm-9 col-xs-9 sideBar-main">
                                            <div class="row">
                                                <div class="col-sm-8 col-xs-8 sideBar-name">
                                                    <span class="name-meta">`+val.title+`
                                                    </span>
                                                </div>
                                                <div class="col-sm-4 col-xs-4 float-right sideBar-time">
                                                    <span class="time-meta float-right">18:18
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                                }
                            });
                        } else {
                            $.each(obj, function(key, val) {
                                if(val.type == 'PERSONAL_CHAT') {
                                    if(id == val.id){
                                    converse_html += `<div class="row sideBar-body selected-converse chat-selected" id="selected_converse_`+ val.id +`">
                                        <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                            <div class="avatar-icon image-badge" data-auth="`+val.auth_id+`">
                                                <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                                                <span class="badge offline">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle" width="14" height="14" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ee5253" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <circle cx="12" cy="12" r="9" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="col-sm-9 col-xs-9 sideBar-main">
                                            <div class="row">
                                                <div class="col-sm-8 col-xs-8 sideBar-name">
                                                    <span class="name-meta">`+val.title+`
                                                    </span>
                                                </div>
                                                <div class="col-sm-4 col-xs-4 float-right sideBar-time">
                                                    <span class="time-meta float-right">18:18
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`; 
                                    } else {
                                        converse_html += `<div class="row sideBar-body selected-converse" id="selected_converse_`+ val.id +`">
                                            <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                                <div class="avatar-icon image-badge" data-auth="`+val.auth_id+`">
                                                <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                                                <span class="badge offline">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle" width="14" height="14" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ee5253" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <circle cx="12" cy="12" r="9" />
                                                    </svg>
                                                </span>
                                            </div>
                                            </div>
                                            <div class="col-sm-9 col-xs-9 sideBar-main">
                                                <div class="row">
                                                    <div class="col-sm-8 col-xs-8 sideBar-name">
                                                        <span class="name-meta">`+val.title+`
                                                        </span>
                                                    </div>
                                                    <div class="col-sm-4 col-xs-4 float-right sideBar-time">
                                                        <span class="time-meta float-right">18:18
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;
                                    }
                                } else {
                                    if(id == val.id){
                                    converse_html += `<div class="row sideBar-body selected-converse chat-selected" id="selected_converse_`+ val.id +`">
                                        <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                            <div class="avatar-icon">
                                                <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                                            </div>
                                        </div>
                                        <div class="col-sm-9 col-xs-9 sideBar-main">
                                            <div class="row">
                                                <div class="col-sm-8 col-xs-8 sideBar-name">
                                                    <span class="name-meta">`+val.title+`
                                                    </span>
                                                </div>
                                                <div class="col-sm-4 col-xs-4 float-right sideBar-time">
                                                    <span class="time-meta float-right">18:18
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`; 
                                    } else {
                                        converse_html += `<div class="row sideBar-body selected-converse" id="selected_converse_`+ val.id +`">
                                            <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                                <div class="avatar-icon">
                                                    <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                                                </div>
                                            </div>
                                            <div class="col-sm-9 col-xs-9 sideBar-main">
                                                <div class="row">
                                                    <div class="col-sm-8 col-xs-8 sideBar-name">
                                                        <span class="name-meta">`+val.title+`
                                                        </span>
                                                    </div>
                                                    <div class="col-sm-4 col-xs-4 float-right sideBar-time">
                                                        <span class="time-meta float-right">18:18
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;
                                    }
                                }
                            });
                        }
                    }
                    $("#conversation_lists").html(converse_html);
                },
                error: function(jqXHR, textStatus) {
                    console.log(textStatus + jqXHR);
                }
            });
        }

        //-- fetch users list :get --
        $.ajax({
            type: 'GET',
            url: '{{route("users_list")}}',
            success: function(data) {
                var obj = data.data;
                allUsersForSearch = obj;
                if (data.status == 'success') {
                    var your_html = "";
                    $.each(obj, function(key, val) {
                        your_html += `<div class="row sideBar-body new-chat">
                                <div class="col-sm-2 col-xs-2 sideBar-checkbox display_none">
                                    <input onclick="event.preventDefault();" type="checkbox" value="`+ val.id +`">
                                </div>
                                <div class="col-sm-2 col-xs-2 sideBar-avatar">
                                    <div class="avatar-icon">
                                        <img src="{{ url('') . '/assets/profiles/w1.jpg' }}">
                                    </div>
                                </div>
                                <div class="col-sm-8 col-xs-8 sideBar-main">
                                    <div class="row">
                                        <div class="col-sm-9 col-xs-9 sideBar-name">
                                            <span class="name-meta">` + val.name + `</span>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    });
                    $("#user_lists").html(your_html);
                }
            },
            error: function(data) {
                console.log(data);
            }
        });
        {{-- Selecting conversation block click --}}
        $("#conversation_lists").on("click", '.selected-converse', function(e) {
            // select chat
            $("#conversation_lists .chat-selected").removeClass("chat-selected");
            $(this).addClass("chat-selected");
            // call chat-window and show conversation box
            var id_string = $(this).attr('id');
            var conv_id = id_string.replace('selected_converse_', '');
            
            $.ajax({
                type: "GET",
                url: '{{ route("get_chat_window", "") }}'+'/'+conv_id,
                beforeSend: function() {
                    if( $(".empty-conversation").css('display').toLowerCase() != 'none') {
                        $(".empty-conversation").css("display", "none");
                    }
                    if( $(".conversation").css('display').toLowerCase() != 'none') {
                        $(".conversation").css("display", "none");
                    }
                    if( $(".conversation-loading").css('display').toLowerCase() == 'none') {
                        $(".conversation-loading").css("display", "flex");
                    }
                },
                success: function(response) {
                    $('#conversation_window').html('');
                    $('#conversation_window').html(response);
                    // remove the loader
                    if( $(".conversation-loading").css('display').toLowerCase() != 'none') {
                        $(".conversation-loading").css("display", "none");
                    }
                    // don't show default display
                    if( $(".empty-conversation").css('display').toLowerCase() != 'none') {
                        $(".empty-conversation").css("display", "none");
                    }
                    // show conversation window
                    if( $(".conversation").css('display').toLowerCase() == 'none') {
                        $(".conversation").css("display", "block");
                    }
                    $('#chat-box-scroll-down').scrollTop($('#chat-box-scroll-down')[0].scrollHeight);

                },
                error: function(data) {
                    console.log(data);
                }
            });
        });

    {{-- search block for conversation_lists --}}
    var alreadyselectedConversation = null;
    $("#convSearchText").on("click", function () {
        alreadyselectedConversation = $("#conversation_lists .chat-selected").attr('id');

        $.ajax({
                type: 'GET',
                url: '{{route("get_conversation")}}',
                success: function(data) {
                    allConversationsForSearch = data.data;
                },
                error: function(data) {
                console.log("error occured while gathering all conversations for search: ", data);
            }
        });
        $('#conversation_lists').addClass('display_none');
        $('#search_conv_lists').removeClass('display_none');
        var closeSearchButton = `<button type="button" class="search-close" data-toggle="tooltip" data-placement="right" title="close search">
                                <span>&times;</span>
                            </button><hr style="border-top: 1px solid #b2bec3; width:85%; padding:0 25px 0 25px; margin-top: 40px">`;
        $('#search_conv_lists').html(closeSearchButton);
        $('#convSearchText').on('keyup', function(e) {
            const searchString = e.target.value;
            const filterConv = allConversationsForSearch.filter((val) => {
                //return val.title.includes(searchString);
                return val.title.toLowerCase().startsWith(searchString) || val.title.includes(searchString);
            });
            console.log(filterConv);
            filtered_html = '';
            filtered_html += closeSearchButton; 
            if(filterConv.length != 0){

                $.each(filterConv, function(key, val) {
                    filtered_html += `<div class="row sideBar-body filtered-converse" id="filtered_converse_`+ val.id +`">
                        <div class="col-sm-3 col-xs-3 sideBar-avatar">
                            <div class="avatar-icon">
                                <img src="{{ url('') . '/assets/profiles/fs1.jpg' }}">
                            </div>
                        </div>
                        <div class="col-sm-9 col-xs-9 sideBar-main">
                            <div class="row">
                                <div class="col-sm-8 col-xs-8 sideBar-name">
                                    <span class="name-meta">`+val.title+`
                                    </span>
                                </div>
                                <div class="col-sm-4 col-xs-4 float-right sideBar-time">
                                    <span class="time-meta float-right">18:18
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                });
            }
            $("#search_conv_lists").html(filtered_html);
        });
    });
    {{-- close search box filtered_converse --}}
    $('#search_conv_lists').on('click', '.search-close', function() {
        $('#search_conv_lists').addClass('display_none');
        $('#conversation_lists').removeClass('display_none');
        if(alreadyselectedConversation){
            var alreadyselectedconv_id = parseInt(alreadyselectedConversation.replace('selected_converse_', ''));
            getConversation(alreadyselectedconv_id);
        } else {
            getConversation();
        }
        $("input[name='convSearchText']").val('');
    });
    {{-- on click conversation from filter search --}}
    $('#search_conv_lists').on('click', '.filtered-converse', function() {
        console.log($(this).attr('id'));
        var filtered_converse_id = $(this).attr('id');
        var id = parseInt(filtered_converse_id.replace('filtered_converse_', ''));
        console.log(id);
        $('#search_conv_lists').addClass('display_none');
        $('#conversation_lists').removeClass('display_none');
        getConversation(id);
        $("input[name='convSearchText']").val('');
        var conv_id = id.toString();

        $.ajax({
            type: "GET",
            url: '{{ route("get_chat_window", "") }}'+'/'+conv_id,
            beforeSend: function() {
                if( $(".empty-conversation").css('display').toLowerCase() != 'none') {
                    $(".empty-conversation").css("display", "none");
                }
                if( $(".conversation").css('display').toLowerCase() != 'none') {
                    $(".conversation").css("display", "none");
                }
                if( $(".conversation-loading").css('display').toLowerCase() == 'none') {
                    $(".conversation-loading").css("display", "flex");
                }
            },
            success: function(response) {
                $('#conversation_window').html('');
                $('#conversation_window').html(response);
                // remove the loader
                if( $(".conversation-loading").css('display').toLowerCase() != 'none') {
                    $(".conversation-loading").css("display", "none");
                }
                // don't show default display
                if( $(".empty-conversation").css('display').toLowerCase() != 'none') {
                    $(".empty-conversation").css("display", "none");
                }
                // show conversation window
                if( $(".conversation").css('display').toLowerCase() == 'none') {
                    $(".conversation").css("display", "block");
                }
                $('#chat-box-scroll-down').scrollTop($('#chat-box-scroll-down')[0].scrollHeight);

            },
            error: function(data) {
                console.log(data);
            }
        });
    });

    {{-- search block for user_lists --}}
    $('#userSearchText').on('click', function() {
        $('#user_lists').addClass('display_none');
        $('#search_user_lists').removeClass('display_none');
        var closeSearchButton = `<button type="button" class="usr-search-close" data-toggle="tooltip" data-placement="right" title="close search">
                                <span>&times;</span>
                            </button><hr style="border-top: 1px solid #b2bec3; width:85%; padding:0 25px 0 25px; margin-top: 40px">`;
        $('#search_user_lists').html(closeSearchButton);
        $('#userSearchText').on('keyup', function(e) {
            const searchString = e.target.value;
            console.log(searchString);
            const filterUsers = allUsersForSearch.filter((val) => {
                return val.name.toLowerCase().includes(searchString) || val.email.toLowerCase().includes(searchString);
            });
            console.log(filterUsers);
            filter_html = '';
            filter_html += closeSearchButton; 
            if(filterUsers.length!=0){
            $.each(filterUsers, function(key, val) {
                filter_html += `<div class="row sideBar-body new-chat">
                    <div class="col-sm-2 col-xs-2 sideBar-checkbox display_none">
                        <input onclick="event.preventDefault();" type="checkbox" value="`+ val.id +`">
                    </div>
                    <div class="col-sm-2 col-xs-2 sideBar-avatar">
                        <div class="avatar-icon">
                            <img src="{{ url('') . '/assets/profiles/w1.jpg' }}">
                        </div>
                    </div>
                    <div class="col-sm-8 col-xs-8 sideBar-main">
                        <div class="row">
                            <div class="col-sm-9 col-xs-9 sideBar-name">
                                <span class="name-meta">` + val.name + `</span>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
            }
            $("#search_user_lists").html(filter_html);
        });
    });

    {{-- close search box for search users --}}
    $('#search_user_lists').on('click', '.usr-search-close', function() {
        $('#search_user_lists').addClass('display_none');
        $('#user_lists').removeClass('display_none');
        getConversation();
        $("input[name='userSearchText']").val('');
    });

    $("#search_user_lists").on("click", '.new-chat', function(e) {
        e.preventDefault();
        var chk = $(this).find("input[type='checkbox']");
        var selectedUserId = chk.val();
        console.log(selectedUserId);
        $('#search_user_lists').addClass('display_none');
        $('#user_lists').removeClass('display_none');
        $("input[name='userSearchText']").val('');
        var user_html = '';
        $.each(allUsersForSearch, function(key, val) {
            if(val.id == selectedUserId){
                user_html += `<div class="row sideBar-body new-chat user-selected">
                        <div class="col-sm-2 col-xs-2 sideBar-checkbox">
                            <input onclick="event.preventDefault();" type="checkbox" value="`+ val.id +`" checked="checked">
                        </div>
                        <div class="col-sm-2 col-xs-2 sideBar-avatar">
                            <div class="avatar-icon">
                                <img src="{{ url('') . '/assets/profiles/w1.jpg' }}">
                            </div>
                        </div>
                        <div class="col-sm-8 col-xs-8 sideBar-main">
                            <div class="row">
                                <div class="col-sm-9 col-xs-9 sideBar-name">
                                    <span class="name-meta">` + val.name + `</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
            } else {
                user_html += `<div class="row sideBar-body new-chat">
                        <div class="col-sm-2 col-xs-2 sideBar-checkbox display_none">
                            <input onclick="event.preventDefault();" type="checkbox" value="`+ val.id +`">
                        </div>
                        <div class="col-sm-2 col-xs-2 sideBar-avatar">
                            <div class="avatar-icon">
                                <img src="{{ url('') . '/assets/profiles/w1.jpg' }}">
                            </div>
                        </div>
                        <div class="col-sm-8 col-xs-8 sideBar-main">
                            <div class="row">
                                <div class="col-sm-9 col-xs-9 sideBar-name">
                                    <span class="name-meta">` + val.name + `</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }

        });
        $("#user_lists").html(user_html);
    });

    {{-- // helper functions --}}
    function isPrivateChat(arr) {
        arr.sort();
        return arr[0] == arr[arr.length - 1];
    }
</script>