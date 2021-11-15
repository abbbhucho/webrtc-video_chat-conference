export const callType = {
  VOICE_PERSONAL_CODE: "VOICE_PERSONAL_CODE",
  VIDEO_PERSONAL_CODE: "VIDEO_PERSONAL_CODE",
  VOICE_GROUP_CODE: "VOICE_GROUP_CODE",
  VIDEO_GROUP_CODE: "VIDEO_GROUP_CODE"
};

export const preOfferAnswer = {
  CALLEE_NOT_FOUND: "CALLEE_NOT_FOUND",
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_REJECTED: "CALL_REJECTED",
  CALL_UNAVAILABLE: "CALL_UNAVAILABLE",
};

export const WebRTCSignalling = {
  OFFER : 'OFFER',
  ANSWER: 'ANSWER',
  ICE_CANDIDATE: 'ICE_CANDIDATE'
}

export const CloseConnectionReason = {
  HANGUP_BUTTON: 'HANGUP_BUTTON'
}

export const allowedFileType = [
  'jpeg', 'jpg', 'png', 'gif',
  'pdf',
  'doc', 'docx',
  'xlsx', 'csv',
  'txt'
];

export const publicUrl = window.location.href.replace(window.location.pathname, '');
