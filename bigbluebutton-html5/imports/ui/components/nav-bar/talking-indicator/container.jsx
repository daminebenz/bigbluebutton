import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users';
import Auth from '/imports/ui/services/auth';
import TalkingIndicator from './component';
import { makeCall } from '/imports/ui/services/api';

const APP_CONFIG = Meteor.settings.public.app;
const { enableTalkingIndicator } = APP_CONFIG;

const TalkingIndicatorContainer = (props) => {
  if (!enableTalkingIndicator) return null;
  return (<TalkingIndicator {...props} />);
};

export default withTracker(() => {
  const talkers = {};
  const meetingId = Auth.meetingID;
  const usersTalking = VoiceUsers.find({ meetingId, joined: true, spoke: true }, {
    fields: {
      callerName: 1,
      talking: 1,
      color: 1,
      startTime: 1,
      voiceUserId: 1,
      muted: 1,
    },
  }).fetch();

  if (usersTalking) {
    for (let i = 0; i < usersTalking.length; i += 1) {
      const {
        callerName, talking, color, voiceUserId, muted,
      } = usersTalking[i];

      talkers[`${callerName}`] = {
        color,
        talking,
        voiceUserId,
        muted,
      };
    }
  }

  const muteUser = (id) => {
    const user = VoiceUsers.findOne({ meetingId, voiceUserId: id }, {
      fields: {
        muted: 1,
      },
    });
    if (user.muted) return;
    makeCall('toggleVoice', id);
  };

  return {
    talkers,
    muteUser,
  };
})(TalkingIndicatorContainer);
