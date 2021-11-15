<?php

namespace App\Listeners;

use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Auth;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin($event) {
        $this->updateLoggedStatus('LOGGED_IN');
    }

    /**
     * Handle user logout events.
     */
    public function handleUserLogout($event) {
        $this->updateLoggedStatus('LOGGED_OUT');
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @param  \Illuminate\Events\Dispatcher  $events
     * @return void
     */
    public function subscribe($events)
    {
        $events->listen(
            Login::class,
            [UserEventSubscriber::class, 'handleUserLogin']
        );

        $events->listen(
            Logout::class,
            [UserEventSubscriber::class, 'handleUserLogout']
        );
    }

    /**
     * Update User logged in status for uuid
     * @param status
     * @return none
     */
    private function updateLoggedStatus($status = 'LOGGED_OUT') {
        $user = User::find(Auth::id());
        $session_time = env('SESSION_LIFETIME', 120);
        if($status == 'LOGGED_IN') {
            if(!is_null($user->disconnected_at)){
                if(Carbon::parse($user->disconnected_at)->addMinutes($session_time) <= Carbon::now()){
                    $user->currently_logged_uuid = Str::uuid();
                }
            }
            if(is_null($user->currently_logged_uuid)){
                $user->currently_logged_uuid = Str::uuid();
            }
        } else {
            $user->currently_logged_uuid = null;
        }
        $user->disconnected_at = null;
        $user->update();
    }
}
