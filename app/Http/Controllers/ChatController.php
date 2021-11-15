<?php

namespace App\Http\Controllers;

use Auth;
use Response;
use Carbon\Carbon;
use App\Models\Room;
use App\Models\User;
use App\Models\Message;
use App\Models\ChatFile;
use App\Models\Participant;
use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Constants\ChatConstants;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    public function getUsers(){
        try{
            $users = User::whereNotIn('id', [Auth::id()])
                        ->get()
                        ->map(function($user, $key){
                            return [
                                'name' => $user->name,
                                'email' => $user->email,
                                'id' => $user->id,
                                'profile_pic' => $user->profile_pic,
                                'created_at' => $user->created_at
                            ];
                        });
            $data = [
                'status' => 'success',
                'message' => 'all users',
                'data' => $users
            ];
            return Response::json($data, 200);
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
            return Response::json($data, 500);
        }
    }

    public function setConversation(Request $request) {
        try{
            $auth_id = Auth::id();
            $inputs = $request->all();
            // set up conversation
            if (!ctype_digit(implode('',$inputs['selected_users'])) ) {
                return Response::json(['status' => 'error', 'message' => 'invalid data'], 422); 
            }
            
            if($inputs['is_private'] && count($inputs['selected_users']) == ChatConstants::PERSONAL_CHAT){
                $title = User::getUserNameById($inputs['selected_users'][0]).', '.User::getUserNameById(Auth::id());
            } else {
                $title = 'group : ' . implode(", ",array_merge( User::getUserNamesByIds($inputs['selected_users']), [Auth::user()->name] ) );;
            }
            $already_present_conv = Conversation::where('title', $title)->first();
            if(empty($already_present_conv)){
                $converseObj = new Conversation;
                $converseObj->title = $title;
                $converseObj->creator_id = $auth_id;
                $converseObj->is_group = $inputs['is_private'] && count($inputs['selected_users']) == ChatConstants::PERSONAL_CHAT ? false : true;
                $converseObj->deleted_at = null;
                $converseObj->channel_id = null;
                if($converseObj->save()) {
                    // set up participant for the conversation channel
                    $creates[] = [
                        'conversation_id' => $converseObj->id,
                        'user_id' => $auth_id,
                        'type' => ($inputs['is_private'] === 'true') ? ChatConstants::PERSONAL_CHAT : ChatConstants::GROUP_CHAT
                    ];
                    foreach($inputs['selected_users'] as $selected_user){
                        $creates[] = [
                            'conversation_id' => $converseObj->id,
                            'user_id' => $selected_user,
                            'type' => ($inputs['is_private'] === 'true') ? ChatConstants::PERSONAL_CHAT : ChatConstants::GROUP_CHAT
                        ];
                    }foreach($creates as $create){
                        $participantObj = Participant::create($create);
                    }
                    if($participantObj){
                        // $conversation_ids = Participant::where('user_id', $auth_id)->select('conversation_id')->get()->pluck('conversation_id');
                        // $title_arr = [];
                        // foreach($conversation_ids as $conversation_id) {
                        //     $title_arr[] = Conversation::find($conversation_id)->value('title');
                        // }
                        // $data = [
                        //     'data' => [
                        //         'titles' => $title_arr
                        //     ],
                    $data = [ 
                            'status' => 'success', 
                            'message' => 'new conversation group or personal chat created'
                        ];
                        return Response::json($data, 200);
                    }
                }
            } else {
                // $conversation_ids = Participant::where('user_id', $auth_id)->select('conversation_id')->get()->pluck('conversation_id');
                // $title_arr = [];
                // foreach($conversation_ids as $conversation_id) {
                //     $title_arr[] = Conversation::find($conversation_id)->title;
                // }
                $data = [
                    // 'data' => [
                    //     'titles' => $title_arr
                    // ],
                    'status' => 'success', 'message' => 'already present group'
                ];
                return Response::json($data, 200);
            }

        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function getConversation() {
        try{
            $auth_id = Auth::id();
            $title_arr = [];
            $participantObj = Participant::where('user_id', $auth_id)->get();
            foreach($participantObj as $idx => $participant){
                if($participant->type == ChatConstants::PERSONAL_CHAT){
                    $other_member_obj = Participant::where('conversation_id', $participant->conversation_id)->where('user_id', '!=', $auth_id)->first();
                    $title_arr[$idx]['type'] = 'PERSONAL_CHAT';
                    $title_arr[$idx]['auth_id'] = $other_member_obj->user_id;
                    $title_arr[$idx]['title'] = $other_member_obj->user->name;
                    $title_arr[$idx]['id'] = $other_member_obj->conversation_id;
                } else if($participant->type == ChatConstants::GROUP_CHAT){
                    $title_arr[$idx]['type'] = 'GROUP_CHAT';
                    $conversation_id = $participant->conversation_id;
                    $title_arr[$idx]['title'] =  Conversation::find($conversation_id)->title;
                    $title_arr[$idx]['id'] = $conversation_id;
                }
            }
            $data = [
                    'data' => $title_arr,
                    'status' => 'success', 'message' => 'all conversations'
                ];
            return Response::json($data, 200);
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function getChatWindow(Request $request, $conv_id) {
        try{
            if(!is_int($conv_id) && !is_numeric($conv_id)) {
                return Response::json(['status' => 'error', 'message' => 'invalid data' ], 422);
            }
            
            $converseObj = Conversation::find($conv_id);
            if( empty($converseObj) ) {
                return Response::json(['status' => 'error', 'message' => 'conversation deleted or empty' ], 200);
            }
            $participants = Participant::where('conversation_id', $converseObj->id)->get();
            if($converseObj->is_group == false) {
                foreach($participants as $participant) {
                    if($participant->user_id != Auth::id()) {
                        $send_to = $participant->user_id;
                    }
                }
            }

            $messages = Message::where('conversation_id', $converseObj->id)->with('user')->get();
            // save to sessions
            // if ($request->session()->has('conversation_id')) {
            //     $request->session()->forget('conversation_id');
            // }
            // $request->session()->put('conversation_id', $converseObj->id);

            // check for rooms on call
            if($converseObj->is_group){
                $is_video_room_set = false;
                $is_voice_room_set = false;
                $availableRoom = Room::where('conversation_id', $converseObj->id)->get();
                if(count($availableRoom) > 1){
                    throw new \LogicException("Invalid Room count, simultaneous rooms not allowed for a conversation");
                } else if(count($availableRoom) == 1){
                    $room_id = $availableRoom[0]->room_session_id;
                    if($availableRoom[0]->call_type === ChatConstants::VOICE_GROUP_CODE){
                        $is_voice_room_set = true;
                    } else if($availableRoom[0]->call_type === ChatConstants::VIDEO_GROUP_CODE) {
                        $is_video_room_set = true;       
                    }
                }
            }

            $data = [
                'conversation' => $converseObj,
                'participants' => $participants,
                'messages' => $messages
            ];

            if(isset($send_to)) {
                $data['send_to'] = $send_to;
            }
            if(isset($room_id)){
                $data['room_id'] = $room_id;
                $data['is_video_room_set'] = $is_video_room_set;
                $data['is_voice_room_set'] = $is_voice_room_set;
            }
            return view('components.chat-window', $data);

        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
            return Response::json($data, 500);
            // return $e->getTraceAsString();
        }
    }

    public function save_chat_messages(Request $request) {
        try{
            if( (!$request->has('file_name') && empty($request->input('file_name')) ) || 
            (!$request->has('file_url') && empty($request->input('file_url'))) ){
                if(!$request->has('chat_text') && empty($request->input('chat_text'))) {
                    return \Response::json(['message' => 'no chat message'], 422);
                }
            }
            if(!$request->has('conv_id') && empty($request->input('conv_id'))) {
                return \Response::json(['message' => 'incomplete data'], 422);
            }

            if(!$request->has('message_type') || !in_array($request->input('message_type'), array_keys(ChatConstants::MESSAGE_TYPE) ) ) {
                return \Response::json(['message' => 'incomplete data'], 422);
            }
            
            $chat_text = $request->input('chat_text');
            $conv_id = $request->input('conv_id');
            // if it is a file
            switch ($request->input('message_type')) {
                case 'text':
                    $attachment_url = null;
                    $message_type = ChatConstants::MESSAGE_TYPE[$request->input('message_type')];
                    $filename = null;
                    break;
                case 'file':
                    $attachment_url = $request->input('file_url');
                    $message_type = ChatConstants::MESSAGE_TYPE[$request->input('message_type')];
                    $filename = $request->input('file_name');
                    break;
            }

            $msgObj = new Message();
            $msgObj->conversation_id = $conv_id;
            $msgObj->sender_id = Auth::id();
            $msgObj->message_type = $message_type;
            $msgObj->message = $chat_text;
            $msgObj->attachment_url = $attachment_url;
            $msgObj->file_name = $filename;
            $msgObj->deleted_at	= null;
            if($msgObj->save()){
                $messages = Message::where('conversation_id', $conv_id)->get();
                return view('components.chat-block', [
                    'messages' => $messages
                ]);
            }
            
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function save_chat_file(Request $request, $conv_id) {
        try{
            $rules = [
                'file' => 'required|mimes:csv,txt,xlsx,pdf,gif,png,jpg,jpeg,doc,docx',
            ];
            $messages = [
                'required' => 'File not provided.',
                'mimes' => 'Invalid File or File format not allowed, read the file formats above',
                // 'max' => 'The file exceeds maximum allowed file size of 4mb.'
            ];

            $validator = Validator::make($request->all(), $rules, $messages);
            if($validator->fails()){
                return Response::json(['status' => 'error', 'message' => 'validation error', 'data' => $validator->errors()], 422);
            }
            if(empty($conv_id) || !is_numeric($conv_id)){
                return Response::json(['status' => 'error', 'message' => 'incorrect conversation'], 422);
            }
            if(empty(Conversation::find($conv_id))){
                return Response::json(['status' => 'error', 'message' => 'incorrect conversation'], 422);
            }
            $auth_id_numeric = (string)(Auth::id());
            if($request->hasFile('file')){

                $chatFileModel = new ChatFile();
                $fileName = time().'_'.$request->file->getClientOriginalName();
                $fileName = str_replace(' ', '_', $fileName);
                $filePath = $request->file('file')->storeAs('/chat-uploads', $fileName, 'local');

                $chatFileModel->name = $fileName;
                $chatFileModel->file_path = '/storage/app/' . $filePath;
                $chatFileModel->file_type = $request->file->getClientOriginalExtension();
                $chatFileModel->conversation_id = $conv_id;
                $chatFileModel->saved_by_user = Auth::id();

                $storage_url = url('/') .'/chats/files/'. (string)$conv_id .'/'. $auth_id_numeric . '/' .$fileName;
                if($chatFileModel->save()){
                    $data = [
                        'status' => 'success',
                        'message' => 'file saved',
                        'data' => [
                            'url' => $storage_url,
                            'filename' => $chatFileModel->name,
                            'file_id' => $chatFileModel->id
                        ]
                    ];
                    return Response::json($data, 200);
                }
            } else {
                $data = [
                    'status' => 'error',
                    'message' => 'no file found'
                ];
                return Response::json($data, 422); 
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function getFiles($conv_id, $auth_id, $fileName) {
        try{
            $fileModel = ChatFile::where([
                'conversation_id' => $conv_id,
                'saved_by_user' => $auth_id,
                'file_path' => '/storage/app/chat-uploads/' . $fileName
            ])->first();
            if(!empty($fileModel)){
                $pathToFile = base_path() . $fileModel->file_path;
                if(in_Array($fileModel->file_type, ChatConstants::ALLOWED_IMAGE_EXTENSIONS) ){
                    return response()->file($pathToFile);
                }
                return response()->download($pathToFile);
            } else{
                return response()->json(['message' => 'no file found'], 404);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function getFileById($id) {
        try{
            $fileModel = ChatFile::find($id);
            if(!empty($fileModel)){
                $pathToFile = base_path() . $fileModel->file_path;
                if(in_Array($fileModel->file_type, ChatConstants::ALLOWED_IMAGE_EXTENSIONS) ){
                    return response()->file($pathToFile);
                }
                return response()->download($pathToFile);
            } else{
                return response()->json(['message' => 'no file found'], 404);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
            return Response::json($data, 500);
        }
    }

    public function save_socket_id(Request $request) {
        try{
            if(!$request->has('conversation_id') || empty($request->get('conversation_id'))){
                return Response::json(['status' => 'error', 'message' => 'no conversation data'], 422);
            }
            $inputs = $request->all();
            $socket_id = $inputs['socket_id'];
            $conversation_id = $inputs['conversation_id'];
            $auth_id = Auth::id();
            if(empty($converseObj = Conversation::find($conversation_id))){
                return Response::json(['status' => 'error', 'message' => 'no conversation found'], 404);
            }
            $updateSocketIdParticipant = Participant::where([
                    'conversation_id' => $conversation_id,
                    'user_id' => $auth_id
                ])->update(['socket_id' => $socket_id]);
            if($updateSocketIdParticipant){
                return Response::json([
                    'status' => 'success',
                    'message'=>'updated success'
                ], 200);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function getUser($id) {
        try{
            if(!isset($id) || empty($id)){
                return Response::json(['status' => 'error', 'message' => 'no conversation data'], 422);
            }

            $userObj = collect(User::find($id))->pipe(function ($user){
                return [
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'id' => $user['id'],
                    'profile_pic' => $user['profile_pic'],
                    'created_at' => $user['created_at']
                ];
            });
            if(isset($userObj['id'])){
                return Response::json([
                    'user' => $userObj
                ], 200);
            } else{
                return Response::json(['status' => 'error', 'message' => 'bad request, no such user'], 400);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function changeGroupName(Request $request, $conv_id) {
        try{
            $rules = [
                'groupname' => 'required|string',
            ];
            $validator = Validator::make($request->all(), $rules);
            if($validator->fails()) {
                return Response::json(['status' => 'error', 'message' => 'validation error', 'data' => $validator->errors()], 422);
            }
            $groupname = $request->input('groupname');
            $converseObj = Conversation::find($conv_id);
            if(!empty($converseObj)) {
                if($converseObj->is_group){
                    if($converseObj->update(['title' => $groupname])) {
                        return Response::make("",204);
                    }
                } else{
                    return Response::json(['status' => 'error', 'message' => 'bad request'], 400);
                }
            } else {
                return Response::json(['status' => 'error', 'message' => 'no such converse'], 404);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        } 
    }

    public function getNonParticipants($conv_id) {
        try{
            if(!is_numeric($conv_id) || empty($conv_id)){
                return Response::json(['status' => 'error', 'message' => 'bad request'], 400);
            }
            $converseObj = Conversation::find($conv_id);
            if(!empty($converseObj)){
                $particpantsUsrObj = Participant::where('conversation_id', $conv_id)->get('user_id');
                $participants = array_column($particpantsUsrObj->toArray(), 'user_id');
                $nonparticipant_users = User::whereNotIn('id', $participants)->get();
                if($nonparticipant_users){
                    return Response::json(
                        [
                            'data' => $nonparticipant_users,
                            'status' => 'success',
                            'message' => 'all non-participant users'
                    ], 200);
                }
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function addNewMemberToGroup(Request $request) {
        try{
            $rules = [
                'conv_id' => 'required|numeric',
                'req_usr' => 'required|numeric'
            ];
            $validator = Validator::make($request->all(), $rules);
            if($validator->fails()){
                return Response::json(['status' => 'error', 'message' => 'validation error', 'data' => $validator->errors()], 422);
            }
            $conv_id = $request->input('conv_id');
            $new_member_id = $request->input('req_usr');
            $user_exists = User::find($new_member_id);
            $converseObj = Conversation::find($conv_id);
            if(empty($user_exists) || empty($converseObj)){
                return Response::json(['status' => 'error', 'message' => 'non existent error', 'data' => 'invalid data'], 404);
            }
            // check for participants already present in the conversation
            $checkAlreadyPresent = Participant::where([
                'conversation_id' => $conv_id,
                'user_id' => $new_member_id,
            ]);
            if(count($checkAlreadyPresent) > 0) {
                return Response::json(['status' => 'error', 'message' => 'user_already_in_group'], 422);
            }

            $added_usrtogroup = Participant::create([
                'conversation_id' => $conv_id,
                'user_id' => $new_member_id,
                'type' => ChatConstants::GROUP_CHAT,
            ]);
            if($added_usrtogroup){
                return Response::json(
                    [
                        'data' => $user_exists,
                        'status' => 'success',
                        'message' => 'user added to group'
                    ], 201);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    /**
     * Changes or sets disconnected_at timestamp at users table for user disconnected event message from socket
     */

    public function userDisconnected(Request $request) {
        try{
            $usr_id = $request->input('user_id');
            if(!is_numeric($usr_id)){
                return Response::json(['disconnected' => false, 'status' => 'invalid id'], 422);
            }
            $user = User::find($usr_id);
            if($user){
                $roomsWithUsrId = Room::whereRaw("FIND_IN_SET('{$usr_id}', `inroom_participants`)")->get();
                Log::debug('$roomsWithUsrId', $roomsWithUsrId->toArray());
                foreach($roomsWithUsrId as $room){
                    if($room->inroom_participants === $usr_id){
                        Log::info('inroom_participant about to be deleted' . (string)$room->inroom_participants);
                        $room->delete();
                    } else {
                        $usrInParticipant = strpos($room->inroom_participants, $usr_id);
                        if ($usrInParticipant !== false) {
                            if($room->inroom_participants[$usrInParticipant-1] == ','){
                                $room->inroom_participants = str_replace(',' . $usr_id, '', $room->inroom_participants);
                            } else {
                                $room->inroom_participants = str_replace($usr_id . ',', '', $room->inroom_participants);
                            }
                            Log::info('inroom_participant about to be updated', $room->toArray());
                            
                            $room->save();
                        }
                    }
                }
            }
            $user->disconnected_at = Carbon::now();
            if($user->update()){
                return Response::json(['disconnected' => true, 'status' => 'success'], 200);
            } else return Response::json(['disconnected' => false, 'status' => 'failed'], 200);
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function createRoomForGroupCall(Request $request) {
        try{
            if( ($request->has('roomId') && !empty($request->input('roomId'))) && 
            ($request->has('authId') && !empty($request->input('authId'))) &&
            ($request->has('conversationId') && !empty($request->input('conversationId'))) &&
            ($request->has('callType') && !empty($request->input('callType'))) ){
                $room_id = $request->input('roomId');
                $participant_id = $request->input('authId');
                $conversation_id = $request->input('conversationId');
                $call_type = $request->input('callType');
            } else {
                return Response::json(['status' => 'error', 'data' => 'invalid or incomplete data'], 422); 
            }
            if(!is_numeric($participant_id)){
                return Response::json(['status' => 'error', 'data' => 'invalid or incomplete participant'], 422);
            }
            if(!($call_type === ChatConstants::VOICE_GROUP_CODE || $call_type === ChatConstants::VIDEO_GROUP_CODE)) {
                return Response::json(['status' => 'error', 'data' => 'invalid call type'], 422);
            }
            
            $setNewRoomModel = new Room;
            $setNewRoomModel->conversation_id = $conversation_id;
            $setNewRoomModel->room_session_id = $room_id;
            $setNewRoomModel->call_type = $call_type === ChatConstants::VIDEO_GROUP_CODE ? ChatConstants::VIDEO_GROUP_CODE : ChatConstants::VOICE_GROUP_CODE;
            $setNewRoomModel->inroom_participants = empty($setNewRoomModel->inroom_participants) ? $participant_id : $setNewRoomModel->inroom_participants.','.$participant_id;
            if($setNewRoomModel->save()){
                Log::debug("\n-------------------------------------\nsetNewRoomModel\n", $setNewRoomModel->toArray());
                return Response::json(['room-set' => true, 'status' => 'success'], 200);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }

    public function checkRoomExistsAndAddParticipant(Request $request) {
        try{
            Log::info('checkRoomExistsAndAddParticipant : Request', $request->toArray());
            if( ($request->has('roomId') && !empty($request->input('roomId'))) && 
            ($request->has('authId') && !empty($request->input('authId'))) &&
            ($request->has('conversationId') && !empty($request->input('conversationId'))) &&
            ($request->has('callType') && !empty($request->input('callType'))) ){
                $room_id = $request->input('roomId');
                $participant_id = $request->input('authId');
                $conversation_id = $request->input('conversationId');
                $call_type = $request->input('callType');
            } else {
                return Response::json(['status' => 'error', 'data' => 'invalid or incomplete data'], 422); 
            }
            if(!is_numeric($participant_id)){
                return Response::json(['status' => 'error', 'data' => 'invalid or incomplete participant'], 422);
            }
            $inputs = $request->all();
            $conditions = [
                'conversation_id' => $conversation_id,
                'room_session_id' => $room_id
            ];
            $roomModel = Room::where($conditions)->first();
            if($roomModel){
                $roomModel->inroom_participants = $roomModel->inroom_participants.','.$participant_id;
                $roomModel->update();
                Log::debug("-----\n roomModel->updated;-----\n", $roomModel->toArray());
                return Response::json(['roomSet' => true, 'status' => 'success'], 200);
            } else {
                return Response::json(['status' => 'notfound', 'data' => 'no such room'], 404);
            }
        } catch(\Exception $e) {
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
             return Response::json($data, 500);
        }
    }
}
