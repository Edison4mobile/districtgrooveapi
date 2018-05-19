var PubNub = require('../node_modules/pubnub/lib/node/index.js');

function publish(channel, message) {
    pubnub = new PubNub({
        publishKey : 'pub-c-ffcdc13e-a8fe-4299-8a2d-eb5b41f0dc47',
        subscribeKey : 'sub-c-2d86535e-968a-11e6-94c7-02ee2ddab7fe'
    })

    function publishSampleMessage() {
        // console.log("Since we're publishing on subscribe connectEvent, we're sure we'll receive the following publish.");
        var publishConfig = {
            channel : channel,
            message : message
        }
        pubnub.publish(publishConfig, function(status, response) {
            console.log(status, response);
        })
    }

    pubnub.addListener({
        status: function(statusEvent) {
            if (statusEvent.category === "PNConnectedCategory") {
                publishSampleMessage();
            }
        },
        message: function(message) {
            // console.log("New Message!!", message);
        },
        presence: function(presenceEvent) {
            // handle presence
        }
    })
    console.log("Subscribing..");

    pubnub.subscribe({
        channels: [channel]
    });
};

module.exports = {
    publish : publish
}
