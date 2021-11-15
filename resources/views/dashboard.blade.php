<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Chat App') }}
        </h2>
    </x-slot>

    <div class="py-12">
        {{-- <div class="max-w-8xl mx-auto sm:px-6 lg:px-10">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg"> --}}
                <div class="p-4 bg-white border-b border-gray-200">
                    <div class="container chat-app" id="dashboard-container" data-uuid="{{ Auth::user()->currently_logged_uuid }}" data-auth="{{ Auth::id() }}">
                        <div class="row chat-app-one">
                            <div class="col-sm-4 chat-side">
                                <div class="chat-side-one">
                                    <div class="row chat-heading">
                                        <div class="col heading-avatar">
                                            <div class="heading-avatar-icon">
                                                <img src="{{ url('') . '/assets/profiles/81.jpg' }}">
                                            </div>
                                        </div>
                                        <div class="col col-lg-1 heading-dot float-end">
                                            <i class="fa fa-ellipsis-v fa-2x" aria-hidden="true"></i>
                                        </div>
                                        <div class="col col-lg-1 heading-compose float-end" id="heading-compose">
                                            <a id="heading-compose"><i class="fa fa-comments fa-2x" aria-hidden="true"></i></a>
                                            <!-- <button id="showmenu" type="button">Hide menu</button> -->
                                        </div>
                                    </div>

                                    <div class="row searchBox">
                                        <div class="col-sm-12 searchBox-inner">
                                            <div class="form-group has-feedback">
                                                <input id="convSearchText" type="text" class="form-control" name="convSearchText" placeholder="Search">
                                                <span class="glyphicon glyphicon-search form-control-feedback"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row sideBar" id="conversation_lists">
                                    </div>
                                    <div class="row sideBar search-results display_none" id="search_conv_lists">
                                    </div>
                                </div>
                                <div class="chat-side-two">
                                    <div class="row newMessage-heading">
                                        <div class="row newMessage-main">
                                            <div class="col-sm-2 col-xs-2 newMessage-back">
                                                <i class="fa fa-arrow-left" aria-hidden="true"></i>
                                            </div>
                                            <div class="col-sm-10 col-xs-10 newMessage-title">
                                                New Chat
                                                <div class="float-right" id="user-confirm"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sign-out-alt" class="svg-inline--fa fa-sign-out-alt fa-w-16" role="img" viewBox="0 0 512 512" style="width: 1.55em;"><path fill="currentColor" d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row composeBox">
                                        <div class="col-sm-12 composeBox-inner">
                                            <div class="form-group has-feedback">
                                                <input id="userSearchText" type="text" class="form-control" name="userSearchText" placeholder="Search People">
                                                <span class="glyphicon glyphicon-search form-control-feedback"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row compose-sideBar" id="user_lists">
                                    </div>
                                    <div class="row compose-sideBar search_result_user_lists display_none" id="search_user_lists">
                                    </div>
                                </div>
                                <div class='dashboard_blur display_none' id='dashboard_blur'></div>
                            </div>

                            <div class="col-sm-8 conversation" id="conversation_window">
                            </div>
                            <div class="col-sm-8 empty-conversation">
                                <div class="row welcome-block">
                                    <div class="col col-lg-3 auth-avatar">
                                        <div class="auth-avatar-icon">
                                            <img src="{{ url('') . '/assets/profiles/81.jpg' }}">
                                        </div>
                                    </div>
                                    <div class="col welcome-text">
                                        Welcome! <p class="welcome-name">{{ auth()->user()->name }}</p>    
                                    </div>
                                </div>
                                <div class="row welcome-instructions">
                                    <p class="instruction-text">
                                        Click at <i class="fa fa-comments fa-2x" aria-hidden="true"></i> at top of sidebar to begin with a new chat.
                                    </p>
                                </div>
                                <div class="row auth-mail">
                                    You are signed in as {{ auth()->user()->email }}
                                </div>
                            </div>
                            <div class="col-sm-8 conversation-loading">
                                <div class="loader-bouncing is-active">
                                    <div class="circle"></div>
                                    <div class="circle"></div>
                                    <div class="circle"></div>
                                    <div class="shadow"></div>
                                    <div class="shadow"></div>
                                    <div class="shadow"></div>
                                    <span>Loading Chat Window</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {{-- </div>
        </div> --}}
    </div>
</x-app-layout>