
export const setOnlineBadges = (data) => {
    const { authIds } = data;
    console.log('setOnlineBadges: authIds', authIds);
    const individualOnOfflineBadges = document.getElementsByClassName('avatar-icon image-badge');
    for (var i=0, len=individualOnOfflineBadges.length|0; i<len; i=i+1|0) {
        const individualConversationAuthId = individualOnOfflineBadges[i].getAttribute("data-auth");
        const status = individualOnOfflineBadges[i].lastElementChild.classList[1];
        if(authIds.includes(individualConversationAuthId)){
            console.log('individualConversationAuthId', individualConversationAuthId);
            if (status == 'offline') {
                console.log('offline');
                individualOnOfflineBadges[i].lastElementChild.classList.value = 'badge online';
            }
        }
    }
};

export const setOfflineBadges = (data) => {
    const { authId } = data;
    const individualOnOfflineBadges = document.getElementsByClassName('avatar-icon image-badge');
    for (var i=0, len=individualOnOfflineBadges.length|0; i<len; i=i+1|0) {
        const individualConversationAuthId = individualOnOfflineBadges[i].getAttribute("data-auth");
        const status = individualOnOfflineBadges[i].lastElementChild.classList[1];
        if(authId == individualConversationAuthId){
            console.log('individualConversationAuthId', individualConversationAuthId);
            if (status == 'online') {
                console.log('online');
                individualOnOfflineBadges[i].lastElementChild.classList.value = 'badge offline';
            }
        }
    }
}