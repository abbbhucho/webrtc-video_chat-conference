<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedMediumInteger('conversation_id');
            $table->unsignedMediumInteger('sender_id');
            $table->tinyInteger('message_type'); // is_group, is_private
            $table->mediumText('message');
            $table->string('attachment_url')->nullable();
            $table->string('file_name')->nullable();
            $table->timestamp('deleted_at', $precision = 0)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
