<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
/**
 * Json Apis
 */
Route::get('/users/list', [ChatController::class, 'getUsers'])->middleware(['auth'])->name('users_list');
Route::get('that-user/{id}', [ChatController::class, 'getUser']);
Route::post('conversation/set', [ChatController::class, 'setConversation'])->middleware(['auth'])->name('set_conversation');
Route::get('conversation/get', [ChatController::class, 'getConversation'])->middleware(['auth'])->name('get_conversation');
Route::get('conversation/non-members/{conv_id}', [ChatController::class, 'getNonParticipants'])->middleware(['auth']);
Route::put('conversation/add-member', [ChatController::class, 'addNewMemberToGroup'])->middleware(['auth']);
// ******************************************* */
/**
 * Non Json Apis
 */
Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'connected'])->name('dashboard');

Route::get('chat-window/{conv_id}', [ChatController::class, 'getChatWindow'])->middleware(['auth'])->name('get_chat_window');
Route::post('save-chat', [ChatController::class, 'save_chat_messages'])->middleware(['auth'])->name('save_chat_messages');

// test api
Route::get('test/{conv_id}', function ($conv_id) {
    $ok = \App\Models\Participant::where([
        ['conversation_id', '=', $conv_id],
        ['user_id', '<>', Auth::id()]
    ])->get('user_id');
    dd(array_column($ok->toArray(), 'user_id'));
});

// video
Route::get('/user/converse', function(Request $request) {
    return Response::json( [
        'auth' => Auth::id(),
        'conversation_id' => $request->session()->get('conversation_id')
    ], 200);
})->middleware(['auth'])->name('user_auth');

Route::get('socket/back/{conversation_id}', function($conversation_id){
    $participants = \App\Models\Participant::where('conversation_id', $conversation_id)->select(['user_id', 'socket_id'])->get();     
    foreach($participants as $participant){
        $authSocketDetails[$participant->user_id] = $participant->socket_id;
    }
    return Response::json([ 'details' => $authSocketDetails], 200);
});

Route::post('participant/socket', [ChatController::class, 'save_socket_id'])->middleware(['auth']);

Route::post('save-file/{conv_id}', [ChatController::class, 'save_chat_file'])->middleware(['auth']);
Route::get('chats/files/{conv_id}/{auth_id}/{filename}', [ChatController::class, 'getFiles'])->middleware(['auth']);
Route::get('chat/file/{id}', [ChatController::class, 'getFileById'])->middleware(['auth']);
Route::put('group/name/{conv_id}', [ChatController::class, 'changeGroupName'])->middleware(['auth']);

require __DIR__.'/auth.php';
