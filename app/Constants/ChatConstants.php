<?php
namespace App\Constants;

final class ChatConstants
{
    const PERSONAL_CHAT = 1;

    const GROUP_CHAT = 2;

    const MESSAGE_TYPE = [
        'text' => 1,
        'file' => 2,
        'image' => 3,
        'audio' => 4
    ];

    const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
    const ALLOWED_FILE_EXTENSIONS = ['doc', 'docx', 'csv', 'xlsx', 'pdf', 'txt'];

    const VOICE_GROUP_CODE = "VOICE_GROUP_CODE";
    const VIDEO_GROUP_CODE = "VIDEO_GROUP_CODE";

    const EMOJIS = [
        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "😰", "🤩", "🥳", "🧐", "🤓", "😌", "😍", "🤩", "😷", "🤒", "😱", "🥶", "👋", "🤚", "🖐", "✋", "🖖", "👌", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "👨🏽‍⚕️", "🏋🏽‍♀️", "👩🏽‍💻", "🐶", "🐱", "🌻", "🌞", "🌹", "🐦", "🐞", "🌙", "🌎", "⭐️", "🔥", "⌚️", "🍰", "🎂", "🍗", "🧂", "🍎", "🥬", "🥣", "🍫", "🍻" ,"📱", "📲", "💻", "✂️", "📋", "⌨️", "✈️", "💸", "💵", "🔮", "📿", "🧿", "💈", "💊", "🩰", "🧢", "👢", "🥼", "🦺", "👔", "👕", "👖", "👑", "🔭", "🔬", "✅", "❌", "🆗", "🆙", "🆒", "🆕","🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"
    ];
}